import {TransactionInfoComponent} from './../transaction-info/transaction-info.component';
import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, SimpleChanges, ElementRef} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {AccountRequestDTO} from '../../../../../../shared/model/constants/account-requestDTO';
import {finalize, map} from 'rxjs/operators';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {NavigationEnd, Router} from '@angular/router';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {TransactionModel} from '../../../../../model/transaction.model';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {AuditInfo} from '../../../../../model/audit-info';
import {formatDate, parseDate, parseDateFrmStr} from '../../../../../../shared/util/date-format-ultils';
import {WebsocketClientService} from '../../../../../../shared/services/websocket-client.service';
import {
	ACCOUNT_LOCK,
	CLOSE_ACCOUNT,
	ACCOUNT_RATE_METHOD_BAND,
	ACCOUNT_RATE_METHOD_LEVEL,
	ACCOUNT_RESTORE,
	ACCOUNT_SETUP_INTEREST,
	ACCOUNT_SETUP_WARNING,
	ACTION_T24,
	APPROVE,
	AU_THEN_TYPE,
	CODE_00,
	DATA_FROM_DASHBOARD,
	DATE_IN_WEEK,
	EDIT_LOCK_DOWN_ACCOUNT,
	FAKE_USER_NAME,
	GET_ENQUIRY,
	GET_TRANSACTION, HEADER_API_ACCOUNT, HEADER_API_T24_ENQUIRY,
	LIST_GROUP_WITH_NAME,
	NOTIFICATION, SERVER_API_CUST_INFO, SEVER_API_T24_ENQUIRY,
	STATUS_OK,
	UNLOCK_DOWN_ACCOUNT,
	UPDATE_ACCOUNT_INFO,
	USERNAME_CACHED, UTILITY,
	VIP_TYPE_ACCOUNTS, VIP_CLASS_ACCOUNTS, PENDING, APPROVED_SUCCESS
} from '../../../../../../shared/util/constant';
import {SlaTimeService} from '../../../../../../shared/services/sla-time.service';
import * as moment from 'moment';
import {LOCAL_DATE_TIME} from '../../../../../../shared/model/constants/common-constant';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalNotification} from '../../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {FormPDF} from '../../combo/formPDF';
import {ReportService} from '../../../../../common-service/report.service';
import {BrokerTypeModel} from '../../../../../../shared/model/broker-type.model';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {SaleModel} from '../../../../../../shared/model/sale.model';
import {BasicRateModel} from '../../../../../../shared/model/basic-rate.model';
import {RelationModel} from '../../../../../../shared/model/relation.model';
import {DataLinkMinio} from '../../../../../model/data-link-minio';
import {AppConfigService} from '../../../../../../app-config.service';
import {ReasonBLockModel} from '../../../../../../shared/model/account.model';
import {CoreAiService} from '../../identify-customer/service/core-ai.service';
import {IHeaderTableErrorModel} from '../../../../../../shared/model/table-approve-error.model';
import {GtttUrlModel} from '../../../../../../shared/model/GtttUrl.model';
import {SignatureService} from '../../identify-customer/service/signature.service';
import {formartDateYYYYMMDD} from "../../../../../../shared/util/Utils";

