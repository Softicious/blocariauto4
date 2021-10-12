import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonSlides, AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { HelperService } from '../../helper/helper.service'
import { TranslateService } from '@ngx-translate/core';
import { helper } from '../../../environments/helper'
import * as Sentry from "sentry-cordova";

import { Platform } from '@ionic/angular';

import { ParkingService } from '../../services/parking.service'

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ImageUploadService, ApiImage } from '../../services/document-upload.service';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { ActionSheetController } from '@ionic/angular';
const { Camera } = Plugins;

import { GoogleMapComponent } from '../../components/google-map/google-map.component';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

import { PrintService } from '../../services/print.service'
import { count } from 'rxjs/operators';

@Component({
	selector: 'app-solicitari-blocari-auto-view',
	templateUrl: './solicitari-blocari-auto-view.page.html',
	styleUrls: ['./solicitari-blocari-auto-view.page.scss'],
})
export class SolicitariBlocariAutoViewPage implements OnInit {
	@Input() solicitareId: number;
	@Input() latInit: number;
	@Input() lonInit: number;

	showedGeolocationAlert : boolean = false
	getLocationProcessed: boolean = true
	link_go : string = "https://www.google.com/maps/place/"
	distance: number = null

	solicitare: any = {}
	alertLabels: any = {};
	loadingScreenText: string = null;
	loaded: number = 0

	showTab: string = 'info';

	identifiedLock: boolean = false

	showSections: any = {
		info: true,
		parcare: false,
		payment: false,
		blocat: false
	}

	infoBoxes: any = {
		2: {
			class: 'bg-deschis',
			label: 'Cerere Preluata',
			icon: 'user'
		},
		4: {
			class: 'bg-rasp-echipa',
			label: 'In asteptare raspuns echipa',
			icon: 'question'
		},
		5: {
			class: 'bg-curs-blocare',
			label: 'In curs de blocare',
			icon: 'car'
		},
		6: {
			class: 'bg-blocat',
			label: 'Blocat',
			icon: 'lock'
		},
		7: {
			class: 'bg-curs-deblocare',
			label: 'In curs deblocare',
			icon: 'car'
		},
		11: {
			class: 'bg-platit',
			label: 'Tarif platit',
			icon: 'credit-card'
		},
		8: {
			class: 'bg-deblocat',
			label: 'Deblocat',
			icon: 'unlock'
		},
		9: {
			class: 'bg-anulat',
			label: 'Cerere Anulata',
			icon: 'times'
		},
		10: {
			class: 'bg-inchis',
			label: 'Cerere Inchisa',
			icon: 'check-double'
		}
	}

	categoriiAuto : any = [
		{
			id: 1,
			label: 'Turism'
		},
		{
			id: 2,
			label: 'SUV'
		},
		{
			id: 3,
			label: 'Microbuz'
		},
		{
			id: 4,
			label: 'Duba'
		},
		{
			id: 5,
			label: 'Camion'
		},
		{
			id: 6,
			label: 'Autobuz'
		},
		{
			id: 7,
			label: 'Rulota'
		},
		{
			id: 8,
			label: 'Autorulota'
		},
		{
			id: 9,
			label: 'Remorca'
		},
		{
			id: 10,
			label: 'Altele'
		}
	]

	parkingTypes: any = [
		{
			id: 1,
			label: 'Electric'
		},
		{
			id: 2,
			label: 'Persoane Dizabilitati'
		},
		{
			id: 3,
			label: 'Shared cars'
		},
		{
			id: 4,
			label: 'Taxi'
		},
		{
			id: 5,
			label: 'Altele'
		}

	]

	sesizareFilesArr: any = []
	blockData: FormGroup;
	deblockData: FormGroup;
	blockedCetateanData: FormGroup;
	fileLabels: any = {}
	images: ApiImage[] = [];
	@ViewChild('fileInput', { static: false }) fileInput: ElementRef;
	loadingElement: any;

	formStepActiuni: number = 0

	locatiiType : any = [
		{
			id: -1,
			label: '-- Alegeti --'
		},
		{
			id: 1,
			label: 'Sector 4'
		},
		{
			id: 2,
			label: 'Extern'
		}
	]

	bluetoothList: any = [];
	selectedPrinter: any;

