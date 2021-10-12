import { TestBed } from '@angular/core/testing';

import { ProtectRequestsService } from './protect-requests.service';

describe('ProtectRequestsService', () => {
  let service: ProtectRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtectRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
