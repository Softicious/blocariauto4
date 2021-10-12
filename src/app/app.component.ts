import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { SeoService } from './utils/seo/seo.service';
const { SplashScreen } = Plugins;
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { HistoryHelperService } from './utils/history-helper.service';

import { AuthService } from './auth/auth.service';
import { NavigationExtras, Router } from '@angular/router';

import { helper } from '../environments/helper'
import { environment } from '../environments/environment'
import { StorageService } from '../app/helper/storage.service'

import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Platform } from '@ionic/angular';

import { OneSignal, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { ModalController } from '@ionic/angular'; //IonRouterOutlet

import { NotificariService } from '../app/services/notificari.service'

import { GlobalService } from '../app/services/global.service'

const TOKEN_KEY = helper.tokenKey;

import { JwtHelperService } from '@auth0/angular-jwt';
const helperJWT = new JwtHelperService();

const { Device } = Plugins;
const { Storage } = Plugins;

// import { AnalyticsService } from '../app/services/analytics.service'
import { filter, map, take } from 'rxjs/operators';

import * as Sentry from "sentry-cordova";
import { pluginWarn } from '@ionic-native/core/decorators/common';

// import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: [
		'./side-menu/styles/side-menu.scss',
		'./side-menu/styles/side-menu.shell.scss',
		'./side-menu/styles/side-menu.responsive.scss'
	]
})
export class AppComponent {
	textDir = 'ltr';

	user: any = {}
	name : any  = ''

	signalIdAndroid: string = 'f37d60ce-a5df-4e5e-99ed-96e3cba39114'
	signalIdIOS: string = 'f37d60ce-a5df-4e5e-99ed-96e3cba39114'
	firebaseIdAndroid: string = '678088826521'
	firebaseIdIOS: string = '678088826521'

	signalId: string = null
	firebaseId: string = null

	token_id: string = null
	initPush: any = 0
	pushToken: any = null;
	userId: any = null;

	notificationPending: any = false;

	versionNumber: any = environment.app.appVersion

	// Inject HistoryHelperService in the app.components.ts so its available app-wide
	constructor(
		public translate: TranslateService,
		public historyHelper: HistoryHelperService,
		private seoService: SeoService,
		private authService: AuthService,
		private router: Router,
		private storageService: StorageService,
		private screenOrientation: ScreenOrientation,
		private plt: Platform,

		// push zone
		private oneSignal: OneSignal,
		// private routerOutlet: IonRouterOutlet,

		private globalService: GlobalService,
		// private analyticsService: AnalyticsService,

		private notificariService: NotificariService,

		// private ga: GoogleAnalytics
	) {
		this.initializeApp();
		this.setLanguage();

		this.plt.ready().then(async (res) => {
			try {
				// this.analyticsService.initGA()
				this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

			} catch (err) {
				console.log('not real device')
			}
			const info = await Device.getInfo();
			this.checkAuth()

			try {

				if (this.plt.is('ios')) {
					this.signalId = this.signalIdIOS
					this.firebaseId = this.firebaseIdIOS
				} else if (this.plt.is('android')) {
					this.signalId = this.signalIdAndroid
					this.firebaseId = this.firebaseIdAndroid
				}

			} catch (err) {
				console.log('error on platform ready')
			}
		})
	}

	async initializeApp() {
		var self = this

		this.globalService.getObservable().subscribe((data) => {
			if (data.event == 'user:loggedin') {
				// process stuff here please
				self.getUserData()
				console.log('please retrieve token for onesignal')
				self.retrieveToken()

				if (self.initPush == 0) {
					self.initOneSignal()
					self.initPush += 1
				}

				self.getPushNotificationSaved()

				setTimeout(function () {
					self.updateSignalKeys()
				}, 1500)
			}
		});

		if (self.authService.isAuthenticated.getValue() === true && Object.keys(this.user).length === 0) {
			this.getUserData()
		}

		try {
			await SplashScreen.hide();
		} catch (err) {
			console.log('This is normal in a browser', err);
		}
	}

	// Track an event:
	trackEvent(val) {
	}

	async checkAuth() {
		var self = this
		if (self.initPush == 0) {
			self.initOneSignal()
			self.initPush += 1
		}
	}

	async retrieveToken() {
		const token = await Storage.get({ key: TOKEN_KEY });
		if (token && token.value) {
			const isExpired = helperJWT.isTokenExpired(token.value);
			if (isExpired == false) {
				this.token_id = token.value
			}
		}
	}

