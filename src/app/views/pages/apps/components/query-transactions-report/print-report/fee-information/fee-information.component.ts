import { UtilityService } from './../../../../../../../shared/services/utility.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UTILITY, STATUS_OK, CODE_00 } from './../../../../../../../shared/util/constant';
import { LocalStorageService } from 'ngx-webstorage';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { FEE_COLLECTION_PLANS_REPORT } from '../../../../../../../shared/util/constant';
import moment from 'moment';
import {QueryTransReportService} from "../../query-trans-report.service";
import {finalize} from "rxjs/operators";
import {AccountInfoModel} from "../../model/statement.model";

@Component({
	selector: 'kt-fee-information',
	templateUrl: './fee-information.component.html',
	styleUrls: ['./fee-information.component.scss']
})
export class FeeInformationComponent implements OnInit, OnDestroy {
	@Input() parentForm: FormGroup;
	@Input() listAcc: any;
	@Input() listTK: any;
	@Input() dataCacheRouter: any;
	@Input() authorisable: boolean;
	@Input() inputtable: boolean;
	today = new Date();
	listFeeCode: any[] = [];
	feeCollectionPlans = FEE_COLLECTION_PLANS_REPORT;
	APPROVED = new BehaviorSubject<boolean>(false);
	rejected$ = new BehaviorSubject<boolean>(false);
	feeForm = this.fb.group({
		account: [null, [Validators.required]],
		transDate: [new Date(), Validators.required],
		feeCode: [null, [Validators.required]],
		description: [null, [Validators.required]],
		amount: [null, Validators.required],
		tax: [null],
		feeTransId: [null],
		totalAmount: [null, Validators.required],
		feeType: ['TAI_KHOAN'],
		reason: null
	});
	chargeCodes$ = new BehaviorSubject<any>(null)

	constructor(
		private fb: FormBuilder,
		private localStorage:  LocalStorageService,
		public utilityService: UtilityService,
		private reportService: QueryTransReportService,
	) {
	}

	ngOnInit() {

		this.parentForm.addControl('feeForm', this.feeForm);
		console.log('this.parentForm', this.parentForm.value);
		this.getChargeCodes()

		if(this.dataCacheRouter) {
			if(this.dataCacheRouter.actionT24 == "MIEN_PHI") {
				this.isFree$.next(true);
				this.removeValidators(this.feeForm);
				this.feeForm.patchValue({
					account: null,
					transDate: null,
					feeCode: null,
					description: null,
					amount: null,
					tax: null,
					totalAmount: null,
			})
			}
			if (this.dataCacheRouter.status == 'REJECTED') {
				this.rejected$.next(true);
			}
			if (this.dataCacheRouter.status.includes('APPROVED')) {
				this.APPROVED.next(true);
			}
			this.getAccountByCustId();
			this.feeForm.patchValue({
				account: this.dataCacheRouter.accountCharges,
				transDate:this.dataCacheRouter.chargeDate ? moment(this.dataCacheRouter.chargeDate, 'DD/MM/YYYY') : null,
				feeCode: this.dataCacheRouter.feeCode,
				description: this.dataCacheRouter.explain,
				amount: this.dataCacheRouter.feeAmt,
				tax: this.dataCacheRouter.tax,
				feeTransId: this.dataCacheRouter.chgId,
				totalAmount: this.dataCacheRouter.totalAmt,
				feeType: this.dataCacheRouter.actionT24,
				reason: this.dataCacheRouter.reason
			})
		}
	}

	ngOnDestroy() {
		this.APPROVED.next(false);
		this.accountNameReceiveBalance$.next(null);
	}

	get feeFrm() {
		return this.feeForm.controls;
	}

