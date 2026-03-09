import { Body, Controller, Get, Post } from '@nestjs/common'
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
}
