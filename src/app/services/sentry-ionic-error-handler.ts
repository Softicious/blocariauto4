import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import * as Sentry from "sentry-cordova";

export class SentryIonicErrorHandler extends ErrorHandler {

	handleError(error) {
		super.handleError(error);
		try {
			Sentry.captureException(error.originalError || error);
		} catch (e) {
			console.error(e);
			// throw e;
		}
	}
}