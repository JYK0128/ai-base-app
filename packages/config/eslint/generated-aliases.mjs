const GENERATED_MODEL_SOURCE = '@/api/generated/model';

function isTypeReferenceToImportedModel(node, importedGeneratedNames) {
  return node.type === 'TSTypeReference'
    && node.typeName.type === 'Identifier'
    && importedGeneratedNames.has(node.typeName.name);
}

export default {
  rules: {
    'no-generated-type-aliases': {
      meta: {
        type: 'problem',
        docs: {
          description: 'disallow direct type aliases of generated model imports',
        },
        schema: [],
        messages: {
          directAlias: 'Do not create a direct type alias for generated model type "{{target}}". Use the generated type name directly.',
        },
      },
      create(context) {
        return {
          Program(node) {
            const importedGeneratedNames = new Set();

            for (const statement of node.body) {
              if (statement.type !== 'ImportDeclaration' || statement.source.value !== GENERATED_MODEL_SOURCE) {
                continue;
              }

              for (const specifier of statement.specifiers) {
                if (specifier.type === 'ImportSpecifier') {
                  importedGeneratedNames.add(specifier.local.name);
                }
              }
            }

            for (const statement of node.body) {
              if (statement.type !== 'ExportNamedDeclaration' || statement.declaration?.type !== 'TSTypeAliasDeclaration') {
                continue;
              }

              const { declaration } = statement;

              if (isTypeReferenceToImportedModel(declaration.typeAnnotation, importedGeneratedNames)) {
                context.report({
                  node: declaration,
                  messageId: 'directAlias',
                  data: {
                    target: declaration.typeAnnotation.typeName.name,
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};
