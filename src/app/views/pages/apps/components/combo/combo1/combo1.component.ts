import {SmsRegisterComponent} from './../sms-register/sms-register.component';
import {GeneralInfoComponent} from '../general-info/general-info.component';
import {OpenAccountInfoComponent} from '../open-account-info/open-account-info.component';
import {ModalNotification} from '../../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {Component, Input, OnDestroy, OnInit, ViewChild, SimpleChanges, AfterViewInit, ElementRef} from '@angular/core';
import {CustomerModel} from '../customer-info/customer-model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {AccountModel} from '../../../../../model/account.model';
import {SmsModel} from '../../../../../model/sms.model';
import {CardModel} from '../../../../../model/card.model';
import {EbankModel} from '../../../../../model/ebank.model';
import {ComboModel} from '../../../../../model/combo.model';
import {TransactionModel} from '../../../../../model/transaction.model';
import {CommonService} from '../../../../../common-service/common.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {ScrollTopDirective} from '../../../../../../core/_base/layout';
import {FormatDatepicker} from '../../../../../../shared/util/format-datepicker-dd-mm-yyyy';
import {ACTION_T24_CREATE, LOCAL_DATE_TIME} from '../../../../../../shared/model/constants/common-constant';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalDeleteComponent} from '../../../../../../shared/directives/modal-common/modal-delete/modal-delete.component';
import {finalize} from 'rxjs/operators';
import moment from 'moment';
import {
	APPROVE,
	APPROVE_COMBO,
	CODE_00,
	CREATE_COMBO, GET_ENQUIRY,
	GET_TRANSACTION, NICE_ACCT_SO_DU,
	NOTIFICATION,
	REJECT_COMBO,
	STATUS_OK,
	UPDATE_COMBO,
	USERNAME_CACHED, UTILITY
} from '../../../../../../shared/util/constant';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import {CityModel} from '../../../../../../shared/model/city.model';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {WebsocketClientService} from '../../../../../../shared/services/websocket-client.service';
import {SlaTimeService} from '../../../../../../shared/services/sla-time.service';
import {ModalAskComponent} from '../../../../../../shared/directives/modal-common/modal-ask/modal-ask.component';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {FormPDF, Question} from '../formPDF';
import {CustomerInfoComponent} from '../customer-info/customer-info.component';
import {parseDateFrmStr} from '../../../../../../shared/util/date-format-ultils';
import {ReportService} from '../../../../../common-service/report.service';
import {DataLinkMinio} from '../../../../../model/data-link-minio';
import {SignatureService} from '../../identify-customer/service/signature.service';
import {FileUploadModel} from '../../customer-manage/customer.model';
import {CoreAiService} from '../../identify-customer/service/core-ai.service';
import {GtttUrlModel} from '../../../../../../shared/model/GtttUrl.model';
import {convertInteger} from '../../../../../../shared/util/Utils';

@Component({
	selector: 'kt-combo',
	templateUrl: './combo1.component.html',
	styleUrls: ['./combo1.component.scss']
})
export class Combo1Component implements OnInit, OnDestroy, AfterViewInit {
	// cho truy van giao dich
	@Input('viewData') viewData: any;
	@ViewChild(CustomerInfoComponent, {static: false})
	customerComponent: CustomerInfoComponent;
	@ViewChild(OpenAccountInfoComponent, {static: false})
	accountComponent: OpenAccountInfoComponent;
	@ViewChild(GeneralInfoComponent, {static: false})
	generalComponent: GeneralInfoComponent;
	@ViewChild(SmsRegisterComponent, {static: false})
	smsRegisterComponent: SmsRegisterComponent;

	customer: CustomerModel = new CustomerModel();
	account: AccountModel = new AccountModel();
	sms: SmsModel[] = [];
	card: CardModel = new CardModel();
	ebank: EbankModel = new EbankModel();
	combo1: ComboModel = new ComboModel();
	generalInfo: any;
	otherInfo: any;
	comboInfo: any;
	auditInfo: any;
	parentForm: FormGroup;
	transaction: TransactionModel = new TransactionModel();
	command: string;
	bodyRequest: BodyRequestTransactionModel;
	bodyDeleteRequest: BodyRequestTransactionModel;
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	activeTab$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
	isShowAccount: boolean = true;
	today = new Date();
	timeNow = moment().format('DD/MM/YYYY HH:mm:ss');
	username: string;
	dataCacheRouter: any;
	cityList: CityModel[] = [];
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	parentName: string;
	childOne: string;
	childTwo: string;

	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	listFax: any = [];
	listTax: any = [];
	isExpiredPP: boolean = false;
	newarray: any [] = [];

