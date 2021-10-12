import { Component, Input, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-view-contract',
	templateUrl: './view-contract.page.html',
	styleUrls: ['./view-contract.page.scss'],
})
export class ViewContractPage implements AfterViewInit {

	@Input() contractLocParcare: any = {};
	alertLabels: any = {};

	constructor(
		private modalController: ModalController,
		public translate: TranslateService,
	) {
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
	}

	ngAfterViewInit() {
	}

	dismiss() {
		this.modalController.dismiss();
	}
}
