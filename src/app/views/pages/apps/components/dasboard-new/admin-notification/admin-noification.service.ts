import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AppConfigService} from '../../../../../../app-config.service';
import {APP_ID, HEADER_API_ADMIN_MANAGER, SEVER_API_URL_ADMIN_MANAGER} from '../../../../../../shared/util/constant';
import {buildRequest, getResponseApi} from '../../../../../../shared/util/api-utils';
import {AuthHttpService} from '../../../../../../shared/services/auth-http.service';
import {map} from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AdminNoificationService {

	constructor(
		private authHttpService: AuthHttpService,
		private appConfigService: AppConfigService
	) {
	}

	getListNotificaion(title: string, fromDate: string, toDate: string): Observable<any> {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		const appID = this.appConfigService.getConfigByKey(APP_ID);
		const body = {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'GetListNotification',
				title: title ? title : '',
				fromDate: fromDate,
				toDate: toDate,
				appID: appID
			}
		};

		const request = {
			seabReq: {
				header,
				body
			}
		};

		return this.authHttpService.callPostApi(buildRequest(request), apiUrl)
			.pipe(map(res => getResponseApi(res)));

	}
}
