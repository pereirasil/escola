import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from './users.service'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'

@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findPending() {
    return this.service.findPendingSchools()
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  approve(@Param('id') id: string) {
    return this.service.approve(+id)
  }
}
