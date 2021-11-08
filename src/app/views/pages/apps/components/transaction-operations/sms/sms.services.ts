import { CommonService } from './../../../../../common-service/common.service';
import { AuthHttpService } from './../../../../../../shared/services/auth-http.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SessionStorageService } from 'ngx-webstorage';
import {
	buildRequest,
	getResponseApi,
} from '../../../../../../shared/util/api-utils';
import { AppConfigService } from '../../../../../../app-config.service';
import { GET_ENQUIRY, HEADER_API_REG_SMS, HEADER_SEATELLER, SERVER_API_REG_SMS, SEVER_API_URL_SEATELLER } from '../../../../../../shared/util/constant';
import { MAPPING_T24_FORMCONTROL_REQ_SEATELLER } from './sms.constant';
import { BehaviorSubject } from "rxjs";
import { INPUT_TYPE_ENUM } from '../../customer-manage/customer-manage.constant';
import { BodyUdpateSMSServiceModel } from './sms.model';
import moment from 'moment';
import { formartDateYYYYMMDD, safeTrim } from '../../../../../../shared/util/Utils';


@Injectable({
	providedIn: "root",
})
export class SmsService {
	private apiSeatellerUrl: string = null;
	private headerSeateller: string = null;
	private dateInputType = INPUT_TYPE_ENUM.DATE;
	private ngSelectType = INPUT_TYPE_ENUM.NG_SELECT;
	smsInfoT24$: BehaviorSubject<BodyUdpateSMSServiceModel> =
		new BehaviorSubject<BodyUdpateSMSServiceModel>(null);
	selectedObject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(
		private _http: HttpClient,
		private _session: SessionStorageService,
		private authHttpService: AuthHttpService,
		public commonService: CommonService,
		private appConfigService: AppConfigService
	) {
		this.apiSeatellerUrl = appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		this.headerSeateller = appConfigService.getConfigByKey(HEADER_SEATELLER);
	}

