import {
	CACHE_CO_CODE,
	CODE_00,
	GET_LIST_FILES,
	GET_TRANSACTION,
	LIST_GROUP_WITH_NAME,
	SERVER_API_CUST_INFO,
	STATUS_OK
} from './../../shared/util/constant';
import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {RequestApiModel} from '../../shared/model/request-api';
import {finalize, map} from 'rxjs/operators';
import {AuthHttpService} from '../../shared/services/auth-http.service';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {BodyRequestTransactionModel} from '../model/body-request-transaction.model';
import {
	COMMON_ERROR,
	ERROR_SEATELLER,
	ERROR_SEATELLER_ADMIN,
	ERROR_SEATELLER_AUTHENAPI,
	ERROR_SEATELLER_CARD,
	ERROR_SEATELLER_CARDOPCDEAPI,
	ERROR_SEATELLER_CARDQUERYAPI,
	ERROR_SEATELLER_CUST_INFO,
	ERROR_SEATELLER_EBANK,
	ERROR_SEATELLER_PERMISSION,
	ERROR_SEATELLER_REPORT,
	ERROR_SEATELLER_SEAPAY_ACCOUNT,
	ERROR_SEATELLER_T24,
	ERROR_SEATELLER_UTILITY,
	GET_CUSTOMER_INFO_BY_ID,
	GET_ENQUIRY,
	HEADER_ACC_UTIL,
	HEADER_API_ADMIN_MANAGER,
	HEADER_API_T24_ENQUIRY,
	HEADER_EBANK,
	HEADER_SEA_PAY_ACCOUNT,
	HEADER_SEATELLER,
	HEADER_UTILITY,
	HTTP_STATUS,
	MAP_USER_MATRIX_CACHE,
	SERVER_API_URL_ACC_UTIL,
	SERVER_SEA_PAY_ACCOUNT_URL,
	SEVER_API_REPORT,
	SEVER_API_T24_ENQUIRY,
	SEVER_API_URL_ADMIN_MANAGER,
	SEVER_API_URL_CARD,
	SEVER_API_URL_CARD_ENQUIRY,
	SEVER_API_URL_CARD_ENQUIRY_OPDCE,
	SEVER_API_URL_E_BANK,
	SEVER_API_URL_LOGIN,
	SEVER_API_URL_PERMISSION,
	SEVER_API_URL_SEATELLER,
	SEVER_API_URL_UTILITY,
	USER_PROFILE
} from '../../shared/util/constant';
import {buildRequest, getResponseApi} from '../../shared/util/api-utils';
import {AppConfigService} from '../../app-config.service';
import {BodyRequestEnquiryModel} from '../model/body-request-enquiry-model';
import {CustomerInfoModel} from '../pages/apps/components/combo/customer-info/customer-info-model';
import {EnquiryModel} from '../model/enquiry.model';
import {IErrorModel, ResultModel} from '../model/resend.model';

@Injectable({
	providedIn: 'root'
})
export class CommonService implements OnDestroy {
	changeCustomerGTTT$: BehaviorSubject<any> = new BehaviorSubject(false);
	isLoadingSubject: BehaviorSubject<any> = new BehaviorSubject(false);
	isNiceAccountNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isClickedButton$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isAsideRight$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isDisplayAsideRight$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	activeTab$: BehaviorSubject<number> = new BehaviorSubject(0);
	isDisplayNotice$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isRemovingCustomer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	dataQA$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	isCheckedTKTT$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	selectUpdateCus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	cusTransId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	cardTransId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	groupOwner$: BehaviorSubject<any> = new BehaviorSubject('');
	customerId$: BehaviorSubject<any> = new BehaviorSubject('');
	closeSms$ = new BehaviorSubject<boolean>(false);

