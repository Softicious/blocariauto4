import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitariBlocariAutoListPageRoutingModule } from './solicitari-blocari-auto-list-routing.module';

import { SolicitariBlocariAutoListPage } from './solicitari-blocari-auto-list.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SolicitariBlocariAutoListPageRoutingModule,
		FontAwesomeModule,
		TranslateModule
	],
	declarations: [SolicitariBlocariAutoListPage],
	providers: [
		BarcodeScanner,
		Geolocation
	]
})
export class SolicitariBlocariAutoListPageModule { }
