import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {SessionStorageService} from 'ngx-webstorage';
import {forkJoin, Observable, of, ReplaySubject} from 'rxjs';
import {catchError, map, shareReplay, tap} from 'rxjs/operators';
import {AuthService, User} from '..';
import {StateStorageService} from './state-storage.service';
import {AppState} from '../../reducers';
import {Store} from '@ngrx/store';
import {NgxPermissionsService} from 'ngx-permissions';
import {PERMISSION_CACHE, USER_PROFILE} from '../../../shared/util/constant';

@Injectable({providedIn: 'root'})
export class AccountService {
	private userIdentity: User | null = null;
	private authenticationState = new ReplaySubject<User | null>(1);
	private accountCache$?: Observable<any | null>;

	constructor(
		private sessionStorage: SessionStorageService,
		private http: HttpClient,
		private stateStorageService: StateStorageService,
		private router: Router,
		private store: Store<AppState>,
		private authService: AuthService,
		private permissionsService: NgxPermissionsService
	) {
	}

	authenticate(identity: User | null): void {
		this.userIdentity = identity;
		this.authenticationState.next(this.userIdentity);
	}

	hasAnyAuthority(authorities: string[] | string): boolean {
		if (!this.userIdentity || !this.userIdentity.authorities) {
			return false;
		}
		if (!Array.isArray(authorities)) {
			authorities = [authorities];
		}
		return this.userIdentity.authorities.some((authority: string) => authorities.includes(authority));
	}

	identity(username?: string, force?: boolean): Observable<any> {
		if (force) {
			this.accountCache$ = null;
			this.sessionStorage.clear();
		}
		if (!this.accountCache$ || force || !this.isAuthenticated()) {
			this.accountCache$ = this.fetch(username, force).pipe(
				catchError(() => {
					return of(null);
				}),
				tap((permissions: any | null) => {
					if (permissions) {
						this.permissionsService.loadPermissions(permissions);
						let user = new User();
						user.shortName = username;
						user.authorities = permissions;
						localStorage.setItem(USER_PROFILE, JSON.stringify(user));
						this.authenticate(user);
						this.userIdentity.authorities = permissions;
						if (force) {
							this.navigateToStoredUrl(permissions);
						}
					} else {
						return of(null);
					}
				}),
				shareReplay(1)
			);
		}
		return this.accountCache$;
	}

	isAuthenticated(): boolean {
		return this.userIdentity !== null;
	}

	getAuthenticationState(): Observable<User | null> {
		return this.authenticationState.asObservable();
	}

	private fetch(username?: string, force?: boolean): Observable<any> {
		// return this.authService.loadPermissions(username);
		if (force) {
			this.sessionStorage.clear(PERMISSION_CACHE);
		}
		const permi = this.sessionStorage.retrieve(PERMISSION_CACHE);
		if (permi) {
			return of(permi);
		}
		this.authService.getTimeout();
		this.authService.getUserInfo(username);
		return this.authService.getUserPermission(username)
			.pipe(
				map(res => {
					this.sessionStorage.store(PERMISSION_CACHE, res);
					return res;
				}));
	}

	private navigateToStoredUrl(router: string[]): void {
		// previousState can be set in the authExpiredInterceptor and in the userRouteAccessService
		// if login is successful, go to stored previousState and clear previousState
		// const previousUrl = this.stateStorageService.getUrl();
		// if (previousUrl) {
		// 	this.stateStorageService.clearUrl();
		// 	this.router.navigateByUrl(previousUrl);
		// }
		// console.log(this.router.url);
		if (!router.includes('pages/dashboard')) {
			const route = router[0];
			this.stateStorageService.storeUrl(route);
		} else {
			this.router.navigate(['/']).then();
		}
	}

}
