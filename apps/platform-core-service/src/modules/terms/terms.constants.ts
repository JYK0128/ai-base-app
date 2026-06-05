export const TERMS_SERVICE_PATTERNS = {
  TERM: {
    ACTIVE: 'terms.get.active',
    LIST_DOCUMENTS: 'terms.get.documents',
    GET_DOCUMENT: 'terms.get.document',
    GET_DOCUMENT_VERSIONS: 'terms.get.document.versions',
    CREATE_DOCUMENT: 'terms.create.document',
    DEPRECATE_DOCUMENT: 'terms.deprecate.document',
    CANCEL_DEPRECATION_DOCUMENT: 'terms.cancel.deprecation.document',
    DELETE_DOCUMENT: 'terms.delete.document',
    CREATE_VERSION: 'terms.create.version',
    UPDATE_VERSION: 'terms.update.version',
    AGREE: 'terms.agree',
  },
} as const;
