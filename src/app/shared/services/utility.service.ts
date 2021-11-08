// Angular
import {CommonService} from '../../views/common-service/common.service';
import {Injectable} from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';
import {EnquiryModel} from '../../views/model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../views/model/body-request-enquiry-model';
import {
	CODE_00,
	GET_ENQUIRY,
	HEADER_ACC_UTIL, HEADER_API_T24_ENQUIRY, HEADER_UTILITY,
	SERVER_API_URL_ACC_UTIL, SEVER_API_T24_ENQUIRY, SEVER_API_URL_UTILITY,
	STATUS_OK, UTILITY
} from '../util/constant';
import {Observable} from 'rxjs';
import {AppConfigService} from '../../app-config.service';
import {AuthHttpService} from './auth-http.service';
import {buildRequest, getResponseApi} from '../util/api-utils';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class UtilityService {

	/**
	 * Service Constructor
	 *
	 * @param localStorage: LocalStorageService
	 * @param commonService
	 * @param appConfigService
	 * @param authHttpService
	 */
	constructor(private localStorage: LocalStorageService,
				private commonService: CommonService,
				private appConfigService: AppConfigService,
				private authHttpService: AuthHttpService) {
	}


	async getRelations() {
		let relations = this.localStorage.retrieve('relationsCache');
		if (!relations) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getRelation';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			// console.log('Mỗi quan hệ: ',r)
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				relations = r.body.enquiry.relations;
				this.localStorage.store('relationsCache', r.body.enquiry.relations);
			}
		}
		// console.log('Data Relations:', relations);
		return relations;
	}

	/**
	 * @return Observable
	 */
	getRelationsNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getRelation';

		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getCountrys() {
		let countrys = this.localStorage.retrieve('countrysCached');
		if (!countrys) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getCountry';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			// console.log('countrys cache ',r)
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				countrys = r.body.enquiry.countrys;
				this.localStorage.store('countrysCached', r.body.enquiry.countrys);
			}
		}
		// console.log('Data Countrys:', countrys);
		return countrys;
	}

	/**
	 * @return Observable
	 */
	getCountrysNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getCountry';

		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getMadichvus() {
		let madichvus = this.localStorage.retrieve('madichvusCache');
		if (!madichvus) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getMadichvu';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			// console.log('r: ',r)
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				madichvus = r.body.enquiry.madichvus;
				this.localStorage.store('madichvusCache', r.body.enquiry.madichvus);
			}
		}
		// console.log('Data Madichvus:', madichvus);
		return madichvus;
	}

	getMadichvusNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getMadichvu';

		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getPortfolios(type) {
		let portfolios;
		let campaigns;
		let commisstions;
		switch (type) {
			case UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.PORTFOLIO:
				portfolios = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.PORTFOLIO);
				if (portfolios) {
					return portfolios;
				} else {
					let enquiry = new EnquiryModel();
					enquiry.authenType = 'getCatalogs';
					enquiry.category = type;

					let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
					let r = await this.commonService.getEnquiryAccUtility(bodyRequest);
					if (r && r.body && r.body.status == STATUS_OK && r.body.enquiry.responseCode == CODE_00) {
						portfolios = r.body.enquiry.catalogs;
						this.localStorage.store('portfolioCache', r.body.enquiry.catalogs);
					}
					return portfolios;
				}
				break;
			case UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.CAMPAIGN:
				campaigns = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.CAMPAIGN);
				if (campaigns) {
					return campaigns;
				} else {
					let enquiry = new EnquiryModel();
					enquiry.authenType = 'getCatalogs';
					enquiry.category = type;

					let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
					let r = await this.commonService.getEnquiryAccUtility(bodyRequest);
					if (r && r.body && r.body.status == STATUS_OK && r.body.enquiry.responseCode == CODE_00) {
						campaigns = r.body.enquiry.catalogs;
						this.localStorage.store('campaignCache', r.body.enquiry.catalogs);
					}
					return campaigns;
				}
				break;
			case UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE:
				commisstions = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE);
				if (commisstions) {
					return commisstions;
				} else {
					let enquiry = new EnquiryModel();
					enquiry.authenType = 'getCatalogs';
					enquiry.category = type;

					let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
					let r = await this.commonService.getEnquiryAccUtility(bodyRequest);
					if (r && r.body && r.body.status == STATUS_OK && r.body.enquiry.responseCode == CODE_00) {
						commisstions = r.body.enquiry.catalogs;
						this.localStorage.store('commissionCache', r.body.enquiry.catalogs);
					}
					return commisstions;
				}
				break;
		}
	}

	async getIndustrys() {
		let industrys = this.localStorage.retrieve('industryCached');
		if (!industrys) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getIndustry';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				industrys = r.body.enquiry.industrys;
				this.localStorage.store('industryCached', r.body.enquiry.industrys);
			}
		}
		// console.log('Data Industrys:', industrys);
		return industrys;
	}

	getIndustrysNew() {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getIndustry';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getServicePackages() {
		let servicePackages = this.localStorage.retrieve('servicePackagesCache');
		if (!servicePackages) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getServicePackage';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				servicePackages = r.body.enquiry.servicePackages;
				this.localStorage.store('servicePackagesCache', r.body.enquiry.servicePackages);
			}
		}
		// console.log('Data ServicePackages:', servicePackages);
		return servicePackages;
	}

	getServicePackagesNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getServicePackage';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getBrokerTypes() {
		let brokers = this.localStorage.retrieve('brokersCached');
		if (!brokers) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getBroker';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				brokers = r.body.enquiry.brokers;
				this.localStorage.store('brokersCached', r.body.enquiry.brokers);
			}
		}
		// console.log('Data BrokerTypes:', brokers);
		return brokers;
	}

	/**
	 * @return Observable
	 */
	getBrokerTypesNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getBroker';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getPromotions() {
		let promotions = this.localStorage.retrieve('promotionCache');
		if (!promotions) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getPromotion';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				promotions = r.body.enquiry.promotions;
				this.localStorage.store('promotionCache', r.body.enquiry.promotions);
			}
		}
		// console.log('Data Promotions:', promotions);
		return promotions;
	}

	getPromotionsNew() {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getPromotion';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getPromotionCards() {
		let promotionCards = this.localStorage.retrieve('promotionCardCache');
		if (!promotionCards) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getPromotionCard';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				promotionCards = r.body.enquiry.promotionCards;
				this.localStorage.store('promotionCardCache', r.body.enquiry.promotionCards);
			}
		}
		// console.log('Data PromotionCards:', promotionCards);
		return promotionCards;
	}

	getPromotionCardsNew() {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getPromotionCard';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getTransPromotionCards() {
		let transPromotionCards = this.localStorage.retrieve('transPromotionCardCache');
		if (!transPromotionCards) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getTransPromotionCard';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				transPromotionCards = r.body.enquiry.transPromotionCards;
				this.localStorage.store('transPromotionCardCache', r.body.enquiry.transPromotionCards);
			}
		}
		// console.log('Data TransPromotionCards:', transPromotionCards);
		return transPromotionCards;
	}

	getTransPromotionCardsNew() {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getTransPromotionCard';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getTransLimits() {
		let tranLimits = this.localStorage.retrieve('tranLimitsCache');
		if (!tranLimits) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getTransLimit';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				tranLimits = r.body.enquiry.transLimits;
				this.localStorage.store('tranLimitsCache', r.body.enquiry.transLimits);
			}
		}
		// console.log('Data TransLimits:', tranLimits);
		return tranLimits;
	}

	getTransLimitsNew() {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getTransLimit';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getSales() {
		let sales = this.localStorage.retrieve('saleCache');
		if (!sales) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getSales';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				sales = r.body.enquiry.sales;
				this.localStorage.store('saleCache', r.body.enquiry.sales);
			}
		}
		// console.log('Data Sales:', sales);
		return sales;
	}

	getSalesNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getSales';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getCardTypes() {
		let cardTypes = this.localStorage.retrieve('cardTypeCache');
		if (!cardTypes) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getCardType';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				cardTypes = r.body.enquiry.cardTypes;
				this.localStorage.store('cardTypeCache', r.body.enquiry.cardTypes);
			}
		}
		// console.log('Data CardTypes:', cardTypes);
		return cardTypes;
	}

	async getBasicRates() {
		let basicRates = this.localStorage.retrieve('basicRateCache');
		if (!basicRates) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getBasicRate';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				basicRates = r.body.enquiry.basicRates;
				this.localStorage.store('basicRateCache', r.body.enquiry.basicRates);
			}
		}
		// console.log('Data BasicRates:', basicRates);
		return basicRates;
	}

	getBasicRatesNew() {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getBasicRate';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getCareers() {
		let careers = this.localStorage.retrieve('careerCache');
		if (!careers) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getCareers';
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				careers = r.body.enquiry.nhomNganh;
				this.localStorage.store('careerCache', r.body.enquiry.nhomNganh);
			}
		}
		// console.log('Data Careers:', careers);
		return careers;
	}

	/**
	 * @return Observable
	 */
	getCareersNew(): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getCareers';
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	async getOccupations(nhomNganhID: string) {
		let occupations = this.localStorage.retrieve('occupationCache' + nhomNganhID);
		if (!occupations) {
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getJobs';
			enquiry.nhomNganhID = nhomNganhID;
			let bodyRequest = new BodyRequestEnquiryModel(GET_ENQUIRY, enquiry);
			let r = await this.commonService.getEnquiryUtility(bodyRequest);
			if (r && r.body && r.body.status == STATUS_OK
				&& r.body.enquiry.responseCode == CODE_00) {
				// console.log("r.body.enquiry.nhomNghe:" , r.body.enquiry.nhomNghe);
				occupations = r.body.enquiry.nhomNghe;
				this.localStorage.store('occupationCache' + nhomNganhID, r.body.enquiry.nhomNghe);
			}
		}
		// console.log('Data Occupations:', occupations);
		return occupations;
	}

	getOccupationsNew(nhomNganhID: string): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_UTILITY);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getJobs';
		enquiry.nhomNganhID = nhomNganhID;
		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callUtilityApi(bodyRequest);
	}

	/**
	 * @return Observable
	 * @param type: PORTFOLIO|CAMPAIGN|FT_COMMISSION_TYPE
	 */
	getPortfoliosNew(type: string): Observable<any> {
		const utilityHeader = this.appConfigService.getConfigByKey(HEADER_ACC_UTIL);
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getCatalogs';
		enquiry.category = type;

		const bodyRequest = {
			header: utilityHeader,
			body: {
				command: GET_ENQUIRY,
				enquiry: enquiry
			}
		};

		return this.callAccUtilityApi(bodyRequest);
	}

	getSeabAcBlock(): Observable<any> {
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		const bodyRequest = {
			header,
			body: {
				command: GET_ENQUIRY,
				enquiry: {
					enqID: 'T24ENQ.UTILITY.SEAB.AC.BLOCK.TEXT'
				}
			}
		};
		return this.callT24UtilityApi(bodyRequest);
	}

	checkAccExist(acc: string): Observable<any> {
		const header = this.appConfigService.getConfigByKey(HEADER_ACC_UTIL);
		const bodyRq = {
			header,
			body: {
				command: GET_ENQUIRY,
				enquiry: {
					authenType: 'getAccount_Info',
					accountId: acc
				}
			}
		};
		return this.callAccUtilityApi(bodyRq);
	}

	/**
	 * call api utility
	 * @param bodyRequest
	 */
	callUtilityApi(bodyRequest): Observable<any> {
		const utilityUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_UTILITY);
		return this.authHttpService.callPostApi(buildRequest(bodyRequest), utilityUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	/**
	 * call api acc utility
	 * @param bodyRequest
	 */
	callAccUtilityApi(bodyRequest): Observable<any> {
		const accUtilityUrl = this.appConfigService.getConfigByKey(SERVER_API_URL_ACC_UTIL);
		return this.authHttpService.callPostApi(buildRequest(bodyRequest), accUtilityUrl)
			.pipe(map(res => getResponseApi(res)));
	}

	callT24UtilityApi(bodyRequest): Observable<any> {
		const accUtilityUrl = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		return this.authHttpService.callPostApi(buildRequest(bodyRequest), accUtilityUrl)
			.pipe(map(res => getResponseApi(res)));
	}
}
