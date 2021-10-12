import { Injectable } from '@angular/core';

import { LoadingController, AlertController } from '@ionic/angular';


import { TranslateService } from '@ngx-translate/core';

import { StorageService } from './storage.service'

import { helper } from '../../environments/helper'

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
@Injectable({
	providedIn: 'root'
})
export class HelperService {
	public language: any;
	alertLabels: any = {}
	langKey: string = helper.defaultKey + helper.langkey;

	constructor(
		private alertCtrl: AlertController,
		private loadingCtrl: LoadingController,
		public translate: TranslateService,
		private storageService: StorageService,
		private http: HttpClient
	) {
		this.translate.setDefaultLang(helper.defaultLNG);
		// the lang to use, if the lang isn't available, it will use the current loader to get them
		this.translate.use(helper.defaultLNG);

		// set alert box labels
		translate.get('alert').subscribe((alertData: any) => { 
			console.log(alertData, 'translation here???')
			this.alertLabels = alertData 
		})
	}

	// general alert all over the application
	// @title - string
	// @content - string
	// @fatalerror - bool => to show or not supportIT Btn
	async presentAlert(title, content, fatalError = false, customClassAlert = '') {
		let buttons;
		console.log(this.alertLabels.alertSuportITText, 'alerts here')

		if (fatalError) {
			buttons = [
				{
					text: this.alertLabels.alertSuportITText,
					cssClass: 'text-left',
					handler: () => {
						let link = this.alertLabels.suportURL;
						window.open(link)
					}
				},
				{
					text: this.alertLabels.alertCloseBtnText,
					type: 'cancel',
					handler: () => {
						console.log('Cancel clicked')
					}
				}
			]
		} else {
			buttons = [
				{
					text: this.alertLabels.alertCloseBtnText,
					type: 'cancel',
					handler: () => {
						console.log('Cancel clicked')
					}
				}
			]
		}

		const alert = await this.alertCtrl.create({
			cssClass: customClassAlert,
			header: title,
			message: content,
			buttons: buttons
		});
		await alert.present();
	}

	prepareHTTPHeaders () {

		return new Promise((resolve, reject) => {
			const checkTokenNow = Storage.get({ key: helper.tokenKey })
			checkTokenNow.then(async token => {
				if(typeof token.value !== 'undefined' && token.value !== '' && token.value !== null) {
					let headers = new HttpHeaders()
						.set('Content-Type', 'application/json')
						.set('Authorization', `Bearer ${token.value}`)

					resolve({ headers: headers })
				}else {
					reject('No token available')
				}
			})
		})
		

	}
}
