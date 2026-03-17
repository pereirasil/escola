import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { ChooseSchoolDto } from './dto/choose-school.dto'
import { LoginDto } from './dto/login.dto'
import { LoginStudentDto } from './dto/login-student.dto'
import { RegisterDto } from './dto/register.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password)
  }

  @Post('login-student')
  loginStudent(@Body() dto: LoginStudentDto) {
    return this.authService.loginStudent(dto.cpf, dto.password)
  }

  @Post('login-teacher')
  loginTeacher(@Body() dto: LoginStudentDto) {
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
