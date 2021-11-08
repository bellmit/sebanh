import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {ApiConfig} from '../../../../../../shared/model/constants/api-infomation-config';
import {finalize, map} from 'rxjs/operators';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {NavigationEnd, Router} from '@angular/router';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {TransactionModel} from '../../../../../model/transaction.model';
import {AuditInfo} from '../../../../../model/audit-info';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {WebsocketClientService} from '../../../../../../shared/services/websocket-client.service';
import {
	ACTION_T24,
	APPROVE,
	APPROVED_SUCCESS,
	AU_THEN_TYPE,
	AUTHEN_EBANK_INFO,
	CACHE_CO_CODE,
	CODE_00,
	CODE_OK,
	EBANK_LOCK,
	EBANK_RESET_PASSWORD,
	EBANK_UNLOCK,
	GET_ENQUIRY,
	GET_TRANSACTION,
	HEADER_API_ACCOUNT,
	LIST_GROUP_WITH_NAME,
	NOTIFICATION,
	PENDING,
	ROLE_APPLICATION,
	SERVER_API_CUST_INFO,
	SERVICE_EBANK_CODE,
	SERVICE_STATUS_LIST,
	STATUS_BODY_RES,
	STATUS_OK,
	UPDATE_EBANK_INFO,
	USERNAME_CACHED,
	UTILITY
} from '../../../../../../shared/util/constant';

import {ModalAskComponent} from '../../../../../../shared/directives/modal-common/modal-ask/modal-ask.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalNotification} from '../../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {SlaTimeService} from '../../../../../../shared/services/sla-time.service';
import {LOCAL_DATE_TIME} from '../../../../../../shared/model/constants/common-constant';
import {AccountRequestDTO} from '../../../../../../shared/model/constants/account-requestDTO';
import {EBankDto, eBankDtoMapper, ICampaignModel} from './EBankDto';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {ReportService} from '../../../../../common-service/report.service';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {ServicePackageModel} from '../../../../../../shared/model/service-package.model';
import {BrokerTypeModel} from '../../../../../../shared/model/broker-type.model';
import {SaleModel} from '../../../../../../shared/model/sale.model';
import {TransLimitModel} from '../../../../../../shared/model/trans-limit.model';
import {DataLinkMinio} from '../../../../../model/data-link-minio';
import {PromotionModel} from '../../../../../../shared/model/promotion.model';
import {AppConfigService} from '../../../../../../app-config.service';
import {CoreAiService} from '../../identify-customer/service/core-ai.service';
import {IHeaderTableErrorModel} from '../../../../../../shared/model/table-approve-error.model';
import {GtttUrlModel} from '../../../../../../shared/model/GtttUrl.model';
import {SignatureService} from '../../identify-customer/service/signature.service';
import {formartDateYYYYMMDD} from '../../../../../../shared/util/Utils';

@Component({
	selector: 'kt-seanet',
	templateUrl: './seanet.component.html',
	styleUrls: ['./seanet.component.scss'],
})
export class data implements OnInit, OnDestroy, AfterViewInit {
	// truy van giao dich
	@Input('viewData') viewData: any;

	@ViewChild('servicePackageLabel', {static: false}) servicePackageLabel: ElementRef;

	parentForm = this.fb.group({
		seaNetId: ['', [Validators.required]],
		mainCurrAcc: ['', [Validators.required]],
		email: [''],
		handyNumber: ['', [Validators.required, Validators.pattern('(0)+([0-9]{9})')]],
		servicePackage: ['', [Validators.required]],
		serviceId: ['', [Validators.required]],
		serviceStatus: ['', [Validators.required]],
		authenticationType: ['', [Validators.required]],
		transLimit: ['', [Validators.required]],
		campaignId: [''],
		promotionId: [''],
		transSeanetPro: [''],
		salesType: [''],
		salesId: [''],
		brokerType: [''],
		brokerId: [''],
		ebankCheckbox: [false],
		resetPassword: [false],
		blockAccount: [false],
		//
		userStatus: [null],
		coCodeT24: [null]
	});

	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isLoadingEBankInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isDeletingRecord$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isApproving$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isRejecting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	eBankInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingReport$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	emailPattern$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	bodyRequest: BodyRequestTransactionModel;
	command: string;
	transaction: TransactionModel;
	auditInfo: AuditInfo;
	eBank: any;
	isSearched: boolean = false;
	isEBankCheckbox: boolean = false;
	isEBankCheckbox$ = new BehaviorSubject<boolean>(false);
	isResetPassword: boolean = false;
	isBlockAccount: boolean = false;
	username: string;
	dataCacheRouter: EBankDto;
	accessRightIds: string[];
	parentName: string;
	childOne: string;
	childTwo: string;

	customerInfo: any;
	cityList: any;
	ownerBen: any;
	isLoadingCities$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	saleList$: BehaviorSubject<SaleModel[]> = new BehaviorSubject<SaleModel[]>([]);
	brokerTypeList$: BehaviorSubject<BrokerTypeModel[]> = new BehaviorSubject<BrokerTypeModel[]>([]);
	servicePackages$: BehaviorSubject<ServicePackageModel[]> = new BehaviorSubject<ServicePackageModel[]>([]);
	limitList$: BehaviorSubject<TransLimitModel[]> = new BehaviorSubject<TransLimitModel[]>([]);
	promotionList$: BehaviorSubject<PromotionModel[]> = new BehaviorSubject<PromotionModel[]>([]);
	campaignList$: BehaviorSubject<ICampaignModel[]> = new BehaviorSubject<ICampaignModel[]>([]);
	serviceList = SERVICE_EBANK_CODE;
	serviceStatusList = SERVICE_STATUS_LIST;
	rejected$ = new BehaviorSubject(false);
	navigateSub: Subscription;
	firstNavigate$ = new BehaviorSubject<boolean>(false);
	headerError: IHeaderTableErrorModel[] = [];
	dataError: any = {};