	textNotify$: BehaviorSubject<any> = new BehaviorSubject<any>('');
	statusNotify$: BehaviorSubject<any> = new BehaviorSubject<any>('');
	colorNotify$: BehaviorSubject<any> = new BehaviorSubject<any>('');
	timeOutNotify$: BehaviorSubject<number> = new BehaviorSubject<number>(5);
	bgColorNotify$: BehaviorSubject<any> = new BehaviorSubject<any>('#E8FFDB');
	pathImage$: BehaviorSubject<any> = new BehaviorSubject<any>('assets/media/icons/svg/Header/comment-alt-exclamation1.svg');
	isUpdateSMS$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdateCus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdateProspectId$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdateAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdateCombo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	manageAble$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	customerDataObject$: BehaviorSubject<CustomerInfoModel> = new BehaviorSubject<CustomerInfoModel>(null);
	prospectCustomerData$: BehaviorSubject<CustomerInfoModel> = new BehaviorSubject<CustomerInfoModel>(null);
	isNotifyHasCancel$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	generalInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	tranIdGlobal$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	secondaryCard$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	isUpdateSignature$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdateCustomer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isComboComponent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isExCombo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	timeT24$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	isDisabledCustomerForm$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	dataBase64$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	accountNameGlobal$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	homeAddressGlobal$: BehaviorSubject<string> = new BehaviorSubject<string>('');

	isAction360$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isFoundCustomerInfo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	customerIdAside$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	filesUploadByUserId: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	accountInfo$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	isLoadingFiles$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isDisplayFile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	filesUploadCombo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	filesCombo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isPredictUserExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	mobileAutoFill$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	emailAutoFill$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	accountError$ = new BehaviorSubject<string>(null);
	customerError$ = new BehaviorSubject<string>(null);
	smsError$ = new BehaviorSubject<string>(null);
	ebankError$ = new BehaviorSubject<string>(null);
	cardError$ = new BehaviorSubject<string>(null);
	isLoadingRefresh$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isShowEbank$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isShowSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	customerStatus$ = new BehaviorSubject<string>(null);
	accountStatus$ = new BehaviorSubject<string>(null);
	smsStatus$ = new BehaviorSubject<string>(null);
	ebankStatus$ = new BehaviorSubject<string>(null);
	cardStatus$ = new BehaviorSubject<string>(null);
	comboStatus$ = new BehaviorSubject<string>(null);
	canReupdateCustomer$ = new BehaviorSubject<boolean>(false);
	canReupdateAccount$ = new BehaviorSubject<boolean>(false);
	canReupdateSms$ = new BehaviorSubject<boolean>(false);
	canReupdateEbank$ = new BehaviorSubject<boolean>(false);
	canReupdateCard$ = new BehaviorSubject<boolean>(false);
	enableErrorForm$ = new BehaviorSubject<boolean>(false);

	checkCusExists$ = new BehaviorSubject<boolean>(false);

	maxLengthAddress$ = new BehaviorSubject<boolean>(false);

