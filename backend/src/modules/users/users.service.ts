import * as bcrypt from 'bcrypt'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { Student } from '../students/entities/student.entity'
import { Teacher } from '../teachers/entities/teacher.entity'
import { Class } from '../classes/entities/class.entity'
import { Subject } from '../subjects/entities/subject.entity'
import { Grade } from '../grades/entities/grade.entity'
import { Attendance } from '../attendance/entities/attendance.entity'
import { Meeting } from '../meetings/entities/meeting.entity'
import { Payment } from '../payments/entities/payment.entity'
import { Schedule } from '../schedules/entities/schedule.entity'
import { Notification } from '../notifications/entities/notification.entity'
import { Enrollment } from '../classes/entities/enrollment.entity'

const SALT_ROUNDS = 10

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(Teacher)
    private teacherRepo: Repository<Teacher>,
    @InjectRepository(Class)
    private classRepo: Repository<Class>,
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,
    @InjectRepository(Grade)
    private gradeRepo: Repository<Grade>,
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Meeting)
    private meetingRepo: Repository<Meeting>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } })
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } })
  }

  findSchoolById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id, role: 'school' } })
  }

  async hasMercadoPagoConnected(schoolUserId: number): Promise<boolean> {
    const user = await this.repo.findOne({
      where: { id: schoolUserId, role: 'school' },
      select: ['id', 'mercadopago_access_token'],
    })
    return !!(user?.mercadopago_access_token?.trim())
  }

  async getSchoolAccessToken(schoolUserId: number): Promise<string> {
    const user = await this.repo.findOne({
      where: { id: schoolUserId, role: 'school' },
      select: ['id', 'mercadopago_access_token'],
    })
    const token = user?.mercadopago_access_token?.trim()
    if (!token) {
      throw new Error('Escola não possui Mercado Pago conectado.')
    }
    return token
  }

  async updateMercadoPagoCredentials(
    schoolUserId: number,
    accessToken: string,
    mercadopagoUserId: string,
  ): Promise<void> {
    await this.repo.update(
      { id: schoolUserId, role: 'school' },
      { mercadopago_access_token: accessToken.trim(), mercadopago_user_id: mercadopagoUserId.trim() || null },
    )
  }

  async createSchool(data: { name: string; email: string; password: string; responsible_name: string; cnpj?: string; phone: string }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS)
    const user = this.repo.create({
      name: data.name,
      email: data.email,
      password_hash,
      role: 'school',
      approved: 0,
      responsible_name: data.responsible_name,
      cnpj: data.cnpj || undefined,
      phone: data.phone,
    })
    return this.repo.save(user)
  }

  findPendingSchools(): Promise<User[]> {
    return this.repo.find({
      where: { role: 'school', approved: 0 },
      order: { created_at: 'DESC' },
    })
  }

  async findApprovedSchools() {
    const schools = await this.repo.find({
      where: { role: 'school', approved: 1 },
      order: { created_at: 'DESC' },
    })
    const schoolIds = schools.map((s) => s.id)
    if (schoolIds.length === 0) return []

    const studentCounts = await this.studentRepo
      .createQueryBuilder('s')
      .select('s.school_id', 'school_id')
      .addSelect('COUNT(*)', 'count')
      .where('s.school_id IN (:...ids)', { ids: schoolIds })
      .andWhere('(s.status IS NULL OR s.status = :st)', { st: 'active' })
      .groupBy('s.school_id')
      .getRawMany<{ school_id: number; count: string }>()

    const teacherCounts = await this.teacherRepo
      .createQueryBuilder('t')
      .select('t.school_id', 'school_id')
      .addSelect('COUNT(*)', 'count')
      .where('t.school_id IN (:...ids)', { ids: schoolIds })
      .groupBy('t.school_id')
      .getRawMany<{ school_id: number; count: string }>()

    const studentMap = new Map(studentCounts.map((r) => [r.school_id, Number(r.count)]))
    const teacherMap = new Map(teacherCounts.map((r) => [r.school_id, Number(r.count)]))

    return schools.map((s) => ({
      ...s,
      students_count: studentMap.get(s.id) ?? 0,
      teachers_count: teacherMap.get(s.id) ?? 0,
    }))
  }

  async countOrphanRecords() {
    const repos = [
      { name: 'students', repo: this.studentRepo },
      { name: 'teachers', repo: this.teacherRepo },
      { name: 'classes', repo: this.classRepo },
      { name: 'subjects', repo: this.subjectRepo },
      { name: 'grades', repo: this.gradeRepo },
      { name: 'attendance', repo: this.attendanceRepo },
      { name: 'meetings', repo: this.meetingRepo },
      { name: 'payments', repo: this.paymentRepo },
      { name: 'schedules', repo: this.scheduleRepo },
      { name: 'notifications', repo: this.notificationRepo },
      { name: 'enrollments', repo: this.enrollmentRepo },
    ]
    const result: Record<string, number> = {}
    let total = 0
    for (const { name, repo } of repos) {
      const count = await (repo as Repository<any>)
        .createQueryBuilder('e')
        .where('e.school_id IS NULL')
        .getCount()
      result[name] = count
      total += count
    }
    result.total = total
    return result
  }

  async assignOrphansToSchool(schoolId: number) {
    const school = await this.repo.findOne({ where: { id: schoolId, role: 'school', approved: 1 } })
    if (!school) return { error: 'Escola não encontrada ou não aprovada' }

    const repos = [
      { name: 'students', repo: this.studentRepo },
      { name: 'teachers', repo: this.teacherRepo },
      { name: 'classes', repo: this.classRepo },
      { name: 'subjects', repo: this.subjectRepo },
      { name: 'grades', repo: this.gradeRepo },
      { name: 'attendance', repo: this.attendanceRepo },
      { name: 'meetings', repo: this.meetingRepo },
      { name: 'payments', repo: this.paymentRepo },
      { name: 'schedules', repo: this.scheduleRepo },
      { name: 'notifications', repo: this.notificationRepo },
      { name: 'enrollments', repo: this.enrollmentRepo },
    ]
    const migrated: Record<string, number> = {}
    for (const { name, repo } of repos) {
      const result = await (repo as Repository<any>)
        .createQueryBuilder()
        .update()
        .set({ school_id: schoolId })
        .where('school_id IS NULL')
        .execute()
      migrated[name] = result.affected ?? 0
    }
    return migrated
  }

  approve(id: number): Promise<User> {
    return this.repo.update(id, { approved: 1 }).then(() => this.repo.findOneOrFail({ where: { id } }))
  }

  async ensureAdminExists(): Promise<void> {
    const admin = await this.repo.findOne({ where: { role: 'admin' } })
    if (!admin) {
      const password_hash = await bcrypt.hash('admin123', SALT_ROUNDS)
      await this.repo.save(
        this.repo.create({
          email: 'admin@escola.com',
          password_hash,
          name: 'Administrador Geral',
          role: 'admin',
          approved: 1,
        }),
      )
    }
  }
}
