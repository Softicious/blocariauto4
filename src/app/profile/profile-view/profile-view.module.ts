import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileViewPageRoutingModule } from './profile-view-routing.module';

import { ProfileViewPage } from './profile-view.page';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ProfileViewPageRoutingModule,
		TranslateModule,
		FontAwesomeModule
	],
	declarations: [ProfileViewPage]
})
export class ProfileViewPageModule { }
