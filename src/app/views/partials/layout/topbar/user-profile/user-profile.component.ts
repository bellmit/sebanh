// Angular
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
// RxJS
// NGRX
import {Store} from '@ngrx/store';
import {WebsocketClientService} from '../../../../../shared/services/websocket-client.service';
// State
import {AppState} from '../../../../../core/reducers';
import {AuthService, Logout, User} from '../../../../../core/auth';
import {AccountService} from '../../../../../core/auth/_services/account.service';
import {USER_PROFILE} from '../../../../../shared/util/constant';
import {SessionStorageService} from 'ngx-webstorage';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, Subscription} from 'rxjs';
import {CommonService} from '../../../../common-service/common.service';

@Component({
	selector: 'kt-user-profile',
	templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit, OnDestroy {
	// Public properties
	user$: User;
	userProfile: any;
	mail: string ='';
	userType$ = new BehaviorSubject<string>('');
	sub: Subscription;

	@Input() avatar = true;
	@Input() greeting = true;
	@Input() badge: boolean;
	@Input() icon: boolean;

	/**
	 * Component constructor
	 *
	 * @param store: Store<AppState>
	 */
	constructor(private store: Store<AppState>,
				private accountService: AccountService,
				private websocketClientService: WebsocketClientService,
				private authService: AuthService,
				private session: SessionStorageService,
				private router: Router,
				private commonService: CommonService
	) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		if (localStorage.getItem(USER_PROFILE)) {
			this.user$ = JSON.parse(localStorage.getItem(USER_PROFILE));
		} else {
			// this.accountService.identity(true).subscribe(res => {
			// 	if ('00' === res.code) {
			// 		this.user$ = res.data;
			// 	}
			// });
		}
		const userProfile = this.session.retrieve(USER_PROFILE);
		if (userProfile) {
			this.userProfile = userProfile;
			this.mail = `mailto:${this.getLowerCase(userProfile.user_id)}@seabank.com.vn`;
		} else {
			this.userProfile = {
				name: '',
				user_id: '',
				desc: ''
			};
		}
		this.sub = this.router.events.subscribe(value => {
			if (value instanceof NavigationEnd) {
				this.checkUserRights();
			}
		});
		this.checkUserRights();
	}

	ngOnDestroy(): void {
		if (this.sub) {
			this.sub.unsubscribe();
		}
	}

	/**
	 * Log out
	 */
	logout() {
		this.commonService.isDisplayAsideRight$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.websocketClientService.disconnect();
		this.store.dispatch(new Logout());
	}

	getLowerCase(src: string): string {
		if (src) {
			return src.toLowerCase();
		}
		return '';
	}

	checkUserRights(): void {
		const rightIds = this.commonService.getRightIdsByUrl(this.router.url);
		// console.log('>>>>>>>>> rightIds ==== ', rightIds);
		if (rightIds.includes('I')) {
			this.userType$.next('User Teller');
		}
		if (rightIds.includes('A')) {
			this.userType$.next('User KSV');
		}
	}
}
