import {LocalStorageService} from 'ngx-webstorage';
import {AppConfigService} from './../../../app-config.service';
import {CommonService} from './../../common-service/common.service';
import {BehaviorSubject} from 'rxjs';
import {finalize, map} from 'rxjs/operators';
// Angular
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {
	NavigationCancel,
	NavigationEnd,
	NavigationStart,
	RouteConfigLoadEnd,
	RouteConfigLoadStart,
	Router
} from '@angular/router';
// Object-Path
import * as objectPath from 'object-path';
// Loading bar
import {LoadingBarService} from '@ngx-loading-bar/core';
// Layout
import {LayoutConfigService, LayoutRefService} from '../../../core/_base/layout';
// HTML Class Service
import {HtmlClassService} from '../html-class.service';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import {ToastrService} from 'ngx-toastr';

import {T24RegisterComponent} from '../../pages/auth/t24/t24-register/t24-register.component';

import {ModalChangeCoCode} from '../../../shared/directives/modal-common/modal-change-cocode/modal-change-cocode.component';
import {ModalChangePass} from '../../pages/auth/t24/modal-change-pass/modal-change-pass.component';

import {T24Service} from '../../pages/auth/t24/t24.service';

import {
	CACHE_CO_CODE,
	CO_CODE_LIST,
	LIST_GROUP_WITH_NAME,
	LIST_GROUP_WITHOUT_NAME,
	LIST_USER_GROUP_SEATELLER, SEVER_API_T24_ENQUIRY,
	HEADER_API_T24_ENQUIRY
} from './../../../shared/util/constant';
import {HttpClient} from '@angular/common/http';

import {buildRequest, getResponseApi} from '../../../shared/util/api-utils';
import {betweenTwoDay} from './../../../shared/util/date-format-ultils';

declare var $: any;
import moment from 'moment';
import {ModalNotification} from '../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {WebsocketClientService} from '../../../shared/services/websocket-client.service';


