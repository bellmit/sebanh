import { Injectable } from '@angular/core';
import { AuthHttpService } from '../../../../../shared/services/auth-http.service';
import { Observable, of } from 'rxjs';
import {
	GET_ENQUIRY, GET_REPORT,
	HEADER_API_ADMIN_MANAGER, HEADER_API_T24_ENQUIRY, HEADER_API_STATEMENT, SERVER_API_SAO_KE,
	HEADER_PERMISSION,
	HEADER_SEATELLER, SEVER_API_T24_ENQUIRY,
	SEVER_API_URL_ADMIN_MANAGER,
	SEVER_API_URL_PERMISSION,
	SEVER_API_URL_SEATELLER, SLA_BUSINESS_DETAIL, SLA_BUSINESS_GROUP
} from '../../../../../shared/util/constant';
import { AppConfigService } from '../../../../../app-config.service';
import { buildRequest, getResponseApi } from '../../../../../shared/util/api-utils';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class QueryTransReportService {

	business = [
		// {code: 'All', value: 'Tất cả', color: ''},
		{
			code: 'COMBO1',
			value: 'Đăng ký combo 1',
			color: '#242F57',
			business: SLA_BUSINESS_GROUP.COMBO,
			businessDetail: SLA_BUSINESS_DETAIL.OPEN_COMBO1
		},
		{
			code: 'COMBO2',
			value: 'Đăng ký combo 2',
			color: '#6863F9',
			business: SLA_BUSINESS_GROUP.COMBO,
			businessDetail: SLA_BUSINESS_DETAIL.OPEN_COMBO2
		},
		{
			code: 'COMBO3',
			value: 'Đăng ký combo 3',
			color: '#0580FA',
			business: SLA_BUSINESS_GROUP.COMBO,
			businessDetail: SLA_BUSINESS_DETAIL.OPEN_COMBO3
		},
		{ code: 'SUPPER', value: 'Đăng ký gói supper', color: '#F05849', business: 'SUPPER', businessDetail: null },
		{
			code: 'CUSTOMER',
			value: 'Quản lý thông tin KH',
			color: '#13B78A',
			business: SLA_BUSINESS_GROUP.QLTTKH,
			businessDetail: null
		},
		{
			code: 'ACCOUNT',
			value: 'Tài khoản',
			color: '#4AC30A',
			business: SLA_BUSINESS_GROUP.QLSPDV,
			businessDetail: SLA_BUSINESS_DETAIL.ACCOUNT
		},
		{ code: 'CARD', value: 'Thẻ', color: '#575962', business: SLA_BUSINESS_GROUP.QLSPDV, businessDetail: SLA_BUSINESS_DETAIL.CARD },
		{
			code: 'SEANET',
			value: 'SeANet',
			color: '#DBF7CB',
			business: SLA_BUSINESS_GROUP.QLSPDV,
			businessDetail: SLA_BUSINESS_DETAIL.SEANET
		},
		{ code: 'SMS', value: 'SMS', color: '#C3CADB', business: SLA_BUSINESS_GROUP.QLSPDV, businessDetail: SLA_BUSINESS_DETAIL.SMS }
	];
	slas = [
		{ code: 'IN', value: 'Trong hạn SLA', color: '#A7A9AC' },
		{ code: 'HALF_OVER', value: 'Sắp vượt SLA', color: '#F2A629' },
		{ code: 'OVER', value: 'Vượt SLA', color: '#D71424' }
	];
	satusTrans = [
		{ code: 'APPROVED', value: 'Đã duyệt', color: '#4AC30A' },
		{ code: 'REJECTED', value: 'Chờ bổ sung', color: '#C3CADB' },
		{ code: 'PENDING', value: 'Đang xử lý', color: '#F2A629' }
	];
	satusSLA = [
		{ code: 'OK', value: 'Thoả mãn SLA', color: '#0580FA' },
		{ code: 'NOT_OK', value: 'Vi phạm SLA', color: '#A7A9AD' }
	];
	businessColors = [
		'#242F57',
		'#6863F9',
		'#0580FA',
		'#F05849',
		'#13B78A',
		'#4AC30A',
		'#575962',
		'#DBF7CB',
		'#C3CADB'
	];


	constructor(
		private authHttpService: AuthHttpService,
		private appConfigService: AppConfigService
	) {
	}

	/**
	 * get transaction for query transaction
	 * @param data
	 */
	getTransactions(data: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const body = {
			seabReq: {
				header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'getAllTransaction',
						data: data
					}
				}
			}
		};

		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	getUsersByGroup(branch: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);
		const body = {
			seabReq: {
				header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'getUserGroup',
						user_id: '',
						group_id: branch
					}
				}
			}
		};

		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	getGroups(): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);
		const bodyReq = {
			seabReq: {
				header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'getGroups',
					},
				},
			}
		};
		return this.authHttpService.callPostApi(buildRequest(bodyReq), url).pipe(
			map(res => getResponseApi(res)));
	}

	/**
	 * get transaction for sla report
	 * @param coCode
	 * @param fromDate
	 * @param toDate
	 * @param business
	 * @param status
	 */
	getSlaTransactions(coCode: string, fromDate: string, toDate: string, business: string, user: string, status: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const body = {
			seabReq: {
				header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'getTransactions',
						data: {
							coCode,
							fromDate,
							toDate,
							business,
							inputter: user,
							status
						}
					}
				}
			}
		};

		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	/**
	 * get transaction for sla report
	 * @param coCode
	 * @param fromDate
	 * @param toDate
	 * @param business
	 * @param status
	 */
	getErrorTransactions(coCode: string, fromDate: string, toDate: string, business: string, status: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const body = {
			seabReq: {
				header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'getErrorTrans',
						data: {
							coCode,
							fromDate,
							toDate,
							business,
							status
						}
					}
				}
			}
		};

		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	/**
	 * get sla config for sla report
	 * @param userGroup
	 * @param userGroups
	 */
	getSlaConfig(group: string, userGroups: string[]): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		let header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		let bodyReq = {
			seabReq: {
				header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'GetListSLAByUserGroup',
						userGroup: group,
						userGroups
					}
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(bodyReq), url)
			.pipe(map(res => getResponseApi(res)));
	}

	//<editor-fold desc="service cho sao ke">
	getAccountByCustId(custId: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		const body = {
			header,
			body: {
				command: GET_ENQUIRY,
				enquiry: {
					enqID: 'T24ENQ.SEAB.GET.ACCCUST.SEATELLER',
					custId: custId
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	getListAccountByCustId(custId: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		const body = {
			header,
			body: {
				command: GET_ENQUIRY,
				enquiry: {
					enqID: 'T24ENQ.SEAB.API.CUS.AC.BALANCE',
					customerId: custId
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	getDataSaoke(report: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_SAO_KE);
		const header = this.appConfigService.getConfigByKey(HEADER_API_STATEMENT);
		const body = {
			header,
			body: {
				command: GET_REPORT,
				report: report
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	getListStkByCustId(custId: string): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		const body = {
			header,
			body: {
				command: GET_ENQUIRY,
				enquiry: {
					enqID: 'T24ENQ.SEAB.API.CUS.AZ.BALANCE',
					customerId: custId
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), url)
			.pipe(map(res => getResponseApi(res)));
	}

	//</editor-fold>
}
