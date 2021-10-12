import { Injectable } from '@angular/core';
declare var gtag;

import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

// Initialize Google Analytics

@Injectable({
	providedIn: 'root'
})
export class AnalyticsService {

	gaTracker : string = 'G-T4EN3YW7N9'
	uaTracker : string = 'UA-196597852-1'

	constructor(
		private ga: GoogleAnalytics
		) { }

	startTrackerWithId(id) {
		gtag('config', id);
	}

	trackView(pageUrl: string, screenName: string) { 
		console.log('track view page: ', pageUrl, screenName)
		gtag.trackView(pageUrl, screenName)
	}

	trackEvent(category, action, label?, value?) {
		console.log('track event :', category, action, label, value)
	}

	// new methods
	initGA(): void {
		this.ga.startTrackerWithId(this.uaTracker)
		.then(() => {
			console.log('Google analytics is ready now');
			this.ga.trackView('Home page')
			.then((res) => {
				console.log('view tracked', res)
			})
			.catch(
			  error => console.log(error, 'cant track view page')
			); 
			// Tracker is ready
			// You can now track pages or set additional information such as AppVersion or UserId
		})
		.catch(e => console.log('Error starting GoogleAnalytics', e));
	}

	trackViewGA(page) {
		console.log('please track view page')
		// this.ga.trackView(page)
		// .then((res) => {
		// 	console.log('success on page view ', res)
		// })
		// .catch((err) => {
		// 	console.log('error onpage view - ', err)
		// })
	}

	trackEventGA(category, action, label?, val?) {
		// Label and Value are optional, Value is numeric
		// this.ga.trackEvent(category, action, label, val)
		// .then((res) => {
		// 	console.log('success on page event ', res)
		// })
		// .catch((err) => {
		// 	console.log('error onpage event - ', err)
		// })
	}
}
