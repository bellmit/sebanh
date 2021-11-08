import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../../../common-service/common.service';
import {finalize, map} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {SmsService} from '../../../transaction-operations/sms/sms.services';
import {
	CODE_00,
	HEADER_API_ACCOUNT,
	SERVER_API_CUST_INFO,
	STATUS_OK,
	USERNAME_CACHED,
	UTILITY
} from '../../../../../../../shared/util/constant';
import {AccountRequestDTO} from '../../../../../../../shared/model/constants/account-requestDTO';
import {DataPowerService} from '../../../../../../../shared/services/dataPower.service';
import {getRandomTransId} from '../../../../../../../shared/util/random-number-ultils';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import {MadichvuModel} from '../../../../../../../shared/model/madichvu.model';
import {UtilityService} from '../../../../../../../shared/services/utility.service';
import {PromotionModel} from '../../../../../../../shared/model/promotion.model';
import {AppConfigService} from '../../../../../../../app-config.service';
import {LocalStorageService} from 'ngx-webstorage';

@Component({
	selector: 'kt-sms-service-register-ex-cus',
	templateUrl: './sms-service-register-ex-cus.component.html',
	styleUrls: ['./sms-service-register-ex-cus.component.scss']
})
export class SmsServiceRegisterExCusComponent implements OnInit, OnChanges, OnDestroy {

	@Input() parentForm: FormGroup;
	@Input() smsList: any = [];
	formArray: FormArray;
	data = [];
	@Input() dataFrmDash: any;
	@Input() inputtable: boolean;
	@Input() authoriserble: boolean;
	listAccountSms: any[] = [];
	arrFilter: any[] = [];
	isDetailSms: boolean = false;
	listAccount$ = new BehaviorSubject<any>([]);
	listSms$ = new BehaviorSubject<any>([]);
	smsCoCode: any;
	sms: any = {
		'id': '',
		'phoneNumber': '',
		'serviceId': '',
		'email': '',
		'transID': '',
		'promotionId': '',
		'coCode': ''
	};
	smsRegisterForm = this.fb.group({
		idSms: [''],
		formArray: this.fb.array([]),
		smsCheckbox: [false]
	});

	isShowSms: boolean = true;
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<any>(false);
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	serviceList$ = new BehaviorSubject<MadichvuModel[]>([]);
	promotionList$ = new BehaviorSubject<PromotionModel[]>([]);
	doneLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isChecked: boolean = false;
	userName: string = '';

	constructor(private fb: FormBuilder,
				private smsService: SmsService,
				private dataPowerService: DataPowerService,
				private toastService: ToastrService,
				private translateService: TranslateService,
				public commonService: CommonService,
				private utilityService: UtilityService,
				private appConfigService: AppConfigService,
				private localStorageService: LocalStorageService) {
		this.userName = this.localStorageService.retrieve(USERNAME_CACHED);
	}

	ngOnInit() {
		this.getMadichVu();
		this.getPromotions();
		if (this.dataFrmDash) {
			if (this.dataFrmDash.combo) {
				if(this.dataFrmDash.combo.status == "SAVED" && this.dataFrmDash.sms && this.dataFrmDash.sms.smsDetail) {
					let data = this.dataFrmDash.sms.smsDetail;
					data.forEach(item => {
						console.log('this.form', item);
						this.form.push(this.createItem(item));
					});
				}
				this.commonService.customerId$.next(this.dataFrmDash.combo.customerId);
			}
			if (this.dataFrmDash.sms == null) {
				// this.isShowSms = false;
				this.smsRegisterForm.patchValue({
					idSms: getRandomTransId(this.userName, 'sms')
				});
				this.smsRegisterForm.controls.smsCheckbox.setValue(false);
				this.removeValidator();
			} else {

				this.isShowSms = true;
				this.smsRegisterForm.controls.smsCheckbox.setValue(true);
				this.smsRegisterForm.patchValue({
					idSms: this.dataFrmDash.sms.id
				});
				if(this.dataFrmDash.combo.status != 'SAVED') {
					this.getDetailSms();
				}
			}
		} else {
			this.isShowSms = false;
			this.smsRegisterForm.controls.smsCheckbox.setValue(false);
			if (!this.smsRegisterForm.controls.smsCheckbox) {
				this.removeValidator();
			}
			this.smsRegisterForm.patchValue({
				idSms: getRandomTransId(this.userName, 'sms')
			});
		}

		// this.getListSmsExistedOfCustomer();
		this.getAccount();
		this.getSms();

		this.parentForm.addControl('smsRegisterForm', this.smsRegisterForm);
	}

