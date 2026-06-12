export interface ChangePasswordRequestDto {
  accountId: string
  currentPassword: string
  newPassword: string
}
