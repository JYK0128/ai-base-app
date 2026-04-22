import { SetMetadata } from '@nestjs/common';

// eslint-disable-next-line sonarjs/no-hardcoded-passwords
export const ALLOW_EXPIRED_PASSWORD_KEY = 'allowExpiredPassword';
export const AllowExpiredPassword = () => SetMetadata(ALLOW_EXPIRED_PASSWORD_KEY, true);