	getMadichVu() {
		const cache = this.localStorageService.retrieve(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE);
		if (cache) {
			this.serviceList$.next(cache);
			return;
		}
		this.utilityService.getMadichvusNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const madichvus = res.body.enquiry.madichvus;
					this.serviceList$.next(madichvus);
					this.localStorageService.store(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE, madichvus);
				}
			});
	}

	getPromotions() {
		const cache = this.localStorageService.retrieve(UTILITY.PROMOTION.PROMOTION_CACHE);
		if (cache) {
			this.promotionList$.next(cache);
			return;
		}
		this.utilityService.getPromotionsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const promotions = res.body.enquiry.promotions;
					this.promotionList$.next(promotions);
					this.localStorageService.store(UTILITY.PROMOTION.PROMOTION_CACHE, promotions);
				}
			});
	}

	ngOnDestroy() {
		this.commonService.closeSms$.next(false);
		this.commonService.isCheckedTKTT$.next(false);
		this.commonService.isExistedSmsForExCustomer$.next(false);
	}


	createItem(sms?: any) {
		return this.fb.group({
			// id: [sms.id || ''],
			id: [this.isDetailSms ? sms.id.substr(sms.id.indexOf('#') + 1) : getRandomTransId('DETAIL', 'sms')],
			accountNumber: [sms && sms.accountNumber ? sms.accountNumber : 'newTKTT', Validators.required],
			phoneNumber: [sms ? sms.phoneNumber : '', [Validators.required, Validators.pattern('0+([0-9]{9})')]],
			serviceId: [sms ? sms.serviceId : null, Validators.required],
			promotionId: [sms ? sms.promotionId : null],
			email: [sms ? sms.email : '', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$'), Validators.required]],
		});
	}

	get form(): FormArray {
		if (this.smsRegisterForm) {
			return this.smsRegisterForm.get('formArray') as FormArray;
		}
	}

	pushDataFromTableToFormArray(sms: any, event: any) {
		this.formArray = this.smsRegisterForm.get('formArray') as FormArray;
		let isChecked = event.target.checked;
		if (isChecked == true) {
			event.target.checked = true;
			this.arrFilter = [];
			this.data.forEach(d => {
				this.arrFilter.push(d.accountID);
			});
			if (this.arrFilter.indexOf(sms.accountID) == -1) {
				this.data.push(sms);
				this.formArray.push(this.fb.group({
					id: [getRandomTransId('sms', 'sms')],
					phoneNumber: ['', [Validators.required, Validators.pattern('0+([0-9]{9})')]],
					serviceId: [null, Validators.required],
					promotionId: [null],
					email: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$'), Validators.required]],
					accountNumber: [sms.accountID]
				}));
			}
		} else {
			event.target.checked = false;
			this.data = this.data.filter(k => k.accountID != sms.accountID);
			for (let i = 0; i < this.formArray.value.length; i++) {
				if (sms.accountID == this.formArray.value[i].accountNumber) {
					this.formArray.removeAt(i);
				}
			}
		}
	}

	setOrRemoveValidatorForFields(event: any) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				let fieldNames = ['accountNumber', 'phoneNumber', 'serviceId', 'promotionId', 'email'];
				let isSmsCheckbox = event.target.checked;

				if (!isSmsCheckbox) {
					for (let i = 0; i < this.form.controls.length; i++) {
						for (const fieldName in this.form.controls[i]['controls']) {
							if (fieldNames.includes(fieldName)) {
								this.form.controls[i]['controls'][fieldName].clearValidators();
								this.form.controls[i]['controls'][fieldName].markAsUntouched();
								this.form.controls[i]['controls'][fieldName].updateValueAndValidity();
							}
						}
					}

				} else {
					this.isShowSms = true;
					if (this.form.value.length == 0) {
						this.addItem();
					}
					this.addValidator();
				}
			}
		});
	}

	addValidator() {
		let fieldNames = ['accountNumber', 'phoneNumber', 'serviceId', 'promotionId', 'email'];
		for (let i = 0; i < this.form.controls.length; i++) {
			for (const fieldName in this.form.controls[i]['controls']) {
				if (fieldNames.includes(fieldName)) {
					if (fieldName == 'email') {
						this.form.controls[i]['controls'][fieldName].setValidators([Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]);
					} else if (fieldName == 'phoneNumber') {
						this.form.controls[i]['controls'][fieldName].setValidators([Validators.pattern('0+([0-9]{9})')]);
					} else if (fieldName == 'serviceId') {
						this.form.controls[i]['controls'][fieldName].setValidators([Validators.required]);

					}
					this.form.controls[i]['controls'][fieldName].updateValueAndValidity();
				}
			}
		}
	}

	removeValidator() {
		let fieldNames = ['accountNumber', 'phoneNumber', 'serviceId', 'promotionId', 'email'];
		for (let i = 0; i < this.form.controls.length; i++) {
			for (const fieldName in this.form.controls[i]['controls']) {
				if (fieldNames.includes(fieldName)) {
					if (fieldName == 'email') {
						this.form.controls[i]['controls'][fieldName].setValidators(['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]]);
					} else if (fieldName == 'phoneNumber') {
						this.form.controls[i]['controls'][fieldName].setValidators([Validators.required, Validators.pattern('0+([0-9]{9})')]);
					} else if (fieldName == 'serviceId') {
						this.form.controls[i]['controls'][fieldName].setValidators([Validators.required]);

					}
					this.form.controls[i]['controls'][fieldName].updateValueAndValidity();
				}
			}
		}
	}

	get isClicked(): boolean {
		if (this.commonService.isClickedButton$) {
			return this.commonService.isClickedButton$.getValue();
		}
	}

	getAccount() {
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
		bodyConfig.enquiry.customerID = this.commonService.customerId$.getValue();
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.subscribe((res) => {
				if (res) {
					console.log('getACC_LIST-3 RESPONSE', res);
					this.listAccount$.next(res.enquiry.account.filter(acct =>
						acct.category == '1001' || acct.category == '1006' || acct.category == '1012' || acct.category == '1013' || acct.category == '1014'));

					if (this.listAccount$.getValue().length == 0) {
						this.commonService.closeSms$.next(true);
					}
				} else {
					this.commonService.closeSms$.next(true);
				}
				console.log('this.listAccount$', this.listAccount$.getValue());
			});
	}

	getSms() {
		let body = {
			customerID: this.commonService.customerId$.getValue()
		};
		console.log(body, 'bodyRequest');
		this.smsService.getCustomerSmsReg(body).subscribe((res) => {
			if (res && res.body.status == STATUS_OK) {
				this.listSms$.next(res.body.enquiry.vadInfos);
				if (res.body.enquiry.vadInfos.length > 0) {
					this.commonService.isExistedSmsForExCustomer$.next(true);
				}
				this.smsCoCode = res.body.enquiry.coCode;
				console.log('getCustomerSmsReg-3 RESPONSE', this.listSms$.getValue());

			}
		});
	}

	getDetailSms() {
		this.doneLoading$.next(false);
		this.smsService.getListDetailSms(this.dataFrmDash.sms.id)
			.pipe(finalize(() => {
				this.doneLoading$.next(true);
			})).subscribe((res) => {
			this.isDetailSms = true;
			const data = res.seabRes.body.enquiry.product;
			data.forEach(item => {
				console.log('this.form', item);
				this.form.push(this.createItem(item));
			});
			console.log('getListDetailSms', data);
		});
	}

	removeItem(i: number, accountNumber: any) {

		console.log('this.form', this.form);
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				if (this.form.length > 1) {
					this.duplicateText$.next(null);
					this.form.removeAt(i);
					this.checkDuplicate();
				}
				if (!accountNumber) {
					this.isChecked = false;
				}
				this.listAccountSms.map(d => {
					if (d.accountID == accountNumber) {
						d.isSelected = false;
					}
				});
				for (let i = 0; i < this.data.length; i++) {
					if (this.data[i].accountID == accountNumber) {
						this.data.splice(i, 1);
					}
				}
			}
		});
	}

	checkDuplicate() {
		let listSmsRegis = this.listSms$.getValue();
		let listFormArray = this.form.value;
		this.duplicateText$.next(null);
		// so sánh trong mảng formArray
		for (let i = 0; i < listFormArray.length; i++) {
			for (let j = 0; j < listFormArray.length; j++) {
				if (i !== j && listFormArray[i].accountNumber && listFormArray[i].serviceId && listFormArray[i].phoneNumber) {
					if (listFormArray[i].accountNumber == listFormArray[j].accountNumber &&
						listFormArray[i].serviceId == listFormArray[j].serviceId &&
						listFormArray[i].phoneNumber == listFormArray[j].phoneNumber) {
						this.duplicateText$.next(`Bản ghi số ${j + 1} trùng lặp thông tin đăng ký`);
						break;
					}
				}
			}
		}

		// so sánh formArray với list sms
		for (let i = 0; i < listSmsRegis.length; i++) {
			for (let j = 0; j < listFormArray.length; j++) {
				if (listSmsRegis[i].accountID == listFormArray[j].accountNumber &&
					listSmsRegis[i].vadParamId == listFormArray[j].serviceId &&
					listSmsRegis[i].telNo == listFormArray[j].phoneNumber) {
					this.duplicateText$.next(`Bản ghi số ${j + 1} trùng lặp thông tin đăng ký`);
					break;
				}
				// }
			}
		}
	}

	addItem() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.form.push(this.createItemInit());
			}
		});
	}

	createItemInit() {
		return this.fb.group({
			id: [getRandomTransId('DETAIL', 'sms')],
			phoneNumber: [this.commonService.mobileAutoFill$.getValue() || null, [Validators.pattern('0+([0-9]{9})'), Validators.required]],
			serviceId: [null, [Validators.required]],
			promotionId: [null],
			email: [this.commonService.emailAutoFill$.getValue() || null, [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$'), Validators.required]],
			accountNumber: [null, Validators.required]
		});
	}

	createSmsByNewTKTT(event) {
		console.log('change', event.target.checked);
		if (event.target.checked) {
			this.isChecked = true;
			this.form.push(this.createItem());

			console.log('formdata', this.form.value);
		} else {
			this.isChecked = false;
			let indexNew = this.form.value.findIndex(item => item.accountNumber == '');
			this.form.removeAt(indexNew);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataFrmDash && !changes.dataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('dataFrmDash')) {
				this.ngOnInit();
			}
		}
	}

	get isReadonly(): Observable<boolean> {
		if (this.authoriserble) {
			return of(true);
		}
		if (this.commonService.smsStatus$.getValue()) {
			if (this.commonService.canReupdateSms$.getValue()) {
				return of(false);
			}
			return of(true);
		}

		return of(false);
	}

	get isReadonlyLable(): Observable<boolean> {
		if ((this.listAccount$.getValue().length == 0) && (this.parentForm.get('accountInfoForm.accountCheckbox').value == false)) {
			return of(true);
		}
		return of(false);
	}

	duplicateText$ = new BehaviorSubject<string>(null);

	blurCheckExistSms(event, form, index) {
		console.log(form);
		this.checkDuplicate();
	}
}
