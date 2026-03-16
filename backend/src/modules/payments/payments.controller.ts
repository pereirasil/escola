import { Body, Controller, Delete, Get, Param, Post, Put, Req, StreamableFile, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PaymentsService } from './payments.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'school', 'student')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  findAll(@SchoolId() schoolId: number | undefined, @Req() req: { user: { id: number; role: string } }) {
    if (req.user?.role === 'student') {
      return this.service.findAllByStudentId(req.user.id)
    }
    return this.service.findAll(schoolId)
  }

  @Get(':id/boleto-pdf')
  async getBoletoPdf(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    const buffer = await this.service.getBoletoPdfBuffer(+id, req.user)
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'inline',
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    return this.service.findOne(+id, req.user)
  }

  @Post()
  @Roles('admin', 'school')
  create(@Body() dto: CreatePaymentDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Post(':id/send-boleto')
  @Roles('admin', 'school')
  sendBoleto(@Param('id') id: string) {
    return this.service.sendBoletoById(+id)
  }

  @Post(':id/generate-boleto')
  generateBoleto(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    return this.service.generateBoletoById(+id, req.user)
  }

  @Post(':id/generate-pix')
  generatePix(@Param('id') id: string, @Req() req: { user: { id: number; role: string } }) {
    return this.service.generatePixById(+id, req.user)
  }

  @Put(':id')
  @Roles('admin', 'school')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.service.update(+id, dto)
  }

  @Delete(':id')
  @Roles('admin', 'school')
  delete(@Param('id') id: string) {
    return this.service.delete(+id)
  }
}
