import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificariListPageRoutingModule } from './notificari-list-routing.module';

import { NotificariListPage } from './notificari-list.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		NotificariListPageRoutingModule,
		TranslateModule,
		FontAwesomeModule
	],
	declarations: [NotificariListPage],
	providers: [
		BarcodeScanner
	]
})
export class NotificariListPageModule { }
