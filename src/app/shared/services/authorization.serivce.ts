import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LocalStorageService} from 'ngx-webstorage';
import {CACHE_CO_CODE, HEADER_PERMISSION, SEVER_API_URL_PERMISSION} from '../util/constant';
import {buildRequest, getResponseApi} from '../util/api-utils';
import {AppConfigService} from '../../app-config.service';


type EntityResponseType<T> = HttpResponse<T>;

@Injectable({
	providedIn: 'root'
})
export class AuthorizationSerivce {

	constructor(private http: HttpClient,
				private localStorage: LocalStorageService,
				private appConfigService: AppConfigService) {
	}

	callPostApiUserCoCode<R>(): Observable<R> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);


		let coCode = this.localStorage.retrieve(CACHE_CO_CODE);
		let request = {
			header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					authenType: 'getUserGroup',
					group_id: coCode
				}

			}
		};
		let bodyRequest = buildRequest(request, true);
		return this.http.post<R>(url, bodyRequest, {
			observe: 'response'
		})
			.pipe(map((res: EntityResponseType<R>) => {
				return getResponseApi(res.body);
			}));
	}

	callPostApiUserAuthoriserSeateller<R>(): Observable<R> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);

		let request = {
			header,
			body: {
				command: 'GET_ENQUIRY',
				enquiry: {
					authenType: 'getUserGroup',
					group_id: 'AUTHORISER-SEATELLER'
				}

			}
		};
		let bodyRequest = buildRequest(request, true);
		return this.http.post<R>(url, bodyRequest, {
			observe: 'response'
		})
			.pipe(map((res: EntityResponseType<R>) => {
				return getResponseApi(res.body);
			}));
	}
}
