import { TestBed, inject } from '@angular/core/testing';

import { PoimarkerService } from './poimarker.service';

describe('PoimarkerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PoimarkerService]
    });
  });

  it('should be created', inject([PoimarkerService], (service: PoimarkerService) => {
    expect(service).toBeTruthy();
  }));
});
