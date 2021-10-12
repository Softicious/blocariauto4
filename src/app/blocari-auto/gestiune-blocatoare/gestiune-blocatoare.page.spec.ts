import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GestiuneBlocatoarePage } from './gestiune-blocatoare.page';

describe('GestiuneBlocatoarePage', () => {
  let component: GestiuneBlocatoarePage;
  let fixture: ComponentFixture<GestiuneBlocatoarePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestiuneBlocatoarePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GestiuneBlocatoarePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
