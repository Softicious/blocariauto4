import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotificariViewPage } from './notificari-view.page';

describe('NotificariViewPage', () => {
  let component: NotificariViewPage;
  let fixture: ComponentFixture<NotificariViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificariViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificariViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