	constructor(
		private parkingService: ParkingService,
		private modalController: ModalController,
		private loadingCtrl: LoadingController,
		public translate: TranslateService,
		private helperService: HelperService,
		private plt: Platform,
		private alertCtrl: AlertController,


		private api: ImageUploadService,
		private actionSheetCtrl: ActionSheetController,
		// private fileChooser : FileChooser,
		private filePath: FilePath,
		private chooser: Chooser,

		// map stuff
		private loadingController: LoadingController,
		private nativeGeocoder: NativeGeocoder,
		private barcodeScanner: BarcodeScanner,

		private print: PrintService
	) {
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('pageRegister.fileLabels').subscribe((data: any) => {
			this.fileLabels = data
		})
	}

	ngOnInit() {
		this.plt.ready().then(async (res) => {
			console.log('platform ready here', this.solicitareId)
			this.getSolicitareData()
		})

		this.blockData = new FormGroup({
			description: new FormControl('', []),
			nrauto: new FormControl('', Validators.compose([
				Validators.required, Validators.min(1), Validators.min(15)
			])),
			file_description: new FormControl('', []),
			file_description_source: new FormControl('', []),
			file_sources: new FormControl('', []),
			caracatita: new FormControl('', Validators.compose([
				Validators.required, Validators.min(1), Validators.max(30)
			])),
			parking_type: new FormControl(-1, Validators.compose([])),
			categorie_auto: new FormControl(-1, Validators.compose([Validators.required]))
		});

		this.deblockData = new FormGroup({
			description: new FormControl('', []),
			file_description: new FormControl('', []),
			file_description_source: new FormControl('', []),
			file_sources: new FormControl('', []),
			ci_serie:  new FormControl('', []),
			ci_numar:  new FormControl('', []),
			cnp:  new FormControl('', []),
			f_nume :  new FormControl('', []),
			locatie: new FormControl(-1, []),
		});

		this.blockedCetateanData = new FormGroup({
			nume: new FormControl('', Validators.compose([
				Validators.required, Validators.min(1), Validators.max(30)
			])),
			prenume: new FormControl('', Validators.compose([
				Validators.required, Validators.min(1), Validators.max(30)
			])),
			cnp: new FormControl('', Validators.compose([
				// Validators.required
			])),
			telefon: new FormControl('', []),
			email: new FormControl('', []),
			locatie: new FormControl(-1, Validators.compose([
				Validators.required
			])),
			observatii: new FormControl('', []),
			f_nume: new FormControl('', []),
			ci_serie: new FormControl('', Validators.compose([
				Validators.required
			])),
			ci_numar: new FormControl('', Validators.compose([
				Validators.required
			]))
		})
		// this.formStepActiuni = 1

		this.loaded = 1
	}

	get parkingtype() {
		return this.blockData.get('parking_type');
	}

	get categorieAuto() {
		return this.blockData.get('categorie_auto')
	}

	get nrauto() {
		return this.blockData.get('nrauto');
	}

	get caracatita() {
		return this.blockData.get('caracatita');
	}

	get description() {
		return this.blockData.get('description');
	}

	get descriptionDB() {
		return this.deblockData.get('description');
	}

	// cetatean data
	get nume() {
		return this.blockedCetateanData.get('nume')
	}

	get cnp() {
		return this.blockedCetateanData.get('cnp')
	}
	
	get ci_serie() {
		return this.blockedCetateanData.get('ci_serie')
	}
	
	get ci_numar() {
		return this.blockedCetateanData.get('ci_numar')
	}

	get prenume() {
		return this.blockedCetateanData.get('prenume')
	}

	showSection(index) {
		this.showSections[index] = !this.showSections[index]
	}

