import { Injectable } from '@nestjs/common';
import { Title } from './title.entity';
import { Repository } from 'typeorm';
import { CreateTitleDto } from './dto/create-title.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TitlesService {
  constructor(
    @InjectRepository(Title) private titlesRepository: Repository<Title>,
  ) {}
  //   Тестовый метод для создания титула
  async createTitle(createTitleDto: CreateTitleDto) {
    const newTitle = this.titlesRepository.create(createTitleDto);
    this.titlesRepository.save(newTitle);
  }
}
