import {ACTION_T24_CREATE} from './../../../../../../shared/model/constants/common-constant';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {Component, Input, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AccountModel} from '../../commons/models/AccountModel';
import {
	APPROVE,
	CODE_00,
	GET_ENQUIRY, HEADER_API_ACCOUNT,
	SEAPAY_ACCOUNT_AUTHEN_TYPE, SERVER_API_CUST_INFO,
	STATUS_OK, TAI_KHOAN, USERNAME_CACHED, UTILITY, VIP_CLASS_ACCOUNTS, VIP_TYPE_ACCOUNTS, COMBO_FEE_POLICIES, CHARGE_BUSINESS_TYPE
} from '../../../../../../shared/util/constant';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {finalize} from 'rxjs/operators';
import {LocalStorageService} from 'ngx-webstorage';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {parseDateFrmStr} from '../../../../../../shared/util/date-format-ultils';
import moment from 'moment';
import {RelationModel} from '../../../../../../shared/model/relation.model';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {convertFeeInNiceAccount} from '../../../../../../shared/util/Utils';
import {AppConfigService} from '../../../../../../app-config.service';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import {ChargeInfoComponent} from '../../charge-info/charge-info.component';

@Component({
	selector: 'kt-open-account-info',
	templateUrl: './open-account-info.component.html',
	styleUrls: ['./open-account-info.component.scss']
})
export class OpenAccountInfoComponent implements OnInit, OnDestroy {
	@ViewChild(ChargeInfoComponent, {static: false})
	chargeInfoComponent: ChargeInfoComponent;
	@Input() parentForm: FormGroup;
	@Input() isExCombo: boolean = false;
	@Input() accountInfo: BehaviorSubject<AccountModel[]> = new BehaviorSubject<AccountModel[]>(null);
	@Input() accFrmDash: any;
	@Input() inputterble: boolean;
	@Input() authoraiserble: boolean;
	accountList: AccountModel[] = [];
	chargeBusinessType = CHARGE_BUSINESS_TYPE;
	accountInfoForm: FormGroup;
	isShowAccount: boolean = true;
	isLoadingCcyList$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingNiceAccounts$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingNiceAccountsOfLeadership$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isDisableAccountNumberInput$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	notFoundNiceAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCheckAcc$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	niceAccError$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	checkedAccName$ = new BehaviorSubject<string>(null);
	ccyList: any[] = [];
	relateList$ = new BehaviorSubject<RelationModel[]>([]);
	isCheckedCheckbox: boolean = false;
	vipTypeAccounts = VIP_TYPE_ACCOUNTS;
	vipClassAccounts = VIP_CLASS_ACCOUNTS;
	chargeCodes$ = new BehaviorSubject<any[]>([]);

	listNiceAccount$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	niceAccountPolicy$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	listNiceAccount: any = [];

	THU_PHI = 'THU.PHI';
	DUY_TRI_SO_DU = 'DUY.TRI.SO.DU';
	MIEN_PHI = 'MIEN.PHI';
	feePolicies = COMBO_FEE_POLICIES;
	selectedNiceAccount: any;
	dataAccountError$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	relationId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isLoadingCheckRelationExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	hasCreateAcc$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	niceAcc10$ = new BehaviorSubject<boolean>(false);
	niceAcc12$ = new BehaviorSubject<boolean>(false);
	//check id customer mối quan hệ
	listName: any = [];
	listName$ = new BehaviorSubject<any[]>([]);
	showNiceAcc$ = new BehaviorSubject<boolean>(true);

