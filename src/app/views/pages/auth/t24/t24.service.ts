import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SessionStorageService} from 'ngx-webstorage';
import * as CryptoJS from 'crypto-js';
import {
	buildRequest,
	getResponseApi,
} from '../../../../shared/util/api-utils';
import {AuthHttpService} from '../../../../shared/services/auth-http.service';
import {AppConfigService} from '../../../../app-config.service';
import {HEADER_API_USERMAN, HEADER_PERMISSION, SERVER_API_USERMAN, SEVER_API_URL_PERMISSION} from '../../../../shared/util/constant';

@Injectable({
	providedIn: 'root',
})
export class T24Service {
	private SECRET_KEY = 'kH326&^$mso)821B';

	constructor(
		private _http: HttpClient,
		private _session: SessionStorageService,
		private authHttpService: AuthHttpService,
		private appConfigService: AppConfigService
	) {
	}

	// get list usergroups
	getUserGroup(username): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);


		const bodyReq = {
			header: header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					authenType: 'getUserGroup',
					user_id: username,
					// group_id: "",
				},
			},
		};
		const req = buildRequest(bodyReq, true);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	//get all Group with name
	getGroup(): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);

		const bodyReq = {
			header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					authenType: 'getGroups',
				},
			},
		};
		const req = buildRequest(bodyReq, true);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	getAccess(username: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_USERMAN);
		const header = this.appConfigService.getConfigByKey(HEADER_API_USERMAN);
		const bodyReq = {
			header: header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					authenType: 'getAccess',
					userAD: username,
					systemID: 'T24',
				},
			},
		};
		const req = buildRequest(bodyReq, false);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	regAccess(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_USERMAN);
		const header = this.appConfigService.getConfigByKey(HEADER_API_USERMAN);
		const bodyReq = {
			header: header,
			body: {
				command: 'GET_TRANSACTION',
				transaction: {
					authenType: 'regAccess',
					userAD: body.userAD,
					username: body.username,
					password: this.encryptPassword(body.password),
					systemID: 'T24',
				},
			},
		};
		const req = buildRequest(bodyReq, false);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	checkExitstAccess(username: any) {
		const url = this.appConfigService.getConfigByKey(SERVER_API_USERMAN);
		const header = this.appConfigService.getConfigByKey(HEADER_API_USERMAN);
		const bodyReq = {
			header: header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					authenType: 'getUserAccess',
					username: username,
					systemID: 'T24',
				},
			},
		};
		const req = buildRequest(bodyReq, false);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	changeAccess(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_USERMAN);
		const header = this.appConfigService.getConfigByKey(HEADER_API_USERMAN);
		const bodyReq = {
			header: header,
			body: {
				command: 'GET_TRANSACTION',
				transaction: {
					authenType: 'changeAccess',
					userAD: body.userAD,
					username: body.username,
					password: this.encryptPassword(body.password),
					systemID: 'T24',
				},
			},
		};
		const req = buildRequest(bodyReq, false);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	changePassT24(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_USERMAN);
		const header = this.appConfigService.getConfigByKey(HEADER_API_USERMAN);
		const bodyReq = {
			header: header,
			body: {
				command: 'GET_TRANSACTION',
				transaction: {
					authenType: 'changePasswordT24',
					userT24ID: body.username,
					// newPassword: this.encryptPassword(body.password)
					newPassword: body.password
				}
			}
		};
		const req = buildRequest(bodyReq, false);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	deleteAccess(body): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_USERMAN);
		const header = this.appConfigService.getConfigByKey(HEADER_API_USERMAN);
		const bodyReq = {
			header: header,
			body: {
				command: 'GET_TRANSACTION',
				transaction: {
					'authenType': 'deleteAccess',
					'userAD': body,
					'systemID': 'T24'

				}
			}
		};
		const req = buildRequest(bodyReq, false);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

	private encryptPassword(password: string): string {
		const pwd = this.reveseString(password);
		try {
		} catch (e) {
		}

		const _key = this.getBytesFromString(this.SECRET_KEY);
		const _iv = this.getBytesFromString(this.SECRET_KEY);

		const encrypted = CryptoJS.AES.encrypt(
			this.getBytesFromString(pwd),
			_key,
			{
				keySize: 16,
				iv: _iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
			}
		);
		return encrypted.toString();
	}

	private reveseString(str: string): string {
		return str.split('').reverse().join('');
	}

	private getBytesFromString(src: string) {
		return CryptoJS.enc.Utf8.parse(src);
	}
}
