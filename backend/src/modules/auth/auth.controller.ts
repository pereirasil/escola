import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
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

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Get('avatar/:cpf')
  getAvatarByCpf(@Param('cpf') cpf: string) {
    return this.authService.getAvatarByCpf(cpf)
  }
}
