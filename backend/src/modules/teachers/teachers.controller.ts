import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { TeachersService } from './teachers.service'
import { ClassesService } from '../classes/classes.service'
import { SchedulesService } from '../schedules/schedules.service'
import { SubjectsService } from '../subjects/subjects.service'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'
import { TeacherScopeService } from '../../common/services/teacher-scope.service'

@Controller('teachers')
export class TeachersController {
  constructor(
    private service: TeachersService,
    private classesService: ClassesService,
    private schedulesService: SchedulesService,
    private subjectsService: SubjectsService,
    private teacherScope: TeacherScopeService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll(
    @SchoolId() schoolId: number | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
    @Req() req?: { user: { role: string } },
  ) {
    const isAdmin = req?.user?.role === 'admin'
    if (q !== undefined) {
      return this.service.search(schoolId, q, +(limit || 20), isAdmin)
    }
    if (page) {
      return this.service.findAllPaginated(schoolId, +page, +(limit || 10), isAdmin)
    }
    return this.service.findAll(schoolId, isAdmin)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMe(@Req() req: { user: { id: number } }) {
    return this.service.findOne(req.user.id)
  }

  @Get('me/header-info')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  getMyHeaderInfo(@Req() req: { user: { id: number } }) {
    return this.service.getHeaderInfo(req.user.id)
  }

  @Get('me/classes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMyClasses(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.classesService.findByTeacherId(req.user.id, req.user.school_id)
  }

  /** Disciplinas que o professor leciona na turma (via grade horária). Turma deve estar no escopo do professor. */
  @Get('me/classes/:classId/subjects')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  async findMySubjectsForClass(
    @Req() req: { user: { id: number; school_id?: number; role: string } },
    @Param('classId') classId: string,
  ) {
    const cid = +classId
    await this.teacherScope.ensureClassAccess(req.user, cid)
    const schedules = await this.schedulesService.findByTeacherId(req.user.id, req.user.school_id)
    const subjectIds = [...new Set(schedules.filter((s) => s.class_id === cid).map((s) => s.subject_id))]
    if (subjectIds.length === 0) return []
    const subjects = await this.subjectsService.findAll(req.user.school_id)
    return subjects.filter((s) => subjectIds.includes(s.id)).sort((a, b) => a.name.localeCompare(b.name))
  }

  @Get('me/students')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMyStudents(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.classesService.findStudentsByTeacherId(req.user.id, req.user.school_id)
  }

  @Get('me/subjects')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  async findMySubjects(@Req() req: { user: { id: number; school_id?: number } }) {
    const schedules = await this.schedulesService.findByTeacherId(req.user.id, req.user.school_id)
    const subjectIds = [...new Set(schedules.map((s) => s.subject_id))]
    if (subjectIds.length === 0) return []
    const subjects = await this.subjectsService.findAll(req.user.school_id)
    return subjects.filter((s) => subjectIds.includes(s.id)).sort((a, b) => a.name.localeCompare(b.name))
  }

  @Post('me/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `teacher-${unique}${extname(file.originalname)}`)
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
        cb(null, true)
      } else {
        cb(new Error('Apenas imagens JPG, PNG ou WEBP'), false)
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadMyPhoto(
    @Req() req: { user: { id: number } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.updatePhoto(req.user.id, file.filename)
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.service.updatePassword(req.user.id, dto.currentPassword, dto.newPassword)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
    @SchoolId() schoolId: number | undefined,
  ) {
    const numId = +id
    if (req.user.role === 'teacher' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.findOne(numId, req.user.role === 'admin' ? undefined : schoolId ?? req.user.school_id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  create(@Body() dto: CreateTeacherDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @Req() req: { user: { role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    return this.service.update(+id, dto, req.user.role === 'admin' ? undefined : schoolId)
  }

  @Post(':id/photo')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `teacher-${unique}${extname(file.originalname)}`)
      },
    }),
    fileFilter: (_req, file, cb) => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file.originalname)) {
        cb(null, true)
      } else {
        cb(new Error('Apenas imagens JPG, PNG ou WEBP'), false)
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    return this.service.updatePhoto(+id, file.filename, req.user.role === 'admin' ? undefined : schoolId)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  remove(
    @Param('id') id: string,
    @Req() req: { user: { role: string } },
    @SchoolId() schoolId: number | undefined,
  ) {
    return this.service.remove(+id, req.user.role === 'admin' ? undefined : schoolId)
  }
}
