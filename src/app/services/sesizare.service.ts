import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { helper } from '../../environments/helper'


@Injectable({
	providedIn: 'root'
})
export class SesizareService {
	url = environment.interop.basePath
	storeSesizareBlocareUrl = environment.interop.api.sesizare.storeBlocareAuto;
	allowBlocariAutoUrl = environment.interop.api.sesizare.allowBlocariAuto;

	constructor(private http: HttpClient) { }

	storeSesizareBlocareAuto(data) {
		return this.http.post<{ data: any }>(this.url + this.storeSesizareBlocareUrl, data)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}

	getStatusAccessBlocareAuto() {
		return this.http.get<{ data: any }>(this.url + this.allowBlocariAutoUrl)
			.toPromise()
			.then(
				res => res,
				err => err.error
			)
			.catch(e => e.error);
	}
}
