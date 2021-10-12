import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignTeamDayPage } from './sign-team-day.page';

describe('SignTeamDayPage', () => {
  let component: SignTeamDayPage;
  let fixture: ComponentFixture<SignTeamDayPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignTeamDayPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignTeamDayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
