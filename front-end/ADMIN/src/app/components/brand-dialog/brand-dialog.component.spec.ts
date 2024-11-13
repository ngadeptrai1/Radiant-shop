import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandDialogComponent } from './brand-dialog.component';

describe('BrandDialogComponent', () => {
  let component: BrandDialogComponent;
  let fixture: ComponentFixture<BrandDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
