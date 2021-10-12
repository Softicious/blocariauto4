import { User } from './user.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, from, Observable, Subject } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { helper } from '../../environments/helper'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

const TOKEN_KEY = helper.tokenKey;

import { ComponentsModule } from '../components/components.module';
import * as Sentry from "sentry-cordova";

import { JwtHelperService } from '@auth0/angular-jwt';
const helperJWT = new JwtHelperService();

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	public isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
	token = '';

	private url = 'http://localhost/auth_app/api';
	private basePath = environment.interop.basePath;
	private loginPath = environment.interop.user.loginUrl;
	private refreshPath = environment.interop.user.refresh;
	private refreshLogin = environment.interop.user.refreshLogin;
	private findDetailsUrl = environment.interop.user.findDetails;

	private checkVersionAndroidUrl = environment.interop.user.checkVersionAndroid
	private checkVersionIosUrl = environment.interop.user.checkVersionIos
	private pushDeviceInfoUrl = environment.interop.user.pushDeviceInfo

	constructor(private http: HttpClient) {
		this.loadToken();
	}

	setToken(token) {
		this.token = token
	}

	public setAuthenticatedNext(bool): void {
		this.isAuthenticated.next(bool)
	}

	async loadToken() {
		var self = this
		const token = await Storage.get({ key: TOKEN_KEY });
		if (token && token.value) {
			this.token = token.value;
			const isExpired = helperJWT.isTokenExpired(token.value);
			if(isExpired) {
				await this.refreshToken(token.value)
				.then(async (res) => {
					// success?
					let response = (typeof res.status_code !== 'undefined' ? res : res.error)
					if (typeof response.status_code !== 'undefined') {
						if (response.status_code == 200 && typeof response.data.token !== 'undefined') {
							// everything ok now, we wrap it up now
							self.setToken(response.data.token)
							Storage.set({ key: helper.tokenKey, value: response.data.token })
							this.isAuthenticated.next(true);
						} else {
							this.isAuthenticated.next(false);
							return false;
						}

					} else {
						// add sentry
						if(helper.allowedSentry) {
							Sentry.addBreadcrumb({
								category: "auth.loadToken.refreshToken",
								message: "Error on logging user with error checkTokenAuth - on else",
								level: Sentry.Severity.Info,
							});
			
							Sentry.captureMessage(JSON.stringify(res), Sentry.Severity.Fatal)
						}
						this.isAuthenticated.next(false);
						return false
					}
				})
				.catch( async (err) => {
					if(helper.allowedSentry) {
						Sentry.addBreadcrumb({
							category: "auth.loadToken.refreshToken",
							message: "Error on logging user with error checkTokenAuth - on exception",
							level: Sentry.Severity.Info,
						});
	
						Sentry.captureMessage(JSON.stringify(err), Sentry.Severity.Critical)
					}
					this.isAuthenticated.next(false);
					return false
				})
				// TRY TO refresh token now
				
			}else {
				this.isAuthenticated.next(true);
			}
			
		} else {
			this.isAuthenticated.next(false);
		}
	}

	login(credentials: { email, password }) {
		return this.http.post<{ data: any }>(this.basePath + this.loginPath, credentials)
			.toPromise()
			.then(
				res => res,
				err => err
			).catch(e => e);
	}

	logout(): Promise<void> {
		this.isAuthenticated.next(false);
		return Storage.remove({ key: TOKEN_KEY });
	}

	refreshToken(token) {
		return this.http.get<{ data: any }>(this.basePath + this.refreshLogin + '?Token=' + token)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}

	findDetails() {
		return this.http.get<{ data: any }>(this.basePath + this.findDetailsUrl)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}

	// jwt stuff
	isValid() {
		return helperJWT.isTokenExpired();
	}

	public getToken(): string {
		return this.token
		// return localStorage.getItem(helper.tokenKey);
	}

	async saveDevice(data) {

		// let headers = await new HttpHeaders()
        //     .set('Content-Type', 'application/json')
        //     .set('Authorization', `Bearer ${this.token}`)
		// ,  { headers: headers }
		return this.http.post<{ data: any }>(this.basePath + this.pushDeviceInfoUrl, data)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}

	async getVersion (plt) {
		// let headers = await new HttpHeaders()
        //     .set('Content-Type', 'application/json')
        //     .set('Authorization', `Bearer ${this.token}`)
		// , { headers: headers }

		let url = (plt == 'ios' ? this.checkVersionIosUrl : this.checkVersionAndroidUrl)

		return this.http.get<{ data: any }>(this.basePath + url)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
	}
}
