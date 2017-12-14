import { TestBed, inject } from '@angular/core/testing';

import { CorrelationService } from './correlation.service';

describe('CorrelationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CorrelationService]
    });
  });

  it('should be created', inject([CorrelationService], (service: CorrelationService) => {
    expect(service).toBeTruthy();
  }));
});
