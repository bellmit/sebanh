import { ACTION_T24_CREATE } from './../../../../../../shared/model/constants/common-constant';
import { Component, Input, OnChanges, OnInit, SimpleChanges, OnDestroy } from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {SmsService} from '../../transaction-operations/sms/sms.services';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import {finalize} from 'rxjs/operators';
import {PromotionModel} from '../../../../../../shared/model/promotion.model';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {MadichvuModel} from '../../../../../../shared/model/madichvu.model';
import {CODE_00, STATUS_OK, USERNAME_CACHED, UTILITY} from '../../../../../../shared/util/constant';
import {LocalStorageService} from 'ngx-webstorage';

@Component({
	selector: 'kt-sms-register',
	templateUrl: './sms-register.component.html',
	styleUrls: ['./sms-register.component.scss']
})
export class SmsRegisterComponent implements OnInit, OnChanges, OnDestroy {

	@Input() parentForm: FormGroup;
	@Input() smsList: any = [];
	@Input() dataFrmDash: any;
	@Input() inputtable: boolean;
	@Input() authoriserble: boolean;
	@Input() accountNumber$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	formArray: FormArray;
	isShowFormData: boolean = true;
	data = [];
	indexOfRemoveFormValue: number [] = [];
	masterSelected: boolean;
	arrFilter: any[] = [];
	smsRegisterForm: FormGroup;
	isShowSms: boolean = true;
	isLoadingSms$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	smsList$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<any>(false);
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	serviceList$ = new BehaviorSubject<MadichvuModel[]>([]);
	promotionList$ = new BehaviorSubject<PromotionModel[]>([]);
	isDetailSms: boolean = false;
	dataSmsError$: BehaviorSubject<string> = new BehaviorSubject<any>(null);
	userName: string = '';


	constructor(private fb: FormBuilder,
				private smsService: SmsService,
				public commonService: CommonService,
				private utilityService: UtilityService,
				private localStorage: LocalStorageService) {
		this.userName = this.localStorage.retrieve(USERNAME_CACHED);
	}

	ngOnInit() {
		this.getMadichVu();
		this.getPromotions();
		if (this.dataFrmDash) {
			console.log('this.dataFrmDash', this.dataFrmDash);
			if (this.dataFrmDash.sms == null) {
				this.smsRegisterForm = this.fb.group({
					idSms: [''],
					formArray: this.fb.array([this.createItemInit()]),
					smsCheckbox: [false]
				});

				this.smsRegisterForm.patchValue({
					idSms: getRandomTransId(this.userName, 'sms')
				});
				this.smsRegisterForm.controls.smsCheckbox.setValue(false);
				this.clearValidator();
			} else {
				if (this.dataFrmDash && this.dataFrmDash.sms) {
					this.isShowSms = true;
					console.log('this.dataFrmDash', this.dataFrmDash);
					if (this.dataFrmDash.sms.status == 'ERROR' && this.dataFrmDash.sms.errorDesc) {
						console.log('Lỗi sms', this.dataFrmDash.sms.errorDesc);
						this.dataSmsError$.next(this.dataFrmDash.sms.errorDesc);
					}
				}
				this.smsRegisterForm = this.fb.group({
					idSms: [''],
					formArray: this.fb.array([]),
					smsCheckbox: [false]
				});

				this.smsRegisterForm.controls.smsCheckbox.setValue(true);
				this.isShowSms = true;
				this.smsRegisterForm.patchValue({
					idSms: this.dataFrmDash.sms.id
				});
				if(this.dataFrmDash.combo.status != 'SAVED') {
					this.getDetailSms();
				}
			}
		} else {
			this.smsRegisterForm = this.fb.group({
				idSms: [''],
				formArray: this.fb.array([this.createItemInit()]),
				smsCheckbox: [false]
			});
			this.smsRegisterForm.controls.smsCheckbox.setValue(false);
			this.isShowSms = false;
			this.clearValidator();
			this.smsRegisterForm.patchValue({
				idSms: getRandomTransId(this.userName, 'sms')
			});
		}
		this.parentForm.addControl('smsRegisterForm', this.smsRegisterForm);
	}

	ngOnDestroy() {
			this.duplicateText$.next(null)
	}