@Component({
	selector: 'kt-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
	// Public properties
	menuHeaderDisplay: boolean;
	fluid: boolean;
	userName: any;
	passT24: any;
	userAD: any;
	userT24: any;
	dataT24: any;
	allGroup: any = [];
	userGroupList: any = [];
	groupWithName: any = [];
	group_id$: BehaviorSubject<any> = new BehaviorSubject('');
	user_id$: BehaviorSubject<any> = new BehaviorSubject('');
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	changePassBtn$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	today = new Date();
	isLoadingAccess$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);


	@ViewChild('ktHeader', {static: true}) ktHeader: ElementRef;
	@ViewChild('clickMe', {static: true}) clickMe: any;

	/**
	 * Component constructor
	 *
	 * @param router: Router
	 * @param layoutRefService: LayoutRefService
	 * @param layoutConfigService: LayoutConfigService
	 * @param loader: LoadingBarService
	 * @param htmlClassService: HtmlClassService
	 * @param modal
	 * @param toast
	 * @param t24Service
	 * @param commonService
	 * @param appConfigService
	 * @param localStorage
	 */
	constructor(
		private router: Router,
		private layoutRefService: LayoutRefService,
		private layoutConfigService: LayoutConfigService,
		public loader: LoadingBarService,
		public htmlClassService: HtmlClassService,
		public modal: NgbModal,
		private toast: ToastrService,
		private t24Service: T24Service,
		public commonService: CommonService,
		public appConfigService: AppConfigService,
		private localStorage: LocalStorageService,
		private websocketClientService: WebsocketClientService,
		private http: HttpClient
		// private dashboardComponent: DashboardNewComponent
	) {
		// page progress bar percentage
		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				// set page progress bar loading to start on NavigationStart event router
				this.loader.start();
			}
			if (event instanceof RouteConfigLoadStart) {
				this.loader.increment(35);
			}
			if (event instanceof RouteConfigLoadEnd) {
				this.loader.increment(75);
			}
			if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
				// set page progress bar loading to end on NavigationEnd event router
				this.loader.complete();
			}
		});
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		const config = this.layoutConfigService.getConfig();
		this.userName = JSON.parse(localStorage.getItem('userProfile')).shortName;
		this.websocketClientService.connect();
		// get menu header display option
		this.getAccess();
		// danh sách all groups
		this.getGroup();
		// lấy danh sách usergroup
		// this.getUserGroup();
		this.menuHeaderDisplay = objectPath.get(config, 'header.menu.self.display');

		// header width fluid
		this.fluid = objectPath.get(config, 'header.self.width') === 'fluid';

		// animate the header minimize the height on scroll down. to be removed, not applicable for default demo
		/*if (objectPath.get(config, 'header.self.fixed.desktop.enabled') || objectPath.get(config, 'header.self.fixed.desktop')) {
			// header minimize on scroll down
			this.ktHeader.nativeElement.setAttribute('data-ktheader-minimize', '1');
		}*/

	}

	ngOnDestroy() {
		this.commonService.isDisplayNotice$.next(false);
		this.commonService.timeT24$.next(null);
	}

	ngAfterViewInit(): void {
		// keep header element in the service
		this.layoutRefService.addElement('header', this.ktHeader.nativeElement);
	}

	public registerT24() {
		const modalRef = this.modal.open(T24RegisterComponent, {size: 'lg', windowClass: 'registerForm'});
		modalRef.componentInstance.userT24 = this.userT24;
		modalRef.componentInstance.userAD = this.userAD;

		modalRef.result.then((result) => {
			// this.commonService.isDisplayNotice$.next(false);
			this.getAccess();
		});
	}

	public changeCode() {
		const modalRef = this.modal.open(ModalChangeCoCode, {size: 'lg', windowClass: 'changeCodeDialog'});
		modalRef.componentInstance.groupList = this.groupWithName;
		modalRef.componentInstance.emitService.subscribe((emmitedValue) => {
			this.commonService.groupOwner$.next(emmitedValue.group_id);
			this.localStorage.store(CACHE_CO_CODE, emmitedValue.group_id);
			this.group_id$.next(emmitedValue.group_id);
			this.user_id$.next(emmitedValue.desc);
			// $(document).ready(() => {
			// 	$('#dbSearch').click();
			// });
		});
	}


	public changePass() {
		const modalRef = this.modal.open(ModalChangePass, {size: 'lg', windowClass: 'changePassDialog'});
		modalRef.componentInstance.userT24 = this.userT24;
		modalRef.componentInstance.userAD = this.userAD;
		modalRef.componentInstance.passT24 = this.passT24;

		modalRef.result.then((result) => {
			this.getAccess();
		});
	}

	//  check T24 account exists
	private getAccess() {
		this.isLoadingAccess$.next(false);
		this.userAD = this.userName.toString().toUpperCase();
		this.t24Service.getAccess(this.userName.toString().toUpperCase())
			.pipe(finalize(() => this.isLoadingAccess$.next(true)))
			.subscribe(res => {
				if (res.body.status == 'OK' && res.body.enquiry.responseCode == '00') {
					this.dataT24 = res.body.enquiry;
					this.userT24 = this.dataT24.username;
					this.passT24 = res.body.enquiry.password;
					// console.log('mật khẩu cũ', this.passT24);
					this.changePassBtn$.next(true);
					if (betweenTwoDay(this.dataT24.password_expire_time) < 100) {
						this.commonService.setNotifyInfo(`Mật khẩu đăng nhập T24 của bạn sẽ hết hạn vào ngày ${moment(this.dataT24.password_expire_time).format('DD-MM-YYYY')}. Vui lòng đổi lại mật khẩu trong mục Đăng ký/ đổi mật khẩu T24`,
							'warning', 86400000);
					}

					if (betweenTwoDay(this.dataT24.user_expire_time) < 100) {
						this.commonService.setNotifyInfo(`Tài khoản T24 của bạn sẽ hết hạn vào ngày ${moment(this.dataT24.user_expire_time).format('DD-MM-YYYY')}. Vui lòng liên hệ IT suport để gia hạn Tài khoản T24`,
							'warning', 86400000);
					}

					// trường hợp userT24 hết hạn
					if (betweenTwoDay(this.dataT24.user_expire_time) < 0) {
						const modalRef = this.modal.open(ModalNotification, {
							size: 'lg',
							windowClass: 'notificationDialog'
						});
						modalRef.componentInstance.textNotify = `Tài khoản T24 của bạn đã hết hạn vào ngày ${moment(this.dataT24.user_expire_time).format('DD-MM-YYYY')}. Vui lòng liên hệ IT support để gia hạn`;
					}
					// trường hợp password t24 hết hạn
					if (betweenTwoDay(this.dataT24.password_expire_time) < 0) {
						const modalRef = this.modal.open(ModalNotification, {
							size: 'lg',
							windowClass: 'notificationDialog'
						});
						modalRef.componentInstance.textNotify = `Tài khoản T24 của bạn đã hết hạn vào ngày ${moment(this.dataT24.password_expire_time).format('DD-MM-YYYY')}. Vui lòng cập nhật password mới để đăng nhập`;
					}

				} else if (res.error.code == '006') {
					this.commonService.setNotifyInfo('Chào mừng bạn tới SeATeller. Vui lòng vào mục Chức năng -> Đăng ký tài khoản T24 để liên kết tài khoản', 'warning', 86400000);
				} else {
					this.commonService.setNotifyInfo('Truy vấn thông tin T24 không thành công!', 'warning', 3000);
				}
			});
	}


	private getGroup() {
		// cache list all group -- group with name
		const cache = this.localStorage.retrieve(LIST_GROUP_WITH_NAME);
		if (cache) {
			this.allGroup = this.localStorage.retrieve(LIST_GROUP_WITH_NAME);
			this.getUserGroup(this.userName);
		} else {
			this.t24Service.getGroup()
				.pipe(
					finalize(() => this.getUserGroup(this.userName))
				)
				.subscribe(res => {
					if (res.seabRes.body.status == 'OK' && res.seabRes.body.enquiry.ResponseCode == '00') {
						//Danh sách cocode bắt đầu bằng VN
						this.allGroup = res.seabRes.body.enquiry.group;
						this.localStorage.store(LIST_GROUP_WITH_NAME, this.allGroup);
					} else {
						this.toast.error('Truy vấn danh sách chi nhánh không thành công', 'Lỗi');
					}
				});
		}
	}

	private getUserGroup(username) {
		// get group user -- group without name
		const cache = this.localStorage.retrieve(LIST_GROUP_WITHOUT_NAME);
		const cacheUserGroupSeATeller = this.localStorage.retrieve(LIST_USER_GROUP_SEATELLER);
		if (cache && cacheUserGroupSeATeller) {
			this.userGroupList = cache;
			this.saveCoCode();
		} else {
			this.isLoading$.next(true);
			this.t24Service.getUserGroup(username)
				.pipe(finalize(() => (this.isLoading$.next(false))))
				.subscribe(res => {
					if (res.seabRes.body.status == 'OK' && res.seabRes.body.enquiry.ResponseCode == '00') {
						//Danh sách cocode bắt đầu bằng VN
						this.userGroupList = res.seabRes.body.enquiry.user_group.filter(item => item.group_id.startsWith('VN'));
						let userGroupSeATeller = res.seabRes.body.enquiry.user_group.filter(item => item.group_id.includes('SEATELLER'));
						this.localStorage.store(LIST_USER_GROUP_SEATELLER, userGroupSeATeller);
						this.localStorage.store(LIST_GROUP_WITHOUT_NAME, this.userGroupList);
						this.saveCoCode();
					}
				});
		}
	}

	saveCoCode(): void {
		this.userGroupList.forEach(userGroup => {
			const group = this.allGroup.find(ele => ele.group_id == userGroup.group_id);
			if (group) {
				this.groupWithName.push(group);
			}
		});

		const coCode_cache = this.localStorage.retrieve(CACHE_CO_CODE);
		if (coCode_cache) {
			let cocodeObject = this.groupWithName.find(group => group.group_id == coCode_cache);
			this.group_id$.next(cocodeObject.group_id);
			this.user_id$.next(cocodeObject.desc);
			this.commonService.groupOwner$.next(coCode_cache);
		} else {
			this.group_id$.next(this.groupWithName[0].group_id);
			this.user_id$.next(this.groupWithName[0].desc);
			this.commonService.groupOwner$.next(this.groupWithName[0].group_id);
			this.localStorage.store(CACHE_CO_CODE, this.groupWithName[0].group_id);
		}

		this.localStorage.store(CO_CODE_LIST, this.groupWithName);
		// getTimeT24
		this.getTimeT24();
	}

	getTimeT24(): void {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		const seabReq = {
			header: header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					enqID: 'T24ENQ.SEAB.VB.DATES',
					company: this.commonService.groupOwner$.getValue()
					// company: ''
				}
			}
		};

		this.http.post(apiUrl, buildRequest(seabReq), {observe: 'response'})
			.pipe(map(res => getResponseApi(res.body)))
			.subscribe(res => {
				// console.log('TimeT2444444444444', res);
				if (res && res.body.status == 'OK') {
					this.commonService.timeT24$.next(moment(res.body.enquiry.t24DateInfo.today.trim()).format('DD-MM-YYYY'));
					console.log('Time T24',this.commonService.timeT24$.getValue());
				} else {
					//this.commonService.error(res.error.desc)
				}
			});
	}


}
