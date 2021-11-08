// Angular
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
// RxJS
import {Observable, of} from 'rxjs';
import {isEmpty, tap} from 'rxjs/operators';
// NGRX
import {select, Store} from '@ngrx/store';
// Auth reducers and selectors
import {AppState} from '../../../core/reducers/';
import {isLoggedIn} from '../_selectors/auth.selectors';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private store: Store<AppState>, private localStorage: LocalStorageService,
				private sessionStorage: SessionStorageService, private router: Router) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		return this.store
			.pipe(
				select(isLoggedIn),
				tap(loggedIn => {
					if (!loggedIn) {
						this.router.navigateByUrl('/auth/login');
					}
				})
			);
	}
}
