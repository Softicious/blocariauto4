import { Component, OnInit } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { LoadingController, AlertController } from '@ionic/angular';
import { HelperService } from '../../helper/helper.service'
import { TranslateService } from '@ngx-translate/core';
import { helper } from '../../../environments/helper'
import * as Sentry from "sentry-cordova";
import { StorageService } from '../../helper/storage.service';
import { environment } from '../../../environments/environment';
import { ProfileService } from '../../services/profile.service'

import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { AuthService } from '../../auth/auth.service'
import { ProtectRequestsService } from '../../services/protect-requests.service'

@Component({
	selector: 'app-profile-view',
	templateUrl: './profile-view.page.html',
	styleUrls: ['./profile-view.page.scss'],
})
export class ProfileViewPage implements OnInit {
	user: any = {}
	loadingScreenText: string = '';
	settingsPageLabels: any = {}
	info : any = {}
	alertLabels: any = {}
	loaded: number = 0;

	pageinitialized: number = 0

	constructor(
		private storageService: StorageService,
		private modalController : ModalController,
		private routerOutlet : IonRouterOutlet,
		private profileService: ProfileService,
		public translate: TranslateService,
		private loadingCtrl: LoadingController,
		private helperService: HelperService,

		private router: Router,
		private plt: Platform,
		private protectRequests: ProtectRequestsService,
		private authService: AuthService
	) { 
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('settingsPage').subscribe((data: any) => { this.settingsPageLabels = data })
	}

	ngOnInit() {
		var self = this

		this.plt.ready().then(async (res) => {
			try {

				// check for requests now, if not => login
				setTimeout(async () => {
					const { status }  = await self.protectRequests.canMakeRequests()
					if(status !== 1) {
						await self.authService.logout();
						self.router.navigateByUrl('/', { replaceUrl: true });
						return false
					}else {
						self.pageinitialized++
						self.storageService.getObject(helper.infoKey)
						.then((data: any) => {
							self.loaded = 1
							self.user = data
						})
						.catch(err => {
							console.log('err')
							// if we have problem, please de-auth and login reroute
						})				
					}
				}, 500)
			}catch (err){
				console.log('not real device', err)
			}
		})
	}

	ionViewDidEnter () {
		var self = this
		if(this.pageinitialized > 0)
		this.plt.ready().then(async (res) => {
			try {
				// check for requests now, if not => login
				setTimeout(async () => {
					const { status }  = await self.protectRequests.canMakeRequests()
					if(status !== 1) {
						await self.authService.logout();
						self.router.navigateByUrl('/', { replaceUrl: true });
						return false
					}
				}, 500)
			}catch (err){
				console.log('not real device', err)
			}
		})
	}

	async reloadStorageData() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.profileService.findDetails()
		.then(async(res) => {
			let response = (typeof res.errors !== 'undefined' ? res : res.error)
			if (typeof response.errors !== 'undefined') {
				if (response.errors == false) {
					// everything ok now, we wrap it up now
					// please update object in here
					self.user = response.data.user
					await self.storageService.setObject(helper.infoKey, self.user)
					.then(async (data: any) => {
						// success here ?
						await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.alertLabels.alertStandardMessageSuccess, false)
						await loading.dismiss();
					})
					.catch(async (err: any) => {
						// add sentry
						if (helper.allowedSentry) {
							Sentry.addBreadcrumb({
								category: "dashboard.profileUpdate.reloadStorageData",
								message: `Error on updating user data - user ${self.user.id_user} - storage catch - ` + JSON.stringify(err),
								level: Sentry.Severity.Info,
							});

							Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Critical)
						}
						await self.helperService.presentAlert(self.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true)
						await loading.dismiss();
					})

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
						category: "dashboard.profileUpdate.reloadStorageData",
						message: `Error on updating user data - user ${self.user.id_user} - else`,
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
					category: "dashboard.profileUpdate.reloadStorageData",
					message: `Error on updating user data - user ${self.user.id_user} - exception`,
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
