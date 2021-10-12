import { Component, Input, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoadingController, AlertController } from '@ionic/angular';
import { HelperService } from '../../helper/helper.service'
import { TranslateService } from '@ngx-translate/core';
import { helper } from '../../../environments/helper'
import * as Sentry from "sentry-cordova";

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ImageUploadService, ApiImage } from '../../services/document-upload.service';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { ViewChild, ElementRef } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { Platform, ActionSheetController } from '@ionic/angular';
const { Camera } = Plugins;
// const { Geolocation } = Plugins;
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { environment } from '../../../environments/environment'

import { GoogleMapComponent } from '../../components/google-map/google-map.component';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { SesizareService } from '../../services/sesizare.service'

import { Capacitor, FilesystemDirectory } from '@capacitor/core';
const { Filesystem } = Plugins;

import { ParkingService } from '../../services/parking.service'
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

declare var google
@Component({
	selector: 'app-sesizari-blocare-auto-agent',
	templateUrl: './sesizari-blocare-auto-agent.page.html',
	styleUrls: ['./sesizari-blocare-auto-agent.page.scss'],
})
export class SesizariBlocareAutoAgentPage implements AfterViewInit {

	@Input() sesizareChoiceId: number = 9;
	@Input() sesizareSubId: number = 0;

	alertLabels: any = {};
	loadingScreenText: string = null;
	loaded: number = 0;
	sesizareAddPageLabels: any = {}
	sesizareChoicePageLabels: any = {}
	subcategoriesTitle: any = []
	subcategories: any = {}
	sesizariChoices: any = {}
	addressLabel: any = null;

	sesizareFilesArr: any = []
	sesizareData: FormGroup;

	fileLabels: any = {}
	images: ApiImage[] = [];
	@ViewChild('fileInput', { static: false }) fileInput: ElementRef;
	@ViewChild(GoogleMapComponent, { static: false }) _GoogleMap: GoogleMapComponent;
	// map: google.maps.Map;

	@ViewChild('map', { static: false }) mapElement: ElementRef;
	map: any;
	address: string;

	latitude: number;
	longitude: number;

	mapOptions: google.maps.MapOptions = {
		zoom: 15,
		center: { lat: environment.app.defaultPointGoogleMap.lat, lng: environment.app.defaultPointGoogleMap.lon },
		// uncomment the following line if you want to remove the default Map controls
		disableDefaultUI: true
	};
	loadingElement: any;
	currentCoordinates: any = {}

	lonInit = environment.app.defaultPointGoogleMap.lat;
	latInit = environment.app.defaultPointGoogleMap.lon;
	lonPoint = environment.app.defaultPointGoogleMap.lat;
	latPoint = environment.app.defaultPointGoogleMap.lon;
	jsonObjectAddress: any = []

	marker: any;

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

	// add numar auto de blocat/inserat Auto

	constructor(
		private modalController: ModalController,
		private alertCtrl: AlertController,
		private loadingCtrl: LoadingController,
		public translate: TranslateService,
		private helperService: HelperService,
		private sesizareService: SesizareService,

		private api: ImageUploadService,
		private plt: Platform,
		private actionSheetCtrl: ActionSheetController,
		// private fileChooser : FileChooser,
		private filePath: FilePath,
		private chooser: Chooser,

		// map stuff
		private loadingController: LoadingController,
		private nativeGeocoder: NativeGeocoder,

		private parkingService: ParkingService,
		private barcodeScanner: BarcodeScanner,

		// new geolocation stuff/module
		private geolocation: Geolocation,
	) {
		// param is not available in constructor, only on $init
		translate.get('alert').subscribe((data: any) => { this.alertLabels = data })
		translate.get('loadingsScreen').subscribe((data: string) => { this.loadingScreenText = data })
		translate.get('sesizareChoicePage').subscribe((data: any) => {
			this.sesizareChoicePageLabels = data
			this.subcategoriesTitle = [
				{
					id: 1,
					label: data.titleSections.copilCategory
				},
				{
					id: 2,
					label: data.titleSections.persoanaCategory
				}
			]
			this.subcategories = {
				1: data.sections.copilRatacit,
				2: data.sections.copilRisc,
				3: data.sections.copilFaraAdapost,
				4: data.sections.violentaJuvenila,
				5: data.sections.persoaneFaraAdapost,
				6: data.sections.persoaneAfectiuniPsihice,
				7: data.sections.violentaDomestica,
				8: data.sections.persoanaStrada,
				9: data.sections.persoaneVarstnice,
				10: data.sections.deces
			}
		})
		translate.get('sesizarePage').subscribe((data: any) => {
			this.sesizariChoices = {
				1: data.sections.groapa,
				2: data.sections.masinaAbandonata,
				3: data.sections.gunoi,
				4: data.sections.mobilierUrban,
				5: data.sections.reabilitareTermica,
				6: data.sections.parcuriSiSpatiiVerzi,
				7: data.sections.parcari,
				8: data.sections.altaSesizare,
				9: data.sections.parcareIlegala,
				10: data.sections.deszapezire,
				11: data.sections.comertNeautorizat,
				12: data.sections.asistentaSociala,
			}
		})
		translate.get('sesizareAddPage').subscribe((data: any) => { this.sesizareAddPageLabels = data })

		translate.get('pageRegister.fileLabels').subscribe((data: any) => {
			this.fileLabels = data
		})



		this.sesizareData = new FormGroup({
			parking_type: new FormControl(-1, Validators.compose([Validators.required])),
			description: new FormControl('', Validators.compose([
				Validators.required, Validators.min(1)
			])),
			file_description: new FormControl('', []),
			file_description_source: new FormControl('', []),
			file_sources: new FormControl('', []),
			address_label: new FormControl('', []),
			nr_auto: new FormControl('', Validators.compose([
				Validators.required
			])),
			caracatita: new FormControl('', Validators.compose([
				Validators.required, Validators.min(1)
			])),
			categorie_auto: new FormControl(-1, Validators.compose([Validators.required]))
		});

		this.loaded = 1
	}

