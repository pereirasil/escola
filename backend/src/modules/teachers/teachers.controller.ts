import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { TeachersService } from './teachers.service'
import { ClassesService } from '../classes/classes.service'
import { CreateTeacherDto } from './dto/create-teacher.dto'
import { UpdateTeacherDto } from './dto/update-teacher.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('teachers')
export class TeachersController {
  constructor(
    private service: TeachersService,
    private classesService: ClassesService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findAll(
    @SchoolId() schoolId: number | undefined,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (page) {
      return this.service.findAllPaginated(schoolId, +page, +(limit || 10))
    }
    return this.service.findAll(schoolId)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMe(@Req() req: { user: { id: number } }) {
    return this.service.findOne(req.user.id)
  }

  @Get('me/classes')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findMyClasses(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.classesService.findByTeacherId(req.user.id, req.user.school_id)
  }

  @Patch('me/password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  changePassword(@Req() req: { user: { id: number } }, @Body() dto: ChangePasswordDto) {
    return this.service.updatePassword(req.user.id, dto.currentPassword, dto.newPassword)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const numId = +id
    if (req.user.role === 'teacher' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.findOne(numId)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  create(@Body() dto: CreateTeacherDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const numId = +id
    if (req.user.role === 'teacher' && numId !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.update(numId, dto)
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
  ) {
    return this.service.updatePhoto(+id, file.filename)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
