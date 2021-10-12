import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotificariListPage } from './notificari-list.page';

describe('NotificariListPage', () => {
  let component: NotificariListPage;
  let fixture: ComponentFixture<NotificariListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificariListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificariListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
