import { finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataPowerService } from '../../../../../../shared/services/dataPower.service';
import { CustomerRequestDTO } from '../../../../../../shared/model/constants/customer-requestDTO';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from '../../../../../common-service/common.service';
import {
	CODE_OK,
	HEADER_API_ACCOUNT,
	SERVER_API_CUST_INFO, STATUS_OK,
	UTILITY
} from '../../../../../../shared/util/constant';
import { Router } from '@angular/router';
import { BrokerTypeModel } from '../../../../../../shared/model/broker-type.model';
import { UtilityService } from '../../../../../../shared/services/utility.service';
import { SaleModel } from '../../../../../../shared/model/sale.model';
import { AppConfigService } from '../../../../../../app-config.service';
import { LocalStorageService } from 'ngx-webstorage';
import { SmsService } from '../../transaction-operations/sms/sms.services';

@Component({
	selector: 'kt-general-info',
	templateUrl: './general-info.component.html',
	styleUrls: ['./general-info.component.scss']
})
export class GeneralInfoComponent implements OnInit, OnChanges, OnDestroy {

	@Input() parentForm: FormGroup;
	// @Input() generalInfoFrmDash: any;
	@Input() dataFromDash: any;
	@Input() inputtable: boolean;
	@Input() authoraiserble: boolean;
	@Input() general_info: any;
	@Input() isCheckOldInfo: string = ""; // Lưu thông tin cũ
	@Input('viewData') viewData: any;

	infoForm: FormGroup = this.fb.group({
		campaignId: [null],
		saleType: [null, Validators.required],
		saleId: [null, Validators.required],
		brokerType: [null, Validators.required],
		brokerId: [null, Validators.required],
		description: [null]
	});
	saleList: SaleModel[] = [];
	brokerTypeList: BrokerTypeModel[] = [];
	// campaignList = CAMPAIGN;
	campaignList: any[] = [];
	dataInfo: any;

	currentUrl: string;

	isRemoveRequired: boolean;

	isSMS: boolean;
	isLoadingCheckCusExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	nameBroker$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	nameSale$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	constructor(private fb: FormBuilder, public commonService: CommonService,
		private router: Router, private cdr: ChangeDetectorRef,
		private utilityService: UtilityService,
		private dataPowerService: DataPowerService,
		private appConfigService: AppConfigService,
		private smsService: SmsService,
		private localStorageService: LocalStorageService) {
		this.currentUrl = this.router.url;
	}

	get frm() {
		if (this.infoForm && this.infoForm.controls) {
			return this.infoForm.controls;
		}
	}

