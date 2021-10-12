import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewContractPageRoutingModule } from './view-contract-routing.module';

import { ViewContractPage } from './view-contract.page';

import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ViewContractPageRoutingModule,
		TranslateModule,
		FontAwesomeModule
	],
	declarations: [ViewContractPage]
})
export class ViewContractPageModule { }