	constructor(public commonService: CommonService,
				private fb: FormBuilder,
				private dataPowerService: DataPowerService,
				private router: Router,
				private localStorage: LocalStorageService,
				private sessionStorage: SessionStorageService,
				private translate: TranslateService,
				private modalService: NgbModal,
				private slaTimeService: SlaTimeService,
				private websocketClientService: WebsocketClientService,
				private reportService: ReportService,
				private utilityService: UtilityService,
				private appConfigService: AppConfigService,
				private coreAiService: CoreAiService,
				private signatureService: SignatureService) {
		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);

		this.navigateSub = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.firstNavigate$.next(true);
				this.initData();
			}
		});
	}

	ngOnInit() {

		console.log(this.commonService.timeT24$.getValue(), 'coreDate');
		this.getServicePackage();
		this.getBrokerTypes();
		this.getSaleList();
		this.getTranLimit();
		this.getPromotions();
		this.getCampaigns();

		if (!this.firstNavigate$.getValue()) {
			this.initData();
		}
	}

	initData(): void {
		if (this.viewData) {
			this.dataCacheRouter = this.viewData;
		} else {
			this.slaTimeService.startCalculateSlaTime();
			console.log('SLA START EBANK ======================>>>', this.slaTimeService.getStartTimeSLA());

			this.commonService.isNotifyHasCancel$.next(true);
			this.checkRight();

			// Data lấy được sau khi nhấn vào bản ghi 360
			if (window.history.state.obj360 && window.history.state.custId) {
				this.commonService.customerId$.next(window.history.state.custId);
				this.getEBankInfo();
			}

			if (window.history.state.data) {
				this.dataCacheRouter = window.history.state.data;
				if (this.dataCacheRouter.promotionId) {
					let dataPromotion = this.localStorage.retrieve('promotionCache');
					if (dataPromotion && dataPromotion.length > 0) {
						let promotionExist = dataPromotion.filter(pro => pro.promotionId == this.dataCacheRouter.promotionId)[0];
						console.log('promotionExist', promotionExist);
						this.setValueDesc(promotionExist);
					}
				}
			}
			console.warn('E_BANK_ROUTER_CACHE_DATA: ======================>>>', this.dataCacheRouter);
			this.commonService.isDisplayAsideRight$.next(true);
			this.commonService.isAsideRight$.next(true);
		}

		if (this.dataCacheRouter) {
			if (this.dataCacheRouter.status == 'APPROVED_ERROR') {
				this.checkApproveStatus(this.dataCacheRouter);
			}

			const customerId = this.dataCacheRouter.customerId;
			this.getEBankInfoByCustomerId(customerId);

			let cardFront = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.cardFront);
			let cardBack = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.cardBack);
			let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.pictureFace);
			let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.fingerLeft);
			let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.fingerRight);

			let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
			this.signatureService.gtttUrlModel$.next(gtttModel);

			let actionT24 = this.dataCacheRouter.actionT24;
			switch (actionT24) {
				case UPDATE_EBANK_INFO: {
					this.isEBankCheckbox = true;
					this.isEBankCheckbox$.next(this.isEBankCheckbox);
					this.isResetPassword = false;
					this.isBlockAccount = false;
					this.eBankInfo$.next(this.dataCacheRouter);
					this.patchValueOnEBankForm(this.dataCacheRouter);
					break;
				}

				case EBANK_UNLOCK:
				case EBANK_LOCK: {
					this.parentForm.patchValue({
							seaNetId: this.dataCacheRouter.username
						},
					);

					this.getEBankInfo(gtttModel);
					this.isBlockAccount = true;
					this.isResetPassword = false;
					this.isEBankCheckbox = false;
					this.isEBankCheckbox$.next(this.isEBankCheckbox);
					this.eBankInfo$.next(this.dataCacheRouter);
					this.patchValueOnEBankForm(this.dataCacheRouter);
					break;
				}

				case EBANK_RESET_PASSWORD: {
					this.parentForm.patchValue({
							seaNetId: this.dataCacheRouter.username
						},
					);

					this.getEBankInfo(gtttModel);
					this.isResetPassword = true;
					this.isEBankCheckbox = false;
					this.isEBankCheckbox$.next(this.isEBankCheckbox);
					this.isBlockAccount = false;
					this.eBankInfo$.next(this.dataCacheRouter);
					this.patchValueOnEBankForm(this.dataCacheRouter);
					break;
				}
			}
			const similarity = this.dataCacheRouter.similarityCoreAi;
			if (similarity) {
				this.signatureService.verifySignature$.next({
					similarity: similarity,
					value: null,
					confidence: null,
					signatures: []
				});
			}
		}
		this.getCities();
	}

	ngAfterViewInit() {
		// console.log('this.parentForm.controls.auditInfoForm.value', this.parentForm.controls.auditInfoForm.value);
		this.parentForm.valueChanges.subscribe(() => {
			this.eBank = this.parentForm.controls.transactionForm.value;
			this.auditInfo = this.parentForm.controls.auditInfoForm.value;
		});
		if (this.dataCacheRouter) {
			// const transactionForm = this.parentForm.controls.transactionForm.controls;
			// transactionForm.customerId.setValue(this.dataCacheRouter.username);
			if (this.dataCacheRouter.customerId) {
				this.parentForm.get('transactionForm.customerId').setValue(this.dataCacheRouter.customerId, {onlySelf: true});
			} else {
				const userName = this.dataCacheRouter.username;
				this.parentForm.get('transactionForm.customerId').setValue(userName.slice(0, (userName.length - 2)), {onlySelf: true});
			}
			if (this.dataCacheRouter.status == 'REJECTED') {
				this.parentForm.get('auditInfoForm.reason').setValue(this.dataCacheRouter.reasonReject, {onlySelf: true});
				this.rejected$.next(true);
			}
		}
	}

	patchValueOnEBankForm(data: EBankDto) {
		this.parentForm.patchValue({
			seaNetId: data.username ? data.username : null,
			mainCurrAcc: data.mainCurrAcc ? data.mainCurrAcc : null,
			email: data.email ? data.email.trim() : null,
			handyNumber: data.handyNumber ? data.handyNumber : null,
			servicePackage: data.packageService ? data.packageService : null,
			serviceId: data.serviceId ? data.serviceId : null,
			serviceStatus: data.serviceStatus ? data.serviceStatus : null,
			authenticationType: data.passwordType ? data.passwordType : null,
			transLimit: data.limit ? data.limit : null,
			campaignId: data.campaignId ? data.campaignId : null,
			promotionId: data.promotionId ? data.promotionId : null,
			transSeanetPro: data.transSeANetPro ? data.transSeANetPro : null,
			salesType: data.saleType ? data.saleType : null,
			salesId: data.saleId ? data.saleId : null,
			brokerType: data.brokerType ? data.brokerType : null,
			brokerId: data.brokerId ? data.brokerId : null,
			userStatus: data.userStatus ? data.userStatus : null,
			coCodeT24: data.coCodeT24 ? data.coCodeT24 : null
		});
	}

	onChangeEBank(event) {
		if (event.target.checked == true) {
			this.isEBankCheckbox = true;
			this.isBlockAccount = false;
			this.isResetPassword = false;
		}
		this.isEBankCheckbox$.next(this.isEBankCheckbox);
	}

	onResetPassword(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			const modalRef = this.modalService.open(ModalNotification, {
				size: 'lg',
				windowClass: 'notificationDialog',
			});
			modalRef.componentInstance.textNotify =
				'Xác nhận reset password?';
			modalRef.result.then((result) => {
				if (result == true) {
					this.isResetPassword = true;
					this.isBlockAccount = false;
					this.isEBankCheckbox = false;
					this.isEBankCheckbox$.next(this.isEBankCheckbox);
				} else {
					event.target.checked = false;
					return;
				}
			});

		}
	}

	onLockAccount(event) {
		if (event.target.checked == true) {
			const modalRef = this.modalService.open(ModalNotification, {
				size: 'lg',
				windowClass: 'notificationDialog',
			});
			modalRef.componentInstance.textNotify =
				'Xác nhận khóa/gỡ khóa tài khoản SeANet?';
			modalRef.result.then((result) => {
				if (result == true) {
					this.isResetPassword = false;
					this.isBlockAccount = true;
					this.isEBankCheckbox = false;
					this.isEBankCheckbox$.next(this.isEBankCheckbox);
				} else {
					event.target.checked = false;
					return;
				}
			});
		}
	}

	getEBankInfo(gtttModel?: GtttUrlModel) {
		this.isLoadingEBankInfo$.next(true);

		let bodyConfig = ApiConfig.BODY.BODY_GET_EBANK;
		bodyConfig.enquiry.authenType = AUTHEN_EBANK_INFO;
		bodyConfig.enquiry.inputter = this.username;
		const ebankId: string = this.dataCacheRouter
			? this.dataCacheRouter.username
			: this.commonService.customerId$.getValue().concat('00');

		bodyConfig.enquiry.ebankId = ebankId;
		if (!gtttModel) {
			gtttModel = new GtttUrlModel(null, null, null, null, null);
		}

		this.getImageUser(ebankId.slice(0, (ebankId.length - 2)), gtttModel);
		this.commonService.getResponseEnquiryEBankT24Api(bodyConfig)
			.pipe(finalize(() => this.isLoadingEBankInfo$.next(false)))
			.subscribe(res => {
				if (res.body.status == STATUS_BODY_RES.OK && res.body.enquiry.responseCode == CODE_00) {
					console.warn('>>>>', res.body.enquiry);
					this.isSearched = true;
					this.eBankInfo$.next(res.body.enquiry);

					const eBankConverted: EBankDto = eBankDtoMapper(res.body.enquiry);
					this.patchValueOnEBankForm(eBankConverted);

					this.getAccountInfo(ebankId.slice(0, (ebankId.length - 2)));
					// this.updateForm(true);
					this.getCustomerInfo(ebankId.slice(0, (ebankId.length - 2)));

					// set description promotion after search by idcustomer
					if (res.body.enquiry.promotionId) {
						let dataPromotion = this.localStorage.retrieve('promotionCache');
						let promotionExist = dataPromotion.filter(pro => pro.promotionId == res.body.enquiry.promotionId)[0];
						console.log('promotionExist', promotionExist);
						this.setValueDesc(promotionExist);
					}
				} else {
					this.commonService.customerId$.next('');
					this.reSetFormValue();
				}
			});
	}


	getEBankInfoByCustomerId(customerId: string) {

		let bodyConfig = ApiConfig.BODY.BODY_GET_EBANK;
		bodyConfig.enquiry.authenType = AUTHEN_EBANK_INFO;
		bodyConfig.enquiry.inputter = this.username;

		bodyConfig.enquiry.ebankId = customerId.concat('00');
		this.commonService.getResponseEnquiryEBankT24Api(bodyConfig)
			.subscribe(res => {
				if (res.body.status == STATUS_BODY_RES.OK && res.body.enquiry.responseCode == CODE_00) {
					this.eBankInfo$.next(res.body.enquiry);
					this.getAccountInfo(customerId);
					this.getCustomerInfo(customerId);

					const userStatus = res.body.enquiry.userStatus;
					this.parentForm.get('userStatus').setValue(userStatus);

				} else {
					return;
				}
			});
	}

	reSetFormValue() {
		this.parentForm.patchValue({
			seaNetId: null,
			mainCurrAcc: null,
			email: null,
			handyNumber: null,
			servicePackage: null,
			serviceId: null,
			serviceStatus: null,
			authenticationType: null,
			transLimit: null,
			campaignId: null,
			promotionId: null,
			transSeanetPro: null,
			salesType: null,
			salesId: null,
			brokerType: null,
			brokerId: null,
			userStatus: null
		});
		this.parentForm.get('transLimit').setErrors(null);
	}

	ngOnDestroy(): void {
		this.promotion$.next(null);
		this.commonService.changeCustomerGTTT$.next(null);
		this.slaTimeService.clearTimeSLA();
		this.commonService.isDisplayFile$.next(false);
		if (this.navigateSub) {
			this.navigateSub.unsubscribe();
		}
		// remove image aside right
		this.coreAiService.navigateToCombo$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		this.eBankInfo$.next(null);
	}

	onSubmit() {
		this.slaTimeService.endCalculateSlaTime();
		this.isLoading$.next(true);
		this.bodyRequest = new BodyRequestTransactionModel(this.command, this.transaction);

		let cardFront: string = null, cardBack: string = null, fingerLeft: string = null, fingerRight: string = null;
		const gtttUrlModel = this.signatureService.gtttUrlModel$.getValue();
		if (gtttUrlModel) {
			(gtttUrlModel.cardFront && gtttUrlModel.cardFront != 'assets/media/logos/nodata.png') && (cardFront = gtttUrlModel.cardFront);
			(gtttUrlModel.cardBack && gtttUrlModel.cardBack != 'assets/media/logos/nodata.png') && (cardBack = gtttUrlModel.cardBack);
			(gtttUrlModel.fingerLeft && gtttUrlModel.fingerLeft != 'assets/media/logos/nodata.png') && (fingerLeft = gtttUrlModel.fingerLeft);
			(gtttUrlModel.fingerRight && gtttUrlModel.fingerRight != 'assets/media/logos/nodata.png') && (fingerRight = gtttUrlModel.fingerRight);
		}

		const objGttt = {
			cardFront,
			cardBack,
			fingerLeft,
			fingerRight

		};

		if (this.isEBankCheckbox) {
			this.updateEBankInfo(objGttt);

		} else if (this.isResetPassword) {
			this.resetPassword(objGttt);

		} else if (this.isBlockAccount) {
			this.lockUnLockEBank(objGttt);

		} else {

			this.isLoading$.next(false);
			this.commonService.error('Bạn chưa chọn mục nào');
			return;
		}

	}

	mappingModel(data: any, objGttt): EBankDto {

		const coCodeSeATeller = this.auditInfo.coCode ? this.auditInfo.coCode : this.dataCacheRouter.coCode;
		let t24Date = this.commonService.timeT24$.getValue();

		return {
			id: data.transactionForm.value.transId,
			mainCurrAcc: data.mainCurrAcc.value,
			customerId: this.eBankInfo$.getValue().customerId,
			serviceId: data.serviceId.value,
			packageService: data.servicePackage.value,
			passwordType: data.authenticationType.value,
			promotionId: data.promotionId.value,
			limit: data.transLimit.value,
			transSeANetPro: data.transSeanetPro.value,
			brokerType: data.brokerType.value,
			brokerId: data.brokerId.value,
			campaignId: data.campaignId.value,
			saleType: data.salesType.value,
			saleId: data.salesId.value,
			actionT24: UPDATE_EBANK_INFO,
			priority: data.transactionForm.value.priority,
			username: data.seaNetId.value,
			inputter: this.username,
			coCode: coCodeSeATeller,
			coreDate: t24Date ? t24Date : null,
			serviceStatus: data.serviceStatus.value,
			email: data.email.value,
			handyNumber: data.handyNumber.value.trim(),
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			coCodeT24: data.coCodeT24.value,
			// cap nhat hinh anh KH vao core ai
			cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
		};
	}

	updateEBankInfo(objGttt) {

		this.slaTimeService.endCalculateSlaTime();
		console.log('sla time end ======================>>>:::: ', this.slaTimeService.getTimeEndSLA());

		if (!this.isUpdateInfoValid) {
			this.isLoading$.next(false);
			return;
		}

		let transId = this.parentForm.controls.transactionForm.value.transId;

		this.bodyRequest.command = GET_TRANSACTION;
		this.bodyRequest.transaction = {
			authenType: this.dataCacheRouter
				? AU_THEN_TYPE.E_BANK.EDIT_UPDATE_INFO
				: AU_THEN_TYPE.E_BANK.UPDATE_INFO,
			data: this.mappingModel(this.parentForm.controls, objGttt)
		};

		console.log('body--------------------------->', this.bodyRequest);

		this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transId} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.SEANET);
					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
				}
			});
	}

	resetPassword(objGttt) {
		let auditFormValue = this.parentForm.controls.auditInfoForm.value;
		let transactionFormValue = this.parentForm.controls.transactionForm.value;

		let transaction = new TransactionModel();
		transaction.authenType = this.dataCacheRouter
			? AU_THEN_TYPE.E_BANK.UPDATE_RECORD_RESET_PASSWORD
			: AU_THEN_TYPE.E_BANK.RESET_PASSWORD;

		transaction.data = {
			id: transactionFormValue.transId,
			username: this.dataCacheRouter ? this.dataCacheRouter.username : this.parentForm.controls.seaNetId.value,
			inputter: this.username,
			customerId: this.eBankInfo$.getValue().customerId,
			coCode: auditFormValue.coCode,
			actionT24: ACTION_T24.RESET_PASSWORD,
			priority: this.parentForm.controls.transactionForm.value.priority,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			// cap nhat hinh anh KH vao core ai
			cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
		};
		let bodyRequest = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					// this.commonService.success('Reset password thành công');
					this.commonService.success(`Bản ghi ${transactionFormValue.transId} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.SEANET);
					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
				}
			});
	}

	lockUnLockEBank(objGttt) {

		let auditFormValue = this.parentForm.controls.auditInfoForm.value;
		let transactionFormValue = this.parentForm.controls.transactionForm.value;
		if (!this.dataCacheRouter && !transactionFormValue.customerId) {
			this.isLoading$.next(false);
			return;
		}

		let transaction = new TransactionModel();

		transaction.authenType = this.dataCacheRouter
			? AU_THEN_TYPE.E_BANK.UPDATE_RECORD_LOCK_UNlOCK_EB
			: AU_THEN_TYPE.E_BANK.LOCK_UNlOCK_EB;
		transaction.data = {
			id: transactionFormValue.transId,
			username: this.dataCacheRouter ? this.dataCacheRouter.username : this.parentForm.controls.seaNetId.value,
			inputter: this.username,
			customerId: this.eBankInfo$.getValue().customerId,
			coCode: auditFormValue.coCode,
			actionT24: this.eBankInfo$.getValue().userStatus == 'OPEN' ? ACTION_T24.LOCK_EBANK : ACTION_T24.UN_LOCK_EBANK,
			priority: this.parentForm.controls.transactionForm.value.priority,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			// cap nhat hinh anh KH vao core ai
			cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
		};
		let bodyRequest = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);

		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transactionFormValue.transId} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.SEANET);
					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
				}
			});
	}

	checkRight(): void {
		if (this.accessRightIds.includes(ROLE_APPLICATION.INPUTTER)) {
			this.inputtable$.next(true);
		}

		if (this.accessRightIds.includes(ROLE_APPLICATION.AUTHORISER)) {
			this.authorisable$.next(true);
		}

		this.parentName = this.inputtable$.getValue() == true ? 'Quản lý nghiệp vụ giao dịch' : 'Duyệt quản lý nghiệp vụ giao dịch';
		this.childOne = this.inputtable$.getValue() == true ? 'Quản lý SeANet' : 'Duyệt quản lý SeANet';
		this.childTwo = null;
	}

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	get isUpdateInfoValid() {
		return this.parentForm && this.parentForm.valid;
	}

	/**
	 * Lấy trạng thái của Card (nếu đã được duyệt)
	 */
	get STATUS_APPROVED() {
		if (this.dataCacheRouter && this.dataCacheRouter.status) {
			return this.dataCacheRouter.status == APPROVE || this.dataCacheRouter.status == APPROVED_SUCCESS;
		}
	}

	get STATUS_PENDING() {
		if (this.dataCacheRouter && this.dataCacheRouter.status) {
			return this.dataCacheRouter.status == PENDING;
		}
	}

	/**
	 * clear form
	 */
	resetForm() {
		this.parentForm.get('auditInfoForm.timeUpdate').setValue(moment().format('DD/MM/YYYY HH:mm:ss'), {onlySelf: true});
		this.reSetFormValue();
	}

	askUserToDeleteRecord() {
		// clear form khi chua gui duyet
		if (!this.dataCacheRouter) {
			this.reSetFormValue();
		} else {
			let modalRef = this.modalService.open(ModalAskComponent, {
				backdrop: 'static',
				keyboard: false,
				size: 'sm',
				centered: true
			});
			modalRef.componentInstance.content = 'Bạn có chắc chắn muốn xóa bản ghi này?';
			modalRef.result.then(res => {
				if (res == 'ok') {
					this.changeStatusToDeleted();
					this.modalService.dismissAll();
				}
			});
		}
	}

	askUserToRejectRecord() {
		const auditFormControls = this.parentForm.controls.auditInfoForm;
		if (!auditFormControls.value.reason) {
			this.parentForm.get('auditInfoForm.reason').setErrors({required: true});
			auditFormControls.markAllAsTouched();
			// this.commonService.error('Bạn chưa nhập lý do từ chối!');
			return;
		}


		let modalRef = this.modalService.open(ModalAskComponent, {
			backdrop: 'static',
			keyboard: false,
			size: 'sm',
			centered: true
		});
		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn từ chối bản ghi này?';
		modalRef.result.then(res => {
			if (res == 'ok') {
				this.rejectEBankRecord();
				this.modalService.dismissAll();
			}
		});
	}

	changeStatusToDeleted() {
		this.isDeletingRecord$.next(true);

		if (!this.dataCacheRouter || !this.dataCacheRouter.id) {
			this.isDeletingRecord$.next(false);
			return;
		}

		let transaction = new TransactionModel();
		transaction.authenType = AU_THEN_TYPE.E_BANK.DELETE;
		transaction.data = {
			id: this.dataCacheRouter.id
		};

		let bodyDeleteReq = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);

		this.commonService.actionGetTransactionResponseApi(bodyDeleteReq)
			.pipe(finalize(() => this.isDeletingRecord$.next(false)))
			.subscribe(res => {

				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} đã được xóa thành công`);

					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
				}
			});
	}

	rejectEBankRecord() {

		this.isRejecting$.next(true);

		if (!this.dataCacheRouter || !this.dataCacheRouter.id) {
			this.isRejecting$.next(false);
			return;
		}

		let transaction = new TransactionModel();
		transaction.authenType = AU_THEN_TYPE.E_BANK.REJECT;
		transaction.data = {
			id: this.dataCacheRouter.id,
			authoriser: this.username,
			reasonReject: this.parentForm.controls.auditInfoForm.value.reason
				? this.parentForm.controls.auditInfoForm.value.reason : null,
			timeRejected: moment(new Date()).format(LOCAL_DATE_TIME)
		};

		let bodyDeleteReq = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyDeleteReq)
			.pipe(finalize(() => this.isRejecting$.next(false)))
			.subscribe(res => {

				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} đã bị từ chối bởi KSV`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVE_CANCEL, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.SEANET);
					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
				}
			});
	}

	approveEBank() {
		const auditFormControls = this.parentForm.controls.auditInfoForm;
		this.parentForm.get('auditInfoForm.reason').setErrors(null);
		auditFormControls.markAllAsTouched();


		this.isApproving$.next(true);

		if (!this.dataCacheRouter || !this.dataCacheRouter.id || !this.username) {
			this.isApproving$.next(false);
			return;
		}
		this.slaTimeService.endCalculateSlaTime();


		let transaction = new TransactionModel();
		transaction.authenType = AU_THEN_TYPE.E_BANK.APPROVE;
		transaction.data = {
			id: this.dataCacheRouter.id,
			authoriser: this.username,
			actionT24: ACTION_T24.APPROVE,
			timeAuth: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaAuthorise: this.slaTimeService.calculateSlaTimeAuth(this.dataCacheRouter)
		};

		let bodyRequestApprove = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyRequestApprove)
			.pipe(finalize(() => this.isApproving$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} đã được duyệt thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVED, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.SEANET);

					this.router.navigate(['/pages/dashboard']);
				} else {
					this.commonService.error(`Bản ghi ${transaction.data.id} đã được duyệt không thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVED, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.SEANET);

					this.router.navigate(['/pages/dashboard']);
				}
			});
	}

	// check validate email
	checkValidateEmail() {
		if (this.frm.email.value && !this.frm.email.value.trim().match('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')) {
			this.emailPattern$.next(true);
		} else {
			this.parentForm.patchValue({
				email: this.frm.email.value.trim()
			});
			this.emailPattern$.next(false);
		}
	}

	listAccountVndOfCustomer: any[] = [];

	getAccountInfo(customerId?) {
		this.isLoadingAccountInfo$.next(true);
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
		bodyConfig.enquiry.customerID = customerId
			? customerId
			: this.commonService.customerId$.getValue();

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingAccountInfo$.next(false)))
			.subscribe(res => {
				this.isSearched = true;
				if (res) {
					this.accountInfo$.next(res.enquiry.account.filter(account => account.category == '1001'));
					this.listAccountVndOfCustomer = res.enquiry.account.filter(account => account.category == '1001' && account.currency == 'VND');
					console.log('account final response ---------------->', this.accountInfo$.getValue());
				} else {
					return;
				}
			});
	}

	backToHome() {
		this.router.navigateByUrl('/pages/dashboard');
	}

	/**
	 * Hàm này convert hạn mức chuyển tiền cho biểu mẫu
	 */
	convertTransLimitReport() {
		let newTransLimit = this.frm.transLimit.value;
		let oldTransLimit = this.eBankInfo$.getValue().transLimit;

		if (oldTransLimit != newTransLimit && this.isEBankCheckbox) {
			if (newTransLimit == 'VND10M') {
				return '10';
			}

			if (newTransLimit == 'VND50M') {
				return '50';
			}

			if (newTransLimit == 'VND200M') {
				return '200';
			}

			if (newTransLimit == 'VND500M') {
				return '500';
			}

			return null;
		}
		return null;
	}

	convertEmailReport(type: string) {
		if (!this.isEBankCheckbox) {
			return '';
		}

		let oldEmail = this.eBankInfo$.getValue().email;
		let newEmail = this.frm.email.value;

		switch (type) {
			case 'OLD':
				return (oldEmail != newEmail) ? oldEmail : '';

			case 'NEW':
				return (oldEmail != newEmail) ? newEmail : '';

		}
	}

	convertPhoneForReport(type: string): string {
		if (!this.isEBankCheckbox) {
			return '';
		}

		let oldPhone = this.eBankInfo$.getValue().handyNumber;
		let newPhone = this.frm.handyNumber.value;

		switch (type) {
			case 'OLD':
				return (oldPhone != newPhone) ? oldPhone : '';

			case 'NEW':
				return (oldPhone != newPhone) ? newPhone : '';

		}
	}

	/**
	 * Convert dòng yêu cầu khác trên biểu mẫu
	 * Tất tần tật những trường có ở trên EBANK mà biểu mẫu không có (SRS)
	 */

	getOtherInfoInReport(): string {
		let otherReportMapping: string = '';


		let limitFormValue = this.frm.transLimit.value;
		if (limitFormValue) {
			const limitOfReport = ['VND10M', 'VND50M', 'VND200M', 'VND500M'];

			if (!limitOfReport.includes(limitFormValue)) {
				otherReportMapping = otherReportMapping + 'Hạn mức chuyển tiền trong ngày: ' + convertTransLimitEBank(limitFormValue);
			}
		}

		// for (const fieldName in this.frm) {
		// 	// const formControlName = ['serviceId', 'promotionId', 'campaignId', 'transSeanetPro', 'transLimit'];
		// 	const formControlName = ['transLimit'];
		// 	const limitOfReport = ['VND10M', 'VND50M', 'VND200M', 'VND500M'];
		// 	const formValue = this.frm[fieldName].value;
		//
		// 	if(formControlName.includes(fieldName) && formValue){
		// 		if(fieldName == 'transLimit' && limitOfReport.includes(formValue)){
		// 			continue;
		// 		}
		// 		otherReportMapping = otherReportMapping + fieldName + ": " + formValue + ", ";
		// 	}
		// }

		// if(otherReportMapping.length > 0){
		// 	return otherReportMapping.slice(0, otherReportMapping.length - 2);
		// }
		return otherReportMapping;
	}

	getServiceStatusReport(): boolean {
		if (!this.isEBankCheckbox) {
			return false;
		}

		let oldServiceStatus = this.eBankInfo$.getValue().serviceStatus;
		let newServiceStatus = this.frm.serviceStatus.value;
		return oldServiceStatus != newServiceStatus && newServiceStatus == 'CLOSE';
	}

	getPackageService(): boolean {
		if (!this.isEBankCheckbox) {
			return false;
		}

		let oldPackageService = this.eBankInfo$.getValue().servicePackage;
		let newPackageService = this.frm.servicePackage.value;

		return oldPackageService != newPackageService;
	}

	get isLoadingTooltipReportButton(): boolean {
		return this.customerInfo == null && (this.isEBankCheckbox || this.isResetPassword || this.isBlockAccount);
	}

	getReportId() {

		if (!this.isEBankCheckbox && !this.isResetPassword && !this.isBlockAccount) {
			this.commonService.error('Bạn chưa chọn mục nào');
			return;
		}

		if (this.customerInfo) {
			this.isLoadingReport$.next(true);

			let branchs = this.localStorage.retrieve(LIST_GROUP_WITH_NAME);
			const currentBranch = this.localStorage.retrieve(CACHE_CO_CODE);
			const branchName = branchs.find(i => i.group_id == currentBranch);

			let body = {
				command: '',
				report: {}
			};
			body.command = 'GET_REPORT';
			body.report = {
				authenType: 'getRequest_SEATELLER_YEU_CAU_DV_SEANET',
				exportType: 'PDF',
				transactionId: this.frm.transactionForm.value.transId,
				custId: '',
				saveToMinio: false,
				action: {
					cancel: this.getServiceStatusReport(),
					chargeBackPayment: false,
					lockUser: this.isBlockAccount && this.eBankInfo$.getValue().userStatus == 'OPEN',
					modify: this.isEBankCheckbox,
					register: false,
					resetPwd: this.isResetPassword,
					unlockUser: this.isBlockAccount && this.eBankInfo$.getValue().userStatus == 'BLOCKED',
					otherAction: this.getOtherInfoInReport() ? this.getOtherInfoInReport() : ''
				},
				customerInfo: {
					accountNo: this.listAccountVndOfCustomer.map(i => i.accountID).join(';'),
					branch: (branchName && branchName.desc) ? branchName.desc : '',
					fullName: (this.customerInfo && this.customerInfo.shortName) ? this.customerInfo.shortName : '',
					gttt: (this.customerInfo && this.customerInfo.legalID) ? this.customerInfo.legalID.split('#')[0] : '',
					issueDate: (this.customerInfo.legalIssDate && this.customerInfo.legalIssDate.split('#')[0])
						? formartDateYYYYMMDD(this.customerInfo.legalIssDate.split('#')[0]) : null,
					issuesAddress: (this.customerInfo && this.customerInfo.legalIssAuth) ? this.customerInfo.legalIssAuth.split('#')[0] : '',
				},

				newSeanetPackage: this.getPackageService(),
				changeDailyTransLimit: this.convertTransLimitReport(),
				changeResetPwdBy: this.isResetPassword ? 'PHONE' : null,
				newEmail: this.convertEmailReport('NEW'),
				oldEmail: this.convertEmailReport('OLD'),
				newPhone: this.convertPhoneForReport('NEW'),
				oldPhone: this.convertPhoneForReport('OLD'),
				printDate: moment(new Date()).format('DD/MM/YYYY')
			};

			this.reportService.getReportForm(body)
				.pipe(finalize(() => this.isLoadingReport$.next(false)))
				.subscribe(res => {
					if (res && res.status == STATUS_OK && res.responseCode == '00') {
						console.log(res.report.data);
						let dataLink: DataLinkMinio = new DataLinkMinio();
						dataLink.fileName = res.report.data.fileName;
						dataLink.fileType = res.report.data.fileType;
						dataLink.bucketName = res.report.data.bucketName;
						dataLink.folder = res.report.data.folder;
						console.log(dataLink);
						this.websocketClientService.sendMessageToTablet([dataLink], 'viewForm');
						window.open(`${this.reportService.minioLink}/${res.report.data.bucketName}/${res.report.data.folder}`, '_blank');
					}
				});
		}
	}

	getCustomerInfo(custId: string) {
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = custId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.commonService.getFilesByCustomerId(bodyConfig.enquiry.customerID);
					this.customerInfo = res.enquiry;
				}
			});
	}

	getCities() {
		let cityCached = this.localStorage.retrieve('cityCached');
		if (cityCached) {
			this.cityList = cityCached;
		} else {
			let command = GET_ENQUIRY;
			let enquiry = new EnquiryModel();
			enquiry.authenType = 'getCITIES';
			this.isLoadingCities$.next(true);
			let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
			this.commonService.actionGetEnquiryUtility(bodyRequest).pipe(finalize(
				() => this.isLoadingCities$.next(false)))
				.subscribe(r => {
					if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
						this.cityList = r.enquiry.city;
						this.localStorage.store('cityCached', r.enquiry.city);
					}
				});
		}
	}

	changeCheckBox() {
		if (this.isEBankCheckbox) {
			this.isBlockAccount = false;
			this.isResetPassword = false;
		}

		if (this.isBlockAccount) {
			this.isEBankCheckbox = false;
			this.isResetPassword = false;
		}

		if (this.isResetPassword) {
			this.isEBankCheckbox = false;
			this.isBlockAccount = false;
		}
	}

	getServicePackage(): void {
		const cache = this.localStorage.retrieve(UTILITY.SERVICE_PACKAGE.SERVICE_PACKAGE_CACHE);
		if (cache) {
			this.servicePackages$.next(cache);
			return;
		}
		this.utilityService.getServicePackagesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const servicePackages = res.body.enquiry.servicePackages;
					this.servicePackages$.next(servicePackages);
					this.localStorage.store(UTILITY.SERVICE_PACKAGE.SERVICE_PACKAGE_CACHE, servicePackages);
				}
			});
	}

	getBrokerTypes(): void {
		const cache = this.localStorage.retrieve(UTILITY.BROKER.BROKER_CACHE);
		if (cache) {
			this.brokerTypeList$.next(cache);
			return;
		}
		this.utilityService.getBrokerTypesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const brokerTypeList = res.body.enquiry.brokers;
					this.brokerTypeList$.next(brokerTypeList);
					this.localStorage.store(UTILITY.BROKER.BROKER_CACHE, brokerTypeList);
				}
			});
	}

	getSaleList(): void {
		const cache = this.localStorage.retrieve(UTILITY.SALE.SALE_CACHE);
		if (cache) {
			this.saleList$.next(cache);
			return;
		}
		this.utilityService.getSalesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const saleList = res.body.enquiry.sales;
					this.saleList$.next(saleList);
					this.localStorage.store(UTILITY.SALE.SALE_CACHE, saleList);
				}
			});
	}

	getTranLimit(): void {
		const cache = this.localStorage.retrieve(UTILITY.TRAN_LIMIT.TRAN_LIMIT_CACHE);
		if (cache) {
			this.limitList$.next(cache);
			return;
		}
		this.utilityService.getTransLimitsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const transLimits = res.body.enquiry.transLimits;
					this.limitList$.next(transLimits);
					this.localStorage.store(UTILITY.TRAN_LIMIT.TRAN_LIMIT_CACHE, transLimits);
				}
			});
	}

	getPromotions(): void {
		const cache = this.localStorage.retrieve(UTILITY.PROMOTION.PROMOTION_CACHE);
		if (cache) {
			this.promotionList$.next(cache);
			return;
		}
		this.utilityService.getPromotionsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const promotions = res.body.enquiry.promotions;
					this.promotionList$.next(promotions);
					this.localStorage.store(UTILITY.PROMOTION.PROMOTION_CACHE, promotions);
				}
			});
	}

	getCampaigns(): void {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.CAMPAIGN);
		if (cache) {
			this.campaignList$.next(cache);
			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.CAMPAIGN)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_OK) {
					const catalogs = res.body.enquiry.catalogs;
					this.campaignList$.next(catalogs);
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.CAMPAIGN, catalogs);
				}
			});
	}

	get disableUnlock() {
		if (this.eBankInfo$ && this.eBankInfo$.getValue()) {
			const userStatus = this.eBankInfo$.getValue().userStatus;
			if (['OPEN', 'BLOCKED'].includes(userStatus)) {
				return this.authorisable$.getValue();
			}
		} else {
			return this.authorisable$.getValue();
		}
		return true;
	}

	checkApproveStatus(stateData) {
		if (stateData.status == 'APPROVED_ERROR') {
			let code = '';
			let value = '';
			switch (stateData.actionT24) {
				case UPDATE_EBANK_INFO:
					code = 'updateEbank';
					value = 'Thay đổi thông tin dịch vụ SeANet';
					break;
				case EBANK_UNLOCK:
				case EBANK_LOCK:
					code = 'lockUnlock';
					value = 'Khoá/ gỡ khoá tài khoản';
					break;
				case EBANK_RESET_PASSWORD:
					code = 'resetPwd';
					value = 'Reset Password';
					break;
			}

			this.headerError = [{
				code: code,
				value: value
			}];
			const object = {
				status: 'Duyệt lỗi',
				desc: stateData.errorDesc
			};
			this.dataError[code] = object;
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

	promotion$ = new BehaviorSubject<string>(null);

	setValueDesc(event) {
		this.promotion$.next(event ? event.description : null);
	}
}

/**
 * hàm này convert hạn mức giao dịch thành text
 * @param limit -> VD: VND300M
 */
export function convertTransLimitEBank(limit: string): string {
	const limitInvalid = !limit || !limit.startsWith('VND') || (!limit.endsWith('M') && !limit.endsWith('B') && !limit.endsWith('T'));
	if (limitInvalid) {
		return null;
	}

	const number = limit.replace(/[A-Z]/g, '');

	let suffix = '';

	if (limit.endsWith('M')) {
		suffix = 'triệu VNĐ';
	} else if (limit.endsWith('B')) {
		suffix = 'tỉ VNĐ';
	} else if (limit.endsWith('T')) {
		suffix = 'nghìn VNĐ';
	}

	return number + ' ' + suffix;
}
