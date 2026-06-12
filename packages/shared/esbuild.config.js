import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { generateDtsBundle } from 'dts-bundle-generator';
import { build, context } from 'esbuild';
import { swcPlugin } from 'esbuild-plugin-swc';

const OUTDIR = 'dist';
const isWatch = process.argv.includes('--watch');

function resolveSourceJsImportsPlugin() {
  return {
    name: 'resolveSourceJsImportsPlugin',
    setup(build) {
      build.onResolve({ filter: /\.js$/ }, (args) => {
        const sourcePath = join(args.resolveDir, args.path.replace(/\.js$/, '.ts'));

        if (existsSync(sourcePath)) {
          return {
            path: sourcePath,
          };
        }

        return undefined;
      });
    },
  };
}

/** @type {import('esbuild').BuildOptions} */
const sharedOptions = {
  entryPoints: [
    'src/index.ts',
    'src/common/index.ts',
    'src/server/index.ts',
    'src/web/index.ts',
  ],
  bundle: true,
  sourcemap: true,
  platform: 'node',
  target: 'es2022',
  packages: 'external',
  outbase: 'src',
  logLevel: 'info',
  plugins: [
    resolveSourceJsImportsPlugin(),
    swcPlugin({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true,
        },
        target: 'es2022',
        keepClassNames: true,
        externalHelpers: true,
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
};

/**
 * DTS Rolling using Programmatic API
 */
function generateTypes() {
  console.log('[dts] rolling up type declarations...');

  const entries = [
    { filePath: './src/index.ts', outFile: 'index.bundle.d.ts' },
    { filePath: './src/common/index.ts', outFile: 'common/index.bundle.d.ts' },
    { filePath: './src/server/index.ts', outFile: 'server/index.bundle.d.ts' },
    { filePath: './src/web/index.ts', outFile: 'web/index.d.ts' },
  ];
  try {
    const bundles = generateDtsBundle(
      entries.map((entry) => ({
        filePath: entry.filePath,
        output: {
          inlineDeclareGlobals: true,
          inlineDeclareExternals: true,
          sourceMap: true,
          noCheck: true,
        },
      })),
      { preferredConfigPath: './tsconfig.app.json' },
    );

    bundles.forEach((content, index) => {
      const outputPath = join(OUTDIR, entries[index].outFile);
      writeFileSync(outputPath, content);
    });

    console.log('[dts] types generated successfully.');
  }
  catch (error) {
    console.error('[dts] failed to generate types:', error);
    process.exit(1);
  }
}

async function main() {
  if (!isWatch) {
    rmSync(OUTDIR, { recursive: true, force: true });
  }

  const esmOptions = {
    ...sharedOptions,
    outdir: OUTDIR,
    format: 'esm',
    outExtension: { '.js': '.js' },
    splitting: true,
  };

  const cjsOptions = {
    ...sharedOptions,
    outdir: OUTDIR,
    format: 'cjs',
    outExtension: { '.js': '.cjs' },
  };

  if (isWatch) {
    const esmCtx = await context(esmOptions);
    const cjsCtx = await context(cjsOptions);
    await Promise.all([esmCtx.watch(), cjsCtx.watch()]);
    console.log('[esbuild] watching for changes...');
    return;
  }

  console.log('[esbuild] building...');
  await Promise.all([
    build(esmOptions),
    build(cjsOptions),
  ]);
  generateTypes();
  console.log('[build] all tasks complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