	getChargeCodes() {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE);
		if (cache) {
			const dataFilter = cache.filter(ele => ele.flatAmt);
			this.chargeCodes$.next(dataFilter);
			console.log('this.chargeCodes$', dataFilter);

			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const commisstions = res.body.enquiry.catalogs;
					const dataFilter = commisstions.filter(ele => ele.flatAmt);
					console.log('this.chargeCodes$', dataFilter);
					this.chargeCodes$.next(dataFilter);
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE, dataFilter);
				}
			});
	}
	listAcc$ = new BehaviorSubject<any>(null);
	getAccountByCustId() {
			this.reportService.getAccountByCustId(this.dataCacheRouter.customerId)
				.pipe(finalize(() => {
				}))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.seabGetAcccustSeateller) {
						const rawAcc: AccountInfoModel[] = res.body.enquiry.seabGetAcccustSeateller;
						this.listAcc$.next(this.getListAccount(rawAcc))
						console.log('this.listAcc', this.listAcc$.getValue());

						// this.checkName2(this.dataCacheRouter.accountCharges)
					}
				});
	}

	getListAccount(rawData: AccountInfoModel[]) {
		return rawData.reduce((acc, next) => {
			if (!next.errorCode) {
				return acc.concat({
					acct: next.acct,
					acctName: next.acctName,
					currency: next.currency,
					coCode: next.coCode
				});
			}
			return acc;
		}, []);
	}

	fillDataTax(event: any) {
		let isNotCalFee: boolean = false;
		if(event) {
			this.feeForm.patchValue({
				amount: null,
				tax: null,
				totalAmount: null
			})
		const dataFeeCode = this.chargeCodes$.getValue();
		let feeCode = dataFeeCode.find(fee => fee.id == event);
		console.log(feeCode);
		if(!feeCode.taxCode || feeCode.taxCode == 99) {
			isNotCalFee = true
		} else {
			isNotCalFee = false;
		}
		let amount = Number(feeCode.flatAmt);
		let tax = isNotCalFee ? 0 : amount * 0.1;
		let totalAmt = amount + tax
		this.feeForm.controls.amount.setValue(amount)
		this.feeForm.controls.tax.setValue(tax)
		this.feeForm.controls.totalAmount.setValue(totalAmt)
		}

	}
	accountName: any;
	// checkName(event) {
	// 	console.log(event);
	// 	let accountData = this.listAcc.find(acc => acc.acct == event);
	// 	this.accountName = accountData.acctName
	// }

	// checkName2(event) {
	// 	console.log(event);
	// 	let accountData = this.listAcc$.getValue().find(acc => acc.acct == event);
	// 	this.accountName = accountData.acctName

	// 	console.warn('this.accountName', this.accountName);
	// }
	isFree$ = new BehaviorSubject<boolean>(false);
	changeFeeType(event) {
		this.feeForm.controls.account.setValue(null)
		this.accountNameReceiveBalance$.next(null)
		console.log(event);
		if(event.value == 'MIEN_PHI') {
			this.isFree$.next(true)
			this.removeValidators(this.feeForm);
			this.feeForm.patchValue({
				account: null,
				transDate: null,
				feeCode: null,
				description: null,
				amount: null,
				tax: null,
				totalAmount: null,
			})
		}  else {
			this.isFree$.next(false);
			this.addValidators(this.feeForm);
		}

		if(event.value == "TIEN_MAT") {

		}
		
	}
	
	removeValidators(form: FormGroup) {
		const arr = ['account', 'transDate', 'feeCode', 'amount', 'tax', 'totalAmount', 'description'];
		for (const key in form.controls) {
			arr.forEach(r => {
				if(key == r) {
					form.get(key).clearValidators();
			form.get(key).updateValueAndValidity();
				}
			}
			)}
	}
	addValidators(form: FormGroup) {
		const arr = ['account', 'transDate', 'feeCode', 'amount', 'totalAmount', 'description'];
		for (const key in form.controls) {
			arr.forEach(r => {
				if(key == r) {
					form.get(key).setValidators([Validators.required]);
					form.get(key).updateValueAndValidity();
				}
			}
			)}
	}


	setAmt(event) {
		let tax = event*0.1;
		let total = Number(tax) + Number(event)
		this.feeFrm.tax.setValue(tax);
		this.feeFrm.totalAmount.setValue(total);


	}

	get isReadonly(): Observable<boolean> {
		if (this.authorisable) {
			return of(true);
		}
		if(this.APPROVED.getValue()) {
			return of(true)
		}
		return of(false);
	}

	trimReason() {
		const reason = this.feeForm.controls.reason.value;
		if (reason) {
			this.feeForm.controls.reason.setValue(this.feeForm.controls.reason.value.trim())
		}
	}

	autoGrowTextarea() {
		let elmtextFieldnt = document.getElementById('textarea');
		let text = this.feeForm.controls.reason.value;
		let lines = text.split(/\r|\r\n|\n/).length;

		if (lines <= 1) {
			elmtextFieldnt.style.height = 42 + 'px';
		} else if (lines > 1) {
			elmtextFieldnt.style.height =
				42 + (lines - 1) * 20 + 'px';
		}

	}

	
	accountNameReceiveBalance$ = new BehaviorSubject<string>(null);
	isLoadingCheckAcc$ = new BehaviorSubject<boolean>(false);
	beneficiaryAccountAfterClosedAccount: any;
	checkValidFeeAcc(accountNumber: string): void {
		this.beneficiaryAccountAfterClosedAccount = null;
		// this.feeFrm.accNumberGetBal.setErrors(null);
		this.accountNameReceiveBalance$.next(null);
		if (accountNumber) {
		console.warn('>>>> event', accountNumber);
			this.isLoadingCheckAcc$.next(true);
			this.utilityService.checkAccExist(accountNumber)
				.pipe(finalize(() => this.isLoadingCheckAcc$.next(false)))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
						this.beneficiaryAccountAfterClosedAccount = res.body.enquiry;
						if (res.body.enquiry.category == '10001') {
							const accName = res.body.enquiry.accountTitle ? res.body.enquiry.accountTitle : res.body.enquiry.shortTitle;
							this.accountNameReceiveBalance$.next(accName);
						} else {
							this.accountNameReceiveBalance$.next('Tài khoản quỹ không hợp lệ');
							
						}

					} else {
						this.accountNameReceiveBalance$.next('Tài khoản quỹ không hợp lệ');
					}

					console.log('accountNameReceiveBalance$|async', this.accountNameReceiveBalance$.getValue());
				});
		}
	}
}