	async getUserData() {
		this.storageService.getObject(helper.infoKey)
			.then((data: any) => {
				console.log(data, 'we are here within app.component')
				if (typeof data.name !== 'undefined') {
					this.user = data
					this.name = data.name
				}
			})
			.catch(err => {
				console.log('error on getting user data')
			})
	}

	async getPushNotificationSaved() {
		var self = this
		console.log('get push saved', helper.keyForPushNotification)
		this.storageService.getObject(helper.keyForPushNotification)
			.then((payload: any) => {
				console.log(payload, 'check now payload for push notification')
				if (typeof payload !== 'undefined' && payload !== null && typeof payload.additionalData !== 'undefined') {
					if (self.authService.isAuthenticated.getValue() === true) {
						self.showNotificationPush(payload)
					}
				}
			})
			.catch(err => {
				console.log('error on processing push notification')
			})
	}


	setLanguage() {
		// this language will be used as a fallback when a translation isn't found in the current language
		this.translate.setDefaultLang(helper.defaultLNG);

		// the lang to use, if the lang isn't available, it will use the current loader to get them
		this.translate.use(helper.defaultLNG);

		// this is to determine the text direction depending on the selected language
		// for the purpose of this example we determine that only arabic and hebrew are RTL.
		// this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
		//   this.textDir = (event.lang === 'ar' || event.lang === 'iw') ? 'rtl' : 'ltr';
		// });
	}


	async logout() {
		this.token_id = null

		await this.authService.logout();
		this.router.navigateByUrl('/', { replaceUrl: true });
	}

	initOneSignal() {
		var self = this
		this.plt.ready().then((res) => {
			console.log('ready for init one signal')
			this.signalId = (this.plt.is('ios') ? this.signalIdIOS : this.signalIdAndroid)
			this.firebaseId = (this.plt.is('ios') ? this.firebaseIdIOS : this.firebaseIdAndroid)
			setTimeout(() => {
				console.log('please start the initialize onsignal')
				self.oneSignal.startInit(this.signalId, this.firebaseId);
				self.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);
				// oneSignal.OSInFocusDisplayOption.InAppAlert
				self.oneSignal.handleNotificationReceived().subscribe(data => this.onPushReceived(data.payload));
				self.oneSignal.handleNotificationOpened().subscribe(data => this.onPushOpened(data.notification.payload));

				self.oneSignal.getIds().then(ids => {
					console.log(ids, 'check those keys please')
					self.pushToken = ids.pushToken // a big string
					self.userId = ids.userId // user id One signal
				})

				self.oneSignal.endInit();
			}, 300)
		})
	}

	async onPushReceived(payload: OSNotificationPayload) {
		console.log('push-received')
	}

	onPushOpened(payload: OSNotificationPayload) {
		var self = this
		if (self.authService.isAuthenticated.getValue() === true) {
			self.notificationPending = false
			self.showNotificationPush(payload)
		} else {
			// we save for future usage
			self.storageService.setObject(helper.keyForPushNotification, payload)
		}
	}

	async showNotificationPush(payload) {
		this.storageService.removeItem(helper.keyForPushNotification)
		// let it pass pls
		await this.redirectToPage({
			module: payload.additionalData.module,
			module_id_key: payload.additionalData.module_id_key,
			module_id_value: payload.additionalData.module_id_value
		})
	}

	async redirectToPage(params) {
		let navigationExtras: NavigationExtras = { state: params };
		await this.router.navigate(['notificari-list'], navigationExtras);
	}

	async updateSignalKeys() {
		var self = this
		const deviceInfo = await Device.getInfo()
		console.log(deviceInfo, 'device info here')
		setTimeout(() => {
			let data = {
				pushToken: self.pushToken,
				userId: self.userId,
				device_manufacturer: deviceInfo.manufacturer,
				device_model: deviceInfo.model,
				device_platform: deviceInfo.platform
			}
			console.log(data, 'those are the data prepared for registration')
			// actually, we do not post anything here... because it's just a device registering!!!
			self.registerDevice(data)
		}, 500)
	}

	async registerDevice(params) {
		var self = this
		self.notificariService.registerDevice(params)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				console.log(response, 'from registering this device')
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// success here
						return false;

					} else {
						// console.log(response, 'error here with message')
						return false;
					}

				} else {
					// add sentry
					if (helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "sidemenu.notificari.registerDevice",
							message: "Error on registerDevice - else",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
					}
					return false
				}

			})
			.catch(async (err) => {
				console.log('error from sentry register device .. check pls')
				if (helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "sidemenu.notificari.registerDevice",
						message: "Error on registerDevice - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}
				return false
			})
	}
}

