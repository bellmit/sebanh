import {Subscription} from 'rxjs';
// Angular
import {ChangeDetectionStrategy, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
// Layout
import {LayoutConfigService, SplashScreenService, TranslationService} from './core/_base/layout';
// language list
import {locales} from './core/_config/i18n/index';
import {Store} from '@ngrx/store';
import {AppState} from './core/reducers';
import {AutoLogoutService} from './shared/services/auto-logout.service';
import {SessionStorageService} from 'ngx-webstorage';
import {USER_PROFILE} from './shared/util/constant';
import {WebsocketClientService} from './shared/services/websocket-client.service';
import {ModalAskComponent} from './shared/directives/modal-common/modal-ask/modal-ask.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'body[kt-root]',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
	// Public properties
	title = 'SeaTeller';
	loader: boolean;
	private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param translationService: TranslationService
	 * @param store
	 * @param router: Router
	 * @param layoutConfigService: LayoutCongifService
	 * @param splashScreenService: SplashScreenService
	 * @param autoLogoutService
	 */
	constructor(private translationService: TranslationService,
				private store: Store<AppState>,
				private router: Router,
				private layoutConfigService: LayoutConfigService,
				private splashScreenService: SplashScreenService,
				private autoLogoutService: AutoLogoutService,
				private sessionStorageService: SessionStorageService,
				private websocketClientService: WebsocketClientService,
				private modalService: NgbModal) {

		// register translations
		this.translationService.loadTranslationList(locales);
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		// this.store.dispatch(new Logout());
		// enable/disable loader
		this.loader = this.layoutConfigService.getConfig('loader.enabled');

		const routerSubscription = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				// hide splash screen
				this.splashScreenService.hide();

				// scroll to top on every route change
				window.scrollTo(0, 0);

				// to display back the body content
				setTimeout(() => {
					document.body.classList.add('kt-page--loaded');
				}, 500);
			}
		});
		this.unsubscribe.push(routerSubscription);

		const refreshWeb = sessionStorage.getItem('refresh-web');
		if (!refreshWeb) {
			localStorage.clear();
			this.router.navigate(['/auth/login']).then();
		}

		//
		window.addEventListener('storage', event => {
			if (event.storageArea == localStorage) {
				const userName = JSON.parse(localStorage.getItem('ngx-webstorage|username'));
				const sessionUser = this.sessionStorageService.retrieve(USER_PROFILE);
				if (sessionUser) {
					if (sessionUser.user_id != userName) {
						this.sessionStorageService.clear();
						this.websocketClientService.disconnect();
						this.router.navigate(['/auth/login']);
						const modalRef = this.modalService.open(ModalAskComponent, {
							backdrop: 'static',
							keyboard: false,
							size: 'sm',
							centered: true
						});
						modalRef.componentInstance.content = 'Bạn đã đăng nhập tài khoản khác trên máy tính này';
						modalRef.result.then(r => {
							if (r == 'ok') {
								this.modalService.dismissAll();
							}
						});
						return;
					}
				}
			}
		}, false);
	}

	/**
	 * On Destroy
	 */
	ngOnDestroy() {
		this.unsubscribe.forEach(sb => sb.unsubscribe());
	}

	@HostListener('window:beforeunload')
	doSomething() {
		sessionStorage.setItem('refresh-web', 'true');
	}

	// @HostListener('window:unload', ['$event'])
	// unloadHandler(event) {
	// 	// ...
	// 	window.location.href = 'http://google.com.vn';
	// 	alert('Seatellers Unloaded');
	// }
}
