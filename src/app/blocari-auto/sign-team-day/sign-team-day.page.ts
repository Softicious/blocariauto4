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

@Component({
	selector: 'app-sign-team-day',
	templateUrl: './sign-team-day.page.html',
	styleUrls: ['./sign-team-day.page.scss'],
})
export class SignTeamDayPage implements OnInit {

	alertLabels: any = {};
	loadingScreenText: string = null;

	teamSelected : number = 0
	teamSelectedLabel: string = null
	teamsList: any = []

	loaded : number = 0

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
	) {
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })

	}

	ngOnInit() {
		this.getActivitateDailyUser()
	}


	async getActivitateDailyUser() {
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		
		var self = this
		this.gestiuneBlocatoareService.getActivitateDailyUser()
		.then(async (res) => {
			let response = (typeof res.errors !== 'undefined' ? res : res.error)
			if (typeof response.errors !== 'undefined') {
				if (response.errors == false && typeof response.data !== 'undefined') {
					console.log('success', response.data)
					
					self.teamSelected = response.data.zona_id
					self.teamSelectedLabel = response.data.label
					self.teamsList = response.data.echipe

					self.loaded = 1
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
				if(helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "signteamday.getactivitydailyuser.getActivitateDailyUser",
						message: "Error on getActivitateDailyUser - on else",
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
					category: "signteamday.getactivitydailyuser.getActivitateDailyUser",
					message: "Error on getActivitateDailyUser - on exception",
					level: Sentry.Severity.Info,
				});

				Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
			}

			await loading.dismiss();
			await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
			return false
		})


	}

	async selectTeam(row) {
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		var self = this
		this.gestiuneBlocatoareService.registerActivitateUser(row.id)
		.then(async (res) => {
			let response = (typeof res.errors !== 'undefined' ? res : res.error)
			if (typeof response.errors !== 'undefined') {
				if (response.errors == false && typeof response.data !== 'undefined') {
					
					self.getActivitateDailyUser()
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
				if(helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "signteamday.selectTeam.selectTeam",
						message: "Error on selectTeam - on else",
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
					category: "signteamday.selectTeam.selectTeam",
					message: "Error on selectTeam - on exception",
					level: Sentry.Severity.Info,
				});

				Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
			}

			await loading.dismiss();
			await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
			return false
		})
	}

	async cancelTeam() {
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		var self = this
		this.gestiuneBlocatoareService.unregisterActivitateUser()
		.then(async (res) => {
			let response = (typeof res.errors !== 'undefined' ? res : res.error)
			if (typeof response.errors !== 'undefined') {
				if (response.errors == false && typeof response.data !== 'undefined') {
					self.getActivitateDailyUser()
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
				if(helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "signteamday.selectTeam.selectTeam",
						message: "Error on selectTeam - on else",
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
					category: "signteamday.selectTeam.selectTeam",
					message: "Error on selectTeam - on exception",
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
