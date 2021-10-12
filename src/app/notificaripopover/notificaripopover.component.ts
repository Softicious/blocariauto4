import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PopoverController } from '@ionic/angular';

@Component({
	selector: 'app-notificaripopover',
	templateUrl: './notificaripopover.component.html',
	styleUrls: ['./notificaripopover.component.scss'],
})
export class NotificaripopoverComponent implements AfterViewInit {

	@Input() mode: number
	constructor(
		private modalController: ModalController,
		private popoverController: PopoverController
	) { }

	ngAfterViewInit() { 
		console.log(this.mode, 'check this pls')

	}
	
	dismiss(index: number = 0) {
		this.popoverController.dismiss(index);
	}
}
