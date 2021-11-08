import {OpenAccountInfoComponent} from '../../open-account-info/open-account-info.component';
import {SmsServiceRegisterExCusComponent} from '../sms-service-register-ex-cus/sms-service-register-ex-cus.component';
import {EbankRegisterComponent} from '../../ebank-register/ebank-register.component';
import {
	HEADER_API_ACCOUNT, HEADER_EBANK, INSERT_UPDATE_SMS_EXISTED, NICE_ACCT_SO_DU, OWNER_BENEFIT,
	SERVER_API_CUST_INFO,
	SEVER_API_URL_E_BANK,
} from '../../../../../../../shared/util/constant';
import {Component, Input, OnDestroy, OnInit, ViewChild, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {BehaviorSubject, Subscription} from 'rxjs';
import {BodyRequestTransactionModel} from '../../../../../../model/body-request-transaction.model';
import {TransactionModel} from '../../../../../../model/transaction.model';
import {ComboModel} from '../../../../../../model/combo.model';
import {EbankModel} from '../../../../../../model/ebank.model';
import {SmsModel} from '../../../../../../model/sms.model';
import {AccountModel} from '../../../../../../model/account.model';
import {CustomerModel} from '../../customer-info/customer-model';
import {CommonService} from '../../../../../../common-service/common.service';
import {ApiConfig} from '../../../../../../../shared/model/constants/api-infomation-config';
import {finalize, map} from 'rxjs/operators';
import {AccountRequestDTO} from '../../../../../../../shared/model/constants/account-requestDTO';
import {EBankModel} from '../../../commons/models/EBankModel';
import {DataPowerService} from '../../../../../../../shared/services/dataPower.service';
import sms_fake from '../../combo-exCustomers/fake-database/sms-fake.json';
import {CustomerRequestDTO} from '../../../../../../../shared/model/constants/customer-requestDTO';
import {LocalStorageService} from 'ngx-webstorage';
import {formatDate2, parseDateFrmStr} from '../../../../../../../shared/util/date-format-ultils';
import {
	AUTHEN_TYPE_CREATE_COMBO,
	COMBO1_EX,
	COMMAND_TRANSACTION,
	LOCAL_DATE_TIME
} from '../../../../../../../shared/model/constants/common-constant';
import {ComboRequestModel} from '../../../commons/models/ComboRequestModel';
import {
	APPROVE,
	APPROVE_COMBO,
	CACHE_CO_CODE,
	CODE_00,
	CREATE,
	CREATE_COMBO,
	GET_TRANSACTION,
	NOTIFICATION,
	REJECT_COMBO,
	STATUS_OK,
	UPDATE_COMBO,
	USERNAME_CACHED
} from '../../../../../../../shared/util/constant';
import {getRandomTransId} from '../../../../../../../shared/util/random-number-ultils';
import moment from 'moment';
import {ModalDeleteComponent} from '../../../../../../../shared/directives/modal-common/modal-delete/modal-delete.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {WebsocketClientService} from '../../../../../../../shared/services/websocket-client.service';
import {SlaTimeService} from '../../../../../../../shared/services/sla-time.service';
import {ModalNotifyComponent} from '../../../../../../../shared/directives/modal-common/modal-notify/modal-notify.component';
import {FormatDatepicker} from '../../../../../../../shared/util/format-datepicker-dd-mm-yyyy';
import {FormPDF} from '../../formPDF';
import {CustomerInfoComponent} from '../../customer-info/customer-info.component';
import {ReportService} from '../../../../../../common-service/report.service';
import {DataLinkMinio} from '../../../../../../model/data-link-minio';
import {AppConfigService} from '../../../../../../../app-config.service';
import {CoreAiService} from '../../../identify-customer/service/core-ai.service';
import {GtttUrlModel} from '../../../../../../../shared/model/GtttUrl.model';
import {SignatureService} from '../../../identify-customer/service/signature.service';
import {BodyUdpateCustomerInfoModel, CustomerTemplateModel, FileUploadModel} from '../../../customer-manage/customer.model';
import {CustomerManageService} from '../../../customer-manage/customer-manage.service';
import {MAPPING_T24_FORMCONTROL_REQ_SEATELLER} from '../../../customer-manage/customer-manage.constant';
import {formartDateYYYYMMDD} from '../../../../../../../shared/util/Utils';

@Component({
	selector: 'kt-combo1-ex-customer',
	templateUrl: './combo1-ex-customer.component.html',
	styleUrls: ['./combo1-ex-customer.component.scss']
})
export class Combo1ExCustomerComponent implements OnInit, OnDestroy {
	// truy van giao dich
	@Input('viewData') viewData: any;
	@ViewChild(CustomerInfoComponent, {static: false})
	customerComponent: CustomerInfoComponent;
	@ViewChild(EbankRegisterComponent, {static: false})
	ebankRegisterComponent: EbankRegisterComponent;
	@ViewChild(SmsServiceRegisterExCusComponent, {static: false})
	smsRegisterComponent: SmsServiceRegisterExCusComponent;
	@ViewChild(OpenAccountInfoComponent, {static: false})
	accountComponent: OpenAccountInfoComponent;
	smsList = sms_fake;

	sms: SmsModel[] = [];
	ebank: EbankModel = new EbankModel();
	combo1: ComboModel = new ComboModel();
	customer: CustomerModel = new CustomerModel();
	account: AccountModel = new AccountModel();

	customerObject: any;

	auditInfo: any;
	generalInfo: any;
	comboInfo: any;
	eBankInfo$: BehaviorSubject<EBankModel> = new BehaviorSubject<EBankModel>(null);
	accountInfo$: BehaviorSubject<AccountModel[]> = new BehaviorSubject<AccountModel[]>([]);
	customerInfo$: BehaviorSubject<CustomerModel> = new BehaviorSubject<CustomerModel>(null);
	parentForm: FormGroup;
	// auditInfo: AuditInfo = new AuditInfo();

	transaction: TransactionModel = new TransactionModel();
	command: string;
	customerId: string;
	bodyRequest: BodyRequestTransactionModel;

	isLoadingDelete$ = new BehaviorSubject<boolean>(false)
	isLoadingEBankInfo$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	removeButton$: BehaviorSubject<boolean> = new BehaviorSubject(false);

	now = new Date();
	dataCacheRouter: any;
	today = new Date();
	timeNow = moment().format('DD/MM/YYYY HH:mm:ss');

	isSmsCheckbox: boolean;
	isCardCheckbox: boolean;
	isEBankCheckbox: boolean;
	isAccountCheckbox: boolean;
	isExCombo: boolean = true;
	isDisabledForm: boolean = true;

	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingRefresh$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	parentName: string;
	childOne: string;
	childTwo: string;
	newarray: any = [];
	listFax: any = [];
	listTax: any = [];
	username: any;
	idCusCombo: any;
	checkboxNumber: number;

	isExpiredPP: boolean = false;
	navigateSub: Subscription;
	isLoadingReport$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private fb: FormBuilder,
				private dataPowerService: DataPowerService,
				private toastService: ToastrService,
				private router: Router,
				private route: ActivatedRoute,
				private localStorage: LocalStorageService,
				public commonService: CommonService,
				private modalService: NgbModal,
				private websocketClientService: WebsocketClientService,
				private slaTimeService: SlaTimeService,
				private dateFormat: FormatDatepicker,
				private reportService: ReportService,
				private appConfigService: AppConfigService,
				private coreAiService: CoreAiService,
				private signatureService: SignatureService,
				private customerManageService: CustomerManageService) {

		this.parentName = 'Trang chủ';
		this.childOne = 'Mở combo';
		this.childTwo = 'Combo 1';
		this.parentForm = this.fb.group({
			inputter: [''],
			authoriser: [''],
			timeUpdate: [''],
			timeAuth: [''],
			coCode: [''],
			reason: [''],
			roomCode: [''],
		});

		/**
		 * Check quyền Input hoặc Authorise thông qua URL
		 */
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);
		// this.navigateSub = this.router.events.subscribe(event => {
		// 	if (event instanceof NavigationEnd) {
		// 		this.ngOnInit();
		// 	}
		// });
	}

	ngOnInit() {
		/*
		Bắt đầu thời gian tính SLA
		 */
		this.slaTimeService.startCalculateSlaTime();
		//

		this.commonService.isComboComponent$.next(true);
		this.commonService.isExCombo$.next(true);
		// Neu la viewData <=> Truy van giao dich
		if (this.viewData) {
			this.dataCacheRouter = this.viewData;
		} else {
			/**
			 * Hiển thị aside right
			 */
			this.commonService.isAsideRight$.next(true);
			this.commonService.isDisplayAsideRight$.next(true);
		}
		// Neu la xem lai ban ghi
		if (window.history.state.data) {
			this.dataCacheRouter = window.history.state.data;
		}

		// Neu la xem lai ban ghi
		if (this.dataCacheRouter) {
			console.log('window.history.state.data', this.dataCacheRouter);
			this.customerInfo$.next(this.dataCacheRouter.customer);

			let cardFront = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.cardFront);
			let cardBack = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.cardBack);
			let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.pictureFace);
			let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.fingerLeft);
			let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.fingerRight);

			let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
			this.signatureService.gtttUrlModel$.next(gtttModel);

			if (this.commonService.isUpdateCombo$.getValue()) {
				if (!this.dataCacheRouter.customer) {
					this.commonService.customerId$.next(this.dataCacheRouter.combo.customerId);
					this.customerId = this.dataCacheRouter.combo.customerId;
					// this.getCustomerInfo();
				}

				// fix
				this.customerId = this.dataCacheRouter.combo.customerId;
				if (this.dataCacheRouter.customer && this.dataCacheRouter.customer.id) {
					this.commonService.cusTransId$.next(this.dataCacheRouter.customer.id);
					// this.commonService.cusTransId$.next(this.dataCacheRouter.customer.id || this.dataCacheRouter.customer.customerId);


					// this.getCustomerInfo();
				} else {
					let username = this.localStorage.retrieve(USERNAME_CACHED);
					this.commonService.cusTransId$.next(getRandomTransId(username, 'customer'));
				}
				this.commonService.customerId$.next(this.customerId);
			}
			if (this.dataCacheRouter && this.dataCacheRouter.listFile) {
				this.filterFileFromApi(this.dataCacheRouter.listFile);
			}
			// TODO- call api cust cu, neu co hinh anh
			this.getImageUser(this.customerId, gtttModel);
			const similarity = this.dataCacheRouter.combo.similarityCoreAi;
			if (similarity) {
				this.signatureService.verifySignature$.next({
					similarity: similarity,
					value: null,
					confidence: null,
					signatures: []
				});
			}
			// Load error && thong tin t24 cu luu o redis
			if (this.dataCacheRouter.combo && this.dataCacheRouter.combo.id) {
				this.customerManageService.getCustomerInfoRedis(this.dataCacheRouter.combo.id)
					.subscribe(res => {
						if (res.seabRes.body.status == '00' && res.seabRes.body.enquiry.responseCode == CODE_00) {
							this.customerManageService.customerInfoT24$.next(res.seabRes.body.enquiry.product);
						}
					});
					if(this.dataCacheRouter.combo.status != "SAVED") {
						this.refreshError();
					}
			}

		} else if (window.history.state.customerId) { // Neu la di tu nhan dien vao
			console.log('Di tu nhan dien', window.history.state.customerId);
			this.dataCacheRouter = window.history.state.data;
			this.customerId = window.history.state.customerId;
			this.commonService.customerId$.next(window.history.state.customerId);
		} else {
			this.router.navigate(['/pages/identify']);
			const modalRef = this.modalService.open(ModalNotifyComponent, {
				centered: true,
				windowClass: 'notificationDialog',
				size: 'lg'
			});
			modalRef.componentInstance.content = 'Bạn phải nhận diện khách hàng trước';
			return;
		}


		/**
		 * Truy vấn thông tin Customer, EBank, Account, Sms
		 */
		if (this.customerId) {
			this.getEBankInfo();
			this.getAccountInfo();
			// combo cũ && không update combo || update combo && không update customer trong combo
			if (this.commonService.isExCombo$.getValue() && (!(this.commonService.isUpdateCombo$.getValue())
				|| (this.commonService.isUpdateCombo$.getValue()) && !this.dataCacheRouter.customer)) {
				this.getCustomerInfo();
			}
		}
		/**
		 * Lấy quyền truy cập của tài khoản
		 */
		this.checkRight();
		this.today.setDate(this.today.getDate());
		if (this.dataCacheRouter && this.dataCacheRouter.customer) {
			this.isDisabledForm = false;
		}
		let username = this.localStorage.retrieve(USERNAME_CACHED);
		if (this.inputtable$.getValue()) {
			this.parentForm.controls.inputter.setValue(username);
			this.parentForm.controls.timeUpdate.setValue(formatDate2(this.now.toISOString()));
		}

		this.parentForm.controls.coCode.setValue(this.localStorage.retrieve(CACHE_CO_CODE));
		this.parentForm.controls.roomCode.setValue('1234');

		let transaction: TransactionModel = {
			authenType: AUTHEN_TYPE_CREATE_COMBO,
			data: new ComboRequestModel()
		};
		this.bodyRequest = new BodyRequestTransactionModel(COMMAND_TRANSACTION, transaction);
	}

	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	getEBankInfo() {
		this.isLoadingEBankInfo$.next(true);
		let bodyConfig = ApiConfig.BODY.BODY_GET_EBANK;
		bodyConfig.enquiry.ebankId = this.customerId + '00';
		bodyConfig.enquiry.inputter = this.localStorage.retrieve('username');
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_E_BANK);
		const header = this.appConfigService.getConfigByKey(HEADER_EBANK);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(
				() => this.isLoadingEBankInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.eBankInfo$.next(res.enquiry);
					if (this.eBankInfo$.getValue()) {
						this.commonService.isShowEbank$.next(true);
						let ebank = this.eBankInfo$.getValue();
						// this.parentForm.controls.ebankRegisterForm.disable();
						this.ebankRegisterComponent.ebankRegisterForm.disable();
						this.ebankRegisterComponent.ebankRegisterForm.controls.ebankCheckbox.setValue(true);

						this.ebankRegisterComponent.ebankRegisterForm.controls['seaNetId'].setValue(ebank.customerId.concat('00'));
						this.ebankRegisterComponent.ebankRegisterForm.controls['serviceId'].setValue(ebank.serviceId);
						this.ebankRegisterComponent.ebankRegisterForm.controls['account'].setValue(ebank.mainCurrAcc);
						this.ebankRegisterComponent.ebankRegisterForm.controls['packageService'].setValue(ebank.servicePackage);
						this.ebankRegisterComponent.ebankRegisterForm.controls['promotionId'].setValue(ebank.promotionId.trim() != '' ? ebank.promotionId : '');
						this.ebankRegisterComponent.ebankRegisterForm.controls['passwordType'].setValue(ebank.authenticationType);
						this.ebankRegisterComponent.ebankRegisterForm.controls['limit'].setValue(ebank.transLimit);
						this.ebankRegisterComponent.ebankRegisterForm.controls['transSeANetPro'].setValue(ebank.transSeanetPro);
					}
					console.log('e-bank final response ------------->', this.eBankInfo$.getValue());
				} else {
					// this.commonService.error(res.error.desc)
					return;
				}
			});
	}

	getAccountInfo() {
		this.isLoadingAccountInfo$.next(true);
		let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
		bodyConfig.enquiry.customerID = this.customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingAccountInfo$.next(false)))
			.subscribe(res => {
				console.warn('>>> list acc info =======>', res);
				if (res) {
					const listAcct = res.enquiry.account || [];//.filter(acct => acct.category == '1001');
					this.accountInfo$.next(listAcct.filter(acct => acct.category == '1001'));
				} else {
					// this.commonService.error(res.error.desc)
					return;
				}
			});
	}

	getCustomerInfo() {
		// let customerId = this.parentForm.value.transactionForm.customerId || '13775074'
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = this.customerId;
		console.log('getCustomerInfo:' + this.customerId);
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.customerInfo$.next(res.enquiry);
					this.customerObject = res.enquiry;
					this.commonService.customerDataObject$.next(res.enquiry);
					this.localStorage.store('customerCombo', this.customerObject);
					this.commonService.getFilesByCustomerId(this.customerId);
					console.log(this.customerObject, 'customerObject');
					if (this.customerObject.fax1) {
						console.log(this.customerObject.fax1.length);
						if (this.customerObject.fax1.length > 0) {
							this.customerComponent.faxs.removeAt(0);
						}
						this.customerObject.fax1.split('#').forEach(element => {
							this.customerComponent.faxs.push(this.customerComponent.newFax(element));
						});
						// if(this.customerObject.fax1.length > 0) {
						// 	this.customerComponent.faxs.removeAt(0);
						// }
						let customerObjectfax1 = this.customerObject.fax1;
						console.log('customerObjectfax1', customerObjectfax1);
					}

					if (this.customerObject.taxID) {
						console.log(this.customerObject.taxID.length);
						if (this.customerObject.taxID.length > 0) {
							this.customerComponent.taxs.removeAt(0);
						}
						this.customerObject.taxID.split('#').forEach(element => {
							this.customerComponent.taxs.push(this.customerComponent.newTax(element));
						});

						// if(this.customerObject.taxID.length > 0) {
						// 	this.customerComponent.taxs.removeAt(0);
						// }

						let customerObjecttax = this.customerObject.taxID;
						console.log('customerObjecttax', customerObjecttax);

					}

				} else {
					return;
				}
			});
	}

	smsArr: any = [];

	buildRequest() {
		this.customer = this.customerComponent.customerForm ? this.customerComponent.customerForm.value : null;
		this.generalInfo = this.parentForm.controls.infoForm.value;
		this.account = this.parentForm.controls.accountInfoForm.value;
		this.sms = this.parentForm.controls.smsRegisterForm && this.parentForm.controls.smsRegisterForm.value.formArray;
		this.ebank = this.parentForm.controls.ebankForm.value;
		this.comboInfo = this.parentForm.controls.comboInfoForm.value;
		this.auditInfo = this.parentForm.controls.auditInfoForm.value;

		if (this.form.smsRegisterForm && this.form.smsRegisterForm.value.formArray) {
			console.log('this.form.smsRegisterForm.value.formArray', this.form.smsRegisterForm.value.formArray);
			const sms = [...this.form.smsRegisterForm.value.formArray];
			this.smsArr = sms.map(item => (
				{
					id: item.id,
					accountNumber: item.accountNumber == 'newTKTT' ? null : item.accountNumber,
					phoneNumber: item.phoneNumber,
					serviceId: item.serviceId,
					promotionId: item.promotionId,
					email: item.email,
				}
			));
		}


		this.isEBankCheckbox = this.parentForm.controls.ebankForm.value.ebankCheckbox;
		this.isAccountCheckbox = this.parentForm.controls.accountInfoForm.value.accountCheckbox;
		this.isSmsCheckbox = this.parentForm.controls.smsRegisterForm && this.parentForm.controls.smsRegisterForm.value.smsCheckbox;

		let filesUpload: any[] = [];

		this.signatureService.signatureFiles$.asObservable()
			.subscribe((res: FileUploadModel[]) => {
				if (res && res.length > 0) {
					if (res[0].fileData) {
						filesUpload = res;
						filesUpload = filesUpload.map(file => {
							return {
								customerId: '',
								fileData: file.fileData.split(',')[1],
								fileName: 'Don dang ky combo1',
								fileType: file.fileType,
								folder: '',
								id: '',
								isSignature: file.isSignature,
								note: '',
								transactionId: ''
							};
						});
					} else {
						filesUpload = [];
					}
				} else {
					filesUpload = [];
				}
			});


		let feeDate = this.account.dateFee ? moment(this.account.dateFee).format('DD-MM-YYYY') : null;

		let cardFront: string = null, cardBack: string = null, fingerLeft: string = null, fingerRight: string = null;
		const gtttUrlModel = this.signatureService.gtttUrlModel$.getValue();
		if (gtttUrlModel) {
			(gtttUrlModel.cardFront && gtttUrlModel.cardFront != 'assets/media/logos/nodata.png') && (cardFront = gtttUrlModel.cardFront);
			(gtttUrlModel.cardBack && gtttUrlModel.cardBack != 'assets/media/logos/nodata.png') && (cardBack = gtttUrlModel.cardBack);
			(gtttUrlModel.fingerLeft && gtttUrlModel.fingerLeft != 'assets/media/logos/nodata.png') && (fingerLeft = gtttUrlModel.fingerLeft);
			(gtttUrlModel.fingerRight && gtttUrlModel.fingerRight != 'assets/media/logos/nodata.png') && (fingerRight = gtttUrlModel.fingerRight);
		}

		const similarity = this.signatureService.verifySignature$.getValue() ? this.signatureService.verifySignature$.getValue().similarity : null;
		const customerEmail = (this.customer && this.customer.contactInfos && this.customer.contactInfos.length > 0) ? this.customer.contactInfos[0].email : null;
		return {
			inputter: this.auditInfo.inputter,
			customer: (!this.isDisabledForm) ? this.customerComponent.getExCustomerBodyRequest() : null,
			account: this.accountComponent.accountInfoForm.controls.accountCheckbox.value ? this.accountComponent.getAccountComboRequest() : null,
			// account: this.accountComponent.hasCreateAcc$.getValue() ? this.accountComponent.getAccountComboRequest() : null,


			sms: (this.isSmsCheckbox && this.sms.length > 0) ? {
				id: (this.dataCacheRouter && this.dataCacheRouter.sms) ? this.dataCacheRouter.sms.id : this.parentForm.controls.smsRegisterForm.value.idSms,
				customerId: this.commonService.customerId$.getValue(),
				priority: this.comboInfo.priority,
				actionT24: this.commonService.isExistedSmsForExCustomer$.getValue() == true ? INSERT_UPDATE_SMS_EXISTED : CREATE,
				smsDetail: this.smsArr
			} : null,
			ebank: (this.isEBankCheckbox && !this.eBankInfo$.getValue()) ? {
				id: (this.dataCacheRouter && this.dataCacheRouter.ebank) ? this.dataCacheRouter.ebank.id : getRandomTransId(this.username, 'ebank'),
				customerId: this.commonService.customerId$.getValue(),

				serviceId: this.ebank.serviceId,
				handyNumber: this.localStorage.retrieve('customerCombo').sms.split('#')[0],
				mainCurrAcc: (this.ebank.account == 'newTKTT') ? null : this.ebank.account,
				packageService: this.ebank.packageService,
				passwordType: this.ebank.passwordType,
				promotionId: this.ebank.promotionId,
				limit: this.ebank.limit,
				transSeANetPro: this.ebank.transSeANetPro,
				priority: this.comboInfo.priority,
				coreDate: this.commonService.timeT24$.getValue(),
				email: customerEmail,
				actionT24: CREATE
			} : null,
			combo: {
				id: (this.dataCacheRouter && this.dataCacheRouter.combo) ? this.dataCacheRouter.combo.id : this.comboInfo.transID,
				comboType: COMBO1_EX,
				actionT24: CREATE,

				accountid: (this.dataCacheRouter && this.dataCacheRouter.account) ? this.dataCacheRouter.account.id : null,
				customerId: this.commonService.customerId$.getValue(),

				priority: this.comboInfo.priority,
				campaignId: this.generalInfo.campaignId,
				saleType: this.generalInfo.saleType,
				saleId: this.generalInfo.saleId,
				brokerType: this.generalInfo.brokerType,
				brokerId: this.generalInfo.brokerId,
				departCode: this.auditInfo.roomCode,
				inputter: this.auditInfo.inputter,
				// authoriser: this.auditInfo.authoriser,
				coCode: this.auditInfo.coCode,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				cardFrontBase64: cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
				similarityCoreAi: similarity
			},
			listFile: (filesUpload && filesUpload.length > 0) ? filesUpload : [],
			score: this.dataCacheRouter && this.dataCacheRouter.score ? this.dataCacheRouter.score : null
		};
	}

	checkbox() {
		if (!this.isDisabledForm) {
			this.checkboxNumber++;
		}
		if (this.parentForm.controls.accountInfoForm && this.parentForm.controls.accountInfoForm.value.accountCheckbox) {
			this.checkboxNumber++;
		}

		if (this.parentForm.controls.smsRegisterForm && this.parentForm.controls.smsRegisterForm.value.smsCheckbox) {
			this.checkboxNumber++;
		}

		if (this.parentForm.controls.ebankForm && this.parentForm.controls.ebankForm.value.ebankCheckbox) {
			this.checkboxNumber++;
		}
	}

	onInputterSubmit() {
		this.checkboxNumber = 0;
		this.checkbox();
		if (this.checkboxNumber == 0) {
			this.commonService.error('Bạn chưa chọn mục nào để cập nhật');
			return;
		}

		if (this.smsRegisterComponent.duplicateText$.getValue()) {
			this.commonService.error('Tồn tại bản ghi Sms trùng lặp');
			return;
		}

		this.isExpiredPP = false;

		let listGTTT = [...this.newarray];
		if (this.customerComponent.customerForm.value.national && this.customerComponent.customerForm.value.national.includes('VN')) {
			let listPP = listGTTT.filter(item => item.idenType == 'PP');
			let listVisa = listGTTT.filter(item => item.idenType == 'VISA');

			if (listPP && listPP.length > 1) {
				this.commonService.error('Không được đăng ký 2 Pass Port cùng một thời điểm');
				return;
			}

			if (listVisa && listVisa.length > 1) {
				this.commonService.error('Không được đăng ký 2 Visa cùng một thời điểm');
				return;
			}
			console.log('ListPPPPPP', listPP);
			if ((listVisa && listVisa.length > 0 && listPP && listPP.length > 0) || (listVisa && listVisa.length > 0 && listPP.length == 0)) {
				listVisa.map((item) => {
					if (item.idenTimeExpired && parseDateFrmStr(item.idenTimeExpired) < this.today) {
						console.log('Ngày hết hạn thị thực', item.idenTimeExpired);
						this.commonService.error('Visa của bạn đã hết hạn, cần cập nhật ngày hết hạn thị thực');
						this.isExpiredPP = true;
						return;
					} else {
						this.isExpiredPP = false;
					}
				});
			} else if (listVisa.length == 0 && listPP && listPP.length > 0) {
				listPP.map((item) => {
					if (item.idenTimeExpired && parseDateFrmStr(item.idenTimeExpired) < this.today) {
						console.log('Ngày hết hạn thị thực', item.idenTimeExpired);
						this.commonService.error('Pass Port của bạn đã hết hạn, cần cập nhật ngày hết hạn thị thực');
						this.isExpiredPP = true;
						return;
					} else {
						this.isExpiredPP = false;
					}
				});
			}
			if (this.isExpiredPP) {
				return;
			}
		}

		/*
		Kết thúc thời gian tính SLA
		 */
		this.slaTimeService.endCalculateSlaTime();

		this.commonService.isRemovingCustomer$.next(true);
		this.commonService.isClickedButton$.next(true);

		if (this.isDisabledForm) {
			this.parentForm.removeControl('customerForm');
		}
		if (!this.isDisabledForm && (this.customerComponent.frm.stress.value.length + this.customerComponent.frm.town.value.length) > 69) {
			this.customerComponent.maxLengthAddress$.next('Độ dài trường Đường/Phố + Phường/Xã phải < 69 ký tự');
			this.customerComponent.inputStress.nativeElement.focus();
			return;
		} else {
			this.customerComponent.maxLengthAddress$.next(null);
		}

		if (this.accountComponent.accountInfoForm.controls.accountCheckbox.value && (this.accountComponent.accountInfoForm.controls.fatca1.value == null || this.accountComponent.accountInfoForm.controls.fatca2.value == null || this.accountComponent.accountInfoForm.controls.fatca3.value == null ||
			this.accountComponent.accountInfoForm.controls.fatca4.value == null || this.accountComponent.accountInfoForm.controls.fatca5.value == null || this.accountComponent.accountInfoForm.controls.fatca6.value == null || this.accountComponent.accountInfoForm.controls.fatca7.value == null)) {
			this.commonService.error('Vui lòng nhập đủ thông tin fatca!');
			return;
		}
		;

		if (this.parentForm.invalid) {
			console.log('this.parentForm.value', this.parentForm);
			this.parentForm.markAllAsTouched();
			window.scroll(0, 0);
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}

		if (this.isOpenSms && this.accountInfo$.getValue().length <= 0) {
			this.commonService.error('Bạn phải mở tài khoản thanh toán trước!');
			return;
		}

		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = (!this.dataCacheRouter || this.dataCacheRouter.score) ?  CREATE_COMBO : UPDATE_COMBO;
		if ((!this.isDisabledForm) && this.customerComponent.checkAge()) {
			this.commonService.error('Vui lòng xem lại các trường nhập liệu');
			return;
		}
		transaction.data = this.buildRequest();
		if (transaction.data.customer) {
			this.pushDataToRedis(this.customerObject, transaction.data.combo.id);
		}
		console.log('this.buildRequest()', transaction.data);
		this.isLoading$.next(true);

		let bodyRequestCombo = new BodyRequestTransactionModel(command, transaction);
		console.log('Body -------------> ', bodyRequestCombo);
		this.commonService.actionGetTransactionResponseApi(bodyRequestCombo)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK && r.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(this.dataCacheRouter && this.dataCacheRouter.combo.status != 'SAVED' ? `Cập nhật bản ghi ${this.parentForm.controls.comboInfoForm.value.transID} thành công` :
						`Gửi duyệt bản ghi ${this.parentForm.controls.comboInfoForm.value.transID} thành công`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.comboInfoForm.value.transID, NOTIFICATION.PRODUCT_TYPE.EX_COMBO1);
					this.router.navigate(['/pages/dashboard']);
				} else {
					this.commonService.error('Gửi duyệt lỗi');
				}
			});
	}

	onAuthoriserSubmit() {
		this.auditInfo = this.parentForm.controls.auditInfoForm.value;
		/*
		Kết thúc thời gian tính SLA Authoriser
		 */
		this.slaTimeService.endCalculateSlaTime();
		//

		if (!this.dataCacheRouter) {
			return;
		}

		this.isLoading$.next(true);
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = APPROVE_COMBO;
		transaction.data = {
			id: this.dataCacheRouter ? this.dataCacheRouter.combo.id : '',
			authoriser: this.localStorage.retrieve(USERNAME_CACHED),
			actionT24: APPROVE,
			timeAuth: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaAuthorise: this.slaTimeService.calculateSlaTimeAuth(this.dataCacheRouter)
		};
		let bodyRequestApprove = new BodyRequestTransactionModel(command, transaction);
		console.log('Body -------------> ', bodyRequestApprove);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyRequestApprove)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK && r.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success('Duyệt bản ghi Combo 1 thành công');
					this.removeButton$.next(true);
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.combo.inputter, NOTIFICATION.APPROVED_COMBO, _this.dataCacheRouter.combo.id, NOTIFICATION.PRODUCT_TYPE.EX_COMBO1);
					// this.router.navigate(['/pages/dashboard']);
				} else {
					this.commonService.error(r.desc);
				}
			});
	}

	get form() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	ngOnDestroy() {
		this.commonService.isShowEbank$.next(false);
		this.removeButton$.next(false);
		this.commonService.destroyError();
		this.commonService.maxLengthAddress$.next(false);
		this.isLoadingDelete$.next(false);
		this.commonService.accountNameGlobal$.next(null);
		this.commonService.isExCombo$.next(null);
		this.commonService.isComboComponent$.next(false);
		this.commonService.dataQA$.next(null);
		this.commonService.isClickedButton$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		this.commonService.isRemovingCustomer$.next(false);
		this.commonService.customerDataObject$.next(null);
		this.commonService.customerId$.next(null);
		this.slaTimeService.clearTimeSLA();
		this.commonService.isDisplayFile$.next(false);
		this.commonService.filesCombo$.next(null);
		this.commonService.filesUploadByUserId.next(null);
		if (this.navigateSub) {
			this.navigateSub.unsubscribe();
		}
		this.customerManageService.customerInfoT24$.next(null);
		this.customerManageService.listQA$.next([]);
	}

	/**
	 * Lấy trạng thái của tài khoản
	 */
	get isOpenAccount() {
		return this.parentForm.controls.accountInfoForm.value.accountCheckbox;
	}

	/**
	 * Lấy trạng thái của sms
	 */
	get isOpenSms() {
		return this.parentForm.controls.smsRegisterForm && this.parentForm.controls.smsRegisterForm.value.smsCheckbox;
	}

	/**
	 * Lấy trạng thái của EBank
	 */
	get isOpenEBank() {
		return this.parentForm.controls.ebankForm.value.ebankCheckbox;
	}

	/**
	 * Lấy trạng thái của Combo (nếu đã được duyệt)
	 */
	get APPROVED() {
		if (this.dataCacheRouter) {
			return this.dataCacheRouter.combo.status.startsWith(APPROVE);
		}
	}

	// removeForm() {
	// 	this.parentForm.reset();
	// }

	removeRecord() {
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = 'deleteCombo';
		transaction.data = {
			id: this.dataCacheRouter.combo.id
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		let modalRef = this.modalService.open(ModalDeleteComponent, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
			centered: true,
			windowClass: 'notificationDialog'
		});

		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn xóa!';
		modalRef.componentInstance.data = this.dataCacheRouter;
		modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
		modalRef.result.then(r => {
			if (r == true) {
				return;
			} else if (r == 'done') {
				this.commonService.success('Xóa combo 1 thành công');
			} else {
				this.commonService.error(r.desc);
			}
		});
	}

	rejectRecord() {
		if (!this.parentForm.controls.auditInfoForm.value.reason) {
			this.parentForm.get('auditInfoForm.reason').setErrors({required: true});
			this.parentForm.markAllAsTouched();
			return;
		}
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = REJECT_COMBO;
		transaction.data = {
			id: this.dataCacheRouter.combo.id,
			reasonReject: this.parentForm.controls.auditInfoForm.value.reason,
			authoriser: this.localStorage.retrieve(USERNAME_CACHED),
			timeRejected: moment(new Date()).format(LOCAL_DATE_TIME),
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		let modalRef = this.modalService.open(ModalDeleteComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
			centered: true
		});

		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn từ chối bản ghi!';
		modalRef.componentInstance.data = this.dataCacheRouter;
		modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
		modalRef.result.then(r => {
			if (r == true) {
				return;
			} else if (r == 'done') {
				this.toastService.success('Đã từ chối bản ghi');
			} else {
				this.toastService.error(r.desc);
			}
		});
	}

	disabledForm(value) {
		this.isDisabledForm = value;
	}

	removeValidators(form: FormGroup) {
		for (const key in form.controls) {
			form.get(key).clearValidators();
			form.get(key).updateValueAndValidity();
		}
	}

	addValidator(form: FormGroup) {
		const arr = ['customerName', 'cardName', 'birthday', 'placeOfBirth', 'maritalStatus', 'purpose',
			'national', 'residentStstus', 'occupation', 'stress', 'district', 'province', 'securityQues', 'answer', 'title', 'ownerBen',
			'employment', 'employerName', 'employerAddress', 'industryGroup', 'industry', 'industryClass'];
		for (const key in form.controls) {
			arr.forEach(r => {
				if (key == r) {
					form.get(key).setValidators([Validators.required]);
					form.get(key).updateValueAndValidity();
				}
			});
		}
	}

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	/**
	 * Get report
	 */
	getReportId() {

		if (this.accountComponent.accountInfoForm.controls.accountCheckbox.value && (this.accountComponent.accountInfoForm.controls.fatca1.value == null || this.accountComponent.accountInfoForm.controls.fatca2.value == null || this.accountComponent.accountInfoForm.controls.fatca3.value == null ||
			this.accountComponent.accountInfoForm.controls.fatca4.value == null || this.accountComponent.accountInfoForm.controls.fatca5.value == null || this.accountComponent.accountInfoForm.controls.fatca6.value == null || this.accountComponent.accountInfoForm.controls.fatca7.value == null)) {
			this.commonService.error('Vui lòng nhập đủ thông tin fatca!');
			return;
		}
		if (this.isDisabledForm) {
			this.parentForm.removeControl('customerForm');
		}

		if (this.parentForm.invalid) {
			console.warn('this.parentForm', this.parentForm);
			this.parentForm.markAllAsTouched();
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}

		this.isLoadingReport$.next(true);
		const customerInfo = this.frm.customerForm ? this.frm.customerForm.value : this.customerInfo$.getValue();
		const custInfoChange = this.frm.customerForm ? this.frm.customerForm.value : null;
		const rawCustomerInfo = this.customerManageService.customerInfoT24$.getValue();
		let accountInfo = this.frm.accountInfoForm.value;
		let seAnetInfo = this.frm.ebankForm.value;
		let smsInfo = this.frm.smsRegisterForm.value;

		// // @ts-ignore
		// let city = this.customerComponent.cityLabel._projectedViews[0].context.label;
		// // @ts-ignore
		// let district = this.customerComponent.districtLabel._projectedViews[0].context.label;
		// // @ts-ignore
		// let nationality = this.customerComponent.nationalLabel._projectedViews[0].context.label;
		// // @ts-ignore
		// let residenceCountry = this.customerComponent.residenceLabel._projectedViews[0].context.label;
		// // @ts-ignore
		// let job = this.customerComponent.jobLabel._projectedViews[0].context.label;

		console.log('this.customerInfo$.getValue()', customerInfo.legalIssDate);


		let body: FormPDF = new FormPDF();
		body.command = 'GET_REPORT';
		body.report = {
			authenType: 'getReport_SEATELLER_REGISTER',
			exportType: 'PDF',
			transactionId: this.frm.comboInfoForm.value.transID,
			customerInfo: {
				fullName: this.frm.customerForm ? customerInfo.customerName : customerInfo.shortName,
				gttt: this.frm.customerForm ? customerInfo.identification[0].gttt : customerInfo.legalID.split('#')[0],
				issueDate: this.frm.customerForm ? formartDateYYYYMMDD(customerInfo.identification[0].idenTime) : formartDateYYYYMMDD(customerInfo.legalIssDate.split('#')[0]),
				// issueDate: this.frm.customerForm ? moment(customerInfo.identification[0].idenTime).format('DD/MM/YYYY') : customerInfo.legalIssDate.split('#')[0],
				issuesAddress: this.frm.customerForm ? customerInfo.identification[0].organization : customerInfo.legalIssAuth.split('#')[0],
				mobilePhone: this.frm.customerForm ? customerInfo.contactInfos[0].mobile : customerInfo.sms,
				email: this.frm.customerForm ? customerInfo.contactInfos[0].email : customerInfo.email.split('#')[0],
				otherPhone: this.frm.customerForm ? customerInfo.contactInfos[0].phone : customerInfo.phone,
				seabID: this.frm.customerForm ? customerInfo.customerId : customerInfo.customerID
			},
			registerService: {
				isOtherTKKT: false,
				isSeaSave: false,
				isSelectAll: false,
				isSmsBanking: !!smsInfo.smsCheckbox,
				isTKKT: !!(accountInfo.accountCheckbox && seAnetInfo.ebankCheckbox),
				isUsdSeaSave: false,
				isUsdTKKT: false,
				isVndSeaSave: false,
				otherCurrency: null,
				otherSeaSave: null,
			},
			sameOwner: null,
			printDate: moment(new Date()).format('DD/MM/YYYY')
		};
		// TODO -- thay doi loai tien
		if (!!(accountInfo.accountCheckbox && seAnetInfo.ebankCheckbox)) {
			if (accountInfo.currency == 'VND') {
				body.report.registerService.isTKKT = true;
			} else if (accountInfo.currency == 'USD') {
				body.report.registerService.isTKKT = false;
				body.report.registerService.isOtherTKKT = true;
				body.report.registerService.isUsdTKKT = true;
			} else {
				body.report.registerService.isTKKT = false;
				body.report.registerService.isOtherTKKT = true;
				body.report.registerService.isUsdTKKT = false;
				body.report.registerService.otherCurrency = accountInfo.currency;
			}
		}

		if (customerInfo.ownerBen == '1.DONG SO HUU' && this.customerComponent.ownerBenData && this.customerComponent.ownerBenAccount) {
			let ownerBen = this.customerComponent.ownerBenData;
			let ownerAccount = this.customerComponent.ownerBenAccount;
			body.report.mainCustomer = {
				fullName: ownerBen.shortName,
				gender: ownerBen.gender,
				seabID: ownerAccount && ownerAccount.length > 0 ? (ownerAccount && ownerAccount.length > 0 ? ownerAccount[0].accountID : null) : null,

				// Nếu không có tài khoản tại SeABank
				birthDate: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.dateOfBirth,
				birthPlace: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.placeOfBirth,
				chucVu: '',
				cuaKhau: '',
				currentAddress: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.currentAddress,
				diaChiNN: '',
				diaChiVN: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.permanentAddress,
				email: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.email,
				fromDate: '',
				gttt: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.legalID,
				hoKhau: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.permanentAddress,
				isCuTru: false,
				isMarried: ownerAccount && ownerAccount.length > 0 ? '' : (ownerBen.maritalStatus == 'MARRIED' ? true : (ownerBen.maritalStatus == 'SINGLE' ? false : '')),
				isSameAddress: false,
				issueDate: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.legalIssDate,
				issuesAddress: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.legalIssAuth,
				job: '',
				mobilePhone: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.sms,
				nationality: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.nationality,
				ngayNhapCanh: '',
				otherAdd: '',
				otherMarried: '',
				otherNationality: '',
				otherPhone: '',
				otherPhuong: '',
				otherQuan: '',
				otherTinh: '',
				phuongXa: '',
				quanHuyen: ownerAccount && ownerAccount.length > 0 ? '' : (this.customerComponent.districtList2.find(c => Number(c.districID) == Number(ownerBen.seabDistrict1)).name_gb),
				relationship: '',
				school: '',
				soThiThuc: '',
				thuNhap: '',
				tinhTp: ownerAccount && ownerAccount.length > 0 ? '' : (this.customerComponent.cityList.find(c => Number(c.cityID) == Number(ownerBen.province)).name_gb),
				toDate: '',
			};
		}
		const tax = customerInfo.taxs;
		if (tax && tax.length > 0) {
			body.report.customerInfo.maSoThue = tax[0].taxId;
		}

		// bieu mau so dep
		if (accountInfo && accountInfo.accountCheckbox) {
			body.report.fatca = {
				question1: this.accountComponent.frm.fatca1.value,
				question2: this.accountComponent.frm.fatca2.value,
				question3: this.accountComponent.frm.fatca3.value,
				question4: this.accountComponent.frm.fatca4.value,
				question5: this.accountComponent.frm.fatca5.value,
				question6: this.accountComponent.frm.fatca6.value,
				question7: this.accountComponent.frm.fatca7.value
			};
			if (accountInfo.classNiceAccount != null) {
				console.warn('>>>>> accountInfo', accountInfo);
				const branch = this.commonService.getCurrentBranch();
				const bodyRequestNiceAcct = {
					// authenType: 'getRequest_SEATELLER_DK_TK_SO_DEP',
					transactionId: this.frm.comboInfoForm.value.transID,
					custId: this.frm.customerForm ? customerInfo.customerId : customerInfo.customerID,
					saveToMinio: false,
					exportType: 'PDF',
					branchName: branch ? branch.desc : '',
					fullName: this.frm.customerForm ? customerInfo.customerName : customerInfo.shortName,
					ngay: moment(new Date()).format('DD/MM/YYYY'),
					niceAcct: accountInfo.accountNumber,
					phi: this.commonService.formatCurrency(accountInfo.chargeInfoForm.totalFeeAmt),
					phiStr: this.commonService.amountToVietNamese(accountInfo.chargeInfoForm.totalFeeAmt),
					soDu: '',
					isCamKet: false
				};


				if (accountInfo.accountPolicy == 'DUY.TRI.SO.DU') {
					bodyRequestNiceAcct.soDu = this.commonService.formatCurrency(accountInfo.lockDownAmount);
					bodyRequestNiceAcct.isCamKet = true;
				} else if (accountInfo.accountPolicy == 'MIEN.PHI') {
					bodyRequestNiceAcct.phi = '0';
					bodyRequestNiceAcct.phiStr = 'Không đồng';
					bodyRequestNiceAcct.soDu = NICE_ACCT_SO_DU;
				} else {
					bodyRequestNiceAcct.soDu = NICE_ACCT_SO_DU;
				}
				body.report.niceAcct = bodyRequestNiceAcct;
			}
		}
		// Neu thay doi ca thong tin KH thi in them bieu mau KH
		if (custInfoChange) {
			body.report.customerTemplate = Object.assign(new CustomerTemplateModel(), {
				transactionId: this.frm.comboInfoForm.value.transID,
				actionCustomer: {
					updateInfo: true,
					updateOwnerInfo: false,
					other: null,
					changeSecurityQuestion: false
				},
				customerInfo: {
					customerID: rawCustomerInfo.customerId,
					gttt: rawCustomerInfo.identityPapers.map(iden => iden.gttt).join(';'),
					fullName: rawCustomerInfo.customerName,
					issueDate: rawCustomerInfo.identityPapers.map(iden => formartDateYYYYMMDD(iden.idenTime)).join(';'),
					issuesAddress: rawCustomerInfo.identityPapers.map(iden => iden.idenAdress).join(';'),
				}
			});
			const dirtyForms = this.customerComponent.checkDirtyForms();
			if (dirtyForms.includes('questionAnswer') || this.customerManageService.customerInfoT24$.getValue().questionsOnly) {
				body.report.customerTemplate.actionCustomer.changeSecurityQuestion = true;
				body.report.customerTemplate.sercurityQuestions = custInfoChange.questionAnswer.reduce((acc, nex) => {
					return acc.concat({
						question: nex.question,
						answer: nex.answer
					});
				}, []);
			}
			body.report.customerTemplate.infoChange = this.customerComponent.getValueChangeReport();
			// chu so huu huong loi
			if (body.report.customerTemplate.infoChange.ownerBen) {
				body.report.customerTemplate.actionCustomer.updateOwnerInfo = true;
				const owner = OWNER_BENEFIT.find(ele => ele.value == custInfoChange.ownerBen).nameVi;

				body.report.customerTemplate.ownerCustomer = {
					otherOwner: !['1.CHU TAI KHOAN', '1.DONG SO HUU'].includes(custInfoChange.ownerBen),
					otherOwnerName: owner,
					ownerAcc: custInfoChange.ownerBen == '1.CHU TAI KHOAN',
					ownerExtraCard: false,
					ownerSeab: custInfoChange.ownerBen == '1.DONG SO HUU',
					purposeOfTrans: body.report.customerTemplate.infoChange.purpose
				};

			}
			const relates = custInfoChange.relates;
			/*
			if (relates) { // thay doi thong tin chu so huu huong loi
				if (relates.findIndex(ele => ele.relationCustomer == '99') > -1) {
					body.report.customerTemplate.ownerPaymentAcc = this.customerComponent.getValueChangeReport();
					// body.report.customerTemplate.ownerCustomer = null;
					body.report.customerTemplate.infoChange = null;
					body.report.customerTemplate.actionCustomer.updateInfo = false;
					body.report.customerTemplate.actionCustomer.updateOwnerInfo = true;
				}
			}
			 */
			if (this.customerComponent.ownerAcct) {
				body.report.customerTemplate.ownerPaymentAcc = this.customerComponent.getValueChangeReport();
				// body.report.customerTemplate.ownerCustomer = null;
				body.report.customerTemplate.infoChange = null;
				body.report.customerTemplate.actionCustomer.updateInfo = false;
				body.report.customerTemplate.actionCustomer.updateOwnerInfo = true;
			}
		}
		// == thay doi viec dien thong tin bieu mau IV. thong tin chu tktt chung [29/08/2021] ==
		if (accountInfo) {
			const sameOwner = this.accountComponent.buildSameOwnerParamReport();
			if (sameOwner && sameOwner.length > 0) {
				let customerId = '', customerName = '', relationName = '';
				for (const so of sameOwner) {
					customerId = customerId + so.customerId + ';';
					customerName = customerName + so.customerName + ';';
					relationName = relationName + so.relationName + ';';
				}
				customerId.charAt(customerId.length - 1) == ';' && (customerId = customerId.slice(0, customerId.length - 1));
				customerName.charAt(customerName.length - 1) == ';' && (customerName = customerName.slice(0, customerName.length - 1));
				relationName.charAt(relationName.length - 1) == ';' && (relationName = relationName.slice(0, relationName.length - 1));
				body.report.sameOwner = {
					customerId,
					customerName,
					relationName
				};
			}
		}

		this.reportService.getReportForm(body)
			.pipe(finalize(() => this.isLoadingReport$.next(false)))
			.subscribe(res => {
				console.log('report data', res);
				if (res && res.status == STATUS_OK && res.responseCode == '00') {
					const dataLinks: DataLinkMinio[] = [];
					for (let i = 0; i < res.report.data.length; i++) {
						const dataLink: DataLinkMinio = new DataLinkMinio();
						const comboTemplate = res.report.data[i];
						dataLink.fileName = comboTemplate.fileName;
						dataLink.fileType = comboTemplate.fileType;
						dataLink.bucketName = comboTemplate.bucketName;
						dataLink.folder = comboTemplate.folder;
						dataLinks.push(dataLink);
						// this.websocketClientService.sendMessageToTablet(dataLink, 'viewForm');
						window.open(`${this.reportService.minioLink}/${comboTemplate.bucketName}/${comboTemplate.folder}`, '_blank');
					}
					console.warn('>>>>> dataLinks', dataLinks);
					this.websocketClientService.sendMessageToTablet(dataLinks, 'viewForm');
				}
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataCacheRouter && !changes.dataCacheRouter.isFirstChange()) {
			if (changes.hasOwnProperty('dataCacheRouter')) {
				this.ngOnInit();
			}
		}
	}

	refreshError(): void {
		this.commonService.refreshError(this.dataCacheRouter.combo.id)
			.subscribe(res => {
				if (res) {
					if (res.account && res.account.resultID) {
						this.parentForm.get('accountInfoForm') && this.parentForm.get('accountInfoForm').get('accountNumber').setValue(res.account.resultID);
					}
					if (res.ebank && res.ebank.resultID) {
						this.parentForm.get('ebankForm') && this.parentForm.get('ebankRegisterForm').get('seaNetId').setValue(res.ebank.resultID);
					}
				}
			});
	}

	resend(): void {
		if (!this.isDisabledForm && (this.customerComponent.frm.stress.value.length + this.customerComponent.frm.town.value.length) > 69) {
			this.customerComponent.maxLengthAddress$.next('Độ dài trường Đường/Phố + Phường/Xã phải < 69 ký tự');
			this.customerComponent.inputStress.nativeElement.focus();
			return;
		} else {
			this.customerComponent.maxLengthAddress$.next(null);
		}

		if (this.accountComponent.accountInfoForm.controls.accountCheckbox.value && (this.accountComponent.accountInfoForm.controls.fatca1.value == null || this.accountComponent.accountInfoForm.controls.fatca2.value == null || this.accountComponent.accountInfoForm.controls.fatca3.value == null ||
			this.accountComponent.accountInfoForm.controls.fatca4.value == null || this.accountComponent.accountInfoForm.controls.fatca5.value == null || this.accountComponent.accountInfoForm.controls.fatca6.value == null || this.accountComponent.accountInfoForm.controls.fatca7.value == null)) {
			this.commonService.error('Vui lòng nhập đủ thông tin fatca!');
			return;
		}
		;
		console.warn('>>> this.parentForm', this.parentForm);
		this.checkboxNumber = 0;
		this.checkbox();
		if (this.checkboxNumber == 0) {
			this.commonService.error('Bạn chưa chọn mục nào để cập nhật');
			return;
		}
		if (this.smsRegisterComponent.duplicateText$.getValue()) {
			this.commonService.error('Tồn tại bản ghi Sms trùng lặp');
			return;
		}
		if (this.parentForm.invalid) {
			this.parentForm.markAllAsTouched();
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}
		this.isExpiredPP = false;

		let listGTTT = [...this.newarray];
		if (this.customerComponent.customerForm.value.national && this.customerComponent.customerForm.value.national.includes('VN')) {
			let listPP = listGTTT.filter(item => item.idenType == 'PP');
			let listVisa = listGTTT.filter(item => item.idenType == 'VISA');

			if (listPP && listPP.length > 1) {
				this.commonService.error('Không được đăng ký 2 Pass Port cùng một thời điểm');
				return;
			}

			if (listVisa && listVisa.length > 1) {
				this.commonService.error('Không được đăng ký 2 Visa cùng một thời điểm');
				return;
			}
			if ((listVisa && listVisa.length > 0 && listPP && listPP.length > 0) || (listVisa && listVisa.length > 0 && listPP.length == 0)) {
				listVisa.map((item) => {
					if (parseDateFrmStr(item.idenTimeExpired) < this.today) {
						this.commonService.error('Visa của bạn đã hết hạn, cần cập nhật ngày hết hạn thị thực');
						this.isExpiredPP = true;
						return;
					} else {
						this.isExpiredPP = false;
					}
				});
			} else if (listVisa.length == 0 && listPP && listPP.length > 0) {
				listPP.map((item) => {
					if (parseDateFrmStr(item.idenTimeExpired) < this.today) {
						this.commonService.error('Pass Port của bạn đã hết hạn, cần cập nhật ngày hết hạn thị thực');
						this.isExpiredPP = true;
						return;
					} else {
						this.isExpiredPP = false;
					}
				});
			}
			if (this.isExpiredPP) {
				return;
			}
		}

		/*
		Kết thúc thời gian tính SLA
		 */
		this.slaTimeService.endCalculateSlaTime();

		this.commonService.isRemovingCustomer$.next(true);
		this.commonService.isClickedButton$.next(true);

		if (this.isDisabledForm) {
			this.parentForm.removeControl('customerForm');
		}

		let transaction = new TransactionModel();
		transaction.authenType = UPDATE_COMBO;
		transaction.data = this.buildRequestForResend();


		const bodyRequestCombo = new BodyRequestTransactionModel(GET_TRANSACTION, transaction);
		this.isLoading$.next(true);
		this.commonService.actionGetTransactionResponseApi(bodyRequestCombo)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK && r.seabRes.body.transaction.responseCode == CODE_00) {
					this.commonService.success(`Gửi duyệt lại bản ghi ${this.parentForm.controls.comboInfoForm.value.transID} thành công`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.comboInfoForm.value.transID, NOTIFICATION.PRODUCT_TYPE.EX_COMBO1);
					this.router.navigate(['/pages/dashboard']);
				} else {
					this.commonService.error('Gửi duyệt lại lỗi');
				}
			});
	}

	buildRequestForResend() {
		this.customer = this.customerComponent.customerForm ? this.customerComponent.customerForm.value : null;
		this.generalInfo = this.parentForm.controls.infoForm.value;
		this.account = this.parentForm.controls.accountInfoForm.value;
		this.sms = this.parentForm.controls.smsRegisterForm.value.formArray;
		this.ebank = this.parentForm.controls.ebankForm.value;
		this.comboInfo = this.parentForm.controls.comboInfoForm.value;
		this.auditInfo = this.parentForm.controls.auditInfoForm.value;
		const customerEmail = (this.customer && this.customer.contactInfos && this.customer.contactInfos.length > 0) ? this.customer.contactInfos[0].email : null;

		if (this.form.smsRegisterForm.value.formArray) {
			console.log('this.form.smsRegisterForm.value.formArray', this.form.smsRegisterForm.value.formArray);
			const sms = [...this.form.smsRegisterForm.value.formArray];
			this.smsArr = sms.map(item => (
				{
					id: item.id,
					accountNumber: item.accountNumber == 'newTKTT' ? null : item.accountNumber,
					phoneNumber: item.phoneNumber,
					serviceId: item.serviceId,
					promotionId: item.promotionId,
					email: item.email,
				}
			));
		}

		this.isAccountCheckbox = this.parentForm.controls.smsRegisterForm.value.smsCheckbox;
		this.isEBankCheckbox = this.parentForm.controls.ebankForm.value.ebankCheckbox;
		this.isAccountCheckbox = this.parentForm.controls.accountInfoForm.value.accountCheckbox;
		this.isSmsCheckbox = this.parentForm.controls.smsRegisterForm.value.smsCheckbox;


		this.username = this.localStorage.retrieve(USERNAME_CACHED);

		let filesUpload: any[] = [];

		this.signatureService.signatureFiles$.asObservable()
			.subscribe((res: FileUploadModel[]) => {
				if (res && res.length > 0) {
					if (res[0].fileData) {
						filesUpload = res;
						filesUpload = filesUpload.map(file => {
							return {
								customerId: '',
								fileData: file.fileData.split(',')[1],
								fileName: 'Don dang ky combo1',
								fileType: file.fileType,
								folder: '',
								id: '',
								isSignature: file.isSignature,
								note: '',
								transactionId: ''
							};
						});
					} else {
						filesUpload = [];
					}
				} else {
					filesUpload = [];
				}
			});


		let customer, account, sms, ebank, listFile;
		if (this.commonService.canReupdateCustomer$.getValue()) {
			customer = (!this.isDisabledForm) ? this.customerComponent.getExCustomerBodyRequest() : null;
		}
		if (this.commonService.canReupdateAccount$.getValue()) {
			account = this.accountComponent.hasCreateAcc$.getValue() ? this.accountComponent.getAccountComboRequest() : null;
		}
		if (this.commonService.canReupdateSms$.getValue()) {
			sms = (this.isSmsCheckbox && this.sms.length > 0) ? {
				id: (this.dataCacheRouter && this.dataCacheRouter.sms) ? this.dataCacheRouter.sms.id : this.parentForm.controls.smsRegisterForm.value.idSms,
				customerId: this.commonService.customerId$.getValue(),
				priority: this.comboInfo.priority,
				actionT24: this.commonService.isExistedSmsForExCustomer$.getValue() == true ? INSERT_UPDATE_SMS_EXISTED : CREATE,
				smsDetail: this.smsArr
			} : null;
		} else {
			sms = null;
		}
		if (this.commonService.canReupdateEbank$.getValue()) {
			ebank = (this.isEBankCheckbox && !this.eBankInfo$.getValue()) ? {
				id: (this.dataCacheRouter && this.dataCacheRouter.ebank) ? this.dataCacheRouter.ebank.id : getRandomTransId(this.username, 'ebank'),
				customerId: this.commonService.customerId$.getValue(),

				serviceId: this.ebank.serviceId,
				handyNumber: this.localStorage.retrieve('customerCombo').sms.split('#')[0],
				mainCurrAcc: (this.ebank.account == 'newTKTT') ? null : this.ebank.account,
				packageService: this.ebank.packageService,
				passwordType: this.ebank.passwordType,
				promotionId: this.ebank.promotionId,
				limit: this.ebank.limit,
				transSeANetPro: this.ebank.transSeANetPro,
				priority: this.comboInfo.priority,
				// campaignId: '1',
				coreDate: this.commonService.timeT24$.getValue(),
				email: customerEmail,
				actionT24: CREATE
			} : null;
		} else {
			ebank = null;
		}
		let cardFront: string = null, cardBack: string = null, fingerLeft: string = null, fingerRight: string = null;
		const gtttUrlModel = this.signatureService.gtttUrlModel$.getValue();
		if (gtttUrlModel) {
			(gtttUrlModel.cardFront && gtttUrlModel.cardFront != 'assets/media/logos/nodata.png') && (cardFront = gtttUrlModel.cardFront);
			(gtttUrlModel.cardBack && gtttUrlModel.cardBack != 'assets/media/logos/nodata.png') && (cardBack = gtttUrlModel.cardBack);
			(gtttUrlModel.fingerLeft && gtttUrlModel.fingerLeft != 'assets/media/logos/nodata.png') && (fingerLeft = gtttUrlModel.fingerLeft);
			(gtttUrlModel.fingerRight && gtttUrlModel.fingerRight != 'assets/media/logos/nodata.png') && (fingerRight = gtttUrlModel.fingerRight);
		}
		const combo = {
			id: (this.dataCacheRouter && this.dataCacheRouter.combo) ? this.dataCacheRouter.combo.id : this.comboInfo.transID,
			comboType: COMBO1_EX,
			actionT24: CREATE,
			accountid: (this.dataCacheRouter && this.dataCacheRouter.account) ? this.dataCacheRouter.account.id : null,
			customerId: this.commonService.customerId$.getValue(),
			priority: this.comboInfo.priority,
			saleType: this.generalInfo.saleType,
			saleId: this.generalInfo.saleId,
			brokerType: this.generalInfo.brokerType,
			brokerId: this.generalInfo.brokerId,
			campaignId: this.generalInfo.campaignId,
			departCode: this.auditInfo.roomCode,
			inputter: this.auditInfo.inputter,
			// authoriser: this.auditInfo.authoriser,
			coCode: this.auditInfo.coCode,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			cardFrontBase64: cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue()
		};

		return {
			customer: customer,
			account: account,
			sms: sms,
			ebank: ebank,
			combo: combo,
			listFile: (filesUpload && filesUpload.length > 0) ? filesUpload : []
		};
	}

	getImageUser(custId: string, gtttUrlModel: GtttUrlModel): void {
		this.signatureService.gtttUrlModel$.next(gtttUrlModel);
		this.coreAiService.getCustomerInfoByUserId(custId)
			.pipe(map(res => {
				const outputs = res.body.utility.output.infos;
				if (outputs && outputs.length > 0) {
					return outputs[0];
				}
				return null;
			}))
			.subscribe(custInfo => {
				if (custInfo) {
					let imageUser = new GtttUrlModel(null, null, null, null, null);
					if (custInfo.faces && custInfo.faces.length > 0) {
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
					if (custInfo.finger && custInfo.finger.length > 0) {
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
					if (custInfo.signature && custInfo.signature.length > 0) {
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

	filterFileFromApi(listFile: FileUploadModel[]) {
		listFile.forEach(file => {
			if (file.fileName.includes('signature')) {
				file.isSignature = true;
			}
		});
		this.signatureService.updateSignatureFileUpload(listFile);
	}

	getSignatureLink(signatures: any, position: number) {
		const signature = signatures.filter(ele => ele.image_url.includes('SIGNATURE_FULL'));
		if (signature && signature.length > 0) {
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

	getRequestNiceAcctTemplate(bodyRequest) {
		this.reportService.callRequest(bodyRequest)
			.pipe(finalize(() => this.isLoadingReport$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.responseCode == CODE_00) {
					const report = res.seabRes.body.report;
					let dataLink: DataLinkMinio = new DataLinkMinio();
					dataLink.fileName = report.data.fileName;
					dataLink.fileType = report.data.fileType;
					dataLink.bucketName = report.data.bucketName;
					dataLink.folder = report.data.folder;
					// this.websocketClientService.sendMessageToTablet(dataLink, 'viewForm');
					window.open(`${this.reportService.minioLink}/${report.data.bucketName}/${report.data.folder}`, '_blank');
				}
			});
	}

	pushDataToRedis(customerT24Info: any, idRecord: string): void {
		if (customerT24Info) {
			// push raw data to redis
			const dirtyForms = this.customerComponent.checkDirtyForms();
			const dataQA = this.customerManageService.listQA$.getValue();
			const bodyRedis = this.mappingT24ToUpdateReq(customerT24Info, MAPPING_T24_FORMCONTROL_REQ_SEATELLER, dataQA);
			bodyRedis.id = idRecord;
			// check chi thay doi cau hoi bao mat
			bodyRedis.questionsOnly = dirtyForms && dirtyForms.includes('questionAnswer');// tan dung truong nay de danh dau thay doi cau hoi bao mat cho resend bieu mau
			this.customerManageService.saveCustomerInfoToRedis(bodyRedis)
				.subscribe(console.log);
		}
	}

	mappingT24ToUpdateReq(customerInfo: any, mapKeyProp: any, dataQA: any): BodyUdpateCustomerInfoModel {
		return this.customerManageService.mappingT24ToUpdateReq(customerInfo, mapKeyProp, dataQA);
	}

	isLoadingSave$ = new BehaviorSubject<boolean>(false);
	saveTemplate() {
		this.checkboxNumber = 0;
		this.checkbox();

		this.isExpiredPP = false;

		let listGTTT = [...this.newarray];

		/*
		Kết thúc thời gian tính SLA
		 */
		this.slaTimeService.endCalculateSlaTime();

		this.commonService.isRemovingCustomer$.next(true);
		this.commonService.isClickedButton$.next(true);

		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = (!this.dataCacheRouter || this.dataCacheRouter.score) ?  CREATE_COMBO : UPDATE_COMBO;
		transaction.data = this.buildRequest();
		if (transaction.data.customer) {
			this.pushDataToRedis(this.customerObject, transaction.data.combo.id);
		}
		this.isLoadingSave$.next(true);
		let bodyRequestCombo = new BodyRequestTransactionModel(command, transaction);
		this.commonService.isClickedButton$.next(true);
		bodyRequestCombo.transaction.authenType = "storeComboTemp",
		this.commonService.actionGetTransactionResponseApi(bodyRequestCombo)
			.pipe(finalize(() => this.isLoadingSave$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK) {
					this.commonService.success("Lưu bản ghi thành công");
					// this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.comboInfoForm.value.transID, NOTIFICATION.PRODUCT_TYPE.COMBO1);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}
	removeSavedRecord() {
		let username = this.localStorage.retrieve(USERNAME_CACHED);
		this.isLoadingDelete$.next(true)
		this.commonService.removeSavedRecord(username, this.dataCacheRouter.score)
		.pipe(finalize(() => this.isLoadingDelete$.next(false)))
		.subscribe(r => {
			if (r.seabRes.body.status == STATUS_OK) {
				this.commonService.success("Xóa bản ghi thành công");
				this.router.navigate(['/pages/dashboard']);
			} else {
				return;
			}
		});
	}
}
