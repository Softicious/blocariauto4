import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestiuneBlocatoarePageRoutingModule } from './gestiune-blocatoare-routing.module';

import { GestiuneBlocatoarePage } from './gestiune-blocatoare.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		GestiuneBlocatoarePageRoutingModule,
		FontAwesomeModule,
		TranslateModule,
		ReactiveFormsModule
	],
	declarations: [GestiuneBlocatoarePage],
	providers: [BarcodeScanner]
})
export class GestiuneBlocatoarePageModule { }
