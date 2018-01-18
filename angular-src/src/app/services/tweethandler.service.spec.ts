import { TestBed, inject } from '@angular/core/testing';

import { TweethandlerService } from './tweethandler.service';

describe('TweethandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TweethandlerService]
    });
  });

  it('should be created', inject([TweethandlerService], (service: TweethandlerService) => {
    expect(service).toBeTruthy();
  }));
});
