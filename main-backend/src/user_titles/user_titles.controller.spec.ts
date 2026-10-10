import { Test, TestingModule } from '@nestjs/testing';
import { UserTitlesController } from './user_titles.controller';

describe('UserTitlesController', () => {
  let controller: UserTitlesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserTitlesController],
    }).compile();

    controller = module.get<UserTitlesController>(UserTitlesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
