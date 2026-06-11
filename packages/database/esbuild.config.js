import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

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
  entryPoints: ['src/index.ts'],
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
    { filePath: './src/index.ts', outFile: 'index.d.ts' },
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

function writeOutputFiles(result) {
  for (const outputFile of result.outputFiles ?? []) {
    mkdirSync(dirname(outputFile.path), { recursive: true });
    writeFileSync(outputFile.path, outputFile.contents);
  }
}

function patchJsonImportAttributes() {
  const filePath = join(OUTDIR, 'index.js');
  const code = readFileSync(filePath, 'utf-8');
  const nextCode = code.replace(
    'import metadataJson from "./metadata.json";',
    'import metadataJson from "./metadata.json" with { type: "json" };',
  );

  if (nextCode !== code) {
    writeFileSync(filePath, nextCode);
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
    splitting: false,
    write: false,
  };

  const cjsOptions = {
    ...sharedOptions,
    outdir: OUTDIR,
    format: 'cjs',
    outExtension: { '.js': '.cjs' },
    splitting: false,
    write: false,
  };

  if (isWatch) {
    const esmCtx = await context(esmOptions);
    const cjsCtx = await context(cjsOptions);
    await Promise.all([esmCtx.watch(), cjsCtx.watch()]);
    console.log('[esbuild] watching for changes...');
    return;
  }

  console.log('[esbuild] building...');
  const [esmResult, cjsResult] = await Promise.all([
    build(esmOptions),
    build(cjsOptions),
  ]);
  writeOutputFiles(esmResult);
  writeOutputFiles(cjsResult);
  patchJsonImportAttributes();
  generateTypes();
  console.log('[build] all tasks complete.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
