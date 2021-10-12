import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SolicitariBlocariAutoListFiltersPage } from './solicitari-blocari-auto-list-filters.page';

describe('SolicitariBlocariAutoListFiltersPage', () => {
  let component: SolicitariBlocariAutoListFiltersPage;
  let fixture: ComponentFixture<SolicitariBlocariAutoListFiltersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitariBlocariAutoListFiltersPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitariBlocariAutoListFiltersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
