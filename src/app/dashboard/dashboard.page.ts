import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

import { ModalController, MenuController, IonRouterOutlet } from '@ionic/angular';
import { helper } from '../../environments/helper'
import { environment } from '../../environments/environment'
import { TranslateService } from '@ngx-translate/core';

import { HelperService } from '../helper/helper.service'

import * as Sentry from "sentry-cordova";
import { Plugins } from '@capacitor/core';
import { StorageService } from '../helper/storage.service';

import { NotificariService } from '../services/notificari.service'

import { ProfileService } from '../services/profile.service'

import { Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { AuthService } from '../auth/auth.service'
import { ProtectRequestsService } from '../services/protect-requests.service'

const { Device } = Plugins;
@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.page.html',
	styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

	alertLabels: any = {};
	loginPageLabels: any = {};
	loadingScreenText: string = null;
	dashboardPageData: any = {}
	user: any = {}
	settingsPageLabels: any = {}

	showNoMesaje: number = 0;
    noMesaje: string;

	allowPayments: number = 0

	localVersion: string = ''

	loading: any

	pageinitialized: number = 0

	allowBlocariAutoSection : any = {
		bl_s : 0
	}

	constructor(
		private loadingCtrl: LoadingController,
		private router: Router,
		public menu: MenuController,
		public translate: TranslateService,
		private helperService: HelperService,
		private profileService: ProfileService,
		private storageService: StorageService,
    	public modalController: ModalController,
		private routerOutlet: IonRouterOutlet,
		private notificariService: NotificariService,
		private plt: Platform,
		private screenOrientation: ScreenOrientation,

		private protectRequests: ProtectRequestsService,
		private authService: AuthService
	) {
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('dashboardPage').subscribe((data: string) => { this.dashboardPageData = data })
		translate.get('settingsPage').subscribe((data: any) => { this.settingsPageLabels = data })

		this.storageService.getObject(helper.infoKey)
			.then((data : any) => {
				console.log(data, 'user here??')
				this.user = data
			})
			.catch(err => {
				console.log(err, 'error')
			})
	}

	ngOnInit() {
		
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

		this.plt.ready().then(async (res) => {
			try {
				self.screenOrientation.lock(self.screenOrientation.ORIENTATIONS.PORTRAIT);

				// check for requests now, if not => login
				setTimeout(async () => {
					const { status }  = await self.protectRequests.canMakeRequests()
					if(status !== 1) {
						await self.authService.logout();
						self.router.navigateByUrl('/', { replaceUrl: true });
						return false
					}else {
						// console.log('getNumMessagespls')
						self.pageinitialized ++
						self.getNumMessages()
						
						// check device info
						if(environment.production == true) {
							let pltName = (this.plt.is('ios') ? 'ios' : 'android')
							self.setDevice(pltName)
						}
							
					}
				}, 1000)
			}catch (err){
				console.log('not real device', err)
			}
		})
	}


	async setDevice (pltName) {
		var self = this
		const info = await Device.getInfo();
		const appVersion = environment.app.appVersion
		this.localVersion = appVersion
		await this.authService.getVersion(pltName)
		.then(async(res) => {
			if(typeof res.data !== 'undefined' && res.data !== '') {
				if(res.data !== appVersion) {
					const loading = await self.loadingCtrl.create({
						"message": 'Vă rugăm sa actualizați aplicația la ultima versiune.',
						"duration": null
					});
					await loading.present();
					return false
				}else {
					// the version is simmilar, please save device?
					let data = Object.assign({}, {
                        cordova: '7.0.0',
                        isVirtual: info.isVirtual,
                        manufacturer: info.manufacturer,
                        model: info.model,
                        platform: info.platform,
                        serial: '',
                        uuid: info.uuid,
                        version: info.osVersion,
                    }, { app_version: appVersion, required_app_version: res.data })
					self.authService.saveDevice(data)
					.then((res) => {
						console.log('no action, pls advance')
					})
					.catch((err) => {
						if (helper.allowedSentry) {
							Sentry.addBreadcrumb({
								category: "dashboard.setDevice",
								message: "Error on adding a new device to system - exception",
								level: Sentry.Severity.Info,
							});
			
							Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
						}
						return false
					})

					return false
				}
			}
			
		})
		.catch((err) => {
			if (helper.allowedSentry) {
				Sentry.addBreadcrumb({
					category: "dashboard.getVersion",
					message: "Error on checking device info/version - exception",
					level: Sentry.Severity.Info,
				});

				Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
			}
		})
	}


	ionViewWillEnter (): void {
		this.refreshStorageData()
	}

	async refreshStorageData () {
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
					self.allowPayments = response.data.user.allow
					await self.storageService.setObject(helper.infoKey, self.user)
					.then(async (data: any) => {
						// success here ?
						// await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.alertLabels.alertStandardMessageSuccess, false)
						await loading.dismiss();
					})
					.catch(async (err: any) => {
						// add sentry
						if (helper.allowedSentry) {
							Sentry.addBreadcrumb({
								category: "dashboard.refreshStorageData",
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
						category: "dashboard.refreshStorageData",
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
					category: "dashboard.refreshStorageData",
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
					self.allowPayments = response.data.user.allow
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
								category: "dashboard.reloadStorageData",
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
						category: "dashboard.reloadStorageData",
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
					category: "dashboard.reloadStorageData",
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

	async getNumMessages() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.notificariService.getNumNotificari()
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						self.noMesaje = (response.data.total > 99 ? '99+' : response.data.total)
            			self.showNoMesaje = 1
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
							category: "dashboard.getNumMessages.getNumMessages",
							message: "Error on fetching number notificari - else",
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
						category: "dashboard.getNumMessages.getNumMessages",
						message: "Error on fetching num number - exception",
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