@Component({
	selector: 'kt-account',
	templateUrl: './account.component.html',
	styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnDestroy, AfterViewInit, OnInit {

	@ViewChild(TransactionInfoComponent, {static: false}) customerComponent: TransactionInfoComponent;
	// truy van giao dich
	@Input('viewData') viewData: any;

	@ViewChild('lockDownReason', {static: false}) lockDownReason: ElementRef;

	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCloseAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isRejecting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isMinusNotiBranch$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	parentForm: FormGroup;
	isApproving$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingLockEntryAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingClosedAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	saleList: SaleModel [] = [];
	brokerTypeList: BrokerTypeModel [] = [];
	basicRates: BasicRateModel [] = [];


	isAddOtherInfo: boolean = false;
	isSearched: boolean = false;
	isSubmit: boolean = false;
	isChecked: boolean;
	checkedValue: number;
	isChecked2: boolean;
	listAclkId = [];
	username: string;
	accountNumber: number;
	lockEntryAccount: any = [];
	closedAccount: any = [];

	selectedObject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	selectedClosedAcc$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isDeletingRecord$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isUpdateAccount: boolean = false;
	isLockDown: boolean = false;
	isRelieve: boolean = false;
	isUpdateLockDown: boolean = false;
	isCloseAccount: boolean = false;
	isRecoveryAccount: boolean = false;
	isOtherInformation: boolean = false;
	isSettingInterest: boolean = false;
	isSettingWarning: boolean = false;
	isAnotherInfo: boolean = false;
	dataCacheRouter: any;
	navigationSubscription: any;

	minDate = new Date();
	formError: object = {
		hasErrorLockDown: false,
		message: ''
	};
	account: any;
	auditInfo: AuditInfo;
	today = new Date();
	isLevel: boolean = false;
	accessRightIds: string[] = [];

	parentName: string;
	childOne: string;
	childTwo: string;
	relateList$ = new BehaviorSubject<RelationModel[]>([]);
	listCoCode;
	dateInWeek = DATE_IN_WEEK;
	time = {hour: 13, minute: 30};

	customerInfo: any;
	districtList: any;
	cityList: any;
	ownerBen: any;

	contractId: any;

	isLoadingCities$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingDistrict$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingBasicRate$ = new BehaviorSubject<boolean>(false);

	chargeCodes$ = new BehaviorSubject<any[]>([]);
	reasonBlocks$ = new BehaviorSubject<ReasonBLockModel[]>([]);
	approved$ = new BehaviorSubject<boolean>(false);
	headerError: IHeaderTableErrorModel[] = [];
	dataError: any = {};
	vipTypeAccounts = VIP_TYPE_ACCOUNTS;
	vipClassAccounts = VIP_CLASS_ACCOUNTS;

	firstNavigate$ = new BehaviorSubject<boolean>(false);
	currency: any;
	checkedCloseValue: any;
	isCheckedClose: boolean;
	accountNameReceiveBalance$ = new BehaviorSubject<string>(null);
	isLoadingCheckAcc$ = new BehaviorSubject<boolean>(false);
	chargeCodeNew: any [] = [];
	city: any;
	district: any;
	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private dataPowerService: DataPowerService,
				private router: Router,
				private localStorage: LocalStorageService,
				private sessionStorage: SessionStorageService,
				private slaTimeService: SlaTimeService,
				private websocketClientService: WebsocketClientService,
				private modalService: NgbModal,
				private reportService: ReportService,
				private utilityService: UtilityService,
				private appConfigService: AppConfigService,
				private coreAiService: CoreAiService,
				private signatureService: SignatureService) {

		const code = this.localStorage.retrieve(LIST_GROUP_WITH_NAME);
		if (code.length > 0) {
			this.listCoCode = code.filter(i => i.group_id.startsWith('VN'));
		}

		this.parentName = 'Trang chủ';
		this.childOne = 'Mở tài khoản';
		this.childTwo = null;
		this.parentForm = this.fb.group({
			/**
			 * Form control for update information
			 */
			accountID: [null, [Validators.required]],
			accountName: [null],
			currency: [null, [Validators.required]],
			customerID: [null, [Validators.required]],
			shortName: [null],
			relationCustomer: [null],
			idRelate: [null],
			customerId: [null],
			salesType: [null],
			salesId: [null],
			brokerType: [null],
			brokerId: [null],
			vipType: [null],
			// additionValue: [null],
			classNiceAccount: [null],
			// Update không tạo form rỗng
			relates: this.commonService.isUpdateAccount$.getValue() ? this.fb.array([]) : this.fb.array([this.newRelate()]),

			/**
			 * Form control for lockdown account
			 */
			accEntryLockdown: [null],
			fromDate: [new Date(), [Validators.required]],
			toDate: [null],
			lockDownMoney: [null, [Validators.required, Validators.min(1)]],
			reasonLock: [null, [Validators.required]],
			description: [null, [Validators.required]],

			/**
			 * Form control for close account
			 */
			feeAmtReq: [null],
			feeCode: [null],
			accNumberGetBal: [null, [Validators.required]],
			typeOfGetBalance: ['TKTT_SEABANK'],
			bankReceive: [null,],       //Ngân hàng nhận
			accountOwnerNumber: [null], //Bút toán thu phí
			accountOwner: [null],       //Tài khoản nhận
			accountOwnerName: [null],       //Tên tài khoản nhận
			feeAmountClose: [null],       //Tổng tiền thu
			tax: [null],       //Thuế

			/**
			 * Form control for restore account
			 */
			accNumberClosed: [null, [Validators.required]],

			/**
			 * Form control for setting interest
			 */
			rateBasis: ['E', [Validators.required]],
			typeBalanceRate: ['DAILY', [Validators.required]],
			rateMethod: ['BAND', [Validators.required]],
			keyRate: [null],
			fixRate: [null],
			applyDate: [new Date(), [Validators.required]],
			balance: [null, [Validators.required]],

			/**
			 * Form control for setting warning
			 */
			startDate: [null, [Validators.required]],
			endDate: [null,],
			restrictType: [null,],
			restricted: [null],
			userEx: [null],
			branchEx: [null],
			// branchExs: this.fb.array([this.newBranch()]),
			// userExs: this.fb.array([this.newUser()]),
			dateExcept: [null],
			informBranchs: this.fb.array([this.newInformBranch()]),
			// content: [null, [Validators.required]],
			otherInfos: this.fb.array([this.newInfo()]),
			/**
			 * Form control for edit lockdown account when approved
			 */
			aclkId: [null, [Validators.required]],
			editLockdownFromDate: [null, [Validators.required]],
			editLockdownToDate: [null],
			editLockdownAmount: [null, [Validators.required, Validators.min(1)]],
			editLockdownReason: [null, [Validators.required]],
			editLockdownDescription: [null, [Validators.required]]
		}, {
			validator: [
				//Default error with this validator:  {fromToDate: true}
				this.fromToDate('fromDate', 'toDate')

				// For custome error name like: {customeErrorName: true}, pass third optional parameter with custome name
				// CustomeDateValidators.fromToDate('fromDate', 'toDate', 'customeErrorName')
			]
		});

		/**
		 * Check access right by router url
		 */
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);
		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		this.navigationSubscription = this.router.events.subscribe((e: any) => {
			// If it is a NavigationEnd event re-initalise the component
			if (e instanceof NavigationEnd) {
				this.firstNavigate$.next(true);
				this.initData();
			}
		});
	}

	ngOnInit() {
		this.getReasonBlocks();
		this.getPortfolios();
		this.getBrokerTypes();
		this.getSales();
		this.getBasicRates();
		this.getRelation();
		if (this.viewData || !this.firstNavigate$.getValue()) {
			this.initData();
		}
	}

	getPortfolios(): void {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE);
		if (cache) {
			const dataFiltered = cache.filter(ele => ele.flatAmt);
			if (this.dataCacheRouter && this.dataCacheRouter.currency) {
				this.chargeCodeNew = (dataFiltered.filter(codes => codes.currency == this.dataCacheRouter.currency));
			}
			this.chargeCodes$.next(dataFiltered);
			console.log('dataFiltered', dataFiltered);
			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const commissions = res.body.enquiry.catalogs;
					const dataFiltered = commissions.filter(ele => ele.flatAmt);
					this.chargeCodes$.next(dataFiltered);
					if (this.dataCacheRouter && this.dataCacheRouter.currency) {
						this.chargeCodeNew = (dataFiltered.filter(codes => codes.currency == this.dataCacheRouter.currency));
					}
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE, commissions);

					console.log('dataFiltered', dataFiltered);
				}
			});
	}

	get relates(): FormArray {
		if (this.parentForm) {
			return this.parentForm.get('relates') as FormArray;
		}
	}

	addRelate(element?) {
		this.relates.push(this.newRelate(element));
	}

	removeRelate(i: any) {
		this.relates.removeAt(i);
	}

	newRelate(relate?: any): FormGroup {
		return this.fb.group({
			idRelate: [relate ? relate.idRelate : ''],
			relationCustomer: [relate ? relate.relationCustomer : '']
		});
	}

	initData() {
		this.getCities();
		if (this.viewData) {
			this.dataCacheRouter = this.viewData;
		} else {
			this.slaTimeService.startCalculateSlaTime();
			// console.log('SLA START EBANK ======================>>>', this.slaTimeService.getStartTimeSLA());

			this.checkRight();
			if (this.commonService.isUpdateAccount$.getValue()) {
				this.dataCacheRouter = window.history.state.data;
				console.warn('this.dataCacheRouter: ', this.dataCacheRouter);
			}
			/**
			 * Display aside right component
			 */
			this.commonService.isDisplayAsideRight$.next(true);
			this.commonService.isAsideRight$.next(true);
			// Data lấy được sau khi nhấn vào bản ghi 360
			if (window.history.state.obj360 && window.history.state.custId) {
				this.commonService.customerId$.next(window.history.state.custId);
				this.getAccountInfo(window.history.state.custId, new GtttUrlModel(null, null, null, null, null));
				// this.getClosedAccInfo();

				// console.log('window.history.state.obj360', window.history.state.obj360);
				this.contractId = window.history.state.obj360.contractId;
			}
		}

		if (this.dataCacheRouter) {
			if (this.dataCacheRouter.status == APPROVE || this.dataCacheRouter.status == APPROVED_SUCCESS) {
				this.approved$.next(true);
			} else {
				this.checkApproveStatus(this.dataCacheRouter);
				this.approved$.next(false);
			}
			// bypass customerId vao customerComponent
			this.customerComponent && this.customerComponent.transactionForm.controls.customerId.setValue(this.dataCacheRouter.customerId);
			let cardFront = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.cardFront);
			let cardBack = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.cardBack);
			let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.pictureFace);
			let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.fingerLeft);
			let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.fingerRight);

			let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
			this.getAccountInfo(null, gtttModel);
			// this.getClosedAccInfo();

			if (this.dataCacheRouter.warningTimeSettings && this.dataCacheRouter.warningTimeSettings.length > 0) {
				this.isOtherInformation = true;
			}

			/**
			 * Fill value when receive data from dashboard
			 */
			let actionT24 = this.dataCacheRouter.actionT24;
			switch (actionT24) {
				case UPDATE_ACCOUNT_INFO: {

					// this.getAccountInfo()
					if (this.dataCacheRouter.cusRelationships.length > 0) {
						this.dataCacheRouter.cusRelationships.forEach(element => {
							this.relates.push(this.newRelate(element));
						});
					}
					this.isUpdateAccount = true;
					this.commonService.isUpdateAccount$.next(true);
					this.selectedObject$.next(this.dataCacheRouter);

					this.parentForm.patchValue({
						accountID: this.selectedObject$.getValue().accountNumber,
						accountName: this.selectedObject$.getValue().accountName,
						currency: this.selectedObject$.getValue().currency,
						customerId: this.selectedObject$.getValue().customerId,
						shortName: this.selectedObject$.getValue().shortName,
						relate: this.selectedObject$.getValue().relate,
						idRelate: this.selectedObject$.getValue().idRelate,
						brokerId: this.selectedObject$.getValue().brokerId,
						brokerType: this.selectedObject$.getValue().brokerType,
						salesId: this.selectedObject$.getValue().saleId,
						salesType: this.selectedObject$.getValue().saleType,
						feeAmtReq: this.selectedObject$.getValue().feeAmtReq,
					});
					break;
				}

				/**
				 * PHONG TỎA TK
				 */
				case ACCOUNT_LOCK: {
					this.isLockDown = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						accEntryLockdown: this.dataCacheRouter.aclkAccId,
						fromDate: parseDateFrmStr(this.dataCacheRouter.fromDate),
						toDate: parseDateFrmStr(this.dataCacheRouter.toDate),
						lockDownMoney: this.dataCacheRouter.lockDownMoney,
						reasonLock: this.dataCacheRouter.reasonLock,
						description: this.dataCacheRouter.description,
					});
					break;
				}
				case EDIT_LOCK_DOWN_ACCOUNT: {
					this.isUpdateLockDown = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						aclkId: this.dataCacheRouter.aclkAccId,
						editLockdownToDate: parseDateFrmStr(this.dataCacheRouter.toDate),
						editLockdownFromDate: parseDateFrmStr(this.dataCacheRouter.fromDate),
						editLockdownAmount: this.dataCacheRouter.lockDownMoney,
						editLockdownReason: this.dataCacheRouter.reasonLock,
						editLockdownDescription: this.dataCacheRouter.description,
					});
					this.listAclkId = [this.dataCacheRouter.aclkAccId];
					this.accountNumber = this.dataCacheRouter.accountNumber;
					this.getAccountLockEntry();
					break;
				}

				case CLOSE_ACCOUNT: {
					this.isCloseAccount = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						accNumberGetBal: this.dataCacheRouter.balanceAcc,
						feeCode: this.dataCacheRouter.feeCode,
						feeAmtReq: this.dataCacheRouter.feeAmtReq,
						accountOwnerNumber: this.dataCacheRouter.feeAccountid,
						bankReceive: this.dataCacheRouter.informBranch,
						accountOwner: this.dataCacheRouter.shortName,
						tax: this.dataCacheRouter.tax,
						feeAmountClose: this.dataCacheRouter.feeTotal,
						typeOfGetBalance: this.dataCacheRouter.typeBalanceRate,
						accountOwnerName: this.dataCacheRouter.accountName,
					});

					this.checkValidFeeAcc(this.dataCacheRouter.balanceAcc);
					break;
				}

				case ACCOUNT_RESTORE: {
					this.isRecoveryAccount = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						accNumberClosed: this.dataCacheRouter.accountNumber,
					});
					break;
				}

				case ACCOUNT_SETUP_INTEREST: {
					this.isSettingInterest = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						rateBasis: this.dataCacheRouter.rateBasis,
						typeBalanceRate: this.dataCacheRouter.typeBalanceRate,
						rateMethod: this.dataCacheRouter.rateMethod,
						keyRate: this.dataCacheRouter.keyRate,
						fixRate: this.dataCacheRouter.fixRate,
						applyDate: parseDate(this.dataCacheRouter.applyDate, 'DD-MM-YYYY'),
						balance: this.dataCacheRouter.balance,
					});
					this.isLevel = this.dataCacheRouter.rateMethod.toLowerCase() == ACCOUNT_RATE_METHOD_LEVEL.toLowerCase();
					break;
				}

				case ACCOUNT_SETUP_WARNING: {

					if (this.dataCacheRouter && this.dataCacheRouter.settingBranchNotifications.length > 0) {
						this.removeInformBranch(0);
						this.dataCacheRouter.settingBranchNotifications.forEach(element => {
							this.informBranchs.push(this.newInformBranch(element));
						});
					}

					if (this.dataCacheRouter && this.dataCacheRouter.warningTimeSettings.length > 0) {
						this.removeInfo(0);
						this.dataCacheRouter.warningTimeSettings.forEach(element => {
							this.otherInfos.push(this.newInfo(element));
						});
					}

					// if (this.dataCacheRouter && this.dataCacheRouter.exceptDate) {
					// 	let exceptDate = this.dataCacheRouter.exceptDate.split(";");
					//
					// 	this.removeDateExcept(0);
					// 	exceptDate.forEach(element => {
					// 		this.getDateExcept.push(this.dateExcept(element))
					// 	});
					// }

					let branchEx = this.dataCacheRouter.branchEx ? this.dataCacheRouter.branchEx.toString().split(';') : null;
					let userEx = this.dataCacheRouter.userEx ? this.dataCacheRouter.userEx.toString().toUpperCase().split(';') : null;
					let exceptDate = this.dataCacheRouter.exceptDate ? this.dataCacheRouter.exceptDate.toString().split(';') : null;
					this.isSettingWarning = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						startDate: this.dataCacheRouter.startDate ? parseDateFrmStr(this.dataCacheRouter.startDate) : null,
						endDate: this.dataCacheRouter.endDate ? parseDateFrmStr(this.dataCacheRouter.endDate) : null,
						restrictType: this.dataCacheRouter.restrictType,
						restricted: this.dataCacheRouter.restricted,
						branchEx: branchEx,
						userEx: userEx,
						dateExcept: exceptDate,
						informBranch: this.dataCacheRouter.informBranch,
						content: this.dataCacheRouter.content,
						fromDate$: this.dataCacheRouter.fromDate,
						toDate$: this.dataCacheRouter.toDate,
						dateEx: this.dataCacheRouter.dateEx,
					});
					break;
				}

				case UNLOCK_DOWN_ACCOUNT:
					this.isRelieve = true;
					this.selectedObject$.next(this.dataCacheRouter);
					this.parentForm.patchValue({
						startDate: this.dataCacheRouter.startDate,
						endDate: this.dataCacheRouter.endDate,
						restrictType: this.dataCacheRouter.restrictType,
						restricted: this.dataCacheRouter.restricted,
						branchEx: this.dataCacheRouter.branchEx,
						userEx: this.dataCacheRouter.userEx,
						informBranch: this.dataCacheRouter.informBranch,
						content: this.dataCacheRouter.content,
						fromDate$: this.dataCacheRouter.fromDate,
						toDate$: this.dataCacheRouter.toDate,
						dateEx: this.dataCacheRouter.dateEx,
						id: this.dataCacheRouter
							? this.dataCacheRouter.id
							: this.parentForm.controls.transactionForm.value.transId,
						accountID: this.dataCacheRouter.accountNumber,
						inputter: this.dataCacheRouter.inputter,
						coCode: this.dataCacheRouter.coCode,
						priority: this.dataCacheRouter.priority,
						actionT24: UNLOCK_DOWN_ACCOUNT,
						timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
						timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter)
					});
					this.listAclkId = this.dataCacheRouter.accEntryLockdown.split(';');
					// this.cdr.detectChanges();
					this.accountNumber = this.dataCacheRouter.accountNumber;
					this.getAccountLockEntry();
					break;
			}
			this.accountNumber = this.dataCacheRouter.accountNumber;
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
	}

	getBrokerTypes() {
		const cache = this.localStorage.retrieve(UTILITY.BROKER.BROKER_CACHE);
		if (cache) {
			this.brokerTypeList = cache;
			return;
		}
		this.utilityService.getBrokerTypesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.brokerTypeList = res.body.enquiry.brokers;
					this.localStorage.store(UTILITY.BROKER.BROKER_CACHE, this.brokerTypeList);
				}
			});
	}

	getSales() {
		const cache = this.localStorage.retrieve(UTILITY.SALE.SALE_CACHE);
		if (cache) {
			this.saleList = cache;
			return;
		}
		this.utilityService.getSalesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.saleList = res.body.enquiry.sales;
					this.localStorage.store(UTILITY.SALE.SALE_CACHE, this.saleList);
				}
			});
	}

	getBasicRates() {
		const cache = this.localStorage.retrieve(UTILITY.BASIC_RATE.BASIC_RATE_CACHE);
		if (cache) {
			this.basicRates = cache;
			return;
		}
		this.utilityService.getBasicRatesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.basicRates = res.body.enquiry.basicRates;
					this.localStorage.store(UTILITY.BASIC_RATE.BASIC_RATE_CACHE, this.basicRates);
				}
			});
	}

	getRelation() {
		const cache = this.localStorage.retrieve(UTILITY.RELATION.RELATION_CACHE);
		if (cache) {
			this.relateList$.next(cache);
			return;
		}
		this.utilityService.getRelationsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const relations = res.body.enquiry.relations;
					this.relateList$.next(relations);
					this.localStorage.store(UTILITY.RELATION.RELATION_CACHE, relations);
				}
			});
	}

	ngAfterViewInit() {
		if (this.dataCacheRouter) {
			this.customerComponent && this.customerComponent.transactionForm.controls.customerId.setValue(this.dataCacheRouter.customerId);
		}
		this.parentForm.get('informBranchs').valueChanges.subscribe(() => {
			if (this.parentForm.get('informBranchs').value.length > 1) {
				this.isMinusNotiBranch$.next(true);
			}
		});

		this.parentForm.valueChanges.subscribe(() => {
			if (this.parentForm.controls.transactionForm && this.parentForm.controls.auditInfoForm) {
				this.account = this.parentForm.controls.transactionForm.value;
				this.auditInfo = this.parentForm.controls.auditInfoForm.value;
			}
		});	
	}

	ngOnDestroy(): void {
		this.slaTimeService.clearTimeSLA();
		this.commonService.isUpdateAccount$.next(false);
		this.commonService.isNotifyHasCancel$.next(false);
		this.commonService.isDisplayFile$.next(false);
		if (this.navigationSubscription) {
			this.navigationSubscription.unsubscribe();
		}
		// remove image aside right
		this.coreAiService.navigateToCombo$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
	}

	getAccountInfo(custid: string, gtttModel: GtttUrlModel) {
		this.getClosedAccInfo();
		this.isSearched = false;
		this.isLockDown = false;
		this.isUpdateAccount = false;
		this.isUpdateLockDown = false;
		this.isSettingWarning = false;
		this.isSettingInterest = false;
		this.isRecoveryAccount = false;
		this.isCloseAccount = false;
		this.isRelieve = false;
		this.isChecked = false;
		this.checkedValue = null;
		this.selectedObject$.next(null);
		this.isLoadingAccountInfo$.next(true);
		let bodyConfig = AccountRequestDTO.BODY.BODY_ACCOUNT;
		// custId 360
		if (custid) {
			bodyConfig.enquiry.custId = custid;
		}
		bodyConfig.enquiry.custId = this.commonService.isUpdateAccount$.getValue()
			? this.dataCacheRouter.customerId
			: this.commonService.customerId$.getValue();
		if (!gtttModel) {
			gtttModel = new GtttUrlModel(null, null, null, null, null);
		}
		this.getImageUser(bodyConfig.enquiry.custId, gtttModel);
		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingAccountInfo$.next(false)))
			.subscribe(res => {
				this.isSearched = true;
				if (res) {
					this.commonService.getFilesByCustomerId(bodyConfig.enquiry.custId);
					let accountInfos = res.enquiry.seabGetAcccustSeateller.filter(i => i.category == '1001');
					this.accountInfo$.next(accountInfos);

					console.log('this.accountInfo', this.accountInfo$.getValue());
					// console.log('accountInfos', accountInfos);
					if (this.dataCacheRouter) {
						if (accountInfos.length > 0) {
							accountInfos.forEach(account => {
								if (account.acct == this.dataCacheRouter.accountNumber) {
									this.selectedObject$.next(account);
									this.parentForm.patchValue({
										vipType: this.selectedObject$.getValue().sbVipType,
										classNiceAccount: this.selectedObject$.getValue().sbVipClass
									});
								}
							});
						}
					}
					console.log('this.selectedObject$', this.selectedObject$.getValue());

					// this.getCustomerInfo();
					// console.log('account final response ---------------->', res.enquiry);
				} else {
					return;
				}
			});
	}

	onSubmit() {
		this.isLoading$.next(true);
		this.slaTimeService.endCalculateSlaTime();
		this.isSubmit = true;

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
			fingerRight,
		};

		if (this.isUpdateAccount) {
			this.updateAccount(objGttt);

		} else if (this.isLockDown) {
			this.lockDownAccount(objGttt);

			//Giải tỏa TK
		} else if (this.isRelieve) {
			this.relieveAccount(objGttt);

		} else if (this.isUpdateLockDown) {
			this.updateLockDown(objGttt);

		} else if (this.isCloseAccount) {
			this.closeAccount(objGttt);

		} else if (this.isRecoveryAccount) {
			this.recoveryAccount(objGttt);

		} else if (this.isSettingInterest) {
			this.settingInterest(objGttt);

		} else if (this.isSettingWarning) {
			this.settingWarning(objGttt);

		} else {
			this.commonService.error('Bạn chưa chọn mục nào');
			return;
		}

		this.sessionStorage.clear(DATA_FROM_DASHBOARD);
	}

	/**
	 * Cập nhật thông tin tài khoản
	 */
	updateAccount(objGttt) {
		// console.log('---------------->>', this.dataCacheRouter);
		let command = GET_TRANSACTION;
		let transaction: TransactionModel = new TransactionModel();
		transaction.authenType = this.dataCacheRouter ? 'updateAccount' : 'createAccount';
		transaction.data = {
			id: this.parentForm.controls.transactionForm.value.transId,
			customerId: this.parentForm.controls.transactionForm.value.customerId,
			accountName: this.parentForm.controls.accountName.value.trim(),
			shortName: this.parentForm.controls.shortName.value ? this.parentForm.controls.shortName.value.trim() : '',
			accountNumber: this.parentForm.controls.accountID.value.trim(),
			inputter: this.parentForm.controls.auditInfoForm.value.inputter,
			cusRelationships: this.relates.value,
			currency: this.parentForm.controls.currency.value,
			authoriser: this.parentForm.controls.auditInfoForm.value.authoriser,
			coCode: this.parentForm.controls.auditInfoForm.value.coCode,
			saleType: this.parentForm.controls.salesType.value,
			brokerType: this.parentForm.controls.brokerType.value,
			brokerId: this.parentForm.controls.brokerId.value,
			saleId: this.parentForm.controls.salesId.value,
			transID: this.parentForm.controls.transactionForm.value.transId,
			priority: this.parentForm.controls.transactionForm.value.priority,
			actionT24: UPDATE_ACCOUNT_INFO,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			feeAmtReq: this.parentForm.controls.feeAmtReq.value, // số tiền phí
			coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
			cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
		};

		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		console.log(bodyRequest, 'bodyRequest');
		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => this.isLoading$.next(false)))
			// .pipe(finalize(() => this.router.navigate(['/pages/dashboard'])))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});

	}

	getAccountLockEntry() {
		this.isLoadingLockEntryAccount$.next(true);
		let body: any = {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.SEABAPI.AC.LOCKED.EVENTS',
				acNumber: this.accountNumber
			}
		};
		this.commonService.getAccountLockEntry(body, false)
			.pipe(finalize(() => this.isLoadingLockEntryAccount$.next(false)))
			.subscribe(res => {
				console.log('this.lockEntryAccount', res);

				if (res && res.body.status == STATUS_OK && res.body.enquiry.seabapiAcLockedEvents) {
					this.lockEntryAccount = res.body.enquiry.seabapiAcLockedEvents;

					if (this.dataCacheRouter && this.listAclkId.length > 0 && this.lockEntryAccount.length > 0) {
						this.lockEntryAccount.map(i => {
							if (this.listAclkId.includes(i.butToanPT.trim())) {
								this.listButToanPhongToa.push(i);
							}
						});
					}

				} else {
					this.lockEntryAccount = [];
					// this.commonService.error('không tìm thấy thông tin khách hàng');
					return;
				}
				// this.cdr.detectChanges();
			});
	}

	/**
	 * PHONG TỎA TÀI KHOẢN
	 */
	lockDownAccount(objGttt) {
		this.formError = {
			hasErrorLockDown: false
		};
		if (this.isLockdownValid) {
			let fromDate = this.parentForm.controls.editLockdownFromDate.value
				? this.parentForm.controls.editLockdownFromDate.value.getTime() : null;
			let toDate = this.parentForm.controls.editLockdownToDate.value
				? this.parentForm.controls.editLockdownToDate.value.getTime() : null;
			if (fromDate && toDate && fromDate > toDate) {
				this.formError = {
					hasErrorLockDown: true,
					message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!'
				};
				this.isLoading$.next(false);
				return;
			}
			let command = GET_TRANSACTION;
			let transaction: TransactionModel = new TransactionModel();
			transaction.authenType = 'lockDownAcc';
			let auditForm = this.parentForm.controls.auditInfoForm.value;
			transaction.data = {
				id: this.parentForm.controls.transactionForm.value.transId,
				accountNumber: this.dataCacheRouter ? this.dataCacheRouter.accountNumber : this.parentForm.controls.accountID.value,
				inputter: this.parentForm.get('auditInfoForm.inputter').value,
				coCode: this.parentForm.get('auditInfoForm.coCode').value,
				priority: this.parentForm.controls.transactionForm.value.priority,
				actionT24: ACCOUNT_LOCK,
				customerId: this.parentForm.controls.transactionForm.value.customerId,
				feeCode: '100000',
				feeAmtReq: '100000',
				lockDownMoney: this.parentForm.controls.lockDownMoney.value,
				reasonLock: this.parentForm.controls.reasonLock.value,
				fromDate: this.parentForm.controls.fromDate.value ? formatDate(this.parentForm.controls.fromDate.value) : '',
				toDate: this.parentForm.controls.toDate.value ? formatDate(this.parentForm.controls.toDate.value) : '',
				description: this.parentForm.controls.description.value,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
				cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
			};
			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			// console.log(bodyRequest, 'bodyRequest');
			this.commonService.actionGetTransactionResponseApi(bodyRequest).pipe(finalize(
				() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
						this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
						this.router.navigate(['/pages/dashboard']);
					} else {
						return;
					}
				});
		} else {
			this.isLoading$.next(false);
			this.commonService.error('Dữ liệu nhập chưa chính xác!');
			return;
		}
	}

	/**
	 * Giải tỏa tài khoản
	 */
	relieveAccount(objGttt) {
		let command = GET_TRANSACTION;
		let transaction: TransactionModel = new TransactionModel();
		transaction.authenType = 'unLockDownAccount';
		transaction.data = {
			id: this.parentForm.controls.transactionForm.value.transId,
			accountNumber: this.parentForm.controls.accountID.value,
			inputter: this.username,
			coCode: this.parentForm.get('auditInfoForm.coCode').value,
			customerId: this.parentForm.controls.transactionForm.value.customerId,
			coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
			priority: this.parentForm.controls.transactionForm.value.priority,
			actionT24: UNLOCK_DOWN_ACCOUNT,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			accEntryLockdown: this.convertAccountEntry(this.listAclkId),
			cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
		};

		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		console.log(bodyRequest, 'bodyRequest');
		this.commonService.actionGetTransactionResponseApi(bodyRequest).pipe(finalize(
			() => this.isLoading$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
				}
			});
	}

	/**
	 * Cập nhật phong tỏa tài khoản
	 */
	updateLockDown(objGttt) {
		if (true) {
			const fromDate = this.parentForm.controls.editLockdownFromDate.value;
			const toDate = this.parentForm.controls.editLockdownToDate.value;
			if (fromDate && toDate && fromDate > toDate) {
				this.formError = {
					hasErrorLockDown: true,
					message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc!'
				};
				this.isLoading$.next(false);
				return;
			}

			this.parentForm.get('editLockdownReason').markAsTouched();
			if (this.parentForm.get('editLockdownReason').invalid) {
				this.isLoading$.next(false);
				this.commonService.error('Vui lòng nhập đủ các trường');
				return;
			}

			let command = GET_TRANSACTION;
			let transaction: TransactionModel = new TransactionModel();
			transaction.authenType = this.dataCacheRouter ? 'editLockDownAccount' : 'editLockDownAccount';
			let auditForm = this.parentForm.controls.auditInfoForm.value;
			transaction.data = {
				id: this.parentForm.controls.transactionForm.value.transId,
				accountNumber: this.dataCacheRouter ? this.dataCacheRouter.accountNumber : this.parentForm.controls.accountID.value,
				inputter: auditForm.inputter,
				coCode: auditForm.coCode,
				priority: this.parentForm.controls.transactionForm.value.priority,
				actionT24: EDIT_LOCK_DOWN_ACCOUNT,
				feeCode: '100000',
				feeAmtReq: '100000',
				customerId: this.parentForm.controls.transactionForm.value.customerId,
				lockDownMoney: this.parentForm.controls.editLockdownAmount.value,
				reasonLock: this.parentForm.controls.editLockdownReason.value,
				fromDate: fromDate ? moment(fromDate).format('DD-MM-YYYY') : null,
				toDate: toDate ? moment(toDate).format('DD-MM-YYYY') : null,
				description: this.parentForm.controls.editLockdownDescription.value,
				aclkId: this.parentForm.controls.aclkId.value,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
				cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
			};
			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			this.commonService.actionGetTransactionResponseApi(bodyRequest).pipe(finalize(
				() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
						this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
						this.router.navigate(['/pages/dashboard']);
					} else {
						return;
					}
				});
		} else {
			this.isLoading$.next(false);
			this.commonService.error('Dữ liệu nhập chưa chính xác!');
			return;
		}
	}

	closeAccount(objGttt) {
		if (this.isCloseAccValid) {
			let command = GET_TRANSACTION;
			let transaction: TransactionModel = new TransactionModel();
			transaction.authenType = 'closeAcc';
			transaction.data = {
				id: this.parentForm.controls.transactionForm.value.transId,
				accountNumber: this.dataCacheRouter ? this.dataCacheRouter.accountNumber : this.parentForm.controls.accountID.value,
				inputter: this.dataCacheRouter ? this.dataCacheRouter.inputter : this.parentForm.get('auditInfoForm.inputter').value,
				coCode: this.dataCacheRouter ? this.dataCacheRouter.coCode : this.parentForm.get('auditInfoForm.coCode').value,
				coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
				balanceAcc: this.parentForm.controls.accNumberGetBal.value,
				priority: this.parentForm.controls.transactionForm.value.priority,
				customerId: this.parentForm.controls.transactionForm.value.customerId,
				actionT24: CLOSE_ACCOUNT,
				currency: this.currency,
				feeCode: this.parentForm.controls.feeCode.value,
				feeAmtReq: this.parentForm.controls.feeAmtReq.value,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
				feeAccountid: this.frm.accountOwnerNumber.value,  //Tài khoản nhận
				informBranch: this.frm.bankReceive.value,  //Ngân hàng nhận
				shortName: this.frm.accountOwner.value,  //Người nhận
				tax: this.frm.tax.value,
				feeTotal:this.frm.feeAmountClose.value, //Tổng tiền thu
				typeBalanceRate:this.frm.typeOfGetBalance.value, //Hình thức nhận số dư
				accountName :this.frm.accountOwnerName.value //Tên TK nhận số dư

			};

			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			// console.log(bodyRequest, 'bodyRequest');
			this.commonService.actionGetTransactionResponseApi(bodyRequest).pipe(finalize(
				() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
						this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
						this.router.navigate(['/pages/dashboard']);
					} else {
						return;
					}
				});
		} else {
			this.isLoading$.next(false);
			this.commonService.error('Dữ liệu nhập chưa chính xác!');
			return;
		}
	}

	recoveryAccount(objGttt) {
		if (this.isRecoveryAccValid) {
			this.isLoadingCloseAccount$.next(false);
			let command = GET_TRANSACTION;
			let transaction: TransactionModel = new TransactionModel();
			transaction.authenType = 'restoreClosedAccount';
			transaction.data = {
				id: this.parentForm.controls.transactionForm.value.transId,
				accountNumber: this.parentForm.controls.accNumberClosed.value,
				inputter: this.parentForm.get('auditInfoForm.inputter').value,
				coCode: this.parentForm.get('auditInfoForm.coCode').value,
				priority: this.parentForm.controls.transactionForm.value.priority,
				customerId: this.parentForm.controls.transactionForm.value.customerId,
				actionT24: ACCOUNT_RESTORE,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedClosedAcc$.getValue().coCode,
				cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
			};
			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			console.log(bodyRequest, 'bodyRequest');
			this.commonService.actionGetTransactionResponseApi(bodyRequest)
				.pipe(finalize(
					() => this.isLoadingCloseAccount$.next(false)))
				.subscribe(res => {

					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
						this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
						this.router.navigate(['/pages/dashboard']);

					} else {
						return;
					}
				});
		} else {
			this.isLoading$.next(false);
			this.commonService.error('Dữ liệu nhập chưa chính xác!');
			return;
		}
	}

	settingInterest(objGttt) {
		if (this.isSettingRateValidBand) {
			let command = GET_TRANSACTION;
			let transaction: TransactionModel = new TransactionModel();
			if (!this.parentForm.controls.keyRate.value && !this.parentForm.controls.fixRate.value) {
				this.commonService.error('Vui lòng nhập 1 trong 2 giá trị key lãi suất hoặc lãi suất cố định');
				this.isLoading$.next(false);
				return;
			}
			transaction.authenType = 'setupRate';
			transaction.data = {
				id: this.parentForm.controls.transactionForm.value.transId,
				accountNumber: this.accountNumber ? this.accountNumber : this.parentForm.controls.accountID.value,
				actionT24: ACCOUNT_SETUP_INTEREST,
				rateBasis: this.parentForm.controls.rateBasis.value,
				typeBalanceRate: this.parentForm.controls.typeBalanceRate.value,
				rateMethod: this.parentForm.controls.rateMethod.value,
				keyRate: this.parentForm.controls.keyRate.value,
				customerId: this.parentForm.controls.transactionForm.value.customerId,
				fixRate: this.parentForm.controls.fixRate.value,
				applyDate: formatDate(this.parentForm.controls.applyDate.value),
				coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
				balance: this.isLevel ? '' : this.parentForm.controls.balance.value,
				inputter: this.parentForm.get('auditInfoForm.inputter').value,
				coCode: this.parentForm.get('auditInfoForm.coCode').value,
				priority: this.parentForm.controls.transactionForm.value.priority,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
			};
			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			console.log(bodyRequest, 'bodyRequest');
			this.commonService.actionGetTransactionResponseApi(bodyRequest).pipe(finalize(
				() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
						this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
						this.router.navigate(['/pages/dashboard']);
					} else {
						return;
					}
				});
		} else {
			this.isLoading$.next(false);
			this.commonService.error('Dữ liệu nhập chưa chính xác!');
			return;
		}
	}

	settingWarning(objGttt) {
		console.log('this.auditForm.value', this.parentForm.get('auditInfoForm.inputter').value);
		let warningTimeSettings;
		let settingBranchNotifications;
		const otherInfos = [...this.parentForm.controls.otherInfos.value];
		if (this.parentForm.controls.otherInfos.value.length <= 1 && (!this.parentForm.controls.otherInfos.value[0].dateExcept
			&& !this.parentForm.controls.otherInfos.value[0].allowDate)) {
			warningTimeSettings = null;
		} else {
			warningTimeSettings = otherInfos.map(item => (
				{
					fromTime: item.fromTime ? this.mapTimeValue(item.fromTime) : null,
					toTime: item.toTime ? this.mapTimeValue(item.toTime) : null,
					allowDate: item.allowDate,
					parentId: this.parentForm.controls.transactionForm.value.transId,
					id: '',
				}));
		}
		const informBranchs = [...this.parentForm.controls.informBranchs.value];
		// if(this.parentForm.controls.informBranchs.value.length <=1 && (!this.parentForm.controls.informBranchs.value[0].coCode
		// 	&& !this.parentForm.controls.informBranchs.value[0].content)) {
		// 		settingBranchNotifications = null
		// } else {
		settingBranchNotifications = informBranchs.map(item => (
			{
				coCode: item.coCode,
				content: item.content ? item.content : null,
				parentId: this.parentForm.controls.transactionForm.value.transId,
				id: ''
			}));
		// }
		// const dateExceptFromValues = [...this.parentForm.controls.dateExcept.value];

		// let exceptDate = dateExceptFromValues.map(item => moment(item.dateExcept).format('DD-MM-YYYY')).toString().replace(/,/g, ';');
		// console.clear()
		// console.log(exceptDate)
		console.log('parenForm.value', this.parentForm.value);
		console.log('parenformValid', this.parentForm);
		if (this.isSettingWaringValid) {
			let command = GET_TRANSACTION;
			let transaction: TransactionModel = new TransactionModel();
			transaction.authenType = 'setupWarning';
			let customerId = this.parentForm.controls.transactionForm.value.customerId;
			let accountNumber = this.selectedObject$.getValue().acct;

			transaction.data = {
				id: this.parentForm.controls.transactionForm.value.transId,
				accountNumber: accountNumber,
				priority: this.parentForm.controls.transactionForm.value.priority,
				actionT24: ACCOUNT_SETUP_WARNING,
				startDate: this.parentForm.controls.startDate.value ? formatDate(this.parentForm.controls.startDate.value) : null,
				endDate: this.parentForm.controls.endDate.value ? formatDate(this.parentForm.controls.endDate.value) : null,
				restrictType: this.parentForm.controls.restrictType.value,
				restricted: this.parentForm.controls.restricted.value,
				branchEx: this.parentForm.controls.branchEx.value ? this.parentForm.controls.branchEx.value.toString().replaceAll(',', ';') : null,
				userEx: this.parentForm.controls.userEx.value ? this.parentForm.controls.userEx.value.toString().toUpperCase().replaceAll(',', ';') : null,
				inputter: this.parentForm.get('auditInfoForm.inputter').value,
				coCode: this.parentForm.get('auditInfoForm.coCode').value,
				customerId: customerId,
				coCodeT24: this.dataCacheRouter ? this.dataCacheRouter.coCodeT24 : this.selectedObject$.getValue().coCode,
				exceptDate: this.parentForm.controls.dateExcept.value ? this.parentForm.controls.dateExcept.value.toString().replaceAll(',', ';') : null,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				warningTimeSettings: warningTimeSettings ? warningTimeSettings : null,
				settingBranchNotifications: settingBranchNotifications ? settingBranchNotifications : null,
				cardFrontBase64: objGttt.cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: objGttt.cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: objGttt.fingerLeft ? null : this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: objGttt.fingerRight ? null : this.coreAiService.fingerRightScan$.getValue(),
			};
			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			console.log(bodyRequest, 'bodyRequest');
			this.commonService.actionGetTransactionResponseApi(bodyRequest).pipe(finalize(
				() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
						this.commonService.success(`Bản ghi ${transaction.data.id} đã được gửi duyệt tới KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
						this.router.navigate(['/pages/dashboard']);
					} else {
						return;
					}
				});
		} else {
			this.isLoading$.next(false);
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}
	}

	onChangeAccount(event, data, index) {
		this.parentForm.patchValue({
			feeCode: null,
			accNumberGetBal: null,
			feeAmtReq: null
		});
		this.closeAllCheckBoxAccount();
		// console.log(event);
		if (event.source.checked == true) {
			this.chargeCodeNew = [...this.chargeCodes$.getValue().filter(code => code.currency == data.currency)];
			this.selectedObject$.next(data);
			console.log('data: ', data);
			if (this.selectedObject$.getValue()) {
				this.parentForm.patchValue({
					accountID: this.selectedObject$.getValue().acct,
					currency: this.selectedObject$.getValue().currency,
					accountName: this.selectedObject$.getValue().acctName,
					shortName: this.selectedObject$.getValue().shortName,
					customerId: this.selectedObject$.getValue().customerID,
					salesType: this.selectedObject$.getValue().seabSaleType || null,
					brokerType: this.selectedObject$.getValue().seabBrokerType || null,
					brokerId: this.selectedObject$.getValue().seabBrokerId,
					salesId: this.selectedObject$.getValue().seabSaleId,
					vipType: this.selectedObject$.getValue().sbVipType,
					// additionValue: this.selectedObject$.getValue().additionValue,
					classNiceAccount: this.selectedObject$.getValue().sbVipClass
				});
				const relationCodes = this.selectedObject$.getValue().relationCode ? this.selectedObject$.getValue().relationCode.split('#') : [];
				const idRelattions = this.selectedObject$.getValue().jhAccount ? this.selectedObject$.getValue().jhAccount.split('#') : [];
				this.pathRelate(relationCodes, idRelattions);
			}
		} else {
			this.selectedObject$.next(null);
		}
		this.accountNumber = data.acct;
		this.isChecked = true;
		this.checkedValue = index;
		this.checkedCloseValue = null;
		// this.cdr.detectChanges();
		if (this.isSearched) {
			this.getAccountLockEntry();
		}
	}

	pathRelate(relationCodes: string[], idRelates: string[]) {
		const relationCodeLen = relationCodes.length;
		const idRelateLen = idRelates.length;
		let relations = [];
		const lastItem = (relationCodeLen > idRelateLen) ? relationCodeLen : idRelateLen;
		for (let i = 0; i < lastItem; i++) {
			if (i <= relationCodeLen && i <= idRelateLen) {
				relations.push({
					relationCustomer: relationCodes[i],
					idRelate: idRelates[i]
				});
			}
			if (i > idRelateLen) {
				relations.push({
					relationCustomer: relationCodes[i],
					idRelate: null
				});
			}
			if (i < relationCodeLen) {
				relations.push({
					relationCustomer: null,
					idRelate: idRelates[i]
				});
			}
		}
	}

	onChangeLockdownNumber(event, data) {
		// console.log('event: ', event);
		// console.log('data: ', data);
		this.isChecked2 = !this.isChecked2;
		if (event.source.checked == true) {
			this.parentForm.patchValue({
				aclkId: data.butToanPT.trim(),
				editLockdownFromDate: moment(data.fromDate.trim(), 'YYYYMMDD').isValid() ? moment(data.fromDate.trim(), 'YYYYMMDD') : null,
				editLockdownToDate: moment(data.toDate.trim(), 'YYYYMMDD').isValid() ? moment(data.toDate.trim(), 'YYYYMMDD') : null,
				editLockdownAmount: parseInt(data.lockedAmount.trim()),
				editLockdownReason: null, // TODO - đợi chỉnh sửa khi T24ENQ.SEABAPI.AC.LOCKED.EVENTS bổ sung blockID
				editLockdownDescription: data.description.trim()
			});
		} else {
			this.parentForm.patchValue({
				aclkId: '',
				editLockdownFromDate: null,
				editLockdownToDate: null,
				editLockdownAmount: '',
				editLockdownReason: '',
				editLockdownDescription: ''
			});
		}
	}

	onChangeClosedAcc(event, data, index) {
		this.parentForm.controls.accNumberClosed.setValue(data.accountId);
		this.selectedClosedAcc$.next(data);
		this.isCheckedClose = true;
		this.checkedCloseValue = index;
		// danh sach tai khoan dang hoat dong
		this.checkedValue = null;
		this.selectedObject$.next(null);
	}

	listButToanPhongToa: any[] = [];

	onChangeLockdown(event, data) {
		if (event.target.checked == true && !this.listAclkId.includes(data.butToanPT.trim())) {
			this.listAclkId.push(data.butToanPT.trim());
			this.listButToanPhongToa.push(data);
		}

		if (event.target.checked == false) {
			this.listAclkId.splice(this.listAclkId.indexOf(data.butToanPT.trim()), 1);
			this.listButToanPhongToa = this.listButToanPhongToa.filter(i => i.butToanPT.trim() !== data.butToanPT.trim());
		}
	}


	onUpdateAccount(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isRecoveryAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isUpdateAccount = true;
		}
	}

	onLockdownAccount(event) {
		// if (this.selectedObject$.getValue()) {
		// 	this.parentForm.controls.accEntryLockdown.setValue(this.selectedObject$.getValue().accountID);
		// }
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isRecoveryAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isLockDown = true;
		}
	}

	onRelieve(event) {
		this.listAclkId = [];
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isUpdateAccount = false;
			this.isLockDown = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isRecoveryAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRelieve = true;
			this.getAccountLockEntry();
		}
	}

	onUpdateLockdown(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateAccount = false;
			this.isCloseAccount = false;
			this.isRecoveryAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isUpdateLockDown = true;
			this.getAccountLockEntry();
		}
	}

	onCloseAccount(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isUpdateAccount = false;
			this.isRecoveryAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isCloseAccount = true;
		}
	}

	onRecoveryAccount(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isUpdateAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = true;
		}
	}

	onSettingInterest(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isRecoveryAccount = false;
			this.isUpdateAccount = false;
			this.isSettingWarning = false;
			this.isSettingInterest = true;
		}
	}

	onSettingWarning(event) {
		// this.checkDuplicate();
		if (event.target.checked == true) {
			this.parentForm.controls.startDate.setValue(this.today);
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isRecoveryAccount = false;
			this.isSettingInterest = false;
			this.isUpdateAccount = false;
			this.isSettingWarning = true;
		}
	}

	onChangeSettingRate(event) {
		if (event.toLowerCase() == ACCOUNT_RATE_METHOD_LEVEL.toLowerCase()) {
			this.parentForm.controls.balance.clearValidators();
			this.isLevel = true;
		} else if (event.toLowerCase() == ACCOUNT_RATE_METHOD_BAND.toLowerCase()) {
			this.parentForm.controls.balance.setValidators(Validators.required);
			this.isLevel = false;
		}
		this.parentForm.controls.balance.updateValueAndValidity();
	}

	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	get isLockdownValid() {
		return (this.parentForm && this.parentForm.controls.fromDate.valid
			&& this.parentForm.controls.toDate.valid
			&& this.parentForm.controls.lockDownMoney.valid
			&& this.parentForm.controls.reasonLock.valid);
	}

	// get isEditLockdownValid() {
	// 	return (this.parentForm.controls.editLockdownFromDate.valid
	// 		&& this.parentForm.controls.editLockdownToDate.valid
	// 		&& this.parentForm.controls.editLockdownAmount.valid
	// 		);
	// }

	get isCloseAccValid() {
		const formControlNames = ['bankReceive', 'accountOwnerNumber', 'accountOwner', 'feeAmtReq', 'feeCode', 'accNumberGetBal'];
		for (let i = 0; i < formControlNames.length; i++) {
			if(this.parentForm.controls[formControlNames[i]].invalid){
				return false;
			}
		}
		return true;
	}

	get isRecoveryAccValid() {
		return this.parentForm && this.parentForm.controls.accNumberClosed.valid;
	}

	get isSettingRateValidBand() {
		// console.log(this.parentForm.controls.balance.validator, ':balance validator');
		// console.log(this.parentForm.controls.balance.valid, ' :balance valid');
		return (this.parentForm && this.parentForm.controls.rateBasis.valid
			&& this.parentForm.controls.applyDate.valid
			&& this.parentForm.controls.typeBalanceRate.valid
			&& this.parentForm.controls.rateMethod.valid
			&& this.parentForm.controls.keyRate.valid
			&& this.parentForm.controls.fixRate.valid
			&& this.parentForm.controls.balance.valid);
	}

	get isSettingWaringValid() {
		// return (this.parentForm.controls.startDate.valid
		// 	&& this.parentForm.controls.endDate.valid
		// 	&& this.parentForm.controls.restrictType.valid
		// 	&& this.parentForm.controls.restricted.valid
		// 	&& this.parentForm.controls.branchEx.valid
		// 	&& this.parentForm.controls.userEx.valid
		// 	&& this.parentForm.controls.informBranch.valid
		// 	&& this.parentForm.controls.content.valid);

		return this.parentForm && this.parentForm.controls.informBranchs.valid;
	}

	toggleAnotherInf() {
		this.isAnotherInfo = !this.isAnotherInfo;
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

	resetForm() {
		this.parentForm.reset();
	}

	removeRecord() {
		this.commonService.isNotifyHasCancel$.next(true);
		let modalRef = this.modalService.open(ModalNotification, {
			size: 'lg',
			windowClass: 'notificationDialog',
		});
		modalRef.componentInstance.textNotify = 'Bạn có chắc chắn muốn xóa bản ghi này?';
		modalRef.result.then(res => {
			if (res == true) {
				this.changeStatusToDeleted();
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
		transaction.authenType = AU_THEN_TYPE.ACCOUNT.DELETE;
		transaction.data = {
			id: this.dataCacheRouter.id,
			// reasonReject: this.parentForm.controls.auditInfoForm.get('reason').value.trim()
		};

		let bodyDeleteReq = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		console.log('BASE DELETE ACCOUNT BODY REQUEST ===============>> ', bodyDeleteReq);

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

	onReject() {

		this.isRejecting$.next(true);

		if (!this.dataCacheRouter || !this.dataCacheRouter.id) {
			this.isRejecting$.next(false);
			return;
		}

		let transaction = new TransactionModel();
		transaction.authenType = AU_THEN_TYPE.ACCOUNT.REJECT;
		transaction.data = {
			id: this.dataCacheRouter.id,
			authoriser: this.username,
			reasonReject: this.parentForm.controls.auditInfoForm.value.reason
				? this.parentForm.controls.auditInfoForm.value.reason : null,
			timeRejected: moment(new Date()).format(LOCAL_DATE_TIME)
		};

		let bodyDeleteReq = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		console.log('BASE REJECT ACCOUNT BODY REQUEST ===============>> ', bodyDeleteReq);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyDeleteReq)
			.pipe(finalize(() => this.isRejecting$.next(false)))
			.subscribe(res => {

				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Bản ghi ${transaction.data.id} từ chối thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVE_CANCEL, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
					this.router.navigate(['/pages/dashboard']);

				} else {
					return;
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
				this.onReject();
				this.modalService.dismissAll();
				this.isRejecting$.next(true);
			}
		});
	}

	convertAccountEntry(values: any[]) {
		if (values.length < 1) {
			return;
		}
		return values.map(value => value.trim()).join(';');
	}

	approveAccount() {
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
		transaction.authenType = AU_THEN_TYPE.ACCOUNT.APPROVE;
		transaction.data = {
			id: this.dataCacheRouter.id,
			authoriser: this.username,
			inputter: this.dataCacheRouter.inputter,
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
					this.commonService.success(`Bản ghi ${_this.dataCacheRouter.id} duyệt thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVED, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
					this.router.navigate(['/pages/dashboard']);

				} else {
					this.commonService.error(`Bản ghi ${_this.dataCacheRouter.id} duyệt không thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVED_ERROR, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.ACCOUNT);
					this.router.navigate(['/pages/dashboard']);
				}
			});
	}

	// sortColumnAccountInfo(property: string) {
	// 	this.isIncreShow = !this.isIncreShow;
	// 	this.columnValue = property;
	//
	// 	const arr = this.accountInfo$.getValue();
	//
	// 	this.accountInfos = arr.sort((previousTransaction, nextTransaction) => {
	// 		let firstItem;
	// 		let secondItem;
	//
	// 		firstItem = removeUTF8(previousTransaction[property]);
	// 		secondItem = removeUTF8(nextTransaction[property]);
	//
	// 		if (this.isIncreShow === true) {
	// 			return (((firstItem ? firstItem : '').toUpperCase().toUpperCase()) > (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;
	//
	// 		} else {
	// 			return ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() > (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;
	// 		}
	// 	});
	// }

	fromToDate(fromDateField: string, toDateField: string, errorName: string = 'fromToDate'): ValidatorFn {
		return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
			const fromDate = formGroup.get(fromDateField).value;
			const toDate = formGroup.get(toDateField).value;
			// Ausing the fromDate and toDate are numbers. In not convert them first after null check
			if ((fromDate !== null && toDate !== null) && fromDate > toDate) {
				return {[errorName]: true};
			}
			return null;
		};
	}

	checkedData(value: string, datas: string[]) {
		return datas.includes(value.trim());
	}

	//Branch
	//Branch
	// get branchExs(): FormArray {
	// 	return this.parentForm.get('branchExs') as FormArray
	// }

	// addBranch() {
	// 	this.branchExs.push(this.newBranch())
	// }
	//
	// // removeBranch(i: number) {
	// 	this.branchExs.removeAt(i);
	// // }

	addDateExcept() {
		this.getDateExcept.push(this.newBranch());
	}

	removeDateExcept(i: number) {
		this.getDateExcept.removeAt(i);
	}

	get getDateExcept(): FormArray {
		return this.parentForm && this.parentForm.get('dateExcept') as FormArray;
	}

	newBranch(branch?: any): FormGroup {
		return this.fb.group({
			branchEx: [branch ? branch : null]
		});
	}

	//User
	get userExs(): FormArray {
		return this.parentForm && this.parentForm.get('userExs') as FormArray;
	}

	addUser() {
		this.userExs.push(this.newUser());
	}

	removeUser(i: number) {
		this.userExs.removeAt(i);
	}

	newUser(user?: any): FormGroup {
		return this.fb.group({
			userEx: [user ? user : null]
		});
	}

	dateExcept(dateExcept?: any): FormGroup {
		return this.fb.group({
			dateExcept: [dateExcept ? parseDateFrmStr(dateExcept) : null]
		});
	}

	//Noti Branch
	get informBranchs(): FormArray {
		return this.parentForm && this.parentForm.get('informBranchs') as FormArray;
	}

	addInformBranch() {
		this.informBranchs.push(this.newInformBranch());
	}

	removeInformBranch(i: number) {
		this.informBranchs.removeAt(i);
	}

	newInformBranch(informBranch?: any): FormGroup {
		return this.fb.group({
			coCode: [(informBranch && informBranch.coCode) ? informBranch.coCode : '', Validators.required],
			content: [(informBranch && informBranch.content) ? informBranch.content : '']
		});
	}

	//Other Info
	get otherInfos(): FormArray {
		return this.parentForm && this.parentForm.get('otherInfos') as FormArray;
	}

	addInfo() {
		this.otherInfos.push(this.newInfo());
	}

	removeInfo(i: number) {
		this.otherInfos.removeAt(i);
	}

	newInfo(info?: any): FormGroup {

		return this.fb.group({
			fromTime: [(info && info.fromTime) ? this.getTimeValue(info.fromTime) : ''],
			toTime: [(info && info.toTime) ? this.getTimeValue(info.toTime) : ''],
			allowDate: [(info && info.allowDate) ? info.allowDate : null],
		});
	}


	getTimeValue(src: string) {
		if (src.length != 8) {
			return {
				hour: 0,
				minute: 0,
				second: 0
			};
		}
		const hour = Number(src.slice(0, 2));
		const minute = Number(src.slice(3, 5));
		const second = Number(src.slice(6));
		return {
			hour: hour,
			minute: minute,
			second: second
		};
	}

	mapTimeValue(src: any): string {
		const hour = (src.hour < 10) ? `0${src.hour}` : `${src.hour}`;
		const minute = (src.minute < 10) ? `0${src.minute}` : `${src.minute}`;
		const second = (src.second < 10) ? `0${src.second}` : `${src.second}`;
		return `${hour}:${minute}:${second}`;
	}

	/**
	 * Hàm này mapping nội dung phong tỏa tài khoản cho api in biểu mẫu
	 * isUnblockAllBalance == true nếu tổng số dư tài khoản == số tiền phong tỏa và ngược lại
	 */
	mappingLockDownAccountReport() {
		let lockDownMoney = this.frm.lockDownMoney.value;
		const fromDate = this.frm.fromDate.value;
		const toDate = this.frm.toDate.value;

		// @ts-ignore
		let lockDownReason = this.lockDownReason._projectedViews ? this.lockDownReason._projectedViews[0].context.label : '';
		let soTienPhongToa = this.frm.lockDownMoney.value;
		let tongSoDu = this.selectedObject$.getValue().onlineBal.replaceAll(',', '').trim();

		return this.isLockDown ? {
			amount: lockDownMoney ? lockDownMoney : null,
			amountStr: lockDownMoney ? this.commonService.amountToVietNamese(lockDownMoney) : null,
			isblockAllBalance: (Number(soTienPhongToa) == Number(tongSoDu)),
			otherRequest: '',
			reason: this.frm.reasonLock.value ? lockDownReason : null,
			startDate: fromDate ? moment(fromDate).format('DD/MM/YYYY') : null,
			thoiHan: toDate ? moment(toDate).format('DD/MM/YYYY') : null,
			requestDate: moment(new Date()).format('DD/MM/YYYY HH:mm:ss')
		} : null;
	}

	/**
	 * Hàm này mapping các bút toán giải tỏa của tài khoản
	 * isUnblockAllBalance == true nếu tổng số dư tài khoản == số tiền đã phong tỏa của bút toán và ngược lại
	 */
	mappingUnLockDownAccountReport(): any[] {
		let tongSoDu = this.selectedObject$.getValue().onlineBal.replaceAll(',', '').trim();
		const unLockDownAccounts = this.listButToanPhongToa.map(i => {
			return {
				amount: i.lockedAmount ? i.lockedAmount.trim() : '',
				amountStr: i.lockedAmount ? this.commonService.amountToVietNamese(i.lockedAmount.trim()) : '',
				isUnblockAllBalance: (Number(i.lockedAmount) == Number(tongSoDu)),
				endDate: moment(new Date()).format('DD/MM/YYYY'),
				requestDate: moment(new Date()).format('DD/MM/YYYY HH:mm:ss')
			};
		});

		return unLockDownAccounts;
	}

	convertNgayCap(){
			if(this.customerInfo.legalIssDate && this.customerInfo.legalIssDate.length > 0){
				let legalIssDates = this.customerInfo.legalIssDate.split("#").map(date => formartDateYYYYMMDD(date));

				return legalIssDates[0];
				// return legalIssDates.join(";");
			}
			return null;
	};
	convertNgayCap2(){
		if(this.customerInfo.legalIssDate && this.customerInfo.legalIssDate.length > 0){
			let legalIssDates = this.customerInfo.legalIssDate.split("#").map(date => formartDateYYYYMMDD(date));

			return legalIssDates.join(";");
		}
		return null;
}

	/**
	 * Hàm này map thông tin chung tài khoản được chọn lên biểu mẫu
	 * sử dụng hàm amountToVietNamese() common service để convert số tiền number ra chuỗi số tiền = chữ
	 */
	mappingAccountInfoReport() {
		let accountInfoT24 = this.selectedObject$.getValue();

		if (!accountInfoT24) {
			return null;
		}

		const totalBalance = accountInfoT24.onlineBal ? accountInfoT24.onlineBal.trim().replaceAll(',', '') : null;
		const totalBalanceString = totalBalance ? this.commonService.amountToVietNamese(parseInt(totalBalance, 10).toString()) : null;

		return {
			accountNumber: accountInfoT24.legacy,
			adress: this.customerInfo.permanentAddress.replaceAll('#',' ') + ", " + this.district + ", " + this.city,
			// adress: this.customerInfo.address ? this.customerInfo.address.replaceAll('#', '') : '',
			availBal: totalBalance ? totalBalance.trim() : null,
			availBalStr: totalBalanceString,
			customerName: this.customerInfo.shortName ? this.customerInfo.shortName : null,
			gttt: this.customerInfo.legalID ? this.customerInfo.legalID.replaceAll('#', '; ') : '',
			// homePhone: this.customerInfo.phone ? this.customerInfo.phone: null,
			mobilePhone: this.customerInfo.sms ? this.customerInfo.sms.replaceAll('#', '; ') : null,
			ngayCap: this.convertNgayCap2(),
			noiCap: this.customerInfo.legalIssAuth ? this.customerInfo.legalIssAuth.replaceAll('#', '; ') : '',
			organPhone: null
		};
	}

	mappingClosedAccount() {
		const loaiHinhNhanSoDu = this.frm.typeOfGetBalance.value;

		const isLoaiHinh_TKTT = (loaiHinhNhanSoDu == 'TKTT_SEABANK') || (loaiHinhNhanSoDu == 'TKTT_NOT_SEABANK');
		const isTKTT_InSeABank = loaiHinhNhanSoDu == 'TKTT_SEABANK';
		const isLoaiHinhTIenMat = loaiHinhNhanSoDu == 'TIEN_MAT';

		return {
			cashReceiveInfo: isLoaiHinhTIenMat ?{
				gttt: this.customerInfo.legalID ? this.customerInfo.legalID.split('#')[0] : '',
				ngayCap: this.convertNgayCap(),
				noiCap: this.customerInfo.legalIssAuth ? this.customerInfo.legalIssAuth.split('#')[0] : '',
				receivedName: this.customerInfo.shortName ? this.customerInfo.shortName : null,
			}: null,


			fundTransferInfo: isLoaiHinh_TKTT ? {
				accountName:  isTKTT_InSeABank? this.frm.accountOwnerName.value:  this.frm.accountOwner.value,
				accountNumber: isTKTT_InSeABank?  this.frm.accNumberGetBal.value:  this.frm.accountOwnerNumber.value,
				bankName: isTKTT_InSeABank ? 'NGAN HANG THUONG MAI CO PHAN DONG NAM A (SEABANK)': this.frm.bankReceive.value
			}: null,

			closeTime: moment(new Date()).format('DD/MM/YYYY HH:mm:ss'),
			isFundTransfer: isLoaiHinh_TKTT
		};
	}


	get isLoadingTooltipReportButton(): boolean {
		return this.customerInfo == null;
	}

	isSubmittingReport$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	getReportId() {
		this.isSubmit = true;

		if (!this.isLockDown && !this.isCloseAccount && !this.isRelieve) {
			return;
		}

		if(this.isCloseAccount && !this.isCloseAccValid){
			return;
		}

		if(this.isLockDown && !this.isLockdownValid){
			return;
		}

		if (this.customerInfo) {
			const currentBranch = this.parentForm.controls.auditInfoForm.value.coCode;
			const branch = this.localStorage.retrieve(LIST_GROUP_WITH_NAME) ? this.localStorage.retrieve(LIST_GROUP_WITH_NAME).find(ele => ele.group_id == currentBranch) : null;
			this.isSubmittingReport$.next(true);
			let body: FormPDF = new FormPDF();
			body.command = 'GET_REPORT';
			body.report = {
				authenType: 'getRequest_SEATELLER_YEU_CAU_DV_TAI_KHOAN',
				exportType: 'PDF',
				transactionId: this.frm.transactionForm.value.transId,
				custId: '',
				branch: branch ? branch.desc : currentBranch,
				printDate: moment(new Date()).format('DD/MM/YYYY HH:mm:ss'),
				saveToMinio: true,
				actionAccount: {
					blockAccount: this.isLockDown,
					closeAccount: this.isCloseAccount,
					unblockAccount: this.isRelieve
				},

				accountInfo: this.mappingAccountInfoReport(),
				blockAccount: this.isLockDown ? this.mappingLockDownAccountReport() : null,
				closeAccount: this.isCloseAccount ? this.mappingClosedAccount() : null,
				unblockAccounts: this.isRelieve ? this.mappingUnLockDownAccountReport() : null
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
					}
				});
		}
	}

	getCustomerInfo() {
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = this.frm.transactionForm.value.customerId;
		if (this.commonService.changeCustomerGTTT$.getValue()) {
			bodyConfig.enquiry.customerID = this.commonService.customerId$.getValue();
		}
		console.log('customerID:' + bodyConfig.enquiry.customerID);


		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.customerInfo = res.enquiry;
					if (this.customerInfo && this.customerInfo.province) {
						this.getDistrict(this.customerInfo.province);
					}
					this.getDistrict(this.customerInfo.province); //list quận huyện
					this.city = this.cityList.find(city=> city.cityID == this.customerInfo.province).cityName;
					if (this.customerInfo && this.customerInfo.seabOwnerBen == '1.DONG SO HUU' && this.customerInfo.seabOwnCust) {
						bodyConfig.enquiry.customerID = this.customerInfo.seabOwnCust;
						this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
							.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
							.subscribe(res => {
								this.ownerBen = res.enquiry;
							});
					}
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

	getDistrict(province?) {
		// console.log('provineID', province);
		let command = GET_ENQUIRY;
		let enquiry: {};
		enquiry = {
			authenType: 'getDISTRICTS',
			cityID: province ? province : this.frm.province.value
		};
		this.isLoadingDistrict$.next(true);
		this.districtList = [];
		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.commonService.actionGetEnquiryUtility(bodyRequest)
		.pipe(finalize(() => this.isLoadingDistrict$.next(false)))
		.pipe(finalize(() => this.district = this.districtList.find(dist => dist.districID == this.customerInfo.seabDistrict1).name_gb))
			.subscribe(r => {
				if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
					this.districtList = r.enquiry.district;
					// console.log(this.districtList, 'getDISTRICTS');
				} else {
					this.districtList = []
				}
			});
	}

	changeCheckBox() {

		if (this.isUpdateAccount) {
			this.isLockDown = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = false;
		}

		if (this.isLockDown) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = false;
		}

		if (this.isRelieve) {
			this.isUpdateAccount = false;
			this.isLockDown = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = false;
		}

		if (this.isCloseAccount) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isLockDown = false;
			this.isUpdateLockDown = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = false;
		}

		if (this.isUpdateLockDown) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isLockDown = false;
			this.isCloseAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = false;
		}

		if (this.isSettingInterest) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isLockDown = false;
			this.isSettingWarning = false;
			this.isRecoveryAccount = false;
		}

		if (this.isSettingWarning) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isSettingInterest = false;
			this.isLockDown = false;
			this.isRecoveryAccount = false;
		}

		if (this.isRecoveryAccount) {
			this.isUpdateAccount = false;
			this.isRelieve = false;
			this.isUpdateLockDown = false;
			this.isCloseAccount = false;
			this.isSettingInterest = false;
			this.isSettingWarning = false;
			this.isLockDown = false;
		}
	}

	closeAllCheckBoxAccount() {
		this.isUpdateAccount = false;
		this.isRelieve = false;
		this.isUpdateLockDown = false;
		this.isCloseAccount = false;
		this.isSettingInterest = false;
		this.isSettingWarning = false;
		this.isLockDown = false;
		this.isRecoveryAccount = false;
	}

	changeFeeCodeInCloseAccount(event: any) {
		console.log('event', event);
		this.frm.feeAmtReq.setValue(null);
		this.currency = event.currency;
		if (event.flatAmt) {
			this.frm.feeAmtReq.setValue(event.flatAmt);
		}
	}

	getReasonBlocks(): void {
		const cache = this.localStorage.retrieve(UTILITY.ACC_BLOCK_TEXT.ACC_BLOCK_TEXT_CACHE);
		if (cache) {
			this.reasonBlocks$.next(cache);
			return;
		}
		this.utilityService.getSeabAcBlock()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.hasOwnProperty('utilitySeabAcBlockText')) {
					const reasons: ReasonBLockModel[] = res.body.enquiry.utilitySeabAcBlockText;
					if (reasons.length) {
						this.reasonBlocks$.next(reasons);
						this.localStorage.store(UTILITY.ACC_BLOCK_TEXT.ACC_BLOCK_TEXT_CACHE, reasons);
					}
				}
			});
	}

	checkApproveStatus(stateData) {
		if (stateData.status == 'APPROVED_ERROR') {
			let code = '';
			let value = '';
			switch (stateData.actionT24) {
				case UPDATE_ACCOUNT_INFO:
					code = 'updateAccInfo';
					value = 'Cập nhật thông tin';
					break;
				case ACCOUNT_LOCK:
					code = 'lockAcc';
					value = 'Phong toả tài khoản';
					break;
				case UNLOCK_DOWN_ACCOUNT:
					code = 'unlockDownAcc';
					value = 'Giải toả';
					break;
				case EDIT_LOCK_DOWN_ACCOUNT:
					code = 'editLockDownAcc';
					value = 'Chỉnh sửa phong toả tài khoản';
					break;
				case CLOSE_ACCOUNT:
					code = 'accLockDown';
					value = 'Đóng tài khoản';
					break;
				case ACCOUNT_RESTORE:
					code = 'accRestore';
					value = 'Khôi phục tài khoản đã đóng';
					break;
				case ACCOUNT_SETUP_INTEREST:
					code = 'accSetupInterest';
					value = 'Cài đặt lãi suất có ghi cho tài khoản';
					break;
				case ACCOUNT_SETUP_WARNING:
					code = 'accSetupWarning';
					value = 'Cài đặt cảnh báo, hạn chế ghi nợ/ có tài khoản';
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

	getClosedAccInfo() {
		this.isLoadingClosedAccount$.next(true);
		const custId = this.commonService.isUpdateAccount$.getValue()
			? this.dataCacheRouter.customerId
			: this.commonService.customerId$.getValue();
		let body: any = {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getClosedAccInfo',
				customerId: custId
			}
		};
		this.commonService.getClosedAccInfo(body, false)
			.pipe(finalize(() => this.isLoadingClosedAccount$.next(false)))
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.closedAccount = res.body.enquiry.custClosed;
					console.log('this.closedAccount', this.closedAccount);
				} else {
					this.closedAccount = [];
					return;
				}
			});
	}

	checkValidFeeAcc(accountNumber: string): void {
		this.frm.accNumberGetBal.setErrors(null);
		this.accountNameReceiveBalance$.next(null);
		if (accountNumber) {
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
						if (res.body.enquiry.category == '10001') {
							this.accountNameReceiveBalance$.next('Tài khoản quỹ tại quầy giao dịch');
						} else {
							const accName = res.body.enquiry.accountTitle ? res.body.enquiry.accountTitle : res.body.enquiry.shortTitle;
							this.accountNameReceiveBalance$.next(accName);
						}

					} else {
						this.frm.accNumberGetBal.setErrors({notExist: true});
						this.frm.accNumberGetBal.markAsTouched();
					}
				});
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataCacheRouter && !changes.dataCacheRouter.isFirstChange()) {
			if (changes.hasOwnProperty('dataCacheRouter')) {
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

	checkString(event) {
		console.log('event', event.target.value);
		if (event) {
			if (this.parentForm.get('applyDate').hasError('maxError')) {
				this.parentForm.get('applyDate').setErrors(null);
			}
			if (event.target.value > 100) {
				this.parentForm.get('applyDate').setErrors({maxError: true});
				this.parentForm.get('applyDate').markAsTouched();
			}
		}
	}


	/**
	 * Hàm này tính tổng số tiền thu phí, số tiền phí và VAT
	 * VAT giai đoan này fix cứng 10% -> BA confirmed
	 * VAT trên T24 đang tự động là tròn, nên client cũng sử dụng Match.round để tự động làm tròn
	 * if(taxCode = null of = 99 -> VAT = 0; else VAT = 10%)
	 * @param feeAmount -> số tiền phí/ mã phí
	 * @param action -> phần thẻ có nhiều action có thu phí, biến này nhận các action khác nhau và set giá trị từng action trong switch case
	 * @param chargeCodeObj
	 */
	calculateTotalAmount( feeAmount: any, action: string, chargeCodeObj?: any){

		if(!chargeCodeObj){
			const formControlNames = ['feeAmtReq', 'feeAmountClose', 'tax', ];
			this.resetFormValueByFormControlName(formControlNames);
		}

		if(feeAmount == null || feeAmount == '') {
			return;
		}

		const feeAmountConvertNumber = feeAmount.replace(/,/g, '');
		const tax = (Number(feeAmountConvertNumber) * Number(chargeCodeObj.vat)) /100;

		let totalAmount = Number(feeAmountConvertNumber) + Math.round(tax);

		switch (action){
			case 'CLOSE_ACCOUNT':
				this.frm.feeAmtReq.setValue(feeAmountConvertNumber);
				this.frm.feeAmountClose.setValue(totalAmount);
				this.frm.tax.setValue(Math.round(tax));
		}
	}

	/**
	 * Hàm này truy vấn thông tin của tài khoản thu phí -> phương thức thu phí là tiền mặt
	 * @param accountNumber
	 * @param action -> có thể dùng param này + switch.case để tái sử dụng ở các action khác
	 */
	checkGetFeeAccount(accountNumber: any, action: string): void {
		this.frm.accountOwnerName.setValue(null);

		if(!accountNumber){
			return;
		}

		const hinhThucThuPhi = this.frm.typeOfGetBalance.value;
		switch (action){
			case "CLOSE_ACCOUNT":
				const fundAccountValid = this.checkFundAccountValidCloseAccount(accountNumber, hinhThucThuPhi);

				if(!fundAccountValid){
					return;
				}
			}

			this.frm.accNumberGetBal.setErrors(null);
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					const isResponseOk = res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00;

					if(!isResponseOk){
						this.frm.accNumberGetBal.setErrors({notExist: true});
						this.frm.accNumberGetBal.markAsTouched();
						return;
					}

					const accountInfo = res.body.enquiry;
					const isTKTT_VND = accountInfo.category == '1001' && accountInfo.currency == 'VND';
					const isTaiKhoanQuyTaiQuay = this.frm.typeOfGetBalance.value == 'TIEN_MAT' && accountInfo.category == '10001';
					const isTKTTNgoaiSB = this.frm.typeOfGetBalance.value == 'TKTT_NOT_SEABANK'


					if (isTKTT_VND || isTaiKhoanQuyTaiQuay || isTKTTNgoaiSB) {
						switch (action) {
							case "CLOSE_ACCOUNT":

								// if (isTaiKhoanQuyTaiQuay) {
								// 	this.frm.accountOwnerName.setValue('Tài khoản quỹ tại quầy giao dịch');
								// } else if (isTKTT_VND || isTKTTNgoaiSB) {
									this.frm.accountOwnerName.setValue(accountInfo.accountTitle);
								// }
						}
					} else {
						this.frm.accNumberGetBal.setErrors({fundAccountInvalid: true});
						this.frm.accNumberGetBal.markAsTouched();
					}

				});

	}

	checkFundAccountValidCloseAccount(account: string, hinhThucThuPhi: string): boolean{
		switch (hinhThucThuPhi){
			case 'TIEN_MAT':
			case 'TKTT_NOT_SEABANK':

				const isHinhThucFTTienMat = this.frm.typeOfGetBalance.value == 'TIEN_MAT';
				if(isHinhThucFTTienMat && !account.startsWith('VND')){
					this.frm.accNumberGetBal.setErrors({fundAccountInvalid: true});
					return false;
				}

				const isHinhThucFTNgoaiSB = this.frm.typeOfGetBalance.value == 'TKTT_NOT_SEABANK';
				if(isHinhThucFTNgoaiSB && !account.startsWith('VND114260005')){
					this.frm.accNumberGetBal.setErrors({fundAccountInvalid: true});
					return false;
				}
				break;

			case 'TKTT_SEABANK':
				if(account.startsWith('VND')){
					this.frm.accNumberGetBal.setErrors({fundAccountInvalid: true});
					return false;
				}
				break;
		}

		return true;
	}

	checkHinhThucNhanSoDu(value: any) {
		this.frm.accNumberGetBal.reset();
		this.frm.accountOwnerName.reset();

		const formControlNames = ['bankReceive', 'accountOwnerNumber', 'accountOwner'];
		switch (value){
			case 'TKTT_NOT_SEABANK':
				this.addValidator(formControlNames);
				break;

			default: this.removeValidator(formControlNames);
		}
	}

	/**
	 * Hàm này sẽ xóa trắng các trường nhập liệu;
	 * @param fieldCloseAccount: mảng các fornm control name;
	 */
	resetFormValueByFormControlName(fieldCloseAccount: string[]){
		for(let i = 0; i < fieldCloseAccount.length; i ++){
			const currentFormControl = this.frm[fieldCloseAccount[i]];
			if(currentFormControl){
				currentFormControl.reset();
			}
		}
	}

	customSearchFee(term: string, item: any) {
		term = term.toLocaleLowerCase();
		return item.id.toLocaleLowerCase().indexOf(term) > -1 ||
			item.gbDescription.toLocaleLowerCase().indexOf(term) > -1 ||
			item.currency.toLocaleLowerCase().indexOf(term) > -1;
	}


	/**
	 * Hàm này addValidator cho màn hình tài khoản, theo mảng formControlName truyền vào
	 * @param formControlNames? -> mảng form control name
	 */
	addValidator(formControlNames: string[]) {
		for (let i = 0; i < formControlNames.length; i++) {
			const currentFormControl = this.frm[formControlNames[i]];
			if (currentFormControl) {
				currentFormControl.setValidators([Validators.required]);
				currentFormControl.updateValueAndValidity();
			}
		}
	}

	/**
	 * Hàm này xóa validator cho các ràng buộc required theo mảng formControlName truyền vào
	 *  @param formControlNames? -> mảng form control name
	 */
	removeValidator(formControlNames: string[]) {
		for (let i = 0; i < formControlNames.length; i++) {
			const currentFormControl = this.frm[formControlNames[i]];
			if (currentFormControl) {
				currentFormControl.clearValidators();
				currentFormControl.markAsUntouched();
				currentFormControl.updateValueAndValidity();
			}
		}
	}
}
