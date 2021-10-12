import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class GestiuneBlocatoareService {

	url = environment.interop.basePath
	checkActivityDailyUrl = environment.interop.api.gestiuneActivitate.checkActivityDaily
	registerActivityDailyUrl = environment.interop.api.gestiuneActivitate.registerActivityDaily
	cancelActivityTeamDailyUrl = environment.interop.api.gestiuneActivitate.cancelActivityTeamDaily
	checkAvailabilityBlocatorUrl = environment.interop.api.gestiuneActivitate.checkAvailabilityBlocator
	getGestiuneUtilizatorBlocatoareUrl = environment.interop.api.gestiuneActivitate.getGestiuneUtilizatorBlocatoare

	constructor(private http: HttpClient) { }

	getActivitateDailyUser() {
        return this.http.get<{ data: any }>(this.url + this.checkActivityDailyUrl)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

	registerActivitateUser(id: number) {
        return this.http.get<{ data: any }>(this.url + this.registerActivityDailyUrl + id)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

	unregisterActivitateUser() {
        return this.http.get<{ data: any }>(this.url + this.cancelActivityTeamDailyUrl)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

	checkBlocatorAuto(code: string = null, type: string = 'incarca') {
        return this.http.get<{ data: any }>(this.url + this.checkAvailabilityBlocatorUrl + code + '/' + type)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

	getGestiuneUtilizatorBlocatoare() {
		return this.http.get<{ data: any }>(this.url + this.getGestiuneUtilizatorBlocatoareUrl)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
	}
}
