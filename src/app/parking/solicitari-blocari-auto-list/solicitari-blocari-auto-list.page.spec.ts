import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SolicitariBlocariAutoListPage } from './solicitari-blocari-auto-list.page';

describe('SolicitariBlocariAutoListPage', () => {
  let component: SolicitariBlocariAutoListPage;
  let fixture: ComponentFixture<SolicitariBlocariAutoListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitariBlocariAutoListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitariBlocariAutoListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
