import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})

export class ProfileService {
    url = environment.interop.basePath
    changePasswordUrl = environment.interop.user.changePassword;
    findDetailsUrl = environment.interop.user.findDetails;
    updateProfileUrl = environment.interop.user.updateProfile;

    token: any = null;
    httpOptions: any;

    constructor(private http: HttpClient) {
    }

    // update password
    changePassword(data) {
		return this.http.post<{ data: any }>(this.url + this.changePasswordUrl, data)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}

    // findDetails
    findDetails() {
        return this.http.get<{ data: any }>(this.url + this.findDetailsUrl)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
    }

    // update Profile
    updateProfile(data) {
		return this.http.post<{ data: any }>(this.url + this.updateProfileUrl, data)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}

}