	navigateSub: Subscription;
	isLoadingRefresh$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingReport$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	removeButton$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	predictData: boolean;

	firstNavigate$ = new BehaviorSubject<boolean>(false);

	@ViewChild(ScrollTopDirective, {static: false}) directive: ScrollTopDirective;

	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private router: Router,
				private localStorage: LocalStorageService,
				private sessionStorage: SessionStorageService,
				private dateFormat: FormatDatepicker,
				private dataPowerService: DataPowerService,
				private modalService: NgbModal,
				private websocketClientService: WebsocketClientService,
				private slaTimeService: SlaTimeService,
				private webSocketClient: WebsocketClientService,
				private reportService: ReportService,
				private signatureService: SignatureService,
				private coreAiService: CoreAiService) {
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

		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);
		//Không hiển thị files upload
		this.commonService.isDisplayFile$.next(false);
		this.commonService.filesUploadByUserId.next(null);
		this.navigateSub = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.initData();
				this.firstNavigate$.next(true);
			}
		});
	}

	ngOnInit() {
		if (this.viewData || !this.firstNavigate$.getValue()) {
			this.initData();
		}
	}

	initData(): void {
		console.warn('state', window.history.state);
		console.log('this.commonService.timeT24$.getValue()', this.commonService.timeT24$.getValue());
		this.commonService.isComboComponent$.next(true);
		/**
		 * Bắt đầu tính thời gian SLA tại combo_1;
		 */
		this.slaTimeService.startCalculateSlaTime();

		this.username = this.localStorage.retrieve(USERNAME_CACHED);

		if (this.viewData) {
			this.dataCacheRouter = this.viewData;
		} else {
			this.checkRight();
			if (window.history.state.data) {
				this.dataCacheRouter = window.history.state.data;
				let cardFront = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.cardFront);
				let cardBack = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.cardBack);
				let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.pictureFace);
				let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.fingerLeft);
				let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.combo.fingerRight);

				let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
				this.signatureService.gtttUrlModel$.next(gtttModel);

			} else if (window.history.state.predictUserData) {
				this.dataCacheRouter = window.history.state.predictUserData;
				this.predictData = true;
			}
			this.commonService.isAsideRight$.next(true);
			this.commonService.isDisplayAsideRight$.next(true);
		}
		if (this.commonService.isUpdateCombo$.getValue()) {
			if (this.dataCacheRouter.customer) {
				this.commonService.cusTransId$.next(this.dataCacheRouter.customer.id);
			} else {
				this.commonService.cusTransId$.next(getRandomTransId(this.username, 'customer'));
			}
			// } else if (window.history.state.predictUserData) {
		} else {
			this.commonService.cusTransId$.next(getRandomTransId(this.username, 'customer'));
		}

		this.bodyRequest = new BodyRequestTransactionModel(this.command, this.transaction);
		this.bodyRequest.transaction.authenType = (!this.dataCacheRouter || this.dataCacheRouter.score) ?  CREATE_COMBO : UPDATE_COMBO;
		this.bodyRequest.command = GET_TRANSACTION;
		if (this.dataCacheRouter && this.dataCacheRouter.listFile && this.dataCacheRouter.listFile.length > 0) {
			this.filterFileFromApi(this.dataCacheRouter.listFile);
		}
		if (this.dataCacheRouter && this.dataCacheRouter.combo && this.dataCacheRouter.combo.id) {
			if(this.dataCacheRouter.combo.status != "SAVED") {
				this.refreshError();
			}
		}
	}

	ngAfterViewInit() {

	}

	filterFileFromApi(listFile: FileUploadModel[]) {
		listFile.forEach(file => {
			if (file.fileName.includes('signature')) {
				file.isSignature = true;
			}
		});
		this.signatureService.updateSignatureFileUpload(listFile);
	}

	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	bodyRequestCombo() {
		if (this.parentForm.controls.infoForm.value
			&& this.parentForm.controls.accountInfoForm.value
			&& this.parentForm.controls.smsRegisterForm.value.formArray
			&& this.parentForm.controls.ebankForm.value
			&& this.parentForm.controls.comboInfoForm.value) {
			this.comboInfo = this.parentForm.controls.comboInfoForm.value;
			this.customer = this.customerComponent.customerForm.value;
			this.generalInfo = this.parentForm.controls.infoForm.value;
			this.account = this.parentForm.controls.accountInfoForm.value;
			this.sms = this.parentForm.controls.smsRegisterForm.value.formArray;
			this.ebank = this.parentForm.controls.ebankForm.value;
			this.auditInfo = this.parentForm.controls.auditInfoForm.value;
		}

		let smsCheckbox = this.parentForm.controls.smsRegisterForm.value.smsCheckbox;
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
		if ( filesUpload && filesUpload.length > 0 && filesUpload.findIndex(file => file.isSignature) < 0) {
			this.commonService.error('Bạn chưa tích chọn file chứa chữ ký nào');
			return;
		}
		const customerEmail = (this.customer && this.customer.contactInfos && this.customer.contactInfos.length > 0) ? this.customer.contactInfos[0].email : null;
		this.bodyRequest.transaction.data = {
			inputter: this.auditInfo.inputter,
			customer: this.customerComponent.getCustomerBodyRequest(),
			account: this.accountComponent.accountInfoForm.controls.accountCheckbox.value ? this.accountComponent.getAccountComboRequest() : null,
			sms: smsCheckbox ? this.smsRegisterComponent.getDataComboSms() : null,
			ebank: this.ebank.ebankCheckbox ? {
				id: (this.dataCacheRouter && this.dataCacheRouter.ebank) ? this.dataCacheRouter.ebank.id : getRandomTransId(this.username, 'ebank'),
				serviceId: this.ebank.serviceId,
				handyNumber: this.customerComponent.customerForm.value.contactInfos[0].mobile,
				packageService: this.ebank.packageService,
				passwordType: this.ebank.passwordType,
				promotionId: this.ebank.promotionId,
				limit: this.ebank.limit,
				transSeANetPro: this.ebank.transSeANetPro,
				departCode: this.auditInfo.roomCode,
				mainCurrAcc: null,
				coreDate: this.commonService.timeT24$.getValue(),
				email: customerEmail,
				priority: this.comboInfo.priority,
				actionT24: ACTION_T24_CREATE
			} : null,
			combo: {
				id: (this.dataCacheRouter && this.dataCacheRouter.combo) ? this.dataCacheRouter.combo.id : this.comboInfo.transID,
				inputter: this.auditInfo.inputter,
				// authoriser: this.auditInfo.authoriser,
				coCode: this.auditInfo.coCode,
				departCode: this.auditInfo.roomCode,
				campaignId: this.generalInfo.campaignId,
				saleType: this.generalInfo.saleType,
				saleId: this.generalInfo.saleId,
				brokerType: this.generalInfo.brokerType,
				brokerId: this.generalInfo.brokerId,
				comboType: 'COMBO1',
				priority: this.comboInfo.priority,
				actionT24: ACTION_T24_CREATE,
				timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
				timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
				cardFrontBase64: this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: this.coreAiService.fingerRightScan$.getValue()
			},
			listFile: (filesUpload && filesUpload.length > 0) ? filesUpload : [],
			score: this.dataCacheRouter && this.dataCacheRouter.score ? this.dataCacheRouter.score : null
		};

	}

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	onImporterCreate() {
		/*
		 * Kết thúc tính time SLA cho inputter
		 */
		this.slaTimeService.endCalculateSlaTime();
		//
		this.isExpiredPP = false;
		/////
		if (this.customerComponent.checkAge()) {
			this.commonService.error('Vui lòng xem lại các trường nhập liệu');
			return;
		}
		this.bodyRequestCombo();

		if (this.customerComponent.frm.stress.value && this.customerComponent.frm.stress.value) {
			if ((this.customerComponent.frm.stress.value.length + this.customerComponent.frm.town.value.length) > 69) {
				this.customerComponent.maxLengthAddress$.next('Độ dài trường Đường/Phố + Phường/Xã phải < 69 ký tự');
				this.customerComponent.inputStress.nativeElement.focus();
				return;
			}
		} else {
			this.customerComponent.maxLengthAddress$.next(null);
		}

		if (this.accountComponent.accountInfoForm.controls.accountCheckbox.value && (this.accountComponent.accountInfoForm.controls.fatca1.value == null || this.accountComponent.accountInfoForm.controls.fatca2.value == null || this.accountComponent.accountInfoForm.controls.fatca3.value == null ||
			this.accountComponent.accountInfoForm.controls.fatca4.value == null || this.accountComponent.accountInfoForm.controls.fatca5.value == null || this.accountComponent.accountInfoForm.controls.fatca6.value == null || this.accountComponent.accountInfoForm.controls.fatca7.value == null)) {
			this.commonService.error('Vui lòng nhập đủ thông tin fatca!');
			return;
		}
		;
		let listGTTT = [...this.newarray];
		// if (this.parentForm.get('customerForm.national').value && this.parentForm.get('customerForm.national').value.includes('VN')) {
		if (this.customerComponent.customerForm.value.national && this.customerComponent.customerForm.value.national.includes('VN')) {
			let listPP = listGTTT.filter(item => item.idenType == 'PP');
			let listVisa = listGTTT.filter(item => item.idenType == 'VISA');

			if (listPP && listPP.length > 1) {
				this.commonService.error('Không được đăng ký 2 Pass Port cùng một thời điểm');
				return;
			}

			if (this.smsRegisterComponent.duplicateText$.getValue()) {
				this.commonService.error('Tồn tại bản ghi Sms trùng lặp');
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

		console.log('this.parentForm.value', this.parentForm.value);

		// return
		// this.parentForm.controls.comboInfoForm.value.transID


		this.listFax = [];
		this.listTax = [];
		const faxArray = [...this.customer.faxs];
		faxArray.forEach(fax => {
			console.log('faxID', fax);
			this.listFax.push(fax.fax);
		});
		this.bodyRequest.transaction.data.customer.fax = this.listFax.toString().replaceAll(',', ';');
		console.log('dataListFax', this.listFax);

		const taxArray = [...this.customer.taxs];
		taxArray.forEach(tax => {
			console.log('objectTax', tax);
			this.listTax.push(tax.taxId);
		});
		this.bodyRequest.transaction.data.customer.taxId = this.listTax.toString().replaceAll(',', ';');
		console.log('dataListTax', this.listTax);


		this.commonService.isClickedButton$.next(true);

		console.log('this.bodyRequest', this.bodyRequest);

		if (this.parentForm.invalid) {
			console.log('this.parentForm', this.parentForm);
			console.log('this.parentForm.value', this.parentForm.value);
			this.parentForm.markAllAsTouched();
			window.scroll(0, 0);
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}

		this.isLoading$.next(true);
		if (this.dataCacheRouter && !this.predictData) {
			this.bodyRequest.transaction.data.combo.id = this.dataCacheRouter.combo.id;
		}

		this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK) {
					this.commonService.success((this.dataCacheRouter && this.dataCacheRouter.combo.status != 'SAVED' && !this.predictData) ? `Cập nhật bản ghi ${this.parentForm.controls.comboInfoForm.value.transID} thành công` : `Bản ghi ${this.parentForm.controls.comboInfoForm.value.transID} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.comboInfoForm.value.transID, NOTIFICATION.PRODUCT_TYPE.COMBO1);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	onApproved() {
		/*
		 * Ghi nhận thời điểm kết thúc tính time SLA cho inputter
		 */
		this.slaTimeService.endCalculateSlaTime();
		//

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
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK && requestAnimationFrame) {
					this.removeButton$.next(true);
					this.commonService.success('Duyệt bản ghi Combo 1 thành công');
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.combo.inputter, NOTIFICATION.APPROVED_COMBO, _this.dataCacheRouter.combo.id, NOTIFICATION.PRODUCT_TYPE.COMBO1);
					// this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	openModalReject() {
		const auditFormControls = this.parentForm.controls.auditInfoForm;
		if (!auditFormControls.value.reason) {
			auditFormControls.markAllAsTouched();
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
				this.modalService.dismissAll();
			}
		});
	}

	ngOnDestroy() {
		this.removeButton$.next(false);
		// this.commonService.maxLengthAddress$.next(false)
		this.commonService.destroyError();
		// this.commonService.accountError$.next(null);
		// this.commonService.customerError$.next(null);
		// this.commonService.smsError$.next(null);
		// this.commonService.ebankError$.next(null);
		this.commonService.isNotifyHasCancel$.next(false);
		this.commonService.isClickedButton$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		this.commonService.isUpdateAccount$.next(false);
		this.commonService.cusTransId$.next(null);
		this.commonService.isComboComponent$.next(null);
		this.commonService.filesUploadByUserId.next(null);
		this.commonService.filesUploadCombo$.next(null);
		this.commonService.filesCombo$.next(null);
		this.slaTimeService.clearTimeSLA();
		if (this.navigateSub) {
			this.navigateSub.unsubscribe();
		}
	}

	toggleAccount(): void {
		this.isShowAccount = !this.isShowAccount;
	}

	removeForm() {
		this.commonService.isNotifyHasCancel$.next(true);
		let modalRef = this.modalService.open(ModalNotification, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
			centered: true,
			windowClass: 'notificationDialog'
		});

		modalRef.componentInstance.textNotify = 'Bạn có chắc chắn muốn xóa dữ liệu đã nhập ?';

		modalRef.result.then(r => {
			if (r == true) {
				this.customerComponent.customerForm.reset();
				this.accountComponent.accountInfoForm.reset();
				this.generalComponent.infoForm.reset();
			} else {
				return;
			}
		});


	}

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
				//this.commonService.error(r.desc)
			}
		});
	}

	rejectRecord() {
		console.log('click từ chối');
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
				this.commonService.success('Đã từ chối bản ghi');
			} else {
				return;
			}
		});
	}

	get APPROVED() {
		if (this.dataCacheRouter) {
			return this.dataCacheRouter.combo && this.dataCacheRouter.combo.status.startsWith(APPROVE);
		}
	}

	getCcyList() {
		let command = GET_ENQUIRY;
		let enquiry: EnquiryModel = new EnquiryModel();
		enquiry.authenType = 'getCurrency_Rate';
		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.commonService.actionGetEnquiryUtility(bodyRequest).pipe()
			.subscribe(r => {
				if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
					console.log(r, 'ccyList');
				} else {
					//this.commonService.error(r.error.desc)
				}
			});
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
		if (this.parentForm.invalid) {
			console.warn('this.parentForm', this.parentForm);
			this.parentForm.markAllAsTouched();
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}


		let customerInfo = this.frm.customerForm.value;
		let accountInfo = this.frm.accountInfoForm.value;
		let seAnetInfo = this.frm.ebankForm.value;
		let smsInfo = this.frm.smsRegisterForm.value;

		// @ts-ignore
		let city = this.customerComponent.cityLabel._projectedViews ? this.customerComponent.cityLabel._projectedViews[0].context.label : '';
		// @ts-ignore
		let district = this.customerComponent.districtLabel._projectedViews ? this.customerComponent.districtLabel._projectedViews[0].context.label : '';
		// @ts-ignore
		// let nationality = this.customerComponent.nationalLabel._projectedViews ? this.customerComponent.nationalLabel._projectedViews[0].context.label : '';
		// @ts-ignore
		// let residenceCountry = this.customerComponent.residenceLabel._projectedViews[0].context.label;
		// @ts-ignore
		let job = this.customerComponent.jobLabel._projectedViews ? this.customerComponent.jobLabel._projectedViews[0].context.label : '';

		let nationality = '';
		const countries = this.localStorage.retrieve(UTILITY.COUNTRY.COUNTRY_CACHE);
		const nationals = customerInfo.national.map(ele => {
			const country = countries.find(c => c.countryId == ele);
			if (country) {
				return country;
			}
			return {
				countryId: ele,
				geographicalBlock: null,
				nameGb: null,
				nameVn: null
			};
		});

		const otherNationalsStr = nationals.filter(n => n.countryId != 'VN').map(n => n.nameGb).join('; ');
		if (nationals.findIndex(n => n.countryId == 'VN') > -1) {
			nationality = countries.find(c => c.countryId == 'VN').nameGb;
		} else {
			nationals && nationals.length > 0 && (nationality = nationals[0].nameGb);
		}
		const placeOfBirth = countries.find(c => c.countryId == customerInfo.placeOfBirth).nameGb;
		const contactInfos = customerInfo.contactInfos;
		let email = contactInfos.map(c => c.email).join('; ');
		let otherPhones = contactInfos.map(c => c.mobile);
		otherPhones.splice(0, 1);
		const otherPhonestr = otherPhones.join('; ');
		const dcLienHe = customerInfo.stress + ', ' + customerInfo.town + ', ' + district + ', ' + city;

		let body: FormPDF = new FormPDF();
		body.command = 'GET_REPORT';
		body.report = {
			authenType: 'getReport_SEATELLER_REGISTER',
			exportType: 'PDF',
			transactionId: this.frm.comboInfoForm.value.transID,
			customerInfo: {
				birthDate: moment(customerInfo.birthday).format('DD/MM/YYYY'),
				birthPlace: placeOfBirth, //customerInfo.placeOfBirth,
				chucVu: null,
				cuaKhau: null,
				currentAddress: customerInfo.idenAddress ? customerInfo.idenAddress : '',
				diaChiNN: '',//customerInfo.residentStstus == 'YES' ? customerInfo.residentNational : null,
				diaChiVN: '',//customerInfo.residentStstus == 'NO' ? customerInfo.residentNational : null,
				email: email,//customerInfo.contactInfos[0].email,
				fromDate: customerInfo.identification[0].idenType == 'VISA' ? moment(customerInfo.identification[0].idenTime).format('DD/MM/YYYY') : null,
				fullName: customerInfo.customerName,
				gender: customerInfo.sex,
				gttt: customerInfo.identification[0].gttt,
				hoKhau: customerInfo.idenAddress,
				isCuTru: customerInfo.residentStstus == 'YES',
				isMarried: customerInfo.maritalStatus == 'MARRIED' ? true : (customerInfo.maritalStatus == 'SINGLE' ? false : null),
				isSameAddress: customerInfo.isSameIdenAddress ? customerInfo.isSameIdenAddress : false,
				issueDate: moment(customerInfo.identification[0].idenTime).format('DD/MM/YYYY'),
				issuesAddress: customerInfo.identification[0].organization,
				job: job,
				mobilePhone: customerInfo.contactInfos[0].mobile,
				nationality: nationality,
				ngayNhapCanh: null,
				otherAdd: customerInfo.customerAddress,
				otherMarried: customerInfo.maritalStatus == 'MARRIED' ? false : (customerInfo.maritalStatus == 'SINGLE' ? false : customerInfo.maritalStatus),
				otherNationality: otherNationalsStr, //customerInfo.national.length > 1 ? customerInfo.national[1] : null,
				otherPhone: otherPhonestr,
				relationship: customerInfo.ownerBen,
				school: customerInfo.questionAnswer[0].answer,
				seabID: null,//customerInfo.customerId ? customerInfo.customerId : null,
				soThiThuc: customerInfo.identification[0].idenType == 'VISA' ? customerInfo.identification[0].gttt : null,
				thuNhap: customerInfo.salaryReq ? convertInteger(customerInfo.salaryReq) : null,
				toDate: customerInfo.identification[0].idenType == 'VISA' ? moment(customerInfo.identification[0].idenTimeExpired).format('DD/MM/YYYY') : null,
				maSoThue: null,
				dcLienHe: dcLienHe,
				listQuestion: [],
				otherPhuong: customerInfo.currTown,
				otherQuan: customerInfo.currDistrict,
				otherTinh: customerInfo.currCity,
				phuongXa: customerInfo.stress,
				quanHuyen: district,
				tinhTp: city,
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

		// dia chi lien lac va dia chi thuong tru
		if (!customerInfo.isSameIdenAddress) {
			body.report.customerInfo.otherAdd = customerInfo.stress;
			body.report.customerInfo.otherPhuong = customerInfo.town;
			body.report.customerInfo.otherQuan = district;
			body.report.customerInfo.otherTinh = city;
		}

		// thay doi loai tien
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
			body.report.customerInfo.maSoThue = tax.map(m => m.taxId).join('; ');//[0].taxId;
		}

		const question = customerInfo.questionAnswer;
		let listQuestion: Question[] = [];

		if (question && question.length > 0) {
			question.forEach(q => {
				let quest = '';
				if (q.question.includes('Nơi sinh')) {
					quest = 'BIRTH_PLACE';
				} else if (q.question.includes('Tên trường')) {
					quest = 'SCHOOL';
				} else {
					quest = 'PARENT';
				}
				listQuestion.push({
					question: quest,
					answer: q.answer
				});
			});
		}
		body.report.customerInfo.listQuestion = listQuestion;

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
					custId: '',
					saveToMinio: false,
					exportType: 'PDF',
					branchName: branch ? branch.desc : '',
					fullName: customerInfo.customerName,
					ngay: moment(new Date()).format('DD/MM/YYYY'),
					niceAcct: accountInfo.accountNumber,
					phi: this.commonService.formatCurrency(accountInfo.chargeInfoForm.totalAmount),
					phiStr: this.commonService.amountToVietNamese(accountInfo.chargeInfoForm.totalAmount),
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
		// == thay doi viec dien thong tin bieu mau IV. thong tin chu tktt chung [29/08/2021] ==
		if (accountInfo) {
			const sameOwner = this.accountComponent.buildSameOwnerParamReport();
			if (sameOwner && sameOwner.length>0) {
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

		this.isLoadingReport$.next(true);
		this.reportService.getReportForm(body)
			.pipe(finalize(() => this.isLoadingReport$.next(false)))
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
						window.open(`${this.reportService.minioLink}/${comboTemplate.bucketName}/${comboTemplate.folder}`, '_blank');
					}
					console.warn('>>>>> dataLinks', dataLinks);
					this.websocketClientService.sendMessageToTablet(dataLinks, 'viewForm');
				}
			});
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

	resend() {
		if ((this.customerComponent.frm.stress.value.length + this.customerComponent.frm.town.value.length) > 69) {
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
		if (this.parentForm.invalid) {
			this.parentForm.markAllAsTouched();
			this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
			return;
		}
		this.isExpiredPP = false;
		this.buildRequestForResend();
		/*
		 * Kết thúc tính time SLA cho inputter
		 */
		this.slaTimeService.endCalculateSlaTime();
		// customer
		if (this.bodyRequest.transaction.data.customer) {

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

			this.listFax = [];
			this.listTax = [];
			const faxArray = [...this.customer.faxs];
			faxArray.forEach(fax => {
				this.listFax.push(fax.fax);
			});
			this.bodyRequest.transaction.data.customer.fax = this.listFax.toString().replaceAll(',', ';');

			const taxArray = [...this.customer.taxs];
			taxArray.forEach(tax => {
				this.listTax.push(tax.taxId);
			});
			this.bodyRequest.transaction.data.customer.taxId = this.listTax.toString().replaceAll(',', ';');
		}

		this.commonService.isClickedButton$.next(true);

		this.isLoading$.next(true);
		this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK) {
					this.commonService.success(`Bản ghi ${this.parentForm.controls.comboInfoForm.value.transID} đã được gửi duyệt lại tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.comboInfoForm.value.transID, NOTIFICATION.PRODUCT_TYPE.COMBO1);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	buildRequestForResend() {
		this.comboInfo = this.parentForm.controls.comboInfoForm.value;
		this.customer = this.customerComponent.customerForm.value;
		this.generalInfo = this.parentForm.controls.infoForm.value;
		this.account = this.parentForm.controls.accountInfoForm.value;
		this.sms = this.parentForm.controls.smsRegisterForm.value.formArray;
		this.ebank = this.parentForm.controls.ebankForm.value;
		this.auditInfo = this.parentForm.controls.auditInfoForm.value;
		const customerEmail = (this.customer && this.customer.contactInfos && this.customer.contactInfos.length > 0) ? this.customer.contactInfos[0].email : null;
		// convert value newDateExpire
		const arr = [...this.customerComponent.customerForm.value.identification];
		this.newarray = arr.map(item => (
			{
				id: item.id,
				idenAdress: item.idenAdress,
				gttt: item.gttt,
				idenTimeExpired: item.idenTimeExpired ? moment(item.idenTimeExpired).format('DD-MM-YYYY') : null,
				idenTime: item.idenTime ? moment(item.idenTime).format('DD-MM-YYYY') : null,
				idenType: item.idenType,
				organization: item.organization,
				idCustomer: item.idCustomer
			}));

		let smsCheckbox = this.parentForm.controls.smsRegisterForm.value.smsCheckbox;
		let birthday = this.dateFormat.formatDateDDMMYYYY(this.customerComponent.customerForm.value.birthday);
		let idenTimeValue = this.customerComponent.customerForm.value.idenTimeValue ? this.dateFormat.formatDateDDMMYYYY(this.customerComponent.customerForm.value.idenTimeValue) : null;
		let customer, account, sms, ebank, listFile;
		if (this.commonService.canReupdateCustomer$.getValue()) {
			customer = this.customerComponent.getCustomerBodyRequest();
		} else {
			customer = null;
		}
		if (this.commonService.canReupdateAccount$.getValue()) {
			// account = this.account.accountCheckbox ? this.accountComponent.getAccountComboRequest() : null;
			account = this.accountComponent.hasCreateAcc$.getValue() ? this.accountComponent.getAccountComboRequest() : null;
		}
		if (this.commonService.canReupdateSms$.getValue()) {
			sms = smsCheckbox ? this.smsRegisterComponent.getDataComboSms() : null;
		}
		if (this.commonService.canReupdateEbank$.getValue()) {
			ebank = this.ebank.ebankCheckbox ? {
				id: (this.dataCacheRouter && this.dataCacheRouter.ebank) ? this.dataCacheRouter.ebank.id : getRandomTransId(this.username, 'ebank'),
				serviceId: this.ebank.serviceId,
				handyNumber: this.customerComponent.customerForm.value.contactInfos[0].mobile,
				packageService: this.ebank.packageService,
				passwordType: this.ebank.passwordType,
				promotionId: this.ebank.promotionId,
				limit: this.ebank.limit,
				transSeANetPro: this.ebank.transSeANetPro,
				departCode: this.auditInfo.roomCode,
				// campaignId: null,
				mainCurrAcc: null,
				coreDate: this.commonService.timeT24$.getValue(),
				email: customerEmail,
				priority: this.comboInfo.priority,
				actionT24: ACTION_T24_CREATE
			} : null;
		} else {
			ebank = null;
		}
		const combo = {
			id: this.dataCacheRouter.combo.id,
			inputter: this.auditInfo.inputter,
			// authoriser: this.auditInfo.authoriser,
			coCode: this.auditInfo.coCode,
			departCode: this.auditInfo.roomCode,
			saleType: this.generalInfo.saleType,
			saleId: this.generalInfo.saleId,
			brokerType: this.generalInfo.brokerType,
			brokerId: this.generalInfo.brokerId,
			campaignId: this.generalInfo.campaignId,
			comboType: 'COMBO1',
			priority: this.comboInfo.priority,
			actionT24: ACTION_T24_CREATE,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			cardFrontBase64: this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue()
		};
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
		if (filesUpload && filesUpload.length > 0 && filesUpload.findIndex(file => file.isSignature) < 0) {
			this.commonService.error('Bạn chưa tích chọn file chứa chữ ký nào');
			return;
		}
		this.bodyRequest.transaction.data = {
			customer: customer,
			account: account,
			sms: sms,
			ebank: ebank,
			combo: combo,
			listFile: (filesUpload && filesUpload.length > 0) ? filesUpload : []
		};
	}

	refreshError(): void {
		this.commonService.refreshError(this.dataCacheRouter.combo.id)
			.subscribe(res => {
				if (res) {
					if (res.customer && res.customer.resultID) {
						this.parentForm.get('customerForm') && this.parentForm.get('customerForm').get('customerId').setValue(res.customer.resultID);
						this.customerComponent.customerForm && this.customerComponent.customerForm.get('customerId').setValue(res.customer.resultID);
					}
					if (res.account && res.account.resultID) {
						this.parentForm.get('accountInfoForm') && this.parentForm.get('accountInfoForm').get('accountNumber').setValue(res.account.resultID);
					}
					if (res.ebank && res.ebank.resultID) {
						this.parentForm.get('ebankForm') && this.parentForm.get('ebankForm').get('seaNetId').setValue(res.ebank.resultID);
					}
				}
			});
	}

	isLoadingSave$ = new BehaviorSubject<boolean>(false);
	saveTemplate() {
		this.isExpiredPP = false;
		this.bodyRequestCombo();

		console.log('this.parentForm.value', this.parentForm.value);

		/*
		 * Kết thúc tính time SLA cho inputter
		 */
		this.slaTimeService.endCalculateSlaTime();

		this.listFax = [];
		this.listTax = [];
		const faxArray = [...this.customer.faxs];
		faxArray.forEach(fax => {
			console.log('faxID', fax);
			this.listFax.push(fax.fax);
		});
		this.bodyRequest.transaction.data.customer.fax = this.listFax.toString().replaceAll(',', ';');
		console.log('dataListFax', this.listFax);

		const taxArray = [...this.customer.taxs];
		taxArray.forEach(tax => {
			this.listTax.push(tax.taxId);
		});
		this.bodyRequest.transaction.data.customer.taxId = this.listTax.toString().replaceAll(',', ';');
		this.commonService.isClickedButton$.next(true);
		this.isLoadingSave$.next(true);

		this.bodyRequest.transaction.authenType = "storeComboTemp",
		this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
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


	isLoadingDelete$ = new BehaviorSubject<boolean>(false);
	removeSavedRecord() {
		this.isLoadingDelete$.next(true)
		let username = this.localStorage.retrieve(USERNAME_CACHED);
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

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataCacheRouter && !changes.dataCacheRouter.isFirstChange()) {
			if (changes.hasOwnProperty('dataCacheRouter')) {
				this.initData();
			}
		}
	}
}
