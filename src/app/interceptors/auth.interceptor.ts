import { Injectable } from "@angular/core";
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse
} from "@angular/common/http";
import { AuthService } from '../auth/auth.service';

import { throwError, Observable, BehaviorSubject, of } from "rxjs";
import { catchError, filter, finalize, take, switchMap } from "rxjs/operators";
// import { paths } from "../const";

import { Router } from '@angular/router';

import { environment } from '../../environments/environment'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private AUTH_HEADER = "Authorization";
	private token = "secrettoken";
	private refreshTokenInProgress = false;
	private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
		null
	);

	constructor(public authService: AuthService, private router: Router,) { 
		// console.log('intercept http request here???')
		this.token = this.authService.getToken()
		// this.token = 'https://jwt.io/#debugger-io?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQsImlzcyI6Imh0dHBzOlwvXC90aWNrZXRpbmcubW9iaWxpdGF0ZXVyYmFuYTQucm9cL2FwaVwvYXV0aFwvbG9naW4iLCJpYXQiOjE2MjM4MjYzNTgsImV4cCI6MTYyMzg0NDM1OCwibmJmIjoxNjIzODI2MzU4LCJqdGkiOiJhNGUzMDNmMzI4YjA3NjNhZGQ4ODFkZmRkYWYxMzY0MiJ9.Vv2ra8_mn0RQg5OlH2wJ7GPmIee9w42X5GPhJhjiIds'
	}

	intercept(
		req: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		// console.log(environment.interop.user.loginUrl)
		// if (!req.url.includes(paths.auth)) {
		// if (!req.url.includes(environment.interop.user.loginUrl)) {
		// 	return next.handle(req);
		// }
		var self = this
		// console.log(this.token)
		// console.log('hello??')
		// if (!req.headers.has("Content-Type")) {
		// 	req = req.clone({
		// 		headers: req.headers.set("Content-Type", "application/json")
		// 	});
		// }

		req = this.addAuthenticationToken(req);
		return next.handle(req).pipe(
			catchError((error: HttpErrorResponse) => {
				// console.log('we have an error here', error)
				if (error && error.status === 401) {
					// console.log('401')
					// 401 errors are most likely going to be because we have an expired token that we need to refresh.
					if (this.refreshTokenInProgress) {
						// console.log('refresh token pls')
						// If refreshTokenInProgress is true, we will wait until refreshTokenSubject has a non-null value
						// which means the new token is ready and we can retry the request again
						return this.refreshTokenSubject.pipe(
							filter(result => result !== null),
							take(1),
							switchMap(() => next.handle(this.addAuthenticationToken(req)))
						);
					} else {
						this.refreshTokenInProgress = true;
						console.log('on else to refresh?')

						// Set the refreshTokenSubject to null so that subsequent API calls will wait until the new token has been retrieved
						this.refreshTokenSubject.next(null);

						return this.refreshAccessToken().pipe(
							switchMap((success: boolean) => {
								this.refreshTokenSubject.next(success);
								return next.handle(this.addAuthenticationToken(req));
							}),
							// When the call to refreshToken completes we reset the refreshTokenInProgress to false
							// for the next time the token needs to be refreshed
							finalize(() => (this.refreshTokenInProgress = false))
						);
					}
				} else {
					// if weird error, pls relocate to login
					// if(this.token !== null || this.token !== '') {
					// 	// redirect, else we will allow showing errors
					// 	self.authService.logout();
					// 	self.router.navigateByUrl('/', { replaceUrl: true });
					// 	// return false
					// }
					// console.log('another kind of error', error)
					return throwError(error);
				}
			})
		);
	}

	private refreshAccessToken(): Observable<any> {
		// console.log('pls check the secret token')
		return of("secret token");
	}

	private addAuthenticationToken(request: HttpRequest<any>): HttpRequest<any> {
		// If we do not have a token yet then we should not set the header.
		// Here we could first retrieve the token from where we store it.
		// console.log('we are trying to add token to login.')
		if (!this.token) {
			return request;
		}
		// If you are calling an outside domain then do not add the token.
		// if (!request.url.match(/www.mydomain.com\//)) {
		// 	return request;
		// }
		return request.clone({
			headers: request.headers.set(this.AUTH_HEADER, "Bearer " + this.token)
		});
	}
}