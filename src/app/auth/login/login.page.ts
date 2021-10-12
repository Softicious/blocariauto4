import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
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

@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {
	
	form: FormGroup;
	passwordType: string = 'password';
	passwordIcon: string = 'eye-off';
	alertLabels: any = {};
	loginPageLabels: any = {};
	loadingScreenText: string = null;

	public step: any = 1;
	forgotPageLabels: any = {};
	codeInput: any = null;

	constructor(
		private authService: AuthService,
		private loadingCtrl: LoadingController,
		private router: Router,
		public menu: MenuController,
		public translate: TranslateService,
		private helperService: HelperService,
		private globalService: GlobalService
	) {

		// set alert box labels
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('forgotPage').subscribe((data:any) => {this.forgotPageLabels = data})
		translate.get('loginPage').subscribe((data:any) => {this.loginPageLabels = data})
	}

	ionViewDidLoad(): void {
		// check token please
		this.checkTokenAuth()
	}
	// Disable side menu for this page
	ionViewDidEnter(): void {
		this.menu.enable(false);

		// get form stuff && update data
		const checkMe = Storage.get({key: helper.keyForStorage + "saveme"})
		checkMe.then(isTrue => {
			if(typeof isTrue.value !== 'undefined' && isTrue.value) {
				// check email
				const checkEmail = Storage.get({key: helper.keyForStorage + "email"})
				checkEmail.then(data => {
					this.form.patchValue({
						email: data.value
					})
				})

				// check password
				const checkPassword = Storage.get({key: helper.keyForStorage + "password"})
				checkPassword.then(data => {
					this.form.patchValue({
						password: data.value
					})
				})

				this.form.patchValue({
					saveme: true
				})
			}else {
				this.form.patchValue({
					saveme: false
				})
			}
		})
	}

	async checkTokenAuth() {
		// check now token
		// inside this function, we do not output anything. We just do it like in the background
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		const checkTokenNow = Storage.get({key: helper.tokenKey})
		checkTokenNow.then(async token => {
			if(token.value !== null && token.value !== '') {
				// check token for refresh?
				self.authService.refreshToken(token.value)
					.then(async (res) => {
						// success?
						let response = (typeof res.status_code !== 'undefined' ? res : res.error)
						if (typeof response.status_code !== 'undefined') {
							if (response.status_code == 200 && typeof response.data.token !== 'undefined') {
								// everything ok now, we wrap it up now
								self.authService.setToken(response.data.token)
								await Storage.set({ key: helper.tokenKey, value: response.data.token })
								

								// get details about user please, then redirect with auth data
								// mage request to get user details and save to storage
								await self.authService.findDetails().then(async(data) => {
									let responseData = (typeof data.status_code !== 'undefined' ? data : data.error)
									if (typeof responseData.status_code !== 'undefined') {
										if (responseData.status_code == 200 && typeof responseData.data.user !== 'undefined') {

											await Storage.set({ key: helper.infoKey, value: JSON.stringify(responseData.data.user) })

											self.authService.setAuthenticatedNext(true);
											// set authenticated and redirect
											self.menu.enable(true);

											setTimeout(function() {
												// emit event
												self.globalService.publishSomeData({
													event: 'user:loggedin'
												})
												self.router.navigateByUrl('/dashboard', { replaceUrl: true });
											},150)
											
											
											await loading.dismiss();
											return false;


										}else {
											// do nothing
											await loading.dismiss();
											return false;
										}

									}else {
										// do nothing
										await loading.dismiss();
										return false;
									}
								})
								.catch(async (err) => {
									await loading.dismiss();
									return false;
								})
								// end get details

							} else {
								// do not output a thing
								await loading.dismiss();
								return false;
							}

						} else {
							// add sentry
							if(helper.allowedSentry) {
								Sentry.addBreadcrumb({
									category: "auth.login.checkTokenAuth",
									message: "Error on logging user with error checkTokenAuth - on else",
									level: Sentry.Severity.Info,
								});
				
								Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
							}

							await loading.dismiss();
							// do not output a thing
							// await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
							return false
						}
					})
					.catch( async (err) => {
						if(helper.allowedSentry) {
							Sentry.addBreadcrumb({
								category: "auth.login.checkTokenAuth",
								message: "Error on logging user with error checkTokenAuth - on exception",
								level: Sentry.Severity.Info,
							});
		
							Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
						}
		
						await loading.dismiss();
						// await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
						return false
					})


			}else {
				console.log('no token here')
				await loading.dismiss()
			}
		})
	}

	// Restore to default when leaving this page
	ngOnInit() {
		this.form = new FormGroup({
			email: new FormControl('', Validators.compose([
				Validators.required,
				Validators.pattern(helper.emailRegex),
				Validators.email,
			])),
			password: new FormControl('', Validators.compose([
				Validators.required,
				Validators.minLength(helper.validatorsAccrossApp.minPassword),
				Validators.maxLength(helper.validatorsAccrossApp.maxPassword)
			])),
			saveme: new FormControl(false, [])
		})
	}

	async onSubmit() {

		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		if(!this.form.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, self.alertLabels.generalErrMsg, true)
			await loading.dismiss();
			return false;
		}else if(this.form.value.saveme) {
			// add to storage
			await Storage.set({key: helper.keyForStorage + "saveme", value: "true" })
			await Storage.set({key: helper.keyForStorage + "email", value: this.form.value.email })
			await Storage.set({key: helper.keyForStorage + "password", value: this.form.value.password })
		}else if (!this.form.value.saveme)  {
			// remove from storage
			await Storage.remove({key: helper.keyForStorage + "saveme"})
			await Storage.remove({key: helper.keyForStorage + "email"});
			await Storage.remove({key: helper.keyForStorage + "password"});
		}

		var self = this;
		this.authService.login(this.form.value)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false && typeof response.data.token !== 'undefined') {
						
						// everything ok now, we wrap it up now
						self.authService.setToken(response.data.token)
						await Storage.set({ key: helper.tokenKey, value: response.data.token })
						await Storage.set({ key: helper.infoKey, value: JSON.stringify(response.data.user) })
						self.authService.setAuthenticatedNext(true);
						// set authenticated and redirect

						// emit event
						self.globalService.publishSomeData({
							event: 'user:loggedin'
						})

						self.menu.enable(true);

						setTimeout(() => {
							self.router.navigateByUrl('/dashboard', { replaceUrl: true });	
						}, 150);
						
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
							category: "auth.login.onSubmit",
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
				if(helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "auth.login.onSubmit",
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

	// Easy access for form fields
	get email() {
		return this.form.get('email');
	}

	get password() {
		return this.form.get('password');
	}

	hideShowPassword() {
		this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
		this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
	}



}
