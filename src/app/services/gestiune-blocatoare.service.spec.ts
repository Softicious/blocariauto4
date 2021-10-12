import { TestBed } from '@angular/core/testing';

import { GestiuneBlocatoareService } from './gestiune-blocatoare.service';

describe('GestiuneBlocatoareService', () => {
  let service: GestiuneBlocatoareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestiuneBlocatoareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
