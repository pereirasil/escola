import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, IsNull, Not } from 'typeorm'
import { Conversation } from './entities/conversation.entity'
import { ConversationMessage } from './entities/conversation-message.entity'
import { ConversationRead } from './entities/conversation-read.entity'
import { Student } from '../students/entities/student.entity'
import { Teacher } from '../teachers/entities/teacher.entity'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { SendMessageDto } from './dto/send-message.dto'
import { ClassesService } from '../classes/classes.service'

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Conversation)
    private convRepo: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private msgRepo: Repository<ConversationMessage>,
    @InjectRepository(ConversationRead)
    private readRepo: Repository<ConversationRead>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    private classesService: ClassesService,
  ) {}

  async findConversationsByStudent(studentId: number, schoolId?: number) {
    const where: any = { student_id: studentId }
    if (schoolId != null) where.school_id = schoolId
    const convs = await this.convRepo.find({
      where,
      order: { last_message_at: 'DESC', created_at: 'DESC' },
    })
    if (convs.length === 0) return []
    const ids = convs.map((c) => c.id)
    const msgs = await this.msgRepo.find({
      where: { conversation_id: In(ids) },
      order: { id: 'DESC' },
    })
    const lastMsgByConv = new Map<number, string>()
    for (const m of msgs) {
      if (!lastMsgByConv.has(m.conversation_id)) {
        lastMsgByConv.set(m.conversation_id, m.message)
      }
    }
    const teacherIds = [...new Set(convs.map((c) => c.teacher_id).filter(Boolean))] as number[]
    const teachers = teacherIds.length
      ? await this.teacherRepo.find({ where: { id: In(teacherIds) }, select: ['id', 'name'] })
      : []
    const teacherMap = new Map(teachers.map((t) => [t.id, t]))
    return convs.map((c) => ({
      ...c,
      last_message: lastMsgByConv.get(c.id) ?? null,
      conversation_type: c.teacher_id ? 'teacher' : 'school',
      teacher_name: c.teacher_id ? teacherMap.get(c.teacher_id)?.name ?? '-' : null,
    }))
  }

  async findConversationsBySchool(schoolId?: number) {
    const where: any = { teacher_id: IsNull() }
    if (schoolId != null) where.school_id = schoolId
    const convs = await this.convRepo.find({
      where,
      order: { last_message_at: 'DESC', created_at: 'DESC' },
    })
    const studentIds = [...new Set(convs.map((c) => c.student_id))]
    const students = studentIds.length
      ? await this.studentRepo.find({ where: { id: In(studentIds) }, select: ['id', 'name'] })
      : []
    const studentMap = new Map(students.map((s) => [s.id, s]))
    return convs.map((c) => ({
      ...c,
      student_name: studentMap.get(c.student_id)?.name ?? '-',
    }))
  }

  async createConversationByStudent(studentId: number, dto: CreateConversationDto, schoolId?: number) {
    const student = await this.studentRepo.findOne({ where: { id: studentId }, select: ['school_id'] })
    const sid = schoolId ?? student?.school_id
    const conv = this.convRepo.create({
      student_id: studentId,
      school_id: sid,
      subject: dto.subject,
      status: 'open',
    })
    const saved = await this.convRepo.save(conv)
    if (dto.initial_message) {
      await this.addMessage(saved.id, 'student', studentId, dto.initial_message, sid)
    }
    return this.convRepo.findOne({ where: { id: saved.id } })
  }

  async createConversationByStudentWithTeacher(
    studentId: number,
    dto: CreateConversationDto,
    schoolId?: number,
  ) {
    if (!dto.teacher_id) throw new ForbiddenException('teacher_id obrigatório')
    const allowedTeachers = await this.classesService.findTeachersByStudentId(studentId, schoolId)
    const allowedIds = new Set(allowedTeachers.map((t) => t.id))
    if (!allowedIds.has(dto.teacher_id)) {
      throw new ForbiddenException('Professor não encontrado ou não faz parte das suas turmas')
    }
    const student = await this.studentRepo.findOne({ where: { id: studentId }, select: ['school_id'] })
    const sid = schoolId ?? student?.school_id
    const conv = this.convRepo.create({
      student_id: studentId,
      school_id: sid,
      teacher_id: dto.teacher_id,
      subject: dto.subject,
      status: 'open',
    })
    const saved = await this.convRepo.save(conv)
    if (dto.initial_message) {
      await this.addMessage(saved.id, 'student', studentId, dto.initial_message, sid)
    }
    const full = await this.convRepo.findOne({ where: { id: saved.id } })
    const teacherName = await this.teacherRepo.findOne({
      where: { id: dto.teacher_id },
      select: ['name'],
    })
    return { ...full, teacher_name: teacherName?.name ?? '-', conversation_type: 'teacher' }
  }

  async findConversationsByStudentWithTeachers(studentId: number, schoolId?: number) {
    return this.findConversationsByStudent(studentId, schoolId).then((convs) =>
      convs.filter((c) => c.conversation_type === 'teacher'),
    )
  }

  async createConversationBySchool(dto: CreateConversationDto, schoolId?: number) {
    if (!dto.student_id) throw new ForbiddenException('student_id obrigatório para a escola')
    const student = await this.studentRepo.findOne({
      where: { id: dto.student_id, school_id: schoolId ?? undefined },
    })
    if (!student) throw new NotFoundException('Aluno não encontrado')
    const conv = this.convRepo.create({
      student_id: dto.student_id,
      school_id: schoolId,
      subject: dto.subject,
      status: 'open',
    })
    const saved = await this.convRepo.save(conv)
    if (dto.initial_message) {
      await this.addMessage(saved.id, 'school', schoolId!, dto.initial_message, schoolId)
    }
    return this.convRepo.findOne({ where: { id: saved.id } })
  }

  async findConversationsByTeacher(teacherId: number, schoolId?: number) {
    const where: any = { teacher_id: teacherId }
    if (schoolId != null) where.school_id = schoolId
    const convs = await this.convRepo.find({
      where,
      order: { last_message_at: 'DESC', created_at: 'DESC' },
    })
    const studentIds = [...new Set(convs.map((c) => c.student_id))]
    const students = studentIds.length
      ? await this.studentRepo.find({ where: { id: In(studentIds) }, select: ['id', 'name'] })
      : []
    const studentMap = new Map(students.map((s) => [s.id, s]))
    return convs.map((c) => ({
      ...c,
      student_name: studentMap.get(c.student_id)?.name ?? '-',
    }))
  }

  async createConversationByTeacher(
    teacherId: number,
    dto: CreateConversationDto,
    schoolId?: number,
  ) {
    if (!dto.student_id) throw new ForbiddenException('student_id obrigatório para o professor')
    const teacher = await this.teacherRepo.findOne({
      where: { id: teacherId },
      select: ['school_id'],
    })
    const sid = schoolId ?? teacher?.school_id
    const student = await this.studentRepo.findOne({
      where: { id: dto.student_id, school_id: sid ?? undefined },
    })
    if (!student) throw new NotFoundException('Aluno não encontrado')
    const conv = this.convRepo.create({
      student_id: dto.student_id,
      school_id: sid,
      teacher_id: teacherId,
      subject: dto.subject,
      status: 'open',
    })
    const saved = await this.convRepo.save(conv)
    if (dto.initial_message) {
      await this.addMessage(saved.id, 'teacher', teacherId, dto.initial_message, sid)
    }
    return this.convRepo.findOne({ where: { id: saved.id } })
  }

  async ensureTeacherConversationAccess(
    conversationId: number,
    teacherId: number,
  ) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    if (conv.teacher_id !== teacherId) throw new ForbiddenException('Acesso negado')
    return conv
  }

  async getMessages(conversationId: number, page = 1, limit = 30, reader?: { type: string; id: number }) {
    if (reader) {
      await this.markConversationAsRead(conversationId, reader.type, reader.id)
    }
    const [data, total] = await this.msgRepo.findAndCount({
      where: { conversation_id: conversationId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
    return {
      data: data.reverse(),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    }
  }

  async markConversationAsRead(conversationId: number, readerType: string, readerId: number) {
    const now = new Date().toISOString()
    const existing = await this.readRepo.findOne({
      where: { conversation_id: conversationId, reader_type: readerType, reader_id: readerId },
    })
    if (existing) {
      await this.readRepo.update(existing.id, { last_read_at: now })
    } else {
      await this.readRepo.save(
        this.readRepo.create({
          conversation_id: conversationId,
          reader_type: readerType,
          reader_id: readerId,
          last_read_at: now,
        }),
      )
    }
  }

  async addMessage(
    conversationId: number,
    senderType: string,
    senderId: number,
    message: string,
    schoolId?: number,
  ) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    if (conv.status === 'closed') throw new ForbiddenException('Conversa encerrada')
    const msg = this.msgRepo.create({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_id: senderId,
      message,
    })
    const saved = await this.msgRepo.save(msg)
    const now = new Date().toISOString()
    await this.convRepo.update(conversationId, { last_message_at: now })
    return { message: saved, conversation: conv }
  }

  async closeConversation(conversationId: number, schoolId?: number) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    if (schoolId != null && conv.school_id !== schoolId) {
      throw new ForbiddenException('Acesso negado')
    }
    const now = new Date().toISOString()
    await this.convRepo.update(conversationId, { status: 'closed', closed_at: now })
    return this.convRepo.findOne({ where: { id: conversationId } })
  }

  async closeConversationByTeacher(conversationId: number, teacherId: number) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    if (conv.teacher_id !== teacherId) throw new ForbiddenException('Acesso negado')
    const now = new Date().toISOString()
    await this.convRepo.update(conversationId, { status: 'closed', closed_at: now })
    return this.convRepo.findOne({ where: { id: conversationId } })
  }

  async ensureConversationAccess(conversationId: number, studentId?: number, schoolId?: number) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } })
    if (!conv) throw new NotFoundException('Conversa não encontrada')
    if (studentId != null && conv.student_id !== studentId) throw new ForbiddenException('Acesso negado')
    if (schoolId != null && conv.school_id !== schoolId) throw new ForbiddenException('Acesso negado')
    return conv
  }

  async findConversationWithDetails(id: number) {
    const conv = await this.convRepo.findOne({ where: { id } })
    if (!conv) return null
    const student = await this.studentRepo.findOne({
      where: { id: conv.student_id },
      select: ['id', 'name'],
    })
    return {
      ...conv,
      student_name: student?.name ?? '-',
    }
  }

  async countUnreadByStudent(studentId: number, schoolId?: number): Promise<number> {
    const convs = await this.convRepo.find({
      where: { student_id: studentId, ...(schoolId != null && { school_id: schoolId }) },
      select: ['id', 'last_message_at'],
    })
    return this._countUnreadByLastRead(convs, 'student', studentId)
  }

  async countUnreadByStudentByType(
    studentId: number,
    schoolId?: number,
  ): Promise<{ school: number; teacher: number }> {
    const where: any = { student_id: studentId }
    if (schoolId != null) where.school_id = schoolId
    const [schoolConvs, teacherConvs] = await Promise.all([
      this.convRepo.find({
        where: { ...where, teacher_id: IsNull() },
        select: ['id', 'last_message_at'],
      }),
      this.convRepo.find({
        where: { ...where, teacher_id: Not(IsNull()) },
        select: ['id', 'last_message_at'],
      }),
    ])
    const [school, teacher] = await Promise.all([
      this._countUnreadByLastRead(schoolConvs, 'student', studentId),
      this._countUnreadByLastRead(teacherConvs, 'student', studentId),
    ])
    return { school, teacher }
  }

  async countUnreadBySchool(schoolId: number, schoolUserId: number): Promise<number> {
    const convs = await this.convRepo.find({
      where: { school_id: schoolId, teacher_id: IsNull() },
      select: ['id', 'last_message_at'],
    })
    return this._countUnreadByLastRead(convs, 'school', schoolUserId)
  }

  async countUnreadByTeacher(teacherId: number): Promise<number> {
    const convs = await this.convRepo.find({
      where: { teacher_id: teacherId },
      select: ['id', 'last_message_at'],
    })
    return this._countUnreadByLastRead(convs, 'teacher', teacherId)
  }

  private async getUnreadConversationIds(
    convs: { id: number; last_message_at: string | null }[],
    readerType: string,
    readerId: number,
  ): Promise<number[]> {
    if (convs.length === 0) return []
    const ids = convs.map((c) => c.id)
    const reads = await this.readRepo.find({
      where: { conversation_id: In(ids), reader_type: readerType, reader_id: readerId },
      select: ['conversation_id', 'last_read_at'],
    })
    const readByConv = new Map(reads.map((r) => [r.conversation_id, r.last_read_at]))
    const unread: number[] = []
    for (const c of convs) {
      const lastRead = readByConv.get(c.id)
      const lastMsgAt = c.last_message_at ?? ''
      if (!lastMsgAt) continue
      if (!lastRead || lastMsgAt > lastRead) {
        unread.push(c.id)
      }
    }
    return unread
  }

  private async _countUnreadByLastRead(
    convs: { id: number; last_message_at: string | null }[],
    readerType: string,
    readerId: number,
  ): Promise<number> {
    const unread = await this.getUnreadConversationIds(convs, readerType, readerId)
    return unread.length
  }

  /**
   * Itens de conversa não lidas para o feed do sininho (responsável/aluno).
   */
  async listUnreadInboxForStudent(studentId: number, schoolId?: number) {
    const convs = await this.findConversationsByStudent(studentId, schoolId)
    const unreadIds = new Set(
      await this.getUnreadConversationIds(
        convs.map((c) => ({ id: c.id, last_message_at: c.last_message_at })),
        'student',
        studentId,
      ),
    )
    const items: {
      kind: 'message'
      source_id: string
      conversation_id: number
      channel: 'school' | 'teacher'
      title: string
      subtitle: string | null
      at: string
    }[] = []
    for (const c of convs) {
      if (!unreadIds.has(c.id)) continue
      const channel = c.teacher_id ? 'teacher' : 'school'
      const at = c.last_message_at || c.created_at
      const atStr = typeof at === 'string' ? at : at instanceof Date ? at.toISOString() : ''
      const title =
        channel === 'school'
          ? 'Nova mensagem — Secretaria'
          : `Nova mensagem — ${(c as { teacher_name?: string }).teacher_name || 'Professor'}`
      items.push({
        kind: 'message',
        source_id: `msg-${c.id}-${channel}`,
        conversation_id: c.id,
        channel,
        title,
        subtitle: c.subject || (c as { last_message?: string }).last_message || null,
        at: atStr,
      })
    }
    return items
  }

  /**
   * Conversas com a escola (secretaria) não lidas pelo usuário da escola.
   */
  async listUnreadInboxForSchool(schoolId: number, schoolUserId: number) {
    const convs = await this.findConversationsBySchool(schoolId)
    const unreadIds = new Set(
      await this.getUnreadConversationIds(
        convs.map((c) => ({ id: c.id, last_message_at: c.last_message_at })),
        'school',
        schoolUserId,
      ),
    )
    const items: {
      kind: 'message'
      source_id: string
      conversation_id: number
      title: string
      subtitle: string | null
      at: string
    }[] = []
    for (const c of convs) {
      if (!unreadIds.has(c.id)) continue
      const at = c.last_message_at || c.created_at
      const atStr = typeof at === 'string' ? at : at instanceof Date ? at.toISOString() : ''
      const studentName = (c as { student_name?: string }).student_name || 'Aluno'
      items.push({
        kind: 'message',
        source_id: `msg-${c.id}`,
        conversation_id: c.id,
        title: `Nova mensagem — ${studentName}`,
        subtitle: c.subject || null,
        at: atStr,
      })
    }
    return items
  }

  /**
   * Conversas com o professor não lidas pelo professor.
   */
  async listUnreadInboxForTeacher(teacherId: number) {
    const convs = await this.findConversationsByTeacher(teacherId)
    const unreadIds = new Set(
      await this.getUnreadConversationIds(
        convs.map((c) => ({ id: c.id, last_message_at: c.last_message_at })),
        'teacher',
        teacherId,
      ),
    )
    const items: {
      kind: 'message'
      source_id: string
      conversation_id: number
      title: string
      subtitle: string | null
      at: string
    }[] = []
    for (const c of convs) {
      if (!unreadIds.has(c.id)) continue
      const at = c.last_message_at || c.created_at
      const atStr = typeof at === 'string' ? at : at instanceof Date ? at.toISOString() : ''
      const studentName = (c as { student_name?: string }).student_name || 'Aluno'
      items.push({
        kind: 'message',
        source_id: `msg-${c.id}`,
        conversation_id: c.id,
        title: `Nova mensagem — ${studentName}`,
        subtitle: c.subject || null,
        at: atStr,
      })
    }
    return items
  }
}