	compareValueHasChange(formCotrolName: string, formControlValue: string, typeInput?: any,
		idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string | boolean {
		if (this.isCheckOldInfo === 'SMS_OLD_INFO') {
			return this.smsService.compareValueHasChange(formCotrolName, formControlValue, typeInput,
				idxFormControl, dateFormat, dropdownList, code, value, prop);
		} else {
			return
		}
	}


	ngOnInit() {

		this.getPortfolios();
		this.getBrokerTypes();
		this.getSales();

		if (this.viewData) {
			this.dataInfo = this.viewData;
		} else {
			this.dataInfo = window.history.state.data;
		}

		switch (this.router.url) {
			case '/pages/sms':
				this.isSMS = true;
				this.isRemoveRequired = true;
				this.infoForm.get('saleType').clearValidators();
				this.infoForm.get('saleId').clearValidators();
				this.infoForm.get('brokerType').clearValidators();
				this.infoForm.get('brokerId').clearValidators();
				this.infoForm.updateValueAndValidity();
				break;

		}
		// Tạo sms -> bấm tìm kiếm
		this.commonService.generalInfo$.subscribe(general_info => {
			if (general_info != null && !this.commonService.isUpdateSMS$.getValue()) {
				console.log('tạo sms');
				this.infoForm.patchValue({
					campaignId: general_info.campaignId ? general_info.campaignId : '',
					saleType: general_info.saleType ? general_info.saleType : '',
					saleId: general_info.saleId ? general_info.saleId : '',
					brokerType: general_info.brokerType ? general_info.brokerType : '',
					brokerId: general_info.brokerId ? general_info.brokerId : '',
					description: general_info.description ? general_info.description : '',
				});
			}

		});
		// Cập nhật sms
		if (this.dataInfo && this.commonService.isUpdateSMS$.getValue()) {
			this.infoForm.patchValue({
				campaignId: this.dataInfo.campaignId ? this.dataInfo.campaignId : '',
				saleType: this.dataInfo.saleType ? this.dataInfo.saleType : '',
				saleId: this.dataInfo.saleId ? this.dataInfo.saleId : '',
				brokerType: this.dataInfo.brokerType ? this.dataInfo.brokerType : '',
				brokerId: this.dataInfo.brokerId ? this.dataInfo.brokerId : '',
				description: this.dataInfo.description ? this.dataInfo.description : '',
			});
		}
		// cập nhật Cus
		if (this.dataInfo && this.commonService.isUpdateCus$.getValue()) {
			this.infoForm.patchValue({
				campaignId: this.dataInfo.campaignId ? this.dataInfo.campaignId : '',
				saleType: this.dataInfo.saleType ? this.dataInfo.saleType : '',
				saleId: this.dataInfo.saleId ? this.dataInfo.saleId : '',
				brokerType: this.dataInfo.brokerType ? this.dataInfo.brokerType : '',
				brokerId: this.dataInfo.brokerId ? this.dataInfo.brokerId : '',
				description: this.dataInfo.description ? this.dataInfo.description : '',
			});
		} else {
			if (this.dataFromDash && this.dataFromDash.combo) {
				this.infoForm.patchValue({
					campaignId: this.dataFromDash.combo.campaignId ? this.dataFromDash.combo.campaignId : '',
					saleType: this.dataFromDash.combo.saleType ? this.dataFromDash.combo.saleType : '',
					saleId: this.dataFromDash.combo.saleId ? this.dataFromDash.combo.saleId : '',
					brokerType: this.dataFromDash.combo.brokerType ? this.dataFromDash.combo.brokerType : '',
					brokerId: this.dataFromDash.combo.brokerId ? this.dataFromDash.combo.brokerId : '',
					description: this.dataFromDash.combo.description ? this.dataFromDash.combo.description : ''
				});
			} else if (this.dataFromDash && !this.dataFromDash.combo) {
				this.infoForm.patchValue({
					campaignId: this.dataFromDash.campaignId,
					saleType: this.dataFromDash.saleType,
					saleId: this.dataFromDash.saleId,
					brokerType: this.dataFromDash.brokerType,
					brokerId: this.dataFromDash.brokerId,
					description: this.dataFromDash.description,
				});
			}

		}
		this.parentForm.addControl('infoForm', this.infoForm);
	}

	ngOnDestroy() {
		this.infoForm.reset();
	}

	getPortfolios(): void {
		const cache = this.localStorageService.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.CAMPAIGN);
		if (cache) {
			this.campaignList = cache;
			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.CAMPAIGN)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_OK) {
					this.campaignList = res.body.enquiry.catalogs;
					this.localStorageService.store(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.CAMPAIGN, this.campaignList);
				}
			});
	}

	getBrokerTypes() {
		const cache = this.localStorageService.retrieve(UTILITY.BROKER.BROKER_CACHE);
		if (cache) {
			this.brokerTypeList = cache;
			return;
		}
		this.utilityService.getBrokerTypesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_OK) {
					this.brokerTypeList = res.body.enquiry.brokers;
					this.localStorageService.store(UTILITY.BROKER.BROKER_CACHE, this.brokerTypeList);
				}
			});
	}

	getSales() {
		const cache = this.localStorageService.retrieve(UTILITY.SALE.SALE_CACHE);
		if (cache) {
			this.saleList = cache;
			return;
		}
		this.utilityService.getSalesNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_OK) {
					this.saleList = res.body.enquiry.sales;
					this.localStorageService.store(UTILITY.SALE.SALE_CACHE, this.saleList);
				}
			});
	}

	get form() {
		if (this.infoForm && this.infoForm.controls) {
			return this.infoForm.controls;
		}
	}

	get isClicked(): boolean {
		if (this.commonService.isClickedButton$) {
			return this.commonService.isClickedButton$.getValue();
		}
	}

	checkCustomerExists(type?) {
		if (type == 'broker') {
			this.nameBroker$.next(null);
		} else {
			this.nameSale$.next(null);
		}

		if (this.infoForm.controls.brokerId.value && type == 'broker') {
			this.getCustomerInfo(this.infoForm.controls.brokerId.value, type);
		} else if (this.infoForm.controls.saleId.value && type == 'sale') {
			this.getCustomerInfo(this.infoForm.controls.saleId.value, type);
		}
	}

	getCustomerInfo(customerId, type?) {
		this.commonService.checkCusExists$.next(true);
		this.isLoadingCheckCusExists$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCheckCusExists$.next(true)))
			.pipe(finalize(() => this.commonService.checkCusExists$.next(false)))
			.subscribe(res => {
				if (res) {
					if (type == 'broker') {
						this.nameBroker$.next(res.enquiry.shortName);
					} else if (type == 'sale') {
						this.nameSale$.next(res.enquiry.shortName);
					}
				} else {
					if (type == 'broker') {
						this.infoForm.controls.brokerId.setValue(null);
						this.nameBroker$.next('Mã KH không tồn tại');
						// if (this.infoForm.controls.brokerId.hasError('notExist')) {
						// 	this.infoForm.controls.brokerId.setErrors(null);
						// }
						// this.infoForm.controls.brokerId.setErrors({notExist: true});
						// this.infoForm.controls.brokerId.markAsTouched();
					} else if (type == 'sale') {
						this.infoForm.controls.saleId.setValue(null);
						// if (this.infoForm.controls.saleId.hasError('notExist')) {
						// 	this.infoForm.controls.saleId.setErrors(null);
						// }
						// this.infoForm.controls.saleId.setErrors({notExist: true});
						// this.infoForm.controls.saleId.markAsTouched();
						this.nameSale$.next('Mã KH không tồn tại');
					}
					return;
				}
			});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataFromDash && !changes.dataFromDash.isFirstChange()) {
			if (changes.hasOwnProperty('dataFromDash')) {
				this.ngOnInit();
			}
		}
	}

	get isReadonly(): Observable<boolean> {
		if (this.authoraiserble) {
			return of(true);
		}
		if (this.dataInfo && this.dataInfo.combo) {
			return of(this.dataInfo.combo.status == 'APPROVED_SUCCESS');
		}
		return of(false);
	}
}
