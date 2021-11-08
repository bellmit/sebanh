import {AccountRequestDTO} from '../../../../../../shared/model/constants/account-requestDTO';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {CardRequestDTO} from '../../../../../../shared/model/constants/card-requestDTO';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {NavigationEnd, Router} from '@angular/router';
import {WebsocketClientService} from '../../../../../../shared/services/websocket-client.service';
import * as _moment from 'moment';
import {default as _rollupMoment} from 'moment';

// import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
// import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

import {
	ACTIVE_CARD,
	APPROVE,
	APPROVE_CARD, APPROVED_SUCCESS, AU_THEN_TYPE,
	CARD_GET_DETAIL,
	CARD_INSERT,
	CARD_RELEASE_RESON,
	CARD_STATUS_LIST,
	CARD_UPDATE,
	CODE_00,
	DEBIT_LEVEL_LIST,
	ECOM_REGISTER_LIST,
	EXTEND_CARD,
	FEE_COLLECTION_PLANS,
	FEE_COLLECTION_PLANS_2,
	GET_ENQUIRY,
	GET_TRANSACTION, HAN_MUC_THE, HEADER_API_ACCOUNT,
	HEADER_API_CARD,
	HEADER_API_CARD_ODCPE,
	HEADER_API_CARD_TOKEN, LIST_GROUP_WITH_NAME,
	LOCK_CARD, MAIN_CARD_VERSION,
	NOTIFICATION, PENDING,
	REASON_CARD_LIST,
	REJECT_CARD,
	RELEASE_CARD_PIN,
	RESET_PIN_CARD_SERCURE, SERVER_API_CUST_INFO,
	SEVER_API_URL_CARD,
	SEVER_API_URL_CARD_ENQUIRY,
	SEVER_API_URL_CARD_ENQUIRY_OPDCE,
	STATUS_OK, SUB_CARD_VERSION,
	UPDATE_INFO,
	UPDATE_STATUS,
	UPDATE_TRANS_LIMIT,
	USERNAME_CACHED, UTILITY, FEE_POLICIES, CHARGE_BUSINESS_TYPE
} from '../../../../../../shared/util/constant';
import {AppConfigService} from '../../../../../../app-config.service';
import {TransactionModel} from '../../../../../model/transaction.model';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {finalize, map, takeUntil} from 'rxjs/operators';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {ModalDeleteComponent} from '../../../../../../shared/directives/modal-common/modal-delete/modal-delete.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {CardServices} from './card.services';
import {LOCAL_DATE_TIME} from '../../../../../../shared/model/constants/common-constant';
import {LocalStorageService} from 'ngx-webstorage';
import {SlaTimeService} from '../../../../../../shared/services/sla-time.service';
import {MatRadioChange} from '@angular/material/radio';
import {checkCardByCardType, formartDateYYYYMMDD} from '../../../../../../shared/util/Utils';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {ReportService} from '../../../../../common-service/report.service';
import {DataLinkMinio} from '../../../../../model/data-link-minio';
import {ModalNotification} from '../../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {CoreAiService} from '../../identify-customer/service/core-ai.service';
import {IActionCard, IHeaderTableErrorModel} from '../../../../../../shared/model/table-approve-error.model';
import {GtttUrlModel} from '../../../../../../shared/model/GtttUrl.model';
import {SignatureService} from '../../identify-customer/service/signature.service';
import { ChargeInfoService } from '../../charge-info/charge-info.service';
import { TransactionInfoComponent } from '../transaction-info/transaction-info.component';
import { ChargeInfoComponent } from '../../charge-info/charge-info.component';

const moment = _rollupMoment || _moment;
@Component({
	selector: 'kt-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss'],

})
export class CardComponent implements OnInit, OnDestroy, AfterViewInit {
	// truy van giao dich
	@Input('viewData') viewData: any;

	@ViewChild(TransactionInfoComponent, {static: false})
	transactionComponent: TransactionInfoComponent;

	@ViewChild('closeCard', {static: false})
	chargeInfoComponent: ChargeInfoComponent;

	@ViewChild('extendCard', {static: false})
	extendChargeInfoComponent: ChargeInfoComponent;

	@ViewChild('releaseCard', {static: false})
	releaseChargeInfoComponent: ChargeInfoComponent;

	isLoadingInput$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isLoadingAuth$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isLoadingRejected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	parentForm: FormGroup;
	dataWasChosenFromCheckbox: BehaviorSubject<any> = new BehaviorSubject<boolean>(null);
	dataQueryGetCardActionDetail$: BehaviorSubject<any> = new BehaviorSubject<boolean>(null);
	isLoadingCardInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCardDetail$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCardLimit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingEcomStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	cardInfosQueryByCustomer$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	isLoadingCardByToken$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingWrongEntryPinCode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isSearch: boolean = false;
	isClicked: boolean = false;
	mainCard: boolean = false;

	cash: string = 'CASH';
	online: string = 'ACCOUNT';
	free: string = 'FREE';
	otherReason: string = 'Khác';

	isChecked: boolean;

	isChangeCardStatus: boolean = false;
	isActiveCard: boolean = false;
	isClosedCard: boolean = false;
	isChangeTransLimit: boolean = false;
	isChangeCardInfo: boolean = false;
	isResetPin: boolean = false;
	isReleaseCard: boolean = false;
	isExtendCard: boolean = false;

	headerApiCard: any;
	apiUrlApiCard: any;
	apiUrlApiCardODCPE: any;
	headerApiCardDCPE: any;
	headerApiCardToken: any;
	apiUrlCardToken: any;

	cardId: any;

	dataCacheRouterFromDashboard: any;
	atmLimit: any;
	posLimit: any;
	ecomLimit: any;

	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	accessRightIds: string[] = [];

	debitLevelList = DEBIT_LEVEL_LIST;
	ecomRegisterList = ECOM_REGISTER_LIST;
	reasonList = REASON_CARD_LIST;
	cardStatusList$: BehaviorSubject<any> = new BehaviorSubject<any>(CARD_STATUS_LIST);
	cardReleaseReason = CARD_RELEASE_RESON;
	feeCollectionPlans = FEE_COLLECTION_PLANS;
	feeCollectionPlans2 = FEE_COLLECTION_PLANS_2;

	transactionInfo: any;

	parentName: string;
	childOne: string;
	childTwo: string;

	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCheckAcc$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	accountLK$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	checkedValue: any;
	isEcomRegister: boolean;

	chargeCodes$ = new BehaviorSubject<any[]>([]);

	isValidNewExpireDate: boolean = false;
	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	customerInfo: any;

	navigationSubscription: Subscription;
	headerError: IHeaderTableErrorModel[] = [];
	dataError: any = {};

	firstNavigate$ = new BehaviorSubject<boolean>(false);
	destroyed$ = new Subject<void>();
	accName$ = new BehaviorSubject<string>(null);
	disableEcom$ = new BehaviorSubject<boolean>(false);

	CARD_OK = 'UNLOCK';
	CARD_DO_NOT_HONOR = 'LOCK';
	PICK_UP_L41 = 'PICKUP-L41';
	PICK_UP_L41_CODE = '74';
	fieldsValidatorActionClose = ['fee', 'feeCodeClose', 'feeAccount', 'explain'];
	isThuPhiDongTHe: boolean;
	accountFeeNameCloseCard$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	isSubmittingReport$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	TYPE_THE_CHINH = 'master';
	TYPE_THE_PHU = 'slave';

