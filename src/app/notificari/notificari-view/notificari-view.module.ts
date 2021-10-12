import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificariViewPageRoutingModule } from './notificari-view-routing.module';

import { NotificariViewPage } from './notificari-view.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		NotificariViewPageRoutingModule,
		TranslateModule,
		FontAwesomeModule
	],
	declarations: [NotificariViewPage]
})
export class NotificariViewPageModule { }
