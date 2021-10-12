import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SesizariBlocareAutoAgentPageRoutingModule } from './sesizari-blocare-auto-agent-routing.module';

import { SesizariBlocareAutoAgentPage } from './sesizari-blocare-auto-agent.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { ComponentsModule } from '../../components/components.module';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		SesizariBlocareAutoAgentPageRoutingModule,
		TranslateModule,
		FontAwesomeModule,
		ComponentsModule,
		ReactiveFormsModule
	],
	declarations: [SesizariBlocareAutoAgentPage],
	providers: [
		NativeGeocoder, 
		BarcodeScanner,
		Geolocation
	]
})
export class SesizariBlocareAutoAgentPageModule { }
