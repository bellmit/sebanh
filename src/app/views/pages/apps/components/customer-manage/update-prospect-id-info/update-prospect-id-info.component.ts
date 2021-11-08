import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {CountryModel} from '../../../../../../shared/model/country.model';
import {CityModel} from '../../../../../../shared/model/city.model';
import {CustomerModel} from '../../commons/models/CustomerModel';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {
	ACTION_T24,
	CODE_00,
	GET_ENQUIRY,
	IDENTIFICATION,
	MARITAL_STATUS,
	STATUS_OK,
	TITLE,
	UTILITY
} from '../../../../../../shared/util/constant';
import {CommonService} from '../../../../../common-service/common.service';
import {LocalStorageService} from 'ngx-webstorage';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {finalize, takeUntil} from 'rxjs/operators';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import moment from 'moment';

@Component({
	selector: 'kt-update-prospect-id-info',
	templateUrl: './update-prospect-id-info.component.html',
	styleUrls: ['./update-prospect-id-info.component.scss']
})
export class UpdateProspectIdInfoComponent implements OnInit, OnDestroy {

	@Input() parentForm: FormGroup;
	@Input() isUpdateSignature: boolean;
	@Input() cusDataFrmDash: any;
	@Input() inputtable: boolean;
	@Input() authoriserble: boolean;
	@Input() customerId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	@Input() isShowUpdateProspectId: boolean;
	@Input() disableField$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	@Output() disabledForm: EventEmitter<any> = new EventEmitter<any>();

	prospectForm: FormGroup;
	isCheckedUpdate: boolean = false;
	countries: CountryModel [] = [];
	cityList: CityModel[] = [];
	districtList: CityModel[] = [];

	isMinusFaxSign$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isMinusTaxSign$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	customer: CustomerModel;
	bodyRequest: BodyRequestTransactionModel;
	isDisableForm: boolean = false;

	titleList = TITLE;
	maritalStatusList = MARITAL_STATUS;
	identificationList = IDENTIFICATION;

	isShowOtherInfo: boolean = false;
	isLoadingCities$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingDistrict$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	today = new Date();
	maxDate = new Date();
	minDate = new Date();
	dataCustomerError$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	destroy$ = new Subject<void>();

	KH_CO_DUOC_XEP_HANG_TIN_NHIEM_KHONG = ['YES', 'NO'];
	LOAI_XEP_HANG = ['THOA THUAN', 'TU NGUYEN'];
	THOI_HAN_XEP_HANG = ['DAI HAN', 'NGAN HAN', 'KHONG XAC DINH'];
	TO_CHUC_XHTN = ['Fitch Rating', 'Khac', 'Moody\'s', 'Standard & Poor\'s'];

	constructor(
		private fb: FormBuilder,
		public commonService: CommonService,
		private localStorage: LocalStorageService,
		private dataPowerService: DataPowerService,
		private utilityService: UtilityService
	) {
		const numberDayInYear = 365;

		const minAge = 15;
		const totalDayOfLeapYearMin = 4; // Trong 15 năm có 4 năm có 366 ngày
		let getMinAge = (minAge * numberDayInYear) + totalDayOfLeapYearMin;

		const maxAge = 100;
		const totalDayOfLeapYearMax = 25; // Trong 100 năm có 25 năm có 366 ngày
		let getMaxAge = (maxAge * numberDayInYear) + totalDayOfLeapYearMax;

		this.today.setDate(this.today.getDate());
		this.maxDate.setDate(this.today.getDate() - getMinAge);
		this.minDate.setDate(this.today.getDate() - getMaxAge);

		this.prospectForm = this.fb.group({
			customerId: [null],
			customerName: [null],
			sex: [null],
			birthday: [null],
			maritalStatus: [null],
			national: [null],
			street: [null],
			district: [null],
			province: [null],
			title: [null],
			country: [null],
			customerAddress: [null],
			inputter: [null],
			authoriser: [null],
			coCode: [null],
			rateAgency: [null],
			otherRateAgency: [null],
			creditClass: [null],
			//    loại xếp hạng
			ratingType: [null],
			//    THời hạn xếp hạng
			rateTerm: [null],
			//    Ngày xếp hạng
			ratingDate: [null],
			//    KH có đc xếp hạng tín nhiệm không
			creditRate: [null],
		});

		this.prospectForm.addControl('identification', this.fb.array([]));
		this.prospectForm.addControl('contactInfosForm', this.fb.array([]));
	}

