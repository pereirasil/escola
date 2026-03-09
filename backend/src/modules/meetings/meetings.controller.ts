import { Body, Controller, Get, Post, Put, Delete, Param } from '@nestjs/common'
import { MeetingsService } from './meetings.service'
import { CreateMeetingDto } from './dto/create-meeting.dto'

@Controller('meetings')
export class MeetingsController {
  constructor(private service: MeetingsService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.service.create(dto)
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
