import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { BankAccountsService } from './bank-accounts.service'
import { CreateBankAccountDto } from './dto/create-bank-account.dto'
import { UpdateBankAccountDto } from './dto/update-bank-account.dto'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('bank-accounts')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin', 'school')
export class BankAccountsController {
  constructor(private service: BankAccountsService) {}

  @Get()
  findAll(@SchoolId() schoolId: number | undefined, @Req() req: { user: { id: number; role: string } }) {
    const sid = req.user.role === 'school' ? req.user.id : schoolId
    if (sid != null) return this.service.findBySchool(sid)
    return this.service.findAll()
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @SchoolId() schoolId: number | undefined,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const sid = req.user.role === 'school' ? req.user.id : schoolId
    const bank = await this.service.findOne(+id, sid ?? undefined)
    if (!bank) throw new ForbiddenException('Conta não encontrada')
    return bank
  }

  @Post()
  create(
    @Body() dto: CreateBankAccountDto,
    @Req() req: { user: { id: number; role: string } },
  ) {
    if (req.user.role !== 'school') throw new ForbiddenException('Apenas escolas podem cadastrar dados bancários')
    return this.service.create(dto, req.user.id)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
    @SchoolId() schoolId: number | undefined,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const sid = req.user.role === 'school' ? req.user.id : schoolId
    return this.service.update(+id, dto, sid ?? undefined)
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @SchoolId() schoolId: number | undefined,
    @Req() req: { user: { id: number; role: string } },
  ) {
    const sid = req.user.role === 'school' ? req.user.id : schoolId
    return this.service.remove(+id, sid ?? undefined)
  }
}
