import { Component, OnInit } from '@angular/core';
import { ParkingService } from '../../services/parking.service'

import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MenuController } from '@ionic/angular';
import { helper } from '../../../environments/helper'

import { TranslateService } from '@ngx-translate/core';

import { HelperService } from '../../helper/helper.service'

import * as Sentry from "sentry-cordova";
import { Plugins } from '@capacitor/core';

import { GlobalService } from '../../services/global.service'
const { Storage } = Plugins;

import { ViewContractPage } from '../view-contract/view-contract.page'
import { ModalController, IonRouterOutlet } from '@ionic/angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
	selector: 'app-check-contract',
	templateUrl: './check-contract.page.html',
	styleUrls: ['./check-contract.page.scss'],
})
export class CheckContractPage implements OnInit {

	form: FormGroup;

	alertLabels: any = {};
	loginPageLabels: any = {};
	loadingScreenText: string = null;

	parkingCheckContractPageLabels: any = {}

	constructor(
		private parkingService: ParkingService,
		private loadingCtrl: LoadingController,
		private router: Router,
		public menu: MenuController,
		public translate: TranslateService,
		private helperService: HelperService,
		private globalService: GlobalService,
		public modalController: ModalController,
		private routerOutlet: IonRouterOutlet,
		private barcodeScanner: BarcodeScanner,
	) { 
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('parkingCheckContractPage').subscribe((data:any) => {this.parkingCheckContractPageLabels = data})
		translate.get('loginPage').subscribe((data:any) => {this.loginPageLabels = data})

	}

	ngOnInit() {
		this.form = new FormGroup({
			nr_auto: new FormControl('', Validators.compose([
				Validators.required,
				Validators.minLength(3),
				Validators.maxLength(15),
			]))
		})
	}

	get nrauto() {
		return this.form.get('nr_auto');
	}

	async checkNumarAutoContract () {
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		if(!this.form.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, self.alertLabels.generalErrMsg, true)
			await loading.dismiss();
			return false;
		}

		var self = this;
		this.parkingService.checkNumarAutoContractActive(this.form.value)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false && typeof response.data !== 'undefined') {
						console.log('success', response.data)


						await loading.dismiss();
						await self.viewContract(response.data)
						return false;

					} else {
						let errorMessage = self.alertLabels.generalErrMsg;
						response.errors.message.forEach(function (msg) {
							errorMessage = msg;
						})
						await self.helperService.presentAlert(self.alertLabels.alertHeader, errorMessage, false)
						await loading.dismiss();
						return false;
					}

				} else {
					// add sentry
					if(helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "parking.checkcontract.checkNumarAutoContract",
							message: "Error on logging user with error - on else",
							level: Sentry.Severity.Info,
						});
		
						Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
					}

					await loading.dismiss();
					await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
					return false
				}

			})
			.catch(async (err) => {
				if(helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "parking.checkcontract.checkNumarAutoContract",
						message: "Error on logging user with error - on exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}

	scanQR () {
		var self = this
		this.barcodeScanner.scan().then(async barcodeData => {
			let input = barcodeData.text
			const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
			await loading.present();

			if(input.length < 5) {
				// we have no correct input here
				await loading.dismiss();
				await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Vă rugăm să reîncercați.', false)
				return false
			}else {
				// make request to post status
			var self = this;
			this.parkingService.checkQRCodeContractActive({qrcode: input})
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false && typeof response.data !== 'undefined') {
						console.log('success', response.data)


						await loading.dismiss();
						await self.viewContract(response.data)
						return false;

					} else {
						let errorMessage = self.alertLabels.generalErrMsg;
						response.errors.message.forEach(function (msg) {
							errorMessage = msg;
						})
						await self.helperService.presentAlert(self.alertLabels.alertHeader, errorMessage, false)
						await loading.dismiss();
						return false;
					}

				} else {
					// add sentry
					if(helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "parking.checkcontract.checkQRCodeContractActive",
							message: "Error on logging user with error - on else",
							level: Sentry.Severity.Info,
						});
		
						Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
					}

					await loading.dismiss();
					await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
					return false
				}

			})
			.catch(async (err) => {
				if(helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "parking.checkcontract.checkQRCodeContractActive",
						message: "Error on logging user with error - on exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})

			}

		}).catch(err => {
			console.log('Error', err);
		});
	}

	async viewContract(contractLocParcare) {
		var self = this
		const modal = await this.modalController.create({
			component: ViewContractPage,
			swipeToClose: true,
			presentingElement: this.routerOutlet.nativeEl,
			componentProps: { contractLocParcare }
		});

		modal.onDidDismiss().then(res => {
			
		})
		return await modal.present();
	}

}
