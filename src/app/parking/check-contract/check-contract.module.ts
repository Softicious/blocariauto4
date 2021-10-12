import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CheckContractPageRoutingModule } from './check-contract-routing.module';

import { CheckContractPage } from './check-contract.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		CheckContractPageRoutingModule,
		ReactiveFormsModule,
		TranslateModule,
		FontAwesomeModule
	],
	declarations: [CheckContractPage],
	providers: [
		BarcodeScanner
	]
})
export class CheckContractPageModule { }
