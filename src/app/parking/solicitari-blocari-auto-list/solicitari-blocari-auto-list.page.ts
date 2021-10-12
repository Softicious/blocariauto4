import { Component, OnInit, ViewChild } from '@angular/core';
import { LoadingController, IonSlides, PopoverController, IonInfiniteScroll, Platform } from '@ionic/angular';

import { MenuController } from '@ionic/angular';
import { helper } from '../../../environments/helper'
import { TranslateService } from '@ngx-translate/core';

import { HelperService } from '../../helper/helper.service'

import * as Sentry from "sentry-cordova";

import { NotificariService } from '../../services/notificari.service'

import { ModalController, IonRouterOutlet } from '@ionic/angular';

import { SolicitariBlocariAutoViewPage } from '../solicitari-blocari-auto-view/solicitari-blocari-auto-view.page'

import { NotificaripopoverComponent } from '../../notificaripopover/notificaripopover.component'

import { AlertController } from '@ionic/angular';

import { ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { ProtectRequestsService } from '../../services/protect-requests.service'
import { AuthService } from '../../auth/auth.service'

import { ParkingService } from '../../services/parking.service'


import { SolicitariBlocariAutoListFiltersPage } from '../solicitari-blocari-auto-list-filters/solicitari-blocari-auto-list-filters.page'
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { SesizariBlocareAutoAgentPage } from '../../sesizari/sesizari-blocare-auto-agent/sesizari-blocare-auto-agent.page'

import { SesizareService } from '../../services/sesizare.service'

import { Plugins } from '@capacitor/core';
// const { Geolocation } = Plugins;
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
	selector: 'app-solicitari-blocari-auto-list',
	templateUrl: './solicitari-blocari-auto-list.page.html',
	styleUrls: ['./solicitari-blocari-auto-list.page.scss'],
})
export class SolicitariBlocariAutoListPage implements OnInit {

	alertLabels: any = {};
	loadingScreenText: string = null;

	records: any = [];
	cat: number = -1;
	mode: number = -1
	nrAuto: string = ''

	loaded: number = 0

	page: number = 0
	maxPages: number = 0
	maxPagesLoad: boolean = false

	pageinitialized: number = 0

	@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

	latInit: number
	lonInit: number
	getLocationProcessed: boolean = true
	showedGeolocationAlert : boolean = false

	allowBlocariAutoSection : any = {
		bl_s : 0
	}

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
		private authService: AuthService,

		private parkingService: ParkingService,
		private barcodeScanner: BarcodeScanner,
		private sesizareService : SesizareService,