	ngOnInit() {
		this.getListCountry();
		this.getCities();


		this.commonService.prospectCustomerData$
			.pipe(takeUntil(this.destroy$))
			.subscribe(element => {
				this.identificationPaperForm.clear();
				this.contactForm.clear();

				if (element) {
					this.patchValueFromCoreApiToProspectForm(element);
					this.disableProspectForm();
				} else if (!this.cusDataFrmDash) {
					this.addMoreIdentificationPaperForm();
					this.addMoreContactForm();
				}
			});


		if (this.cusDataFrmDash && this.cusDataFrmDash.actionT24 && ACTION_T24.UPDATE_PROSPECT_ID == this.cusDataFrmDash.actionT24) {
			this.patchValueFromSeATellerApiToProspectForm(this.cusDataFrmDash);
		}
		this.commonService.isUpdateProspectId$
			.pipe(takeUntil(this.destroy$))
			.subscribe(i => {

				if (i && this.frm && this.parentForm) {
					this.parentForm.addControl('prospectForm', this.prospectForm);
					this.addValidator(this.prospectForm);
					this.enableProspectForm();
				} else {
					this.removeValidators(this.prospectForm);
					this.parentForm.removeControl('prospectForm');
					this.disableProspectForm();
				}
			});

	}

	disableProspectForm() {


		if (this.contactForm && this.contactForm.controls.length > 0) {
			this.contactForm.controls.forEach(i => i.disable());
		}

		if (this.identificationPaperForm && this.identificationPaperForm.controls.length > 0) {
			this.identificationPaperForm.controls.forEach(i => i.disable());
		}

		this.prospectForm.disable();
	}

