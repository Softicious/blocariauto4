import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SesizariBlocareAutoAgentPage } from './sesizari-blocare-auto-agent.page';

describe('SesizariBlocareAutoAgentPage', () => {
  let component: SesizariBlocareAutoAgentPage;
  let fixture: ComponentFixture<SesizariBlocareAutoAgentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SesizariBlocareAutoAgentPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SesizariBlocareAutoAgentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
