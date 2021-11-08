import {Injectable, NgZone} from '@angular/core';
import {AppConfigService} from '../../app-config.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../../core/reducers';
import {APP_TIME_OUT} from '../util/constant';
import {Logout} from '../../core/auth';
import {SessionStorageService} from 'ngx-webstorage';
import {WebsocketClientService} from '../../shared/services/websocket-client.service'

const CHECK_INTERVALL = 10000; // in ms
const STORE_KEY = 'lastAction';

@Injectable({
	providedIn: 'root'
})
export class AutoLogoutService {

	constructor(
		private ngZone: NgZone,
		private store: Store<AppState>,
		private router: Router,
		public modal: NgbModal,
		private session: SessionStorageService,
		private websocketClientService : WebsocketClientService
	) {
		this.check();
		this.initListener();
		this.initInterval();
		localStorage.setItem(STORE_KEY, Date.now().toString());
	}

	get lastAction() {
		const lastActionLS = localStorage.getItem(STORE_KEY);
		if (!lastActionLS) {
			localStorage.setItem(STORE_KEY, (Date.now() + ''));
		}
		return parseInt(localStorage.getItem(STORE_KEY));
	}

	set lastAction(value) {
		localStorage.setItem(STORE_KEY, (value + ''));
	}

	initListener() {
		this.ngZone.runOutsideAngular(() => {
			document.body.addEventListener('click', () => this.reset());
		});
	}

	initInterval() {
		this.ngZone.runOutsideAngular(() => {
			setInterval(() => {
				this.check();
			}, CHECK_INTERVALL);
		});
	}

	reset() {
		this.lastAction = Date.now();
	}

	check() {
		// Set time for auto logout, unit: minute (m)
		const appTimeOut = this.session.retrieve(APP_TIME_OUT);
		if (!appTimeOut || (appTimeOut < 0)) {
			return;
		}
		const now = Date.now();
		const timeleft = this.lastAction + appTimeOut * 60 * 1000;
		const diff = timeleft - now;
		const isTimeout = diff < 0;
		let _this = this;
		this.ngZone.run(() => {
			if (isTimeout) {
				_this.websocketClientService.disconnect();
				this.modal.dismissAll();
				localStorage.clear();
				this.reset();
				this.store.dispatch(new Logout());
				this.router.navigate(['auth/login']).then();
			}
		});
	}
}
