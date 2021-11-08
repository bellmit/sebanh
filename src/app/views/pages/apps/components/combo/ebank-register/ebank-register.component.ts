import {AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, of, pipe} from 'rxjs';
import {EBankModel} from '../../commons/models/EBankModel';
import {CommonService} from '../../../../../common-service/common.service';
import {AccountRequestDTO} from '../../../../../../shared/model/constants/account-requestDTO';
import {finalize, take, takeLast} from 'rxjs/operators';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {CODE_00, GET_ENQUIRY, LIMIT, PROMOTION, SERVICE, STATUS_OK, UTILITY} from '../../../../../../shared/util/constant';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {MadichvuModel} from '../../../../../../shared/model/madichvu.model';
import {LocalStorageService} from 'ngx-webstorage';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {ServicePackageModel} from '../../../../../../shared/model/service-package.model';
import {PromotionModel} from '../../../../../../shared/model/promotion.model';
import {TransLimitModel} from '../../../../../../shared/model/trans-limit.model';

@Component({
	selector: 'kt-ebank-register',
	templateUrl: './ebank-register.component.html',
	styleUrls: ['./ebank-register.component.scss']
})
export class EbankRegisterComponent implements OnInit, AfterViewInit, OnChanges {

	@Input() parentForm: FormGroup;
	@Input() ebank: BehaviorSubject<EBankModel> = new BehaviorSubject<EBankModel>(null);
	@Input() isExCombo: boolean = false;
	@Input() ebankDataFrmDash: any;
	@Input() inputtable: boolean;
	@Input() authoriserble: boolean;
	@Input() accountInfo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	@Input() isLoadingAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	ebankRegisterForm: FormGroup;
	isShowEbank: boolean = true;
	isExistedEBank: boolean = false;
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	dataEbankError$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	promotionList$ = new BehaviorSubject<PromotionModel[]>([]);
	limitList$ = new BehaviorSubject<TransLimitModel[]>([]);
	madichvus$ = new BehaviorSubject<MadichvuModel[]>([]);
	servicePackages$ = new BehaviorSubject<ServicePackageModel[]>([]);
	accountEbank$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	dataEbank: any[] = [];

	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private dataPowerService: DataPowerService,
				private localStorage: LocalStorageService,
				private utilityService: UtilityService) {
	}

	ngOnInit() {
		this.ebankRegisterForm = this.fb.group({
			seaNetId: [''],
			serviceId: ['IB.SEABANK', [Validators.required]],
			packageService: ['SUPPER', [Validators.required]],
			passwordType: ['SMS', [Validators.required]],
			promotionId: [''],
			limit: ['VND500M', [Validators.required]],
			transSeANetPro: [''],
			account: ['newTKTT', [Validators.required]],
			transID: [''],
			priority: [''],
			ebankCheckbox: [false]
		});
		this.getMadichVu();
		this.getServicePackage();
		this.getPromotions();
		this.getTranLimit();

		if (this.ebankDataFrmDash) {
			console.log('ebankDataFrmDash', this.ebankDataFrmDash);
			if (this.ebankDataFrmDash.ebank == null) {
				this.ebankRegisterForm.controls.ebankCheckbox.setValue(false);
				this.removeValidators(this.ebankRegisterForm);
			} else {
				this.ebankRegisterForm.controls.ebankCheckbox.setValue(true);
				this.isShowEbank = true;
			}
		} else {
			this.ebankRegisterForm.controls.ebankCheckbox.setValue(false);
			this.isShowEbank = false;
			if (this.ebankRegisterForm.controls.ebankCheckbox.value == false) {
				this.removeValidators(this.ebankRegisterForm);
			}
		}

		if (this.ebankDataFrmDash && this.ebankDataFrmDash.ebank) {
			this.isShowEbank = true;
			this.ebankRegisterForm.controls.ebankCheckbox.setValue(true);
			this.ebankRegisterForm.patchValue({
				seaNetId: this.ebankDataFrmDash.ebank.username ? this.ebankDataFrmDash.ebank.username : '',
				serviceId: this.ebankDataFrmDash.ebank.serviceId ? this.ebankDataFrmDash.ebank.serviceId : '',
				packageService: this.ebankDataFrmDash.ebank.packageService ? this.ebankDataFrmDash.ebank.packageService : '',
				passwordType: this.ebankDataFrmDash.ebank.passwordType ? this.ebankDataFrmDash.ebank.passwordType : '',
				promotionId: this.ebankDataFrmDash.ebank.promotionId ? this.ebankDataFrmDash.ebank.promotionId : '',
				limit: this.ebankDataFrmDash.ebank.limit ? this.ebankDataFrmDash.ebank.limit : '',
				transSeANetPro: this.ebankDataFrmDash.ebank.transSeANetPro ? this.ebankDataFrmDash.ebank.transSeANetPro : '',
				account: this.ebankDataFrmDash.ebank.mainCurrAcc ? this.ebankDataFrmDash.ebank.mainCurrAcc : 'newTKTT',
			});
		}
		this.parentForm.addControl('ebankForm', this.ebankRegisterForm);
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

	getMadichVu() {
		const cache = this.localStorage.retrieve(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE);
		if (cache) {
			this.madichvus$.next(cache);
			return;
		}
		this.utilityService.getMadichvusNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const madichvus = res.body.enquiry.madichvus;
					this.madichvus$.next(madichvus);
					this.localStorage.store(UTILITY.MA_DICH_VU.MA_DICH_VU_CACHE, madichvus);
				}
			});
	}
	listEbank: any [] = [];
	ngAfterViewInit() {
		// Nếu tích chọn mở TKTT
		this.accountInfo.subscribe(account => {
			this.dataEbank = account;
			if(account && account.length > 0) {
				this.listEbank = [...account]
			}

			// if(this.listEbank.length == 0) {
			// 	this.listEbank.push({accountID: 'newTKTT'})
			// }

			console.log('this.dâtEbank', this.listEbank)
		});

		this.commonService.isCheckedTKTT$
			.subscribe(accountCheck => {
				if (accountCheck == true) {
					if (this.commonService.isComboComponent$.getValue() || (this.commonService.isExCombo$.getValue() && (!this.dataEbank || this.dataEbank.length == 0))) {
						this.ebankRegisterForm.controls.ebankCheckbox.setValue(true);
						this.isShowEbank = true;
					}
				}
			});
	}

	get frm() {
		if (this.ebankRegisterForm) {
			return this.ebankRegisterForm.controls;
		}
	}

	get isClicked(): boolean {
		if (this.commonService.isClickedButton$) {
			return this.commonService.isClickedButton$.getValue();
		}
	}

	removeValidators(form: FormGroup) {
		this.ebankRegisterForm.markAsUntouched();
		this.ebankRegisterForm.updateValueAndValidity();
		for (const key in form.controls) {
			form.get(key).clearValidators();
			form.get(key).updateValueAndValidity();
		}
	}

	addValidator(form: FormGroup) {
		const arr = ['serviceId', 'packageService', 'passwordType', 'account', 'limit'];
		// const arr = [];
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
		this.isShowEbank = !this.isShowEbank;
		if (this.ebankRegisterForm.controls.ebankCheckbox.value == false) {
			this.removeValidators(this.ebankRegisterForm);
		} else {
			this.isShowEbank = true;
			if(!this.commonService.isCheckedTKTT$.getValue()) {
				this.ebankRegisterForm.controls.account.setValue(null)
			}
			this.addValidator(this.ebankRegisterForm);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.ebankDataFrmDash && !changes.ebankDataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('ebankDataFrmDash')) {
				this.ngOnInit();
			}
		}
	}

	get isReadonlyLable(): Observable<boolean>{
		if(!this.commonService.isExCombo$.getValue()) {
			return of(true);
		}

		if(this.commonService.isExCombo$.getValue() && this.accountInfo.getValue().length == 0 ) {
			return of(true);
		}

		if((this.commonService.isExCombo$.getValue()) && (!(this.commonService.isShowEbank$.getValue()) && !this.dataEbank)) {
			return of(true);
		}
		return of(false)
	}

	get isReadonly(): Observable<boolean> {
		if (this.authoriserble) {
			return of(true);
		}
		if (this.isExCombo && this.isExistedEBank) {
			return of(true);
		}
		if (this.commonService.ebankStatus$.getValue()) {
			if (this.commonService.canReupdateEbank$.getValue()) {
				return of(false);
			} else {
				return of(true);
			}
		}
		return of(false);
	}
}

export function detectStr(str: string) {
	if (str) {
		let strValue = str.slice(3, str.length - 1);
		if (str[str.length - 1] == 'M') {
			return strValue + '000000';
		}
	} else {
		return '';
	}

}