	// get list sms info
	getCustomerSmsReg(body): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SERVER_API_REG_SMS);
		const header = this.appConfigService.getConfigByKey(HEADER_API_REG_SMS);

		const bodyReq = {
			header: header,
			body: {
				command: "GET_ENQUIRY",
				enquiry: {
					authenType: "getCustomerSmsReg-3",
					// customerID: '13775074',
					customerID: body.customerID,
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

	//đăng ký sms
	createOrUpdateSms(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(
			SEVER_API_URL_SEATELLER
		);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

		const bodyReq = {
			header: header,
			body: {
				command: "GET_TRANSACTION",
				transaction: {
					authenType: this.commonService.isUpdateSMS$.getValue()
						? "updateSms"
						: "createSms",
					data: body,
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

	// Lưu thông tin cũ
	saveOldInforSMS(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(
			SEVER_API_URL_SEATELLER
		);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

		const bodyReq = {
			header: header,
			body: {
				command: "GET_TRANSACTION",
				transaction: {
					authenType: "storeSmsInfo",
					data: body,
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

	deleteSms(id: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(
			SEVER_API_URL_SEATELLER
		);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const bodyReq = {
			header: header,
			body: {
				command: "GET_TRANSACTION",
				transaction: {
					authenType: "deleteSms",
					data: {
						id: id,
					},
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

	getListDetailSms(id: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(
			SEVER_API_URL_SEATELLER
		);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const bodyReq = {
			header: header,
			body: {
				command: "GET_ENQUIRY",
				enquiry: {
					authenType: "getListDetailSms",
					data: {
						id: id,
					},
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

	approveSms(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(
			SEVER_API_URL_SEATELLER
		);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const bodyReq = {
			header: header,
			body: {
				command: "GET_TRANSACTION",
				transaction: {
					authenType: "approveSms",
					data: body,
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

	rejectSms(body: any): Observable<any> {
		const url = this.appConfigService.getConfigByKey(
			SEVER_API_URL_SEATELLER
		);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const bodyReq = {
			header: header,
			body: {
				command: "GET_TRANSACTION",
				transaction: {
					authenType: "rejectSms",
					data: body,
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

	getSmsInfoRedis(transactionId: string): Observable<any> {
		const body = {
			seabReq: {
				header: this.headerSeateller,
				body: {
					command: GET_ENQUIRY,
					enquiry: {
						authenType: 'getStoredSmsInfo',
						data: {
							transactionId
						}
					}
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), this.apiSeatellerUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	/**
	 * So sanh va tra ve gia tri cu sai khac so voi t24 info
	 * @param formCotrolName
	 * @param formControlValue
	 * @param typeInput -- kieu input
	 * @param idxFormControl -- index của formGroup trong formArray
	 * @param dateFormat -- dinh dang date format
	 * @param dropdownList -- danh sach truyen vao dropdown
	 * @param code -- bind Value ng-select
	 * @param value -- bind Label ng-select
	 * @param prop -- t24 value code
	 */
	compareValueHasChange(formCotrolName: string, formControlValue: string, typeInput?: any,
		idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string | boolean {
		const selectedObject = this.selectedObject$.getValue();
		if (selectedObject) {
			const objMap = MAPPING_T24_FORMCONTROL_REQ_SEATELLER.find(ele => ele.fromControlName == formCotrolName);
			if (objMap) {
				if (idxFormControl === null || idxFormControl === undefined) { // Neu khong phai formArray
					return this.getDiffValue(formControlValue, selectedObject, objMap.prop, typeInput, dateFormat, dropdownList, code, value);
				} else {
					return this.getDiffValueMultiple(formControlValue, selectedObject, objMap.prop, typeInput, idxFormControl, dateFormat, dropdownList, code, value, prop);
				}
			}
		}
		return '';
	}

	/**
	 *
	 * @param formControlValue
	 * @param smsInfoT24
	 * @param objMapProp
	 * @param typeInput
	 * @param dateFormat
	 * @param dropdownList
	 * @param code
	 * @param value
	 * @private
	 */
	getDiffValue(
		formControlValue: string,
		smsInfoT24: any,
		objMapProp: string,
		typeInput?: any,
		dateFormat?: string,
		dropdownList?: any[],
		code?: string,
		value?: string
	): string | boolean {
		if (typeInput && typeInput == this.dateInputType && dateFormat) {
			// neu la truong date input
			const newValue = moment(formControlValue).format(dateFormat);
			if (newValue != smsInfoT24[objMapProp]) {
				return formartDateYYYYMMDD(smsInfoT24[objMapProp]);
			}
		}
		if (typeInput && typeInput == this.ngSelectType) {
			// neu la truong drop down select
			const t24Code = smsInfoT24[objMapProp];
			if (formControlValue != t24Code) {
				if (code && value) {
					if (dropdownList && dropdownList.length) {
						const dropdownObj = dropdownList.find(
							(d) => d[code] === t24Code
						);
						return dropdownObj ? dropdownObj[value] : "";
					}
				} else {
					return t24Code ? true : false;
				}
			}
		}
		if (!typeInput) {
			// neu la truong text input
			// voi truong stress
			if (objMapProp == "stress" || objMapProp == "town") {
				let dataAddress = smsInfoT24["stress"]
					.replace(/#/g, " ")
					.split(",");
				let dataAddClone = [...dataAddress];
				if (dataAddClone.length > 1) {
					dataAddClone.pop();
				}
				const dataCustomerAddress = dataAddClone.toString();
				const dataTown =
					dataAddress.length > 1
						? dataAddress[dataAddress.length - 1]
						: "";
				if (objMapProp == "stress") {
					if (
						safeTrim(dataCustomerAddress) !=
						safeTrim(formControlValue)
					) {
						return dataCustomerAddress;
					}
				} else {
					if (
						safeTrim(dataTown) !=
						safeTrim(formControlValue)
					) {
						return dataTown;
					}
				}
			} else if (objMapProp == "salaryReq") {
				if (
					Number(smsInfoT24[objMapProp]) !=
					Number(formControlValue)
				) {
					return smsInfoT24[objMapProp];
				}
			} else {
				if (smsInfoT24[objMapProp] != formControlValue) {
					return smsInfoT24[objMapProp] ? smsInfoT24[objMapProp] : formControlValue ? true : false;
				}
			}
		}
		return "";
	}

	/**
	 *
	 * @param formControlValue
	 * @param customerInfoT24
	 * @param objMapProp
	 * @param typeInput
	 * @param idxFormControl
	 * @param dateFormat
	 * @param dropdownList
	 * @param code
	 * @param value
	 * @param prop
	 * @private
	 */
	getDiffValueMultiple(
		formControlValue: string,
		smsInfoT24: any,
		objMapProp: string,
		typeInput?: any,
		idxFormControl?: number,
		dateFormat?: string,
		dropdownList?: any[],
		code?: string,
		value?: string,
		prop?: string,
	): string | boolean {
		if (typeInput && typeInput == this.dateInputType && dateFormat) {
			// neu la truong date input
			const newValue = moment(formControlValue).format(dateFormat);
			const t24Val = smsInfoT24[objMapProp];
			if (typeof t24Val == "object") {
				if (!t24Val || t24Val.length < 1) {
					return "";
				}
				if (t24Val.length <= idxFormControl) {
					return "";
				} else {
					const val = t24Val[idxFormControl][code];
					if (val != newValue) {
						return formartDateYYYYMMDD(val) ? formartDateYYYYMMDD(val) : t24Val ? true : false;
					}
				}
				return t24Val ? true : false;
			}
		}
		if (typeInput && typeInput == this.ngSelectType) {
			// neu la truong drop down select
			const t24Val = smsInfoT24[objMapProp];
			if (typeof t24Val == "object") {
				if (!t24Val || t24Val.length < 1) {
					return "";
				}
				if (t24Val.length <= idxFormControl) {
					return "";
				} else {
					const val = t24Val[idxFormControl][prop];
					const obj = dropdownList.find((e) => e[code] == val);
					if (obj && obj[code] != formControlValue) {
						return obj[value];
					}
				}
				return t24Val ? true : false;
			}
			return "";
		}
		if (!typeInput) {
			// neu la truong text input
			const t24Val = smsInfoT24[objMapProp];
			if (typeof t24Val == "string") {
				if (!t24Val) {
					return "";
				}
				const t24Values = t24Val.split("#");
				if (t24Values.length <= idxFormControl) {
					return "";
				}
				if (t24Values[idxFormControl] != formControlValue) {
					return t24Values[idxFormControl];
				}
				return "";
			}
			if (typeof t24Val == "object") {
				if (!t24Val || t24Val.length < 1) {
					return "";
				}
				if (t24Val.length <= idxFormControl) {
					return "";
				} else {
					const value = t24Val[idxFormControl][code];
					if (value != formControlValue) {
						return value;
					}
				}
				return "";
			}
		}
		return "";
	}
}
