import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ClassesService } from './classes.service'
import { CreateClassDto } from './dto/create-class.dto'
import { UpdateClassDto } from './dto/update-class.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@Controller('classes')
export class ClassesController {
  constructor(private service: ClassesService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: { user: { id: number; role: string } }) {
    if (req.user.role === 'teacher') {
      return this.service.findByTeacherId(req.user.id)
    }
    return this.service.findAll()
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const classEntity = await this.service.findOne(+id)
    if (!classEntity) return classEntity
    if (req.user.role === 'teacher' && classEntity.teacher_id !== req.user.id) {
      throw new ForbiddenException('Acesso negado a esta turma')
    }
    return classEntity
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  create(@Body() dto: CreateClassDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const classEntity = await this.service.findOne(+id)
    if (req.user.role === 'teacher' && classEntity?.teacher_id !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.update(+id, dto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const classEntity = await this.service.findOne(+id)
    if (req.user.role === 'teacher' && classEntity?.teacher_id !== req.user.id) {
      throw new ForbiddenException('Acesso negado')
    }
    return this.service.remove(+id)
  }
}
