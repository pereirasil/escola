import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CommunicationService } from './communication.service'
import { ChatGateway } from './gateways/chat.gateway'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller()
export class CommunicationController {
  constructor(
    private communicationService: CommunicationService,
    private chatGateway: ChatGateway,
  ) {}

  @Get('students/me/conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  findMyConversations(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.communicationService.findConversationsByStudent(req.user.id, req.user.school_id)
  }

  @Get('students/me/conversations/unread-count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  countUnreadStudent(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.communicationService.countUnreadByStudent(req.user.id, req.user.school_id).then((count) => ({ count }))
  }

  @Get('students/me/conversations/unread-count-by-type')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  countUnreadStudentByType(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.communicationService.countUnreadByStudentByType(req.user.id, req.user.school_id)
  }

  @Post('students/me/conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  createMyConversation(
    @Req() req: { user: { id: number; school_id?: number } },
    @Body() dto: CreateConversationDto,
  ) {
    return this.communicationService.createConversationByStudent(req.user.id, dto, req.user.school_id)
  }

  @Get('students/me/conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async getMyConversationMessages(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: { user: { id: number } },
  ) {
    await this.communicationService.ensureConversationAccess(+id, req.user.id, undefined)
    return this.communicationService.getMessages(+id, +(page || 1), +(limit || 30), {
      type: 'student',
      id: req.user.id,
    })
  }

  @Post('students/me/conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async sendMyConversationMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: { user: { id: number; school_id?: number } },
  ) {
    await this.communicationService.ensureConversationAccess(+id, req.user.id, undefined)
    const { message } = await this.communicationService.addMessage(+id, 'student', req.user.id, dto.message, req.user.school_id)
    this.chatGateway.emitNewMessage(+id, message)
    return message
  }

  @Patch('students/me/conversations/:id/close')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async closeMyConversation(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    await this.communicationService.ensureConversationAccess(+id, req.user.id, undefined)
    const result = await this.communicationService.closeConversation(+id, undefined)
    this.chatGateway.emitConversationClosed(+id)
    return result
  }

  @Get('students/me/teacher-conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  findMyTeacherConversations(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.communicationService.findConversationsByStudentWithTeachers(
      req.user.id,
      req.user.school_id,
    )
  }

  @Post('students/me/teacher-conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  createMyTeacherConversation(
    @Req() req: { user: { id: number; school_id?: number } },
    @Body() dto: CreateConversationDto,
  ) {
    return this.communicationService.createConversationByStudentWithTeacher(
      req.user.id,
      dto,
      req.user.school_id,
    )
  }

  @Get('students/me/teacher-conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async getMyTeacherConversationMessages(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: { user: { id: number } },
  ) {
    await this.communicationService.ensureConversationAccess(+id, req.user.id, undefined)
    return this.communicationService.getMessages(+id, +(page || 1), +(limit || 30), {
      type: 'student',
      id: req.user.id,
    })
  }

  @Post('students/me/teacher-conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('student')
  async sendMyTeacherConversationMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: { user: { id: number; school_id?: number } },
  ) {
    await this.communicationService.ensureConversationAccess(+id, req.user.id, undefined)
    const { message } = await this.communicationService.addMessage(
      +id,
      'student',
      req.user.id,
      dto.message,
      req.user.school_id,
    )
    this.chatGateway.emitNewMessage(+id, message)
    return message
  }

  @Get('school/conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  findSchoolConversations(@Req() req: { user: { id: number; role: string; school_id?: number } }) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    return this.communicationService.findConversationsBySchool(schoolId)
  }

  @Get('school/conversations/unread-count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('school')
  countUnreadSchool(@Req() req: { user: { id: number; school_id?: number } }) {
    const sid = req.user.school_id ?? req.user.id
    return this.communicationService.countUnreadBySchool(sid, req.user.id).then((count) => ({ count }))
  }

  @Post('school/conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  createSchoolConversation(
    @Req() req: { user: { id: number; role: string; school_id?: number } },
    @Body() dto: CreateConversationDto,
    @SchoolId() schoolId: number | undefined,
  ) {
    const sid = req.user.role === 'admin' ? schoolId : req.user.school_id
    return this.communicationService.createConversationBySchool(dto, sid)
  }

  @Get('school/conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  async getSchoolConversationMessages(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    await this.communicationService.ensureConversationAccess(+id, undefined, schoolId)
    const reader = req.user.role === 'school' ? { type: 'school' as const, id: req.user.id } : undefined
    return this.communicationService.getMessages(+id, +(page || 1), +(limit || 30), reader)
  }

  @Post('school/conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  async sendSchoolConversationMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    await this.communicationService.ensureConversationAccess(+id, undefined, schoolId)
    const { message } = await this.communicationService.addMessage(+id, 'school', req.user.id, dto.message, schoolId)
    this.chatGateway.emitNewMessage(+id, message)
    return message
  }

  @Patch('school/conversations/:id/close')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'school')
  async closeSchoolConversation(
    @Param('id') id: string,
    @Req() req: { user: { id: number; role: string; school_id?: number } },
  ) {
    const schoolId = req.user.role === 'admin' ? undefined : req.user.school_id
    const result = await this.communicationService.closeConversation(+id, schoolId)
    this.chatGateway.emitConversationClosed(+id)
    return result
  }

  @Get('teacher/conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  findTeacherConversations(@Req() req: { user: { id: number; school_id?: number } }) {
    return this.communicationService.findConversationsByTeacher(req.user.id, req.user.school_id)
  }

  @Get('teacher/conversations/unread-count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  countUnreadTeacher(@Req() req: { user: { id: number } }) {
    return this.communicationService.countUnreadByTeacher(req.user.id).then((count) => ({ count }))
  }

  @Post('teacher/conversations')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  createTeacherConversation(
    @Req() req: { user: { id: number; school_id?: number } },
    @Body() dto: CreateConversationDto,
  ) {
    return this.communicationService.createConversationByTeacher(
      req.user.id,
      dto,
      req.user.school_id,
    )
  }

  @Get('teacher/conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  async getTeacherConversationMessages(
    @Param('id') id: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: { user: { id: number } },
  ) {
    await this.communicationService.ensureTeacherConversationAccess(+id, req.user.id)
    return this.communicationService.getMessages(+id, +(page || 1), +(limit || 30), {
      type: 'teacher',
      id: req.user.id,
    })
  }

  @Post('teacher/conversations/:id/messages')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  async sendTeacherConversationMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Req() req: { user: { id: number; school_id?: number } },
  ) {
    await this.communicationService.ensureTeacherConversationAccess(+id, req.user.id)
    const { message } = await this.communicationService.addMessage(
      +id,
      'teacher',
      req.user.id,
      dto.message,
      req.user.school_id,
    )
    this.chatGateway.emitNewMessage(+id, message)
    return message
  }

  @Patch('teacher/conversations/:id/close')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('teacher')
  async closeTeacherConversation(
    @Param('id') id: string,
    @Req() req: { user: { id: number } },
  ) {
    const result = await this.communicationService.closeConversationByTeacher(+id, req.user.id)
    this.chatGateway.emitConversationClosed(+id)
    return result
  }
}