	async getSolicitareData() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.parkingService.solicitariBlocariAutoFind(this.solicitareId)
			.then(async (res) => {
				console.log(res, 'response')
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						self.solicitare = response.data
						this.loaded = 1

						// self.link_go += self.latInit + "," + self.lonInit
						self.link_go += self.solicitare.lat.toFixed(6) + "," + self.solicitare.lon.toFixed(6)
						if(self.getLocationProcessed) {
							self.distance = Math.round(self.getDistanceFromLatLonInKm(self.solicitare.lat.toFixed(6), self.solicitare.lon.toFixed(6), self.latInit, self.lonInit) * 100) / 100
							console.log(self.distance, 'dist?')
						}
						
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
							category: "solicitareblocari.view.getSolicitare",
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
				console.log(err)
				if (helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "solicitareblocari.view.getSolicitare",
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

	dismiss() {
		this.modalController.dismiss();
	}

	async checkChangeTabNow(event: any) {
	}

	// old functions with updates
	async raspundeEchipa() {
		var self = this
		let alert = await this.alertCtrl.create({
			header: ('Introducere ETA'),
			inputs: [
				{
					name: 'eta',
					placeholder: '30',
					type: 'number',
					min: 1,
					max: 500
				},
				{
					name: 'observatii',
					placeholder: 'Observatii daca sunt',
					type: 'text'
				}
			],
			buttons: [
				{
					text: 'Inchide',
					role: 'cancel',
					handler: data => {
						console.log('Cancel clicked');
					}
				},
				{
					text: 'Save',
					handler: async data => {
						if (data.eta == '' || parseInt(data.eta) <= 0) {
							// no eta presented.. show error
							await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Va rugam sa completati un ETA valabil, in minute.', false)
							return false
						} else {
							// eta presented, show alert from http request
							const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
							await loading.present();

							self.parkingService.solicitareBlocariAutoAddETA(data, self.solicitareId)
								.then(async (res) => {
									let response = (typeof res.errors !== 'undefined' ? res : res.error)
									if (typeof response.errors !== 'undefined') {
										if (response.errors == false && typeof response.data !== 'undefined') {
											await loading.dismiss();
											// show success alert
											await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
											self.getSolicitareData()
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
												category: "solicitareblocari.view.raspundeEchipa",
												message: "Error on raspunde echipa - on else",
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
											category: "solicitareblocari.view.raspundeEchipa",
											message: "Error on raspunde echipa - on exception",
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
				}
			]
		})
		await alert.present();
	}

	// anuleaza first
	async anuleazaSolicitarea() {
		var self = this
		let alert = await this.alertCtrl.create({
			header: ('Introduceti motivul anularii solicitarii'),
			inputs: [
				{
					name: 'observatii',
					placeholder: 'Motiv...',
					type: 'text'
				}
			],
			buttons: [
				{
					text: 'Inchide',
					role: 'cancel',
					handler: data => {
						console.log('Cancel clicked');
					}
				},
				{
					text: 'Save',
					handler: async data => {
						if (data.observatii == '' || data.observatii.length < 3) {
							// no eta presented.. show error
							await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Va rugam sa completati motivul anularii solicitarii.', false)
							return false
						} else {
							// eta presented, show alert from http request
							const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
							await loading.present();

							self.parkingService.solicitareBlocariAutoAnuleaza(data, self.solicitareId)
								.then(async (res) => {
									let response = (typeof res.errors !== 'undefined' ? res : res.error)
									if (typeof response.errors !== 'undefined') {
										if (response.errors == false && typeof response.data !== 'undefined') {
											await loading.dismiss();
											// show success alert
											await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
											self.getSolicitareData()
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
												category: "solicitareblocari.view.anuleazaSolicitarea",
												message: "Error on anulare solicitare - on else",
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
											category: "solicitareblocari.view.anuleazaSolicitarea",
											message: "Error on anulare solicitare - on exception",
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
				}
			]
		})
		await alert.present();
	}

	// block roata!!!
	async blockAuto() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		if (!this.blockData.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Completati toate campurile obligatorii', true)
			await loading.dismiss();
			return false;
		} else if (this.blockData.value.caracatita == '') {
			// problema cu specificarea tipului de loc de parcare
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Completati toate campurile obligatorii - COD Blocator ', false)
			await loading.dismiss();
			return false;
		} else if (self.sesizareFilesArr.length == 0) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Fotografii obligatorii', false)
			await loading.dismiss();
			return false;
		} else {
			// we are ok?
			let object = {
				description: (typeof self.blockData.value.description !== 'undefined' && self.blockData.value.description !== '' ? self.blockData.value.description : null),
				nrauto: self.blockData.value.nrauto,
				caracatita: self.blockData.value.caracatita,
				files: JSON.stringify(self.sesizareFilesArr),
				parking_type: self.blockData.value.parking_type,
				categorie_auto: self.blockData.value.categorie_auto
			}

			self.parkingService.solicitareBlocariAutoBlock(object, self.solicitareId)
				.then(async (res) => {
					let response = (typeof res.errors !== 'undefined' ? res : res.error)
					if (typeof response.errors !== 'undefined') {
						if (response.errors == false && typeof response.data !== 'undefined') {
							await loading.dismiss();
							// show success alert
							await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
							self.getSolicitareData()
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
								category: "solicitareblocari.view.blockAuto",
								message: "Error on block auto - on else",
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
							category: "solicitareblocari.view.blockAuto",
							message: "Error on block auto - on exception",
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

	// payment POS
	async paymentPOS() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		if (this.identifiedLock == false) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Pentru a putea activa plata, va rugam sa scanati codul QR de pe blocator aflat instalat pe roata autovehiculului blocat.', false)
			await loading.dismiss();
			return false;
		} else {
			await loading.dismiss();
			// proceed please
			let alert = await this.alertCtrl.create({
				header: ('Plata prin POS'),
				inputs: [
					{
						name: 'chitanta',
						placeholder: 'Nr bon POS',
						type: 'text'
					},
					{
						name: 'observatii',
						placeholder: 'Observatii/Mentiuni daca sunt',
						type: 'textarea'
					}
				],
				buttons: [
					{
						text: 'Inchide',
						role: 'cancel',
						handler: data => {
							console.log('Cancel clicked');
						}
					},
					{
						text: 'Achita',
						handler: async data => {
							if (data.chitanta == '' || parseInt(data.chitanta) <= 0) {
								// no chitanta presented.. show error
								await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Va rugam sa completati numarul bonului de POS, valabil pe chitanta POS.', false)
								return false
							} else {
								// chitanta presented, show alert from http request
								const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
								await loading.present();

								self.parkingService.solicitareBlocariAuthPayPOS(data, self.solicitareId)
									.then(async (res) => {
										let response = (typeof res.errors !== 'undefined' ? res : res.error)
										if (typeof response.errors !== 'undefined') {
											if (response.errors == false && typeof response.data !== 'undefined') {
												await loading.dismiss();
												// show success alert
												await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
												self.getSolicitareData()
												self.sesizareFilesArr = []
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
													category: "solicitareblocari.view.paymentPOS",
													message: "Error on paymentPOS - on else",
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
												category: "solicitareblocari.view.paymentPOS",
												message: "Error on paymentPOS - on exception",
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
					}
				]
			})
			await alert.present();
		}
	}

	async deblockAuto () {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		if (this.identifiedLock == false) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Pentru a putea activa PV - ul de deblocare auto, va rugam sa scanati codul QR de pe blocator aflat instalat pe roata autovehiculului blocat.', false)
			await loading.dismiss();
			return false;
		} else 
		if (!this.deblockData.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Completati toate campurile obligatorii', true)
			await loading.dismiss();
			return false;
		} else if (self.sesizareFilesArr.length == 0) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Fotografii obligatorii', false)
			await loading.dismiss();
			return false;
		} else {
			// proceed pls
			// we are ok?
			let object = {
				description: (typeof self.deblockData.value.description !== 'undefined' && self.deblockData.value.description !== '' ? self.deblockData.value.description : null),
				files: JSON.stringify(self.sesizareFilesArr),
				ci_serie: self.deblockData.value.ci_serie,
				ci_numar: self.deblockData.value.ci_numar,
				cnp: self.deblockData.value.cnp,
				f_nume: self.deblockData.value.f_nume,
			}

			self.parkingService.solicitareBlocariAutoUnlock(object, self.solicitareId)
				.then(async (res) => {
					let response = (typeof res.errors !== 'undefined' ? res : res.error)
					if (typeof response.errors !== 'undefined') {
						if (response.errors == false && typeof response.data !== 'undefined') {
							await loading.dismiss();
							// show success alert
							await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
							self.getSolicitareData()
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
								category: "solicitareblocari.view.blockAuto",
								message: "Error on block auto - on else",
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
							category: "solicitareblocari.view.blockAuto",
							message: "Error on block auto - on exception",
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


	// file stuff
	async selectImageSource(index) {
		var self = this
		const buttons = [
			{ // camera
				text: self.fileLabels.takePhoto,
				icon: 'camera',
				handler: () => {
					this.addImage(CameraSource.Camera, index);
				}
			},
			{ // gallery
				text: self.fileLabels.galleryPhoto,
				icon: 'image',
				handler: () => {
					this.addImage(CameraSource.Photos, index);
				}
			},
			{ // atach file
				text: self.fileLabels.device,
				icon: 'attach',
				handler: () => {
					// if(self.plt.is('ios')) {
					// 	console.log('ios platform')
					self.getChooserIOS(index)
					// }else {
					// console.log('android platform')
					// self.getChooserAndroid(index)
					// }
				}
			}
		];

		// Only allow file selection inside a browser
		if (!this.plt.is('hybrid')) {
			buttons.push({
				text: 'Choose a File - Desktop',
				icon: 'attach',
				handler: () => {
					this.fileInput.nativeElement.click();
				}
			});
		}

		const actionSheet = await this.actionSheetCtrl.create({
			header: self.fileLabels.toastHeader,
			buttons
		});
		await actionSheet.present();
	}

	async getChooserIOS(index) {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		this.chooser.getFile()
			.then(async file => {
				//   what do we do with filePath
				const ext = file.name.split('.').pop();
				if (!helper.allowedFileTypes.includes(ext.toLowerCase())) {
					// out put response
					await loading.dismiss()
					await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.wrongExtension + ext, true)
					return false
				} else {
					// action upload method
					let mimeType = (ext == 'pdf' ? 'application' : 'image') + '/' + ext

					self.api.transferDocumentBASE64(file.dataURI, file, mimeType, ext)
						.then(async data => {
							if (typeof data.responseCode !== 'undefined' && data.responseCode == 200) {
								// we have success
								// we update the file in our section
								let objToPatch = {}

								let info = JSON.parse(data.response)

								objToPatch[index] = info.data.original_name
								objToPatch[index + '_source'] = JSON.stringify(info.data)

								self.sesizareFilesArr.push(info.data)
								self.blockData.patchValue(objToPatch)

								await loading.dismiss()
								await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.fileLabels.successUpload)

								return false
							} else if (typeof data.errors !== 'undefined') {
								if (data.errors == false) {
									// we have success
									// we update the file in our section
									let objToPatch = {}
									objToPatch[index] = data.data.original_name
									objToPatch[index + '_source'] = JSON.stringify(data.data)
									self.blockData.patchValue(objToPatch)
									self.sesizareFilesArr.push(data.data)

									await loading.dismiss()
									await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.fileLabels.successUpload)

									return false
								} else {
									// error with message

									let errorMessage = self.alertLabels.generalErrMsg;
									data.errors.messages.forEach(function (msg) {
										errorMessage = msg;
									})
									await loading.dismiss()
									await self.helperService.presentAlert(self.alertLabels.alertHeader, errorMessage, true)
									return false;
								}
							} else {
								// general error
								// add sentry
								if (helper.allowedSentry) {
									// please add sentry
									Sentry.addBreadcrumb({
										category: "sesizare.add.getChooserActive",
										message: "Error on getChooserActive - on else - http request",
										level: Sentry.Severity.Info,
									});

									Sentry.captureMessage(JSON.stringify(data), Sentry.Severity.Fatal)
								}
								await loading.dismiss()
								await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
								return false
							}
						})
						.catch(async err => {
							// general error on catch
							// add sentry
							if (helper.allowedSentry) {
								// please add sentry
								Sentry.addBreadcrumb({
									category: "sesizare.add.getChooserActive",
									message: "Error on getChooserActive - on catch - http request",
									level: Sentry.Severity.Info,
								});

								Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
							}
							await loading.dismiss()
							await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
							return false
						})
				}
			})
			.catch(async (error: any) => {
				// can't open file chooser
				// add sentry
				if (helper.allowedSentry) {
					// please add sentry
					Sentry.addBreadcrumb({
						category: "sesizare.add.getChooserActive",
						message: "Error on getChooserActive - on catch - opener",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(error), Sentry.Severity.Critical)
				}
				await loading.dismiss()
				await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failOpenChooser, true, 'red-text')
				return false
			});
	}

	async getChooserAndroid(index) {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		this.chooser.getFile()
			.then(file => {
				let fileURL = file.uri;
				this.filePath.resolveNativePath(fileURL).then(async (filePath) => {
					//   what do we do with filePath
					const ext = filePath.split('.').pop();
					if (!helper.allowedFileTypes.includes(ext.toLowerCase())) {
						// out put response
						await loading.dismiss()
						await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.wrongExtension + ext, true)
						return false
					} else {
						// action upload method
						let mimeType = (ext == 'pdf' ? 'application' : 'image') + '/' + ext
						self.api.transferDocument(filePath, file, mimeType, ext)
							.then(async data => {
								if (typeof data.responseCode !== 'undefined' && data.responseCode == 200) {
									// we have success
									// we update the file in our section
									let objToPatch = {}

									let info = JSON.parse(data.response)

									objToPatch[index] = info.data.original_name
									objToPatch[index + '_source'] = JSON.stringify(info.data)

									self.sesizareFilesArr.push(info.data)
									self.blockData.patchValue(objToPatch)

									await loading.dismiss()
									await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.fileLabels.successUpload)

									return false
								} else if (typeof data.errors !== 'undefined') {
									if (data.errors == false) {
										// we have success
										// we update the file in our section
										let objToPatch = {}
										objToPatch[index] = data.data.original_name
										objToPatch[index + '_source'] = JSON.stringify(data.data)
										self.blockData.patchValue(objToPatch)
										self.sesizareFilesArr.push(data.data)

										await loading.dismiss()
										await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.fileLabels.successUpload)

										return false
									} else {
										// error with message

										let errorMessage = self.alertLabels.generalErrMsg;
										data.errors.messages.forEach(function (msg) {
											errorMessage = msg;
										})
										await loading.dismiss()
										await self.helperService.presentAlert(self.alertLabels.alertHeader, errorMessage, true)
										return false;
									}
								} else {
									// general error
									// add sentry
									if (helper.allowedSentry) {
										// please add sentry
										Sentry.addBreadcrumb({
											category: "sesizare.add.getChooserActive",
											message: "Error on getChooserActive - on else - http request",
											level: Sentry.Severity.Info,
										});

										Sentry.captureMessage(JSON.stringify(data), Sentry.Severity.Fatal)
									}
									await loading.dismiss()
									await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
									return false
								}
							})
							.catch(async err => {
								// general error on catch
								// add sentry
								if (helper.allowedSentry) {
									// please add sentry
									Sentry.addBreadcrumb({
										category: "sesizare.add.getChooserActive",
										message: "Error on getChooserActive - on catch - http request",
										level: Sentry.Severity.Info,
									});

									Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
								}
								await loading.dismiss()
								await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
								return false
							})
					}
				})
					.catch(async err => {
						// general error on catch
						// add sentry
						if (helper.allowedSentry) {
							// please add sentry
							Sentry.addBreadcrumb({
								category: "sesizare.add.getChooserActive",
								message: "Error on getChooserActive - on catch - file resolveNativePath request",
								level: Sentry.Severity.Info,
							});

							Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
						}
						await loading.dismiss()
						await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
						return false
					})
			})
			.catch(async (error: any) => {
				// can't open file chooser
				// add sentry
				if (helper.allowedSentry) {
					// please add sentry
					Sentry.addBreadcrumb({
						category: "sesizare.add.getChooserActive",
						message: "Error on getChooserActive - on catch - opener",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(error), Sentry.Severity.Critical)
				}
				await loading.dismiss()
				await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failOpenChooser, true, 'red-text')
				return false
			});
	}

	emptyFile(index) {
		let objToPatch = {}
		objToPatch[index] = ''
		objToPatch[index + '_source'] = ''
		this.blockData.patchValue(objToPatch)
	}

	emptyFileArr(index) {
		if (this.sesizareFilesArr.hasOwnProperty(index) == true)
			this.sesizareFilesArr.splice(index, 1)
	}

	// method to add PIC from Camera/Gallery
	async addImage(source: CameraSource, index) {
		const image = await Camera.getPhoto({
			quality: 60,
			allowEditing: false,
			resultType: CameraResultType.Base64,
			source
		});

		const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
		const imageName = new Date().getTime();
		// debugger;

		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		var self = this
		this.api.uploadImage(blobData, imageName, image.format)
			.then(async (data) => {
				// do stuff here
				if (typeof data.errors !== 'undefined') {
					if (data.errors == false) {
						// we have success
						// we update the file in our section
						let objToPatch = {}
						objToPatch[index] = data.data.original_name
						objToPatch[index + '_source'] = JSON.stringify(data.data)
						self.blockData.patchValue(objToPatch)
						self.sesizareFilesArr.push(data.data)
						await loading.dismiss()
						await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.fileLabels.successUpload)

						return false
					} else {
						// error with message
						let errorMessage = self.alertLabels.generalErrMsg;
						data.errors.messages.forEach(function (msg) {
							errorMessage = msg;
						})
						await loading.dismiss()
						await self.helperService.presentAlert(self.alertLabels.alertHeader, errorMessage, true)
						return false;
					}
				} else {
					// general error
					// add sentry
					if (helper.allowedSentry) {
						// please add sentry
						Sentry.addBreadcrumb({
							category: "sesizare.add.addImage",
							message: "Error on addImage - on else",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(data), Sentry.Severity.Fatal)
					}

					await loading.dismiss()
					await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
					return false
				}
			})
			.catch(async error => {
				// general error on catch
				// add sentry
				if (helper.allowedSentry) {
					// please add sentry
					Sentry.addBreadcrumb({
						category: "sesizare.add.addImage",
						message: "Error on addImage - on catch",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(error), Sentry.Severity.Critical)
				}
				await loading.dismiss()
				await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
				return false
			});
	}

	// Used for browser direct file upload - DEV
	async uploadFile(event: EventTarget, index) {
		const eventObj: MSInputMethodContext = event as MSInputMethodContext;
		const target: HTMLInputElement = eventObj.target as HTMLInputElement;
		const fileData: File = target.files[0];
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		var self = this
		this.api.uploadImageFile(fileData)
			.then(async (data) => {
				// do stuff here
				if (typeof data.errors !== 'undefined') {
					if (data.errors == false) {
						// we have success
						// we update the file in our section
						let objToPatch = {}
						objToPatch[index] = data.data.original_name
						objToPatch[index + '_source'] = JSON.stringify(data.data)
						self.blockData.patchValue(objToPatch)
						self.sesizareFilesArr.push(data.data)
						await loading.dismiss()
						await self.helperService.presentAlert(self.alertLabels.alertHeaderSuccess, self.fileLabels.successUpload)

						return false
					} else {
						// error with message
						let errorMessage = self.alertLabels.generalErrMsg;
						data.errors.messages.forEach(function (msg) {
							errorMessage = msg;
						})
						await loading.dismiss()
						await self.helperService.presentAlert(self.alertLabels.alertHeader, errorMessage, true)
						return false;
					}
				} else {
					// general error
					// add sentry
					if (helper.allowedSentry) {
						// please add sentry
						Sentry.addBreadcrumb({
							category: "sesizare.add.uploadFile",
							message: "Error on uploadFile - on else",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(data), Sentry.Severity.Fatal)
					}
					await loading.dismiss()
					await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
					return false
				}
			})
			.catch(async error => {
				// general error on catch
				// add sentry
				if (helper.allowedSentry) {
					// please add sentry
					Sentry.addBreadcrumb({
						category: "sesizare.add.uploadFile",
						message: "Error on uploadFile - on catch",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(error), Sentry.Severity.Critical)
				}
				await loading.dismiss()
				await self.helperService.presentAlert(self.alertLabels.alertHeader, self.fileLabels.failUpload, true)
				return false
			});
	}


	// Helper function
	// https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
	b64toBlob(b64Data, contentType = '', sliceSize = 512) {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, { type: contentType });
		return blob;
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

			await self.parkingService.solicitareBlocariAutoCheckQRCode(input, self.solicitare.current_status)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						// success

						// we have 2 cases:
						// current_status == 5 | 7 => we need to estimate a time to lock | unlock the car

						// current_status == 6 => we need to unlock the car and insert the agent the information
						switch (self.solicitare.current_status) {
							case 6:
								self.formStepActiuni = 1
								break;

							case 5:
								self.identifiedLock = true
								self.blockData.patchValue({
									caracatita: input
								})
								break
							case 7:
								self.identifiedLock = (response.data.id == self.solicitare.id)
								self.blockData.patchValue({
									caracatita: input
								})
								break;

							case 11:
								console.log('here pls.. thx')
								self.identifiedLock = true
								break;

							default:
								// do nothing here pls
								break;
						}

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
							category: "solicitareblocari.view.scanQRBlocator",
							message: "Error on fetching view scanQRBlocator " + JSON.stringify(barcodeData) + " -  else",
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
						category: "solicitareblocari.view.scanQRBlocator",
						message: "Error on fetching view scanQRBlocator " + JSON.stringify(barcodeData) + " - exception",
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

	async fillCetateanData() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();

		if (!this.blockedCetateanData.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Completati toate campurile obligatorii', true)
			await loading.dismiss();
			return false;
		}

		// prepare object data
		let object = {
			cetateanData: JSON.stringify(self.blockedCetateanData.value),
			files: JSON.stringify(self.sesizareFilesArr),
		}

		self.parkingService.solicitareBlocariAutoAddCetateanBlocat(object, self.solicitareId)
				.then(async (res) => {
					let response = (typeof res.errors !== 'undefined' ? res : res.error)
					if (typeof response.errors !== 'undefined') {
						if (response.errors == false && typeof response.data !== 'undefined') {
							await loading.dismiss();
							// show success alert
							await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
							self.getSolicitareData()
							self.formStepActiuni = 0
							self.sesizareFilesArr = []
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
								category: "solicitareblocari.view.solicitareBlocariAutoAddCetateanBlocat",
								message: "Error on unlock auto - on else",
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
							category: "solicitareblocari.view.solicitareBlocariAutoAddCetateanBlocat",
							message: "Error on unlock auto - on exception",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
					}

					await loading.dismiss();
					await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
					return false
				})

	}

	async updateNameCetatean() {
		var self = this
		let alert = await this.alertCtrl.create({
			header: ('Actualizare Nume Cetatean'),
			inputs: [
				{
					name: 'nume',
					placeholder: '...',
					value: self.solicitare.cetateanBlocat.nume,
					type: 'text'
				},
				{
					name: 'prenume',
					placeholder: '...',
					value: self.solicitare.cetateanBlocat.prenume,
					type: 'text'
				}
			],
			buttons: [
				{
					text: 'Inchide',
					role: 'cancel',
					handler: data => {
						console.log('Cancel clicked');
					}
				},
				{
					text: 'Actualizeaza',
					handler: async data => {
						if (data.nume == '' || data.prenume == '') {
							// no chitanta presented.. show error
							await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Va rugam sa completati numele si prenumele cetateanului. Campuri obligatorii', false)
							return false
						} else {

							// save to server
							// solicitareBlocariAutoUpdateDetailsCetateanBlocat

							// chitanta presented, show alert from http request
							const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
							await loading.present();

							self.parkingService.solicitareBlocariAutoUpdateDetailsCetateanBlocat(data, self.solicitareId)
								.then(async (res) => {
									let response = (typeof res.errors !== 'undefined' ? res : res.error)
									if (typeof response.errors !== 'undefined') {
										if (response.errors == false && typeof response.data !== 'undefined') {
											await loading.dismiss();
											// show success alert
											await self.helperService.presentAlert(self.alertLabels.alertHeader, 'Solicitare actualizata cu success', false)
											self.getSolicitareData()
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
												category: "solicitareblocari.view.updateNameCetatean",
												message: "Error on updateNameCetatean - on else",
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
											category: "solicitareblocari.view.updateNameCetatean",
											message: "Error on updateNameCetatean - on exception",
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

				}
			]
		})

		await alert.present();
	}

	printPV() {
		var self = this
		console.log('print stuff here pls')
		//The text that you want to print
		var myText = "Hello hello hello \n\n\n This is a test \n\n\n";

		if(self.bluetoothList.length == 0) {
			self.listPrinter()

			setTimeout(function() {
				if(self.bluetoothList.length > 0) {
					self.selectPrinter(self.bluetoothList[0].id)
				}
			},100)
		}

		setTimeout(function() {
			self.print.sendToBluetoothPrinter(self.selectedPrinter, myText);
		},200)
	}

	async printPVDeblocare () {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		self.parkingService.solicitareBlocariAutoPrintPV(this.solicitareId)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						let stringToPrint = response.data.printstr

						console.log(stringToPrint)

						// prepare connection to BLPrinter
						if(self.bluetoothList.length == 0) {
							self.listPrinter()
				
							setTimeout(function() {
								if(self.bluetoothList.length > 0) {
									self.selectPrinter(self.bluetoothList[0].id)
								}
							},100)
						}
				
						setTimeout(function() {
							self.print.sendToBluetoothPrinter(self.selectedPrinter, stringToPrint);
						},200)
						
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
							category: "solicitareblocari.view.printPVDeblocare",
							message: "Error on fetching printPVDeblocare #${this.mesajId} - else",
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
				console.log(err)
				if (helper.allowedSentry) {
					Sentry.addBreadcrumb({
						category: "solicitareblocari.view.printPVDeblocare",
						message: "Error on fetching printPVDeblocare #${this.mesajId} - exception",
						level: Sentry.Severity.Info,
					});

					Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
				}

				await loading.dismiss();
				await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true);
				return false
			})
	}

	listPrinter() {
		this.print.searchBluetoothPrinter()
			.then(resp => {
				console.log(resp, 'serach bl')
				//List of bluetooth device list
				this.bluetoothList = resp;
			}, err => {
				console.log('no printers found', err)
			});
	}

	//This will store selected bluetooth device mac address
	selectPrinter(macAddress) {
		console.log(macAddress, 'mac address here on select printer??')
		//Selected printer macAddress stored here
		this.selectedPrinter = macAddress;
	}
}
