
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment'
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { HttpClient } from '@angular/common/http';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';

export interface ApiImage {
    _id: string;
    name: string;
    createdAt: Date;
    url: string;
}

@Injectable({
    providedIn: 'root'
})
export class ImageUploadService {
    url = environment.interop.basePath
    pushFileUrl = environment.interop.fileUpload.noLogin;
    pushFileBase64Url = environment.interop.fileUpload.base64Iphone;
    token: any = null;

    constructor(private http: HttpClient,
        private transfer: FileTransfer) {
    }

    uploadImage(blobData, name, ext) {
        const formData = new FormData();
        formData.append('file', blobData, `${name}.${ext}`);
        formData.append('name', name);
        return this.http.post(`${this.url}${this.pushFileUrl}`, formData)
            .toPromise()
            .then(
				res => res,
				err => err
			).catch(e => e);
    }

    uploadImageFile(file: File) {
        const ext = file.name.split('.').pop();
        const formData = new FormData();
        formData.append('file', file, `${file.name}`);
        formData.append('name', file.name);
        return this.http.post<{ data: any }>(`${this.url}${this.pushFileUrl}`, formData)
            .toPromise()
            .then(
				res => res,
				err => err
			).catch(e => e);
        ;
    }

    // transfer document here please
    transferDocument (filePath: string, fileData: any, mime: string, ext: string) {
        const fileTransfer: FileTransferObject = this.transfer.create();

        let data = Object.assign({}, { 'fileName': fileData.name, 'ext': ext });

        let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: fileData.name,
            headers: {},
            chunkedMode: false,
			mimeType: mime,
			params: data
        }
        return fileTransfer.upload(filePath, `${this.url}${this.pushFileUrl}`, options)
            .then(
                (data) => {
                    console.log(data, 'file??')
                    return data;
                },
                (err) => {
                    console.log('error on transfer', err)
                    return err;
                })
            .catch((err) => {
                console.log('err on catch', err)
                return err;
            })
    }

    // transfer document here please
    transferDocumentBASE64 (fileBase64: string, fileData: any, mime: string, ext: string) {
        let obj = Object.assign({}, { 'fileName': fileData.name, 'ext': ext, 'data' : fileBase64, 'mimeType': mime });
        return this.http.post<{ data: any }>(`${this.url}${this.pushFileBase64Url}`, obj)
            .toPromise()
            .then(
				res => res,
				err => err
			).catch(e => e);
    }
}