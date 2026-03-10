import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
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

  @Get('approved')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findApproved() {
    return this.service.findApprovedSchools()
  }

  @Get('orphan-records')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  countOrphans() {
    return this.service.countOrphanRecords()
  }

  @Post(':id/assign-orphans')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  assignOrphans(@Param('id') id: string) {
    return this.service.assignOrphansToSchool(+id)
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  approve(@Param('id') id: string) {
    return this.service.approve(+id)
  }
}