	//TODO true nếu KH cũ đã có SMS;
	isExistedSmsForExCustomer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private authHttpService: AuthHttpService,
				private router: Router,
				private localStorage: LocalStorageService,
				private sessionService: SessionStorageService,
				private appConfigService: AppConfigService,
	) {
	}

	ngOnDestroy(): void {
		this.isNiceAccountNumber$.next(false);
		this.isDisplayNotice$.next(false);

		this.customerStatus$ = new BehaviorSubject<string>(null);
		this.accountStatus$ = new BehaviorSubject<string>(null);
		this.smsStatus$ = new BehaviorSubject<string>(null);
		this.ebankStatus$ = new BehaviorSubject<string>(null);
		this.cardStatus$ = new BehaviorSubject<string>(null);
		this.canReupdateCustomer$ = new BehaviorSubject<boolean>(false);
		this.canReupdateAccount$ = new BehaviorSubject<boolean>(false);
		this.canReupdateSms$ = new BehaviorSubject<boolean>(false);
		this.canReupdateEbank$ = new BehaviorSubject<boolean>(false);
		this.canReupdateCard$ = new BehaviorSubject<boolean>(false);
		this.enableErrorForm$ = new BehaviorSubject<boolean>(false);

		this.accountError$ = new BehaviorSubject<string>(null);
		this.customerError$ = new BehaviorSubject<string>(null);
		this.smsError$ = new BehaviorSubject<string>(null);
		this.ebankError$ = new BehaviorSubject<string>(null);
		this.cardError$ = new BehaviorSubject<string>(null);
	}

	actionGetEnquiryResponseApi(body: any): Observable<any> {

		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}
		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		header.userID = username;
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), true), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				// console.log('enquiry api res =>>>>>>', res);
				if (res && res.seabRes.body.status == 'OK') {
					return res.seabRes.body;
				} else {
					// this.error(res.seabRes.error.desc)
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}
	actionGetEnquiryResponseApiSave(body: any): Observable<any> {

		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}
		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		header.userID = username;
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), true), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				console.log('enquiry api res =>>>>>>', res);
				if (res && res.seabRes.body.enquiry.responseCode == '00') {
					return res.seabRes.body;
				} else {
					// this.error(res.seabRes.error.desc)
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}


	getResponseEnquiryEBankT24Api(body: any): Observable<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}

		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_E_BANK);
		let header = this.appConfigService.getConfigByKey(HEADER_EBANK);
		header.userID = username;

		this.isLoadingSubject.next(true);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), false), url).pipe(
			map(res => getResponseApi(res)),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	actionGetTransactionResponseApi(body: BodyRequestTransactionModel): Observable<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}
		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		header.userID = username;
		body.command = 'GET_TRANSACTION';
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), true), url).pipe(
			map(res => getResponseApi(res)),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}


	getAccountLockEntry(body: any, isSeabReq ?: boolean): Observable<any> {
		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		let header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), isSeabReq), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				// console.log('getListCustomerIfnfores -------->', res)
				return res;
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}


	getClosedAccInfo(body: any, isSeabReq ?: boolean): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_URL_ACC_UTIL);
		let header = this.appConfigService.getConfigByKey(HEADER_ACC_UTIL);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), isSeabReq), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				return res;
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}


	actionGetEnquiryUtility(body: BodyRequestEnquiryModel): Observable<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}
		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_UTILITY);
		let header = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		header.userID = username;
		body.command = GET_ENQUIRY;
		// console.log(url, 'url utility')
		// console.log(header, 'header')
		// console.log(new RequestApiModel(header, body), 'request')
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), false), url).pipe(
			map((model: any) => {
				// console.log(new RequestApiModel(header, body), 'request')
				let res = getResponseApi(model);
				// console.log('enquiry api res =>>>>>>', res);
				if (res && res.body.status == 'OK') {
					return res.body;
				} else {
					return res.error;
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	async getEnquiryUtility(body: any): Promise<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(undefined);
				}, 1000);
			});
		}
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_UTILITY);
		let header = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		header.userID = username;
		try {
			let response = await this.authHttpService
				.callPostApiAsync<any>(buildRequest(new RequestApiModel(header, body), false), url);
			// console.log('response:', getResponseApi(response.body));
			if (response.status === HTTP_STATUS.OK) {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						resolve(getResponseApi(response.body));
					}, 1000);
				});
			}
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(undefined);
				}, 1000);
			});
		} catch (error) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(undefined);
				}, 1000);
			});
		}
	}

	async getEnquiryAccUtility(body: any): Promise<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(undefined);
				}, 1000);
			});
		}
		const url = this.appConfigService.getConfigByKey(SERVER_API_URL_ACC_UTIL);
		let header = this.appConfigService.getConfigByKey(HEADER_ACC_UTIL);
		header.userID = username;
		try {
			let response = await this.authHttpService
				.callPostApiAsync<any>(buildRequest(new RequestApiModel(header, body), false), url);
			// console.log('response:', getResponseApi(response.body));
			if (response.status === HTTP_STATUS.OK) {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						resolve(getResponseApi(response.body));
					}, 1000);
				});
			}
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(undefined);
				}, 1000);
			});
		} catch (error) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(undefined);
				}, 1000);
			});
		}
	}

	public setNotifyInfo(text: string, status: string, timeOut: number) {
		window.scroll(0, 0);
		this.isDisplayNotice$.next(false);
		this.textNotify$.next(text);
		this.statusNotify$.next(status);
		this.timeOutNotify$.next(timeOut);
		if (status.toString().toLowerCase() == 'success') {
			this.colorNotify$.next('#63D327');
			this.bgColorNotify$.next('#E8FFDB');
			this.pathImage$.next('assets/media/icons/svg/Header/comment-alt-exclamation1.svg');
		} else {
			this.colorNotify$.next('#F05849');
			this.bgColorNotify$.next('#FFD0D4');
			this.pathImage$.next('assets/media/icons/svg/Header/comment-alt-exclamation.svg');
		}
		this.isDisplayNotice$.next(true);
		this.setDisplayNoti(timeOut);

	}

	public success(text: string) {
		window.scroll(0, 0);
		this.isDisplayNotice$.next(false);
		this.textNotify$.next(text);
		this.timeOutNotify$.next(3000);

		this.colorNotify$.next('#63D327');
		this.bgColorNotify$.next('#E8FFDB');
		this.pathImage$.next('assets/media/icons/svg/Header/comment-alt-exclamation1.svg');
		this.isDisplayNotice$.next(true);
		this.setDisplayNoti(3000);

	}

	public error(text: string) {
		window.scroll(0, 0);
		this.isDisplayNotice$.next(false);
		this.textNotify$.next(text);
		this.timeOutNotify$.next(5000);

		this.colorNotify$.next('#F05849');
		this.bgColorNotify$.next('#FFD0D4');
		this.pathImage$.next('assets/media/icons/svg/Header/comment-alt-exclamation.svg');
		this.isDisplayNotice$.next(true);
		this.setDisplayNoti(5000);

	}

	public setDisplayNoti(timeOut) {
		// console.log('timeoutDisplay', timeOut);
		setTimeout(() => {
			this.isDisplayNotice$.next(false);
		}, timeOut);
	}


	/**
	 * return rightid tuong ung voi url
	 * @param url
	 */
	public getRightIdsByUrl(url: string): string[] {
		let userMatrix = this.sessionService.retrieve(MAP_USER_MATRIX_CACHE);
		return userMatrix.reduce((acc, current) => {
			if (url.includes(current.function_id)) {
				return acc.concat(current.right_id);
			} else {
				return acc;
			}
		}, []);
	}

	/**
	 * get username logged in
	 */
	getUserAD(): string {
		const user = localStorage.getItem(USER_PROFILE);
		if (user) {
			return JSON.parse(user).shortName;
		}
		return '';
	}


	getListSlaByUserGroup(bodyReq: any): Observable<any> {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		const seabReq = {
			seabReq: {
				header: header,
				body: bodyReq
			}
		};


		// console.log("body req ======================>>>", JSON.stringify(seabReq))
		return this.authHttpService.callPostApi(buildRequest(seabReq, false), apiUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	getListCustomerInfo(body: any, isSeabReq ?: boolean): Observable<any> {
		this.isLoadingSubject.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		let header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), isSeabReq), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				// console.log('getListCustomerIfnfores -------->', res)
				return res;

			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	getListNiceAccount(enquiry: any): Observable<any> {
		const apiUrl = this.appConfigService.getConfigByKey(SERVER_SEA_PAY_ACCOUNT_URL);
		const header = this.appConfigService.getConfigByKey(HEADER_SEA_PAY_ACCOUNT);
		const seabReq = {

			header: header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: enquiry
			},


		};

		// console.log("body req ======================>>>", JSON.stringify(seabReq))
		return this.authHttpService.callPostApi(buildRequest(seabReq, false), apiUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	getVipAccountNumberInfo(enquiry: any): Observable<any> {
		const apiUrl = this.appConfigService.getConfigByKey(SERVER_SEA_PAY_ACCOUNT_URL);
		const header = this.appConfigService.getConfigByKey(HEADER_SEA_PAY_ACCOUNT);
		const seabReq = {

			header: header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: enquiry
			},


		};

		// console.log("body req ======================>>>", JSON.stringify(seabReq))
		return this.authHttpService.callPostApi(buildRequest(seabReq, false), apiUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	getWrongEntryPinCodeInfoByTokenCard(body: any, header: any, url: string): Observable<any> {
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), false), url).pipe(
			map((model: any) => {
				return getResponseApi(model);
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	getCardLimitInfo(body: any, header: any, url: string): Observable<any> {
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), false), url).pipe(
			map((model: any) => {
				return getResponseApi(model);
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	getListError() {
		let listError = this.localStorage.retrieve('listError');
		if (listError) {
			return listError;
		}
		return null;
	}

	displayError(url: string, responseCode: string) {

		let listAllError: any[] = this.getListError();

		if (listAllError) {
			let listAllCode: any[] = [];
			listAllError.forEach((r) => {
				listAllCode.push(r.msgCode);
			});
			let msgCode = this.getMsgCode(url, responseCode);
			// fix thong bao cho ebankInfo, acct
			if ((msgCode == 'SEATELLER-EBANK-203' || msgCode == 'SEATELLER-CUSTINFO-103') && (this.router.url.includes('combo'))) {
				msgCode = null;
			}
			if ((msgCode == 'SEATELLER-SEAPAYACCOUNT-21') && (this.router.url.includes('combo'))) {
				msgCode = null;
			}
			// console.log(msgCode, "msgCOde")
			if (msgCode) {
				if (listAllCode.includes(msgCode)) {
					let msg = listAllError.find(r => {
						return (r.msgCode == msgCode);
					});

					if (msg) {
						this.error(msg.contentVi);
						return;
					}
				} else {
					this.error(COMMON_ERROR + '  ' + msgCode);
				}
			}
		}
	}

	getMsgCode(url, responseCode) {
		let msgCode: any;

		if (responseCode != undefined) {
			switch (url) {
				case this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER): {
					msgCode = `${ERROR_SEATELLER}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_LOGIN): {
					msgCode = `${ERROR_SEATELLER_AUTHENAPI}${responseCode}`;
					return msgCode;
				}
				case this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO): {
					msgCode = `${ERROR_SEATELLER_CUST_INFO}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_E_BANK): {
					msgCode = `${ERROR_SEATELLER_EBANK}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_CARD): {
					msgCode = `${ERROR_SEATELLER_CARD}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_CARD_ENQUIRY): {
					msgCode = `${ERROR_SEATELLER_CARDQUERYAPI}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_CARD_ENQUIRY_OPDCE): {
					msgCode = `${ERROR_SEATELLER_CARDOPCDEAPI}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION): {
					msgCode = `${ERROR_SEATELLER_PERMISSION}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER): {
					msgCode = `${ERROR_SEATELLER_ADMIN}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY): {
					msgCode = `${ERROR_SEATELLER_T24}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_REPORT): {
					msgCode = `${ERROR_SEATELLER_REPORT}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(GET_CUSTOMER_INFO_BY_ID): {
					msgCode = `${ERROR_SEATELLER_CUST_INFO}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SERVER_SEA_PAY_ACCOUNT_URL): {
					msgCode = `${ERROR_SEATELLER_SEAPAY_ACCOUNT}${responseCode}`;
					return msgCode;
				}

				case this.appConfigService.getConfigByKey(SEVER_API_URL_UTILITY): {
					msgCode = `${ERROR_SEATELLER_UTILITY}${responseCode}`;
					return msgCode;
				}
			}
		} else {
			return;
		}
	}

	getFilesByCustomerId(customerId: string) {
		this.isLoadingFiles$.next(true);
		let command = GET_ENQUIRY;
		let enquiry = new EnquiryModel();
		enquiry.authenType = GET_LIST_FILES;
		enquiry.data = {
			transactionId: '',
			customerId: customerId
		};
		let body = new BodyRequestEnquiryModel(command, enquiry);
		// console.log(body, 'body for files')
		this.actionGetEnquiryResponseApi(body)
			.pipe(finalize(() => {
				this.isLoadingFiles$.next(false);
				this.isDisplayFile$.next(true);
			}))
			.subscribe(res => {
				// console.log(res, 'response for signature')
				if (res && res.status == STATUS_OK) {
					this.filesUploadByUserId.next(res.enquiry.product);
					this.customerIdAside$.next(customerId);
				}
			});
	}

	refreshError(tranId) {
		this.isLoadingRefresh$.next(true);

		const bodyRequest = {
			command: GET_ENQUIRY,
			enquiry: {
				authenType: 'getResultApproving',
				data: {
					id: tranId
				}
			}
		};

		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, bodyRequest), true), url)
			.pipe(
				map(res => {
					const response = getResponseApi(res);
					if (response.seabRes.body.status == STATUS_OK && response.seabRes.body.enquiry.responseCode == CODE_00) {
						const error = response.seabRes.body.enquiry.product;
						let result: IErrorModel = new class implements IErrorModel {
							account: ResultModel = new ResultModel();
							card: ResultModel = new ResultModel();
							customer: ResultModel = new ResultModel();
							ebank: ResultModel = new ResultModel();
							sms: ResultModel = new ResultModel();
							extraCard: ResultModel = new ResultModel();
						};
						// tao customer
						if (error.customer) {
							switch (error.customer.status) {
								case 'ERROR':
									this.canReupdateCustomer$.next(true);
									this.canReupdateAccount$.next(true);
									this.canReupdateEbank$.next(true);
									this.canReupdateSms$.next(true);
									this.canReupdateCard$.next(true);
									this.customerError$.next(error.customer.error);
									break;
								case 'SUCCESS':
									this.canReupdateCustomer$.next(false);
									const resultID = error.customer.resultID ? error.customer.resultID : null;
									this.customerError$.next(resultID);
									result.customer.resultID = resultID;
									break;
								default:
									this.canReupdateCustomer$.next(true);
									this.canReupdateAccount$.next(true);
									this.canReupdateEbank$.next(true);
									this.canReupdateSms$.next(true);
									this.canReupdateCard$.next(true);
									break;
							}
							this.customerStatus$.next(error.customer.status);
						} else {
							this.customerError$.next(this.customerId$.value);
						}
						if (error.account) {
							switch (error.account.status) {
								case 'ERROR':
									this.canReupdateAccount$.next(true);
									this.accountError$.next(error.account.error);
									break;
								case 'SUCCESS':
									this.canReupdateAccount$.next(false);
									const resultID = error.account.resultID ? error.account.resultID : null;
									this.accountError$.next(resultID);
									result.account.resultID = resultID;
									break;
								default:
									this.canReupdateAccount$.next(true);
							}
							this.accountStatus$.next(error.account.status);
						}
						if (error.ebank) {
							switch (error.ebank.status) {
								case 'ERROR':
									this.canReupdateEbank$.next(true);
									this.ebankError$.next(error.ebank.error);
									break;
								case 'SUCCESS':
									this.canReupdateEbank$.next(false);
									const resultID = error.ebank.resultID ? error.ebank.resultID : null;
									this.ebankError$.next(resultID);
									result.ebank.resultID = resultID;
									break;
								default:
									this.canReupdateEbank$.next(true);
							}
							this.ebankStatus$.next(error.ebank.status);
						}
						if (error.card) {
							switch (error.card.status) {
								case 'ERROR':
									this.canReupdateCard$.next(true);
									this.cardError$.next(error.card.error);
									break;
								case 'SUCCESS':
									this.canReupdateCard$.next(false);
									const resultID = error.card.resultID ? error.card.resultID : null;
									this.cardError$.next(resultID);
									result.card.resultID = resultID;
									break;
								default:
									this.canReupdateCard$.next(true);
							}
							this.cardStatus$.next(error.card.status);
						}
						if (error.sms) {
							switch (error.sms.status) {
								case 'ERROR':
									this.canReupdateSms$.next(true);
									this.smsError$.next(error.sms.error);
									break;
								case 'SUCCESS':
									this.canReupdateSms$.next(false);
									const resultID = error.sms.resultID ? error.sms.resultID : null;
									this.smsError$.next(resultID);
									result.sms.resultID = resultID;
									break;
								default:
									this.canReupdateSms$.next(true);
							}
							this.smsStatus$.next(error.sms.status);
						}
						if (error.secondaryCard && error.secondaryCard.length) {
							let cardId = this.cardError$.getValue();
							error.secondaryCard.forEach(id => {
								if (id.resultID) {
									cardId = cardId + '#' + id.resultID;
								}
							});
							this.cardError$.next(cardId);
							result.extraCard.resultID = cardId;
						}
						if (error.status) {
							this.comboStatus$.next(error.status);
						}
						return result;
					}
					return null;
				}),
				finalize(() => this.isLoadingRefresh$.next(false))
			);
	}

	destroyError() {
		this.accountError$.next(null);
		this.customerError$.next(null);
		this.smsError$.next(null);
		this.ebankError$.next(null);
		this.cardError$.next(null);

		this.customerStatus$.next(null);
		this.accountStatus$.next(null);
		this.smsStatus$.next(null);
		this.ebankStatus$.next(null);
		this.cardStatus$.next(null);

		this.canReupdateCard$.next(false);
		this.canReupdateSms$.next(false);

		this.canReupdateEbank$.next(false);
		this.canReupdateAccount$.next(false);
		this.canReupdateCustomer$.next(false);

		this.enableErrorForm$.next(false);
		this.comboStatus$.next(null);
	}

	checkSpecialChar(event: any): boolean {
		var keynum;
		var keychar;

		// For Internet Explorer
		if (window.event) {
			keynum = event.keyCode;
		}
		// For Netscape/Firefox/Opera
		else if (event.which) {
			keynum = event.which;
		}
		keychar = String.fromCharCode(keynum);
		//List of special characters you want to restrict
		if (keychar == '\'' || keychar == '`' || keychar == '!' || keychar == '@' || keychar == '#' || keychar == '$' || keychar == '%' || keychar == '^' || keychar == '&' || keychar == '*' || keychar == '(' || keychar == ')' || keychar == '-' || keychar == '_' || keychar == '+' || keychar == '=' || keychar == '/' || keychar == '~' || keychar == '<' || keychar == '>' || keychar == ',' || keychar == ';' || keychar == ':' || keychar == '|' || keychar == '?' || keychar == '{' || keychar == '}' || keychar == '[' || keychar == ']' || keychar == '¬' || keychar == '£' || keychar == '"' || keychar == '\\') {
			return false;
		} else {
			return true;
		}
	}

	getCurrentBranch() {
		const branchs = this.localStorage.retrieve(LIST_GROUP_WITH_NAME);
		const branch = this.localStorage.retrieve(CACHE_CO_CODE);
		return branchs.find(b => b.group_id == branch);
	}


	/**
	 * Convert from amount to vietnamese
	 * @Copyright of Dong Hung Phung <donghung.viethanit@gmail.com>
	 * @param amount
	 */
	private mangso = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

	private dochangchuc(so, daydu) {
		var chuoi = '';
		let chuc = Math.floor(so / 10);
		let donvi = so % 10;
		if (chuc > 1) {
			chuoi = ' ' + this.mangso[chuc] + ' mươi';
			if (donvi == 1) {
				chuoi += ' mốt';
			}
		} else if (chuc == 1) {
			chuoi = ' mười';
			if (donvi == 1) {
				chuoi += ' một';
			}
		} else if (daydu && donvi > 0) {
			chuoi = ' lẻ';
		}
		if (donvi == 5 && chuc > 1) {
			chuoi += ' lăm';
		} else if (donvi > 1 || (donvi == 1 && chuc == 0)) {
			chuoi += ' ' + this.mangso[donvi];
		}
		return chuoi;
	}

	private docblock(so, daydu) {
		var chuoi = '';
		let tram = Math.floor(so / 100);
		so = so % 100;
		if (daydu || tram > 0) {
			chuoi = ' ' + this.mangso[tram] + ' trăm';
			chuoi += this.dochangchuc(so, true);
		} else {
			chuoi = this.dochangchuc(so, false);
		}
		return chuoi;
	}

	private dochangtrieu(so, daydu) {
		var chuoi = '';
		let trieu = Math.floor(so / 1000000);
		so = so % 1000000;
		if (trieu > 0) {
			chuoi = this.docblock(trieu, daydu) + ' triệu';
			daydu = true;
		}
		let nghin = Math.floor(so / 1000);
		so = so % 1000;
		if (nghin > 0) {
			chuoi += this.docblock(nghin, daydu) + ' nghìn';
			daydu = true;
		}
		if (so > 0) {
			chuoi += this.docblock(so, daydu);
		}
		return chuoi;
	}

	//Tổng tiền chữ
	amountToVietNamese(so) {
		if (so == 0 || so == '0') {
			return '';
		}
		var chuoi = '', hauto = '';
		do {
			let ty = so % 1000000000;
			so = Math.floor(so / 1000000000);
			if (so > 0) {
				chuoi = this.dochangtrieu(ty, true) + hauto + chuoi;
			} else {
				chuoi = this.dochangtrieu(ty, false) + hauto + chuoi;
			}
			hauto = ' tỷ';
		} while (so > 0);
		let string = chuoi.trim();
		return string.charAt(0).toUpperCase() + string.slice(1) + ' đồng';
	}

	formatCurrency(_n, unit?: string) {
		const dv = unit ? unit : '';
		const n = Number(_n);
		if ((n == 0) || (!n)) {
			return '';
		}
		return n.toFixed(0).replace(/./g, function(c, i, a) {
			return i > 0 && c !== '.' && (a.length - i) % 3 === 0 ? ',' + c : c;
		}) + ' ' + dv;
	}

	deleteFileById(id: string): Observable<any> {
		const body = {
			command: GET_TRANSACTION,
			transaction: {
				authenType: 'deleteFile',
				data: {
					id
				}
			}
		};

		return this.actionGetTransactionResponseApi(body);
	}

	removeSavedRecord(inputter: string, score: string): Observable<any> {
		const body = {
			command: GET_TRANSACTION,
			transaction: {
				"authenType": "deleteComboTemp",
                "data": {
                    "inputter": inputter,
                    "score": score
                }

			}
		}
		return this.actionGetTransactionResponseApi(body);

	}
}
