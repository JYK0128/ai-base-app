import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JWTPayload } from '@/common/types/request.type';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class ProfileController {
  @ApiOperation({
    summary: '내 정보 조회',
    description: 'JWT 토큰을 통해 인증된 현재 사용자의 정보를 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @Get('me')
  getMe(@CurrentUser() user: JWTPayload) {
    return {
      message: '사용자 정보를 성공적으로 가져왔습니다.',
      user,
    };
  }
}