	ngAfterViewInit() {

	}

	get description() {
		return this.sesizareData.get('description');
	}

	get parkingtype() {
		return this.sesizareData.get('parking_type');
	}

	get nrAuto() {
		return this.sesizareData.get('nr_auto');
	}

	get caracatita() {
		return this.sesizareData.get('caracatita')
	}

	get categorieAuto() {
		return this.sesizareData.get('categorie_auto')
	}

	dismiss(index = 0, msg: string = null) {
		this.map = null;
		this.modalController.dismiss({ index, msg });
	}

	ngOnInit() {
		this.loadMap();
	}

	loadMap() {
		this.geolocation.getCurrentPosition().then((resp) => {

			this.latitude = resp.coords.latitude;
			this.longitude = resp.coords.longitude;

			this.lonPoint = resp.coords.longitude
			this.latPoint = resp.coords.latitude

			console.log(resp.coords, 'current coordinates??')

			let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
			let mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			}

			this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

			this.geolocateMe();
			this.map.addListener('dragend', () => {
				const current_location = new google.maps.LatLng(this.map.getCenter().lat(), this.map.getCenter().lng());
				this.map.panTo(current_location);

				this.lonPoint = this.map.getCenter().lng()
				this.latPoint = this.map.getCenter().lat()
				this.getAddressFromCoords(this.map.getCenter().lat(), this.map.getCenter().lng())

				console.log(this.map.getCenter().lat(), this.map.getCenter().lng(), 'coordinates here???')
			})

			this.map.addListener('drag', () => {
				const current_location = new google.maps.LatLng(this.map.getCenter().lat(), this.map.getCenter().lng());
				this.marker.setPosition(current_location)
			})

		}).catch((error) => {
			this.dismiss(2, this.sesizareAddPageLabels.noLocationFound)
			console.log('Error getting location', error);
		});

