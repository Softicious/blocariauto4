import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { TranslateService } from '@ngx-translate/core';

import { HelperService } from '../../helper/helper.service'

import { helper } from '../../../environments/helper';
import { MenuController } from '@ionic/angular';

import * as Sentry from "sentry-cordova";

import { ProfileService } from '../../services/profile.service'

@Component({
	selector: 'app-profile-password',
	templateUrl: './profile-password.page.html',
	styleUrls: ['./profile-password.page.scss'],
})
export class ProfilePasswordPage implements OnInit {

	alertLabels: any = {}
	loadingScreenText: string = ''
	forgotPageLabels: any = {}
	profilePasswordPageLabels: any = {}

	passwordType: string = 'password';
	passwordIcon: string = 'eye-off';
	passwordConfirmType: string = 'password';
	passwordConfirmIcon: string = 'eye-off';

	regData: FormGroup;

	constructor(
		private alertCtrl: AlertController,
		private loadingCtrl: LoadingController,
		private router: Router,
		public menu: MenuController,
		public translate: TranslateService,
		private helperService: HelperService,
		private profileService: ProfileService,
		private modalController : ModalController
	) {
		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('forgotPage').subscribe((data: any) => { this.forgotPageLabels = data })
		translate.get('profilePasswordPage').subscribe((data: any) => { this.profilePasswordPageLabels = data })
	}

	ngOnInit() {
		this.regData = new FormGroup({
			password: new FormControl('', Validators.compose([
				Validators.compose([
				Validators.minLength(helper.validatorsAccrossApp.minPassword), 
				Validators.maxLength(helper.validatorsAccrossApp.maxPassword), 
				Validators.required])
			])),
			password_confirmation: new FormControl('', Validators.compose([ 
				Validators.compose([
				Validators.minLength(helper.validatorsAccrossApp.minPassword), 
				Validators.maxLength(helper.validatorsAccrossApp.maxPassword), 
				Validators.required])]))
		});
	}

	dismiss(): void {
		this.modalController.dismiss({ index : 0});
	}

	get password() {
		return this.regData.get('password');
	}

	get passwordConfirmation() {
		return this.regData.get('password_confirmation');
	}

	// general stuff
	hideShowPasswordConfirm() {
		this.passwordConfirmType = this.passwordConfirmType === 'text' ? 'password' : 'text';
		this.passwordConfirmIcon = this.passwordConfirmIcon === 'eye-off' ? 'eye' : 'eye-off';
	}

	hideShowPassword() {
		this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
		this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
	}

	async updatePwd() {
		var self = this

		// ================
		// validate form

		// validate passwords
		if (this.regData.value.password == '' || this.regData.value.password.length < 7 || this.regData.value.password.length > 30) {
			// present alert
			await this.helperService.presentAlert(this.alertLabels.alertHeader, this.forgotPageLabels.minMaxPassord, false);
			return false;
		}

		if (this.regData.value.password_confirmation == '' || this.regData.value.password_confirmation.length < 7 || this.regData.value.password_confirmation.length > 30) {
			// present alert
			await this.helperService.presentAlert(this.alertLabels.alertHeader, this.forgotPageLabels.minMaxPasswordConfirmation, false);
			return false;
		}

		if (this.regData.value.password !== this.regData.value.password_confirmation) {
			// present alert
			await this.helperService.presentAlert(this.alertLabels.alertHeader, this.forgotPageLabels.passwordsMissmatch, false);
			return false;
		}

		// end front validation side
		// =========================
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.profileService.changePassword(self.regData.value)
		.then(async (res) => {
			let response = (typeof res.errors !== 'undefined' ? res : res.error)
			if (typeof response.errors !== 'undefined') {
				if (response.errors == false) {
					// everything ok now, we wrap it up now
					// please update object in here
					await loading.dismiss();
					self.modalController.dismiss({ index : 1});
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
						category: "dashboard.settings.changePassword",
						message: "Error on updating password - user - else",
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
					category: "dashboard.settings.changePassword",
					message: "Error on updating password - user - exception",
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
