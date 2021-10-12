import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { HelperService } from '../helper/helper.service'

@Injectable({
	providedIn: 'root'
})
export class ParkingService {

	url = environment.interop.basePath
	checkNumarAutoContractActiveUrl = environment.interop.api.parking.checkNumarAutoContractActive
	checkQRCodeContractActiveUrl = environment.interop.api.parking.checkQRCodeContractActive
    solicitariBlocariAutoListUrl = environment.interop.api.parking.solicitariBlocariAutoList
    solicitariBlocariAutoFindUrl = environment.interop.api.parking.solicitariBlocariAutoFind
    solicitareBlocariAutoAddETAUrl = environment.interop.api.parking.solicitareBlocariAutoAddETA
    solicitareBlocariAutoAnuleazaUrl = environment.interop.api.parking.solicitareBlocariAutoAnuleaza
    solicitareBlocariAutoBlockUrl = environment.interop.api.parking.solicitareBlocariAutoBlock
    solicitareBlocariAuthPayPOSUrl = environment.interop.api.parking.solicitareBlocariAuthPayPOS
    solicitareBlocariAutoUnlockUrl = environment.interop.api.parking.solicitareBlocariAutoUnlock
    solicitareBlocariAutoCheckQRCodeUrl = environment.interop.api.parking.solicitareBlocariAutoCheckQRCode
    solicitareBlocariAutoCheckFreeQRCodeUrl = environment.interop.api.parking.solicitareBlocariAutoCheckFreeQRCode
    solicitareBlocariAutoAddCetateanBlocatUrl = environment.interop.api.parking.solicitareBlocariAutoAddCetateanBlocat
    solicitareBlocariAutoUpdateDetailsCetateanBlocatUrl = environment.interop.api.parking.solicitareBlocariAutoUpdateDetailsCetateanBlocat
    solicitareBlocariAutoPrintPVUrl = environment.interop.api.parking.solicitareBlocariAutoPrintPV
    
	constructor(private http: HttpClient) { }

	checkNumarAutoContractActive(data: any) {
        return this.http.post<{ data: any }>(this.url + this.checkNumarAutoContractActiveUrl, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);

    }

	checkQRCodeContractActive(data: any) {
        return this.http.post<{ data: any }>(this.url + this.checkQRCodeContractActiveUrl, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);

    }

    async solicitariBlocariAutoList(
        cat: number = 0, 
        mode: number = 0, 
        page: number = 0,
        nrAuto: string = ''
        ) {
        return this.http.get<{ data: any }>(this.url + this.solicitariBlocariAutoListUrl + '?cat=' + cat + '&mode=' + mode + '&page=' + page + (nrAuto !== '' ? '&nrauto=' + nrAuto : ''))
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);

    }

    solicitariBlocariAutoFind(id: number) {
        return this.http.get<{ data: any }>(this.url + this.solicitariBlocariAutoFindUrl + id)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);

    }

    solicitareBlocariAutoAddETA(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAutoAddETAUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoAnuleaza(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAutoAnuleazaUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoBlock(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAutoBlockUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAuthPayPOS(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAuthPayPOSUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoUnlock(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAutoUnlockUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoCheckQRCode(code: string, status: number) {
        return this.http.get<{ data: any }>(this.url + this.solicitareBlocariAutoCheckQRCodeUrl + code + '?status=' + status)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoCheckFreeQRCode(code: string) {
        return this.http.get<{ data: any }>(this.url + this.solicitareBlocariAutoCheckFreeQRCodeUrl + code)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoAddCetateanBlocat(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAutoAddCetateanBlocatUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoUpdateDetailsCetateanBlocat(data: any, solicitareId: number) {
        return this.http.post<{ data: any }>(this.url + this.solicitareBlocariAutoUpdateDetailsCetateanBlocatUrl + solicitareId, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    solicitareBlocariAutoPrintPV(id: number) {
        return this.http.get<{ data: any }>(this.url + this.solicitareBlocariAutoPrintPVUrl + id)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }
}