	chargeBusinessType = CHARGE_BUSINESS_TYPE;
	feePolicies = FEE_POLICIES;
	currCocodeName: any;
	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private dataPowerService: DataPowerService,
				private router: Router,
				private appConfigService: AppConfigService,
				private modalService: NgbModal,
				private cardService: CardServices,
				private websocketClientService: WebsocketClientService,
				private slaTimeService: SlaTimeService,
				private localStorage: LocalStorageService,
				private reportService: ReportService,
				private utilityService: UtilityService,
				private coreAiService: CoreAiService,
				private signatureService: SignatureService,
				private chargeInfoService: ChargeInfoService
				) {
		this.parentName = 'Trang chủ';
		this.childOne = 'Quản lý nghiệp vụ giao dịch';
		this.childTwo = 'Quản lý thẻ';
		this.parentForm = this.fb.group({
			/**
			 * Form control cho thay đổi trạng thái thẻ
			 */
			updateCardStatusId: [null], // id
			cardStatus: [null, Validators.required], // cardStatus
			reasonId: [null, Validators.required], // reasonId
			reasonName: [null], // reasonId
			detail: [null], // detail

			/**
			 * Form control cho thay đổi hạn mức giao dịch
			 */
			// oldAtmLimit: [null], // oldAtmLimit
			// oldPosLimit: [null], // oldPosLimit
			// oldEcomLimit: [null], // oldEcomLimit
			// newAtmLimit: [null], // newAtmLimit
			// newPosLimit: [null], // newPosLimit
			// newEcomLimit: [null], // newEcomLimit


			oldAtmLimitPerDay: [null], // hạn mức ATM cũ trên ngày
			oldPosLimitPerDay: [null], // hạn mức POS cũ trên ngày
			oldEcomLimitPerDay: [null], // hạn mức ECOM cũ trên ngày
			newAtmLimitPerDay: [null], // hạn mức ATM mới trên ngày
			newPosLimitPerDay: [null], // hạn mức POS mới trên ngày
			newEcomLimitPerDay: [null], // hạn mức ECOM mới trên ngày

			oldAtmLimitPerTime: [null], // hạn mức ATM cũ trên lần
			oldPosLimitPerTime: [null], // hạn mức POS cũ trên lần
			oldEcomLimitPerTime: [null], // hạn mức ECOM cũ trên lần
			newAtmLimitPerTime: [null], // hạn mức ATM cũ trên lần
			newPosLimitPerTime: [null], // hạn mức POS cũ trên lần
			newEcomLimitPerTime: [null], // hạn mức ECOM cũ trên lần

			/**
			 * Form control cho thay đổi thông tin thẻ
			 */
			updateCardInfoId: [null], // id
			oldAccountAssociate: [null], // oldAccountAssociate
			oldAutomaticallyDebit: [null], // oldAutomaticallyDebit
			oldRegisEcom: [null], // oldRegisEcom
			newAccountAssociate: [null], // newAccountAssociate
			newAutomaticallyDebit: [null], // newAutomaticallyDebit
			newRegisEcom: [null], // newRegisEcom

			/**
			 * Form control cho Reset pin/ 3D secure
			 */
			resetPinCard3DSecureId: [null], // id
			pinVal: [null, Validators.required],
			pinValNum: [null, Validators.required],
			secure3DVal: [null, Validators.required],
			secure3DValNum: [null, Validators.required],

			/**
			 * Form control cho phát hành lại thẻ/pin
			 */
			releasePinCardId: [null], // id,
			reIssueVal: [null, Validators.required], //
			oldNameCard: [null], // oldNameCard
			oldAddressCard: [null], // oldAddressCard
			newNameCard: [null], // newNameCard
			newAddressCard: [null], // newAddressCard
			reasonId$: [null, Validators.required], // reasonId
			reasonName$: [null, Validators.required], // reasonName

			/**
			 * Form control cho gia hạn thẻ
			 */
			extendCardId: [null], // id,
			oldDateExpire: [null],
			newDateExpire: [null, [Validators.required, Validators.pattern('^((0[1-9])||(1[0-2]))\\/(\\d{4})$')]],
			oldAddress: [null, Validators.required],
			newAddress: [null],
			oldOtpPhone: [null],
			newOtpPhone: [null, Validators.pattern('0+([0-9]{9})')],

			/**
			 * Form control cho kích hoạt, đóng thẻ
			 */
			cardActiveLockId: [null], // id,
			feePolicy: ['MIEN_PHI'], // phương thức thu phí ,
			fee: [null],	   // Số tiền phí
			feeCodeClose: [null], // Mã phí
			feeAccount: [null], //TK thu phí
			feeDate: [new Date()],
			feeAmountClose: [null],
			tax: [null, Validators.required],
			chgIdClose: [null], //Bút toán thu phí
			explain: [null],
		});

		/**
		 * Check access right by router url
		 */
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);

		this.headerApiCard = this.appConfigService.getConfigByKey(HEADER_API_CARD);
		this.apiUrlApiCard = this.appConfigService.getConfigByKey(SEVER_API_URL_CARD);
		this.headerApiCardToken = this.appConfigService.getConfigByKey(HEADER_API_CARD_TOKEN);
		this.apiUrlCardToken = this.appConfigService.getConfigByKey(SEVER_API_URL_CARD_ENQUIRY);
		this.apiUrlApiCardODCPE = this.appConfigService.getConfigByKey(SEVER_API_URL_CARD_ENQUIRY_OPDCE);
		this.headerApiCardDCPE = this.appConfigService.getConfigByKey(HEADER_API_CARD_ODCPE);


		/**
		 * Check access right by router url
		 */

		this.navigationSubscription = this.router.events.subscribe((e: any) => {
			// If it is a NavigationEnd event re-initalise the component
			if (e instanceof NavigationEnd) {
				this.firstNavigate$.next(true);
				this.initData();
			}
		});
	}

	ngOnInit() {
		this.getChargeCodes();
		if (this.viewData || !this.firstNavigate$.getValue()) {
			this.initData();
		}
		let codeList = this.localStorage.retrieve('co_code_list');
		let currCocode = this.localStorage.retrieve('cache_co_code');
		this.currCocodeName = codeList.find(code => code.group_id == currCocode).desc;	
	}

	getChargeCodes(): void {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE);
		if (cache) {
			const dataFiltered = cache.filter(ele => ele.flatAmt);
			this.chargeCodes$.next(dataFiltered);
			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const commisstions = res.body.enquiry.catalogs;
					const dataFiltered = commisstions.filter(ele => ele.flatAmt);
					this.chargeCodes$.next(dataFiltered);
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE, commisstions);
				}
			});
	}
	cityList: any[] = [];
	initData() {
		this.getCities(); //list thành phố
		if (this.viewData) {
			this.dataCacheRouterFromDashboard = this.viewData;
		} else {
			if (window.history.state.obj360 && window.history.state.custId) {
				this.commonService.customerId$.next(window.history.state.custId);
				this.getListCardPickUpL41ByCustomerId(window.history.state.custId);
				this.getCardDetail();
				this.getCustomerInfo()
			}
			this.slaTimeService.startCalculateSlaTime();
			this.checkRight();
			this.commonService.isDisplayAsideRight$.next(true);
			this.commonService.isAsideRight$.next(true);
			this.dataCacheRouterFromDashboard = window.history.state.data;
		}
		if (this.dataCacheRouterFromDashboard) {
			console.warn('data cache router ->>>>>>>>>>', this.dataCacheRouterFromDashboard);
			if (this.dataCacheRouterFromDashboard.cardStatus == 185 && this.dataCacheRouterFromDashboard.productStatus == 'R') {
				this.disableEcom$.next(true);
			}
			this.getListCardPickUpL41ByCustomerId(this.dataCacheRouterFromDashboard.customerId);
			this.getCardDetail();
			let actionT24 = this.dataCacheRouterFromDashboard.actionT24;

			let listActionT24 = actionT24.split(';');

			if (listActionT24.length > 0) {
				this.setCardStatusFalse();
				this.classifyBusinessByActionT24(listActionT24);
			}
			const similarity = this.dataCacheRouterFromDashboard.similarityCoreAi;
			if (similarity) {
				this.signatureService.verifySignature$.next({
					similarity: similarity,
					value: null,
					confidence: null,
					signatures: []
				});
			}
			// hien thi hinh anh cap nhat
			let cardFront = this.signatureService.buildImgSrcForGttt(this.dataCacheRouterFromDashboard.cardFront);
			let cardBack = this.signatureService.buildImgSrcForGttt(this.dataCacheRouterFromDashboard.cardBack);
			let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataCacheRouterFromDashboard.pictureFace);
			let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataCacheRouterFromDashboard.fingerLeft);
			let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataCacheRouterFromDashboard.fingerRight);

			let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
			this.getImageUser(this.dataCacheRouterFromDashboard.customerId, gtttModel);
		}
	}

	getCities() {
		let cityCached = this.localStorage.retrieve('cityCached');
		if (cityCached) {
			this.cityList = cityCached;
		} else {
			let command = GET_ENQUIRY;
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getCITIES';
			let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
			this.commonService.actionGetEnquiryUtility(bodyRequest)
				.subscribe(r => {
					if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
						this.cityList = r.enquiry.city;
						this.localStorage.store('cityCached', r.enquiry.city);
					}
				});
		}
	}
	districtList: any[]= []
	getDistrict(province) {
		const provinceId = province ? province : this.frm.province.value;
		this.fetchDistrict(provinceId)
			.pipe(finalize(() => this.district = this.districtList.find(dist => dist.districID == this.customerInfo.seabDistrict1).name_gb))
			.subscribe(res => {
				this.districtList = res;
				console.warn('this.districtList', this.districtList);
			});
	}

	fetchDistrict(provinceId: string): Observable<any> {
		const command = GET_ENQUIRY;
		const enquiry = {
			authenType: 'getDISTRICTS',
			cityID: provinceId
		};
		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		return this.commonService.actionGetEnquiryUtility(bodyRequest)
			.pipe(map(r => {
				if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
					return r.enquiry.district;
				} else {
					return [];
				}
			}));
	}

	checkApproveStatus(stateData, actionCard: IActionCard) {
		if (stateData.status == 'APPROVED_ERROR') {
			const actionT24Arr = stateData.actionT24.split(';');
			this.headerError.push({
				code: 'generalInfo',
				value: 'Thông tin chung'
			});
			this.dataError['generalInfo'] = {
				status: stateData.status,
				desc: stateData.errorDesc
			};
			if (actionT24Arr.includes(ACTIVE_CARD)) {
				this.headerError.push({
					code: 'cardActionActive',
					value: 'Kích hoạt thẻ'
				});
				this.dataError['cardActionActive'] = {
					status: actionCard.cardActionActive.status,
					desc: actionCard.cardActionActive.errorDesc
				};
			}
			if (actionT24Arr.includes(LOCK_CARD)) {
				this.headerError.push({
					code: 'cardActionLock',
					value: 'Đóng thẻ thẻ'
				});
				this.dataError['cardActionLock'] = {
					status: actionCard.cardActionLock.status,
					desc: actionCard.cardActionLock.errorDesc
				};
			}
			if (actionT24Arr.includes(UPDATE_STATUS)) {
				this.headerError.push({
					code: 'cardActionUpdateStatus',
					value: 'Thay đổi trạng thái thẻ'
				});
				this.dataError['cardActionUpdateStatus'] = {
					status: actionCard.cardActionUpdateStatus.status,
					desc: actionCard.cardActionUpdateStatus.errorDesc
				};
			}
			if (actionT24Arr.includes(UPDATE_TRANS_LIMIT)) {
				this.headerError.push({
					code: 'lstCardActionUpdateTransLimit',
					value: 'Thay đổi hạn mức giao dịch'
				});
				this.dataError['lstCardActionUpdateTransLimit'] = {
					status: actionCard.lstCardActionUpdateTransLimit[0].status,
					desc: actionCard.lstCardActionUpdateTransLimit[0].errorDesc
				};
			}
			if (actionT24Arr.includes(UPDATE_INFO)) {
				this.headerError.push({
					code: 'cardActionUpdateInfo',
					value: 'Thay đổi thông tin thẻ'
				});
				this.dataError['cardActionUpdateInfo'] = {
					status: actionCard.cardActionUpdateInfo.status,
					desc: actionCard.cardActionUpdateInfo.errorDesc
				};
			}
			if (actionT24Arr.includes(RESET_PIN_CARD_SERCURE)) {
				this.headerError.push({
					code: 'cardActionResetPinSercure',
					value: 'Reset PIN/3D Secure'
				});
				this.dataError['cardActionResetPinSercure'] = {
					status: actionCard.cardActionResetPinSercure.status,
					desc: actionCard.cardActionResetPinSercure.errorDesc
				};
			}
			if (actionT24Arr.includes(RELEASE_CARD_PIN)) {
				this.headerError.push({
					code: 'cardActionReleaseCardPin',
					value: 'Phát hành lại thẻ PIN'
				});
				this.dataError['cardActionResetPinSercure'] = {
					status: actionCard.cardActionReleaseCardPin.status,
					desc: actionCard.cardActionReleaseCardPin.errorDesc
				};
			}
			if (actionT24Arr.includes(EXTEND_CARD)) {
				this.headerError.push({
					code: 'cardActionExtendCard',
					value: 'Gia hạn thẻ'
				});
				this.dataError['cardActionExtendCard'] = {
					status: actionCard.cardActionExtendCard.status,
					desc: actionCard.cardActionExtendCard.errorDesc
				};
			}
		}
	}
	city: any;
	district: any;
	getCustomerInfo(gtttModel?: GtttUrlModel) {
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		if(window.history.state.obj360 && window.history.state.custId) {
			bodyConfig.enquiry.customerID = window.history.state.custId;
		} else {
			bodyConfig.enquiry.customerID = this.frm.transactionForm.value.customerId;
		}
		if (this.commonService.changeCustomerGTTT$.getValue()) {
			bodyConfig.enquiry.customerID = this.commonService.customerId$.getValue();
		}
		if (!gtttModel) {
			gtttModel = new GtttUrlModel(null, null, null, null, null);
		}
		this.getImageUser(bodyConfig.enquiry.customerID, gtttModel);
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.customerInfo = res.enquiry;
					this.getDistrict(this.customerInfo.province); //list quận huyện
					this.city = this.cityList.find(city=> city.cityID == this.customerInfo.province).cityName;
				} else {
					return;
				}
			});
	}

	classifyBusinessByActionT24(listActionT24: any) {

		if (listActionT24.includes(ACTIVE_CARD)) {
			this.isActiveCard = true;
		}

		if (listActionT24.includes(LOCK_CARD)) {
			this.isClosedCard = true;
		}

		if (listActionT24.includes(UPDATE_STATUS)) {
			this.isChangeCardStatus = true;
		}

		if (listActionT24.includes(UPDATE_TRANS_LIMIT)) {
			this.isChangeTransLimit = true;
		}

		if (listActionT24.includes(UPDATE_INFO)) {
			this.isChangeCardInfo = true;
		}

		if (listActionT24.includes(RESET_PIN_CARD_SERCURE)) {
			this.isResetPin = true;
		}

		if (listActionT24.includes(RELEASE_CARD_PIN)) {
			this.isReleaseCard = true;
		}

		if (listActionT24.includes(EXTEND_CARD)) {
			this.isExtendCard = true;
		}

		this.fillValFrmDash();
	}

	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	getListActionDisableIfApprovedOk(card?: any): any {

		let listActionApprovedSuccess = [];
		if (card && card.cardActionExtendCard && card.cardActionExtendCard.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(EXTEND_CARD);
		}

		if (card && card.cardActionActive && card.cardActionActive.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(ACTIVE_CARD);
		}

		if (card && card.cardActionLock && card.cardActionLock.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(LOCK_CARD);
		}

		if (card && card.cardActionUpdateStatus && card.cardActionUpdateStatus.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(UPDATE_STATUS);
		}

		if (card && card.cardActionUpdateInfo && card.cardActionUpdateInfo.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(UPDATE_INFO);
		}

		if (card && card.cardActionResetPinSercure && card.cardActionResetPinSercure.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(RESET_PIN_CARD_SERCURE);
		}

		if (card && card.cardActionReleaseCardPin && card.cardActionReleaseCardPin.status == APPROVED_SUCCESS) {
			listActionApprovedSuccess.push(RELEASE_CARD_PIN);
		}

		let numberOfActionUpdateTransLimitSuccess = 0;
		if (card && card.lstCardActionUpdateTransLimit && card.lstCardActionUpdateTransLimit.length > 0) {
			card.lstCardActionUpdateTransLimit.forEach(cardLimit => {
				if (cardLimit.status == APPROVED_SUCCESS) {
					numberOfActionUpdateTransLimitSuccess++;
				}
			});

			if (numberOfActionUpdateTransLimitSuccess == card.lstCardActionUpdateTransLimit.length) {
				listActionApprovedSuccess.push(UPDATE_TRANS_LIMIT);
			}
		}

		return listActionApprovedSuccess;
	}

	disableActions$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

	fillValFrmDash() {
		this.dataQueryGetCardActionDetail$.subscribe(res => {
			if (res) {
				// if((res.cardTemporary.productStatusName == 'Locked') && res.cardTemporary.cardStatus == '185')

				console.log('resssssssssssssssssssssssss', res);
				if (this.isChangeCardStatus) {
					this.parentForm.patchValue({
						updateCardStatusId: res.cardActionUpdateStatus.id,
						cardStatus: res.cardActionUpdateStatus.cardStatus,
						reasonId: res.cardActionUpdateStatus.reasonId,
						detail: res.cardActionUpdateStatus.detail,
					});

					this.disableActions$.next([...this.disableActions$.getValue(), ...UPDATE_STATUS]);
				}

				if (this.isChangeTransLimit) {
					let cardsTransLimit: any[] = res.lstCardActionUpdateTransLimit;
					let atmCardLimit = cardsTransLimit.find(r => r.limitCode == 'ATM');
					let posCardLimit = cardsTransLimit.find(r => r.limitCode == 'POS');
					let ecomCardLimit = cardsTransLimit.find(r => r.limitCode == 'ECOM');
					if (atmCardLimit) {
						this.parentForm.patchValue({
							oldAtmLimitPerDay: atmCardLimit ? atmCardLimit.maxAmount : null,
							newAtmLimitPerDay: atmCardLimit ? atmCardLimit.oldAtmLimit : null,
							oldAtmLimitPerTime: atmCardLimit ? atmCardLimit.maxSingleAmount : null,
							newAtmLimitPerTime: atmCardLimit ? atmCardLimit.newAtmLimit : null,
						});
					}
					if (posCardLimit) {
						this.parentForm.patchValue({
							oldPosLimitPerDay: posCardLimit ? posCardLimit.maxAmount : null,
							newPosLimitPerDay: posCardLimit ? posCardLimit.oldPosLimit : null,
							newPosLimitPerTime: posCardLimit ? posCardLimit.newPosLimit : null,
							oldPosLimitPerTime: posCardLimit ? posCardLimit.maxSingleAmount : null,
						});
					}
					if (ecomCardLimit) {
						this.parentForm.patchValue({
							oldEcomLimitPerDay: ecomCardLimit ? ecomCardLimit.maxAmount : null,
							newEcomLimitPerDay: ecomCardLimit ? ecomCardLimit.oldEcomLimit : null,
							oldEcomLimitPerTime: ecomCardLimit ? ecomCardLimit.maxSingleAmount : null,
							newEcomLimitPerTime: ecomCardLimit ? ecomCardLimit.newEcomLimit : null,
						});
					}
				}

				if (this.isChangeCardInfo) {
					this.parentForm.patchValue({
						updateCardInfoId: res.cardActionUpdateInfo.id,
						oldAccountAssociate: res.cardActionUpdateInfo.oldAccountAssociate,
						newAccountAssociate: res.cardActionUpdateInfo.newAccountAssociate,
						oldAutomaticallyDebit: res.cardActionUpdateInfo.oldAutomaticallyDebit,
						newAutomaticallyDebit: res.cardActionUpdateInfo.newAutomaticallyDebit,
						oldRegisEcom: res.cardActionUpdateInfo.oldRegisEcom,
						newRegisEcom: res.cardActionUpdateInfo.newRegisEcom,
						oldOtpPhone: res.cardActionUpdateInfo.oldOtpPhone,
						newOtpPhone: res.cardActionUpdateInfo.newOtpPhone
					});
				}

				if (this.isResetPin) {
					this.parentForm.patchValue({
						resetPinCard3DSecureId: res.cardActionResetPinSercure.id,
						pinValNum: res.cardActionResetPinSercure.pinWrongNumber,
						secure3DValNum: res.cardActionResetPinSercure.thirdDWrongNumber,
						pinVal: !!res.cardActionResetPinSercure.actionResetPin,
						secure3DVal: !!res.cardActionResetPinSercure.actionResetThirdD
					});
				}

				if (this.isReleaseCard) {
					if (res.cardActionReleaseCardPin.feeCollectionPlan == 'FREE') {
						this.parentForm.controls.accountFee.disable();
						this.parentForm.controls.feeCode.disable();
						this.parentForm.controls.feeAmount.disable();
					}
					this.parentForm.patchValue({
						releasePinCardId: res.cardActionReleaseCardPin.id,
						reasonId$: res.cardActionReleaseCardPin.reasonName,
						oldNameCard: res.cardActionReleaseCardPin.oldNameCard,
						newNameCard: res.cardActionReleaseCardPin.newNameCard,
						oldAddressCard: res.cardActionReleaseCardPin.oldAddressCard,
						newAddressCard: res.cardActionReleaseCardPin.newAddressCard,
						reIssueVal: res.cardActionReleaseCardPin.releaseType,
						feeCollectionPlan: res.cardActionReleaseCardPin.feeCollectionPlan,
						accountFee: res.cardActionReleaseCardPin.accountFee,
						feeCode: res.cardActionReleaseCardPin.feeCode,
						feeAmount: res.cardActionReleaseCardPin.feeAmount,
					});
				}
				if (this.isExtendCard) {
					if (res.cardActionExtendCard.feeCollectionPlan == 'FREE') {
						this.parentForm.controls.accountFee$.disable();
						this.parentForm.controls.feeCode$.disable();
						this.parentForm.controls.feeAmount$.disable();
					}
					this.parentForm.patchValue({
						extendCardId: res.cardActionExtendCard.id,
						oldDateExpire: res.cardActionExtendCard.oldDateExpired,
						newDateExpire: res.cardActionExtendCard.newDateExpired,
						oldAddress: res.cardActionExtendCard.oldAddressCard,
						newAddress: res.cardActionExtendCard.newAddressCard,
						feeCollectionPlan$: res.cardActionExtendCard.feeCollectionPlan,
						accountFee$: res.cardActionExtendCard.accountFee,
						feeCode$: res.cardActionExtendCard.feeCode,
						feeAmount$: res.cardActionExtendCard.feeAmount,
					});
				}

				if (this.isClosedCard && res.cardActionLock) {
					this.patchValueActionCloseCardFromSeATellerApi(res.cardActionLock);
				}

				if (this.isActiveCard && res.cardActionActive) {
					this.parentForm.controls.cardActiveLockId.setValue(res.cardActionActive.id);
				}

				const disableActions = this.getListActionDisableIfApprovedOk(res);

				this.disableActions$.next([...disableActions]);
			}
		});
	}

	/**
	 * Hàm này lấy data action đóng thẻ truy vấn từ seateller front-end api
	 * data đc patch value vào form đóng thẻ
	 * @param closeCard
	 */
	patchValueActionCloseCardFromSeATellerApi(closeCard: any) {
		if (closeCard == null) {
			return;
		}

		// update validator cho form đóng thẻ
		const methodGetFee = closeCard.feePolicy;

		this.updateValidatorActionCloseCard(methodGetFee);

		this.parentForm.patchValue({
			cardActiveLockId: closeCard ? closeCard.id : null,
			feeCodeClose: closeCard.feeCode ? closeCard.feeCode : null,
			fee: closeCard.fee ? closeCard.fee : null,
			feePolicy: methodGetFee ? methodGetFee : null,
			feeAccount: closeCard.feeAccount ? closeCard.feeAccount : null,
			feeDate: closeCard.feeDate ? moment(closeCard.feeDate, 'DD-MM-YYYY').toDate() : null,
			feeAmountClose: closeCard.feeAmount ? closeCard.feeAmount : null,
			tax: closeCard.tax ? closeCard.tax : null,
			chgIdClose: closeCard.chgId ? closeCard.chgId : null,
			explain: closeCard.explain ? closeCard.explain : null,
		});
	}

	get selected() {
		return this.dataWasChosenFromCheckbox.getValue();
	}

	ngAfterViewInit() {
		if (!this.dataCacheRouterFromDashboard) {
			this.parentForm.valueChanges.subscribe(() => {
				if (this.parentForm.controls.transactionForm.value) {
					this.transactionInfo = this.parentForm.controls.transactionForm.value;
					// this.auditInfo = this.parentForm.controls.auditInfoForm.value;
				}
			});
		}
	}

	ngOnDestroy(): void {
		this.chargeInfoService.customerIdOfAccounts.next(null);
		this.disableEcom$.next(false);
		this.commonService.changeCustomerGTTT$.next(null);
		this.slaTimeService.clearTimeSLA();
		this.commonService.isDisplayFile$.next(false);
		this.cardInfosQueryByCustomer$.next(null);
		this.dataWasChosenFromCheckbox.next(null);
		// remove image aside right
		this.coreAiService.navigateToCombo$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		if (this.navigationSubscription) {
			this.navigationSubscription.unsubscribe();
		}
		this.destroyed$.next();
	}

	getListCardPickUpL41ByCustomerId(customerId?: string) {
		if(!customerId) {
			const customerID = this.transactionComponent.transactionForm.controls.customerId.value;
		console.warn('customerID', customerID);
		this.chargeInfoService.customerIdOfAccounts.next(customerID);
		} else {
		this.chargeInfoService.customerIdOfAccounts.next(customerId);
		}


		this.dataWasChosenFromCheckbox.next(null);
		this.cardInfosQueryByCustomer$.next(null);
		this.isLoadingCardInfo$.next(true);
		let url = this.apiUrlApiCardODCPE;
		let header = this.headerApiCardDCPE;
		let bodyConfig = CardRequestDTO.BODY.BODY_GET_CARD_STATUS_PICKUP_L41;

		bodyConfig.enquiry.customerID = customerId
			? customerId
			: this.commonService.customerId$.getValue();


		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCardInfo$.next(false)))
			.subscribe(res => {
				if (res.status == 'OK') {

					// this.commonService.getFilesByCustomerId(customerId);

					let listPickUpL41 = res.enquiry.card;
					this.cardInfosQueryByCustomer$.next(listPickUpL41);
					console.log('listPickUpL41', listPickUpL41);

					//TODO checked checkbox khi chuyển dữ liệu qua router
					if (this.dataCacheRouterFromDashboard) {

						let cardTotal = this.cardInfosQueryByCustomer$.getValue();
						if (cardTotal.length > 0) {
							cardTotal.forEach(card => {
								if ((card.tokenCard == this.dataCacheRouterFromDashboard.tokenCard) || (card.tokenCard == (this.dataCacheRouterFromDashboard.cardTemporary && this.dataCacheRouterFromDashboard.cardTemporary.tokenCard))) {
									this.dataWasChosenFromCheckbox.next(card);
								}
							});
						}
					} else {
						this.setCardStatusFalse();
					}

				} else {
					this.cardInfosQueryByCustomer$.next(null);
				}
			});
	}

	getCardLimit(event?: any) {

		if (event && event.target.checked == false) {
			return;
		}

		if (this.selected || this.dataQueryGetCardActionDetail$.getValue()) {
			this.isLoadingCardLimit$.next(true);
			let url = this.apiUrlApiCard;
			let header = this.headerApiCard;
			let bodyConfig = CardRequestDTO.BODY.BODY_GET_CARD_LIMIT;
			bodyConfig.enquiry.tokenCard = this.dataCacheRouterFromDashboard
				? this.dataCacheRouterFromDashboard.tokenCard
				: this.dataWasChosenFromCheckbox.getValue().tokenCard;
			console.log(bodyConfig, 'body get limit card');

			this.commonService.getCardLimitInfo(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingCardLimit$.next(false)))
				.subscribe(res => {
					console.log('Truy vấn thông tin hạn mức GD ============>: ', JSON.stringify(res));

					const isResponseOk = res && res.body && res.body.status == 'OK';
					if (isResponseOk) {
						if (res.body.enquiry.limit_card) {
							let cardsLimit = res.body.enquiry.limit_card;

							this.atmLimit = cardsLimit.find(atm => (atm.code == HAN_MUC_THE.ATM_NOI_DIA || atm.code == HAN_MUC_THE.ATM_QUOC_TE));
							this.posLimit = cardsLimit.find(atm => atm.code == HAN_MUC_THE.POS);
							this.ecomLimit = cardsLimit.find(atm => atm.code == HAN_MUC_THE.ECOM);

							this.frm.oldAtmLimitPerDay.patchValue(this.atmLimit ? this.atmLimit.maxAmount : '0');
							this.frm.oldPosLimitPerDay.patchValue(this.posLimit ? this.posLimit.maxAmount : '0');
							this.frm.oldEcomLimitPerDay.patchValue(this.ecomLimit ? this.ecomLimit.maxAmount : '0');

							this.frm.oldAtmLimitPerTime.patchValue(this.atmLimit ? this.atmLimit.maxSingleAmount : '0');
							this.frm.oldPosLimitPerTime.patchValue(this.posLimit ? this.posLimit.maxSingleAmount : '0');
							this.frm.oldEcomLimitPerTime.patchValue(this.ecomLimit ? this.ecomLimit.maxSingleAmount : '0');

						}
					} else {
						return;
					}
				});
		}
	}

	getCardLimitWay4(atmLimit, posLimit, ecomLimit) {
		this.isLoadingCardLimit$.next(true);
		let bodyConfig = CardRequestDTO.BODY.BODY_GET_CARD_LIMIT;
		bodyConfig.enquiry.tokenCard = this.dataCacheRouterFromDashboard.tokenCard;
		console.group('Lay thong tin han muc giao dich the View chi tiet');
		this.commonService.getCardLimitInfo(bodyConfig, this.headerApiCard, this.apiUrlApiCard)
			.pipe(finalize(() => this.isLoadingCardLimit$.next(false)))
			.subscribe(res => {
				if (res && res.body && res.body.status == 'OK') {
					if (res.body.enquiry.limit_card) {
						const cardsLimit = res.body.enquiry.limit_card;
						const atmLimitWay4 = cardsLimit.find(atm => (atm.code == HAN_MUC_THE.ATM_NOI_DIA || atm.code == HAN_MUC_THE.ATM_QUOC_TE));
						const posLimitWay4 = cardsLimit.find(atm => atm.code == HAN_MUC_THE.POS);
						const ecomLimitWay4 = cardsLimit.find(atm => atm.code == HAN_MUC_THE.ECOM);
						if (!atmLimit) {
							this.frm.oldAtmLimitPerDay.patchValue(atmLimitWay4 ? atmLimitWay4.maxAmount : '0');
							this.frm.oldAtmLimitPerTime.patchValue(atmLimitWay4 ? atmLimitWay4.maxSingleAmount : '0');
						}
						if (!posLimit) {
							this.frm.oldPosLimitPerDay.patchValue(posLimitWay4 ? posLimitWay4.maxAmount : '0');
							this.frm.oldPosLimitPerTime.patchValue(posLimitWay4 ? posLimitWay4.maxSingleAmount : '0');
						}
						if (!ecomLimit) {
							this.frm.oldEcomLimitPerDay.patchValue(ecomLimitWay4 ? ecomLimitWay4.maxAmount : '0');
							this.frm.oldEcomLimitPerTime.patchValue(ecomLimitWay4 ? ecomLimitWay4.maxSingleAmount : '0');
						}
					}
				} else {
					return;
				}
			});
		console.groupEnd();
	}

	getCardDetail() {
		if (this.dataCacheRouterFromDashboard) {
			let command = GET_ENQUIRY;
			let enquiry = new EnquiryModel();
			enquiry.authenType = CARD_GET_DETAIL;
			enquiry.data = {
				transactionId: this.dataCacheRouterFromDashboard.id
			};
			this.isLoadingCardDetail$.next(true);
			let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
			console.log(bodyRequest, 'bodyRequest');
			this.commonService.actionGetEnquiryResponseApi(bodyRequest)
				.pipe(finalize(() => this.isLoadingCardDetail$.next(false)))
				.subscribe(r => {

					if (r) {
						this.dataQueryGetCardActionDetail$.next(r.enquiry.product);
						this.checkApproveStatus(this.dataCacheRouterFromDashboard, r.enquiry.product);
						console.log('this.dataQueryGetCardActionDetail$.', this.dataQueryGetCardActionDetail$.getValue());
						if (this.dataQueryGetCardActionDetail$.getValue()) {
							let cardsLimit = r.enquiry.product.lstCardActionUpdateTransLimit;
							if (cardsLimit) {
								this.atmLimit = cardsLimit.find(atm => (atm.usageCode == 'cw' || atm.usageCode == 'trnx'));
								this.posLimit = cardsLimit.find(atm => atm.usageCode == 'pos_r');
								this.ecomLimit = cardsLimit.find(atm => atm.usageCode == 'ecom_r');
								this.getCardLimitWay4(this.atmLimit, this.posLimit, this.ecomLimit);
							}
						}
						this.cardId = r.enquiry.product.cardTemporary.id;
					} else {
						return;
					}
				});
		}
	}

	onImporterSubmit() {

		console.log('this.parentForm', this.parentForm);
		this.isClicked = true;

		let valid = this.getFormValid();
		if (!valid) {
			return;
		}

		this.slaTimeService.endCalculateSlaTime();
		console.log('SLA END CARD ======================>>>', this.slaTimeService.endCalculateSlaTime());

		let command = GET_TRANSACTION;
		let cardId = this.frm.transactionForm.value.transId;
		let transaction = new TransactionModel();
		transaction.authenType = this.dataCacheRouterFromDashboard ? CARD_UPDATE : CARD_INSERT;

		if (this.isClosedCard || this.isActiveCard) {
			this.showModalConfirmActiveOrCloseCard();
			return;
		}

		this.isLoadingInput$.next(true);
		transaction.data = {

			cardTemporary: this.mappingCardTemporary(cardId),

			cardActionActiveLockCard: this.isClosedCard ? this.mappingModelCloseCard(cardId)
				: (this.isActiveCard ? this.mappingModelActiveCard(cardId) : null),

			cardActionExtendCard: this.isExtendCard ? this.mappingModelExtendCard(cardId) : null,

			cardActionReleaseCardPin: this.isReleaseCard ? this.mappingModelReleasePinCode(cardId) : null,

			cardActionResetPinSercure: this.isResetPin ? this.mappingResetPinSecure(cardId) : null,

			cardActionUpdateInfo: this.isChangeCardInfo ? this.mappingModelUpdateCardInfo(cardId) : null,

			cardActionUpdateStatus: this.isChangeCardStatus ? this.mappingModelChangeCardStatus(cardId) : null,

			lstCardActionUpdateTransLimit: this.isChangeTransLimit ? this.buildListCardChangeLimit() : null
		};

		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		console.log(bodyRequest, 'bodyRequest');
		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => this.isLoadingInput$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${cardId} đã được gửi duyệt tới KSV`);

					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, cardId, NOTIFICATION.PRODUCT_TYPE.CARD);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	showModalConfirmActiveOrCloseCard() {
		let command = GET_TRANSACTION;
		let cardId = this.frm.transactionForm.value.transId;
		let transaction = new TransactionModel();
		transaction.authenType = this.dataCacheRouterFromDashboard ? CARD_UPDATE : CARD_INSERT;

		const modalRef = this.modalService.open(ModalDeleteComponent, {
			size: 'lg',
			centered: true,
			windowClass: 'notificationDialog'
		});

		transaction.data = {
			cardTemporary: this.mappingCardTemporary(cardId),
			lstCardActionUpdateTransLimit: this.isChangeTransLimit ? this.buildListCardChangeLimit() : null,
			cardActionActiveLockCard: this.isClosedCard ? this.mappingModelCloseCard(cardId) : (this.isActiveCard ? {
				cardId: cardId,
				cardActiveLockStatus: ACTIVE_CARD,
				userInput: this.frm.auditInfoForm.value.inputter,
				userAuthorized: this.frm.auditInfoForm.value.authoriser,
			} : null),
		};

		let cardNumberWasChosen = this.dataWasChosenFromCheckbox.getValue().cardNumber;

		let contentModal;
		if (this.isClosedCard) {
			contentModal = `Bạn có muốn đóng thẻ ${cardNumberWasChosen} ?`;

		} else if (this.isActiveCard) {
			contentModal = `Bạn có muốn kích hoạt thẻ ${cardNumberWasChosen} ?`;

		}

		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
		modalRef.componentInstance.content = contentModal;
		modalRef.result.then(res => {
			if (res == 'done') {
				this.commonService.success(`Bản ghi ${transaction.data.cardTemporary.id} đã được gửi duyệt tới KSV`);
				this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, cardId, NOTIFICATION.PRODUCT_TYPE.CARD);
			}
		});
		return;
	}

	buildListCardChangeLimit() {

		let dataActionCardFEApi;
		let ecomCardLimit;
		let posCardLimit;
		let atmCardLimit;

		if (this.dataQueryGetCardActionDetail$.getValue() != null) {
			dataActionCardFEApi = this.dataQueryGetCardActionDetail$.getValue().lstCardActionUpdateTransLimit;
			atmCardLimit = dataActionCardFEApi.find(r => r.limitCode == 'ATM');
			posCardLimit = dataActionCardFEApi.find(r => r.limitCode == 'POS');
			ecomCardLimit = dataActionCardFEApi.find(r => r.limitCode == 'ECOM');
		}
		let transLimitAtm = ((this.frm.newAtmLimitPerTime.value || this.frm.newAtmLimitPerDay.value) ? {
			oldAtmLimit: this.frm.newAtmLimitPerDay.value ? this.frm.newAtmLimitPerDay.value : null,
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
			newAtmLimit: this.frm.newAtmLimitPerTime.value ? this.frm.newAtmLimitPerTime.value : null,
			startDate: this.atmLimit ? this.atmLimit.startDate : atmCardLimit.startDate,
			endDate: this.atmLimit ? this.atmLimit.endDate : atmCardLimit.endDate,
			usageCode: this.atmLimit ? this.atmLimit.code || this.atmLimit.usageCode : atmCardLimit.usageCode,
			maxAmount: this.frm.oldAtmLimitPerDay.value ? this.frm.oldAtmLimitPerDay.value : null,
			maxSingleAmount: this.frm.oldAtmLimitPerTime.value ? this.frm.oldAtmLimitPerTime.value : null,
			maxNumber: this.atmLimit ? this.atmLimit.maxNumber : atmCardLimit.maxNumber,
			limitCode: 'ATM',
		} : null);

		let transLimitEcom = ((this.frm.newEcomLimitPerDay.value || this.frm.newEcomLimitPerTime.value) ? {
			oldEcomLimit: this.frm.newEcomLimitPerDay.value ? this.frm.newEcomLimitPerDay.value : null,  //Hạn mức ngày
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
			newEcomLimit: this.frm.newEcomLimitPerTime.value ? this.frm.newEcomLimitPerTime.value : null, //Hạn mức lần
			startDate: this.ecomLimit ? this.ecomLimit.startDate : ecomCardLimit.startDate,
			endDate: this.ecomLimit ? this.ecomLimit.endDate : ecomCardLimit.endDate,
			usageCode: this.ecomLimit ? this.ecomLimit.code || this.ecomLimit.usageCode : ecomCardLimit.usageCode,
			maxAmount: this.frm.oldEcomLimitPerDay.value ? this.frm.oldEcomLimitPerDay.value : null,
			maxSingleAmount: this.frm.oldEcomLimitPerTime.value ? this.frm.oldEcomLimitPerTime.value : null,
			maxNumber: this.ecomLimit ? this.ecomLimit.maxNumber : ecomCardLimit.maxNumber,
			limitCode: 'ECOM',
		} : null);

		let transLimitPos = ((this.frm.newPosLimitPerDay.value || this.frm.newPosLimitPerTime.value) ?
			{
				oldPosLimit: this.frm.newPosLimitPerDay.value ? this.frm.newPosLimitPerDay.value : null,  //Hạn mức ngày
				userInput: this.frm.auditInfoForm.value.inputter,
				userAuthorized: this.frm.auditInfoForm.value.authoriser,
				newPosLimit: this.frm.newPosLimitPerTime.value ? this.frm.newPosLimitPerTime.value : null, //Hạn mức lần
				startDate: this.posLimit ? this.posLimit.startDate : posCardLimit.startDate,
				endDate: this.posLimit ? this.posLimit.endDate : posCardLimit.endDate,
				usageCode: this.posLimit ? this.posLimit.code || this.posLimit.usageCode : posCardLimit.usageCode,
				maxAmount: this.frm.oldPosLimitPerDay.value ? this.frm.oldPosLimitPerDay.value : null,
				maxSingleAmount: this.frm.oldPosLimitPerTime.value ? this.frm.oldPosLimitPerTime.value : null,
				maxNumber: this.posLimit ? this.posLimit.maxNumber : posCardLimit.maxNumber,
				limitCode: 'POS',
			} : null);

		let listCardChangeLimit = [];

		if (transLimitAtm != null) {
			listCardChangeLimit.push(transLimitAtm);
		}

		if (transLimitEcom != null) {
			listCardChangeLimit.push(transLimitEcom);
		}

		if (transLimitPos != null) {
			listCardChangeLimit.push(transLimitPos);
		}

		return listCardChangeLimit;
	}

	mappingModelUpdateCardInfo(cardTransactionId?: any): any {
		return {
			id: this.frm.updateCardInfoId.value,
			oldAccountAssociate: this.frm.oldAccountAssociate.value,
			oldAutomaticallyDebit: this.frm.oldAutomaticallyDebit.value,
			oldRegisEcom: this.frm.oldRegisEcom.value,
			newAccountAssociate: this.frm.newAccountAssociate.value,
			newAutomaticallyDebit: this.frm.newAutomaticallyDebit.value,
			newRegisEcom: this.frm.newRegisEcom.value,
			userInput: this.frm.auditInfoForm.value.inputter,
			mainCardId: this.dataWasChosenFromCheckbox.getValue().mainId,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
			oldOtpPhone: this.dataWasChosenFromCheckbox.getValue().phone,
			newOtpPhone: this.frm.newOtpPhone.value
		};
	}

	mappingModelExtendCard(cardTransactionId?: any): any {
		return {
			id: this.frm.extendCardId.value,
			oldDateExpired: this.frm.oldDateExpire.value,
			oldAddressCard: this.frm.oldAddress.value,

			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
			newDateExpired: this.frm.newDateExpire.value,
			newAddressCard: this.frm.newAddress.value,

			chargeInfo: this.extendChargeInfoComponent.frm.feePolicy.value == "MIEN_PHI" ? null : this.extendChargeInfoComponent.buildRequestCharge()
		};
	}

	mappingModelChangeCardStatus(cardTransactionId?: any): any {
		return {
			id: this.frm.updateCardStatusId.value,
			cardStatus: this.frm.cardStatus.value,
			reasonId: this.frm.reasonId.value,
			reasonName: null,
			detail: this.frm.detail.value,
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
		};
	}

	mappingModelActiveCard(cardTransactionId?: any) {
		return {
			id: this.frm.cardActiveLockId.value,
			cardActiveLockStatus: ACTIVE_CARD,
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
		};
	}

	mappingCardTemporary(cardTransactionId?: any): any {

		let data = this.dataWasChosenFromCheckbox.getValue();

		console.log('data was chosen', this.dataWasChosenFromCheckbox.getValue());

		let dateExpired;
		if (this.selected) {
			console.log(this.selected, 'select');
			// const date = this.selected.expirationDate.substring(4, 6)
			// const year = this.selected.expirationDate.substring(0, 4)

			let month = this.dataWasChosenFromCheckbox.getValue().expireMonth;
			let year = this.dataWasChosenFromCheckbox.getValue().expireYear;
			dateExpired = `${month}/${year}`;

		} else if (this.dataQueryGetCardActionDetail$.getValue()) {
			dateExpired = this.dataQueryGetCardActionDetail$.getValue().cardTemporary.dateExpired;
		}

		// let cardFilter: any;
		//
		// if (!this.dataCacheRouterFromDashboard) {
		// 	cardFilter = this.cardInfosQueryByCustomer$.getValue().find((r) => {
		// 		return r.tokenCard = this.selected.tokenCard
		// 	})
		// }
		let cardFront: string = null, cardBack: string = null, fingerLeft: string = null, fingerRight: string = null;
		const gtttUrlModel = this.signatureService.gtttUrlModel$.getValue();
		if (gtttUrlModel) {
			(gtttUrlModel.cardFront && gtttUrlModel.cardFront != 'assets/media/logos/nodata.png') && (cardFront = gtttUrlModel.cardFront);
			(gtttUrlModel.cardBack && gtttUrlModel.cardBack != 'assets/media/logos/nodata.png') && (cardBack = gtttUrlModel.cardBack);
			(gtttUrlModel.fingerLeft && gtttUrlModel.fingerLeft != 'assets/media/logos/nodata.png') && (fingerLeft = gtttUrlModel.fingerLeft);
			(gtttUrlModel.fingerRight && gtttUrlModel.fingerRight != 'assets/media/logos/nodata.png') && (fingerRight = gtttUrlModel.fingerRight);
		}
		const cardVersion = this.selected.type == this.TYPE_THE_CHINH ? `${MAIN_CARD_VERSION}${this.selected.cardProduct}`: `${SUB_CARD_VERSION}${this.selected.cardProduct}`;

		return {
			id: this.dataCacheRouterFromDashboard ? this.dataCacheRouterFromDashboard.id : cardTransactionId,
			customerId: this.frm.transactionForm.value.customerId,
			inputter: this.frm.auditInfoForm.value.inputter,
			coCode: this.frm.auditInfoForm.value.coCode,
			priority: this.frm.transactionForm.value.priority,
			departCode: this.frm.auditInfoForm.value.roomCode,
			cardName: this.selected.embosingName,
			cardType: this.selected.cardType,
			tokenCard: this.selected.tokenCard,
			accountNumber: this.selected.accountNo,
			actionT24: this.getActionT24(),
			cardVersion:cardVersion,
			dateExpired: dateExpired,
			cardStatus: this.selected.status,
			cardId: this.selected.mainId,
			productStatus: this.selected.productStatus,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouterFromDashboard),
			coCodeT24: this.selected.companyId,
			type: this.selected.type, //loại thẻ chính (master) hay thẻ phụ (slave)
			cardFrontBase64: cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
		};
	}

	mappingModelReleasePinCode(cardTransactionId?: any): any {
		return {
			id: this.frm.releasePinCardId.value,
			oldNameCard: this.frm.oldNameCard.value,
			oldAddressCard: this.frm.oldAddressCard.value,
			newNameCard: this.frm.newNameCard.value,
			newAddressCard: this.frm.newAddressCard.value,
			releaseType: this.frm.reIssueVal.value,
			reasonName: this.frm.reasonId$.value,
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
			chargeInfo: this.releaseChargeInfoComponent.frm.feePolicy.value == "MIEN_PHI" ? null : this.releaseChargeInfoComponent.buildRequestCharge()
		};
	}

	mappingModelCloseCard(cardTransactionId?: any): any {
		const feeDate = this.frm.feeDate.value;
		return {
			id: this.frm.cardActiveLockId.value,
			cardActiveLockStatus: LOCK_CARD,
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
			chargeInfo: this.chargeInfoComponent.frm.feePolicy.value == "MIEN_PHI" ? null : this.chargeInfoComponent.buildRequestCharge()

		};
	}

	mappingResetPinSecure(cardTransactionId?: any): any {
		return {
			id: this.frm.resetPinCard3DSecureId.value,
			pinWrongNumber: this.frm.pinValNum.value,
			thirdDWrongNumber: this.frm.secure3DValNum.value,
			actionResetPin: this.frm.pinVal.value ? 'RESET_PIN' : null,
			actionResetThirdD: this.frm.secure3DVal.value ? 'RESET_3D' : null,
			userInput: this.frm.auditInfoForm.value.inputter,
			userAuthorized: this.frm.auditInfoForm.value.authoriser,
		};
	}

	getFee(event, type) {
		console.log(event, 'event');
		if (this.frm.feeCollectionPlan.value == this.online || this.frm.feeCollectionPlan$.value == this.online) {
			this.getAccountInfo();
		}

		if (type == 'release') {
			this.frm.accountFee.reset();
			if (event && (event.value == this.online || event && event.value == this.cash)) {
				this.frm.accountFee.setValidators([Validators.required]);
				this.frm.feeCode.setValidators([Validators.required]);
				this.frm.feeAmount.setValidators([Validators.required]);
				this.frm.accountFee.enable();
				this.frm.feeCode.enable();
				this.frm.feeAmount.enable();
				this.frm.feeAmount.updateValueAndValidity();
			} else {
				this.frm.accountFee.clearValidators();
				this.frm.feeCode.clearValidators();
				this.frm.feeAmount.clearValidators();
				this.frm.accountFee.reset();
				this.frm.feeCode.reset();
				this.frm.accountFee.disable();
				this.frm.feeAmount.reset();
				this.frm.feeCode.disable();
				this.frm.feeAmount.disable();
				this.frm.feeAmount.updateValueAndValidity();
			}
		}

		if (type == 'extend') {
			if (event && (event.value == this.online || event && event.value == this.cash)) {
				this.frm.accountFee$.setValidators([Validators.required]);
				this.frm.feeCode.setValidators([Validators.required]);
				this.frm.feeAmount$.setValidators([Validators.required]);
				this.frm.accountFee$.enable();
				this.frm.feeCode$.enable();
				this.frm.feeAmount$.enable();
				this.frm.feeAmount$.updateValueAndValidity();
			} else {
				this.frm.accountFee$.clearValidators();
				this.frm.feeCode.clearValidators();
				this.frm.feeAmount$.clearValidators();
				this.frm.accountFee$.reset();
				this.frm.feeCode.reset();
				this.frm.accountFee$.disable();
				this.frm.feeAmount$.reset();
				this.frm.feeCode$.disable();
				this.frm.feeAmount$.disable();
				this.frm.feeAmount$.updateValueAndValidity();
			}
		}

	}

	onChangeReasonCard(event) {
		if (event && event.value == this.otherReason) {
			this.frm.detail.setValidators([Validators.required]);
			this.frm.detail.updateValueAndValidity();
		} else {
			this.frm.detail.clearValidators();
			this.frm.detail.updateValueAndValidity();
		}
	}

	getAccountInfo(event?: any, type?: string) {
		this.parentForm.controls.oldOtpPhone.setValue(this.dataWasChosenFromCheckbox.getValue().phone);
		if (event && event.target.checked == true) {
			const card = this.dataWasChosenFromCheckbox.getValue();
			this.parentForm.controls.oldNameCard.setValue(card.embosingName);
			this.parentForm.controls.oldAddressCard.setValue(card.address);
			this.mainCard = card.mainId.split('.').length == 3;
			if (this.mainCard) {
				this.parentForm.get('newNameCard').setValidators([Validators.maxLength(20)]);
			} else {
				this.parentForm.get('newNameCard').setValidators([Validators.maxLength(19)]);
			}
			this.parentForm.get('newNameCard').updateValueAndValidity();
		}

		if (event && event.target.checked == true || this.dataCacheRouterFromDashboard) {
			if (type == 'infoCard') {
				this.getEcomStatus();
			}
			this.isLoadingAccountInfo$.next(true);
			const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
			const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
			let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
			bodyConfig.enquiry.customerID = this.parentForm.controls.transactionForm.value.customerId;
			this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingAccountInfo$.next(false)))
				.subscribe(res => {
					console.log('sdfsdfsdfsd', res);
					if (res) {
						this.accountInfo$.next(res.enquiry.account);
						this.accountLK$.next(res.enquiry.account.filter(acc => acc.category == '1001' && acc.currency == 'VND'));
						console.log('account response', this.accountInfo$.getValue());
					} else {
						// this.commonService.error(res.error.desc)
						return;
					}
				});
		}
	}

	getEcomStatus() {
		this.isLoadingEcomStatus$.next(true);
		let url = this.apiUrlApiCard;
		let header = this.headerApiCard;
		let bodyConfig = CardRequestDTO.BODY.BODY_GET_ECOM_STATUS;
		bodyConfig.enquiry.tokenCard = this.dataCacheRouterFromDashboard
			? this.dataCacheRouterFromDashboard.tokenCard
			: this.dataWasChosenFromCheckbox.getValue().tokenCard;
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingEcomStatus$.next(false)))
			.subscribe(res => {
				console.log('response get limit card', res);
				console.log(JSON.stringify(res), 'response get limit card');
				if (res) {
					this.frm.oldRegisEcom.setValue( this.dataWasChosenFromCheckbox.getValue().cardType == "DEBIT" ? 'YES' : res.enquiry.ecomStatus);

					this.isEcomRegister = res.enquiry.ecomStatus == 'YES';
					// } else {
					// 	this.commonService.error(res.error.desc)
				}
			});
	}

	getActionT24() {
		let actionArr = [];
		if (this.isActiveCard) {
			actionArr.push(ACTIVE_CARD);
		}

		if (this.isClosedCard) {
			actionArr.push(LOCK_CARD);
		}
		if (this.isChangeCardStatus) {
			actionArr.push(UPDATE_STATUS);
		}

		if (this.isChangeTransLimit) {
			actionArr.push(UPDATE_TRANS_LIMIT);
		}

		if (this.isChangeCardInfo) {
			actionArr.push(UPDATE_INFO);
		}

		if (this.isResetPin) {
			actionArr.push(RESET_PIN_CARD_SERCURE);
		}

		if (this.isReleaseCard) {
			actionArr.push(RELEASE_CARD_PIN);
		}

		if (this.isExtendCard) {
			actionArr.push(EXTEND_CARD);
		}
		return actionArr.join(';');
	}

	getFormValid() {
		if (!this.isActiveCard && !this.isClosedCard && !this.isChangeTransLimit && !this.isChangeCardStatus &&
			!this.isChangeCardInfo && !this.isResetPin && !this.isReleaseCard && !this.isExtendCard) {
			this.commonService.error('Bạn chưa chọn mục nào');
			return false;
		}

		if (this.isChangeCardStatus) {
			if (this.frm.cardStatus.invalid || this.frm.reasonId.invalid) {
				return false;
			}
		}
		// if (this.isChangeTransLimit) {
		// 	if (this.frm.newAtmLimit.invalid || this.frm.newPosLimit.invalid || this.frm.newEcomLimit.invalid) {
		// 		return false;
		// 	}
		// }
		if (this.isChangeCardInfo) {
			if (this.frm.newAccountAssociate.invalid || this.frm.newAutomaticallyDebit.invalid
				|| this.frm.newRegisEcom.invalid) {
				return false;
			}
		}
		if (this.isResetPin) {
		}
		if (this.isReleaseCard) {
			if (this.frm.newNameCard.invalid || this.frm.newAddressCard.invalid ||
				// this.frm.feeCollectionPlan.invalid ||
				// this.frm.feeCode.invalid ||
				 this.frm.reasonId$.invalid
				//  || this.frm.feeAmount.invalid
				 ) {
				return false;
			}
		}
		if (this.isExtendCard) {
			if (this.frm.newDateExpire.invalid || this.frm.newAddress.invalid
				// || this.frm.feeCollectionPlan$.invalid ||
				// this.frm.feeCode$.invalid || this.frm.accountFee$.invalid || this.frm.feeAmount$.invalid
				) {
				return false;
			}
		}

		if (this.isClosedCard) {
			if (this.frm.feePolicy.invalid) {
				return false;
			}

			if (this.frm.feePolicy.value !== 'MIEN_PHI') {
				for (let i = 0; i < this.fieldsValidatorActionClose.length; i++) {
					if (this.frm[this.fieldsValidatorActionClose[i]].invalid) {
						return false;
					}
				}
			}
		}
		return true;
	}

	resetForm() {
		this.parentForm.reset();
	}

	removeRecord() {
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = AU_THEN_TYPE.CARD.DELETE;
		transaction.data = {
			id: this.dataCacheRouterFromDashboard ? this.dataCacheRouterFromDashboard.id : null
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		console.log(bodyRequest, 'bodyRequest');
		let modalRef = this.modalService.open(ModalDeleteComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
			centered: true
		});

		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn xóa!';
		modalRef.componentInstance.data = this.dataCacheRouterFromDashboard;
		modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
		modalRef.result.then(r => {
			if (r == 'done') {
				this.commonService.success(`Bản ghi ${transaction.data.id} đã được xóa thành công`);
			} else {
				this.commonService.error(r.body.error.desc);
			}
		});
	}

	askUserToRejectRecord() {

		const auditFormControls = this.parentForm.controls.auditInfoForm;
		if (!auditFormControls.value.reason) {
			this.parentForm.get('auditInfoForm.reason').setErrors({required: true});
			auditFormControls.markAllAsTouched();
			return;
		}

		this.commonService.isNotifyHasCancel$.next(true);
		let modalRef = this.modalService.open(ModalNotification, {
			size: 'lg',
			windowClass: 'notificationDialog',
		});

		modalRef.componentInstance.textNotify = 'Bạn muốn từ chối bản ghi này?';
		modalRef.result.then(res => {
			if (res == true) {
				this.rejectRecord();
				this.modalService.dismissAll();
				this.isLoadingRejected$.next(true);
			}
		});
	}

	rejectRecord() {
		this.isLoadingRejected$.next(true);

		const auditFormControls = this.parentForm.controls.auditInfoForm;
		if (!auditFormControls.value.reason) {
			this.parentForm.get('auditInfoForm.reason').setErrors({required: true});
			auditFormControls.markAllAsTouched();
			this.isLoadingRejected$.next(false);
			return;
		}

		let transaction = new TransactionModel();
		transaction.authenType = REJECT_CARD;
		transaction.data = {
			id: this.dataCacheRouterFromDashboard.id,
			reasonReject: this.parentForm.controls.auditInfoForm.value.reason
				? this.parentForm.controls.auditInfoForm.value.reason : null,
			authoriser: this.localStorage.retrieve(USERNAME_CACHED),
			timeRejected: moment(new Date()).format(LOCAL_DATE_TIME),
		};

		let bodyDeleteReq = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		console.log('BASE REJECT E_BANK BODY REQUEST ===============>> ', bodyDeleteReq);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyDeleteReq)
			.pipe(finalize(() => this.isLoadingRejected$.next(false)))
			.subscribe(res => {

				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} đã bị từ chối bởi KSV`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouterFromDashboard.inputter, NOTIFICATION.APPROVE_CANCEL, _this.dataCacheRouterFromDashboard.id, NOTIFICATION.PRODUCT_TYPE.CARD);
					this.router.navigate(['/pages/dashboard']);

				} else {
					//this.commonService.error(res.desc);
				}
				window.scroll(0, 0);
			});
	}

	onApproved() {

		this.parentForm.get('auditInfoForm.reason').clearValidators();
		this.parentForm.get('auditInfoForm.reason').updateValueAndValidity();

		this.slaTimeService.endCalculateSlaTime();
		this.isLoadingAuth$.next(true);
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = APPROVE_CARD;
		transaction.data = {
			id: this.dataCacheRouterFromDashboard ? this.dataCacheRouterFromDashboard.id : '',
			inputter: this.dataCacheRouterFromDashboard.inputter,
			authoriser: this.localStorage.retrieve(USERNAME_CACHED),
			actionT24: APPROVE,
			timeAuth: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaAuthorise: this.slaTimeService.calculateSlaTimeAuth(this.dataCacheRouterFromDashboard)
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => this.isLoadingAuth$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} duyệt thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouterFromDashboard.inputter, NOTIFICATION.APPROVED, _this.dataCacheRouterFromDashboard.id, NOTIFICATION.PRODUCT_TYPE.CARD);
					this.router.navigateByUrl('/pages/dashboard');
				} else {
					this.commonService.error(`Bản ghi ${transaction.data.id} duyệt không thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouterFromDashboard.inputter, NOTIFICATION.APPROVED_ERROR, _this.dataCacheRouterFromDashboard.id, NOTIFICATION.PRODUCT_TYPE.CARD);
					this.router.navigateByUrl('/pages/dashboard');
				}
			});
	}

	setCardStatusFalse() {
		this.isActiveCard = false;
		this.isClosedCard = false;
		this.isChangeTransLimit = false;
		this.isChangeCardStatus = false;
		this.isReleaseCard = false;
		this.isResetPin = false;
		this.isExtendCard = false;
		this.isChangeCardInfo = false;
	}

	filterCardStatusList() {

		let cardListStatus = CARD_STATUS_LIST;
		this.dataWasChosenFromCheckbox
			.pipe(takeUntil(this.destroyed$))
			.subscribe(card => {

				let statusList;
				switch (card.status) {
					case '98':
						statusList = cardListStatus.filter(i => i.value == 'PICKUP-L41' || i.value == 'UNLOCK');
						break;
					case '74':
						statusList = cardListStatus.filter(i => i.value == 'UNLOCK');
						break;
					case '14':
					case '185':
						statusList = cardListStatus.filter(i => i.value == 'PICKUP-L41' || i.value == 'LOCK');
						break;
					default:
						statusList = cardListStatus;
				}
				this.cardStatusList$.next(statusList);
			});
	}

	onChangeCard(event: MatRadioChange, card: any, index: number) {

		this.isChangeCardStatus = false;
		this.isActiveCard = false;
		this.isClosedCard = false;
		this.isChangeTransLimit = false;
		this.isChangeCardInfo = false;
		this.isResetPin = false;
		this.isReleaseCard = false;
		this.isExtendCard = false;

		// console.log("card =====================>>", card)
		this.isSearch = false;
		this.isChecked = true;
		this.checkedValue = index;
		if (event.source.checked == true) {
			this.isSearch = true;
			this.dataWasChosenFromCheckbox.next(card);
			console.log('card =====================>>', this.dataWasChosenFromCheckbox.getValue());
			// const date = this.selected.expirationDate.substring(4, 6)
			// const year = this.selected.expirationDate.substring(0, 4)
			// let expireDate = `${date}/${year}`

			this.parentForm.controls.oldAddress.setValue(this.dataWasChosenFromCheckbox.getValue().address);

			let month = this.dataWasChosenFromCheckbox.getValue().expireMonth;
			let year = this.dataWasChosenFromCheckbox.getValue().expireYear;
			let dateExpired = `${month}/${year}`;

			this.parentForm.patchValue({
				oldDateExpire: (dateExpired),
				oldNameCard: (this.selected.cardName),
				oldAccountAssociate: this.selected.accountNo
			});
		} else {
			this.dataWasChosenFromCheckbox.next(null);
			this.setCardStatusFalse();
		}

		this.filterCardStatusList();
	}

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}


	/**
	 * Lấy trạng thái của Card (nếu đã được duyệt)
	 */
	get STATUS_APPROVED() {
		if (this.dataCacheRouterFromDashboard && this.dataCacheRouterFromDashboard.status) {
			return this.dataCacheRouterFromDashboard.status == APPROVE || this.dataCacheRouterFromDashboard.status == APPROVED_SUCCESS;
		}
	}

	get STATUS_PENDING() {
		if (this.dataCacheRouterFromDashboard && this.dataCacheRouterFromDashboard.status) {
			return this.dataCacheRouterFromDashboard.status == PENDING;
		}
	}

	// TODO TRUY VẤN SỐ LẦN NHẬP SAI MÃ PIN
	getWrongEntryPinCodeInfo() {
		this.isLoadingWrongEntryPinCode$.next(true);
		let url = this.apiUrlApiCard;
		let header = this.headerApiCard;
		let bodyConfig = CardRequestDTO.BODY.BODY_GET_WRONG_ENTRY_PIN_CODE_INFO;
		bodyConfig.enquiry.tokenCard = this.dataWasChosenFromCheckbox.getValue().tokenCard;

		this.commonService.getWrongEntryPinCodeInfoByTokenCard(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingWrongEntryPinCode$.next(false)))
			.subscribe(res => {

				if (res && res.body && res.body.status == 'OK') {

					let body = res.body.enquiry;
					this.frm.pinValNum.setValue(body.num_attempt_3d.pinAttemp);
					this.frm.pinVal.setValue(false);
					this.frm.secure3DVal.setValue(false);

					let paramValue = body.num_attempt_3d.parmValue; //Số lần nhâp sai 3D-secure;
					// let maxParmValue = body.num_attempt_3d.maxParmValue; // sô lần nhâp sai 3D-secure tối đa;

					// this.frm.secure3DValNum.setValue(maxParmValue - paramValue);
					this.frm.secure3DValNum.setValue(paramValue);

				} else {
					this.commonService.error(res.error.desc);
					return;
				}
			});

	}

	changeStatusChildrenBusiness(event: any) {
		let checked = event.target.checked;

		if (!checked) {
			this.isChangeTransLimit = false;
			this.isResetPin = false;
			this.isExtendCard = false;
			this.isReleaseCard = false;
		}

	}

	changeActiveStatus(event: any) {
		if (!event.target.checked) {
			this.isChangeTransLimit = false;
		}
	}

	get cardStatus() {
		return this.dataWasChosenFromCheckbox.getValue().status;
	}

	get cardStatusIsClose() {
		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard) {
			return cardTokenInfoWasChosen && cardTokenInfoWasChosen.status == '109';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '109';
		}
	}

	get isSubCard() {
		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard) {
			return cardTokenInfoWasChosen && cardTokenInfoWasChosen.type == 'slave';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.type == 'slave';
		}
	}

	get cardStatusIsCardOK() {
		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard) {
			return cardTokenInfoWasChosen && cardTokenInfoWasChosen.status == '14' && cardTokenInfoWasChosen.productStatus == 'R';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '14' && this.dataQueryGetCardActionDetail$.getValue().cardTemporary.productStatus == 'R';
		}
	}

	get cardStatusIsPinBlock() {
		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard) {
			return cardTokenInfoWasChosen && cardTokenInfoWasChosen.status == '185';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '185';
		}
	}

	get cardStatusIsPinblockReady() {
		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard) {
			return (cardTokenInfoWasChosen && cardTokenInfoWasChosen.productStatusName == 'Ready')  && cardTokenInfoWasChosen.status == '185';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return (this.dataQueryGetCardActionDetail$.getValue().cardTemporary.productStatusName == 'Ready') && this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '185';
		}
	}

	get cardStatusIsPinblockLock() {
		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard) {
			return (cardTokenInfoWasChosen && cardTokenInfoWasChosen.productStatusName == 'Locked')  && cardTokenInfoWasChosen.status == '185';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return (this.dataQueryGetCardActionDetail$.getValue().cardTemporary.productStatusName == 'Locked') && this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '185';
		}
	}

	get statusCardNotActivate() {
		// let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		// if (!this.dataCacheRouterFromDashboard) {
		// 	return cardTokenInfoWasChosen.status != '14' && cardTokenInfoWasChosen.productStatus == "L";
		// } else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
		// 	return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus != '14'
		// 		&& this.dataQueryGetCardActionDetail$.getValue().cardTemporary.productStatus == "L";
		// }


		let cardTokenInfoWasChosen = this.dataWasChosenFromCheckbox.getValue();
		if (!this.dataCacheRouterFromDashboard && cardTokenInfoWasChosen) {
			return cardTokenInfoWasChosen.productStatus == 'L' && cardTokenInfoWasChosen.status == '14';

		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.productStatus == 'L';
		}
	}

	get cardStatusIsDoNotHonor() {
		if (!this.dataCacheRouterFromDashboard && this.dataWasChosenFromCheckbox.getValue()) {
			return this.dataWasChosenFromCheckbox.getValue().status == '98';
		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '98';
		}
	}

	get cardStatusPickUpL41() {
		if (!this.dataCacheRouterFromDashboard && this.dataWasChosenFromCheckbox.getValue()) {
			return this.dataWasChosenFromCheckbox.getValue().status == '74';
		} else if (this.dataCacheRouterFromDashboard && this.dataQueryGetCardActionDetail$.getValue()) {
			return this.dataQueryGetCardActionDetail$.getValue().cardTemporary.cardStatus == '74';
		}
	}

	/**
	 * *****Disabled Kích hoạt thẻ*****
	 * - Nếu trạng thái thẻ OK thì disabled
	 *
	 * - Nếu trạng thái thẻ LOCKED:
	 *   + Disabled nếu chọn "Đóng thẻ"
	 */
	get disabledActiveCard() {
		// if (this.cardStatusIsClose || this.cardStatusIsPinblockLock) {
		if (this.cardStatusIsClose || this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
			return true;
		}
		// if (!this.statusCardNotActivate) {
		// 	return true;
		// }

		if (this.isClosedCard) {
			return true;
		}
	}

	/**
	 * ****Disabled Đóng thẻ*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn 1 trong các lựa chọn sau thì disabled (Thay đổi hạn mức GD,
	 *   Thay đổi trạng thái thẻ, Reset pin, Phát hành lại thẻ, Gia hạn thẻ);
	 *
	 * - Nếu trạng thái thẻ LOCKED:
	 *   + Disabled nếu chọn "Kích hoạt thẻ"
	 */
	//  || this.cardStatusIsPinblockLock
	get disableCloseCard() {
		if (this.cardStatusIsClose) {
			return true;
		}
		if (this.isChangeTransLimit || this.isChangeCardStatus
			|| this.isResetPin || this.isReleaseCard || this.isExtendCard
			|| this.isActiveCard || this.isChangeCardInfo) {
			return true;
		}
	}

	/**
	 * ****Disable Thay đổi hạn mức giao dịch*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn 1 trong các lựa chọn sau thì disabled (Thay đổi trạng thái thẻ,
	 *   Phát hành lại thẻ, Gia hạn thẻ, Đóng thẻ);
	 *
	 * - Nếu trạng thái thẻ LOCKED:
	 *   + Nếu chọn kích hoạt thẻ thì được chọn
	 *   + Nếu không chọn kích hoạt thẻ thì disabled
	 */
	get disableChangeCardTransLimit() {
		if (this.cardStatusIsClose) {
			return true;
		}

		if (this.cardStatusIsPinblockLock) {
			if (this.isActiveCard) {
				return false;
			}
			return true;
		}
		if (this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
			if (this.isChangeCardStatus || this.isReleaseCard || this.isExtendCard || this.isClosedCard) {
				return true;
			}
		}

		if (this.cardStatusIsDoNotHonor) {

			if (!this.isChangeCardStatus || this.frm.cardStatus.value != 'UNLOCK') {
				return true;
			}

			if (this.isResetPin || this.isExtendCard) {
				return true;
			}

			// if (this.isChangeCardStatus && (this.isResetPin || this.isExtendCard || this.isReleaseCard)) {
			// 	return true;
			// }

			// if (!this.isChangeCardStatus) {
			// 	return true;
			// }
		}

		if (this.statusCardNotActivate) {
			if (!this.isActiveCard) {
				return true;
			}
		}

		if (this.cardStatusPickUpL41) {
			if (this.isChangeCardStatus && (this.isResetPin || this.isExtendCard)) {
				return true;
			}

			if (!this.isChangeCardStatus) {
				return true;
			}
		}
	}

	/**
	 *  **** Disabled Thay đổi trạng thái thẻ*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn 1 trong các lựa chọn sau thì disabled (Thay đổi hạn mức GD, Rest pin
	 *    Gia hạn thẻ, Đóng thẻ);
	 *
	 * - Nếu trạng thái thẻ LOCKED: disabled
	 */
	get disableCheckboxChangeCardStatus() {
		if (this.cardStatusIsClose || this.cardStatusIsPinblockLock) {
			// if (this.cardStatusIsClose) {
			return true;
		}
		if (this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
			if (this.isChangeTransLimit || this.isResetPin ||
				this.isExtendCard || this.isClosedCard || this.isActiveCard || this.isReleaseCard) {
				return true;
			}
		}

		if (this.cardStatusIsDoNotHonor) {
			if (this.isClosedCard || this.isActiveCard || this.isReleaseCard) {
				return true;
			}
		}

		if (this.statusCardNotActivate) {
			return true;
		}

		if (this.cardStatusPickUpL41) {
			if (this.isChangeCardInfo) {
				return true;
			}
		}
	}

	/**
	 *  **** Disabled Reset PIN/3D*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn 1 trong các lựa chọn sau thì disabled (Thay đổi trạng thái thẻ, Phát hành lại thẻ
	 *    Gia hạn thẻ, Đóng thẻ);
	 *
	 * - Nếu trạng thái thẻ LOCKED: disabled
	 */
	get disableResetPin() {
		if (this.cardStatusIsClose || this.cardStatusIsPinblockLock) {
			return true;
		}

		// if (this.isChangeCardStatus || this.isReleaseCard ||
		// 	this.isExtendCard || this.isClosedCard) {
		// 	return true;
		// }

		if (this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
			if (this.isReleaseCard || this.isExtendCard || this.isClosedCard || this.isActiveCard || this.isChangeCardStatus) {

				return true;
			}
		}

		if (this.cardStatusIsDoNotHonor) {

			// if (this.isChangeCardStatus && (this.isChangeTransLimit || this.isExtendCard || this.isReleaseCard)) {
			// 	return true;
			// }
			//
			// if (!this.isChangeCardStatus) {
			// 	return true;
			// }

			if (!this.isChangeCardStatus || this.frm.cardStatus.value != 'UNLOCK') {
				return true;
			}

			if (this.isChangeTransLimit || this.isExtendCard) {
				return true;
			}

		}

		if (this.cardStatusPickUpL41) {
			if (this.isChangeCardStatus && (this.isChangeTransLimit || this.isExtendCard)) {
				return true;
			}
		}

		if (this.statusCardNotActivate) {
			return true;
		}
	}

	/**
	 **** Disabled Phát hành lại thẻ*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn 1 trong các lựa chọn sau thì disabled (Thay đổi hạn mức GD, Reset pin/3D
	 *    Gia hạn thẻ, Đóng thẻ);
	 *    + Nếu chọn "Thay đổi trạng thái thẻ" thì được phép chọn
	 *
	 * - Nếu trạng thái thẻ LOCKED: disabled
	 */
	get disableReleaseCardPin() {
		if (this.cardStatusIsClose || this.cardStatusIsPinblockLock) {
			return true;
		}

		if (this.cardStatusIsPinblockReady) {
			if (this.parentForm.controls.cardStatus.value == 'LOCK') {
				return false;
			}
			return true;
		}
		// if (this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
		// 	if (!this.isChangeCardStatus) {
		// 		if (this.isChangeTransLimit || this.isResetPin || this.isExtendCard
		// 			|| this.isClosedCard || this.isActiveCard || this.isChangeCardStatus) {
		// 			return true;
		// 		}
		// 	} else {
		// 		return false;
		// 	}
		// }
		if (this.cardStatusIsCardOK) {
			if (!this.isChangeCardStatus) {
				if (this.isChangeTransLimit || this.isResetPin || this.isExtendCard
					|| this.isClosedCard || this.isActiveCard || this.isChangeCardStatus) {
					return true;
				}
			} else {
				return false;
			}
		}

		if (this.cardStatusIsDoNotHonor) {
			// if (this.isChangeCardStatus && (this.isChangeTransLimit || this.isExtendCard || this.isResetPin)) {
			// 	return true;
			// }

			let cardStatus = this.frm.cardStatus.value;
			if (this.isChangeCardStatus && (cardStatus == 'UNLOCK' || cardStatus == '') || this.isClosedCard) {
				return true;
			}

			// if((!this.isChangeTransLimit || !this.isExtendCard || !this.isResetPin || !this.isActiveCard || !this.isClosedCard || !this.isChangeCardStatus)){
			// 	return true;
			// }
		}

		if (this.statusCardNotActivate) {
			return true;
		}

		if (this.cardStatusPickUpL41) {
			if (this.isChangeTransLimit || this.isResetPin || this.isExtendCard
				|| this.isClosedCard || this.isReleaseCard || this.isActiveCard || this.isChangeCardStatus) {
				return true;
			}
		}
	}

	/**
	 **** Disabled Gia hạn thẻ*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn 1 trong các lựa chọn sau thì disabled (Thay đổi hạn mức GD,
	 *   Thay đổi trạng thái thẻ, Reset pin/3D, Phát hành lại thẻ, Đóng thẻ);
	 *
	 * - Nếu trạng thái thẻ LOCKED: disabled
	 */
	get disabledExtendCard() {
		if (this.cardStatusIsClose || this.cardStatusIsPinblockLock) {
			return true;
		}
		if (this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
			if (this.isChangeTransLimit || this.isChangeCardStatus ||
				this.isResetPin || this.isReleaseCard || this.isClosedCard) {
				return true;
			}
		}

		if (this.cardStatusIsDoNotHonor) {
			// if (this.isChangeCardStatus && (this.isChangeTransLimit || this.isResetPin || this.isReleaseCard)) {
			// 	return true;
			// }
			//
			// if (!this.isChangeCardStatus) {
			// 	return true;
			// }

			if (!this.isChangeCardStatus || this.frm.cardStatus.value != 'UNLOCK') {
				return true;
			}

			if (this.isResetPin || this.isChangeTransLimit) {
				return true;
			}
		}

		if (this.statusCardNotActivate) {
			return true;
		}


		if (this.cardStatusPickUpL41) {
			if (this.isChangeCardStatus && (this.isChangeTransLimit || this.isResetPin)) {
				return true;
			}
		}
	}

	/**
	 **** Disabled cập nhật thông tin thẻ*****
	 * - Nếu trạng thái thẻ OK:
	 *   + Nếu chọn đóng thẻ thì disabeled
	 *
	 * - Nếu trạng thái thẻ LOCKED: disabled
	 */
	get disabledUpdateCard() {
		// if (this.isSubCard) {
		// 	return true;
		// }
		if (this.cardStatusIsClose || this.cardStatusIsPinblockLock) {
			return true;
		}
		if (this.cardStatusIsCardOK || this.cardStatusIsPinblockReady) {
			if (this.isClosedCard) {
				return true;
			}
			return false;
		}

		if (this.statusCardNotActivate) {
			return true;
		}

		if (this.cardStatusIsDoNotHonor) {
			if (this.isClosedCard) {
				return true;
			}
			return false;
		}
	}

	changeFeeCode(event: any) {
		this.frm.feeAmount.setValue(null);
		if (event.flatAmt) {
			this.frm.feeAmount.setValue(event.flatAmt);
		}
	}

	changeFeeCodeInExtendCard(event: any) {
		if (event.flatAmt) {
			this.frm.feeAmount$.setValue(event.flatAmt);
		}
	}

	checkExpireDate(event: any) {
		console.log(event.target.value);
		if (event.target.value == '') {
			return;
		}

		let oldDateExpired = this.frm.oldDateExpire.value;
		let oldMonth = oldDateExpired.substring(0, 2);
		let oldYear = oldDateExpired.substring(3, oldDateExpired.length);

		let newDateExpired = event.target.value;
		let newMonth = newDateExpired.substring(0, 2);
		let newYear = newDateExpired.substring(3, newDateExpired.length);

		if (typeof newMonth != 'number' || typeof newYear != 'number') {
			return;
		}

		if (Number(newYear) < Number(oldYear)) {
			this.isValidNewExpireDate = true;
		} else {
			if (Number(newMonth) < Number(oldMonth)) {
				this.isValidNewExpireDate = true;
			}

		}
	}

	isCreditCard(): boolean {
		if (this.dataWasChosenFromCheckbox.getValue()) {
			let cardType = this.dataWasChosenFromCheckbox.getValue().cardProduct;
			let typeOfCard = checkCardByCardType(cardType);
			return typeOfCard == 'VISA_CREDIT';
		}
		return false;
	}

	isDebitCard(): boolean {
		if (this.dataWasChosenFromCheckbox.getValue()) {
			let cardType = this.dataWasChosenFromCheckbox.getValue().cardProduct;
			// let typeOfCard = checkCardByCardType(cardType);
			if (cardType == 'SVCC') {
				return true;
			}
			// return typeOfCard == 'LOCAL_DEBIT' || typeOfCard == 'VISA_DEBIT';
		}
		return false;
	}

	changeNewCardStatus() {

		this.isChangeTransLimit = false;
		this.isExtendCard = false;
		this.isResetPin = false;
		this.isActiveCard = false;
		this.isClosedCard = false;
		this.isReleaseCard = false;

	}

	/**
	 * Hàm này kiểm tra thẻ có đăng kí ecom hay không
	 * căn cứ vào phần ecom tại cập nhật thông tin thẻ
	 */
	isRegisterNewEcomForReport(): boolean {
		const oldEcom = this.frm.oldRegisEcom.value;
		const newEcom = this.frm.newRegisEcom.value;

		if (oldEcom != newEcom) {
			if (newEcom == 'NO') {
				return false;
			}

			if (newEcom == 'YES') {
				return true;
			}
		}

		return null;
	}

	get isLoadingTooltipReportButton(): boolean {
		return this.customerInfo == null;
	}

	checkTypeLimit(type: string): any {
		switch (type) {

			case 'POS':
				const oldPosValuePerDay = this.frm.oldPosLimitPerDay.value;
				const newPosValuePerDay = this.frm.newPosLimitPerDay.value;
				const oldPosValuePerTime = this.frm.oldPosLimitPerTime.value;
				const newPosValuePerTime = this.frm.newPosLimitPerTime.value;

				const valuePosChangePerDay = (newPosValuePerDay != null && oldPosValuePerDay != newPosValuePerDay) ? newPosValuePerDay : null;
				const valuePosChangePerTime = (newPosValuePerTime != null && oldPosValuePerTime != newPosValuePerTime) ? newPosValuePerTime : null;

				return {
					limitPerDay: valuePosChangePerDay,
					limitPerTime: valuePosChangePerTime
				};


			case 'ATM':
				const oldAtmValuePerDay = this.frm.oldAtmLimitPerDay.value;
				const newAtmValuePerDay = this.frm.newAtmLimitPerDay.value;
				const oldAtmValuePerTime = this.frm.oldAtmLimitPerTime.value;
				const newAtmValuePerTime = this.frm.newAtmLimitPerTime.value;

				const valueAtmChangePerDay = (newAtmValuePerDay != null && oldAtmValuePerDay != newAtmValuePerDay) ? newAtmValuePerDay : null;
				const valueAtmChangePerTime = (newAtmValuePerTime != null && oldAtmValuePerTime != newAtmValuePerTime) ? newAtmValuePerTime : null;

				return {
					limitPerDay: valueAtmChangePerDay,
					limitPerTime: valueAtmChangePerTime
				};

			case 'ECOM':
				const oldEcomValuePerDay = this.frm.oldEcomLimitPerDay.value;
				const newEcomValuePerDay = this.frm.newEcomLimitPerDay.value;
				const oldEcomValuePerTime = this.frm.oldEcomLimitPerTime.value;
				const newEcomValuePerTime = this.frm.newEcomLimitPerTime.value;

				const valueEcomChangePerDay = (newEcomValuePerDay != null && oldEcomValuePerDay != newEcomValuePerDay) ? newEcomValuePerDay : null;
				const valueEcomChangePerTime = (newEcomValuePerTime != null && oldEcomValuePerTime != newEcomValuePerTime) ? newEcomValuePerTime : null;

				return {
					limitPerDay: valueEcomChangePerDay,
					limitPerTime: valueEcomChangePerTime
				};
		}

		return null;
	}

	/**
	 * Hàm này trả về thông tin thẻ nếu action là đóng thẻ hoạc thay đổi trạng thái thành pickup-L41, card do not honor
	 *
	 */
	mappingListCancelCardReportRequest(): any[] {
		let cardWasChosen = this.dataWasChosenFromCheckbox.getValue();

		if (!cardWasChosen) {
			return [];
		}

		return [{
			cardNumber: cardWasChosen.cardNumber ? cardWasChosen.cardNumber : '',
			cardType: cardWasChosen.cardType ? cardWasChosen.cardType : '',
			cardName: cardWasChosen.embosingName ? cardWasChosen.embosingName : '',
			reason: 'Đóng thẻ'
		}];

		// let cardGroup =  this.cardInfosQueryByCustomer$.getValue().filter(card => card.mainId.includes(cardWasChosen.mainId));
		//
		// let cardGroupMapped = [];
		// if(cardGroup.length > 0){
		// 	cardGroupMapped = cardGroup.map(card => {
		// 		return {
		// 			cardNumber: card.cardNumber ? card.cardNumber : '',
		// 			cardType: card.cardType ? card.cardType : '',
		// 			cardName: card.embosingName ? card.embosingName : '',
		// 			reason: this.frm.reasonId.value ? this.frm.reasonId.value : ''
		// 		};
		// 	});
		// }
		//
		// return cardGroupMapped;
	}

	/**
	 * Hàm này check các nghiệp vụ có thu phí của phần thẻ, nếu có 1 nghiệp vụ mà hình thức thu phí là tài khoản thì return số tài khoản
	 */
	checkThuPhiTaiKhoanBieuMau(): string {
		if (!this.isClosedCard && !this.isExtendCard && !this.isReleaseCard) {
			return null;
		}

		if(this.isClosedCard) {
			if(this.chargeInfoComponent.frm.feePolicy.value == 'TAI_KHOAN' || this.chargeInfoComponent.frm.feePolicy.value == 'ACCOUNT') {
			return this.chargeInfoComponent.frm.feeAccount.value
			}
		}
		if(this.isExtendCard) {
			if(this.extendChargeInfoComponent.frm.feePolicy.value == 'TAI_KHOAN' || this.extendChargeInfoComponent.frm.feePolicy.value == 'ACCOUNT') {
				return this.extendChargeInfoComponent.frm.feeAccount.value
				}
		}

		if(this.isReleaseCard) {
			if(this.releaseChargeInfoComponent.frm.feePolicy.value == 'TAI_KHOAN' || this.releaseChargeInfoComponent.frm.feePolicy.value == 'ACCOUNT') {
				return this.releaseChargeInfoComponent.frm.feeAccount.value
				}
		}


		return null;
	}

	/**
	 * Hàm này check các nghiệp vụ có thu phí của phần thẻ, nếu có 1 nghiệp vụ mà hình thức thu phí bằng tiền mặt thì return True
	 */
	checkThuPhiTienMatBieuMau(): boolean {
		if (!this.isClosedCard && !this.isExtendCard && !this.isReleaseCard) {
			return false;
		}
		if(this.isReleaseCard) {
			return this.releaseChargeInfoComponent.frm.feePolicy.value == 'CASH' || this.releaseChargeInfoComponent.frm.feePolicy.value == 'TIEN_MAT'
		}
		if(this.isExtendCard) {
			return this.extendChargeInfoComponent.frm.feePolicy.value == 'CASH' || this.extendChargeInfoComponent.frm.feePolicy.value == 'TIEN_MAT'
		}
		if(this.isClosedCard) {
			return this.chargeInfoComponent.frm.feePolicy.value == 'CASH' || this.chargeInfoComponent.frm.feePolicy.value == 'TIEN_MAT'
		}
		// return this.frm.feeCollectionPlan$.value == 'CASH' || this.frm.feeCollectionPlan.value == 'CASH' || this.frm.feePolicy.value == 'TIEN_MAT';
	}


	mappingTransLimitCard() {
		let cardWasChosen = this.dataWasChosenFromCheckbox.getValue();
		// const branch = this.localStorage.retrieve(LIST_GROUP_WITH_NAME)
		// 	? this.localStorage.retrieve(LIST_GROUP_WITH_NAME).find(ele => ele.group_id == cardWasChosen.companyId) : null;
			

		let atmLimitAmount = this.checkTypeLimit('ATM');
		let posLimitAmount = this.checkTypeLimit('POS');
		let ecomLimitAmount = this.checkTypeLimit('ECOM');

		return {
			cardNumber1: cardWasChosen.cardNumber.substr(0, 6),
			cardNumber2: cardWasChosen.cardNumber.substr(-4),
			customerName: cardWasChosen.embosingName,
			cardType: cardWasChosen.cardType ? cardWasChosen.cardType : '',
			cardLevel: cardWasChosen.cardClass,
			accountNo: cardWasChosen.accountNo,
			branch: this.currCocodeName,
			fromDate: null,
			toDate: null,
			debitAcct: null,
			legalIssues: this.customerInfo.legalIssAuth ? this.customerInfo.legalIssAuth.split('#')[0] : '',
			legalDate: (this.customerInfo.legalIssDate && this.customerInfo.legalIssDate.split('#')[0])
				? formartDateYYYYMMDD(this.customerInfo.legalIssDate.split('#')[0]) : null,
			legalId: this.customerInfo.legalID ? this.customerInfo.legalID.split('#')[0] : '',
			phone: this.customerInfo.sms.replaceAll('#',';'),
			atm: (atmLimitAmount.limitPerDay || atmLimitAmount.limitPerTime) ? {
				amountPerDay: atmLimitAmount.limitPerDay,
				amountPerTime: atmLimitAmount.limitPerTime
			} : null,

			pos: (posLimitAmount.limitPerDay || posLimitAmount.limitPerTime) ? {
				amountPerDay: posLimitAmount.limitPerDay,
				amountPerTime: posLimitAmount.limitPerTime
			} : null,

			ecom: (ecomLimitAmount.limitPerDay ||  ecomLimitAmount.limitPerTime) ? {
				amountPerDay: ecomLimitAmount.limitPerDay,
				amountPerTime: ecomLimitAmount.limitPerTime
			} : null
		};
	}

	/**
	 * PHIẾU YÊU CẦU DỊCH VỤ THẺ KHÁCH HÀNG CÁ NHÂN

	 */
	convertLyDoBieuMauThe(): string{
		let reason ="";
		let cardChangedNewStatus = this.frm.cardStatus.value;
		const isPhatHanhLaiTheMat = this.isReleaseCard;
		const isLockCard = this.isChangeCardStatus && cardChangedNewStatus == this.CARD_DO_NOT_HONOR || cardChangedNewStatus == this.PICK_UP_L41;
			if(isLockCard){
				reason = this.frm.reasonId.value == 'Khác' ? this.frm.detail.value : this.frm.reasonId.value
			}

			if(this.frm.secure3DVal.value == true){
				reason = reason + 'reset 3D secure, '
			}

			if(this.frm.pinVal.value == true){
				reason = reason + 'reset pin, '
			}

			if(this.frm.newOtpPhone.value){
				reason = reason + 'thay đổi số điện thoại nhận OTP mới: ' + this.frm.newOtpPhone.value + ', ';
			}

			if(this.frm.newAccountAssociate.value){
				reason = reason + 'thay đổi tài khoản liên kết mới: ' + this.frm.newAccountAssociate.value + ', ';
			}

			if(isPhatHanhLaiTheMat){
				reason = reason + this.frm.reasonId$.value + ', ';
			}

			if(reason.length > 0 && reason.endsWith(", ")){
				reason = reason.charAt(0).toUpperCase() + reason.slice(1, reason.length - 2);
			}

			return reason;
	}

	/**
	 * @return true nếu resetPin or reset 3D or thay đổi TK liên kết mới or thay đổi SĐT nhận OTP mới
	 */
	checkedOtherMauBieuThe(): boolean{
		if (this.frm.secure3DVal.value == true || this.frm.pinVal.value == true || this.frm.newOtpPhone.value || this.frm.newAccountAssociate.value){
			return true
		}

		return false;
	}

	/**
	 * Get report
	 */

	getReportId() {

		if (!this.getFormValid()) {
			this.parentForm.markAllAsTouched();
			return;
		}

		if (!this.customerInfo) {
			return;
		}

		let isRegisterEcom = this.isRegisterNewEcomForReport();
		let cardChangedNewStatus = this.frm.cardStatus.value;
		const isLockCard = this.isChangeCardStatus && cardChangedNewStatus == this.CARD_DO_NOT_HONOR || cardChangedNewStatus == this.PICK_UP_L41;
		const isUnLockCard = this.isChangeCardStatus && cardChangedNewStatus == this.CARD_OK;

		const isReleaseCard = this.isReleaseCard && this.frm.reIssueVal.value == '1';
		const isReleasePin = this.isReleaseCard && this.frm.reIssueVal.value == '2';
		const isReleaseCardPin = this.isReleaseCard && this.frm.reIssueVal.value == '3';
		const isPhatHanhLaiTheMat = this.isReleaseCard && this.frm.reIssueVal.value == '4';

		if (this.dataWasChosenFromCheckbox.getValue() && this.customerInfo) {
			let address;


			this.isSubmittingReport$.next(true);

			let dataBinding = this.dataWasChosenFromCheckbox.getValue();


			const branch = this.localStorage.retrieve(LIST_GROUP_WITH_NAME) ? this.localStorage.retrieve(LIST_GROUP_WITH_NAME).find(ele => ele.group_id == dataBinding.companyId) : null;
			let body = {
				command: '',
				report: {}
			};
			body.command = 'GET_REPORT';
			body.report = {
				authenType: 'getRequest_SEATELLER_YEU_CAU_DV_THE',
				// exportType: 'PDF',
				transactionId: this.frm.transactionForm.value.transId,
				custId: '',
				saveToMinio: false,
				accNumber: dataBinding.accountNo,
				customerName: this.customerInfo.shortName ? this.customerInfo.shortName : '',
				fax: this.customerInfo.fax1 ? this.customerInfo.fax1.split('#')[0] : '',
				daiDien: null,
				chucVu: null,
				reason: this.convertLyDoBieuMauThe(),

				actionCard: {
					activedCard: this.isActiveCard,
					cancelCard: this.isClosedCard,
					cancelEcom: this.isChangeCardInfo && (isRegisterEcom != null ? !isRegisterEcom : false),
					descLevel: false,
					extendCard: this.isExtendCard,
					extendLevl: false,
					increaseLevel: false,
					lockCard: isLockCard,
					otherRequest: this.checkedOtherMauBieuThe(),
					registerEcom: this.isChangeCardInfo && (isRegisterEcom != null ? isRegisterEcom : false),
					releaseCard: isReleaseCard || isReleaseCardPin || isPhatHanhLaiTheMat,
					releaseCardPin: isReleasePin || isReleaseCardPin || isPhatHanhLaiTheMat,
					settlementCard: this.isClosedCard,
					unlockCard: isUnLockCard,
					changeTransLimit: this.isChangeTransLimit
				},

				listCancelCard: (this.isClosedCard || isLockCard) ? this.mappingListCancelCardReportRequest() : [],
				transLimitCard: this.mappingTransLimitCard(),

				address: this.customerInfo.permanentAddress.replaceAll('#',' ') + ", " + this.district + ", " + this.city,
				// address: this.customerInfo.address ? this.customerInfo.address.replaceAll('#', ' ') : '',
				branch: this.currCocodeName,
				cardName: this.customerInfo.shortName ? this.customerInfo.shortName : '',
				cardNumber1: dataBinding.cardNumber.substr(0, 6),
				cardNumber2: dataBinding.cardNumber.substr(-4),
				debitAcct: this.checkThuPhiTaiKhoanBieuMau(),
				tienMat: this.checkThuPhiTienMatBieuMau(),
				exportType: 'PDF',
				leagalIssue: this.customerInfo.legalIssAuth ? this.customerInfo.legalIssAuth.split('#')[0] : '',
				legalDate: (this.customerInfo.legalIssDate && this.customerInfo.legalIssDate.split('#')[0])
					? formartDateYYYYMMDD(this.customerInfo.legalIssDate.split('#')[0]) : null,
				legalId: this.customerInfo.legalID ? this.customerInfo.legalID.split('#')[0] : '',
				phone: this.customerInfo.sms.replaceAll('#',';'),
				requestDate: moment(new Date()).format('DD/MM/YYYY')
			};

			this.reportService.getReportForm(body)
				.pipe(finalize(() => this.isSubmittingReport$.next(false)))
				.subscribe(res => {
					if (res && res.status == STATUS_OK && res.responseCode == '00') {
						const dataLinks: DataLinkMinio[] = [];
						for (let i = 0; i < res.report.data.length; i++) {
							const dataLink: DataLinkMinio = new DataLinkMinio();
							const comboTemplate = res.report.data[i];
							dataLink.fileName = comboTemplate.fileName;
							dataLink.fileType = comboTemplate.fileType;
							dataLink.bucketName = comboTemplate.bucketName;
							dataLink.folder = comboTemplate.folder;
							// this.websocketClientService.sendMessageToTablet(dataLink, 'viewForm');
							dataLinks.push(dataLink);
							window.open(`${this.reportService.minioLink}/${comboTemplate.bucketName}/${comboTemplate.folder}`, '_blank');
						}
						this.websocketClientService.sendMessageToTablet(dataLinks, 'viewForm');

					} else {
						this.commonService.error('Truy vấn thông tin khách hàng không thành công');
						return;
					}
				});
		}
	}

	checkSubCard() {
		if (this.dataWasChosenFromCheckbox.getValue() && this.dataWasChosenFromCheckbox.getValue().type == 'slave') {
			return true;
		}
		return false;
	}

	checkValidFeeAcc(event): void {
		// console.warn('>>>> event', event.target.value);
		const accountNumber = event.target.value;
		this.accName$.next(null);
		if (accountNumber) {
			this.frm.accountFee$.setErrors(null);
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
						this.accName$.next(res.body.enquiry.accountTitle);
					} else {
						this.frm.accountFee$.setErrors({notExist: true});
						this.frm.accountFee$.markAsTouched();
					}
				});
		}
	}

	checkValidAcct(value): void {
		this.accName$.next(null);
		const accountNumber = value;
		if (accountNumber) {
			this.frm.accountFee.setErrors(null);
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
						this.accName$.next(res.body.enquiry.accountTitle);
					} else {
						this.frm.accountFee.setErrors({notExist: true});
						this.frm.accountFee.markAsTouched();
						// this.accName$.next(null);
					}
				});
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataCacheRouterFromDashboard && !changes.dataCacheRouterFromDashboard.isFirstChange()) {
			if (changes.hasOwnProperty('dataCacheRouterFromDashboard')) {
				this.initData();
			}
		}
	}

	getImageUser(custId: string, gtttUrlModel: GtttUrlModel): void {
		this.signatureService.gtttUrlModel$.next(gtttUrlModel);
		this.coreAiService.getCustomerInfoByUserId(custId)
			.pipe(map(res => {
				const outputs = res.body.utility.output.infos;
				if (outputs.length) {
					return outputs[0];
				}
				return null;
			}))
			.subscribe(custInfo => {
				if (custInfo) {
					let imageUser = new GtttUrlModel(null, null, null, null, null);
					if (custInfo.faces && custInfo.faces.length) {
						if (!gtttUrlModel.pictureFace) {
							imageUser.pictureFace = this.getLinkImage(custInfo.faces[0].image_url);
						} else {
							imageUser.pictureFace = gtttUrlModel.pictureFace;
						}
					} else {
						imageUser.pictureFace = gtttUrlModel.pictureFace;
					}
					if (custInfo.idcard) {
						if (!gtttUrlModel.cardFront) {
							imageUser.cardFront = this.getLinkImage(custInfo.idcard.cropped_card_front_url);
						} else {
							imageUser.cardFront = gtttUrlModel.cardFront;
						}
						if (!gtttUrlModel.cardBack) {
							imageUser.cardBack = this.getLinkImage(custInfo.idcard.cropped_card_back_url);
						} else {
							imageUser.cardBack = gtttUrlModel.cardBack;
						}
						if (!gtttUrlModel.pictureFace) {
							imageUser.pictureFace = this.getLinkImage(custInfo.idcard.general_url); // anh khuon mat
						} else {
							imageUser.pictureFace = gtttUrlModel.pictureFace;
						}
					} else {
						imageUser.cardFront = gtttUrlModel.cardFront;
						imageUser.cardBack = gtttUrlModel.cardBack;
						imageUser.pictureFace = gtttUrlModel.pictureFace;
					}
					if (custInfo.finger && custInfo.finger.length) {
						if (!gtttUrlModel.fingerLeft) {
							imageUser.fingerLeft = this.getLinkImage(custInfo.finger[0].image_url);
						} else {
							imageUser.fingerLeft = gtttUrlModel.fingerLeft;
						}
						if (!gtttUrlModel.fingerRight) {
							imageUser.fingerRight = this.getLinkImage(custInfo.finger[1] ? custInfo.finger[1].image_url : null);
						} else {
							imageUser.fingerRight = gtttUrlModel.fingerRight;
						}
					} else {
						imageUser.fingerLeft = gtttUrlModel.fingerLeft;
						imageUser.fingerRight = gtttUrlModel.fingerRight;
					}
					if (custInfo.signature && custInfo.signature.length) {
						imageUser.signatures = this.coreAiService.getSignatureLinks(custInfo.signature);
					}
					this.signatureService.gtttUrlModel$.next(imageUser);
				} else {
					this.signatureService.gtttUrlModel$.next(null);
				}
			});
	}

	getLinkImage(rawLink: string): string {
		if (!rawLink) {
			return 'assets/media/logos/nodata.png';
		}
		return this.coreAiService.returnLinkGetImage(rawLink);
	}


	getSignatureLink(signatures: any, position: number) {
		const signature = signatures.filter(ele => ele.image_url.includes('SIGNATURE_FULL'));
		if (signature.length) {
			switch (position) {
				case 1:
					return signature.length ? this.getRawLink(signature[0].image_url) : 'assets/media/logos/nodata.png';
				default:
					return signature.length > 1 ? this.getRawLink(signature[1].image_url) : 'assets/media/logos/nodata.png';
			}
		}
		return 'assets/media/logos/nodata.png';
	}

	getRawLink(link: string): string {
		return this.coreAiService.returnLinkGetImage(link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?')));
	}

	/**
	 * Hàm này sẽ thực hiện việc thêm và xóa validator cho action đóng thẻ
	 * Nếu user chọn tiền mặt hoặc tài khoản thì thêm validator, nếu miễn phí thì xóa validate
	 * @param value
	 */
	updateValidatorActionCloseCard(value: any) {
		switch (value) {
			case 'TAI_KHOAN':
			case 'TIEN_MAT':
				this.addValidatorForCloseCardAction();
				this.isThuPhiDongTHe = true;
				break;

			case 'MIEN_PHI':
			default:
				this.resetFormCloseCard();
				this.removeValidatorForCloseCardAction();
				this.isThuPhiDongTHe = false;
		}
	}

	/**
	 * Hàm này thêm validator cho action đóng thẻ
	 * trường thêm validator: ['feePolicy', 'fee', 'feeCodeClose', 'feeAccount', 'explain'];
	 * @param optionalFields? -> mảng form control name, tham số không bắt buộc;
	 */
	addValidatorForCloseCardAction(optionalFields?: [string]) {
		const listFieldValidate = (optionalFields && optionalFields.length > 0) ? optionalFields : this.fieldsValidatorActionClose;

		for (let i = 0; i < listFieldValidate.length; i++) {
			const currentFormControl = this.frm[listFieldValidate[i]];
			if (currentFormControl) {
				currentFormControl.setValidators([Validators.required]);
				currentFormControl.updateValueAndValidity();
			}
		}
	}

	/**
	 * Hàm này xóa validator cho các ràng buộc required action đóng thẻ
	 * trường remove validator: ['feePolicy', 'fee', 'feeCodeClose', 'feeAccount', 'explain'];
	 *  @param optionalFields? -> mảng form control name, tham số không bắt buộc;
	 */
	removeValidatorForCloseCardAction(optionalFields?: [string]) {
		const listFieldValidate = (optionalFields && optionalFields.length > 0) ? optionalFields : this.fieldsValidatorActionClose;

		for (let i = 0; i < listFieldValidate.length; i++) {
			const currentFormControl = this.frm[listFieldValidate[i]];
			if (currentFormControl) {
				currentFormControl.clearValidators();
				currentFormControl.markAsUntouched();
				currentFormControl.updateValueAndValidity();
			}
		}
	}

	/**
	 * Hàm này tính tổng số tiền thu phí, số tiền phí và VAT
	 * VAT giai đoan này fix cứng 10% -> BA confirmed
	 * VAT trên T24 đang tự động là tròn, nên client cũng sử dụng Match.round để tự động làm tròn
	 *  if(taxCode = null of = 99 -> VAT = 0; else VAT = 10%)
	 * @param feeAmount -> số tiền phí/ mã phí
	 * @param action -> phần thẻ có nhiều action có thu phí, biến này nhận các action khác nhau và set giá trị từng action trong switch case
	 * @param chargeCodeObj
	 */
	calculateTotalAmount(feeAmount: any, action: string, chargeCodeObj?: any) {

		if (feeAmount == null || feeAmount == '') {
			return;
		}

		let taxCode;

		if (chargeCodeObj == null) {
			taxCode = this.chargeCodes$.getValue().find(i => this.frm.feeCodeClose.value == i.id).taxCode;
		} else {
			taxCode = chargeCodeObj.taxCode;
		}

		let feeAmountConvertNumber = feeAmount.replace(/,/g, '');
		let tax = (taxCode == null || taxCode == '99') ? 0 : Number(feeAmountConvertNumber) * 0.1;
		let totalAmount = Number(feeAmountConvertNumber) + Math.round(tax);

		switch (action) {
			case 'CLOSE_CARD':
				this.frm.fee.setValue(feeAmountConvertNumber);
				this.frm.feeAmountClose.setValue(totalAmount);
				this.frm.tax.setValue(Math.round(tax));
		}
	}

	/**
	 * Hàm này sẽ xóa trắng các trường nhập liệu của chức năng đóng thẻ
	 */
	resetFormCloseCard() {
		const fieldCloseCard = ['fee', 'feeCodeClose', 'feeAccount', 'explain', 'tax', 'feeAmountClose'];
		for (let i = 0; i < fieldCloseCard.length; i++) {
			const currentFormControl = this.frm[fieldCloseCard[i]];
			if (currentFormControl) {
				currentFormControl.reset();
			}
		}
	}

	/**
	 * Hàm này truy vấn thông tin của tài khoản thu phí -> phương thức thu phí là tiền mặt
	 * @param event
	 * @param action -> có thể dùng param này + switch.case để tái sử dụng ở các action khác
	 */
	checkGetFeeAccount(event, action: string): void {
		const accountNumber = event.target.value;
		this.accountFeeNameCloseCard$.next(null);

		if (accountNumber) {
			this.frm.feeAccount.setErrors(null);
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					const isResponseOk = res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00;
					switch (action) {
						case 'CLOSE_CARD':
							if (isResponseOk) {
								const accountInfo = res.body.enquiry;
								const isTaiKhoanQuyTaiQuay = accountInfo.category == '10001';
								if (isTaiKhoanQuyTaiQuay) {
									this.accountFeeNameCloseCard$.next('Tài khoản quỹ tại quầy giao dịch');
								} else {
									this.accountFeeNameCloseCard$.next(accountInfo.accountTitle);
								}

							} else {
								this.frm.feeAccount.setErrors({notExist: true});
								this.frm.feeAccount.markAsTouched();
							}
							break;
					}
				});
		}
	}

	/**
	 * Hàm này truy vấn danh sách tài khoản thanh toán (category = 1001) VND của customer hiện tại
	 * Kết quả truy vấn OK sẽ đc cache tại local storage theo dạng key (paymentAccountsVNDOfCustomer_13775074) - value
	 * @param type
	 */
	getListAccountOfCustomer(type: any) {
		const typesValid = ['TAI_KHOAN'];
		if (!typesValid.includes(type)) {
			return;
		}
		const customerId = this.parentForm.controls.transactionForm.value.customerId;
		const cacheAccountsOfCustomerKey = 'paymentAccountsVNDOfCustomer_' + customerId;

		let listAccountOfCustomer = this.localStorage.retrieve(cacheAccountsOfCustomerKey);
		if (listAccountOfCustomer) {
			this.accountInfo$.next(listAccountOfCustomer);
		} else {
			this.isLoadingAccountInfo$.next(true);
			this.accountInfo$.next(null);
			const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
			const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
			let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
			bodyConfig.enquiry.customerID = this.parentForm.controls.transactionForm.value.customerId;
			this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingAccountInfo$.next(false)))
				.subscribe(res => {
					if (res) {
						const listAccountVND = res.enquiry.account.filter(acc => acc.category == '1001' && acc.currency == 'VND');
						this.accountInfo$.next(listAccountVND);
						this.localStorage.store(cacheAccountsOfCustomerKey, listAccountVND);
					} else {
						return;
					}
				});
		}
	}


	// checkCLoseCardActionCheckBox(event: any) {
	// 	const isChecked = event.target.checked;
	//
	// 	if(isChecked){
	// 		this.addValidatorForCloseCardAction(['feePolicy'])
	// 	}else {
	// 		this.removeValidatorForCloseCardAction(['feePolicy'])
	// 	}
	// }
	customSearchFee(term: string, item: any) {
		term = term.toLocaleLowerCase();
		return item.id.toLocaleLowerCase().indexOf(term) > -1 ||
			item.gbDescription.toLocaleLowerCase().indexOf(term) > -1 ||
			item.currency.toLocaleLowerCase().indexOf(term) > -1;
	}
}
