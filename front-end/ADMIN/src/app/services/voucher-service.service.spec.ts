import { TestBed } from '@angular/core/testing';

import { VoucherServiceService } from './voucher-service.service';

describe('VoucherServiceService', () => {
  let service: VoucherServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoucherServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
