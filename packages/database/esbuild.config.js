import { rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { generateDtsBundle } from 'dts-bundle-generator';
import { build, context } from 'esbuild';
import { swcPlugin } from 'esbuild-plugin-swc';

const OUTDIR = 'dist';

/** @type {import('esbuild').BuildOptions} */
const sharedOptions = {
  entryPoints: [
    'src/index.ts',
    'src/domains/index.ts',
  ],
  bundle: true,
  sourcemap: true,
  platform: 'node',
  target: 'es2022',
  external: [
    '@mikro-orm/*',
    '@pkg/*',
    'reflect-metadata',
    'uuidv7',
    'bcrypt',
  ],
  plugins: [
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

const isWatch = process.argv.includes('--watch');

/**
 * DTS Rolling using Programmatic API
 */
function generateTypes() {
  console.log('[dts] rolling up type declarations...');

  const entries = [
    { filePath: './src/index.ts', outFile: 'index.d.ts' },
    { filePath: './src/domains/index.ts', outFile: 'domains/index.d.ts' },
  ];

  try {
    const bundles = generateDtsBundle(
      entries.map((entry) => ({
        filePath: entry.filePath,
        output: { noCheck: true },
      })),
      { preferredConfigPath: './tsconfig.app.json' },
    );

    bundles.forEach((content, index) => {
      const outputPath = join(OUTDIR, entries[index].outFile);
      writeFileSync(outputPath, content);
    });

    console.log('[dts] types generated successfully.');
  }
  catch (err) {
    console.error('[dts] failed to generate types:', err);
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
  }
  else {
    console.log('[esbuild] building...');
    await Promise.all([
      build(esmOptions),
      build(cjsOptions),
    ]);

    generateTypes();
    console.log('[build] all tasks complete.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
