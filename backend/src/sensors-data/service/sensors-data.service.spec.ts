import { Test, TestingModule } from '@nestjs/testing';
import { SensorsDataService } from './sensors-data.service';

describe('SensorsDataService', () => {
  let service: SensorsDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorsDataService],
    }).compile();

    service = module.get<SensorsDataService>(SensorsDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
