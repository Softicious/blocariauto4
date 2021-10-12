import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SolicitariBlocariAutoViewPageRoutingModule } from './solicitari-blocari-auto-view-routing.module';

import { SolicitariBlocariAutoViewPage } from './solicitari-blocari-auto-view.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ComponentsModule } from '../../components/components.module';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SolicitariBlocariAutoViewPageRoutingModule,
		TranslateModule,
		FontAwesomeModule,
		ReactiveFormsModule,
		ComponentsModule
	],
	declarations: [SolicitariBlocariAutoViewPage],
	providers: [
		BarcodeScanner,
		NativeGeocoder
	]
})
export class SolicitariBlocariAutoViewPageModule { }
