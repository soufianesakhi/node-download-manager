import { TestBed, inject } from '@angular/core/testing';

import { DownloadsService } from './downloads.service';

describe('DownloadsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DownloadsService]
    });
  });

  it('should be created', inject([DownloadsService], (service: DownloadsService) => {
    expect(service).toBeTruthy();
  }));
});