	fatcaList: any [] = [];
	fatca1: boolean = false;
	fatca2: boolean = false;
	fatca3: boolean = false;
	fatca4: boolean = false;
	fatca5: boolean = false;
	listNiceAcctType = [TAI_KHOAN.SO_DEP_10_SO, TAI_KHOAN.SO_DEP_12_SO, TAI_KHOAN.SO_DEP_6_SO,
		TAI_KHOAN.SO_DEP_7_SO, TAI_KHOAN.SO_DEP_8_SO, TAI_KHOAN.SO_DEP_9_SO];

	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private localStorage: LocalStorageService,
				private modal: NgbModal,
				private utilityService: UtilityService,
				private dataPowerService: DataPowerService,
				private appConfigService: AppConfigService) {
		this.username = this.localStorage.retrieve(USERNAME_CACHED);
	}

	ngOnInit() {
		const accountTransactionId = (this.accFrmDash && this.accFrmDash.account) ? this.accFrmDash.account.id : getRandomTransId(this.username, 'account');
		this.accountInfoForm = this.fb.group({
			id: [accountTransactionId],
			customerId: [''],
			accountName: [''],
			shortName: [''],
			accountNumber: [''],
			transID: [''],
			priority: [''],
			accountCheckbox: [false],
			currency: [null, Validators.required],
			feeAmount: [''],
			goldenAccountType: [''],
			classNiceAccount: [''],
			classifyNiceAccount: [null],
			feeAccount: [''],
			accountPolicy: [''],
			tax: [''],
			totalAmount: [''],
			dateFee: [new Date()],
			description: [''],
			lockDownAmount: [''],
			feeCode: [''],
			phoneNumberAccount: [''],
			fatca1: [null, Validators.required],
			fatca2: [null, Validators.required],
			fatca3: [null, Validators.required],
			fatca4: [null, Validators.required],
			fatca5: [null, Validators.required],
			fatca6: [null, Validators.required],
			fatca7: [null, Validators.required],
			relates: this.commonService.isUpdateCombo$.getValue() ? this.fb.array([]) : this.fb.array([this.newRelate()]),
		});

		this.fatcaList = [
			{
				id: 'fatca1',
				question: 'Quý khách là công dân Hoa Kỳ hoặc là thường trú nhân Hoa Kỳ?',
				option: ''
			},
			{
				id: 'fatca2',
				question: 'Quý khách có nơi sinh tại Hoa Kỳ?',
				option: ''
			},
			{
				id: 'fatca3',
				question: 'Quý khách có địa chỉ nhận thư hoặc địa chỉ cư trú (bao gồm cả địa chỉ hộp thư ở bưu điện) tại Hoa Kỳ?',
				option: ''
			},
			{
				id: 'fatca4',
				question: 'Quý khách có số điện thoại liên lạc tại Hoa Kỳ?',
				option: ''
			},
			{
				id: 'fatca5',
				question: 'Quý khách có chỉ định định kỳ chuyển tiền vào một tài khoản mở tại Hoa Kỳ?',
				option: ''
			},
			{
				id: 'fatca6',
				question: 'Quý khách có ủy quyền còn hiệu lực đối với tài khoản tài chính cho một tổ chức/Cá nhân có địa chỉ Hoa Kỳ?',
				option: ''
			},
			{
				id: 'fatca7',
				question: 'Quý khách có địa chỉ "nhờ chuyển thư" hoặc "giữ thư" tại Hoa Kỳ?',
				option: ''
			},
		];
		this.getRelations();
		this.getChargeCodes();
		this.getCcyList();
		if (this.accFrmDash && this.commonService.isExCombo$.getValue()) {
			if (this.accFrmDash.account == null) {
				this.accountInfoForm.controls.accountCheckbox.setValue(false);
				// this.parentForm.get('ebankForm.ebankCheckbox').setValue(false);
				this.removeValidators(this.accountInfoForm);
			} else {
				// this.isShowAccount = true;
				this.accountInfoForm.controls.accountCheckbox.setValue(true);
				// this.parentForm.get('ebankForm.ebankCheckbox').setValue(true);
				this.commonService.isCheckedTKTT$.next(true);
			}
		} else {
			this.accountInfoForm.controls.accountCheckbox.setValue(false);
			this.isShowAccount = false;
			if (this.accountInfoForm.controls.accountCheckbox.value == false) {
				this.commonService.isCheckedTKTT$.next(false);
				this.removeValidators(this.accountInfoForm);
				// this.parentForm.get('ebankForm.ebankCheckbox').setValue(false);
			}
		}

		if (this.accFrmDash && this.accFrmDash.account) {
			this.hasCreateAcc$.next(true);
			this.isShowAccount = true;
			this.isCheckedCheckbox = true;
			this.accountInfoForm.controls.accountCheckbox.setValue(true);
			if (this.accFrmDash.account.feePolicy != null) {
				this.changeAccountPolicy(this.accFrmDash.account.feePolicy);
			}

			// if(this.accFrmDash.account.fatca) {
			// 	this.isShowOtherInfo = true;
			// }

			if (this.accFrmDash.account.status == 'ERROR' && this.accFrmDash.account.errorDesc) {
				this.dataAccountError$.next(this.accFrmDash.account.errorDesc);
			}
			console.log(this.accFrmDash, 'dash');
			console.log('this.accFrmDash.account.cusRelationships.forEach', this.accFrmDash.account.cusRelationships);
			if (this.accFrmDash.account.cusRelationships.length > 0) {
				let i = 0;
				this.accFrmDash.account.cusRelationships.forEach(element => {
					this.relates.push(this.newRelate(element));
					this.getCustomerInfo(i++);
				});
			} else {
				this.addRelate();
			}
			this.accountInfoForm.patchValue({
				accountName: this.accFrmDash.account.accountName ? this.accFrmDash.account.accountName : '',
				shortName: this.accFrmDash.account.shortName ? this.accFrmDash.account.shortName : '',
				accountNumber: this.accFrmDash.account.accountNumber ? this.accFrmDash.account.accountNumber : '',
				currency: this.accFrmDash.account.currency ? this.accFrmDash.account.currency : null,
				feeAmount: this.accFrmDash.account.feeAmtReq,
				goldenAccountType: this.accFrmDash.account.acctNiceType,
				classNiceAccount: this.accFrmDash.account.acctNiceClass,
				classifyNiceAccount: this.accFrmDash.account.vipType == 'ACCOUNT_NORMAL' ? null : this.accFrmDash.account.vipType,
				feeAccount: this.accFrmDash.account.feeAccountid,
				accountPolicy: this.accFrmDash.account.feePolicy,
				tax: this.accFrmDash.account.tax,
				totalAmount: this.accFrmDash.account.feeTotal,
				dateFee: this.accFrmDash.account.feeDate ? moment(this.accFrmDash.account.feeDate, 'DD-MM-YYYY').toDate() : null,
				description: this.accFrmDash.account.explain,
				lockDownAmount: this.accFrmDash.account.lockDownMoney,
				feeCode: this.accFrmDash.account.feeCode,
				phoneNumberAccount: this.accFrmDash.account.phoneNumberAccount,
				fatca1: this.accFrmDash.account.fatca.answer1,
				fatca2: this.accFrmDash.account.fatca.answer2,
				fatca3: this.accFrmDash.account.fatca.answer3,
				fatca4: this.accFrmDash.account.fatca.answer4,
				fatca5: this.accFrmDash.account.fatca.answer5,
				fatca6: this.accFrmDash.account.fatca.answer6,
				fatca7: this.accFrmDash.account.fatca.answer7,
			});

			let vipTpe = this.accFrmDash.account.vipType;
			// let feePolicyNiceAccount = this.accFrmDash.account.feePolicy;
			if (this.listNiceAcctType.includes(vipTpe)) {

				this.commonService.isNiceAccountNumber$.next(true);
				// this.accountInfoForm.get('accountPolicy').setValidators([Validators.required]);
				// this.accountInfoForm.get('accountPolicy').updateValueAndValidity();
				// this.niceAccountPolicy$.next(feePolicyNiceAccount);
				this.isDisableAccountNumberInput$.next(true);
			}
		} else {
			const relatesFormArr = this.accountInfoForm.get('relates') as FormArray;
			if (relatesFormArr.length == 0) {
				this.addRelate();
			}
		}

		this.accountInfo.subscribe(i => {
			if (i != null) {
				console.log('@Input Account --------->>>>', i);
				this.accountList = i;
			}
		});
		this.parentForm.addControl('accountInfoForm', this.accountInfoForm);

		this.niceAccountPolicy$.subscribe(i => {
			switch (i) {
				case this.THU_PHI:
					this.addValidatorFeePolicy();
					break;
			}
		});
	}

	getRelations() {
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

	getChargeCodes() {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE);
		if (cache) {
			const dataFilter = cache.filter(ele => ele.flatAmt);
			this.chargeCodes$.next(dataFilter);
			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const commisstions = res.body.enquiry.catalogs;
					const dataFilter = commisstions.filter(ele => ele.flatAmt);
					this.chargeCodes$.next(dataFilter);
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE, dataFilter);
				}
			});
	}

	getCcyList() {
		const ccyCached = this.localStorage.retrieve('ccyCached');
		if (ccyCached) {
			this.ccyList = ccyCached;
		} else {
			let command = GET_ENQUIRY;
			let enquiry: EnquiryModel = new EnquiryModel();
			enquiry.authenType = 'getCurrency_Rate';
			this.isLoadingCcyList$.next(true);
			let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
			this.commonService.actionGetEnquiryUtility(bodyRequest).pipe(finalize(
				() => this.isLoadingCcyList$.next(false)))
				.subscribe(r => {
					if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
						this.ccyList = r.enquiry.currencyRate;
						console.log(this.ccyList, 'ccyList');
						this.localStorage.store('ccyCached', this.ccyList);
					} else {
						this.commonService.error(r.desc);
					}
				});

		}

	}

	get frm() {
		if (this.accountInfoForm && this.accountInfoForm.controls) {
			return this.accountInfoForm.controls;
		}
	}

	get relates(): FormArray {
		return this.accountInfoForm.get('relates') as FormArray;
	}

	newRelate(relate?: any): FormGroup {
		return this.fb.group({
			idRelate: [relate ? relate.idRelate : ''],
			relationCustomer: [relate ? relate.relationCustomer : null]
		});
	}

	addRelate() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.relates.push(this.newRelate());
			}
		});
	}

	removeRelate(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.relates.removeAt(i);
				this.listName[i] = '';
			}
		});
	}

	toggleAccount(): void {
		this.isShowAccount = !this.isShowAccount;
	}

	get isClicked(): boolean {
		return this.commonService.isClickedButton$.getValue();
	}

	removeValidators(form: FormGroup) {
		this.accountInfoForm.markAsUntouched();
		this.accountInfoForm.updateValueAndValidity();
		for (const key in form.controls) {
			form.get(key).clearValidators();
			form.get(key).updateValueAndValidity();
		}
	}

	addValidator(form: FormGroup) {
		const arr = ['accountCheckbox', 'currency'];
		for (const key in form.controls) {
			arr.forEach(r => {
				if (key == r) {
					form.get(key).setValidators([Validators.required]);
					form.get(key).updateValueAndValidity();
				}
			});
		}
	}

	onChangeValidate() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.isShowAccount = !this.isShowAccount;
				if (this.accountInfoForm.controls.accountCheckbox.value == false) {
					this.isCheckedCheckbox = false;
					this.commonService.isCheckedTKTT$.next(false);
					// Nếu không có bản ghi seanet => bỏ tích checkbox ebank
					if (!this.commonService.isShowEbank$.getValue()) {
						this.parentForm.get('ebankForm.ebankCheckbox').setValue(false);
					}

					// Bỏ tích checkbox đăng ký SMS

					if (this.isExCombo && this.commonService.closeSms$.getValue() || !this.isExCombo) {
						this.parentForm.get('smsRegisterForm.smsCheckbox').setValue(false);
					}

					let accountNumberNew = '';
					if (this.parentForm.get('openCardForm')) {
						accountNumberNew = this.parentForm.get('openCardForm.accountNumber').value;
					}

					if (accountNumberNew == 'newAccount') {
						this.parentForm.get('openCardForm.accountNumber').setValue(null);
					}

					if ((this.isExCombo && !this.accountInfo.getValue() || !this.isExCombo) && !window.location.href.includes('combo1')) {
						this.parentForm.get('openCardForm.cardCheckbox').setValue(false);
					}

					this.removeValidators(this.accountInfoForm);

				} else {
					// this.isShowOtherInfo = true;
					this.isCheckedCheckbox = true;
					this.isShowAccount = true;
					this.commonService.isCheckedTKTT$.next(true);
					this.parentForm.get('ebankForm.ebankCheckbox').setValue(true);
					this.addValidator(this.accountInfoForm);
					// set ten tai khoan
					// const customerName = this.parentForm.get('customerForm').get('customerName');
					if (this.parentForm.get('customerForm')) {
						this.accountInfoForm.get('accountName').setValue(this.parentForm.get('customerForm').get('customerName').value);
					} else {
						this.accountInfoForm.get('accountName').setValue(this.commonService.customerDataObject$.getValue().shortName);
					}
				}
			}
		});
	}

	get APPROVED() {
		return this.accFrmDash && this.accFrmDash.combo && this.accFrmDash.combo.status.startsWith(APPROVE);
	}

	// TODO CHECK TÀI KHOẢN SỐ ĐẸP
	checkNiceAccountNumber() {
		this.niceAccError$.next(false);
		this.notFoundNiceAccount$.next(false);
		this.commonService.isNiceAccountNumber$.next(false);

		this.clearValidatorFeePolicy();
		// this.clearValidatorMinimumBalanceCommitmentPolicy();
		this.resetFormNiceAccount();

		let accountNumber = this.frm.accountNumber.value;
		let classifyNiceAccount = this.frm.classifyNiceAccount.value;


		if (this.accFrmDash && this.accFrmDash.account && accountNumber == this.accFrmDash.account.accountNumber) {
			return;
		}

		if (accountNumber.trim() == '') {
			if (this.listNiceAccount$.getValue().length > 0) {
				this.listNiceAccount = this.listNiceAccount$.getValue();
				this.accountInfoForm.get('classifyNiceAccount').clearValidators();
				this.accountInfoForm.get('classifyNiceAccount').updateValueAndValidity();
			}

			this.accountInfoForm.get('accountPolicy').clearValidators();
			this.accountInfoForm.get('accountPolicy').updateValueAndValidity();
			return;
		}

		if (this.listNiceAccount$.getValue().length > 0 && accountNumber) {
			let choiceAccount = this.listNiceAccount$.getValue().find(i => accountNumber == i.accountID);

			if (choiceAccount != null) {
				return;
			}
		}

		let accountType;

		switch (classifyNiceAccount) {
			case 'ACCOUNT_NICE_10':
				accountType = 10;
				break;
			case 'ACCOUNT_NICE_12':
				accountType = 12;
				break;
			case 'ACCOUNT_NICE_9':
				accountType = 9;
				break;
			case 'ACCOUNT_NICE_8':
				accountType = 8;
				break;
			case 'ACCOUNT_NICE_7':
				accountType = 7;
				break;
			case 'ACCOUNT_NICE_6':
				accountType = 6;
				break;
		}

		let enquiry = {
			authenType: SEAPAY_ACCOUNT_AUTHEN_TYPE.QUERY_NICE_ACCOUNT_INFO,
			inputter: this.localStorage.retrieve(USERNAME_CACHED),
			accountId: accountNumber,
			acctType: accountType,
			customerType: 'KHCN'
		};
		this.isLoadingNiceAccounts$.next(true);

		this.commonService.getListNiceAccount(enquiry)
			.pipe(finalize(() => this.isLoadingNiceAccounts$.next(false)))
			.subscribe(res => {
				if (res.body.status == 'OK' && res.body.enquiry.responseCode == '00') {
					this.listNiceAccount$.next(res.body.enquiry.accountInfo);
					this.listNiceAccount = res.body.enquiry.accountInfo;
					document.getElementById('accountNumber').focus();

					// this.accountInfoForm.get('accountPolicy').setValidators([Validators.required]);
					// this.accountInfoForm.get('accountPolicy').updateValueAndValidity();

					// this.accountInfoForm.get('classifyNiceAccount').setValidators([Validators.required]);
					// this.accountInfoForm.get('classifyNiceAccount').updateValueAndValidity();


					//Số tiền phong tỏa
					let lockDownAmount = Number(convertFeeInNiceAccount(this.listNiceAccount.acctNiceFee)) / 2;
					this.frm.lockDownAmount.setValue(lockDownAmount);

				} else {
					this.listNiceAccount$.next([]);
					this.listNiceAccount = [];
					this.notFoundNiceAccount$.next(true);
					if (res.error && res.error.code == '21') {
						this.niceAccError$.next(true);
					}
				}
			});
	}


	selectNiceAccount(account: any) {

		switch (account.sodepDT) {
			case 'YES':
				this.frm.phoneNumberAccount.setValue('YES');
				break;
			case 'NO':
				this.frm.phoneNumberAccount.setValue('NO');
				break;
		}

		this.selectedNiceAccount = account;
		this.frm.goldenAccountType.setValue(this.selectedNiceAccount.acctNiceType);
		this.frm.classNiceAccount.setValue(this.selectedNiceAccount.acctNiceClass);
		this.commonService.isNiceAccountNumber$.next(true);

	}

	// TODO TÌM KIẾM TRONG DANH SÁCH TÀI KHOẢN SỐ ĐẸP NẾU CÓ
	niceAccountSearch() {
		this.niceAccError$.next(false);
		if (this.listNiceAccount$.getValue().length > 0) {
			this.listNiceAccount = this.listNiceAccount$.getValue()
				.filter(i => i.accountID.toLocaleLowerCase().includes(this.frm.accountNumber.value.toLocaleLowerCase()));
		}

	}

	/**
	 * Thay đổi chính sách tài khoản số đẹp
	 *
	 * @param typeOfPolicy: nhận vào 3 giá trị thay đổi khi người dùng chọn
	 * FEE: thu phí
	 * FREE: miễn phí
	 * MINIMUM_BALANCE_COMMITMENT: cam kết số dư tối thiểu -> phong tỏa tài khoản
	 */
	changeAccountPolicy(typeOfPolicy: any) {
		this.niceAccountPolicy$.next(typeOfPolicy);

		switch (typeOfPolicy) {
			case this.THU_PHI:
				this.addValidatorFeePolicy();
				this.frm.dateFee.setValue(new Date());
				break;

			case this.DUY_TRI_SO_DU:
				this.addValidatorFeePolicy();
				break;

			case this.MIEN_PHI:
				this.clearValidatorFeePolicy();
				break;
		}

		if (this.selectedNiceAccount && this.selectedNiceAccount.acctNiceFee) {
			let accountNiceFee = Number(convertFeeInNiceAccount(this.selectedNiceAccount.acctNiceFee));

			if (accountNiceFee && accountNiceFee > 0) {
				let lockDownAmount = accountNiceFee / 2;
				this.frm.lockDownAmount.setValue(lockDownAmount);
			}
		}
	}

	ngOnDestroy(): void {
		this.commonService.accountStatus$.next(null);
		this.hasCreateAcc$.next(false);
		this.niceAccountPolicy$.next('');
		this.commonService.isNiceAccountNumber$.next(false);
	}

	addValidatorFeePolicy() {
		const arr = ['feeAccount', 'feeCode', 'feeAmount', 'description'];
		for (const key in this.accountInfoForm.controls) {
			arr.forEach(r => {
				if (key == r) {
					this.accountInfoForm.get(key).setValidators([Validators.required]);
					this.accountInfoForm.get(key).updateValueAndValidity();
				}
			});
		}
	}

	clearValidatorFeePolicy() {
		const arr = ['feeAccount', 'feeCode', 'feeAmount', 'description'];
		for (const key in this.accountInfoForm.controls) {
			arr.forEach(r => {
				if (key == r) {
					this.accountInfoForm.get(key).clearValidators();
					this.accountInfoForm.get(key).updateValueAndValidity();
				}
			});
		}
	}

	//TODO SỐ ĐẸP BAN LÃNH ĐẠO - BA CONFIRM KHÔNG TÍCH HỢP TRÊN SEATELLER 19.05
	// /**
	//  * @return true nếu đây là tài khoản này là tài khoản cho ban lãnh đạo
	//  * @param accountNumber: sô tài khoản
	//  */
	// checkVipAccountNumberInfo(accountNumber: any): boolean {
	//
	// 	this.isLoadingNiceAccountsOfLeadership$.next(true);
	// 	this.commonService.isVipAccount$.next(false);
	//
	// 	let enquiry = {
	// 		authenType: SEAPAY_ACCOUNT_AUTHEN_TYPE.QUERY_VIP_ACCOUNT_INFO,
	// 		inputter: this.localStorage.retrieve(USERNAME_CACHED),
	// 		accountId: accountNumber,
	// 		status: 'ENABLE'
	// 	};
	//
	// 	this.commonService.getVipAccountNumberInfo(enquiry)
	// 		.pipe(finalize(() => this.isLoadingNiceAccountsOfLeadership$.next(false)))
	// 		.subscribe(res => {
	// 			if (res.body.status == 'OK' && res.body.enquiry.responseCode == '00') {
	//
	// 				let accountInfo = res.body.enquiry.accountInfo;
	// 				if (accountInfo.length > 0 && accountInfo[0].status == 'ENABLE' && accountInfo[0].accountID !== '') {
	//
	// 					let modalRef = this.modal.open(ModalAskComponent, {
	// 						backdrop: 'static',
	// 						keyboard: false,
	// 						size: 'sm',
	// 						centered: true
	// 					});
	// 					modalRef.componentInstance.content = 'Tài khoản thuộc kho của Ban Lãnh Đạo cần được cấp quyền để đăng kí. Bạn có muốn gửi yêu cầu để cấp quyền để đăng kí. Bạn có muốn gủi yêu cầu cấp quyền?';
	// 					modalRef.componentInstance.title = 'Thông báo';
	// 					modalRef.result.then(res => {
	// 						if (res == 'ok') {
	// 							this.commonService.isVipAccount$.next(true);
	// 							this.getAccountClassAndAccountTypeForVipAccount();
	// 						} else {
	// 							this.frm.accountNumber.setValue(null);
	// 						}
	// 					});
	// 					return true;
	// 				}
	// 			} else {
	// 				this.notFoundNiceAccount$.next(true);
	// 				document.getElementById('accountNumber').focus();
	// 			}
	// 		});
	//
	// 	return false;
	// }

	//TODO thay đổi kiểu tài khoản số đẹp: 10 || 12 số;
	changeClassifyNiceAccount() {

		let typeNiceAccount = this.frm.classifyNiceAccount.value;

		if (typeNiceAccount == 'ACCOUNT_NICE_10') {
			this.niceAcc10$.next(true);
			this.niceAcc12$.next(false);

		} else if (typeNiceAccount == 'ACCOUNT_NICE_12') {
			this.niceAcc12$.next(true);
			this.niceAcc10$.next(false);

		} else if (typeNiceAccount == null) {
			this.isDisableAccountNumberInput$.next(false);
			this.accountInfoForm.get('classifyNiceAccount').clearValidators();
			this.accountInfoForm.get('classifyNiceAccount').updateValueAndValidity();
		}

		this.listNiceAccount$.next([]);
		this.listNiceAccount = [];

		this.frm.accountNumber.setValue(null);
		this.commonService.isNiceAccountNumber$.next(false);
		// this.commonService.isVipAccount$.next(false);
		this.clearValidatorFeePolicy();
		// this.clearValidatorMinimumBalanceCommitmentPolicy();
		this.accountInfoForm.get('accountPolicy').clearValidators();
		this.accountInfoForm.get('accountPolicy').updateValueAndValidity();

		this.isDisableAccountNumberInput$.next(true);

		this.resetFormNiceAccount();

		// let classifyNiceAccount = this.frm.classifyNiceAccount.value;

		// if (classifyNiceAccount == null) {
		// 	this.isDisableAccountNumberInput$.next(false);
		// 	this.accountInfoForm.get('classifyNiceAccount').clearValidators();
		// 	this.accountInfoForm.get('classifyNiceAccount').updateValueAndValidity();
		// }
	}

	resetFormNiceAccount() {
		this.accountInfoForm.patchValue({
			feeAmount: null,
			goldenAccountType: null,
			classNiceAccount: null,
			feeAccount: null,
			accountPolicy: null,
			tax: null,
			totalAmount: null,
			dateFee: new Date(),
			description: null,
			lockDownAmount: null,
			feeCode: null
		});
	}

	calculateTotalAmount(feeAmount: any) {

		if (feeAmount != null) {
			let feeAmountConvertNumber = feeAmount.replace(/,/g, '');
			this.frm.feeAmount.setValue(feeAmountConvertNumber);
			let tax = Number(feeAmountConvertNumber) * 0.1;
			let totalAmount = Number(feeAmountConvertNumber) + Math.round(tax);

			this.frm.totalAmount.setValue(totalAmount);
			this.frm.tax.setValue(Math.round(tax));
		}
	}


	getCustomerInfo(index) {
		this.commonService.checkCusExists$.next(true);
		this.listName[index] = '';
		const customerId = this.relates.controls[index].get('idRelate').value;
		if (!customerId) {
			this.listName[index] = '';
			this.relates.controls[index].get('relationCustomer').clearValidators();
			this.relates.controls[index].get('relationCustomer').updateValueAndValidity();
			return;
		}
		this.relates.controls[index].get('relationCustomer').setValidators(Validators.required);
		this.relates.controls[index].get('relationCustomer').updateValueAndValidity();
		this.isLoadingCheckRelationExists$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCheckRelationExists$.next(false)))
			.pipe(finalize(() => this.commonService.checkCusExists$.next(false)))
			.subscribe(res => {
				console.log('resss', res);
				if (res) {
					this.listName[index] = res.enquiry.shortName;
					this.listName$.next(this.listName);

				} else {
					this.listName[index] = '';
					this.listName$.next(this.listName);
					this.relates.controls[index].get('idRelate').setValue(null);
					this.relates.controls[index].get('relationCustomer').clearValidators();
					this.relates.controls[index].get('relationCustomer').updateValueAndValidity();

					if (this.relates.controls[index].get('idRelate').hasError('notExist')) {
						this.relates.controls[index].get('idRelate').setErrors(null);
					}
					this.relates.controls[index].get('idRelate').setErrors({notExist: true});
					this.relates.controls[index].get('idRelate').markAsTouched();
					return;
				}
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.accFrmDash && !changes.accFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('accFrmDash')) {
				this.ngOnInit();
			}
		}
	}

	setRequireIdRelate(event, index) {
		if (event) {
			this.relates.controls[index].get('idRelate').setValidators(Validators.required);
			this.relates.controls[index].get('idRelate').markAsTouched();
		} else {
			this.relates.controls[index].get('idRelate').clearValidators();
		}

		this.relates.controls[index].get('idRelate').updateValueAndValidity();
	}

	resetFormRelate(event, index) {
		if (event) {
			this.listName[index] = '';
		}
	}

	checkValidFeeAcc(event): void {
		// console.warn('>>>> event', event.target.value);
		this.frm.feeAccount.setErrors(null);
		this.checkedAccName$.next(null);
		const accountNumber = event.target.value;
		if (accountNumber) {
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
						const accName = res.body.enquiry.accountTitle ? res.body.enquiry.accountTitle : res.body.enquiry.shortTitle;
						this.checkedAccName$.next(accName);
					} else {
						this.frm.feeAccount.setErrors({notExist: true});
						this.frm.feeAccount.markAsTouched();
					}
				});
		}
	}

	onKeyDownFeeAcc(event) {
		this.checkedAccName$.next(null);
	}

	get isReadonly(): Observable<boolean> {
		if (this.authoraiserble) {
			return of(true);
		}
		if (this.commonService.accountStatus$.getValue()) {
			if (this.commonService.canReupdateAccount$.getValue()) {
				return of(false);
			} else {
				return of(true);
			}
		}
		return of(false);
	}

	onChangeCurr(event): void {
		console.warn(event);
		if (event) {
			this.showNiceAcc$.next(event.ccy == 'VND');
		} else {
			this.showNiceAcc$.next(true);
		}
		this.changeClassifyNiceAccount();
	}

	bodyDataAccount: any;
	account: any;
	username: string;
	idAccount$ = new BehaviorSubject<string>(null);

	getAccountComboRequest() {
		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		// const idRandom = getRandomTransId(this.username, 'account');
		// let idParent = (this.accFrmDash && this.accFrmDash.account) ? this.accFrmDash.account.id :  getRandomTransId(this.username, 'account');
		// this.frm.id.setValue(idParent);
		// this.idAccount$.next(idParent)
		this.account = this.accountInfoForm.value;
		// console.log('>>>>>> this.chargeInfoComponent',this.chargeInfoComponent);
		// debugger
		this.bodyDataAccount = {
			id: this.frm.id.value,
			customerId: '',
			accountName: this.account ? this.account.accountName : this.parentForm.value.customerForm.customerName,
			shortName: this.account ? this.account.shortName : this.parentForm.value.customerForm.customerName,
			cusRelationships: this.account.relates,
			accountNumber: this.account.accountNumber,
			currency: this.account.currency,
			actionT24: ACTION_T24_CREATE,

			vipType: (this.account.classifyNiceAccount && this.account.accountNumber) ? this.account.classifyNiceAccount : 'ACCOUNT_NORMAL',
			acctNiceType: this.account.goldenAccountType,
			acctNiceClass: this.account.classNiceAccount,
			// feePolicy: this.account.accountPolicy,
			// feeAmtReq: this.account.feeAmount,
			// feeTotal: this.account.totalAmount,
			// feeDate: this.account.dateFee ? moment(this.account.dateFee).format('DD-MM-YYYY') : null,
			// feeAccountid: this.account.feeAccount,
			tax: this.account.tax,
			explain: this.account.description,
			lockDownMoney: this.account.lockDownAmount,
			// feeCode: this.account.feeCode,
			phoneNumberAccount: this.account.phoneNumberAccount,
			chargeInfo: this.chargeInfoComponent ? (this.chargeInfoComponent.frm.feePolicy.value == 'MIEN_PHI' ? null : this.chargeInfoComponent.buildRequestCharge()) : null,
			'fatca': {
				'id': (this.accFrmDash && this.accFrmDash.account && this.accFrmDash.account.fatca) ? this.accFrmDash.account.fatca.id : '',
				'accountId': null,
				'idParent': this.parentForm.value.comboInfoForm.transID,
				'question1': 'question1',
				'answer1': this.accountInfoForm.controls.fatca1.value,
				'question2': 'question2',
				'answer2': this.accountInfoForm.controls.fatca2.value,
				'question3': 'question3',
				'answer3': this.accountInfoForm.controls.fatca3.value,
				'question4': 'question4',
				'answer4': this.accountInfoForm.controls.fatca4.value,
				'question5': 'question5',
				'answer5': this.accountInfoForm.controls.fatca5.value,
				'question6': 'question6',
				'answer6': this.accountInfoForm.controls.fatca6.value,
				'question7': 'question7',
				'answer7': this.accountInfoForm.controls.fatca7.value,
			}
		};
		return this.bodyDataAccount;
	}

	checkbox(event) {
		console.log(event.target.value);
	}

	buildSameOwnerParamReport() {
		const relateValue = this.relates.value;
		if (relateValue && relateValue.length) {
			const result = [];
			for (let i = 0; i < relateValue.length; i++) {
				if (['9', '99', '30'].includes(relateValue[i].relationCustomer)) {
					result.push({
						customerId: relateValue[i].idRelate,
						customerName: this.listName$.getValue()[i],
						relationName: this.relateList$.getValue().find(r => r.relationId == relateValue[i].relationCustomer).description
					});
				}
			}
			return result;
		}
		return [];
	}

	customSearchFee(term: string, item: any) {
		term = term.toLocaleLowerCase();
		return item.id.toLocaleLowerCase().indexOf(term) > -1 ||
			item.gbDescription.toLocaleLowerCase().indexOf(term) > -1 ||
			item.currency.toLocaleLowerCase().indexOf(term) > -1;
	}
}

