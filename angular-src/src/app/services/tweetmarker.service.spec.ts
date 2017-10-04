import { TestBed, inject } from '@angular/core/testing';

import { TweetmarkerService } from './tweetmarker.service';

describe('TweetmarkerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TweetmarkerService]
    });
  });

  it('should be created', inject([TweetmarkerService], (service: TweetmarkerService) => {
    expect(service).toBeTruthy();
  }));
});
