import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController, IonSlides, PopoverController, IonInfiniteScroll, Platform } from '@ionic/angular';

import { MenuController } from '@ionic/angular';
import { helper } from '../../../environments/helper'
import { TranslateService } from '@ngx-translate/core';

import { HelperService } from '../../helper/helper.service'

import * as Sentry from "sentry-cordova";

import { NotificariService } from '../../services/notificari.service'

import { ModalController, IonRouterOutlet } from '@ionic/angular';

import { NotificariViewPage } from '../notificari-view/notificari-view.page'

import { NotificaripopoverComponent } from '../../notificaripopover/notificaripopover.component'

import { SolicitariBlocariAutoViewPage } from '../../parking/solicitari-blocari-auto-view/solicitari-blocari-auto-view.page'

import { AlertController } from '@ionic/angular';

import { ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';


import { ProtectRequestsService } from '../../services/protect-requests.service'
import { AuthService } from '../../auth/auth.service'

@Component({
	selector: 'app-notificari-list',
	templateUrl: './notificari-list.page.html',
	styleUrls: ['./notificari-list.page.scss'],
})
export class NotificariListPage implements OnInit {

	alertLabels: any = {};
	loadingScreenText: string = null;

	records: any = [];
	cat: number = -1;
	mode: number = -1

	loaded: number = 0

	categories: any = [
		{
			id: -1,
			name: 'Toate',
			icon: "check-double"
		}
	]

	page: number = 0
	maxPages: number = 0
	maxPagesLoad: boolean = false

	pageinitialized: number = 0

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

	constructor(
		public modalController: ModalController,
		private routerOutlet: IonRouterOutlet,
		private loadingCtrl: LoadingController,
		private notificariService: NotificariService,
		public menu: MenuController,
		public translate: TranslateService,
		private helperService: HelperService,
		public popoverController: PopoverController,
		public alertController: AlertController,
		public toastController: ToastController,
		private router: Router,
		private route: ActivatedRoute,
		private plt: Platform,
		private protectRequests: ProtectRequestsService,
		private authService: AuthService
	) {
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => {
			this.loadingScreenText = data;
		})
	}

	ngOnInit() {

		// check on activity requests - like a barrier for useless requests
		var self = this

		if (typeof self.router.getCurrentNavigation() !== 'undefined' && self.router.getCurrentNavigation() !== null
			&& typeof self.router.getCurrentNavigation().extras !== 'undefined'
			&& self.router.getCurrentNavigation().extras.state) {
			console.log('open push, me me')
			self.openPushNotification(self.router.getCurrentNavigation().extras.state)
		}

		this.plt.ready().then(() => {
			setTimeout(async () => {
				const { status } = await self.protectRequests.canMakeRequests()
				if (status !== 1) {
					await self.authService.logout();
					self.router.navigateByUrl('/', { replaceUrl: true });
					return false
				} else {
					self.pageinitialized++
					self.getNotificari()
				}
			}, 200)
		})
	}

	ionViewDidEnter() {
		var self = this
		if (this.pageinitialized > 0)
			this.plt.ready().then(async (res) => {
				try {
					// check for requests now, if not => login
					setTimeout(async () => {
						const { status } = await self.protectRequests.canMakeRequests()
						if (status !== 1) {
							await self.authService.logout();
							self.router.navigateByUrl('/', { replaceUrl: true });
							return false
						}
					}, 500)
				} catch (err) {
					console.log('not real device', err)
				}
			})
	}

	async getNotificari() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		this.page = 0
		self.notificariService.getNotificari(this.cat, this.mode, this.page)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						self.records = response.data.records
						self.categories = response.data.categories
						self.loaded = 1

						self.maxPages = response.data.maxPages
						self.maxPagesLoad = response.data.maxPageLoaded
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
							category: "dashboard.notificari.list",
							message: "Error on fetching articles list - else",
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
						category: "dashboard.notificari.list",
						message: "Error on fetching articles list - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}

	filter(catId) {
		this.cat = catId
		this.getNotificari()
	}

	async showMenuItems(ev: any = null) {
		const popover = await this.popoverController.create({
			component: NotificaripopoverComponent,
			componentProps: {
				mode: this.mode
			},
			cssClass: 'notificari-pop-over',
			event: ev,
			mode: 'md',
			translucent: true
		});
		await popover.present();

		// get param passed
		const { data } = await popover.onDidDismiss()
		if ([1, 2, 3, 4].includes(data)) {
			this.mode = data
			if (data == 4) {
				// mark as read all views
				this.mode = -1
				this.presentAlert()
			} else {
				this.getNotificari()
			}
		}
	}

	async presentAlert() {
		var self = this
		const alert = await this.alertController.create({
			cssClass: 'my-custom-class',
			header: 'Confirmați?',
			message: 'Doriți să marcați toate notificările ca și citite?',
			buttons: [
				{
					text: 'Anulați',
					role: 'cancel'
				}, {
					text: 'Confirm',
					handler: () => {
						self.markAsReadNotificari()
					}
				}
			]
		});

		await alert.present();
	}

	async markAsReadNotificari() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.notificariService.markAsRead(this.cat)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						self.getNotificari()
						self.loaded = 1
						await loading.dismiss();
						await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, 'Notificări marcate ca și citite cu succes.')
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
							category: "dashboard.notificari.markAsReadNotificari",
							message: "Error on fetching articles markAsReadNotificari - else",
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
						category: "dashboard.notificari.markAsReadNotificari",
						message: "Error on fetching articles markAsReadNotificari - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}

	loadData(event) {
		var self = this
		self.page++
		setTimeout(async () => {

			const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
			await loading.present();
			self.notificariService.getNotificari(this.cat, this.mode, this.page)
				.then(async (res) => {
					let response = (typeof res.errors !== 'undefined' ? res : res.error)
					if (typeof response.errors !== 'undefined') {
						if (response.errors == false) {
							// everything ok now, we wrap it up now
							response.data.records.forEach((item) => {
								self.records.push(item)
							})
							self.maxPages = response.data.maxPages
							self.maxPagesLoad = response.data.maxPageLoaded
							event.target.complete();
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
								category: "dashboard.notificari.list",
								message: "Error on fetching articles list - else",
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
							category: "dashboard.notificari.list",
							message: "Error on fetching articles list - exception",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
					}

					await loading.dismiss();
					await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
					return false
				})

			// App logic to determine if all data is loaded
			// and disable the infinite scroll
			if (self.maxPagesLoad) {
				event.target.disabled = true;
				self.presentToast()
			}

		}, 500);
	}

	async presentToast() {
		const toast = await this.toastController.create({
			message: 'Nu mai sunt date disponibile',
			duration: 2000
		});
		toast.present();
	}

	async openNotificare(notificare) {
		var self = this
		// switch (notificare.params.module) {
		// 	case 'PaymentsMainPage':
		// 		// redirect to page here
		// 		self.router.navigate(['payments-main']);
		// 		return false
		// 		break;
		// 	default:
		// 		// let it pass pls
		// 		break;
		// }
		// prepare modal here
		let params = {}
		params[notificare.params.module_id_key] = notificare.params.module_id_value
		let modalPage
		switch (notificare.params.module) {
			case 'NotificariViewPage':
			case 'CentruMesaj':
				modalPage = NotificariViewPage
				break;

			case 'SolicitariBlocariAutoViewPage':
				modalPage = SolicitariBlocariAutoViewPage
				break;
			default:
				return false;
				break;
		}

		const modal = await self.modalController.create({
			component: modalPage,
			swipeToClose: true,
			presentingElement: self.routerOutlet.nativeEl,
			componentProps: params
		});
		return await modal.present();
	}

	async openPushNotification(data) {
		var self = this
		// switch (data.module) {
		// 	case 'PaymentsMainPage':
		// 		// redirect to page here
		// 		self.router.navigate(['payments-main']);
		// 		return false
		// 		break;
		// 	default:
		// 		// let it pass pls
		// 		break;
		// }
		// prepare modal here
		let params = {}
		params[data.module_id_key] = data.module_id_value
		let modalPage
		switch (data.module) {
			case 'NotificariViewPage':
			case 'CentruMesaj':
				modalPage = NotificariViewPage
				break;

			case 'SolicitariBlocariAutoViewPage':
				modalPage = SolicitariBlocariAutoViewPage
				break;

			default:
				return false;
				break;
		}

		const modal = await self.modalController.create({
			component: modalPage,
			swipeToClose: true,
			presentingElement: self.routerOutlet.nativeEl,
			componentProps: params
		});
		return await modal.present();
	}
}
