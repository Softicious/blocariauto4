import { TestBed } from '@angular/core/testing';

import { SesizareService } from './sesizare.service';

describe('SesizareService', () => {
  let service: SesizareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SesizareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