		// new geolocation stuff/module
		private geolocation: Geolocation,
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
		this.plt.ready().then(() => {
			setTimeout(async() => {
				const { status }  = await self.protectRequests.canMakeRequests()
					if(status !== 1) {
						await self.authService.logout();
						self.router.navigateByUrl('/', { replaceUrl: true });
						return false
					}else {
						self.pageinitialized++

						const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
						await loading.present();

						// take position, for geolocating
						this.geolocation.getCurrentPosition().then(position => {
							this.latInit = position.coords.latitude
							this.lonInit = position.coords.longitude
							this.getLocationProcessed = true

							loading.dismiss()
							self.getSolicitari()
							self.getStatusAccessBlocareAuto()

						}).catch((error) => {
							// if we have error on getting location, please exit here!!!
							if(!self.showedGeolocationAlert) {
								self.showedGeolocationAlert = true	
								self.helperService.presentAlert(self.alertLabels.alertHeader, 'Pentru afișarea distanței, este necesară activarea geolocației', false)
							}
							
						})
						// .finally(async () => {
							
						// });

						self.route.queryParams.subscribe(params => {
							if (typeof self.router.getCurrentNavigation() !== 'undefined' && self.router.getCurrentNavigation() !== null
							&& typeof self.router.getCurrentNavigation().extras !== 'undefined' 
							&& self.router.getCurrentNavigation().extras.state)  {
								// self.openPushNotification(self.router.getCurrentNavigation().extras.state)
							}	
						});
					}
			},200)
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


	async getSolicitari() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		this.page = 0
		self.parkingService.solicitariBlocariAutoList(this.cat, this.mode, this.page, this.nrAuto)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						self.records = response.data.records

						self.records.map((row) => {
						// 	row.distance = null
							if(self.getLocationProcessed)
								row.distance = Math.round(self.getDistanceFromLatLonInKm(self.latInit.toFixed(6), self.lonInit.toFixed(6), row.lat.toFixed(6), row.lon.toFixed(6)) * 100) / 100

							row.link_go = "https://www.google.com/maps/place/" + row.lat + "," + row.lon
						})
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
							category: "dashboard.solicitariblocariauto.list",
							message: "Error on fetching solicitari blocari auto list - else",
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
						category: "dashboard.solicitariblocariauto.list",
						message: "Error on fetching solicitari blocari auto list - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}

	// helpfull functions
	deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

	getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var self = this

        var R = 6371; // Radius of the earth in km
        var dLat = self.deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = self.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(self.deg2rad(lat1)) * Math.cos(self.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

	filter(catId) {
		this.cat = catId
		this.getSolicitari()
	}

	refreshData() {
		this.page = 0
		this.pageinitialized = 0
		this.maxPages = 0
		this.maxPagesLoad = false
		this.getSolicitari()
	}

	loadData(event) {
		var self = this
		self.page++
		setTimeout(async () => {

			const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
			await loading.present();
			self.parkingService.solicitariBlocariAutoList(this.cat, this.mode, this.page, this.nrAuto)
				.then(async (res) => {
					let response = (typeof res.errors !== 'undefined' ? res : res.error)
					if (typeof response.errors !== 'undefined') {
						if (response.errors == false) {
							// everything ok now, we wrap it up now
							response.data.records.forEach((item) => {

								item.distance = null
								if(self.getLocationProcessed)
									item.distance = Math.round(self.getDistanceFromLatLonInKm(self.latInit.toFixed(6), self.lonInit.toFixed(6), item.lat, item.lon) * 100) / 100
		
								item.link_go = "https://www.google.com/maps/place/" + item.lat + "," + item.lon

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

	// filters page open
	async showFilters () {
		const modal = await this.modalController.create({
			component: SolicitariBlocariAutoListFiltersPage,
			componentProps: {
				catId: this.cat,
				modId: this.mode,
				nrAuto: this.nrAuto
			},
			cssClass: 'notificari-pop-over',
		});
		await modal.present();

		modal.onDidDismiss().then(res => {
			if(typeof res.data !== 'undefined') {
				console.log(res.data, 'info here')
				this.cat = res.data.catId
				this.mode = res.data.modId
				this.nrAuto = res.data.nrAuto
				this.page = 0
				this.maxPages = 0
				this.maxPagesLoad = false
				this.pageinitialized = 0
				setTimeout(() => {
					this.getSolicitari()
				},100)
				
			}
		})
		
	}

	outputNumFiltersActive () {
		let num = 0;

		if(this.cat > -1)
			num++

		if(this.mode > -1)
			num++

		if(this.nrAuto !== '')
			num++

		return num
	}

	async openSolicitare (solicitareId) {
		var self = this
		const modal = await this.modalController.create({
			component: SolicitariBlocariAutoViewPage,
			componentProps: {
				solicitareId,
				latInit: self.latInit,
				lonInit: self.lonInit,
			}
		});
		await modal.present();

		modal.onDidDismiss().then(res => {
			self.getSolicitari()
		})
	}

	async scanQRBlocator () {
		var self = this
		this.barcodeScanner.scan().then(async barcodeData => {
			let input = barcodeData.text

			const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
			await loading.present();

			if(input.length < 3) {
				// we have no correct input here
				await loading.dismiss();
				await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Vă rugăm să reîncercați.', false)
				return false
			}

			await self.parkingService.solicitareBlocariAutoCheckQRCode(input, 7)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						// success
						let solicitareId = response.data.id
						await this.openSolicitare(solicitareId)
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
							category: "solicitareblocari.list.scanQRBlocator",
							message: "Error on fetching list scanQRBlocator " + JSON.stringify(barcodeData) + " -  else",
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
						category: "solicitareblocari.list.scanQRBlocator",
						message: "Error on fetching list scanQRBlocator " + JSON.stringify(barcodeData) + " - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}
				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})


		}).catch(err => {
			console.log('Error', err);
		});
	}

	async sesizareNewBlocareAutoSpecialOpen() {
		const modal = await this.modalController.create({
			component: SesizariBlocareAutoAgentPage,
			swipeToClose: true,
			presentingElement: this.routerOutlet.nativeEl,
			componentProps: {}
		});

		modal.onDidDismiss().then(async res => {
			if(typeof res.data !== 'undefined' && typeof res.data.index !== 'undefined' ) {
				switch (res.data.index) {
					case 1:
						// success
						if(typeof res.data.id !== 'undefined' && res.data.id > 0) {
							await this.helperService.presentAlert(this.alertLabels.alertHeaderSuccess, 
								'Solicitarea de blocare auto cu numarul ' + res.data.id + ' a fost salvata cu success', false);

							// redirect on opening the solicitare now!!!
							await this.openSolicitare(res.data.id);
						}
							
						break;

					case 2: 
						if( typeof res.data.msg !== 'undefined' && res.data.msg !== '')
							await this.helperService.presentAlert(this.alertLabels.alertHeader, res.data.msg, true);
						// error
						break;

					default:
						// do nothing
						break;

				}
			}
		})

		return await modal.present();
	}

	async getStatusAccessBlocareAuto() {
		var self = this
		// const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		// await loading.present();
		self.sesizareService.getStatusAccessBlocareAuto()
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						self.allowBlocariAutoSection = response.data
						return false;

					} else {
						let errorMessage = self.alertLabels.generalErrMsg;
						response.errors.message.forEach(function (msg) {
							errorMessage = msg;
						})
						return false;
					}

				} else {
					// add sentry
					if (helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "dashboard.getStatusAccessBlocareAuto",
							message: "Error on fetching access blocari auto - else",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
					}

					// await loading.dismiss();
					// await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
					return false
				}

			})
			.catch(async (err) => {
				if (helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "dashboard.getStatusAccessBlocareAuto",
						message: "Error on fetching access blocari auto - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				// await loading.dismiss();
				// await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}
}
