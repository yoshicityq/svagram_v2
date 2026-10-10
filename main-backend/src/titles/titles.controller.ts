import { Body, Controller, Post } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dto/create-title.dto';

@Controller()
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  // Тестовая ручка для создания титула
  @Post('/api/admin/titles')
  async createTitle(@Body() createTitleDto: CreateTitleDto) {
    await this.titlesService.createTitle(createTitleDto);
  }
}
