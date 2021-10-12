import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AutoLoginGuard implements CanLoad {

	constructor(private authService: AuthService, private router: Router) { }

	canLoad(): Observable<boolean> {
		return this.authService.isAuthenticated.pipe(
			filter(val => val !== null), // Filter out initial Behaviour subject value
			take(1), // Otherwise the Observable doesn't complete!
			map(isAuthenticated => {
				if (isAuthenticated) {
					// Directly open inside area       
					this.router.navigateByUrl('/dashboard', { replaceUrl: true });
				} else {
					// Simply allow access to the login
					return true;
				}
			})
		);
	}

	// canLoad(
	//   route: Route,
	//   segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
	//   return true;
	// }
}