	enableProspectForm() {
		this.prospectForm.enable();

		if (this.contactForm && this.contactForm.controls.length > 0) {
			this.contactForm.controls.forEach(i => i.enable());
		}

		if (this.identificationPaperForm && this.identificationPaperForm.controls.length > 0) {
			this.identificationPaperForm.controls.forEach(i => i.enable());
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
		this.isMinusFaxSign$.next(false);
		this.isMinusTaxSign$.next(false);
		this.commonService.customerDataObject$.next(null);
		this.commonService.isUpdateCombo$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		this.commonService.dataQA$.next(null);
		this.commonService.isDisabledCustomerForm$.next(null);
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
						if (!this.cusDataFrmDash) {
							this.frm.country.setValue('VN');
						}

					}
				});
		}
	}

	getListCountry() {
		const cache = this.localStorage.retrieve(UTILITY.COUNTRY.COUNTRY_CACHE);
		if (cache) {
			this.countries = cache;
			return;
		}
		this.utilityService.getCountrysNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.countries = res.body.enquiry.countrys;
					this.localStorage.store(UTILITY.COUNTRY.COUNTRY_CACHE, this.countries);
				}
			});
	}

	getListDistrict(province ?: any) {
		let command = GET_ENQUIRY;
		let enquiry: {};
		enquiry = {
			authenType: 'getDISTRICTS',
			cityID: province ? province : this.frm.province.value
		};
		this.isLoadingDistrict$.next(true);
		this.districtList = [];
		this.frm.district.setValue(null);
		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.commonService.actionGetEnquiryUtility(bodyRequest).pipe(finalize(
			() => this.isLoadingDistrict$.next(false)))
			.subscribe(r => {
				if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
					this.districtList = r.enquiry.district;
				} else {
				}
			});
	}

	initNewIdentificationPaperForm(iden?: any): FormGroup {
		return this.fb.group({
			gttt: [(iden && iden.gttt) ? iden.gttt : null],
			idenType: [(iden && iden.idenType) ? iden.idenType : null],
			organization: [(iden && iden.organization) ? iden.organization : null],
			idenTime: [(iden && iden.idenTime) ? moment(iden.idenTime, 'dd-MM-yyyy').toDate() : null],
			idenAdress: [(iden && iden.idenAdress) ? iden.idenAdress : null],
			idenAddress: [iden && iden.idenAddress ? iden.idenAddress : null],
			idenTimeExpired: [(iden && iden.idenTimeExpired) ? moment(iden.idenTimeExpired, 'dd-MM-yyyy').toDate() : null],
			idenTimeValue: [(iden && iden.idenTimeValue) ? moment(iden.idenTimeValue, 'dd-MM-yyyy').toDate() : null],
		});
	}

	initNewContactForm(contact?: any): FormGroup {
		return this.fb.group({
			mobile: [contact ? contact.mobile : null],
			email: [contact ? contact.email : null],
		});
	}

	addMoreContactForm() {
		this.contactForm.push(this.initNewContactForm());
		this.addValidatorContactForm();
	}

	removeContactForm(formIndex: number) {
		this.contactForm.removeAt(formIndex);
	}

	get contactForm(): FormArray {
		return this.prospectForm && this.prospectForm.get('contactInfosForm') as FormArray;
	}

	get identificationPaperForm(): FormArray {
		return this.prospectForm && this.prospectForm.get('identification') as FormArray;
	}

	addMoreIdentificationPaperForm() {
		this.identificationPaperForm.push(this.initNewIdentificationPaperForm());
		this.addValidatorIdentityPaperForm();
	}

	removeIdentificationPaperForm(formIndex: number) {
		this.identificationPaperForm.removeAt(formIndex);
	}

	patchValueFromSeATellerApiToProspectForm(data?: any) {

		if (data && data.province) {
			this.getListDistrict(data.province);
		}

		this.prospectForm.patchValue({

			customerId: data ? data.customerId : null,

			customerName: data ? data.customerName : null,

			title: data ? data.title : null,

			sex: data ? data.sex : null,

			birthday: (data && data.birthday) ? moment(data.birthday, 'dd-MM-yyyy').toDate() : null,

			placeOfBirth: data ? data.placeOfBirth : null,

			maritalStatus: data ? data.maritalStatus : null,

			national: (data && data.national) ? data.national : null,

			mobile: data ? data.mobile : null,

			email: data ? data.email : null,

			street: data ? data.stress : null,

			district: data ? data.district : null,

			province: data ? data.province : null,

			country: data ? data.country : null,

			customerAddress: data ? data.customerAddress : null,

			inputter: data ? data.inputter : null,

			authoriser: data ? data.authoriser : null,

			coCode: data ? data.coCode : null,

			rateAgency: data ? data.rateAgency : null,

			otherRateAgency: data ? data.otherRateAgency : null,

			creditClass: data ? data.creditClass : null,

			ratingType: data ? data.ratingType : null,

			rateTerm: data ? data.rateTerm : null,

			ratingDate: (data && data.ratingDate) ? moment(data.ratingDate, 'dd-MM-yyyy').toDate() : null,

			creditRate: data ? data.creditRate : null,

		});

		this.identificationPaperForm.clear();
		this.contactForm.clear();

		let identityPapersResFromSeATellerApi = data.identityPapers;
		let isIdentityPaperListEmpty = identityPapersResFromSeATellerApi && identityPapersResFromSeATellerApi.length < 0;

		if (!isIdentityPaperListEmpty) {
			identityPapersResFromSeATellerApi.forEach(element => {
				this.identificationPaperForm.push(this.initNewIdentificationPaperForm(element));
			});
		}

		let prospectContactsResFromSeATellerApi = data.customerCommunications;
		let isContactProspectEmpty = prospectContactsResFromSeATellerApi && prospectContactsResFromSeATellerApi.length < 0;

		if (!isContactProspectEmpty) {
			prospectContactsResFromSeATellerApi.forEach(element => {
				this.contactForm.push(this.initNewContactForm(element));
			});
		}

		this.addValidator(this.prospectForm);
	}

	patchValueFromCoreApiToProspectForm(data: any) {
		this.prospectForm.patchValue({

			customerId: data ? data.customerId : null,

			customerName: data ? data.shortName : null,

			title: data ? data.title : null,

			sex: data ? data.gender : null,

			birthday: data ? data.dateOfBirth : null,

			placeOfBirth: data ? data.placeOfBirth : null,

			maritalStatus: data ? data.maritalStatus : null,

			national: data ? data.nationality : null,

			mobile: data ? data.sms1 : null,

			email: data ? data.email1 : null,

			stress: null,

			district: data ? data.seabDistrict1 : null,

			province: data ? data.province : null,

			country: data ? data.country : null,

			customerAddress: data ? data.address : null,
		});

		this.patchValueContactProspectFromCoreApiContactForm(data);
		this.patchValueToIdentityPaperFromCoreApi(data);
	}

	patchValueContactProspectFromCoreApiContactForm(data: any) {
		this.contactForm.clear();
		let element = {
			email: data ? data.email : null,
			mobile: data ? data.sms1 : null
		};

		this.contactForm.push(this.initNewContactForm(element));
	}

	patchValueToIdentityPaperFromCoreApi(data: any) {
		this.identificationPaperForm.clear();

		let element = {
			idenAdress: data ? data.idenAdress : null,
			idenAddress: data ? data.idenAddress : null,
			gttt: data ? data.legalId : null,
			idenTimeExpired: data.legalExpDate ? moment(data.legalExpDate).format('DD-MM-YYYY') : null,
			idenTime: data.legalIssDate ? moment(data.legalIssDate).format('DD-MM-YYYY') : null,
			idenType: data ? data.legalDocName : null,
			organization: data ? data.legalIssAuth : null,
			idenTimeValue: (data && data.idenTimeValue) ? moment(data.idenTimeValue).format('DD-MM-YYYY') : null
		};

		this.identificationPaperForm.push(this.initNewIdentificationPaperForm(element));
	}

	get frm() {
		return this.prospectForm.controls;
	}

	get isClicked(): boolean {
		if (this.commonService.isClickedButton$) {
			return this.commonService.isClickedButton$.getValue();
		}
	}

	removeValidators(form: FormGroup) {
		for (const key in form.controls) {
			if (key == 'identification') {
				this.removeValidatorIdentityForm();
			}

			if (key == 'contactInfosForm') {
				this.removeValidatorContactForm();
			}

			form.get(key).clearValidators();
			form.get(key).markAsUntouched();
			form.get(key).updateValueAndValidity();
		}
	}

	removeValidatorIdentityForm() {
		for (let i = 0; i < this.identificationPaperForm.controls.length; i++) {
			for (const fieldName in this.identificationPaperForm.controls[i]['controls']) {
				this.identificationPaperForm.controls[i]['controls'][fieldName].clearValidators();
				this.identificationPaperForm.controls[i]['controls'][fieldName].markAsUntouched();
				this.identificationPaperForm.controls[i]['controls'][fieldName].updateValueAndValidity();
			}
		}
	}

	removeValidatorContactForm() {
		for (let i = 0; i < this.contactForm.controls.length; i++) {
			for (const fieldName in this.contactForm.controls[i]['controls']) {
				this.contactForm.controls[i]['controls'][fieldName].clearValidators();
				this.contactForm.controls[i]['controls'][fieldName].markAsUntouched();
				this.contactForm.controls[i]['controls'][fieldName].updateValueAndValidity();
			}
		}
	}

	addValidatorContactForm() {
		const fieldsValidator = ['email', 'mobile'];
		for (let i = 0; (this.contactForm.controls && i < this.contactForm.controls.length); i++) {
			for (const fieldName in this.contactForm.controls[i]['controls']) {

				if (fieldsValidator.includes(fieldName)) {
					if (fieldName == 'mobile') {
						this.contactForm.controls[i]['controls'][fieldName].setValidators([Validators.required, Validators.pattern('(0[3|5|7|8|9])+([0-9]{8})')]);
					}

					if (fieldName == 'email') {
						this.contactForm.controls[i]['controls'][fieldName].setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$')]);
					}

					this.contactForm.controls[i]['controls'][fieldName].updateValueAndValidity();
				}
			}
		}
	}

	addValidatorIdentityPaperForm() {

		const fieldsValidator = ['gttt', 'idenType', 'organization', 'idenTime', 'idenAdress', 'idenAddress'];

		for (let i = 0; (this.identificationPaperForm.controls && i < this.identificationPaperForm.controls.length); i++) {
			for (const fieldName in this.identificationPaperForm.controls[i]['controls']) {
				if (fieldsValidator.includes(fieldName)) {
					this.identificationPaperForm.controls[i]['controls'][fieldName].setValidators([Validators.required]);
					this.identificationPaperForm.controls[i]['controls'][fieldName].updateValueAndValidity();
				}
			}
		}
	}

	addValidator(form: FormGroup) {

		const fieldsSetValidator = ['customerName', 'sex', 'birthday', 'maritalStatus',
			'national', 'street', 'district', 'province', 'title'];

		for (const fieldFormName in form.controls) {

			if (fieldFormName == 'contactInfosForm') {
				this.addValidatorContactForm();
			}

			if (fieldFormName == 'identification') {
				this.addValidatorIdentityPaperForm();
			}

			fieldsSetValidator.forEach(field => {
				if (fieldFormName == field) {
					form.get(fieldFormName).setValidators([Validators.required]);
					form.get(fieldFormName).updateValueAndValidity();
				}
			});
		}
	}

	checkedUpdateProspectId(event) {
		if (event.target.checked) {

			this.commonService.isUpdateProspectId$.next(true);
			this.commonService.isUpdateSignature$.next(false);
			this.commonService.isUpdateCus$.next(false);

		} else {
			this.commonService.isUpdateProspectId$.next(false);

		}


	}

	get isReadonly(): Observable<boolean> {
		if (this.authoriserble) {
			return of(true);
		}

		return of(false);
	}
}
