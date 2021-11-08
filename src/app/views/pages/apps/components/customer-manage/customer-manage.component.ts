import {FormBuilder, FormGroup} from '@angular/forms';
import {TransactionInfoComponent} from '../transaction-operations/transaction-info/transaction-info.component';
import {SlaTimeService} from '../../../../../shared/services/sla-time.service';
import {NavigationEnd, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, Subscription} from 'rxjs';
import {CommonService} from '../../../../common-service/common.service';
import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CustomerRequestDTO} from '../../../../../shared/model/constants/customer-requestDTO';
import {DataPowerService} from '../../../../../shared/services/dataPower.service';
import {finalize, map} from 'rxjs/operators';
import moment from 'moment';
import {ModalNotification} from '../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {WebsocketClientService} from '../../../../../shared/services/websocket-client.service';
import {LOCAL_DATE_TIME} from '../../../../../shared/model/constants/common-constant';
import {LocalStorageService} from 'ngx-webstorage';
import {
	ACTION_T24, APPROVE, APPROVED_SUCCESS, CODE_00, CODE_OK,
	GET_TRANSACTION,
	HEADER_ACC_UTIL,
	HEADER_API_ACCOUNT,
	HEADER_SEATELLER,
	NOTIFICATION, OWNER_BENEFIT, PENDING, PURPOSE_LIST,
	SERVER_API_CUST_INFO,
	SERVER_API_URL_ACC_UTIL,
	SEVER_API_URL_SEATELLER,
	STATUS_OK,
	UPDATE_SIGNATURE,
	USERNAME_CACHED, UTILITY
} from '../../../../../shared/util/constant';
import {parseDateFrmStr} from '../../../../../shared/util/date-format-ultils';
import {ReportService} from '../../../../common-service/report.service';
import {DomSanitizer} from '@angular/platform-browser';
import {BodyRequestTransactionModel} from '../../../../model/body-request-transaction.model';
import {TransactionModel} from '../../../../model/transaction.model';
import {DataLinkMinio} from '../../../../model/data-link-minio';
import {UpdateSignatureComponent} from './update-signature/update-signature.component';
import {SignatureService} from '../identify-customer/service/signature.service';
import {getRandomTransId} from '../../../../../shared/util/random-number-ultils';
import {AppConfigService} from '../../../../../app-config.service';
import {CoreAiService} from '../identify-customer/service/core-ai.service';
import {IHeaderTableErrorModel} from '../../../../../shared/model/table-approve-error.model';
import {GtttUrlModel, SignatureModel} from '../../../../../shared/model/GtttUrl.model';
import {UpdateProspectIdInfoComponent} from './update-prospect-id-info/update-prospect-id-info.component';
import {UpdateCustomerInfoComponent} from './update-customer-info/update-customer-info.component';
import {
	BodyUdpateCustomerInfoModel,
	CustomerTemplateModel,
	FileUploadModel,
	InfoChange
} from './customer.model';
import {CustomerManageService} from './customer-manage.service';
import {INPUT_TYPE_ENUM, MAPPING_T24_FORMCONTROL_REQ_SEATELLER} from './customer-manage.constant';
import {AssertNotNull} from '@angular/compiler';
import {compareFunc, formartDateYYYYMMDD, LOG, saveRemoveCharacter} from '../../../../../shared/util/Utils';

@Component({
	selector: 'kt-customer-manage',
	templateUrl: './customer-manage.component.html',
	styleUrls: ['./customer-manage.component.scss']
})
export class CustomerManagerComponent implements OnInit, OnDestroy {

	// truy van giao dich
	@Input('viewData') viewData: any;

	@ViewChild(TransactionInfoComponent, {static: true})
	public transactionComponent: TransactionInfoComponent;

	@ViewChild(UpdateCustomerInfoComponent, {static: true})
	private updateCustomerInfoComponent: UpdateCustomerInfoComponent;

	@ViewChild(UpdateSignatureComponent, {static: true})
	private updateSignatureComponent: UpdateSignatureComponent;

	@ViewChild(UpdateProspectIdInfoComponent, {static: true})
	private updateProspectIdInfoComponent: UpdateProspectIdInfoComponent;

	parentForm: FormGroup;
	dataFrmDash: any;
	searchForm: FormGroup;
	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	customerId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	disableField$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingSendCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingAuthCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdateSignature: boolean = false;
	APPROVED: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	dataQA: any;

	showCheckboxCustomerManage: boolean = true;
	today = new Date;
	arrayOfImageSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	signaturesByUserId: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

	navigateSub: Subscription;
	firstNavigate$ = new BehaviorSubject<boolean>(false);
	listFax: any = [];
	listTax: any = [];

	isExpiredPP: boolean = false;
	idenArrary: any = [];
	headerError: IHeaderTableErrorModel[] = [];
	dataError: any;
	isLoading$ = new BehaviorSubject<boolean>(false);
	customer: any;
	customerT24: any = null;
	dateInputType = INPUT_TYPE_ENUM.DATE;
	ngSelectType = INPUT_TYPE_ENUM.NG_SELECT;
	private ownerAcct: boolean;// chu tai khoan thanh toan chung