		this.createLoader();
	}

	// files are optional
	async addSesizare() {
		var self = this
		const loading = await this.loadingCtrl.create({ message: this.loadingScreenText });
		await loading.present();
		if (!this.sesizareData.valid) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, self.sesizareAddPageLabels.fillAllRequiredFiles, true)
			await loading.dismiss();
			return false;
		}else if(![1,2,3,4, 5].includes(this.sesizareData.value.parking_type)) {
			// problema cu specificarea tipului de loc de parcare
			await self.helperService.presentAlert(self.alertLabels.alertHeader, self.sesizareAddPageLabels.fillAllRequiredFiles + ' - Tip loc parcare ', false)
			await loading.dismiss();
			return false;
		}else if(self.sesizareFilesArr.length == 0) {
			await self.helperService.presentAlert(self.alertLabels.alertHeader, self.sesizareAddPageLabels.fillAllRequiredFiles + ' - Fotografii obligatorii', true)
			await loading.dismiss();
			return false;
		} else {
			// we are ok?
			let object = {
				description: (typeof self.sesizareData.value.description !== 'undefined' && self.sesizareData.value.description !== '' ? self.sesizareData.value.description : null),
				lat: self.latPoint,
				lng: self.lonPoint,
				init_lat: self.latInit,
				init_lng: self.lonInit,
				address: self.addressLabel,
				extra: JSON.stringify(self.jsonObjectAddress),
				type_id: self.sesizareChoiceId,
				sub_id: self.sesizareSubId,
				files: JSON.stringify(self.sesizareFilesArr),
				id_loc: null,
				source: 3,
				parking_type: self.sesizareData.value.parking_type,
				nr_auto: self.sesizareData.value.nr_auto,
				caracatita: self.sesizareData.value.caracatita,
				categorie_auto: self.sesizareData.value.categorie_auto
			}

			console.log(object)

			this.sesizareService.storeSesizareBlocareAuto(object)
				.then(async response => {

					let res = (typeof response.errors !== 'undefined' ? response : response.error)
					// check here if we have success
					if (typeof res.errors !== 'undefined') {

						if (res.errors == false) {
							// success
							await loading.dismiss();
							this.modalController.dismiss({ index: 1, id: res.data.id });
							return false
						} else {
							// eroare
							let errorMessage = this.alertLabels.generalErrMsg;
							res.errors.message.forEach(function (msg) {
								errorMessage = msg;
							})
							await this.helperService.presentAlert(this.alertLabels.alertHeader, errorMessage, false)
							await loading.dismiss();
							return false;
						}
					} else {
						// please add sentry
						if (helper.allowedSentry) {
							Sentry.addBreadcrumb({
								category: "sesizare.add.storeSesizareBlocareAuto",
								message: "Error on adding sesizare to backend - on else",
								level: Sentry.Severity.Info,
							});

							Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
						}

						await this.helperService.presentAlert(this.alertLabels.alertHeader, this.alertLabels.generalErrMsg, true)
						await loading.dismiss();
						return false;
					}
				})
				.catch(async res => {
					// fatal error
					// get and process our error from the server
					let errorMessage = this.alertLabels.generalErrMsg;

					if (typeof res.error !== 'undefined'
						&& typeof res.error.errors !== 'undefined'
						&& res.error.errors.message !== 'undefined'
						&& Array.isArray(res.error.errors.message)
						&& res.error.errors.message.length > 0)
						errorMessage = res.error.errors.message[0]

					if (helper.allowedSentry) {
						// please add sentry
						Sentry.addBreadcrumb({
							category: "sesizare.add.storeSesizareBlocareAuto",
							message: "Error on adding sesizare to backend - on catch",
							level: Sentry.Severity.Info,
						});

						Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Critical)
					}

					// await this.presentAlert(helper.alertHeader, errorMessage, true)
					await this.helperService.presentAlert(this.alertLabels.alertHeader, errorMessage, true)
					await loading.dismiss();
					return false;
				});

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
								self.sesizareData.patchValue(objToPatch)

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
									self.sesizareData.patchValue(objToPatch)
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
									self.sesizareData.patchValue(objToPatch)

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
										self.sesizareData.patchValue(objToPatch)
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
		this.sesizareData.patchValue(objToPatch)
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
						self.sesizareData.patchValue(objToPatch)
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
						self.sesizareData.patchValue(objToPatch)
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

	// map stuff
	public geolocateMe(): void {
		this.presentLoader();
		this.geolocation.getCurrentPosition().then(position => {

			const current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			this.map.panTo(current_location);

			this.latInit = position.coords.latitude
			this.lonInit = position.coords.longitude

			// add a marker
			this.marker = new google.maps.Marker({
				position: current_location,
				title: 'You are here!',
				animation: google.maps.Animation.DROP,
				visible: true,
				draggable: true
			})

			// To add the marker to the map, call setMap();
			this.marker.setMap(this.map);
			this.getAddressFromCoords(position.coords.latitude, position.coords.longitude)
			this.dismissLoader()
		}).catch((error) => {
			// no location, please dismiss
			this.dismiss(2, this.sesizareAddPageLabels.noLocationFound)

		});

		// .finally(() => )
	}

	async createLoader() {
		this.loadingElement = await this.loadingController.create({
			message: this.sesizareAddPageLabels.pleaseWaitGettingYourLocationLabel
		});
	}

	async presentLoader() {
		await this.loadingElement.present();
	}

	async dismissLoader() {
		if (this.loadingElement) {
			await this.loadingElement.dismiss();
		}
	}

	// to review finally this one
	getAddressFromCoords(lattitude, longitude) {
		let options: NativeGeocoderOptions = {
			useLocale: true,
			maxResults: 5
		};
		var self = this
		this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
			.then((result: NativeGeocoderResult[]) => {
				self.addressLabel = "";
				let responseAddress = [];
				for (let [key, value] of Object.entries(result[0])) {
					if (value.length > 0)
						responseAddress.push(value);

				}
				responseAddress.reverse();
				for (let value of responseAddress) {
					self.addressLabel += value + ", ";
				}
				self.jsonObjectAddress = result
				self.addressLabel = self.addressLabel.slice(0, -2);

				self.sesizareData.patchValue({
					address_label: self.addressLabel
				})
			})
			.catch((error: any) => {
				self.addressLabel = "Address Not Available!";

				self.sesizareData.patchValue({
					address_label: "Address Not Available!"
				})
			});
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

			await self.parkingService.solicitareBlocariAutoCheckFreeQRCode(input)
			.then(async (res) => {
				let response = (typeof res.errors !== 'undefined' ? res : res.error)
				if (typeof response.errors !== 'undefined') {
					if (response.errors == false) {
						// everything ok now, we wrap it up now
						// success
						self.sesizareData.patchValue({
							caracatita: input
						})
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
							category: "solicitareblocari.add.scanQRBlocator",
							message: "Error on fetching add scanQRBlocator " + JSON.stringify(barcodeData) + " -  else",
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
						category: "solicitareblocari.add.scanQRBlocator",
						message: "Error on fetching add scanQRBlocator " + JSON.stringify(barcodeData) + " - exception",
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
}
