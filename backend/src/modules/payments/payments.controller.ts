import { Body, Controller, Get, Param, Post, Put, StreamableFile, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PaymentsService } from './payments.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'school')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  findAll(@SchoolId() schoolId: number | undefined) {
    return this.service.findAll(schoolId)
  }

  @Get(':id/boleto-pdf')
  async getBoletoPdf(@Param('id') id: string) {
    const buffer = await this.service.getBoletoPdfBuffer(+id)
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'inline',
    })
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id)
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Post(':id/send-boleto')
  sendBoleto(@Param('id') id: string) {
    return this.service.sendBoletoById(+id)
  }

  @Post(':id/generate-boleto')
  generateBoleto(@Param('id') id: string) {
    return this.service.generateBoletoById(+id)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.service.update(+id, dto)
  }
}
