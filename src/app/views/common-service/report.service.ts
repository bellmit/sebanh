import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from '../../app-config.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {finalize, map} from 'rxjs/operators';
import {buildRequest, getResponseApi} from '../../shared/util/api-utils';
import {CommonService} from './common.service';
import {HEADER_SEATELLER, SEVER_API_URL_SEATELLER} from '../../shared/util/constant';
import {LocalStorageService} from 'ngx-webstorage';
import {RequestApiModel} from '../../shared/model/request-api';
import {AuthHttpService} from '../../shared/services/auth-http.service';

@Injectable({
	providedIn: 'root'
})
export class ReportService {

	apiURLReport: string;
	header: any;
	isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	minioLink: string;

	constructor(private http: HttpClient,
				private appConfigService: AppConfigService,
				public commonService: CommonService,
				private localStorage: LocalStorageService,
				private authHttpService: AuthHttpService) {
		this.apiURLReport = this.appConfigService.getConfigByKey('SEVER_API_REPORT');
		this.header = this.appConfigService.getConfigByKey('HEADER_API_REPORT');
		this.minioLink = this.appConfigService.getConfigByKey('MINIO_LINK');
	}

	getReportForm(body: any): Observable<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}
		this.isLoadingSubject.next(true);
		this.header.userID = username;
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(this.header, body), true), this.apiURLReport).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				console.log('res -> api>>>>>>>:::', res);
				if (res && res.seabRes.body.status == 'OK' && res.seabRes.body.responseCode == '00') {
					return res.seabRes.body;
				} else {
					//this.commonService.error(res.seabRes.body.responseCode);
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	callRequest(body): Observable<any> {
		const username = this.localStorage.retrieve('username');
		if (!username) {
			return of(undefined);
		}
		this.header.userID = username;
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(this.header, body), true), this.apiURLReport)
			.pipe(map(res => getResponseApi(res)));
	}

}
