import { SmsCheckedModel } from './model-checkbox';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize, map } from 'rxjs/operators';
import { SmsService } from './sms.services';
import {
	Component,
	Input,
	OnDestroy,
	OnInit,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription, forkJoin } from 'rxjs';
import { CommonService } from '../../../../../common-service/common.service';
import { DataPowerService } from '../../../../../../shared/services/dataPower.service';
import { NavigationEnd, Router } from '@angular/router';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { ModalNotification } from '../../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import moment from 'moment';
import { SlaTimeService } from '../../../../../../shared/services/sla-time.service';
import { LOCAL_DATE_TIME } from '../../../../../../shared/model/constants/common-constant';
import {
	ACTION_T24,
	APPROVE, APPROVED_SUCCESS, CACHE_CO_CODE,
	CODE_00,
	GET_ENQUIRY, HEADER_API_ACCOUNT, LIST_GROUP_WITH_NAME,
	NOTIFICATION, PENDING, SERVER_API_CUST_INFO,
	STATUS_OK, UTILITY
} from '../../../../../../shared/util/constant';
import { WebsocketClientService } from '../../../../../../shared/services/websocket-client.service';
import { removeUTF8 } from '../../../../../../shared/model/remove-UTF8';
import { CustomerRequestDTO } from '../../../../../../shared/model/constants/customer-requestDTO';
import { EnquiryModel } from '../../../../../model/enquiry.model';
import { BodyRequestEnquiryModel } from '../../../../../model/body-request-enquiry-model';
import { ReportService } from '../../../../../common-service/report.service';
import { DataLinkMinio } from '../../../../../model/data-link-minio';
import { PromotionModel } from '../../../../../../shared/model/promotion.model';
import { UtilityService } from '../../../../../../shared/services/utility.service';
import { MadichvuModel } from '../../../../../../shared/model/madichvu.model';
import { AppConfigService } from '../../../../../../app-config.service';
import { CoreAiService } from '../../identify-customer/service/core-ai.service';
import { IHeaderTableErrorModel } from '../../../../../../shared/model/table-approve-error.model';
import { GtttUrlModel } from '../../../../../../shared/model/GtttUrl.model';
import { SignatureService } from '../../identify-customer/service/signature.service';
import { AccountRequestDTO } from '../../../../../../shared/model/constants/account-requestDTO';
import { formartDateYYYYMMDD } from '../../../../../../shared/util/Utils';
import { MAPPING_T24_FORMCONTROL_REQ_SEATELLER } from './sms.constant';
import { INPUT_TYPE_ENUM } from '../../customer-manage/customer-manage.constant';
import { BodyRequestSMSOldValue, SMSDetail } from './sms.model';

@Component({
	selector: 'kt-sms',
	templateUrl: './sms.component.html',
	styleUrls: ['./sms.component.scss'],
})
export class SmsComponent implements OnInit, OnDestroy {
	// truy van giao dich
	@Input('viewData') viewData: any;
	// @ViewChild(CustomerInfoComponent, {static: false})
	// customerComponent: CustomerInfoComponent;

	customerInfo: any;

	minDate = new Date();
	maxDate = new Date();

	parentForm: FormGroup;
	updateForm: FormGroup;
	formArray: FormArray;
	isLoadingSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingSmsDetail$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isLoadingDeleteSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingApproveSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isUpdatingSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingRejectSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isSearched: boolean = false;
	smsList$: BehaviorSubject<SmsCheckedModel[]> = new BehaviorSubject<SmsCheckedModel[]>([]);
	smsListRealTime$: BehaviorSubject<SmsCheckedModel[]> = new BehaviorSubject<SmsCheckedModel[]>([]);
	smsInfo$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	username: any;
	dataList: any = [];
	dataCacheRouter: any;
	idSms: any;

	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	parentName: string;
	childOne: string;
	childTwo: string;
	general_info: any;
	coCode: any;

	smsListInfo: any = [];

	columnValue: string;
	isIncreShow: boolean;

	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCities$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingDistrict$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingReport$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	cityList: any[] = [];
	districtList: any[] = [];
	ownerBen: any;
	navigateSub: Subscription;
	serviceList$ = new BehaviorSubject<MadichvuModel[]>([]);
	listPromotion$ = new BehaviorSubject<PromotionModel[]>([]);
	headerError: IHeaderTableErrorModel[] = [];
	dataError: any = {};
	ngSelectType = INPUT_TYPE_ENUM.NG_SELECT;
	dateInputType = INPUT_TYPE_ENUM.DATE;
	dateFormatT24 = 'YYYYMMDD';

