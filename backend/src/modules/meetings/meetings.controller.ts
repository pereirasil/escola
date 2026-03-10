import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { MeetingsService } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'
import { SchoolId } from '../../common/decorators/school-id.decorator'

@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
export class MeetingsController {
  constructor(private service: MeetingsService) {}

  @Get()
  findAll(@SchoolId() schoolId: number | undefined) {
    return this.service.findAll(schoolId)
  }

  @Post()
  create(@Body() dto: CreateMeetingDto, @SchoolId() schoolId: number | undefined) {
    return this.service.create(dto, schoolId)
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateMeetingDto>) {
    return this.service.update(+id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id)
  }
}
