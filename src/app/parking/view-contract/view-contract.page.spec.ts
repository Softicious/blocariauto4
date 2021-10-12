import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ViewContractPage } from './view-contract.page';

describe('ViewContractPage', () => {
  let component: ViewContractPage;
  let fixture: ComponentFixture<ViewContractPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewContractPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewContractPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
