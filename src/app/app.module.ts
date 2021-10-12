import { APP_INITIALIZER, NgModule, Optional, PLATFORM_ID, ErrorHandler } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ServiceWorkerModule } from '@angular/service-worker';
import { RESPONSE } from '@nguniversal/express-engine/tokens';
import { isPlatformServer } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { environment } from '../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient, HttpClientJsonpModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import { helper } from '../environments/helper'

import { IonIntlTelInputModule } from 'ion-intl-tel-input';

import * as Sentry from "sentry-cordova";
import { SentryIonicErrorHandler } from "./services/sentry-ionic-error-handler";

import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';

import { FileTransfer } from '@ionic-native/file-transfer/ngx';
// import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { NotificaripopoverComponent } from '../app/notificaripopover/notificaripopover.component'

import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';

export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';

import { GlobalService } from '../app/services/global.service'

import { AnalyticsService } from '../app/services/analytics.service'

import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

import { httpInterceptorProviders } from "../app/interceptors";

import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';


// init Sentry
Sentry.init({
	dsn: "https://2da58ffc23934d9cb9381e2d7e265d70@o517233.ingest.sentry.io/5881934",
	debug: true,
	// release: "io.ionic.starter@1.0.6",
	environment: helper.environment
});

@NgModule({
	declarations: [AppComponent, NotificaripopoverComponent],
	imports: [
		BrowserModule.withServerTransition({ appId: 'serverApp' }),
		BrowserTransferStateModule,
		IonicModule.forRoot(
		{
			rippleEffect: false,
			mode: 'md'
		}
		),
		ReactiveFormsModule,
		AppRoutingModule,
		HttpClientModule,
		HttpClientJsonpModule,
		ComponentsModule,
		FontAwesomeModule,
		ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [HttpClient]
			}
		}),
		IonIntlTelInputModule,
		JwtModule
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		{ provide: ErrorHandler, useClass: SentryIonicErrorHandler },
		{
			provide: APP_INITIALIZER,
			useFactory: (platformId: object, response: any) => {
				return () => {
					// In the server.ts we added a custom response header with information about the device requesting the app
					if (isPlatformServer(platformId)) {
						if (response && response !== null) {
							// Get custom header from the response sent from the server.ts
							const mobileDeviceHeader = response.get('mobile-device');

							// Set Ionic config mode?
						}
					}
				};
			},
			deps: [PLATFORM_ID, [new Optional(), RESPONSE]],
			multi: true
		},
		FileChooser,
		FilePath,
		Chooser,
		FileTransfer,
		// File
		NativeGeocoder,
		FileOpener,
		InAppBrowser,
		ScreenOrientation,
		OneSignal,
		GlobalService,
		AnalyticsService,
		GoogleAnalytics,
		httpInterceptorProviders,
		BluetoothSerial
	],
	bootstrap: [AppComponent]
})
export class AppModule {

	constructor(library: FaIconLibrary) {
		library.addIconPacks(fas, fab, far);
	}

}