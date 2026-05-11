import bcrypt from 'bcrypt';

export class CryptoUtil {
  private static readonly SALT_ROUNDS = 10;

  /**
   * 비밀번호를 해싱합니다.
   */
  static async hashPassword(this: void, password: string): Promise<string> {
    return bcrypt.hash(password, CryptoUtil.SALT_ROUNDS);
  }

  /**
   * 평문 비밀번호와 해시된 비밀번호를 비교합니다.
   */
  static async comparePassword(this: void, password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
