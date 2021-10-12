import { helper } from '../../environments/helper'
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { env } from 'process';
import { query } from 'express';
// import { Jsonp, Http, Headers, URLSearchParams } from '@angular/http';

import { HelperService } from '../helper/helper.service'

@Injectable({
    providedIn: 'root'
})

export class NotificariService {

    url = environment.interop.basePath
    listNotificariUrl = environment.interop.api.notificari.list
    oneNotificariUrl = environment.interop.api.notificari.one
    countNotificariUrl = environment.interop.api.notificari.countMesaje
    registerDeviceUrl = environment.interop.api.notificari.registerDevice
    notificariReadUrl = environment.interop.api.notificari.markAsRead

    constructor(private http: HttpClient) {
    }

    async getNotificari(cat: number = 0, mode: number = 0, page: number = 0) {
        return this.http.get<{ data: any }>(this.url + this.listNotificariUrl + '?cat=' + cat + '&mode=' + mode + '&page=' + page)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    getNotificare(id: number) {
        return this.http.get<{ data: any }>(this.url + this.oneNotificariUrl + id)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    getNumNotificari() {
        return this.http.get<{ data: any }>(this.url + this.countNotificariUrl)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);

    }

    registerDevice(data) {
        return this.http.post<{ data: any }>(this.url + this.registerDeviceUrl, data)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

    markAsRead(cat: number = 0) {
        return this.http.get<{ data: any }>(this.url + this.notificariReadUrl + '?cat=' + cat)
            .toPromise()
            .then(
                res => res,
                err => err.error
            )
            .catch(e => e.error);
    }

}