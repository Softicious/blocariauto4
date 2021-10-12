import { Component, Input, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { HelperService } from '../../helper/helper.service'
import { TranslateService } from '@ngx-translate/core';
import { helper } from '../../../environments/helper'
import * as Sentry from "sentry-cordova";

import { NotificariService } from '../../services/notificari.service'

@Component({
	selector: 'app-notificari-view',
	templateUrl: './notificari-view.page.html',
	styleUrls: ['./notificari-view.page.scss'],
})
export class NotificariViewPage implements AfterViewInit {

	@Input() mesajId: number;
	mesaj: any = null;
    loading: any;
    loaded: any = 0;
    viewData: any = 1;
    gallery: any = [];

	alertLabels: any = {};
	loadingScreenText: string = null;

	slidesOptions: any = {
		zoom: {
		  toggle: false // Disable zooming to prevent weird double tap zomming on slide images
		}
	};
	@ViewChild(IonSlides, { static: false }) slides: IonSlides;

	constructor(
		private modalController: ModalController,
		private loadingCtrl: LoadingController,
		public translate: TranslateService,
		private helperService: HelperService,
		private notificariService : NotificariService
	) {
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })

	 }

	ngAfterViewInit() {
		this.getNotificare()
	}

	closeSlide() {
		this.viewData = 1
	}

	showSlide(index) {
		var self = this
		self.viewData = 0
		setTimeout(function () {
			self.slides.slideTo(index);
		}, 150)
	}

	dismiss() {
		this.modalController.dismiss();
	}

	async getNotificare() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.notificariService.getNotificare(this.mesajId)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						self.mesaj = response.data
						this.loaded = 1
						await loading.dismiss();
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
							category: "notificare.view.getNotificare",
							message: "Error on fetching notificare one #${this.mesajId} - else",
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
						category: "notificare.view.getNotificare",
						message: "Error on fetching notificare one #${this.mesajId} - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}
}
