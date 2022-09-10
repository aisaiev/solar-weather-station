import { Test, TestingModule } from '@nestjs/testing';
import { SensorsDataController } from './sensors-data.controller';

describe('SensorsDataController', () => {
  let controller: SensorsDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SensorsDataController],
    }).compile();

    controller = module.get<SensorsDataController>(SensorsDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
