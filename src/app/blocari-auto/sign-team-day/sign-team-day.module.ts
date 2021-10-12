import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignTeamDayPageRoutingModule } from './sign-team-day-routing.module';

import { SignTeamDayPage } from './sign-team-day.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SignTeamDayPageRoutingModule,
		ReactiveFormsModule,
		TranslateModule,
		FontAwesomeModule
	],
	declarations: [SignTeamDayPage]
})
export class SignTeamDayPageModule { }
