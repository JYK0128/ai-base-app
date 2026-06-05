import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import { generateDtsBundle } from 'dts-bundle-generator';
import { build, context } from 'esbuild';
import { swcPlugin } from 'esbuild-plugin-swc';

const OUTDIR = 'dist';
const isWatch = process.argv.includes('--watch');

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

function generateTypes() {
  console.log('[dts] rolling up type declarations...');

  const entries = [
    {
      filePath: './src/index.ts',
      bundleOutFile: 'index.bundle.d.ts',
      wrapperOutFile: 'index.d.ts',
      references: ['./common/ambient/jose.d.ts', './server/ambient/nestjs-cls.d.ts'],
    },
    {
      filePath: './src/common/index.ts',
      bundleOutFile: 'common/index.bundle.d.ts',
      wrapperOutFile: 'common/index.d.ts',
      references: ['./ambient/jose.d.ts'],
    },
    {
      filePath: './src/server/index.ts',
      bundleOutFile: 'server/index.bundle.d.ts',
      wrapperOutFile: 'server/index.d.ts',
      references: ['./ambient/nestjs-cls.d.ts'],
    },
    {
      filePath: './src/web/index.ts',
      bundleOutFile: 'web/index.d.ts',
    },
  ];
  const ambientFiles = [
    { source: 'src/common/ambient/jose.d.ts', output: 'common/ambient/jose.d.ts' },
    { source: 'src/server/ambient/nestjs-cls.d.ts', output: 'server/ambient/nestjs-cls.d.ts' },
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
      const outputPath = join(OUTDIR, entries[index].bundleOutFile);
      writeFileSync(outputPath, content);
    });

    ambientFiles.forEach(({ source, output }) => {
      const outputPath = join(OUTDIR, output);
      mkdirSync(dirname(outputPath), { recursive: true });
      copyFileSync(source, outputPath);
    });

    entries.forEach((entry) => {
      if (!entry.wrapperOutFile) {
        return;
      }

      const wrapperPath = join(OUTDIR, entry.wrapperOutFile);
      const importPath = relative(dirname(wrapperPath), join(OUTDIR, entry.bundleOutFile))
        .replace(/\\/g, '/')
        .replace(/\.d\.ts$/, '');
      const exportPath = importPath.startsWith('.') ? importPath : `./${importPath}`;
      const header = entry.references
        .map((reference) => `/// <reference path="${reference}" />`)
        .join('\n');
      const wrapper = `${header}\nexport * from '${exportPath}';\n`;
      writeFileSync(wrapperPath, wrapper);
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
