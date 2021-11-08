import {CommonService} from './../../../common-service/common.service';
// Angular
import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
// RxJS
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {finalize, flatMap, map, takeUntil, tap} from 'rxjs/operators';
// Translate
import {TranslateService} from '@ngx-translate/core';
// Store
import {Store} from '@ngrx/store';
import {AppState} from '../../../../core/reducers';
// Auth
import {AuthNoticeService, AuthService} from '../../../../core/auth';
import {AccountService} from '../../../../core/auth/_services/account.service';
import {NgxPermissionsService} from 'ngx-permissions';
import {ToastrService} from 'ngx-toastr';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalAskComponent} from '../../../../shared/directives/modal-common/modal-ask/modal-ask.component';
// Websocket
import {buildRequest, getResponseApi} from '../../../../shared/util/api-utils';
import {
	HEADER_API_ADMIN_MANAGER,
	SEVER_API_URL_ADMIN_MANAGER,
	STATUS_OK, GET_ENQUIRY, CODE_00, GET_LIST_ERROR
} from '../../../../shared/util/constant';
import {AppConfigService} from '../../../../app-config.service';
import {HttpClient} from '@angular/common/http';
import {LocalStorageService} from 'ngx-webstorage';
import {StateStorageService} from '../../../../core/auth/_services/state-storage.service';

declare var $: any;

const DEMO_PARAMS = {
	USERNAME: '',
	PASSWORD: ''
};

@Component({
	selector: 'kt-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
	// Public params
	loginForm: FormGroup;
	isClickedLogin: boolean = false;
	errors: any = [];
	isRememberUser: boolean = false;
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	headerApiSimilarityAi: any;
	apiUrlApiSimilarityAI: any;

	unsubscribe: Subject<any>;

	private returnUrl: any;
	advertisements: any[] = [];

	// Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

	/**
	 * Component constructor
	 *
	 * @param router: Router
	 * @param auth: AuthService
	 * @param authNoticeService: AuthNoticeService
	 * @param translate: TranslateService
	 * @param store: Store<AppState>
	 * @param fb: FormBuilder
	 * @param cdr
	 * @param route
	 * @param accountService
	 * @param toastr
	 * @param permissionsService
	 * @param modalService
	 * @param commonService
	 * @param appConfigService
	 * @param http
	 * @param localStorage
	 */
	constructor(
		private router: Router,
		private auth: AuthService,
		private authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private store: Store<AppState>,
		private fb: FormBuilder,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		private accountService: AccountService,
		private toastr: ToastrService,
		private permissionsService: NgxPermissionsService,
		private modalService: NgbModal,
		public commonService: CommonService,
		private appConfigService: AppConfigService,
		private http: HttpClient,
		private localStorage: LocalStorageService,
		private stateStorageService: StateStorageService,
	) {
		this.unsubscribe = new Subject();
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.initLoginForm();
		let dataLoginStore = localStorage.getItem('REMEMBER_USER');
		if (dataLoginStore) {
			let parseData = JSON.parse(dataLoginStore);
			this.loginForm.patchValue(parseData);
			// this.isRememberUser = parseData.isSaveAccount;
		}

		this.headerApiSimilarityAi = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		this.apiUrlApiSimilarityAI = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);

		// redirect back to the returnUrl before login
		// this.route.queryParams.subscribe(params => {
		// 	this.returnUrl = params.returnUrl || '/';
		// });
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
		this.unsubscribe.next();
		this.unsubscribe.complete();
		this.isLoading$.next(false);
	}

	/**
	 * Form initialization
	 * Default params, validators
	 */
	initLoginForm() {
		this.loginForm = this.fb.group({
			username: [DEMO_PARAMS.USERNAME, Validators.compose([
				Validators.required,
			])
			],
			password: [DEMO_PARAMS.PASSWORD, Validators.compose([
				Validators.required,
			])
			]
		});
	}

	/**
	 * Form Submit
	 */
	submit() {
		this.isClickedLogin = true;
		const controls = this.loginForm.controls;
		/** check form */

		if (this.loginForm.controls.username.hasError('required')) {
			let modalRef = this.modalService.open(ModalAskComponent, {
				backdrop: 'static',
				keyboard: false,
				size: 'sm',
				centered: true
			});
			modalRef.componentInstance.content = 'Tên đăng nhập không được để trống';
			return;
		}

		if (this.loginForm.controls.password.hasError('required')) {
			let modalRef = this.modalService.open(ModalAskComponent, {
				backdrop: 'static',
				keyboard: false,
				size: 'sm',
				centered: true
			});
			modalRef.componentInstance.content = 'Mật khẩu không được để trống';
			return;
		}


		if (this.loginForm.invalid) {
			Object.keys(controls).forEach(controlName =>
				controls[controlName].markAsTouched()
			);
			return;
		}

		this.isLoading$.next(true);

		const authData = {
			username: controls.username.value.toUpperCase(),
			password: controls.password.value
		};

		this.auth
			.loginNew(authData.username, authData.password)
			.pipe(
				flatMap(() => this.accountService.identity(authData.username, true)),
				tap(async user => {
					if (user) {
						this.router.navigateByUrl(this.stateStorageService.getUrl() || '/'); // Main page
					} else {
						this.authNoticeService.setNotice('Không thể đăng nhập');
					}
				}),
				takeUntil(this.unsubscribe),
				finalize(() => {
					this.isLoading$.next(false);
					this.cdr.markForCheck();
					this.isClickedLogin = false;
				})
			)
			.subscribe(() => {
				this.getListError();
			});
	}

	/**
	 * Checking control validation
	 *
	 * @param controlName: string => Equals to formControlName
	 * @param validationType: string => Equals to valitors name
	 */
	isControlHasError(controlName: string, validationType: string): boolean {
		const control = this.loginForm.controls[controlName];
		if (!control) {
			return false;
		}

		const result = control.hasError(validationType) && (control.dirty || control.touched);
		return result;
	}

	clearUser() {
		this.loginForm.controls.username.reset();
	}

	clearPassword() {
		this.loginForm.controls.password.reset();
	}

	focusout() {
		this.loginForm.updateValueAndValidity();
	}

	focusin() {
		this.loginForm.controls.username.setErrors(null);
		this.loginForm.controls.password.setErrors(null);
	}

	rememberUser() {
		this.isRememberUser = !this.isRememberUser;
		if (this.isRememberUser == true) {
			let user: any = {
				username: this.frm.username.value,
				password: this.frm.password.value,
				isSaveAccount: this.isRememberUser
			};
			localStorage.setItem('REMEMBER_USER', JSON.stringify(user));
		} else {
			localStorage.removeItem('REMEMBER_USER');
		}
	}

	get frm() {
		if (this.loginForm) {
			return this.loginForm.controls;
		}
	}

	getListError() {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		const seabReq = {
			seabReq: {
				header: header,
				body: {
					command: GET_ENQUIRY,
					enquiry: {
						authenType: GET_LIST_ERROR
					}
				}
			}
		};

		this.http.post(apiUrl, buildRequest(seabReq), {observe: 'response'})
			.pipe(map(res => getResponseApi(res.body)))
			.subscribe(res => {
				if (res && res.seabRes.body.status == STATUS_OK
					&& res.seabRes.body.responseCode == CODE_00) {
					// console.log(res, 'response list error');
					this.localStorage.store('listError', res.seabRes.body.data);
				}
			});

	}
}
