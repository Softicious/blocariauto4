import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CheckContractPage } from './check-contract.page';

describe('CheckContractPage', () => {
  let component: CheckContractPage;
  let fixture: ComponentFixture<CheckContractPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckContractPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckContractPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
