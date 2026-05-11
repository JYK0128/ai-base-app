import { AgreeTermsHandler } from './commands/agree-terms.handler';
import { CreateTermsDocumentHandler } from './commands/create-terms-document.handler';
import { CreateTermsVersionHandler } from './commands/create-terms-version.handler';
import { GetActiveTermsHandler } from './queries/get-active-terms.handler';

export const TermsHandlers = [
  GetActiveTermsHandler,
  CreateTermsDocumentHandler,
  CreateTermsVersionHandler,
  AgreeTermsHandler,
];