	constructor(
		public commonService: CommonService,
		public modal: NgbModal,
		private fb: FormBuilder,
		private dataPowerService: DataPowerService,
		private router: Router,
		private localStorage: LocalStorageService,
		private sessionStorage: SessionStorageService,
		private smsService: SmsService,
		private websocketClientService: WebsocketClientService,
		private slaTimeService: SlaTimeService,
		private reportService: ReportService,
		private utilityService: UtilityService,
		private appConfigService: AppConfigService,
		private coreAiService: CoreAiService,
		private signatureService: SignatureService) {

		this.parentForm = this.fb.group({});
		this.updateForm = this.fb.group({
			form: this.fb.array([]),
		});

		this.accessRightIds = this.commonService.getRightIdsByUrl(
			this.router.url
		);

		this.navigateSub = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.initData();
			}
		});
	}

	get form(): FormArray {
		return this.updateForm && this.updateForm.get('form') as FormArray;
	}

	addItem(sms) {
		this.form.push(this.createItem(sms));
	}

	removeItem(i: number) {
		this.form.removeAt(i);
	}

	ngOnInit() {
		this.getMadichVu();
		this.getPromotions();
		this.getCities();
		this.username = this.localStorage.retrieve('username');
		if (this.viewData) {
			this.initData();
		}

	}

	initData() {
		if (this.viewData) {
			this.dataCacheRouter = this.viewData;
			this.idSms = this.dataCacheRouter.id;
			this.getSmsInfo();
		} else {

			this.commonService.isNotifyHasCancel$.next(true);
			this.checkRight();
			this.slaTimeService.startCalculateSlaTime();

			if (this.commonService.isUpdateSMS$.getValue()) {
				// this.form.clear();
				this.dataCacheRouter = window.history.state.data;
				this.idSms = this.dataCacheRouter.id;
				let cardFront = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.cardFront);
				let cardBack = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.cardBack);
				let pictureFace = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.pictureFace);
				let fingerLeft = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.fingerLeft);
				let fingerRight = this.signatureService.buildImgSrcForGttt(this.dataCacheRouter.fingerRight);

				let gtttModel = new GtttUrlModel(cardFront, cardBack, pictureFace, fingerLeft, fingerRight);
				this.signatureService.gtttUrlModel$.next(gtttModel);
				

				if (this.inputtable$.getValue() === true) {
					this.getSmsInfo(gtttModel);
				} else {
					this.getListDetailSms();
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
			// Data lấy được sau khi nhấn vào bản ghi 360
			if (window.history.state.obj360 && window.history.state.custId) {
				this.commonService.customerId$.next(window.history.state.custId);
				this.getSmsInfo();
			}

			this.commonService.isDisplayAsideRight$.next(true);
			this.commonService.isAsideRight$.next(true);
		}
		if (this.dataCacheRouter && this.dataCacheRouter.status == 'APPROVED_ERROR') {
			this.checkApproveStatus(this.dataCacheRouter);
		}
	}

	getMadichVu(): void {
		const cache = this.localStorage.retrieve(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE);
		if (cache) {
			this.serviceList$.next(cache);
			return;
		}
		this.utilityService.getMadichvusNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const madv = res.body.enquiry.madichvus;
					this.serviceList$.next(madv);
					this.localStorage.store(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE, madv);
				}
			});
	}

	getPromotions(): void {
		const cache = this.localStorage.retrieve(UTILITY.PROMOTION.PROMOTION_CACHE);
		if (cache) {
			this.listPromotion$.next(cache);
			return;
		}
		this.utilityService.getPromotionsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const promotions = res.body.enquiry.promotions;
					this.listPromotion$.next(promotions);
					this.localStorage.store(UTILITY.PROMOTION.PROMOTION_CACHE, promotions);
				}
			});
	}

	ngOnDestroy() {
		this.commonService.generalInfo$.next(null);
		this.commonService.changeCustomerGTTT$.next(null);
		this.commonService.isUpdateSMS$.next(false);
		this.slaTimeService.clearTimeSLA();
		this.commonService.isNotifyHasCancel$.next(false);
		this.commonService.isDisplayFile$.next(false);
		if (this.navigateSub) {
			this.navigateSub.unsubscribe();
		}
		// remove image aside right
		this.coreAiService.navigateToCombo$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
	}

	createItem(sms) {

		let endDateOfSeATellerApi = (sms.endDate && moment(sms.endDate, 'DD-MM-YYYY', true).isValid()) ? moment(sms.endDate, 'DD-MM-YYYY').toDate() : null;
		let endDateCoreApi = (sms.endDate && moment(sms.endDate, 'YYYYMMDD', true).isValid()) ? moment(sms.endDate, 'YYYYMMDD').toDate() : null;

		return this.fb.group({
			id: sms.id || sms.vadID,
			accountId: sms.accountNumber || sms.accountID || '',
			phoneNumber: [sms.phoneNumber || sms.telNo || '', [Validators.pattern('0[0-9]{9}')]],
			serviceId: [sms.vadParamId || sms.serviceId],
			email: [
				sms.email,
				[Validators.required,
				Validators.email,
				Validators.pattern(
					'^[a-z0-9._%+-]+@[a-z]+\.[a-z]{2,3}(\.[a-z]{2,3})$'
				),
				],
			],

			promotionId: sms.promotionId,
			endDate: endDateOfSeATellerApi ? endDateOfSeATellerApi : endDateCoreApi
		});
	}

	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}

		this.parentName = this.inputtable$.getValue() == true ? 'Quản lý nghiệp vụ giao dịch' : 'Duyệt quản lý nghiệp vụ giao dịch';
		this.childOne = this.inputtable$.getValue() == true ? 'Quản lý Sms' : 'Duyệt quản lý Sms';
		this.childTwo = null;

	}

	isFormArrayValid(): boolean {
		for (let i = 0; i < this.form.controls.length; i++) {
			let email = this.form.controls[i]['controls']['email'];
			if (email.invalid) {
				return false;
			}
		}
		return true;
	}

	onSubmit() {
		if (this.form.value.length == 0) {
			this.commonService.setNotifyInfo('Bạn chưa chọn bản ghi nào', 'danger', 5000);
			return;
		}

		if (!this.isFormArrayValid()) {
			this.form.markAllAsTouched();
			this.parentForm.markAllAsTouched();
			// this.commonService.error('Chưa nhập đủ thông tin bắt buộc');
			return;
		}

		this.slaTimeService.endCalculateSlaTime();

		this.isUpdatingSms$.next(true);
		let listDetail = this.form.value.map((item) => {
			return {
				id: item.id.substr(item.id.indexOf('#') + 1),
				phoneNumber: item.phoneNumber,
				serviceId: item.serviceId,
				endDate: item.endDate ? moment(item.endDate).format('DD-MM-YYYY') : null,
				promotionId: item.promotionId,
				email: item.email,
				accountNumber: item.accountId,
			};
		});

		let cardFront: string = null, cardBack: string = null, fingerLeft: string = null, fingerRight: string = null;
		const gtttUrlModel = this.signatureService.gtttUrlModel$.getValue();
		if (gtttUrlModel) {
			(gtttUrlModel.cardFront && gtttUrlModel.cardFront != 'assets/media/logos/nodata.png') && (cardFront = gtttUrlModel.cardFront);
			(gtttUrlModel.cardBack && gtttUrlModel.cardBack != 'assets/media/logos/nodata.png') && (cardBack = gtttUrlModel.cardBack);
			(gtttUrlModel.fingerLeft && gtttUrlModel.fingerLeft != 'assets/media/logos/nodata.png') && (fingerLeft = gtttUrlModel.fingerLeft);
			(gtttUrlModel.fingerRight && gtttUrlModel.fingerRight != 'assets/media/logos/nodata.png') && (fingerRight = gtttUrlModel.fingerRight);
		}

		const body = {
			id: this.dataCacheRouter
				? this.dataCacheRouter.id
				: this.parentForm.controls.transactionForm.value.transId,
			customerId: this.parentForm.controls.transactionForm.value.customerId,
			inputter: this.username,
			// coCode: this.coCode,
			coCode: this.commonService.groupOwner$.value,
			priority: this.parentForm.controls.transactionForm.value.priority,
			actionT24: 'CREATE',
			// departCode: '54545', //APi getCustomerSmsReg chưa trả vê
			saleType: this.parentForm.controls.infoForm.value.saleType,
			saleId: this.parentForm.controls.infoForm.value.saleId,
			brokerType: this.parentForm.controls.infoForm.value.brokerType,
			brokerId: this.parentForm.controls.infoForm.value.brokerId, //APi getCustomerSmsReg chưa trả vê
			campaignId: this.parentForm.controls.infoForm.value.campaignId, //APi getCustomerSmsReg chưa trả vê
			smsDetail: listDetail,
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			coCodeT24: this.commonService.generalInfo$.getValue().coCode ?
				this.commonService.generalInfo$.getValue().coCode
				: this.commonService.groupOwner$.value,
			// cap nhat hinh anh KH vao core ai
			cardFrontBase64: cardFront ? null : this.coreAiService.cardFrontScan$.getValue(),
			cardBackBase64: cardBack ? null : this.coreAiService.cardBackScan$.getValue(),
			pictureFaceBase64: this.coreAiService.faceScan$.getValue(),
			fingerLeftBase64: this.coreAiService.fingerLeftScan$.getValue(),
			fingerRightBase64: this.coreAiService.fingerRightScan$.getValue(),
		};

		// this.smsService
		// 	.createOrUpdateSms(body)
		// 	.pipe(finalize(() => this.isUpdatingSms$.next(false)))
		// 	.subscribe((res) => {
		// 		if (
		// 			res.seabRes.body.status == 'OK' &&
		// 			res.seabRes.body.transaction.responseCode == '00'
		// 		) {

		// 			this.commonService.success(`Bản ghi ${body.id} đã được gửi duyệt tới KSV`);
		// 			this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.SMS);
		// 			this.router.navigateByUrl('/pages/dashboard');
		// 		} else {
		// 			//this.commonService.error(res.seabRes.error.desc);
		// 		}
		// 	}
		// 	);

		const oldInfoSMSReq: BodyRequestSMSOldValue = {
			id: this.dataCacheRouter
				? this.dataCacheRouter.id
				: this.parentForm.controls.transactionForm.value.transId,
			customerId: this.parentForm.controls.transactionForm.value.customerId,
			inputter: this.username,
			coCode: this.commonService.groupOwner$.value,
			priority: this.parentForm.controls.transactionForm.value.priority,
			actionT24: 'CREATE',
			campaignId: this.parentForm.controls.infoForm.value.campaignId, //APi getCustomerSmsReg chưa trả vê
			...this.smsService.selectedObject$.getValue(),
			timeUpdate: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaInputter: this.slaTimeService.calculateSlaTimeInput(this.dataCacheRouter),
			coCodeT24: this.commonService.generalInfo$.getValue().coCode ?
				this.commonService.generalInfo$.getValue().coCode
				: this.commonService.groupOwner$.value,
		}

		forkJoin({
			requestOne: this.smsService
				.createOrUpdateSms(body),
			requestSaveOldTwo: this.smsService
				.saveOldInforSMS(oldInfoSMSReq),
		}).pipe(finalize(() => this.isUpdatingSms$.next(false))).subscribe(({ requestOne, requestSaveOldTwo }) => {
			if (
				requestOne.seabRes.body.status == 'OK' &&
				requestOne.seabRes.body.transaction.responseCode == '00' && requestSaveOldTwo.seabRes.body.status == 'OK' &&
				requestSaveOldTwo.seabRes.body.transaction.responseCode == '00'
			) {
				this.commonService.success(`Bản ghi ${body.id} đã được gửi duyệt tới KSV`);
				this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.transactionForm.value.transId, NOTIFICATION.PRODUCT_TYPE.SMS);
				this.router.navigateByUrl('/pages/dashboard');
			} else {
				//this.commonService.error(res.seabRes.error.desc);
			}
		});

	}

	onChangeSms(event, sms, indexCheckbox) {
		let update = this.commonService.isUpdateSMS$.getValue();
		const smsListRT = this.smsListRealTime$.getValue();
		if (event.target.checked == true) {
			const newList = smsListRT.map((ele, index) => {
				if (indexCheckbox === index) {
					return { ...ele, checked: true }
				} else {
					return ele
				}
			})
			this.smsListRealTime$.next(newList)
			// update. nếu check chọn element listA có trong listB thì push element listB vào. else push element listA
			if (update) {
				let index = this.dataList.findIndex(item => item.id.substr(item.id.indexOf('#') + 1) == sms.vadID);
				if (index != undefined && index != -1) {
					this.addItem(this.dataList[index]);
				} else {
					this.addItem(sms);
				}

			} else {
				// tạo mới - check chọn -> push element listA
				this.addItem(sms);
			}
		} else {
			const newList = smsListRT.map((ele, index) => {
				if (indexCheckbox === index) {
					return { ...ele, checked: false }
				} else {
					return ele
				}
			})
			this.smsListRealTime$.next(newList)

			if (update) {
				for (let i = 0; i < this.form.value.length; i++) {
					if (sms.vadID == this.form.value[i].id.substr(this.form.value[i].id.indexOf('#') + 1)) {
						this.removeItem(i);
					}
				}
			} else {
				for (let i = 0; i < this.form.value.length; i++) {
					if (sms.vadID == this.form.value[i].id) {
						this.removeItem(i);
					}
				}
			}

		}

		const filterByReference = () => {
			let res = [];
			const listNotSort = this.smsListRealTime$.getValue().filter(sms => sms.checked)
			listNotSort.forEach(sms => {
				this.updateForm.controls.form.value.forEach((smsForm, indexForm) => {
					if (smsForm.accountId === sms.accountID && smsForm.phoneNumber === sms.telNo) {
						let smsConvertField: SMSDetail = {
							id: sms.vadID,
							phoneNumber: sms.telNo,
							serviceId: sms.vadParamId,
							accountNumber: sms.accountID,
							email: sms.email,
							endDate: sms.endDate,
							promotionId: sms.promotionId,
						}
						res[indexForm] = smsConvertField
					}
				})
			})
			return res;
		}

		const infoRecord = {
			brokerId: this.general_info.brokerId,
			brokerType: this.general_info.brokerType,
			saleId: this.general_info.saleId,
			saleType: this.general_info.saleType,
			campaignId: this.general_info.campaignId ? this.general_info.campaignId : null,
			smsDetail: filterByReference()
		}

		this.smsService.selectedObject$.next(infoRecord)
	}

	getSmsInfo(gttUrlModel?: GtttUrlModel): void { // id 452789
		this.smsService.selectedObject$.next(null)
		this.smsListRealTime$.next(null)
		this.dataList = [];
		this.smsInfo$.next(null);

		this.form.clear();
		let update = this.commonService.isUpdateSMS$.getValue();

		let body = {
			customerID: update ? this.dataCacheRouter.customerId : this.commonService.customerId$.getValue()
		};
		if (!gttUrlModel) {
			gttUrlModel = new GtttUrlModel(null, null, null, null, null);
		}
		this.getImageUser(body.customerID, gttUrlModel);
		this.isSearched = true;
		this.isLoadingSms$.next(true);
		this.smsService
			.getCustomerSmsReg(body)
			.pipe(
				finalize(() => (this.isLoadingSms$.next(false)
					// ,
					// this.smsList$.getValue().length > 0 && this.commonService.isUpdateSMS$.getValue()&& this.getListDetailSms()

				)))
			.subscribe((res) => {
				if (res.body.status == 'OK' &&
					res.body.enquiry.responseCode == '00') {
					this.commonService.getFilesByCustomerId(body.customerID);
					this.smsList$.next(res.body.enquiry.vadInfos);
					this.smsListRealTime$.next(res.body.enquiry.vadInfos)
					this.commonService.generalInfo$.next(res.body.enquiry);
					this.coCode = res.body.enquiry.coCode;
					this.general_info = res.body.enquiry;
					this.smsListInfo = res.body.enquiry.vadInfos;

					this.getCustomerInfo();
					if (this.smsList$.getValue().length > 0 && this.commonService.isUpdateSMS$.getValue()) {
						this.getListDetailSms();
					}
				} else {

					this.smsList$.next(null);
					//this.commonService.error(res.error.desc);
				}
			});
	}

	compareValueHasChange(formCotrolName: string, formControlValue: string, typeInput?: any,
		idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string | boolean {
		return this.smsService.compareValueHasChange(formCotrolName, formControlValue, typeInput,
			idxFormControl, dateFormat, dropdownList, code, value, prop);
	}

	checkBox(): void {
		// KSV ko nhìn thấy table Thông tin dịch vụ SMS nên KSV ko cần chạy đoạn mã dưới
		if (this.inputtable$.getValue() === true) {
			const smsList = this.smsList$.getValue();
			const smsListCheck = smsList.map((s) => ({ ...s, checked: false }))
			this.dataList.forEach(sms => {
				let index = smsList.findIndex(ele => ele.vadID == sms.id.substr(sms.id.indexOf('#') + 1));
				if (index != undefined) {
					smsList[index].checked = true;
					smsListCheck[index].checked = true;
				}
			});
			this.smsListRealTime$.next(smsListCheck)
		}
		if (this.dataCacheRouter) {
			this.smsService.selectedObject$.next(null);
			this.isLoadingSmsDetail$.next(true);
			const transId = this.dataCacheRouter
				? this.dataCacheRouter.id
				: this.parentForm.controls.transactionForm.value.transId

			this.smsService
				.getSmsInfoRedis(transId)
				.pipe(finalize(() => (this.isLoadingSmsDetail$.next(false))))
				.subscribe((res) => {
					if (
						res.seabRes.body.status === '00' &&
						res.seabRes.body.enquiry.responseCode === '00'
					) {
						let smsDetail = [];
						const listNotSort = res.seabRes.body.enquiry.product.smsDetail
						const updateForm = this.updateForm.controls.form.value

						listNotSort.forEach(sms => {
							updateForm.forEach((smsForm, indexForm) => {
								if (smsForm.accountId === sms.accountNumber && smsForm.phoneNumber === sms.phoneNumber) {
									smsDetail[indexForm] = sms
								}
							})
						})
						this.smsService.selectedObject$.next({ ...res.seabRes.body.enquiry.product, smsDetail })
					}
				}
				);
		}
	}

	deleteSms(): void {
		if (this.commonService.isUpdateSMS$.getValue()) {
			const modalRef = this.modal.open(ModalNotification, {
				size: 'lg',
				windowClass: 'notificationDialog',
			});

			modalRef.componentInstance.textNotify = 'Bạn muốn xóa bản ghi này?';
			modalRef.result.then((result) => {
				if (result == true) {
					this.isLoadingDeleteSms$.next(true);
					this.smsService.deleteSms(this.idSms)
						.pipe(finalize(() => this.isLoadingDeleteSms$.next(false)))
						.subscribe((res) => {
							if (res.seabRes.body.status == 'OK' && res.seabRes.body.transaction.responseCode == '00') {
								this.commonService.success(`Bản ghi ${this.parentForm.controls.transactionForm.value.transId} đã được xóa thành công`);
								this.router.navigateByUrl('/pages/dashboard');

							} else {

								//this.commonService.error(res.seabRes.error.desc);
							}
						});
				}

			});

		} else {
			this.parentForm.controls.infoForm.reset();
		}

	}

	getListDetailSms(): void {
		this.isLoadingSmsDetail$.next(true);
		this.smsService
			.getListDetailSms(this.idSms)
			.pipe(
				finalize(() => {
					if (this.commonService.isUpdateSMS$.getValue()) {
						this.dataList.forEach((item) => {
							this.form.push(this.createItem(item));
						});
						this.checkBox();
					} else {
						this.form.clear();
					}

					this.isLoadingSmsDetail$.next(false);
				})
			)
			.subscribe((res) => {
				if (
					res.seabRes.body.status == 'OK' &&
					res.seabRes.body.enquiry.responseCode == '00'
				) {
					this.dataList = res.seabRes.body.enquiry.product;
					this.smsInfo$.next(this.dataList);
				} else {
					//this.commonService.error(res.seabRes.error.desc);
				}
			});
	}

	approveSms() {
		this.slaTimeService.endCalculateSlaTime();
		this.isLoadingApproveSms$.next(true);

		let bodyReq = {
			id: this.idSms,
			authoriser: this.username,
			actionT24: ACTION_T24.APPROVE,
			timeAuth: moment(new Date()).format(LOCAL_DATE_TIME),
			timeSlaAuthorise: this.slaTimeService.calculateSlaTimeAuth(this.dataCacheRouter)
		};

		let _this = this;
		this.smsService.approveSms(bodyReq).pipe(finalize(() => this.isLoadingApproveSms$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == 'OK' &&
					res.seabRes.body.transaction.responseCode == '00') {
					this.commonService.success(`Bản ghi ${bodyReq.id} đã được duyệt thành công`);
					this.router.navigateByUrl('/pages/dashboard');
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVED, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.SMS);

				} else {
					this.commonService.error(`Bản ghi ${bodyReq.id} đã được duyệt không thành công`);
					this.router.navigateByUrl('/pages/dashboard');
					this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVED_ERROR, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.SMS);
				}
			});
	}

	rejectSms() {
		const auditFormControls = this.parentForm.controls.auditInfoForm;
		if (!auditFormControls.value.reason) {
			this.parentForm.get('auditInfoForm.reason').setErrors({ required: true });
			auditFormControls.markAllAsTouched();
			return;
		}

		const modalRef = this.modal.open(ModalNotification, {
			size: 'lg', windowClass: 'notificationDialog',
		});

		modalRef.componentInstance.textNotify = 'Bạn muốn từ chối bản ghi này?';
		modalRef.result.then((result) => {
			if (result == true) {
				this.isLoadingRejectSms$.next(true);
				let bodyReq = {
					id: this.idSms,
					authoriser: this.username,
					reasonReject: this.parentForm.controls.auditInfoForm.value.reason
						? this.parentForm.controls.auditInfoForm.value.reason : null,
					timeRejected: moment(new Date()).format(LOCAL_DATE_TIME),
				};
				let _this = this;
				this.smsService.rejectSms(bodyReq).pipe(finalize(() => this.isLoadingRejectSms$.next(false)))
					.subscribe(res => {
						if (res.seabRes.body.status == 'OK' &&
							res.seabRes.body.transaction.responseCode == '00') {
							this.commonService.success(`Bản ghi ${bodyReq.id} đã bị từ chối bởi KSV`);
							this.websocketClientService.sendMessageToUser(_this.dataCacheRouter.inputter, NOTIFICATION.APPROVE_CANCEL, _this.dataCacheRouter.id, NOTIFICATION.PRODUCT_TYPE.SMS);
							this.commonService.setNotifyInfo(
								'Từ chối bản ghi SMS thành công',
								'success',
								5000
							);
							this.router.navigateByUrl('/pages/dashboard');

						} else {
							//this.commonService.error(res.seabRes.error.desc);
						}
					});
			}
		});
	}

	getCustomerInfo() {
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		let customerId = this.frm.transactionForm.value.customerId;
		if (this.commonService.changeCustomerGTTT$.getValue()) {
			customerId = this.commonService.customerId$.getValue();
		}

		bodyConfig.enquiry.customerID = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					this.customerInfo = res.enquiry;
					this.getAccountInfoByCustomerId(customerId);
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

	// getDistrict(province?) {
	// 	console.log('provineID', province);
	// 	let command = GET_ENQUIRY;
	// 	let enquiry: {};
	// 	enquiry = {
	// 		authenType: 'getDISTRICTS',
	// 		cityID: province ? province : this.frm.province.value
	// 	};
	// 	this.isLoadingDistrict$.next(true);
	// 	this.districtList = [];
	// 	let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
	// 	this.commonService.actionGetEnquiryUtility(bodyRequest).pipe(finalize(
	// 		() => this.isLoadingDistrict$.next(false)))
	// 		.subscribe(r => {
	// 			if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
	// 				this.districtList = r.enquiry.district;
	// 			}
	// 		});
	// }

	sortColumnSmsInfo(property: string) {
		this.isIncreShow = !this.isIncreShow;
		this.columnValue = property;

		const arr = this.smsList$.getValue();

		this.smsListInfo = arr.sort((previousTransaction, nextTransaction) => {
			let firstItem;
			let secondItem;

			firstItem = removeUTF8(previousTransaction[property]);
			secondItem = removeUTF8(nextTransaction[property]);

			if (this.isIncreShow === true) {
				return (((firstItem ? firstItem : '').toUpperCase().toUpperCase()) > (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;

			} else {
				return ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() > (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;
			}
		});
	}

	backToHome() {
		this.router.navigateByUrl('/pages/dashboard');
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

	get frm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}

	/**
	 * Hàm này kiểm tra giá trị enbDate trong sms array form, nếu user nhập là ngày hôm nay,
	 * thì giá trị Tạm dừng/ Ngừng dịch vụ - SMS & Email Banking trên mẫu biểu -> checked
	 *Nếu giá trị endDate có thay đổi sẽ trả về accountId của bản ghi, ngược lại trả về null
	 */
	checkEndDateChangeForReport(): any {
		const currentDate = new Date();
		let listAccountSms: any[] = [];

		// Kiểm tra giá trị endDate trả về từ T24 có bản ghi nào giá trị endDate trùng với ngày hôm nay hay chưa
		const currentEndDateT24 = this.smsList$.getValue().find(i => moment(i.endDate, 'YYYYMMDD').format("DD/MM/YYYY") == moment(currentDate).format("DD/MM/YYYY"));

		for (let i = 0; i < this.form.controls.length; i++) {
			let endDate = this.form.controls[i]['controls']['endDate'];

			if (new Date(endDate.value).getDate() == currentDate.getDate() && !currentEndDateT24) {
				listAccountSms.push(this.form.controls[i]['controls']['accountId'].value)
			}
		}
		// for (let i = 0; i < this.form.controls.length; i++) {
		//         let endDate = this.form.controls[i]['controls']['endDate'];
		//         if (new Date(endDate.value).getDate() == currentDate.getDate() && !currentEndDateT24) {
		//                 return this.form.controls[i]['controls']['accountId'].value;
		//         }
		// }
		return listAccountSms.length > 0 ? listAccountSms : null;
	}

	/**
	 * Convert dòng yêu cầu khác trên biểu mẫu
	 * Tất tần tật những trường có ở trên sms mà biểu mẫu không có (SRS)
	 */

	getOtherInfoInReport(): string {
		let otherReportMapping: string = '';
		let formControlName = ['serviceId', 'promotionId'];

		for (let i = 0; i < this.form['controls'].length; i++) {
			for (const fieldName in this.form['controls'][i]['controls']) {
				const formValue = this.form['controls'][i]['controls'][fieldName].value;

				const currentAccountId = this.checkEndDateChangeForReport();
				if (fieldName == 'endDate' && currentAccountId) {
					otherReportMapping = otherReportMapping + 'Ngừng dịch vụ SMS của tài khoản ' + currentAccountId[i] + ', ';
				}

				// if(formControlName.includes(fieldName) && formValue){
				// 	otherReportMapping = otherReportMapping + fieldName + ": " + formValue + ", ";
				// }
			}
		}

		if (otherReportMapping.length > 0) {
			return otherReportMapping.slice(0, otherReportMapping.length - 2);
		}

		return otherReportMapping;

	}

	get isLoadingTooltipReportButton(): boolean {
		return this.customerInfo == null;
	}

	getReportId() {

		if (this.form.value.length == 0) {
			this.commonService.setNotifyInfo('Bạn chưa chọn bản ghi nào', 'danger', 5000);
			return;
		}
		let accountSms = this.form.value[0].accountId;
		if (!this.isFormArrayValid()) {
			this.form.markAllAsTouched();
			this.parentForm.markAllAsTouched();
			return;
		}

		this.isLoadingReport$.next(true);

		let oldEmail: any[] = [];
		let newEmail: any[] = [];
		let oldPhone: any[] = [];
		let newPhone: any[] = [];

		//So sánh giá trị phoneNumber, email cũ mới
		this.form.value.forEach(smsNewSeATeller => {
			let smsOldT24 = this.smsList$.getValue().find(k => smsNewSeATeller.id.includes(k.vadID));
			if (smsOldT24) {
				if (smsOldT24.email != smsNewSeATeller.email) {
					oldEmail.push(smsOldT24.email);
					newEmail.push(smsNewSeATeller.email);
				}

				if (smsOldT24.telNo != smsNewSeATeller.phoneNumber) {
					oldPhone.push(smsOldT24.telNo);
					newPhone.push(smsNewSeATeller.phoneNumber);
				}
			}
		});

		let branchs = this.localStorage.retrieve(LIST_GROUP_WITH_NAME);
		const currentBranch = this.localStorage.retrieve(CACHE_CO_CODE);
		const branchName = branchs.find(i => i.group_id == currentBranch);

		let otherReportMapping = this.getOtherInfoInReport();

		// if(this.customerInfo) {
		let body = {
			command: '',
			report: {}
		};
		body.command = 'GET_REPORT';
		body.report = {
			authenType: 'getRequest_SEATELLER_YEU_CAU_DV_SMS',
			exportType: 'PDF',
			transactionId: this.frm.transactionForm.value.transId,
			custId: '',
			saveToMinio: false,
			// trong QLNVGD hiện tại chỉ có action chỉnh sửa bản ghi đã đăng ký từ combo
			action: {
				cancel: !!this.checkEndDateChangeForReport(),
				chargeBackPayment: false,
				lockUser: false,
				modify: true,
				register: false,
				resetPwd: false,
				unlockUser: false,
				otherAction: otherReportMapping ? otherReportMapping : ''
			},
			customerInfo: {
				accountNo: accountSms,
				// accountNo: this.listAccountOfCustomer.map(i => i.accountID).join(';'),
				branch: (branchName && branchName.desc) ? branchName.desc : '',
				fullName: (this.customerInfo && this.customerInfo.shortName) ? this.customerInfo.shortName : '',
				gttt: (this.customerInfo && this.customerInfo.legalID) ? this.customerInfo.legalID.split('#')[0] : '',
				issueDate: (this.customerInfo.legalIssDate && this.customerInfo.legalIssDate.split('#')[0])
					? formartDateYYYYMMDD(this.customerInfo.legalIssDate.split('#')[0]) : null,
				issuesAddress: (this.customerInfo && this.customerInfo.legalIssAuth) ? this.customerInfo.legalIssAuth.split('#')[0] : '',
			},
			emailInfoAccBal: true,
			emailInfoExchangeRate: true,
			emailInfoNewProd: true,
			emailInfoRepayment: true,
			newEmail: newEmail.length > 0 ? newEmail.join(';') : '',
			newPhone: newPhone.length > 0 ? newPhone.join(';') : '',
			oldEmail: oldEmail.length > 0 ? oldEmail.join(';') : '',
			oldPhone: oldPhone.length > 0 ? oldPhone.join(';') : '',
			smsInfoAccBal: true,
			smsInfoExchangeRate: true,
			smsInfoNewProd: true,
			smsInfoRepayment: true,
			printDate: moment(new Date()).format('DD/MM/YYYY')
		};

		this.reportService.getReportForm(body).pipe(finalize(() => this.isLoadingReport$.next(false))).subscribe(res => {
			if (res && res.status == STATUS_OK && res.responseCode == '00') {
				console.log(res.report.data);
				let dataLink: DataLinkMinio = new DataLinkMinio();
				dataLink.fileName = res.report.data.fileName;
				dataLink.fileType = res.report.data.fileType;
				dataLink.bucketName = res.report.data.bucketName;
				dataLink.folder = res.report.data.folder;
				this.websocketClientService.sendMessageToTablet([dataLink], 'viewForm');
				window.open(`${this.reportService.minioLink}/${res.report.data.bucketName}/${res.report.data.folder}`, '_blank');
			}
		});
		// }
	}

	checkApproveStatus(stateData) {
		this.headerError = [{
			code: 'sms',
			value: 'Quản lý sms'
		}];
		const object = {
			status: 'Duyệt lỗi',
			desc: stateData.errorDesc
		};
		this.dataError['sms'] = object;
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

	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	listAccountOfCustomer: any[] = [];

	getAccountInfoByCustomerId(customerId: string) {
		this.isLoadingAccountInfo$.next(true);
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
		bodyConfig.enquiry.customerID = customerId;

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingAccountInfo$.next(false)))
			.subscribe(res => {
				if (res) {
					let rawAccounts = res.enquiry.account;
					if (rawAccounts) {
						this.listAccountOfCustomer = rawAccounts.filter(account => account.category == '1001' && account.currency == 'VND');
					}

				} else {
					return;
				}
			});
	}
}
