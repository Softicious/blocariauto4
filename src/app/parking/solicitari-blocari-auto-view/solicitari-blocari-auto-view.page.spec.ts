import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SolicitariBlocariAutoViewPage } from './solicitari-blocari-auto-view.page';

describe('SolicitariBlocariAutoViewPage', () => {
  let component: SolicitariBlocariAutoViewPage;
  let fixture: ComponentFixture<SolicitariBlocariAutoViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitariBlocariAutoViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitariBlocariAutoViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
