import {Injectable} from '@angular/core';
import {AppConfigService} from '../../../../../app-config.service';
import {AuthHttpService} from '../../../../../shared/services/auth-http.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {
	GET_ENQUIRY,
	HEADER_API_T24_ENQUIRY,
	HEADER_SEATELLER,
	SEVER_API_T24_ENQUIRY,
	SEVER_API_URL_SEATELLER
} from '../../../../../shared/util/constant';
import {buildRequest, getResponseApi} from '../../../../../shared/util/api-utils';
import {map} from 'rxjs/operators';
import moment from 'moment';
import {CommonService} from '../../../../common-service/common.service';
import {BodyUdpateCustomerInfoModel} from './customer.model';
import {INPUT_TYPE_ENUM, MAPPING_T24_FORMCONTROL_REQ_SEATELLER} from './customer-manage.constant';
import {formartDateYYYYMMDD, safeTrim} from '../../../../../shared/util/Utils';

@Injectable({
	providedIn: 'root'
})
export class CustomerManageService {

	private apiSeatellerUrl: string = null;
	private headerSeateller: string = null;
	private dateInputType = INPUT_TYPE_ENUM.DATE;
	private ngSelectType = INPUT_TYPE_ENUM.NG_SELECT;
	customerInfoT24$: BehaviorSubject<BodyUdpateCustomerInfoModel> = new BehaviorSubject<BodyUdpateCustomerInfoModel>(null);
	listQA$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	firstBindingForm: any = null;

	constructor(
		private readonly authHttpService: AuthHttpService,
		private readonly appConfigService: AppConfigService,
		private readonly commonService: CommonService
	) {
		this.apiSeatellerUrl = appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		this.headerSeateller = appConfigService.getConfigByKey(HEADER_SEATELLER);
	}

	//<editor-fold desc="[========FETCH DATA FROM API========]">

