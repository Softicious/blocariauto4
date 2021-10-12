import { AuthService } from '../auth/auth.service';
import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanLoad {

	constructor(private authService: AuthService, private router: Router) { }

	canLoad(): Observable<boolean> {
		return this.authService.isAuthenticated.pipe(
			filter(val => val !== null), // Filter out initial Behaviour subject value
			take(1), // Otherwise the Observable doesn't complete!
			map(isAuthenticated => {
				if (isAuthenticated) {
					return true;
				} else {
					this.router.navigateByUrl('/')
					return false;
				}
			})
		);
	}
}
