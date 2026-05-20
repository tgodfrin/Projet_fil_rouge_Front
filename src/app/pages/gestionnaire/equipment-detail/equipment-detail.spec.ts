import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentDetailComponent } from './equipment-detail';

describe('EquipmentDetail', () => {
  let component: EquipmentDetailComponent;
  let fixture: ComponentFixture<EquipmentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EquipmentDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
