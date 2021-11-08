import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from "rxjs";
import {Router} from "@angular/router";
import {RequestApiModel} from "../model/request-api";
import {finalize, map} from "rxjs/operators";
import {buildRequest, getResponseApi} from "../util/api-utils";
import {AuthHttpService} from "./auth-http.service";
import {CommonService} from '../../views/common-service/common.service';

@Injectable({
	providedIn: 'root'
})
export class DataPowerService {
	isLoadingSubject: BehaviorSubject<any> = new BehaviorSubject(false);
	dataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(private router: Router,
				private authHttpService: AuthHttpService,
				public commonService: CommonService) {
	}

	actionGetEnquiryResponseApi(body: any, header: any, url: string): Observable<any> {
		this.isLoadingSubject.next(true);
		// console.log(new RequestApiModel(header, body), 'request')
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), false), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				// console.log('Response', res);
				if (res && res.body && res.body.status == 'OK') {
					this.dataSubject.next(res.body.enquiry);
					return res.body;
				} else {
					// this.commonService.error(res.error.desc)
					return
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	actionGetTransactionResponseApiQA(body: any, header: any, url: string): Observable<any> {
		this.isLoadingSubject.next(true);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), true), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				if (res && res.seabRes.body.status =="OK" && res.seabRes.body.enquiry.responseCode == '00') {
					return res;
				} else {
					// this.commonService.error(res.seabRes.body.error.desc);
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	actionGetTransactionResponseReportApi(body: any, header: any, url: string): Observable<any> {
		this.isLoadingSubject.next(true);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), true), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				if (res && res.seabRes.body.status == 'OK' && res.seabRes.body.responseCode == "00") {
					this.dataSubject.next(res);
					return res;
				} else {
					console.log('Console Error', res.seabRes.error.desc);
					// this.commonService.error(res.seabRes.error.desc);
				}
			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}


	actionGetTransactionResponseCusApi(body: any, header: any, url: string): Observable<any> {
		this.isLoadingSubject.next(true);
		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), true), url).pipe(
			map(res => getResponseApi(res)),
			// map((model: any) => {
			// 	let res = getResponseApi(model);
			// 	if (res && res.seabRes.body.status == 'OK' && res.seabRes.body.transaction.responseCode == "00") {
			// 		this.dataSubject.next(res);
			// 		return res;
			// 	} else {
			// 		console.log('Console Error', res.seabRes.error.desc);
			// 		//this.commonService.error(res.seabRes.error.desc);
			// 	}
			// }),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	actionGetTransactionResponseApi(body: any, header: any, url: string, isSeabReq ?: boolean): Observable<any> {
		this.isLoadingSubject.next(true);

		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), isSeabReq), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				console.log('res -------->', res)
				switch (isSeabReq) {
					case true:
						if (res && res.seabRes.body && res.seabRes.body.status == 'OK') {
							this.dataSubject.next(res.seabRes.body.transaction);
							return res.seabRes.body;
						} else {
							//this.commonService.error(res.seabRes.error.desc);
							// this.authService.logout();
						}
						break;
					case false:
						if (res && res.body && res.body.status == 'OK') {
							this.dataSubject.next(res.body.transaction);
							return res.body;
						} else {
							//this.commonService.error(res.error.desc);
							// this.authService.logout();
						}
						break;
				}

			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}

	getListCustomerIfnfo(body: any, header: any, url: string, isSeabReq ?: boolean): Observable<any> {
		this.isLoadingSubject.next(true);

		return this.authHttpService.callPostApi<any>(buildRequest(new RequestApiModel(header, body), isSeabReq), url).pipe(
			map((model: any) => {
				let res = getResponseApi(model);
				console.log('getListCustomerIfnfores -------->', res)
				return res;

			}),
			finalize(() => this.isLoadingSubject.next(false))
		);
	}
}