	getMadichVu() {
		const cache = this.localStorage.retrieve(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE);
		if (cache) {
			this.serviceList$.next(cache);
			return;
		}
		this.utilityService.getMadichvusNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const madichvus = res.body.enquiry.madichvus;
					this.serviceList$.next(madichvus);
					this.localStorage.store(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE, madichvus);
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

	createItem(sms?: any) {
		return this.fb.group({
			id: [this.isDetailSms ? sms.id.substr(sms.id.indexOf('#') + 1) : getRandomTransId('DETAIL', 'sms')],
			phoneNumber: [this.isDetailSms ? sms.phoneNumber : '', [Validators.pattern('0+([0-9]{9})'), Validators.required]],
			serviceId: [this.isDetailSms ? sms.serviceId : null, [Validators.required]],
			promotionId: [this.isDetailSms ? sms.promotionId : null],
			email: [this.isDetailSms ? sms.email : '', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$'), Validators.required]],
		});
	}

	createItemInit() {
		return this.fb.group({
			id: [getRandomTransId('DETAIL', 'sms')],
			phoneNumber: [this.commonService.mobileAutoFill$.getValue() || '', [Validators.pattern('0+([0-9]{9})'), Validators.required]],
			serviceId: ['', [Validators.required]],
			promotionId: [''],
			email: [this.commonService.emailAutoFill$.getValue() || '', [Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$'), Validators.required]],
		});
	}

	get form(): FormArray {
		if (this.smsRegisterForm) {
			return this.smsRegisterForm.get('formArray') as FormArray;
		}
	}

	toggleSms() {
		this.isShowSms = !this.isShowSms;
	}

	setOrRemoveValidatorForFields(event: any) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				let fieldNames = ['phoneNumber', 'serviceId', 'promotionId', 'email'];
				let isSmsCheckbox = event.target.checked;
				this.isShowSms = !this.isShowSms;

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
					if (this.form.value.length = 1) {
						this.form.removeAt(0);
						this.addItem();
					}
					this.isShowSms = true;
					for (let i = 0; i < this.form.controls.length; i++) {
						for (const fieldName in this.form.controls[i]['controls']) {
							if (fieldNames.includes(fieldName)) {
								if (fieldName == 'email') {
									this.form.controls[i]['controls'][fieldName].setValidators([Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$')]);
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
			}
		});
	}

	addValidator() {
		let fieldNames = ['phoneNumber', 'serviceId', 'promotionId', 'email'];
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

	clearValidator() {
		let fieldNames = ['phoneNumber', 'serviceId', 'promotionId', 'email'];
		for (let i = 0; i < this.form.controls.length; i++) {
			for (const fieldName in this.form.controls[i]['controls']) {
				if (fieldNames.includes(fieldName)) {
					this.form.controls[i]['controls'][fieldName].clearValidators();
					this.form.controls[i]['controls'][fieldName].markAsUntouched();
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

	addItem() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.form.push(this.createItemInit());
			}
		});
	}

	getDetailSms() {
		this.isLoadingSms$.next(true);
		this.smsService.getListDetailSms(this.dataFrmDash.sms.id)
			.pipe(finalize(() => {
				this.isLoadingSms$.next(false);
			})).subscribe((res) => {
			this.isDetailSms = true;
			this.smsList$.next(res.seabRes.body.enquiry.product);
			console.log('getListDetailSms', this.smsList$.getValue());
			const data = this.smsList$.getValue();
			data.forEach(item => {
				this.form.push(this.createItem(item));
			});
		});
	}

	removeItem(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				console.log(this.arrFilter, 'array filter');
				if (this.form.length > 1) {
					this.form.removeAt(i);
					this.checkDuplicate()
				}
			}
		});
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

		if(this.parentForm.get('accountInfoForm.accountCheckbox').value == false) {
			return of(true)
		}
		if (this.commonService.smsStatus$.getValue()) {
			if (this.commonService.canReupdateSms$.getValue()) {
				return of(false);
			} else {
				return of(true);
			}

		}
		return of(false);
	}

	duplicateText$ = new BehaviorSubject<string>(null)
	blurCheckExistSms(event, form, index) {
		console.log(form);
		this.checkDuplicate()
	}

	checkDuplicate() {
		let listFormArray = this.form.value
		this.duplicateText$.next(null)
		// so sánh trong mảng formArray
		for (let i = 0; i < listFormArray.length; i++) {
			for (let j = 0; j < listFormArray.length; j++) {
			if (i !== j && listFormArray[i].serviceId && listFormArray[i].phoneNumber) {
				if (listFormArray[i].serviceId == listFormArray[j].serviceId &&
					listFormArray[i].phoneNumber == listFormArray[j].phoneNumber) {
				this.duplicateText$.next(`Bản ghi số ${j + 1} trùng lặp thông tin đăng ký`);
				break;
				}
			}
			}
		}
	}

	bodySms: any;
	username: any;
	comboInfo: any
	getDataComboSms() {
		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		this.comboInfo = this.parentForm.controls.comboInfoForm.value;
		this.bodySms = {
			id: (this.dataFrmDash && this.dataFrmDash.sms) ? this.dataFrmDash.sms.id : getRandomTransId(this.username, 'sms'),
			priority: this.comboInfo.priority,
			actionT24: ACTION_T24_CREATE,
			smsDetail: this.smsRegisterForm.value.formArray,
		}
		return this.bodySms;
	}
}
