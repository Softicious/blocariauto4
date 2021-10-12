import { Component, OnInit } from '@angular/core';
import { GestiuneBlocatoareService } from '../../services/gestiune-blocatoare.service'

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

import { ModalController, IonRouterOutlet } from '@ionic/angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { ToastController } from '@ionic/angular';

@Component({
	selector: 'app-gestiune-blocatoare',
	templateUrl: './gestiune-blocatoare.page.html',
	styleUrls: ['./gestiune-blocatoare.page.scss'],
})
export class GestiuneBlocatoarePage implements OnInit {

	form: FormGroup;

	typeActiveScan: string = 'incarca'

	alertLabels: any = {};
	loginPageLabels: any = {};
	loadingScreenText: string = null;

	loaded: number = 0

	numberBlocatoareActive: number = 0
	blocatoareList: any = []


	constructor(
		private gestiuneBlocatoareService: GestiuneBlocatoareService,
		private loadingCtrl: LoadingController,
		private router: Router,
		public menu: MenuController,
		public translate: TranslateService,
		private helperService: HelperService,
		private globalService: GlobalService,
		public modalController: ModalController,
		private routerOutlet: IonRouterOutlet,
		private barcodeScanner: BarcodeScanner,
		public toastController: ToastController
	) {

		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
	}

	ngOnInit() {
		this.form = new FormGroup({
			blocator: new FormControl('', Validators.compose([
				Validators.required,
				Validators.minLength(2),
				Validators.maxLength(15),
			]))
		})

		this.getGestiuneAgent()
	}

	segmentChanged(ev: any) {
		this.typeActiveScan = ev.detail.value
	}

	scanQR() {
		var self = this
		this.barcodeScanner.scan().then(async barcodeData => {
			let input = barcodeData.text
			const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
			await loading.present();

			if (input.length < 5) {
				// we have no correct input here
				await loading.dismiss();
				await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Vă rugăm să reîncercați.', false)
				return false
			} else {
				// make request to post status
				var self = this;
				this.gestiuneBlocatoareService.checkBlocatorAuto(input, this.typeActiveScan)
					.then(async (res) => {
						let response = (typeof res.errors !== 'undefined' ? res : res.error)
						if (typeof response.errors !== 'undefined') {
							if (response.errors == false && typeof response.data !== 'undefined') {
								await loading.dismiss();
								self.getGestiuneAgent()
								await self.presentToast('Blocator ' + this.typeActiveScan + ' cu success')
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
							if (helper.allowedSentry) {
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
						if (helper.allowedSentry) {
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

	get blocator() {
		return this.form.get('blocator')
	}

	async checkBlocatorAuto() {
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		if (!this.form.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, self.alertLabels.generalErrMsg, true)
			await loading.dismiss();
			return false;
		}

		var self = this;
		this.gestiuneBlocatoareService.checkBlocatorAuto(this.form.value.blocator, this.typeActiveScan)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false && typeof response.data !== 'undefined') {
						await loading.dismiss();
						// reset the form please
						self.form.patchValue({
							blocator: ''
						})

						self.getGestiuneAgent()
						await self.presentToast('Blocator ' + this.typeActiveScan + ' cu success')
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
					if (helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "gestiuneblocatoare.checkBlocatorAuto.checkBlocatorAuto",
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
				if (helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "gestiuneblocatoare.checkBlocatorAuto.checkBlocatorAuto",
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

	async getGestiuneAgent() {
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		var self = this;

		this.gestiuneBlocatoareService.getGestiuneUtilizatorBlocatoare()
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false && typeof response.data !== 'undefined') {
						await loading.dismiss();
						// reset the form please
						self.numberBlocatoareActive = response.data.number
						self.blocatoareList = response.data.blocatoare
						self.loaded = 1
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
					if (helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "gestiuneblocatoare.getGestiuneAgent.getGestiuneAgent",
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
				if (helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "gestiuneblocatoare.getGestiuneAgent.getGestiuneAgent",
						message: "Error on logging user with error - on exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				console.log(err)
				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}

	async presentToast(info) {
		const toast = await this.toastController.create({
			message: info,
			duration: 1500,
			color: 'success',
			position: 'top'
		});
		toast.present();
	}
}