	refreshError(transId: string): Observable<any> {
		// const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		// let header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		const body = {
			seabReq: {
				header: this.headerSeateller,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'findCustomerById',
						data: {
							transactionId: transId
						}
					}
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), this.apiSeatellerUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	saveCustomerInfoToRedis(obj: any): Observable<any> {
		const body = {
			seabReq: {
				header: this.headerSeateller,
				body: {
					command: 'GET_TRANSACTION',
					transaction: {
						authenType: 'storeHistoryCustomer',
						data: obj
					}
				}
			}
		};
		return this.authHttpService.callPostApi(buildRequest(body), this.apiSeatellerUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	getCustomerInfoRedis(transactionId: string): Observable<any> {
		const body = {
			seabReq: {
				header: this.headerSeateller,
				body: {
					command: GET_ENQUIRY,
					enquiry: {
						authenType: 'getHistoryCustomer',
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

	//</editor-fold>

	//<editor-fold desc="[========CHECK DIFFERENCE CUSTOMER INFO========]">
	passDataIdenMultiple(legalID, legalDocName, legalHolderName, legalIssDate, legalIssAuth, legalExpDate) {
		let dataMultipleIden = [];

		let listLegalID = legalID.split('#');
		let listDocName = legalDocName.split('#');
		let listHolderName = legalHolderName.split('#');
		let listIssDate = legalIssDate.split('#');
		let listIssAuth = legalIssAuth.split('#');
		let listExpDate = legalExpDate.split('#');

		for (let i = 0; i < listLegalID.length; i++) {
			dataMultipleIden.push({
				id: '',
				gttt: listLegalID[i] || '',
				idenType: listDocName[i] || '',
				organization: listHolderName[i] || '',
				idenTime: listIssDate[i] || null,
				idenAdress: listIssAuth[i] || '',
				idenTimeExpired: listExpDate[i] || null,
				idCustomer: this.commonService.cusTransId$.getValue()
			});
		}
		return dataMultipleIden;
	}

	passContactMultiple(phone, email, sms, priority): any {
		let dataMultipleContact = [];

		let listPhone = phone.split('#');
		let listSms = sms.split('#');
		let listEmail = email.split('#');
		let listPriority = priority.split('#');

		for (let i = 0; i < listPhone.length; i++) {
			dataMultipleContact.push({
				phone: listPhone[i] || '',
				mobile: listSms[i],
				email: listEmail[i],
				priority: listPriority[i],
				idCustomer: this.commonService.cusTransId$.getValue()
			});
		}

		return dataMultipleContact;
	}

	/**
	 * MAPPING REQUEST FOR REDIS SAVE T24 DATA
	 * @param customerInfo
	 * @param mapKeyProp
	 * @param dataQA
	 */
	mappingT24ToUpdateReq(customerInfo: any, mapKeyProp: any, dataQA: any): BodyUdpateCustomerInfoModel {
		let sms = '';
		if (customerInfo && customerInfo.sms2) {
			sms = customerInfo.sms + '#' + customerInfo.sms2;
		} else {
			sms = customerInfo.sms;
		}
		const dataContact = this.passContactMultiple(customerInfo.phone, customerInfo.email, sms, customerInfo.addrLocation);
		const dataIden = this.passDataIdenMultiple(customerInfo.legalID, customerInfo.legalDocName, customerInfo.legalHolderName, customerInfo.legalIssDate,
			customerInfo.legalIssAuth, customerInfo.legalExpDate);
		const cusRelationShips = this.buildCustRelationShip(customerInfo.relationCode, customerInfo.relCustomer);

		return {
			actionT24: 'UPDATE_CUSTOMER_INFO',
			birthday: this.getValueFromObject('birthday', customerInfo, mapKeyProp),
			coCode: this.getValueFromObject('coCode', customerInfo, mapKeyProp),
			country: this.getValueFromObject('country', customerInfo, mapKeyProp),
			cusRelationships: cusRelationShips,
			customerAddress: this.getValueFromObject('customerAddress', customerInfo, mapKeyProp),
			customerCommunications: dataContact,
			customerCurrency: this.getValueFromObject('customerCurrency', customerInfo, mapKeyProp),
			customerId: this.getValueFromObject('customerId', customerInfo, mapKeyProp),
			customerName: this.getValueFromObject('customerName', customerInfo, mapKeyProp),
			district: this.getValueFromObject('district', customerInfo, mapKeyProp),
			employerAddress: this.getValueFromObject('employerAddress', customerInfo, mapKeyProp),
			employerName: this.getValueFromObject('employerName', customerInfo, mapKeyProp),
			employment: this.getValueFromObject('employment', customerInfo, mapKeyProp),
			fax: this.getValueFromObject('fax', customerInfo, mapKeyProp),
			id: null,
			idenAddress: this.getValueFromObject('idenAddress', customerInfo, mapKeyProp).replace(/#/g, ' '),
			idenTimeValue: this.getValueFromObject('idenTimeValue', customerInfo, mapKeyProp),
			identityPapers: dataIden,
			industry: this.getValueFromObject('industry', customerInfo, mapKeyProp),
			industryClass: this.getValueFromObject('industryClass', customerInfo, mapKeyProp),
			industryGroup: this.getValueFromObject('industryGroup', customerInfo, mapKeyProp),
			inputter: this.getValueFromObject('inputter', customerInfo, mapKeyProp),
			isSameIdenAddress: this.getValueFromObject('isSameIdenAddress', customerInfo, mapKeyProp),
			listFile: [],
			loyalty: this.getValueFromObject('loyalty', customerInfo, mapKeyProp),
			maritalStatus: this.getValueFromObject('maritalStatus', customerInfo, mapKeyProp),
			national: this.getValueFromObject('national', customerInfo, mapKeyProp),
			noOfDependents: this.getValueFromObject('noOfDependents', customerInfo, mapKeyProp),
			occupation: this.getValueFromObject('occupation', customerInfo, mapKeyProp),
			ownCustomer: this.getValueFromObject('ownCustomer', customerInfo, mapKeyProp),
			ownerBen: this.getValueFromObject('ownerBen', customerInfo, mapKeyProp),
			placeOfBirth: this.getValueFromObject('placeOfBirth', customerInfo, mapKeyProp),
			portfolio: this.getValueFromObject('portfolio', customerInfo, mapKeyProp),
			priority: this.getValueFromObject('priority', customerInfo, mapKeyProp),
			province: this.getValueFromObject('province', customerInfo, mapKeyProp),
			purpose: this.getValueFromObject('purpose', customerInfo, mapKeyProp),
			residentNational: this.getValueFromObject('residentNational', customerInfo, mapKeyProp),
			residentStstus: this.getValueFromObject('residentStstus', customerInfo, mapKeyProp),
			salaryReq: Number(this.getValueFromObject('salaryReq', customerInfo, mapKeyProp)).toString(),
			securityQuestions: dataQA,
			sex: this.getValueFromObject('sex', customerInfo, mapKeyProp),
			similarityCoreAi: this.getValueFromObject('similarityCoreAi', customerInfo, mapKeyProp),
			stress: this.getValueFromObject('stress', customerInfo, mapKeyProp),
			taxId: this.getValueFromObject('taxId', customerInfo, mapKeyProp),
			timeSlaInputter: this.getValueFromObject('timeSlaInputter', customerInfo, mapKeyProp),
			timeUpdate: this.getValueFromObject('timeUpdate', customerInfo, mapKeyProp),
			title: this.getValueFromObject('title', customerInfo, mapKeyProp)
		};
	}

	private buildCustRelationShip(relationCode: string, relCustomer: string): any[] {
		const cusRelationships: any[] = [];
		if (relationCode && relCustomer) {
			const relationCustomers: string[] = relationCode.split('#');
			const idRelates: string[] = relCustomer.split('#');
			for (let i = 0; i < relationCustomers.length; i++) {
				cusRelationships.push({
					idRelate: idRelates[i],
					relationCustomer: relationCustomers[i]
				});
			}
		}
		return cusRelationships;
	}

	/**
	 * GET VALUE FROM OBJECT WITH PROPERTY KEY
	 * @param propKey
	 * @param obj
	 * @param mapProp
	 */
	private getValueFromObject(propKey: string, obj: any, mapProp: any) {
		const objMap = mapProp.find(m => m.prop == propKey);
		if (objMap && obj && obj.hasOwnProperty(objMap.t24Prop)) {
			if (propKey == 'national') {
				if (obj['otherNationalty']) {
					return (obj[objMap.t24Prop] + '#' + obj['otherNationalty']).replace(/#/g, ',');
				}
			}
			return obj[objMap.t24Prop];
		}
		return null;
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
						  idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string {
		const customerInfoT24 = this.customerInfoT24$.getValue();
		if (customerInfoT24) {
			const objMap = MAPPING_T24_FORMCONTROL_REQ_SEATELLER.find(ele => ele.fromControlName == formCotrolName);
			if (objMap) {
				if (idxFormControl === null || idxFormControl === undefined) { // Neu khong phai formArray
					return this.getDiffValue(formControlValue, customerInfoT24, objMap.prop, typeInput, dateFormat, dropdownList, code, value);
				} else {
					return this.getDiffValueMultiple(formControlValue, customerInfoT24, objMap.prop, typeInput, idxFormControl, dateFormat, dropdownList, code, value, prop);
				}
			}
		}
		return '';
	}

	/**
	 *
	 * @param formControlValue
	 * @param customerInfoT24
	 * @param objMapProp
	 * @param typeInput
	 * @param dateFormat
	 * @param dropdownList
	 * @param code
	 * @param value
	 * @private
	 */
	private getDiffValue(formControlValue: string, customerInfoT24: any, objMapProp: string, typeInput?: any, dateFormat?: string,
						 dropdownList?: any[], code?: string, value?: string): string {
		if (typeInput && typeInput == this.dateInputType && dateFormat) { // neu la truong date input
			const newValue = moment(formControlValue).format(dateFormat);
			if (newValue != customerInfoT24[objMapProp]) {
				return formartDateYYYYMMDD(customerInfoT24[objMapProp]);
			}
		}
		if (typeInput && typeInput == this.ngSelectType) { // neu la truong drop down select
			const t24Code = customerInfoT24[objMapProp];
			if (formControlValue != t24Code) {
				if (code && value) {
					if (dropdownList && dropdownList.length) {
						const dropdownObj = dropdownList.find(d => d[code] === t24Code);
						return dropdownObj ? dropdownObj[value] : '';
					}
				} else {
					return t24Code;
				}
			}
		}
		if (!typeInput) {// neu la truong text input
			// voi truong stress
			if (objMapProp == 'stress' || objMapProp == 'town') {
				let dataAddress = customerInfoT24['stress'].replace(/#/g, ' ').split(',');
				let dataAddClone = [...dataAddress];
				if (dataAddClone.length > 1) {
					dataAddClone.pop();
				}
				const dataCustomerAddress = dataAddClone.toString();
				const dataTown = dataAddress.length > 1 ? dataAddress[dataAddress.length - 1] : '';
				if (objMapProp == 'stress') {
					if (this.safeTrim(dataCustomerAddress) != this.safeTrim(formControlValue)) {
						return dataCustomerAddress;
					}
				} else {
					if (this.safeTrim(dataTown) != this.safeTrim(formControlValue)) {
						return dataTown;
					}
				}
			} else if (objMapProp == 'salaryReq') {
				if (Number(customerInfoT24[objMapProp]) != Number(formControlValue)) {
					return customerInfoT24[objMapProp];
				}
			} else {
				if (customerInfoT24[objMapProp] != formControlValue) {
					return customerInfoT24[objMapProp];
				}
			}
		}
		return '';
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
	private getDiffValueMultiple(formControlValue: string, customerInfoT24: any, objMapProp: string, typeInput?: any, idxFormControl?: number,
								 dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string {
		if (typeInput && typeInput == this.dateInputType && dateFormat) { // neu la truong date input
			const newValue = moment(formControlValue).format(dateFormat);
			const t24Val = customerInfoT24[objMapProp];
			if (typeof t24Val == 'object') {
				if (!t24Val || t24Val.length < 1) {
					return '';
				}
				if (t24Val.length <= idxFormControl) {
					return '';
				} else {
					const val = t24Val[idxFormControl][code];
					if (val != newValue) {
						return formartDateYYYYMMDD(val);
					}
				}
				return '';
			}
		}
		if (typeInput && typeInput == this.ngSelectType) { // neu la truong drop down select
			const t24Val = customerInfoT24[objMapProp];
			if (typeof t24Val == 'object') {
				if (!t24Val || t24Val.length < 1) {
					return '';
				}
				if (t24Val.length <= idxFormControl) {
					return '';
				} else {
					const val = t24Val[idxFormControl][prop];
					const obj = dropdownList.find(e => e[code] == val);
					if (obj && obj[code] != formControlValue) {
						return obj[value];
					}
				}
				return '';
			}
			return '';
		}
		if (!typeInput) { // neu la truong text input
			const t24Val = customerInfoT24[objMapProp];
			if (typeof t24Val == 'string') {
				if (!t24Val) {
					return '';
				}
				const t24Values = t24Val.split('#');
				if (t24Values.length <= idxFormControl) {
					return '';
				}
				if (t24Values[idxFormControl] != formControlValue) {
					return t24Values[idxFormControl];
				}
				return '';
			}
			if (typeof t24Val == 'object') {
				if (!t24Val || t24Val.length < 1) {
					return '';
				}
				if (t24Val.length <= idxFormControl) {
					return '';
				} else {
					const value = t24Val[idxFormControl][code];
					if (value != formControlValue) {
						return value;
					}
				}
				return '';
			}
		}
		return '';
	}


	/**
	 * So sanh va tra ve gia tri moi sai khac so voi t24 info
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
	getValueChange(formCotrolName: string, formControlValue: string, typeInput?: any,
				   idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string {
		const customerInfoT24 = this.customerInfoT24$.getValue();
		if (customerInfoT24) {
			const objMap = MAPPING_T24_FORMCONTROL_REQ_SEATELLER.find(ele => ele.fromControlName == formCotrolName);
			if (objMap) {
				if (idxFormControl === null || idxFormControl === undefined) { // Neu khong phai formArray
					return this.getCurrentValue(formControlValue, customerInfoT24, objMap.prop, typeInput, dateFormat, dropdownList, code, value);
				} else {
					return this.getCurrentValueMultiple(formControlValue, customerInfoT24, objMap.prop, typeInput, idxFormControl, dateFormat, dropdownList, code, value, prop);
				}
			}
		}
		return '';
	}

	/**
	 *
	 * @param formControlValue
	 * @param customerInfoT24
	 * @param objMapProp
	 * @param typeInput
	 * @param dateFormat
	 * @param dropdownList
	 * @param code
	 * @param value
	 * @private
	 */
	private getCurrentValue(formControlValue: any, customerInfoT24: any, objMapProp: string, typeInput?: any, dateFormat?: string,
							dropdownList?: any[], code?: string, value?: string): string {
		if (typeInput && typeInput == this.dateInputType && dateFormat) { // neu la truong date input
			const newValue = moment(formControlValue).format(dateFormat);
			if (newValue != customerInfoT24[objMapProp]) {
				return formartDateYYYYMMDD(newValue);
			}
		}
		if (typeInput && typeInput == this.ngSelectType) { // neu la truong drop down select
			const t24Code = customerInfoT24[objMapProp];
			if (formControlValue != t24Code) {
				if (code && value) {
					if (dropdownList && dropdownList.length) {
						const dropdownObj = dropdownList.find(d => d[code] === formControlValue);
						return dropdownObj ? dropdownObj[value] : '';
					}
				} else {
					return (typeof formControlValue == 'string') ? formControlValue : formControlValue.join(';');
				}
			}
		}
		if (!typeInput) {// neu la truong text input
			// voi truong stress
			if (objMapProp == 'stress' || objMapProp == 'town') {
				let dataAddress = customerInfoT24['stress'].replace(/#/g, ' ').split(',');
				let dataAddClone = [...dataAddress];
				if (dataAddClone.length > 1) {
					dataAddClone.pop();
				}
				const dataCustomerAddress = dataAddClone.toString();
				const dataTown = dataAddress.length > 1 ? dataAddress[dataAddress.length - 1] : '';
				if (objMapProp == 'stress') {
					if (this.safeTrim(dataCustomerAddress) != this.safeTrim(formControlValue)) {
						return formControlValue;
					}
				} else {
					if (this.safeTrim(dataTown) != this.safeTrim(formControlValue)) {
						return formControlValue;
					}
				}
			} else if (objMapProp == 'salaryReq') {
				if (Number(customerInfoT24[objMapProp]) != Number(formControlValue)) {
					return formControlValue;
				}
			} else {
				if (customerInfoT24[objMapProp] != formControlValue) {
					return formControlValue;
				}
			}
		}
		return '';
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
	private getCurrentValueMultiple(formControlValue: string, customerInfoT24: any, objMapProp: string, typeInput?: any, idxFormControl?: number,
									dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string {
		if (typeInput && typeInput == this.dateInputType && dateFormat) { // neu la truong date input
			const newValue = moment(formControlValue).format(dateFormat);
			const t24Val = customerInfoT24[objMapProp];
			if (typeof t24Val == 'object') {
				if (!t24Val || t24Val.length < 1) {
					return '';
				}
				if (t24Val.length <= idxFormControl) {
					return '';
				} else {
					const val = t24Val[idxFormControl][code];
					if (val != newValue) {
						return formartDateYYYYMMDD(newValue);
					}
				}
				return '';
			}
		}
		if (typeInput && typeInput == this.ngSelectType) { // neu la truong drop down select
			const t24Val = customerInfoT24[objMapProp];
			if (typeof t24Val == 'object') {
				if (!t24Val || t24Val.length < 1) {
					return '';
				}
				if (t24Val.length <= idxFormControl) {
					return '';
				} else {
					const val = t24Val[idxFormControl][prop];
					const obj = dropdownList.find(e => e[code] == val);
					const current = dropdownList.find(e => e[code] == formControlValue);
					if (obj && obj[code] != formControlValue) {
						return current[value];
					}
				}
				return '';
			}
			return '';
		}
		if (!typeInput) { // neu la truong text input
			const t24Val = customerInfoT24[objMapProp];
			if (typeof t24Val == 'string') {
				if (!t24Val) {
					return '';
				}
				const t24Values = t24Val.split('#');
				if (t24Values.length <= idxFormControl) {
					return '';
				}
				if (t24Values[idxFormControl] != formControlValue) {
					return formControlValue;
				}
				return '';
			}
			if (typeof t24Val == 'object') {
				if (!t24Val || t24Val.length < 1) {
					return '';
				}
				if (t24Val.length <= idxFormControl) {
					return '';
				} else {
					const value = t24Val[idxFormControl][code];
					if (value != formControlValue) {
						return formControlValue;
					}
				}
				return '';
			}
		}
		return '';
	}

	private safeTrim(src: string): string {
		return safeTrim(src);
	}

	//</editor-fold>
}