	constructor(
		private fb: FormBuilder,
		public commonService: CommonService,
		public dataPowerService: DataPowerService,
		private modal: NgbModal,
		private router: Router,
		private websocketClientService: WebsocketClientService,
		private localStorage: LocalStorageService,
		private slaTimeService: SlaTimeService,
		private reportService: ReportService,
		private _sanitizer: DomSanitizer,
		private signatureService: SignatureService,
		private appConfigService: AppConfigService,
		private coreAiService: CoreAiService,
		private customerService: CustomerManageService
	) {
		this.accessRightIds = this.commonService.getRightIdsByUrl(
			this.router.url
		);
		this.navigateSub = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.firstNavigate$.next(true);
				this.initData();
			}
		});
	}

	ngOnInit() {
		if (this.firstNavigate$.getValue()) {
			return;
		}
		this.initData();
	}

	initData() {
		this.parentForm = this.fb.group({});
		this.showCheckboxCustomerManage = true;
		const username = this.localStorage.retrieve(USERNAME_CACHED);
		if (this.viewData) { // neu la chuc nang truy van giao dich
			this.dataFrmDash = this.viewData;
		} else {
			this.isUpdateSignature = window.history.state.isUpdateSignature;
			this.slaTimeService.startCalculateSlaTime();
			console.log('SLA START CUSTOMER UPDATE ======================>>>', this.slaTimeService.getStartTimeSLA());
			this.checkRight();
			this.commonService.manageAble$.next(true);
			this.commonService.isAsideRight$.next(true);
			this.commonService.isDisplayAsideRight$.next(true);
		}
		if (window.history.state.data) { // neu la chuc nang xem lai ban ghi
			this.dataFrmDash = window.history.state.data;
		}

		if (this.dataFrmDash) {
			// this.dataFrmDash = window.history.state.data;
			this.checkApproveStatus(this.dataFrmDash);
			this.customerService.getCustomerInfoRedis(this.dataFrmDash.id).subscribe(res => {
				if (res.seabRes.body.status == '00' && res.seabRes.body.enquiry.responseCode == CODE_00) {
					this.customerService.customerInfoT24$.next(res.seabRes.body.enquiry.product);
				}
			});

			if (this.dataFrmDash.status.includes('APPROVED')) {
				this.APPROVED.next(true);
			}

			const actionT24 = this.dataFrmDash.actionT24;

			switch (actionT24) {
				case ACTION_T24.UPDATE_CUSTOMER_INFO:
					this.commonService.isUpdateCus$.next(true);
					this.commonService.isUpdateSignature$.next(false);
					this.commonService.isUpdateProspectId$.next(false);
					break;
				case ACTION_T24.UPDATE_PROSPECT_ID:
					this.commonService.isUpdateProspectId$.next(true);
					this.commonService.isUpdateSignature$.next(false);
					this.commonService.isUpdateCus$.next(false);
					break;
				case ACTION_T24.UPDATE_SIGNATURE:
					this.commonService.isUpdateSignature$.next(true);
					this.commonService.isUpdateCus$.next(false);
					this.commonService.isUpdateProspectId$.next(false);
					break;
				default:
					this.commonService.isUpdateCus$.next(false);
					this.commonService.isUpdateProspectId$.next(false);
					this.commonService.isUpdateSignature$.next(false);
			}
			const listFile = this.dataFrmDash.listFile;
			if (listFile) {
				this.filterFileFromApi(listFile);
			}

			let cardFront = this.signatureService.buildImgSrcForGttt(this.dataFrmDash.cardFront);
			let cardBack = this.signatureService.buildImgSrcForGttt(this.dataFrmDash.cardBack);
			let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataFrmDash.pictureFace);
			let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataFrmDash.fingerLeft);
			let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataFrmDash.fingerRight);

			let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
			this.signatureService.gtttUrlModel$.next(gtttModel);
			const customerId = this.dataFrmDash.customerId;
			if (customerId.startsWith('PRO')) {
				this.getProspectCustomerInfo(customerId);
			} else {
				this.getCustomerInfo(customerId);
				this.getImageUser(customerId, gtttModel);
			}

			// this.getListSecurityQuestion(customerId);

			const similarity = this.dataFrmDash.similarityCoreAi;
			if (similarity) {
				this.signatureService.verifySignature$.next({
					similarity: Number(similarity),
					value: null,
					confidence: null,
					signatures: this.buildLinkNewSigRes(this.dataFrmDash.newSig)
				});
			}
		}
		if (window.history.state.customerId) {
			const customerId = window.history.state.customerId;
			this.transactionComponent.transactionForm.controls.customerId.setValue(customerId);
			this.customerId$.next(customerId);
			// khách hàng vãng lai
			if (customerId.startsWith('PRO')) {
				this.getProspectCustomerInfo(customerId);
			} else {
				this.getCustomerInfo(customerId);
			}

			this.getListSecurityQuestion(customerId);
		}

		if (window.history.state.isUpdateSignature) {
			this.commonService.isUpdateCus$.next(false);
			this.commonService.isUpdateProspectId$.next(false);
			this.commonService.isUpdateSignature$.next(true);
		}

		if (this.commonService.isUpdateCus$.getValue()) {
			this.commonService.cusTransId$.next(this.dataFrmDash.id);
		} else {
			const custTransId = getRandomTransId(username, 'customer');
			this.commonService.cusTransId$.next(custTransId);
		}
	}

	ngOnDestroy() {
		this.commonService.customerDataObject$.next(null);
		this.commonService.prospectCustomerData$.next(null);
		this.commonService.dataQA$.next(null);
		this.commonService.customerId$.next(null);

		this.commonService.manageAble$.next(false);
		this.commonService.isNotifyHasCancel$.next(false);
		this.commonService.isDisplayFile$.next(false);
		this.commonService.filesUploadByUserId.next(null);
		this.APPROVED.next(null);
		this.commonService.dataBase64$.next(null);
		this.arrayOfImageSubject$.next(null);

		this.commonService.isUpdateProspectId$.next(false);
		this.commonService.isUpdateCus$.next(false);
		this.commonService.isUpdateSignature$.next(false);

		this.slaTimeService.clearTimeSLA();
		if (this.navigateSub) {
			this.navigateSub.unsubscribe();
		}

		// remove image aside right
		this.coreAiService.navigateToCombo$.next(false);
		this.commonService.customerError$.next(null);
		// customer redis t24 to compare change info
		this.customerService.customerInfoT24$.next(null);
	}

	resetCustomerInfoForm() {
		if (this.updateCustomerInfoComponent.customerForm) {
			this.updateCustomerInfoComponent.customerForm.reset();
			this.updateCustomerInfoComponent.identification.reset();
			this.updateCustomerInfoComponent.contactInfo.reset();
			this.updateCustomerInfoComponent.questionAnswer.reset();
			this.updateCustomerInfoComponent.contactInfo.reset();
			this.updateCustomerInfoComponent.taxs.reset();
			this.updateCustomerInfoComponent.faxs.reset();

			this.updateCustomerInfoComponent.removeValidators(this.updateCustomerInfoComponent.customerForm);
			this.updateCustomerInfoComponent.disabledForm;
		}
	}

	resetUpdateProspectForm() {
		if (this.updateProspectIdInfoComponent.prospectForm) {
			this.updateProspectIdInfoComponent.prospectForm.reset();
			this.updateProspectIdInfoComponent.identificationPaperForm.reset();
			this.updateProspectIdInfoComponent.contactForm.reset();
			this.updateProspectIdInfoComponent.removeValidators(this.updateProspectIdInfoComponent.prospectForm);
		}
	}

	fetchAPICustomer(customerId?) {
		this.commonService.isUpdateCus$.next(false);
		this.commonService.isUpdateSignature$.next(false);
		this.commonService.isUpdateProspectId$.next(false);

		this.resetCustomerInfoForm();
		this.resetUpdateProspectForm();
		this.resetOldValueChildComponent();

		if (this.commonService.customerId$.getValue() && this.commonService.changeCustomerGTTT$.getValue()) {
			this.getCustomerInfo(this.commonService.customerId$.getValue());
		} else {
			if (customerId.startsWith('PRO')) {
				this.getProspectCustomerInfo(customerId);
			} else {
				this.getCustomerInfo(customerId);
				const imageUser = new GtttUrlModel(null, null, null, null, null);
				this.getImageUser(customerId, imageUser);
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

	getCustomerInfo(customerId) {
		// call api to check acct owner customer
		this.checkOwnerCustomerAcct(customerId);

		this.commonService.customerDataObject$.next(null);
		this.customerService.customerInfoT24$.next(null);

		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => {
				this.isLoadingCustomerInfo$.next(false);
				if (!this.dataFrmDash) {
					this.getListSecurityQuestion(customerId);
				}
			}))
			.subscribe(res => {
				if (res) {
					this.disableField$.next(true);
					if (!this.commonService.isUpdateCus$.getValue()) {
						this.commonService.customerDataObject$.next(res.enquiry);
					}
					this.commonService.isDisplayFile$.next(true);
					// this.commonService.getFilesByCustomerId(customerId);
					// this.getSignatureByUserId(customerId);
					if (this.dataFrmDash) {
						this.customerT24 = res.enquiry;
					}
				}
			});
	}

	getProspectCustomerInfo(customerId) {
		this.commonService.prospectCustomerData$.next(null);
		this.isLoadingCustomerInfo$.next(true);

		let bodyConfig = CustomerRequestDTO.BODY.BODY_PROSPECT_CUSTOMER;
		bodyConfig.enquiry.customerId = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_URL_ACC_UTIL);
		const header = this.appConfigService.getConfigByKey(HEADER_ACC_UTIL);

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.commonService.prospectCustomerData$.next(res.enquiry.custCurrAccount[0]);
					this.disableField$.next(true);
				}
			});
	}

	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	mapIdentityPapersForProspectCustomer(listIdentityPaper: any []) {
		const idRecord = this.parentForm.controls.transactionForm.value.transId;
		return listIdentityPaper.map(item => (
			{
				id: item.id,
				idenAdress: item.idenAdress,
				idenAddress: item.idenAddress,
				gttt: item.gttt,
				idenTimeExpired: item.idenTimeExpired ? moment(item.idenTimeExpired).format('DD-MM-YYYY') : null,
				idenTime: item.idenTime ? moment(item.idenTime).format('DD-MM-YYYY') : null,
				idenType: item.idenType,
				organization: item.organization,
				idCustomer: (this.dataFrmDash && this.dataFrmDash.id) ? this.dataFrmDash.id : idRecord
			}));
	}

	mapContactsForProspectCustomer(prospectContacts: any []) {
		const idRecord = this.parentForm.controls.transactionForm.value.transId;
		return prospectContacts.map(contact => (
			{
				phone: contact.phone,
				mobile: contact.mobile,
				email: contact.email,
				priority: contact.priority,
				idCustomer: (this.dataFrmDash && this.dataFrmDash.id) ? this.dataFrmDash.id : idRecord
			}));
	}

	updateProspectId() {
		console.log(this.parentForm);
		this.isLoadingSendCustomerInfo$.next(true);

		const transactionForm = this.parentForm.controls.transactionForm.value;

		const formData = this.parentForm.get('prospectForm').value;

		const auditForm = this.parentForm.get('auditInfoForm').value;

		const listProspectContact = this.parentForm.controls.prospectForm.value.contactInfosForm;

		const listIdentityPaperMapper = this.parentForm.controls.prospectForm.value.identification;

		const idRecord = (this.dataFrmDash && this.dataFrmDash.id)
			? this.dataFrmDash.id
			: transactionForm.transId;

		const customerId = (this.dataFrmDash && this.dataFrmDash.customerId)
			? this.dataFrmDash.customerId
			: transactionForm.customerId;

		let transactionBody = {

			id: idRecord,

			customerId: customerId,

			customerName: formData ? formData.customerName : null,

			title: formData ? formData.title : null,

			sex: formData ? formData.sex : null,

			birthday: moment(formData.birthday).format('DD-MM-YYYY'),

			placeOfBirth: formData ? formData.placeOfBirth : null,

			maritalStatus: formData ? formData.maritalStatus : null,

			national: formData ? formData.national.toString().replaceAll(',', ';') : null,

			stress: formData ? formData.street : null,

			district: formData ? formData.district : null,

			province: formData ? formData.province : null,

			country: formData ? formData.country : null,

			customerAddress: formData ? formData.customerAddress : null,

			inputter: auditForm ? auditForm.inputter : null,

			priority: transactionForm ? transactionForm.priority : null,

			rateAgency: formData ? formData.rateAgency : '',

			otherRateAgency: formData ? formData.otherRateAgency : '',

			creditClass: formData ? formData.creditClass : '',

			ratingType: formData ? formData.ratingType : '',

			rateTerm: formData ? formData.rateTerm : '',

			ratingDate: (formData && formData.ratingDate) ? moment(formData.ratingDate).format('DD-MM-YYYY') : null,

			creditRate: formData ? formData.creditRate : '',

			actionT24: ACTION_T24.UPDATE_PROSPECT_ID,

			identityPapers: this.mapIdentityPapersForProspectCustomer(listIdentityPaperMapper),

			customerCommunications: this.mapContactsForProspectCustomer(listProspectContact),

			coCode: auditForm.coCode,

			coCodeT24: auditForm.coCode,

			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),

			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataFrmDash),
		};

		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

		let bodyReq = {
			command: GET_TRANSACTION,
			transaction: {
				authenType: this.dataFrmDash ? 'editInputUpdateProspectId' : 'inputUpdateProspectId',
				data: transactionBody
			}
		};

		this.dataPowerService.actionGetTransactionResponseCusApi(bodyReq, header, url)
			.pipe(finalize(() => this.isLoadingSendCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == '00') {
					this.commonService.success(`Bản ghi ${transactionBody.id} đã được gửi duyệt với KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.CUSTOMER_MANAGER);
					this.router.navigate(['/pages/dashboard']);
				} else {
					this.commonService.error(`Bản ghi ${transactionBody.id} gửi duyệt không thành công`);
				}
			});
	}

	onSubmit() {
		this.customer = this.updateCustomerInfoComponent.customerForm.value;
		console.log('Form controls quản lý TTKH', this.parentForm);
		this.slaTimeService.endCalculateSlaTime();

		if (!this.commonService.isUpdateCus$.getValue()
			&& !this.commonService.isUpdateSignature$.getValue()
			&& !this.commonService.isUpdateProspectId$.getValue()) {
			return;
		}

		//TODO CẬP NHẬT THÔNG TIN KH VÃNG LAI
		if (this.commonService.isUpdateProspectId$.getValue() == true) {
			this.updateProspectId();
			return;
		}

		const transactionForm = this.parentForm.controls.transactionForm.value;

		const idRecord = (this.dataFrmDash && this.dataFrmDash.id)
			? this.dataFrmDash.id
			: transactionForm.transId;

		let cardFront: string = null, cardBack: string = null, fingerLeft: string = null, fingerRight: string = null;
		const gtttUrlModel = this.signatureService.gtttUrlModel$.getValue();
		if (gtttUrlModel) {
			(gtttUrlModel.cardFront && gtttUrlModel.cardFront != 'assets/media/logos/nodata.png') && (cardFront = gtttUrlModel.cardFront);
			(gtttUrlModel.cardBack && gtttUrlModel.cardBack != 'assets/media/logos/nodata.png') && (cardBack = gtttUrlModel.cardBack);
			(gtttUrlModel.fingerLeft && gtttUrlModel.fingerLeft != 'assets/media/logos/nodata.png') && (fingerLeft = gtttUrlModel.fingerLeft);
			(gtttUrlModel.fingerRight && gtttUrlModel.fingerRight != 'assets/media/logos/nodata.png') && (fingerRight = gtttUrlModel.fingerRight);
		}

		if (this.commonService.isUpdateCus$.getValue()) {
			if (this.updateCustomerInfoComponent.checkAge()) {
				this.commonService.error('Vui lòng xem lại các trường nhập liệu');
				return;
			}
			if (this.parentForm.invalid) {
				// console.log('this.parentForm.value', this.parentForm);
				this.parentForm.markAllAsTouched();
				this.commonService.error('Vui lòng nhập đủ các trường thông tin bắt buộc');
				return;
			}
			const dirtyForms = this.checkDirtyForms();
			// push raw data to redis
			if (this.dataFrmDash && this.dataFrmDash.id) {
			} else {
				const bodyRedis = this.mappingT24ToUpdateReq(this.commonService.customerDataObject$.getValue(), MAPPING_T24_FORMCONTROL_REQ_SEATELLER, this.dataQA);
				bodyRedis.questionsOnly = dirtyForms && dirtyForms.includes('questionAnswer');// tan dung truong nay de danh dau thay doi cau hoi bao mat cho resend bieu mau
				bodyRedis.id = idRecord;
				this.customerService.saveCustomerInfoToRedis(bodyRedis)
					.subscribe(console.log);
			}
			const arr = [...this.parentForm.controls.customerForm.value.identification];
			this.idenArrary = arr.map(item => (
				{
					id: item.id,
					idenAdress: item.idenAdress,
					gttt: item.gttt,
					idenTimeExpired: item.idenTimeExpired ? moment(item.idenTimeExpired).format('DD-MM-YYYY') : '',
					idenTime: item.idenTime ? moment(item.idenTime).format('DD-MM-YYYY') : '',
					idenType: item.idenType,
					organization: item.organization,
					idCustomer: idRecord
				}));

			this.isExpiredPP = false;

			let listGTTT = [...this.idenArrary];
			if (this.parentForm.get('customerForm.national').value && this.parentForm.get('customerForm.national').value.includes('VN')) {
				let listPP = listGTTT.filter(item => item.idenType == 'PP');
				let listVisa = listGTTT.filter(item => item.idenType == 'VISA');

				if (listPP.length > 1) {
					this.commonService.error('Không được đăng ký 2 Pass Port cùng một thời điểm');
					return;
				}

				if (listVisa.length > 1) {
					this.commonService.error('Không được đăng ký 2 Visa cùng một thời điểm');
					return;
				}
				// console.log('ListPPPPPP', listPP);
				if ((listVisa.length > 0 && listPP.length > 0) || (listVisa.length > 0 && listPP.length == 0)) {
					listVisa.map((item) => {
						if (parseDateFrmStr(item.idenTimeExpired) < this.today) {
							// console.log('Ngày hết hạn thị thực', item.idenTimeExpired);
							this.commonService.error('Visa của bạn đã hết hạn, cần cập nhật ngày hết hạn thị thực');
							// this.commonService.isExpiredPP$.next(true)
							this.isExpiredPP = true;
							// this.commonService.indexVisaError$.next(index);
							return;
						}
					});
					if (this.isExpiredPP) {
						return;
					}
				} else if (listVisa.length == 0 && listPP.length > 0) {
					listPP.map((item) => {
						if (parseDateFrmStr(item.idenTimeExpired) < this.today) {
							// console.log('Ngày hết hạn thị thực', item.idenTimeExpired);
							this.commonService.error('Pass Port của bạn đã hết hạn, cần cập nhật ngày hết hạn thị thực');
							// this.commonService.isExpiredPP$.next(true)
							this.isExpiredPP = true;
							// this.commonService.indexVisaError$.next(index);
							return;
						}
					});
					if (this.isExpiredPP) {
						return;
					}
				}
			}
			console.warn('>>>> parent form', this.parentForm);
			if (this.updateCustomerInfoComponent.frm.stress.value.length + this.updateCustomerInfoComponent.frm.town.value.length > 69) {
				this.updateCustomerInfoComponent.maxLengthAddress$.next('Độ dài trường Đường/Phố + Phường/Xã phải < 69 ký tự');
				this.updateCustomerInfoComponent.inputStress.nativeElement.focus();
				return;
			} else {
				this.updateCustomerInfoComponent.maxLengthAddress$.next(null);
			}

			const userName = JSON.parse(localStorage.getItem('userProfile')).shortName;
			const parent = this.parentForm.controls;
			const securityQuestions = parent.customerForm.value.questionAnswer.map(question => ({
				// id: question.id,
				answer: question.answer,
				question: question.question,
				customerTransId: idRecord,
				// customerId: question.customerId
			}));

			const customerCommunications = parent.customerForm.value.contactInfos.map(contact => ({
				phone: contact.phone,
				mobile: contact.mobile,
				email: contact.email,
				priority: contact.priority,
				idCustomer: idRecord
			}));
			const similarity = this.signatureService.verifySignature$.getValue() ? this.signatureService.verifySignature$.getValue().similarity : null;
			const cusRelationships = parent.customerForm.value.relates;

			let body = {
				"oldAddressLength": parent.customerForm.value.oldAddressLength,
				"oldCurrAddressLength": parent.customerForm.value.oldCurrAddressLength,
				"oldStressLength": parent.customerForm.value.oldStressLength,
				'isSameIdenAddress': parent.customerForm.value.isSameIdenAddress,
				'id': idRecord,
				'customerId': parent.customerForm.value.customerId,
				'customerName': parent.customerForm.value.customerName,
				'sex': parent.customerForm.value.sex,
				'birthday': moment(parent.customerForm.value.birthday).format('DD-MM-YYYY'),
				'placeOfBirth': parent.customerForm.value.placeOfBirth,
				'maritalStatus': parent.customerForm.value.maritalStatus,
				'purpose': parent.customerForm.value.purpose,
				'national': parent.customerForm.value.national.toString().replaceAll(',', ';'),
				'residentStstus': parent.customerForm.value.residentStstus,
				'residentNational': parent.customerForm.value.residentNational,
				'gttt': parent.customerForm.value.gttt,
				'idenType': parent.customerForm.value.idenType,
				'organization': parent.customerForm.value.organization,
				'idenTime': moment(parent.customerForm.value.idenTime).format('DD-MM-YYYY'),
				'idenAdress': parent.customerForm.value.idenAdress,
				'idenTimeExpired': moment(parent.customerForm.value.idenTimeExpired).format('DD-MM-YYYY'),
				'idenTimeValue': parent.customerForm.value.idenTimeValue ? moment(parent.customerForm.value.idenTimeValue).format('DD-MM-YYYY') : null,
				'identityPapers': this.idenArrary,
				'securityQuestions': securityQuestions,//parent.customerForm.value.questionAnswer,
				'customerCommunications': customerCommunications,//parent.customerForm.value.contactInfos,
				'country': parent.customerForm.value.country,
				'phone': parent.customerForm.value.phone,
				'mobile': parent.customerForm.value.mobile,
				'email': parent.customerForm.value.email,
				'idenAddress': this.customer.idenAddress, // Địa chỉ thường trú
				'stress': this.customer.town ? (this.customer.stress + ',' + this.customer.town) : this.customer.stress,
				'customerAddress': this.updateCustomerInfoComponent.buildDataAddress(), // trường address truyền ngầm vào BE
				'district': parent.customerForm.value.district,
				'province': parent.customerForm.value.province,
				'priority': parent.transactionForm.value.priority,
				'loyalty': parent.customerForm.value.loyalty,
				'title': parent.customerForm.value.title,
				'portfolio': parent.customerForm.value.portfolio,
				'ownerBen': parent.customerForm.value.ownerBen,
				'ownCustomer': parent.customerForm.value.ownCustomer,
				'employment': parent.customerForm.value.employment,
				'occupation': parent.customerForm.value.occupation,
				'employerName': parent.customerForm.value.employerName,
				'employerAddress': parent.customerForm.value.employerAddress,
				'industryGroup': parent.customerForm.value.industryGroup,
				'industry': parent.customerForm.value.industry,
				'industryClass': parent.customerForm.value.industryClass,
				'noOfDependents': parent.customerForm.value.noOfDependents,
				'customerCurrency': parent.customerForm.value.customerCurrency,
				'salaryReq': parent.customerForm.value.salaryReq,
				'fax': null,
				'taxId': null,
				'relate': parent.customerForm.value.relate,
				'relationCustomer': parent.customerForm.value.relationCustomer,
				'actionT24': ACTION_T24.UPDATE_CUSTOMER_INFO,
				'answer': parent.customerForm.value.answer,
				'securityQues': parent.customerForm.value.securityQues,
				'inputter': userName,
				'coCode': this.commonService.groupOwner$.getValue(),
				'timeUpdate': moment(new Date()).format(LOCAL_DATE_TIME),
				'timeSlaInputter': this.slaTimeService.calculateSlaTimeInput(this.dataFrmDash),
				cusRelationships: cusRelationships,
				similarityCoreAi: `${similarity}`,
				listFile: [],
				questionsOnly: false,
				// cap nhat hinh anh KH vao core ai
				cardFrontBase64: cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
				cardBackBase64: cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
				pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
				fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
				fingerRightBase64: this.coreAiService.fingerRightScan$.getValue()
			};


			this.listFax = [];
			this.listTax = [];
			const faxArray = [...parent.customerForm.value.faxs];
			faxArray.forEach(fax => {
				// console.log('faxID', fax);
				this.listFax.push(fax.fax);
			});
			body.fax = this.listFax.toString().replaceAll(',', ';');
			// console.log('dataListFax', this.listFax);

			const taxArray = [...parent.customerForm.value.taxs];
			taxArray.forEach(tax => {
				// console.log('objectTax', tax);
				this.listTax.push(tax.taxId);
			});
			body.taxId = this.listTax.toString().replaceAll(',', ';');
			// console.log('dataListTax', this.listTax);
			let filesUpload: any[] = [];
			this.signatureService.signatureFiles$.asObservable()
				.subscribe((res: FileUploadModel[]) => {
					if (res.length) {
						if (true) {
							filesUpload = res;
							filesUpload = filesUpload.map(file => {
								return {
									customerId: file.customerId ? file.customerId : '',
									fileData: file.fileData ? file.fileData.split(',')[1] : '',
									fileName: file.fileName ? file.fileName : 'Don dang ky dich vu hang ngay',
									fileType: file.fileType,
									folder: file.folder ? file.folder : '',
									id: file.id ? file.id : '',
									isSignature: file.isSignature,
									note: file.note ? file.note : '',
									transactionId: file.transactionId ? file.transactionId : ''
								};
							});
						} else {
							filesUpload = [];
						}
					} else {
						filesUpload = [];
					}
				});
			body.listFile = filesUpload;
			// check chi thay doi cau hoi bao mat
			if (dirtyForms && dirtyForms.length) {
				const uniqueDirtyForms = [...new Set(dirtyForms)];
				body.questionsOnly = uniqueDirtyForms.length == 1 && uniqueDirtyForms.includes('questionAnswer');
			}

			let bodyConfig = this.dataFrmDash ? CustomerRequestDTO.BODY.BODY_UPDATE_CUSTOMER : CustomerRequestDTO.BODY.BODY_CREATE_CUSTOMER;
			bodyConfig.transaction.data = body;
			this.isLoadingSendCustomerInfo$.next(true);

			const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
			const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

			this.dataPowerService.actionGetTransactionResponseCusApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingSendCustomerInfo$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == '00') {
						this.commonService.success(`Bản ghi ${body.id} đã được gửi duyệt với KSV`);
						this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.CUSTOMER_MANAGER);
						this.router.navigate(['/pages/dashboard']);
					} else {
						this.commonService.error(`Bản ghi ${body.id} gửi duyệt không thành công`);
					}
				});
		} else if (this.commonService.isUpdateSignature$.getValue()) {
			this.onUpdateSignature(cardFront, cardBack, fingerLeft, fingerRight);
		}

	}

	approveCus() {
		this.slaTimeService.endCalculateSlaTime();
		// console.log('time end', this.slaTimeService.getTimeEndSLA());
		const userName = JSON.parse(localStorage.getItem('userProfile')).shortName;
		let body = {
			id: this.dataFrmDash.id,
			authoriser: userName,
			actionT24: 'APPROVED',
			timeAuth: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaAuthorise: this.slaTimeService.calculateSlaTimeAuth(this.dataFrmDash)
		};

		this.isLoadingAuthCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_APPROVE_CUSTOMER;
		bodyConfig.transaction.data = body;

		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		let _this = this;
		this.dataPowerService.actionGetTransactionResponseCusApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingAuthCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == '00') {
					this.commonService.success(`Bản ghi ${body.id} đã được duyệt thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataFrmDash.inputter, NOTIFICATION.APPROVED, _this.dataFrmDash.id, NOTIFICATION.PRODUCT_TYPE.CUSTOMER_MANAGER);
					this.router.navigateByUrl('/pages/dashboard');
				} else {
					this.commonService.error(`Bản ghi ${body.id} đã duyệt không thành công`);
					this.websocketClientService.sendMessageToUser(_this.dataFrmDash.inputter, NOTIFICATION.APPROVED_ERROR, _this.dataFrmDash.id, NOTIFICATION.PRODUCT_TYPE.CUSTOMER_MANAGER);
					this.router.navigateByUrl('/pages/dashboard');
				}
			});
	}

	deleteCus() {
		this.commonService.isNotifyHasCancel$.next(true);

		const modalRef = this.modal.open(ModalNotification, {
			size: 'lg',
			windowClass: 'notificationDialog',
		});
		modalRef.componentInstance.textNotify =
			'Bạn muốn xóa bản cập nhật thông tin khách hàng ?';
		modalRef.result.then((result) => {
			if (result == true) {
				this.commonService.isNotifyHasCancel$.next(false);
				let body = {
					id: this.dataFrmDash.id,
				};
				this.isLoadingCustomerInfo$.next(true);
				let bodyConfig = CustomerRequestDTO.BODY.BODY_DELETE_CUSTOMER;
				bodyConfig.transaction.data = body;

				const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
				const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

				this.dataPowerService.actionGetTransactionResponseCusApi(bodyConfig, header, url)
					.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
					.subscribe(res => {
						if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == '00') {
							this.commonService.success(`Bản ghi ${body.id} đã được xóa thành công`);
							this.router.navigateByUrl('/pages/dashboard');
						} else {
							this.commonService.error(`Bản ghi ${body.id} xóa không thành công`);
							return;
						}
					});
			} else {
				return;
			}

		});
	}

	removeForm() {
		this.commonService.isNotifyHasCancel$.next(true);
		let modalRef = this.modal.open(ModalNotification, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
			centered: true,
			windowClass: 'notificationDialog'
		});

		modalRef.componentInstance.textNotify = 'Bạn có chắc chắn muốn xóa dữ liệu đã nhập ?';

		modalRef.result.then(r => {
			if (r == true) {
				this.updateCustomerInfoComponent.customerForm.reset();
			} else {
				return;
			}
		});
	}

	rejectCus() {
		if (!this.parentForm.controls.auditInfoForm.value.reason) {
			this.parentForm.get('auditInfoForm.reason').setErrors({required: true});
			this.parentForm.markAllAsTouched();
			return;
		}
		this.commonService.isNotifyHasCancel$.next(true);

		const modalRef = this.modal.open(ModalNotification, {
			size: 'lg',
			windowClass: 'notificationDialog',
		});
		modalRef.componentInstance.textNotify =
			'Bạn muốn từ chối bản cập nhật thông tin khách hàng ?';
		modalRef.result.then((result) => {
			if (result == true) {
				this.commonService.isNotifyHasCancel$.next(false);
				let body = {
					id: this.dataFrmDash.id,
					reasonReject: this.parentForm.controls.auditInfoForm.value.reason,
					authoriser: this.localStorage.retrieve(USERNAME_CACHED),
					timeRejected: moment(new Date()).format(LOCAL_DATE_TIME),
				};
				this.isLoadingCustomerInfo$.next(true);
				let bodyConfig = CustomerRequestDTO.BODY.BODY_REJECT_CUSTOMER;
				bodyConfig.transaction.data = body;
				const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
				const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
				let _this = this;
				this.dataPowerService.actionGetTransactionResponseCusApi(bodyConfig, header, url)
					.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
					.subscribe(res => {
						if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == '00') {
							// const modalRef = this.modal.open(ModalNotification, {
							// 	size: 'lg',
							// 	windowClass: 'notificationDialog',
							// });
							this.commonService.success(`Bản ghi ${body.id} đã bị từ chối bới KSV`);
							this.websocketClientService.sendMessageToUser(_this.dataFrmDash.inputter, NOTIFICATION.APPROVE_CANCEL, _this.dataFrmDash.id, NOTIFICATION.PRODUCT_TYPE.CUSTOMER_MANAGER);
							this.router.navigateByUrl('/pages/dashboard');
						} else {
							this.commonService.error(`Bản ghi ${body.id} từ chối không thành công`);
							return;
						}
					});
			} else {
				return;
			}

		});
	}

	getListSecurityQuestion(customerId) {
		let bodyConfig = CustomerRequestDTO.BODY.BODY_QUESTION;
		bodyConfig.enquiry.data.customerId = customerId;

		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);
		this.dataPowerService.actionGetTransactionResponseApiQA(bodyConfig, header, url)
			.subscribe(res => {
				if (res) {
					this.dataQA = res.seabRes.body.enquiry.product;
					const bodyT24 = this.mappingT24ToUpdateReq(this.commonService.customerDataObject$.getValue(), MAPPING_T24_FORMCONTROL_REQ_SEATELLER, this.dataQA);
					this.customerService.customerInfoT24$.next(bodyT24);
					this.commonService.dataQA$.next(res.seabRes.body.enquiry.product);
				} else {
					return;
				}
			});
	}

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	/**
	 * TODO - viet lai, thay doi theo template thay doi thong tin KH
	 */
	getReportId() {
		const customerT24 = this.commonService.customerDataObject$.getValue();
		const rawCustomerInfo = customerT24 ? customerT24 : this.customerT24;
		const customerInfo = this.frm.customerForm ? this.frm.customerForm.value : null;
		const dirtyForms = this.checkDirtyForms();
		let body: CustomerTemplateModel = new CustomerTemplateModel();
		body.authenType = 'getRequest_SEATELLER_THAY_DOI_TT_KH';
		body.transactionId = this.frm.transactionForm.value.transId;
		body.exportType = 'PDF';
		body.actionCustomer = {
			updateInfo: false,
			updateOwnerInfo: false,
			other: null,
			changeSecurityQuestion: false
		};
		if (this.commonService.isUpdateSignature$.getValue()) {
			body.actionCustomer.updateInfo = true;
		}
		if (this.commonService.isUpdateCus$.getValue()) { // thay doi thong tin KH
			body.infoChange = new InfoChange();
			body.actionCustomer.updateInfo = true;
			body.infoChange = this.updateCustomerInfoComponent.getValueChangeReport();
			if (body.infoChange.ownerBen) {
				body.actionCustomer.updateOwnerInfo = true;
				const owner = OWNER_BENEFIT.find(ele => ele.value == customerInfo.ownerBen).nameVi;

				body.ownerCustomer = {
					otherOwner: !['1.CHU TAI KHOAN', '1.DONG SO HUU'].includes(customerInfo.ownerBen),
					otherOwnerName: owner,
					ownerAcc: customerInfo.ownerBen == '1.CHU TAI KHOAN',
					ownerExtraCard: false,
					ownerSeab: customerInfo.ownerBen == '1.DONG SO HUU',
					purposeOfTrans: body.infoChange.purpose
				};

			}
			/*
			const relates = customerInfo.relates;
			if (relates) { // thay doi thong tin chu so huu huong loi
				if (relates.findIndex(ele => ele.relationCustomer == '99') > -1) {
					body.ownerPaymentAcc = this.updateCustomerInfoComponent.getValueChangeReport();
					// body.ownerCustomer = null;
					body.infoChange = null;
					body.actionCustomer.updateInfo = false;
					body.actionCustomer.updateOwnerInfo = true;
				}
			}
			 */
			if (this.ownerAcct) {
				body.ownerPaymentAcc = this.updateCustomerInfoComponent.getValueChangeReport();
				// body.ownerCustomer = null;
				body.infoChange = null;
				body.actionCustomer.updateInfo = false;
				body.actionCustomer.updateOwnerInfo = true;
			}
		}
		body.customerInfo = {
			customerID: rawCustomerInfo.customerID,
			gttt: saveRemoveCharacter(rawCustomerInfo.legalID, '#', ';'),
			fullName: rawCustomerInfo.shortName,
			issueDate: rawCustomerInfo.legalIssDate.split('#').map(ele => formartDateYYYYMMDD(ele)).join(';'),
			issuesAddress: saveRemoveCharacter(rawCustomerInfo.legalIssAuth, '#', ';')
		};
		if (dirtyForms.includes('questionAnswer') || this.customerService.customerInfoT24$.getValue().questionsOnly) {
			body.actionCustomer.changeSecurityQuestion = true;
			body.sercurityQuestions = customerInfo.questionAnswer.reduce((acc, nex) => {
				return acc.concat({
					question: nex.question,
					answer: nex.answer
				});
			}, []);
		}

		const bodyRequest = {
			command: 'GET_REPORT',
			report: body
		};
		this.isLoading$.next(true);
		this.reportService.getReportForm(bodyRequest)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(res => {
				if (res && res.status == STATUS_OK && res.responseCode == '00') {
					let dataLink: DataLinkMinio = new DataLinkMinio();
					dataLink.fileName = res.report.data.fileName;
					dataLink.fileType = res.report.data.fileType;
					dataLink.bucketName = res.report.data.bucketName;
					dataLink.folder = res.report.data.folder;
					// console.log(dataLink);
					this.websocketClientService.sendMessageToTablet([dataLink], 'viewForm');
					window.open(`${this.reportService.minioLink}/${res.report.data.bucketName}/${res.report.data.folder}`, '_blank');
				}
			});
	}

	/**
	 * TODO - viet lai ham update signature nay.
	 */
	onUpdateSignature(cardFront: string, cardBack: string, fingerLeft: string, fingerRight: string) {
		const userName = JSON.parse(localStorage.getItem('userProfile')).shortName;
		this.isLoadingSendCustomerInfo$.next(true);
		let command = GET_TRANSACTION;

		let filesUpload: any[] = [];
		this.signatureService.signatureFiles$.asObservable()
			.subscribe((res: FileUploadModel[]) => {
				if (res.length) {
					if (true) {
						filesUpload = res;
						filesUpload = filesUpload.map(file => {
							return {
								customerId: file.customerId ? file.customerId : '',
								fileData: file.fileData ? file.fileData.split(',')[1] : '',
								fileName: file.fileName ? file.fileName : 'Don dang ky dich vu hang ngay',
								fileType: file.fileType,
								folder: file.folder ? file.folder : '',
								id: file.id ? file.id : '',
								isSignature: file.isSignature,
								note: file.note ? file.note : '',
								transactionId: file.transactionId ? file.transactionId : ''
							};
						});
					} else {
						filesUpload = [];
					}
				} else {
					filesUpload = [];
				}
			});

		if (filesUpload.findIndex(file => file.isSignature) < 0) {
			this.commonService.error('Bạn chưa tích chọn file chứa chữ ký nào');
			this.isLoadingSendCustomerInfo$.next(false);
			return;
		}

		let transaction = new TransactionModel();
		const verifySignature = this.signatureService.verifySignature$.getValue();
		const similarity = verifySignature ? verifySignature.similarity : null;
		const newSig = this.buildNewSigLinkReq(verifySignature ? verifySignature.signatures : []);
		transaction.authenType = UPDATE_SIGNATURE;
		transaction.data = {
			actionT24: 'UPDATE_SIGNATURE',
			customerId: this.frm.transactionForm.value.customerId,
			id: this.frm.transactionForm.value.transId,
			priority: this.frm.transactionForm.value.priority,
			listFile: filesUpload,
			coCode: this.commonService.groupOwner$.getValue(),
			inputter: userName,
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataFrmDash),
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			similarityCoreAi: `${similarity}`,
			description: this.frm.signatureForm.value.description,
			// cap nhat hinh anh KH vao core ai
			cardFrontBase64: cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
			// them hinh anh chu ky moi
			newSig: newSig.join('#')
		};

		let body: BodyRequestTransactionModel = new BodyRequestTransactionModel(command, transaction);
		console.log(body, 'boy update signature');
		this.commonService.actionGetTransactionResponseApi(body)
			.pipe(finalize(() => this.isLoadingSendCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.transaction.responseCode == '00') {
					this.commonService.success('Cập nhật chữ ký mẫu thành công');
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.CUSTOMER_MANAGER);
					this.router.navigate(['/pages/dashboard']);
				}
			});
	}

	/**
	 * Lấy trạng thái của Card (nếu đã được duyệt)
	 */
	get STATUS_APPROVED() {
		if (this.dataFrmDash && this.dataFrmDash.status) {
			return this.dataFrmDash.status == APPROVE || this.dataFrmDash.status == APPROVED_SUCCESS;
		}
	}

	get STATUS_PENDING() {
		if (this.dataFrmDash && this.dataFrmDash.status) {
			return this.dataFrmDash.status == PENDING;
		}
	}

	checkApproveStatus(stateData) {
		if (stateData.status == 'APPROVED_ERROR') {
			if (stateData.actionT24 == ACTION_T24.UPDATE_CUSTOMER_INFO) {
				this.headerError = [{
					code: 'updateCustInfo',
					value: 'Cập nhật thông tin cá nhân'
				}];
				this.dataError = {
					updateCustInfo: {
						status: 'Duyệt lỗi',
						desc: stateData.errorDesc
					}
				};
			} else {
				this.headerError = [{
					code: 'updateSignature',
					value: 'Cập nhật chữ ký mẫu'
				}];
				this.dataError = {
					updateSignature: {
						status: 'Duyệt lỗi',
						desc: stateData.errorDesc
					}
				};
			}
		}
	}

	getRawLink(link: string): string {
		return this.coreAiService.returnLinkGetImage(link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?')));
	}

	filterFileFromApi(listFile: FileUploadModel[]) {
		listFile.forEach(file => {
			if (file.fileName.includes('signature')) {
				file.isSignature = true;
			}
		});
		this.signatureService.updateSignatureFileUpload(listFile);
	}

	getDirtyValues(form: any) {
		let dirtyValues = {};
		Object.keys(form.controls)
			.forEach(key => {
				let currentControl = form.controls[key];
				if (currentControl.dirty) {
					if (currentControl.controls) {
						dirtyValues[key] = this.getDirtyValues(currentControl);
					} else {
						dirtyValues[key] = currentControl.value;
					}
				}
			});
		return dirtyValues;
	}

	refreshError(): void {
		if (this.dataFrmDash && this.dataFrmDash.status == 'APPROVED') {
			this.isLoading$.next(true);
			this.customerService.refreshError(this.dataFrmDash.id)
				.pipe(finalize(() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.responseCode == CODE_OK) {
						const data = res.seabRes.body.enquiry.product;
						this.checkApproveStatus(data);
					}
				});
		}
	}

	getValue(str: string): string {
		if (!!str) {
			return str;
		}
		return '';
	}

	mappingT24ToUpdateReq(customerInfo: any, mapKeyProp: any, dataQA: any): BodyUdpateCustomerInfoModel {
		return this.customerService.mappingT24ToUpdateReq(customerInfo, mapKeyProp, dataQA);
	}

	resetOldValueChildComponent() {
		this.updateCustomerInfoComponent.oldDistrictList = null;
		this.updateCustomerInfoComponent.oldOccupationList = null;
		this.updateCustomerInfoComponent.oldIndustrys = null;
		this.updateCustomerInfoComponent.oldIndustryClass = null;
		this.updateCustomerInfoComponent.oldOccu = null;
	}

	/**
	 * ham nay trả về formcontrolname mà bị thay đổi value
	 * @private
	 */
	private checkDirtyForms() {
		const dirtyKeys = [];
		const formValue = JSON.parse(JSON.stringify(this.customerService.firstBindingForm));
		const dirtyValues = JSON.parse(JSON.stringify(this.getDirtyValues(this.parentForm.get('customerForm'))));
		// const dirtyValues = this.getDirtyValues(this.parentForm.get('customerForm'));
		for (const propKey in dirtyValues) {
			const valueForm = formValue[propKey];
			const valueDirty = dirtyValues[propKey];
			if (typeof valueDirty == 'string' || typeof valueForm == 'string') {
				if (valueForm != valueDirty) {
					dirtyKeys.push(propKey);
				}
			} else if (Array.isArray(valueForm)) {
				for (const index in valueDirty) {
					if (valueForm.length <= Number(index)) {
						dirtyKeys.push(propKey);
					} else {
						const cmpForm = valueForm[index];
						// console.log('>>>> cmpForm', cmpForm);
						const cmpDirty = valueDirty[index];
						// console.log('>>>> cmpDirty', cmpDirty);
						for (const prop in cmpDirty) {
							if (cmpForm[prop] != cmpDirty[prop]) {
								dirtyKeys.push(propKey);
							}
						}
					}
				}
			}
		}
		console.log('>> cac form bi thay doi', dirtyKeys);
		return dirtyKeys;
	}

	checkOwnerCustomerAcct(customerId: string) {
		this.ownerAcct = false;
		this.customerService.getAccountByCustId(customerId)
			.subscribe(res => {
				if (res && res.body.status == STATUS_OK) {
					const accts = res.body.enquiry.hasOwnProperty('seabGetAcccustSeateller') ? res.body.enquiry.seabGetAcccustSeateller : [];
					accts.forEach(acct => {
						if (acct.hasOwnProperty('relationCode') && acct.relationCode == '9') {
							this.ownerAcct = true;
						}
					});
				}
			});
	}

	buildNewSigLinkReq(links: string[]) {
		return links.map(l => l.slice(l.lastIndexOf('/signature/'))) || [];
	}

	buildLinkNewSigRes(link: string) {
		if (link) {
			const links = link.split('#');
			return this.buildLinkImageSig(links);
		}
		return [];
	}

	buildLinkImageSig(inputs: string[]): string[] {
		const sigs: string[] = [];
		if (inputs) {
			inputs.forEach(s => {
				sigs.push(this.getLink(s) || 'assets/media/logos/nodata.png');
			});
		}
		return sigs;
	}

	getLink(link) {
		return this.coreAiService.returnLinkGetImage(link);
	}

}
