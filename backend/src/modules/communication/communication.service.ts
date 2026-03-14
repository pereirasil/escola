import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In } from 'typeorm'
import { Conversation } from './entities/conversation.entity'
import { ConversationMessage } from './entities/conversation-message.entity'
import { Student } from '../students/entities/student.entity'
import { CreateConversationDto } from './dto/create-conversation.dto'
import { SendMessageDto } from './dto/send-message.dto'

@Injectable()
export class CommunicationService {
  constructor(
    @InjectRepository(Conversation)
    private convRepo: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private msgRepo: Repository<ConversationMessage>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
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
    return convs.map((c) => ({
      ...c,
      last_message: lastMsgByConv.get(c.id) ?? null,
    }))
  }

  async findConversationsBySchool(schoolId?: number) {
    const where = schoolId != null ? { school_id: schoolId } : {}
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

  async getMessages(conversationId: number, page = 1, limit = 30) {
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
}
