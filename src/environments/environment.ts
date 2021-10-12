// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
	production: false,
	appShellConfig: {
		debug: false,
		networkDelay: 500
	},
	app: {
		appVersion: '1.0.8',
		defaultPointGoogleMap: {
			lon: 26.116539,
			lat: 44.385996
		},
		paymentUrls: {
			successUrl: "https://mob.mobilitateurbana4.ro:44333/success-bt-payment",
			errorUrl: "https://mob.mobilitateurbana4.ro:44333/fail-bt-payment"
		}
	},
	interop: {
		basePath: 'https://mob.mobilitateurbana4.ro:44333',
		test: {
			testFilePushServer: '/api/test-upload-file'
		},
		pagesSlugs: {
			termsAndConditions: "termeni-si-conditii"
		},
		user: {
			loginUrl: '/api/auth/login',
			refresh: '/api/refresh-v2',
			refreshLogin: '/api/refresh-login',
			findDetails: '/api/agent/find-details',
			changePassword: '/api/cetatean/password',
			updateProfile: '/api/cetatean/profile-update-v3',
			checkVersionAndroid: '/api/android-version',
			checkVersionIos: '/api/ios-version',
			pushDeviceInfo: '/api/cetatean/device-info'
		},
		fileUpload: {
			noLogin: '/upload-file-register',
			base64Iphone: '/upload-file-register-base64',
			authRequired: ''
		},
		api: {
			notificari: {
				list: '/api/notificari-list',
				one: '/api/mesaj/',
				countMesaje: '/api/mesaje-count',
				registerDevice: '/api/mesage/register-device',
				markAsRead: '/api/notificari-read'
			},
			parking: {
				checkNumarAutoContractActive: "/api/checkNumarAutoContractActive",
				checkQRCodeContractActive:"/api/checkQRCodeContractActive",
				solicitariBlocariAutoList: "/api/solicitari-blocare/list",
				solicitariBlocariAutoFind: "/api/solicitari-blocare/view/",
				solicitareBlocariAutoAddETA: "/api/update-raspuns/",
				solicitareBlocariAutoAnuleaza: "/api/anuleaza-cerere/",
				solicitareBlocariAutoBlock: "/api/blocheaza-auto/",
				solicitareBlocariAuthPayPOS: "/api/achita-factura/",
				solicitareBlocariAutoUnlock: "/api/deblocheaza-auto/",
				solicitareBlocariAutoCheckQRCode: "/api/solicitari-blocare/scanqr/",
				solicitareBlocariAutoCheckFreeQRCode: "/api/solicitare-blocare/scanqr-free/",
				solicitareBlocariAutoAddCetateanBlocat: "/api/solicitare-blocare/add-cetatean/",
				solicitareBlocariAutoUpdateDetailsCetateanBlocat: "/api/solicitare-blocare/update-cetatean-denumire/",
				solicitareBlocariAutoPrintPV: "/api/solicitari-blocare/print-pv-deblocare/"
			},
			sesizare: {
				storeBlocareAuto: "/api/sesizare-blocare-auto",
				allowBlocariAuto: '/api/allow-bl-auto',
			},
			gestiuneActivitate: {
				checkActivityDaily: "/api/activitate-inregistrata",
				registerActivityDaily: "/api/register-activitate/",
				cancelActivityTeamDaily: "/api/unregister-activitate",
				checkAvailabilityBlocator: "/api/check-availability/",
				getGestiuneUtilizatorBlocatoare: "/api/get-gestiune-utilizator"
			}
		}
	}
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
