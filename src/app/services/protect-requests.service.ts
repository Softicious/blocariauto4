import { Injectable } from '@angular/core';
import { helper } from '../../environments/helper'
const TOKEN_KEY = helper.tokenKey;

import { JwtHelperService } from '@auth0/angular-jwt';
const helperJWT = new JwtHelperService();
import { AuthService } from './../auth/auth.service';

import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;

@Injectable({
	providedIn: 'root'
})
export class ProtectRequestsService {

	token: string = ''

	constructor(
		private authService: AuthService,
	) { }

	// status 
	// 0 => no token, please redirect
	// 1 => ok, please allow requests
	// 2 => refresh token pls, or redirect to login now
	async canMakeRequests() {
		
		const token = await Storage.get({ key: TOKEN_KEY });
		if (token && token.value) {
			const isExpired = helperJWT.isTokenExpired(token.value);
			if(isExpired && this.authService.isAuthenticated.getValue() == true) {
				return {
					status: 2
				}
			}else if(isExpired) {
				return {
					status: 0
				}
			}else {
				// we are auth&& token is set
				return {
					status : 1
				}
			}
		}else {
			// we do not have a token, return false
			return {
				status: 0
			}
		}

	}
}
