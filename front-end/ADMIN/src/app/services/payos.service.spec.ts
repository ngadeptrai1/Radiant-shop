import { TestBed } from '@angular/core/testing';

import { PayosService } from './payos.service';

describe('PayosService', () => {
  let service: PayosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
