import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { ChooseSchoolDto } from './dto/choose-school.dto'
import { ChangePasswordDto } from '../students/dto/change-password.dto'
import { ChooseStudentDto } from './dto/choose-student.dto'
import { LoginDto } from './dto/login.dto'
import { LoginResponsibleDto } from './dto/login-responsible.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshSessionDto } from './dto/refresh-session.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('refresh')
  refresh(@Body() dto: RefreshSessionDto) {
    return this.authService.refreshSession(dto.refresh_token)
  }

  @Post('logout')
  async logout(@Body() dto: RefreshSessionDto) {
    await this.authService.revokeRefreshToken(dto.refresh_token)
    return { ok: true }
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password)
  }

  @Post('login-responsible')
  loginResponsible(@Body() dto: LoginResponsibleDto) {
    return this.authService.loginResponsible(dto.cpf, dto.password)
  }

  @Post('responsible/choose-student')
  @UseGuards(AuthGuard('jwt'))
  responsibleChooseStudent(
    @Body() dto: ChooseStudentDto,
    @Req() req: { user: { id: number; role: string } },
  ) {
    if (req.user.role !== 'responsible') {
      throw new ForbiddenException('Apenas responsáveis podem usar esta funcionalidade')
    }
    return this.authService.responsibleChooseStudent(req.user.id, dto.student_id)
  }

  @Post('login-teacher')
  loginTeacher(@Body() dto: LoginResponsibleDto) {
    return this.authService.loginTeacher(dto.cpf, dto.password)
  }

  @Post('teacher/choose-school')
  @UseGuards(AuthGuard('jwt'))
  teacherChooseSchool(@Body() dto: ChooseSchoolDto, @Req() req: { user: { id: number; role: string; document?: string } }) {
    if (req.user.role !== 'teacher') throw new ForbiddenException('Apenas professores podem usar esta funcionalidade')
    if (!req.user.document) throw new UnauthorizedException('Sessão inválida')
    return this.authService.teacherChooseSchool(req.user.document, dto.school_id)
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Get('avatar/:cpf')
  getAvatarByCpf(@Param('cpf') cpf: string) {
    return this.authService.getAvatarByCpf(cpf)
  }
}
