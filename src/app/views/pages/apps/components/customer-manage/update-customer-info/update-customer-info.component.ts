import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, forkJoin, Observable, of, Subject} from 'rxjs';
import {CountryModel} from '../../../../../../shared/model/country.model';
import {IndustryModel} from '../../../../../../shared/model/industry.model';
import {RelationModel} from '../../../../../../shared/model/relation.model';
import {MadichvuModel} from '../../../../../../shared/model/madichvu.model';
import {PortfolioModel} from '../../../../../../shared/model/portfolio.model';
import {CityModel} from '../../../../../../shared/model/city.model';
import {CustomerModel} from '../../commons/models/CustomerModel';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {
	CODE_00,
	GET_ENQUIRY,
	GET_TRANSACTION, HEADER_API_ACCOUNT,
	IDENTIFICATION, LOYALTY,
	MARITAL_STATUS, NATIONALITIES, NHOM_NGANH_ID_LOAI_BO,
	OWNER_BENEFIT, PRIORITY,
	PURPOSE_LIST, QUESTION,
	RESIDENT_STATUS_LIST, SERVER_API_CUST_INFO, STATUS_OK,
	TITLE, TYPE_DANH_MUC, USERNAME_CACHED, UTILITY
} from '../../../../../../shared/util/constant';
import {OccupationModel} from '../../../../../../shared/model/occupation.model';
import {CareerModel} from '../../../../../../shared/model/career.model';
import {CommonService} from '../../../../../common-service/common.service';
import {LocalStorageService} from 'ngx-webstorage';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {AppConfigService} from '../../../../../../app-config.service';
import {finalize, map, takeUntil} from 'rxjs/operators';
import {parseDateFrmStr, stringToDate} from '../../../../../../shared/util/date-format-ultils';
import {TransactionModel} from '../../../../../model/transaction.model';
import {AUTHEN_TYPE_CREATE_COMBO} from '../../../../../../shared/model/constants/common-constant';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import moment from 'moment';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {AccountRequestDTO} from '../../../../../../shared/model/constants/account-requestDTO';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {GENDER_LIST, INPUT_TYPE_ENUM} from '../customer-manage.constant';
import {CustomerManageService} from '../customer-manage.service';
import {formartDateYYYYMMDD, safeRemoveAllSpace, safeTrim} from '../../../../../../shared/util/Utils';

@Component({
	selector: 'kt-update-customer-info',
	templateUrl: './update-customer-info.component.html',
	styleUrls: ['./update-customer-info.component.scss']
})

/**
 clone lại component này tù customer-info.component -> dùng chung combo 02.07.2021
 */
export class UpdateCustomerInfoComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

	@ViewChild('inputStress', {static: true}) inputStress: ElementRef<HTMLInputElement>;

	@Output() disabledForm: EventEmitter<any> = new EventEmitter<any>();

	@Input() parentForm: FormGroup;

	@Input() dataQA: any;
	@Input() isUpdateSignature: boolean;
	@Input() cusDataFrmDash: any;
	@Input() inputtable: boolean;
	@Input() authoriserble: boolean;
	@Input() customerId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	@Input() disableField$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	@Input() showCheckboxCustomerManage: boolean;
	@ViewChild('cityLabel', {static: false}) cityLabel: ElementRef;
	@ViewChild('districtLabel', {static: false}) districtLabel: ElementRef;
	@ViewChild('countryLabel', {static: false}) countryLabel: ElementRef;
	@ViewChild('nationalLabel', {static: false}) nationalLabel: ElementRef;
	@ViewChild('residenceLabel', {static: false}) residenceLabel: ElementRef;
	@ViewChild('jobLabel', {static: false}) jobLabel: ElementRef;
	@ViewChild('idenTypeLabel', {static: false}) idenTypeLabel: ElementRef;

	isCheckedUpdate: boolean = false;
	countries: CountryModel [] = [];

	industryDatas: IndustryModel [] = [];
	industrys$ = new BehaviorSubject<IndustryModel[]>([]);
	industryClass$ = new BehaviorSubject<IndustryModel[]>([]);
	industrysGroup$ = new BehaviorSubject<IndustryModel[]>([]);
	relations$ = new BehaviorSubject<RelationModel[]>([]);
	madichvus: MadichvuModel [] = [];
	portfolios: PortfolioModel [] = [];
	cityList: CityModel[] = [];
	districtList: CityModel[] = [];
	districtList2: CityModel[] = [];
	ccyList: any[] = [];
	isInvalidSalary: boolean = false;

	username: any;

	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isMinusFaxSign$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isMinusTaxSign$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	customer: CustomerModel;
	bodyRequest: BodyRequestTransactionModel;
	isDisableForm: boolean = false;

	titleList = TITLE;
	maritalStatusList = MARITAL_STATUS;
	purposeList = PURPOSE_LIST;
	residentStatusList = RESIDENT_STATUS_LIST;
	ownerBenefitList = OWNER_BENEFIT;
	identificationList = IDENTIFICATION;
	priorityList = PRIORITY;
	loyaltyList = LOYALTY;
	nationalities = NATIONALITIES;
	questionList = QUESTION;
	occupationList$ = new BehaviorSubject<OccupationModel[]>([]);
	employmentList$ = new BehaviorSubject<CareerModel[]>([]);
	isSameCheckbox: boolean = false;

	customerForm = this.fb.group({
		customerId: [this.commonService.customerId$.getValue() || ''],
		customerName: [null, Validators.required],
		sex: [null, Validators.required],
		birthday: [null, Validators.required],
		placeOfBirth: [null, Validators.required],
		maritalStatus: [null, Validators.required],
		purpose: [null, Validators.required],
		national: [null, Validators.required],
		residentStstus: [null, Validators.required],
		residentNational: [null],
		idenTimeValue: [null],
		idenAddress: [null, Validators.required],
		piority: [null],
		occupation: [null, Validators.required],
		stress: [null, Validators.required],
		district: [null, Validators.required],
		province: [null, Validators.required],
		town: [null, Validators.required], //Phường xã

		country: [null],
		campaignId: [null],
		saleType: [null],
		saleId: [null],
		brokerType: [null],
		brokerId: [null],
		inputter: [null],
		authoriser: [null],
		coCode: [null],
		departCode: [null],

		priority: [null],
		title: [null, Validators.required],
		portfolio: [null, Validators.required],
		ownerBen: [null, Validators.required],
		ownCustomer: [null],
		employment: [null, Validators.required],
		employerName: [null, Validators.required],
		employerAddress: [null, Validators.required],
		industryGroup: [null, Validators.required],
		industry: [null, Validators.required],
		industryClass: [null, Validators.required],
		customerAddress: [null], // Địa chr khác
		noOfDependents: [null],
		customerCurrency: [null],
		salaryReq: [null],
		loyalty: [null],
		faxs: this.fb.array([this.newFax()]),
		taxs: this.fb.array([this.newTax()]),
		isSameIdenAddress: [false],
		oldAddressLength: null,
		oldCurrAddressLength: null,
		oldStressLength: null

	});
	ownerBenData: any;
	ownerBenAccount: any;
	isLoadingOwnerBen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isShowOtherInfo: boolean = true;
	isShowAML: boolean = false;
	isLoadingCities$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingDistrict$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCcyList$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCheckOwnerExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	ownerId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	today = new Date();
	maxDate = new Date();
	minDate = new Date();
	destroy$ = new Subject<void>();

	listName: any = [];
	listName$ = new BehaviorSubject<any[]>([]);
	isUpdateCustInfo$ = new BehaviorSubject<boolean>(false);
	idenTimeExpired$ = new BehaviorSubject<boolean>(false);
	isLoadingDistrict2$ = new BehaviorSubject<boolean>(false);
	dateInputType = INPUT_TYPE_ENUM.DATE;
	ngSelectType = INPUT_TYPE_ENUM.NG_SELECT;
	genderList = GENDER_LIST;
	maxLengthAddress$ = new BehaviorSubject<string>(null);
	stressTwoSpaces$ = new BehaviorSubject<string>(null);
	townTwoSpaces$ = new BehaviorSubject<string>(null);
	// rawFormValue: any;
	oldDistrictList: any[];
	oldOccupationList: any[];
	oldIndustrys: any[];
	oldIndustryClass: any[];
	oldOccu: string = null;
	// check question selected
	mapSelectedQuestion: Map<number, string> = new Map();
	dateFormatT24 = 'YYYYMMDD';
	invalidDate: boolean = false;
	constructor(
		private fb: FormBuilder,
		public commonService: CommonService,
		private localStorage: LocalStorageService,
		private dataPowerService: DataPowerService,
		private utilityService: UtilityService,
		private appConfigService: AppConfigService,
		private customerService: CustomerManageService
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
	}

	get identification(): FormArray {
		if (this.customerForm && this.customerForm.get('identification')) {
			return this.customerForm.get('identification') as FormArray;
		}
	}

	get contactInfo(): FormArray {
		if (this.customerForm && this.customerForm.get('contactInfos')) {
			return this.customerForm.get('contactInfos') as FormArray;
		}
		// return this.customerForm.get('contactInfos') as FormArray;
	}

	get faxs(): FormArray {
		if (this.customerForm && this.customerForm.get('faxs')) {
			return this.customerForm.get('faxs') as FormArray;
		}
		// return this.customerForm.get('faxs') as FormArray;
	}

	get taxs(): FormArray {
		if (this.customerForm && this.customerForm.get('taxs')) {
			return this.customerForm.get('taxs') as FormArray;
		}
		// return this.customerForm.get('taxs') as FormArray;
	}

	get relates(): FormArray {
		if (this.customerForm && this.customerForm.get('relates')) {
			return this.customerForm.get('relates') as FormArray;
		}
		// return this.customerForm.get('relates') as FormArray;
	}

	get questionAnswer(): FormArray {
		if (this.customerForm && this.customerForm.get('questionAnswer')) {
			return this.customerForm.get('questionAnswer') as FormArray;
		}
		// return this.customerForm.get('questionAnswer') as FormArray;
	}

	newIden(iden?: any): FormGroup {
		if (iden) {
			return this.fb.group({
				id: [iden.id],
				gttt: [iden.gttt, [Validators.required]],
				idenType: [iden.idenType, [Validators.required]],
				organization: [iden.organization, [Validators.required]],
				idenTime: [stringToDate(iden.idenTime, 'DD-MM-YYYY'), [Validators.required]],
				idenAdress: [iden.idenAdress, [Validators.required, Validators.maxLength(20)]],
				idenTimeExpired: [stringToDate(iden.idenTimeExpired, 'DD-MM-YYYY')],
				idCustomer: this.commonService.cusTransId$.getValue()
			});
		}
		return this.fb.group({
			id: [null],
			gttt: [null, [Validators.required]],
			idenType: [null, [Validators.required]],
			organization: [null, [Validators.required]],
			idenTime: [null, [Validators.required]],
			idenAdress: [null, [Validators.required, Validators.maxLength(20)]],
			idenTimeExpired: [null],
			idCustomer: this.commonService.cusTransId$.getValue()
		});
	}

	newContact(contact?: any): FormGroup {
		return this.fb.group({
			phone: [contact ? contact.phone : '', Validators.pattern('(0)+([0-9]{9,10})')],
			mobile: [contact ? contact.mobile : '', [Validators.required, Validators.pattern('(0)+([0-9]{9})')]],
			email: [contact ? contact.email : '', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}$')]],
			priority: [contact ? contact.priority : null, Validators.required],
			idCustomer: this.commonService.cusTransId$.getValue()
		});
	}

	newFax(fax?: any): FormGroup {
		return this.fb.group({
			fax: [fax ? fax : '']
		});
	}

	newTax(tax?: any): FormGroup {
		return this.fb.group({
			taxId: [tax ? tax : '']
		});
	}

	newRelate(relate?: any): FormGroup {
		return this.fb.group({
			idRelate: [relate ? relate.idRelate : ''],
			relationCustomer: [relate ? relate.relationCustomer : null]
		});
	}

	newQA(qAndA?: any): FormGroup {
		return this.fb.group({
			id: [qAndA ? qAndA.id : ''],
			answer: [qAndA ? qAndA.answer : '', Validators.required],
			question: [qAndA ? qAndA.question : null, Validators.required],
			customerTransId: this.commonService.cusTransId$.getValue(),
			customerId: [qAndA ? qAndA.customerId : ''],
		});
	}

	addIden() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.identification.push(this.newIden());
			}
		});
	}

	addContact() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.contactInfo.push(this.newContact());
			}
		});
	}

	addFax() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.faxs.push(this.newFax());
			}
		});
	}

	addTax() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.taxs.push(this.newTax());
			}
		});
	}

	addRelate() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.relates.push(this.newRelate());
			}
		});
	}

	addQA() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.questionAnswer.push(this.newQA());
			}
		});
	}

	removeQA(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.questionAnswer.removeAt(i);
				this.mapSelectedQuestion.delete(i);
			}
		});
	}

	removeIden(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.identification.removeAt(i);
			}
		});
	}

	removeContact(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.contactInfo.removeAt(i);
			}
		});
	}

	removeFax(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.faxs.removeAt(i);
			}
		});
	}

	removeTax(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.taxs.removeAt(i);
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

	ngOnInit() {

		this.getCareers();
		this.getCountrys();
		this.getIndustrys();
		this.getRelations();
		this.getPortfolios(TYPE_DANH_MUC.PORTFOLIO);
		this.getCcyList();
		this.getCities();
		if (this.commonService.isUpdateCus$.getValue()) {
			if (this.cusDataFrmDash.fax && this.cusDataFrmDash.fax.length > 0) {
				this.faxs.removeAt(0);
			}
			if (this.cusDataFrmDash.taxId && this.cusDataFrmDash.taxId.length > 0) {
				this.taxs.removeAt(0);
			}
		}


		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		// Khi cập nhật chữ ký mẫu
		if (this.cusDataFrmDash && !this.commonService.isPredictUserExists$.getValue() && (this.commonService.isUpdateCus$.getValue())) {
			if (this.cusDataFrmDash.customer) {
				this.commonService.cusTransId$.next(this.cusDataFrmDash.customer.id);
			}
			// this.commonService.cusTransId$.next(this.cusDataFrmDash.customerId || this.cusDataFrmDash.customer.id);
		} else {
			this.commonService.cusTransId$.next(getRandomTransId(this.username, 'customer'));
		}

		this.commonService.cusTransId$
			.pipe(takeUntil(this.destroy$))
			.subscribe(r => {
				if (r) {
					this.customerForm.addControl('identification', this.commonService.isUpdateCus$.getValue() || this.commonService.isUpdateCombo$.getValue() ? this.fb.array([]) : this.fb.array([this.newIden()]));
					this.customerForm.addControl('contactInfos', this.commonService.isUpdateCus$.getValue() || this.commonService.isUpdateCombo$.getValue() ? this.fb.array([]) : this.fb.array([this.newContact()]));
					this.customerForm.addControl('relates', this.commonService.isUpdateCus$.getValue() || this.commonService.isUpdateCombo$.getValue() ? this.fb.array([]) : this.fb.array([this.newRelate()]));
					this.customerForm.addControl('questionAnswer', (this.commonService.isUpdateCus$.getValue() || this.commonService.isUpdateCombo$.getValue()) ? this.fb.array([]) : this.fb.array([this.newQA()]));
				}
			});

		// pass data từ nhận diện GTTT
		// if (this.cusDataFrmDash && this.commonService.isPredictUserExists$.getValue()) {
		// 	debugger
		// 	this.customerForm.patchValue({
		// 		customerId: '',
		// 		customerName: this.cusDataFrmDash[0].ho_ten.value_unidecode,
		// 		// sex: this.cusDataFrmDash.customer.sex,
		// 		birthday: parseDateFrmStr(this.cusDataFrmDash[0].ngay_sinh.value),
		// 	});
		// }

		// customer manage update

		// Cập nhật bản ghi thông tin khách hàng từ trang chủ
		if (this.commonService.isUpdateCus$.getValue()) {
			this.disableField$.next(true);
			if (this.cusDataFrmDash.province) {
				this.getDistrict('', this.cusDataFrmDash.province);
			}

			// Load thông tin nghề nghiệp

			if (this.cusDataFrmDash.employment) {
				this.frm.occupation.setValue(this.cusDataFrmDash.occupation);
				this.getOccupation(this.cusDataFrmDash.employment);
			}

			if (this.cusDataFrmDash.industryGroup) {
				this.loadIndustry(this.cusDataFrmDash.industryGroup);
			}

			if (this.cusDataFrmDash.industry) {
				this.loadIndustryClass(this.cusDataFrmDash.industry);
			}

			if (this.cusDataFrmDash.noOfDependents || this.cusDataFrmDash.customerCurrency ||
				this.cusDataFrmDash.salaryReq || this.cusDataFrmDash.fax.length > 0 ||
				this.cusDataFrmDash.taxId.length > 0 || this.cusDataFrmDash.loyalty) {
				this.isShowOtherInfo = true;
			}

			if (this.cusDataFrmDash.identityPapers.length > 0) {
				if (!this.identification) {
					this.customerForm.addControl('identification', this.fb.array([]));
				}
				this.cusDataFrmDash.identityPapers.forEach(element => {
					this.identification.push(this.newIden(element));
				});
			}

			if (this.cusDataFrmDash.securityQuestions.length > 0) {
				if (!this.questionAnswer) {
					this.customerForm.addControl('questionAnswer', this.fb.array([]));
				}
				this.cusDataFrmDash.securityQuestions.forEach(element => {
					this.questionAnswer.push(this.newQA(element));
				});
			}
			if (this.cusDataFrmDash.cusRelationships.length > 0) {
				this.bindingRealtionCode(this.cusDataFrmDash.cusRelationships);
			}

			if (this.cusDataFrmDash.customerCommunications.length > 0) {
				if (!this.contactInfo) {
					this.customerForm.addControl('contactInfos', this.fb.array([]));
				}
				this.cusDataFrmDash.customerCommunications.forEach(element => {
					this.contactInfo.push(this.newContact(element));
				});
			}

			this.bindingTax(this.cusDataFrmDash.taxId, ';');
			this.bindingFax(this.cusDataFrmDash.fax, ';');
			let dataStress;
			let dataTown;
			if (this.cusDataFrmDash.stress) {
				let dataAddress = this.cusDataFrmDash.stress.split(',');
				let dataAddClone = [...dataAddress];
				if (dataAddClone.length > 1) {
					dataAddClone.pop();
				}
				dataStress = dataAddClone.toString();
				dataTown = dataAddress.length > 1 ? dataAddress[dataAddress.length - 1] : null;

			}

			this.customerForm.patchValue({
				customerId: this.cusDataFrmDash.customerId,
				customerName: this.cusDataFrmDash.customerName,
				sex: this.cusDataFrmDash.sex,
				birthday: parseDateFrmStr(this.cusDataFrmDash.birthday),
				placeOfBirth: this.cusDataFrmDash.placeOfBirth,
				maritalStatus: this.cusDataFrmDash.maritalStatus,
				purpose: this.cusDataFrmDash.purpose,
				national: this.cusDataFrmDash.national.split(';'),
				residentStstus: this.cusDataFrmDash.residentStstus,
				residentNational: this.cusDataFrmDash.residentNational,
				stress: dataStress, // trường đường phố
				// customerAddress: this.cusDataFrmDash.stress,
				town: dataTown,
				gttt: this.cusDataFrmDash.gttt,
				idenType: this.cusDataFrmDash.idenType,
				organization: this.cusDataFrmDash.organization,
				idenTime: parseDateFrmStr(this.cusDataFrmDash.idenTime),
				idenAdress: this.cusDataFrmDash.idenAdress,
				idenTimeExpired: parseDateFrmStr(this.cusDataFrmDash.idenTimeExpired),
				idenTimeValue: this.cusDataFrmDash.idenTimeValue ? parseDateFrmStr(this.cusDataFrmDash.idenTimeValue) : null,
				idenAddress: this.cusDataFrmDash.idenAddress,
				phone: this.cusDataFrmDash.phone,
				mobile: this.cusDataFrmDash.mobile,
				email: this.cusDataFrmDash.email,
				// occupation: this.cusDataFrmDash.occupation,
				priority: this.cusDataFrmDash.priority,
				// stress: this.cusDataFrmDash.stress,
				district: this.cusDataFrmDash.district,
				province: this.cusDataFrmDash.province,
				country: this.cusDataFrmDash.country,
				// customerAddress: customerAddress,
				securityQues: this.cusDataFrmDash.securityQues,
				answer: this.cusDataFrmDash.answer,
				loyalty: this.cusDataFrmDash.loyalty,
				campaignId: this.cusDataFrmDash.campaignId,
				saleType: this.cusDataFrmDash.saleType,
				saleId: this.cusDataFrmDash.saleId,
				brokerType: this.cusDataFrmDash.brokerType,
				brokerId: this.cusDataFrmDash.brokerId,
				// priority: this.cusDataFrmDash.priority,
				title: this.cusDataFrmDash.title,
				portfolio: this.cusDataFrmDash.portfolio,
				ownerBen: this.cusDataFrmDash.ownerBen,
				ownCustomer: this.cusDataFrmDash.ownCustomer,
				employment: this.cusDataFrmDash.employment,
				employerName: this.cusDataFrmDash.employerName,
				employerAddress: this.cusDataFrmDash.employerAddress,
				industryGroup: this.cusDataFrmDash.industryGroup,
				industry: this.cusDataFrmDash.industry,
				industryClass: this.cusDataFrmDash.industryClass,

				noOfDependents: this.cusDataFrmDash.noOfDependents,
				customerCurrency: this.cusDataFrmDash.customerCurrency,
				salaryReq: this.cusDataFrmDash.salaryReq,
				fax: this.cusDataFrmDash.fax,
				taxId: this.cusDataFrmDash.taxId,
				relate: this.cusDataFrmDash.relate,
				relationCustomer: this.cusDataFrmDash.relationCustomer,

				inputter: this.cusDataFrmDash.inputter,
				authoriser: this.cusDataFrmDash.authoriser,
				coCode: this.cusDataFrmDash.coCode,
				departCode: this.cusDataFrmDash.departCode,
			});
			this.setRequiredCurrency(null);
		}

		// hiển thi thông tin sau khi nhận diện (module combo cũ), hoặc sau khi bấm tìm kiếm trong module quản lý thông tin KH
		if (!this.commonService.isUpdateCombo$.getValue()) {
			this.commonService.dataQA$.subscribe(dataQA => {
				if (dataQA) {
					if (this.commonService.isExCombo$.getValue() && dataQA && dataQA.length > 0) {
						this.questionAnswer.removeAt(0);
					}
					if (!this.commonService.isUpdateCus$.getValue()) {
						if (dataQA && dataQA.length > 0) {
							this.questionAnswer.removeAt(0);
						}
					}
					if (dataQA && dataQA.length > 0) {
						let dataQandA = [...dataQA];
						this.questionAnswer.clear();
						dataQandA.forEach(element => {
							this.questionAnswer.push(this.newQA(element));
						});
					}
				}
			});
		}

		// Đổ data sau khi tìm kiếm thông tin khách hàng (customer manage || combo cũ)
		this.commonService.customerDataObject$
			.pipe(takeUntil(this.destroy$))
			.subscribe(customer => {
				// clear hết phần từ formArray khi bấm tìm kiếm lần thứ 2 (customer - manage)
				if (!this.commonService.isUpdateCombo$ && !this.commonService.isUpdateCus$) {
					this.identification.clear();
					this.contactInfo.clear();
				}
				if (customer && customer.employmentStatus) {
					this.frm.occupation.setValue(customer.occupation);
					this.getOccupation(customer.employmentStatus);
				}

				if (customer && customer.industryGroup) {
					this.loadIndustry(customer.industryGroup);
				}

				if (customer && customer.industry) {
					this.loadIndustryClass(customer.industry);
				}

				// patch data khi nhận diện khách hàng xong - set validation
				if (customer) {
					this.frm.oldAddressLength.setValue(customer.address.split('#').length);
					this.frm.oldCurrAddressLength.setValue(customer.currentAddress.split('#').length);
					this.frm.oldStressLength.setValue(customer.permanentAddress.split('#').length);
					this.clearFormArray(this.taxs);
					this.clearFormArray(this.faxs);
					this.clearFormArray(this.relates);
					if (customer.currentAddress) {
						this.commonService.homeAddressGlobal$.next(customer.currentAddress);
					}

					if (customer.salary) {
						this.isShowOtherInfo = true;
					}

					this.customer = customer;
					setTimeout(() => {
						if (customer.seabOwnCust) {
							this.checkCustomerExists(customer.seabOwnCust);
						}
					}, 500);

					//<editor-fold decs="data thông tin liên lạc khi tìm kiếm xong Đoạn này nhé!">
					let sms = '';
					if (customer.sms2) {
						sms = customer.sms + '#' + customer.sms2;
					} else {
						sms = customer.sms;
					}
					let dataContact = this.passContactMultiple(customer.phone, customer.email, sms, customer.addrLocation);
					//</editor-fold>
					// let dataContact = this.passContactMultiple(customer.phone, customer.email, customer.sms, customer.addrLocation);
					this.contactInfo.removeAt(0);
					if (dataContact.length > 0) {
						dataContact.forEach(element => {
							this.contactInfo.push(this.newContact(element));
						});
					}

					let dataIden = this.passDataIdenMultiple(customer.legalID, customer.legalDocName, customer.legalHolderName, customer.legalIssDate,
						customer.legalIssAuth, customer.legalExpDate);

					// data thông tin GTTT khi tìm kiếm xong
					this.identification.removeAt(0);
					if (dataIden.length > 0) {
						dataIden.forEach(element => {
							this.identification.push(this.newIden(element));
						});
					}

					if (customer.province) {
						this.getDistrict('', customer.province);
					}

					let dataCustomerAddress;
					let dataTown;
					if (customer.permanentAddress) {
						if(customer.permanentAddress.includes(',')) {
							let dataAddress = customer.permanentAddress.replace(/#/g, ' ').split(',');
							let dataAddClone = [...dataAddress];
							if (dataAddClone.length > 1) {
								dataAddClone.pop();
							}
							dataCustomerAddress = dataAddClone.toString();
							dataTown = dataAddress.length > 1 ? dataAddress[dataAddress.length - 1] : null;
						} else {
							dataCustomerAddress = customer.permanentAddress.replace(/#/g, ' ');
							dataTown = customer.permanentAddress.replace(/#/g, ' ');
						}
						

					}
					// binding fax, tax, relation
					this.bindingFax(customer.fax1, '#');
					this.bindingTax(customer.taxID, '#');
					// Moi quan he
					if (customer.relationCode && customer.relCustomer) {
						const relationCustomers: string[] = customer.relationCode.split('#');
						const idRelates: string[] = customer.relCustomer.split('#');
						const cusRelationships: any[] = [];
						for (let i = 0; i < relationCustomers.length; i++) {
							cusRelationships.push({
								idRelate: idRelates[i],
								relationCustomer: relationCustomers[i]
							});
						}
						this.bindingRealtionCode(cusRelationships);
					}

					this.customerForm.patchValue({
						portfolio: customer.portfolio,
						loyalty: customer.loyalty,
						customerId: customer.customerID,
						customerName: customer.shortName,
						sex: customer.gender,
						birthday: parseDateFrmStr(customer.dateOfBirth, 'string'),
						// birthday: parseDateFrmStr(customer.dateOfBirth),
						placeOfBirth: customer.seabPob,
						maritalStatus: customer.maritalStatus,
						purpose: customer.seabPurpose,
						national: this.bindingNational(customer.nationality, customer.otherNationalty),
						// national: customer.nationality.split('#'),
						residentStstus: customer.seabRegStatus,
						residentNational: customer.resident,
						idenAddress: customer.currentAddress.replace(/#/g, ' '), // Trường địa chỉ thường trú
						stress: dataCustomerAddress, // đường phố
						town: dataTown,
						customerAddress: customer.permanentAddress.replace(/#/g, ' '),
						district: customer.seabDistrict1,
						province: customer.province,
						country: customer.country.split('#')[0] || 'Vietnam',
						// customerAddress: customerAddress,
						customerCurrency: customer.customerCcy,
						salaryReq: parseInt(customer.salary),
						noOfDependents: customer.noOfDependents,
						industryClass: customer.industryClass,
						industryGroup: customer.industryGroup,
						industry: customer.industry,
						employment: customer.employmentStatus,
						employerName: customer.employersName,
						employerAddress: customer.employersAdd,
						title: customer.title,
						ownerBen: customer.seabOwnerBen,
						ownCustomer: customer.seabOwnCust, // id chủ sở hữu hưởng lợi
						idenTimeValue: customer.passIssDate ? parseDateFrmStr(customer.passIssDate, 'string') : null // ngày hiệu lực visa
					});
					// this.customerForm.disable();
					this.setRequiredCurrency(null);
				}
			});


		if (!this.cusDataFrmDash) {
			this.customerForm.controls.residentNational.setValue('VN');
			this.customerForm.controls.country.setValue('VN');
			this.customerForm.controls.placeOfBirth.setValue(['VN']);
			this.customerForm.controls.national.setValue(['VN']);
		}


		if (!this.commonService.isUpdateCus$.getValue()) {
			this.frm.portfolio.clearValidators();
		}

		if (this.cusDataFrmDash && this.cusDataFrmDash.listFile && this.cusDataFrmDash.listFile.length > 0) {
			this.parentForm.removeControl('customerForm');
		} else {
			this.parentForm.addControl('customerForm', this.customerForm);
		}

		this.commonService.isUpdateCus$.subscribe(rawValue => {
			if (rawValue == true) {
				this.parentForm.addControl('customerForm', this.customerForm);
				this.addValidator(this.customerForm);
			} else {
				this.removeValidators(this.customerForm);
				this.parentForm.removeControl('customerForm');
			}
		});

		// check diff cust info
		this.customerService.customerInfoT24$
			.pipe(takeUntil(this.destroy$))
			.subscribe(res => {
				if (res) {
					if (!this.oldOccu) {
						this.getOldDistrict(res.province);
						this.getOldOccuptionList(res.employment, res.occupation);
						this.getoldIndustries(res.industryGroup, res.industry);
					}
				}
			});
	}

	private getoldIndustries(industryGroup: string, industry: string) {
		const cache = this.localStorage.retrieve(UTILITY.INDUSTRY.INDUSTRY_CACHE);
		if (cache) {
			const industryDatas = cache;
			this.oldIndustrys = industryDatas.filter(value => value.parentIndustry == industryGroup);
			this.oldIndustryClass = industryDatas.filter(value => value.parentIndustry == industry);
			return;
		}
		this.utilityService.getIndustrysNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const industryDatas = res.body.enquiry.industrys;
					this.oldIndustrys = industryDatas.filter(value => value.parentIndustry == industryGroup);
					this.oldIndustryClass = industryDatas.filter(value => value.parentIndustry == industry);
				}
			});
	}

	private getOldOccuptionList(nhomNganhId: string, occupation: string) {
		this.utilityService.getOccupationsNew(nhomNganhId)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.oldOccupationList = res.body.enquiry.nhomNghe;
					if (!this.oldOccu) {
						const occu = this.oldOccupationList.find(ele => ele.nameEN == occupation.trim());
						if (occu) {
							this.oldOccu = occu.nhomNgeId;
							const bodyT24 = this.customerService.customerInfoT24$.getValue();
							bodyT24.occupation = this.oldOccu;
							this.customerService.customerInfoT24$.next(bodyT24);
						}
					}
				}
			});
	}

	private getOldDistrict(province: string) {
		this.fetchDistrict(province).subscribe(res => {
			this.oldDistrictList = res;
		});
	}

	ngAfterViewInit(): void {
		if (this.cusDataFrmDash && this.cusDataFrmDash.customer) {
			this.customerForm.get('faxs').valueChanges.subscribe(() => {
				if (this.customerForm.get('faxs').value.length > 1) {
					this.isMinusFaxSign$.next(true);
				}
			});

			this.customerForm.get('taxs').valueChanges.subscribe(() => {
				if (this.customerForm.get('taxs').value.length > 1) {
					this.isMinusTaxSign$.next(true);
				}
			});
		}

		if (this.commonService.isUpdateCus$.getValue()) {
			if (!this.customerService.firstBindingForm) {
				this.customerService.firstBindingForm = this.customerForm.value;
			}
		}
	}

	ngOnDestroy() {
		this.isUpdateCustInfo$.next(null);
		this.commonService.cusTransId$.next(null);
		this.commonService.isUpdateCus$.next(false);
		this.commonService.emailAutoFill$.next(null);
		this.commonService.mobileAutoFill$.next(null);
		this.commonService.isPredictUserExists$.next(false);
		this.isMinusFaxSign$.next(false);
		this.isMinusTaxSign$.next(false);
		this.commonService.customerDataObject$.next(null);
		this.commonService.isUpdateCombo$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		this.commonService.dataQA$.next(null);
		this.commonService.isDisabledCustomerForm$.next(null);
		this.destroy$.next();
		this.destroy$.complete();
		this.customerService.customerInfoT24$.next(null);
		this.customerService.firstBindingForm = null;
	}

	changeOwner() {
		console.warn('>>>>>>> on change chu so huu huong loi');
		console.warn('>>>>>>> ownerBenefitList', this.ownerBenefitList);

		if (this.customerForm.controls.ownerBen.value == '1.DONG SO HUU'
			&& this.customerForm.controls.ownCustomer.dirty &&
			this.customerForm.controls.ownCustomer.value) {
			this.isLoadingOwnerBen.next(true);
			forkJoin(this.getCust(), this.getAccount())
				.pipe(finalize(() => this.isLoadingOwnerBen.next(false)))
				.subscribe(([customerInfo, account]) => {
					this.ownerBenData = customerInfo;
					this.getDistrict1(this.ownerBenData.province);
					if (account.enquiry.account) {
						this.ownerBenAccount = account.enquiry.account;
					} else {
						this.ownerBenAccount = [];
					}
				});

		} else {
			this.ownerBenData = null;
			this.ownerBenAccount = null;
		}
	}

	getCust(): Observable<any> {
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = this.customerForm.controls.ownCustomer.value;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);


		return this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(map((res) => res.enquiry));
	}

	getAccount(): Observable<any> {
		let bodyConfig = AccountRequestDTO.BODY.BODY_GET_ACCOUNT;
		bodyConfig.enquiry.customerID = this.customerForm.controls.ownCustomer.value;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		return this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(map((res) => res));
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

	resetDistrict() {
		this.frm.district.setValue(null);
	}

	getDistrict(event?, province?) {
		const provinceId = province ? province : this.frm.province.value;
		this.isLoadingDistrict$.next(true);
		this.fetchDistrict(provinceId)
			.pipe(finalize(() => {
				this.isLoadingDistrict$.next(false);
				// this.checkBoxSameAddress();
			}))
			.subscribe(res => {
				this.districtList = res;
				this.localStorage.store('district-current', res);
			});
	}

	getDistrict1(provinceId?: string) {
		// this.isLoadingDistrict$.next(true);
		// this.fetchDistrict(provinceId)
		// 	.pipe(finalize(() => this.isLoadingDistrict$.next(false)))
		// 	.subscribe(res => this.districtList2 = res);
	}

	fetchDistrict(provinceId: string): Observable<any> {
		const command = GET_ENQUIRY;
		const enquiry = {
			authenType: 'getDISTRICTS',
			cityID: provinceId
		};
		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		return this.commonService.actionGetEnquiryUtility(bodyRequest)
			.pipe(map(r => {
				if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
					return r.enquiry.district;
				} else {
					return [];
				}
			}));
	}

	getCcyList() {
		let ccyCached = this.localStorage.retrieve('ccyCached');
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
						this.localStorage.store('ccyCached', this.ccyList);
					} else {
						// this.commonService.error(r.error.desc)
					}
				});
		}
	}

	getOccupation(nhomNganhId) {
		const cache = this.localStorage.retrieve(UTILITY.OCCUPATIONS.OCCUPATIONS_CACHE + nhomNganhId);
		if (cache) {
			this.occupationList$.next(cache);
			this.filterIdByOccupationName();
			return;
		}
		this.utilityService.getOccupationsNew(nhomNganhId)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.occupationList$.next(res.body.enquiry.nhomNghe);
					this.localStorage.store(UTILITY.OCCUPATIONS.OCCUPATIONS_CACHE + nhomNganhId, this.occupationList$.getValue());
					this.filterIdByOccupationName();
				}
			});
	}

	/**
	 * Nhóm nghề nghiệp
	 */
	getCareers(): void {
		const cache = this.localStorage.retrieve(UTILITY.CAREER.CAREER_CACHE);
		if (cache) {
			this.employmentList$.next(cache.filter(ele => !NHOM_NGANH_ID_LOAI_BO.includes(ele.nhomNganhId)));
			return;
		}
		this.utilityService.getCareersNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const employmentList: any[] = res.body.enquiry.nhomNganh;
					this.employmentList$.next(employmentList.filter(ele => !NHOM_NGANH_ID_LOAI_BO.includes(ele.nhomNganhId)));
					this.localStorage.store(UTILITY.CAREER.CAREER_CACHE, employmentList);
				}
			});
	}

	getCountrys() {
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

	getIndustrys() {
		const cache = this.localStorage.retrieve(UTILITY.INDUSTRY.INDUSTRY_CACHE);
		if (cache) {
			this.industryDatas = cache;
			const industryGroup = this.frm.industryGroup.value;
			const industry = this.frm.industry.value;
			this.industrys$.next(this.industryDatas.filter(value => value.parentIndustry == industryGroup));
			this.industryClass$.next(this.industryDatas.filter(value => value.parentIndustry == industry));
			this.industrysGroup$.next(this.industryDatas.filter(value => (value.parentIndustry == '' && Number(value.industryId) <= 35 && Number(value.industryId) >= 21)));
			return;
		}
		this.utilityService.getIndustrysNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.industryDatas = res.body.enquiry.industrys;
					const industryGroup = this.frm.industryGroup.value;
					const industry = this.frm.industry.value;
					this.industrys$.next(this.industryDatas.filter(value => value.parentIndustry == industryGroup));
					this.industryClass$.next(this.industryDatas.filter(value => value.parentIndustry == industry));
					this.industrysGroup$.next(this.industryDatas.filter(value => (value.parentIndustry == '' && Number(value.industryId) <= 35 && Number(value.industryId) >= 21)));
					this.localStorage.store(UTILITY.INDUSTRY.INDUSTRY_CACHE, this.industryDatas);
				}
			});
	}

	getRelations() {
		const cache = this.localStorage.retrieve(UTILITY.RELATION.RELATION_CACHE);
		if (cache) {
			this.relations$.next(cache);
			return;
		}
		this.utilityService.getRelationsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const relations = res.body.enquiry.relations;
					this.relations$.next(relations);
					this.localStorage.store(UTILITY.RELATION.RELATION_CACHE, relations);
				}
			});
	}

	getPortfolios(type) {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.PORTFOLIO);
		if (cache) {
			this.portfolios = cache;
			return;
		}
		this.utilityService.getPortfoliosNew(type)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.portfolios = res.body.enquiry.catalogs;
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.PORTFOLIO, this.portfolios);
				}
			});
	}

	toggleOther() {
		this.isShowOtherInfo = !this.isShowOtherInfo;
		if (this.isShowOtherInfo) {
			this.getCcyList();
		}
	}

	toggleAml() {
		this.isShowAML = !this.isShowAML;
	}

	get frm() {
		if (this.customerForm && this.customerForm.controls) {
			return this.customerForm.controls;
		}
	}

	removeValidatorTaxForm() {
		for (let i = 0; i < this.taxs.controls.length; i++) {
			for (const fieldName in this.taxs.controls[i]['controls']) {
				this.taxs.controls[i]['controls'][fieldName].clearValidators();
				this.taxs.controls[i]['controls'][fieldName].markAsUntouched();
				this.taxs.controls[i]['controls'][fieldName].updateValueAndValidity();
			}
		}
	}

	removeValidatorFaxForm() {
		for (let i = 0; i < this.faxs.controls.length; i++) {
			for (const fieldName in this.faxs.controls[i]['controls']) {
				this.faxs.controls[i]['controls'][fieldName].clearValidators();
				this.faxs.controls[i]['controls'][fieldName].markAsUntouched();
				this.faxs.controls[i]['controls'][fieldName].updateValueAndValidity();
			}
		}
	}

	removeValidatorSecurityQuestionForm() {
		for (let i = 0; i < this.questionAnswer.controls.length; i++) {
			for (const fieldName in this.questionAnswer.controls[i]['controls']) {
				this.questionAnswer.controls[i]['controls'][fieldName].clearValidators();
				this.questionAnswer.controls[i]['controls'][fieldName].markAsUntouched();
				this.questionAnswer.controls[i]['controls'][fieldName].updateValueAndValidity();

			}
		}
	}

	removeValidatorContactForm() {
		for (let i = 0; i < this.contactInfo.controls.length; i++) {
			for (const fieldName in this.contactInfo.controls[i]['controls']) {
				this.contactInfo.controls[i]['controls'][fieldName].clearValidators();
				this.contactInfo.controls[i]['controls'][fieldName].markAsUntouched();
				this.contactInfo.controls[i]['controls'][fieldName].updateValueAndValidity();

			}
		}
	}

	removeValidatorIdentificationForm() {
		for (let i = 0; i < this.identification.controls.length; i++) {
			for (const fieldName in this.identification.controls[i]['controls']) {
				this.identification.controls[i]['controls'][fieldName].clearValidators();
				this.identification.controls[i]['controls'][fieldName].markAsUntouched();
				this.identification.controls[i]['controls'][fieldName].updateValueAndValidity();

			}
		}
	}

	removeValidators(form: FormGroup) {
		for (const key in form.controls) {
			if (key == 'taxs') {
				this.removeValidatorTaxForm();
			}

			if (key == 'faxs') {
				this.removeValidatorFaxForm();
			}

			if (key == 'questionAnswer') {
				this.removeValidatorSecurityQuestionForm();
			}

			if (key == 'contactInfos') {
				this.removeValidatorContactForm();
			}

			if (key == 'identification') {
				this.removeValidatorIdentificationForm();
			}
		}

		for (const key in form.controls) {
			form.get(key).clearValidators();
			form.get(key).updateValueAndValidity();
		}
	}

	addValidator(form: FormGroup) {
		const arr = ['customerName', 'cardName', 'birthday', 'placeOfBirth', 'maritalStatus', 'purpose', 'town',
			'national', 'residentStstus', 'occupation', 'stress', 'district', 'province', 'securityQues', 'answer', 'title', 'ownerBen',
			'employment', 'employerName', 'employerAddress', 'industryGroup', 'industry', 'industryClass', 'portfolio'];
		for (const key in form.controls) {
			arr.forEach(r => {
				if (key == r) {
					form.get(key).setValidators([Validators.required]);
					form.get(key).updateValueAndValidity();
				}
			});
		}
	}

	checkedUpdate(event) {
		if (event.target.checked) {
			this.isUpdateCustInfo$.next(true);
			this.commonService.isUpdateProspectId$.next(false);
			this.commonService.isUpdateSignature$.next(false);
			this.commonService.isUpdateCus$.next(true);
			this.isCheckedUpdate = true;
			const bodyT24 = this.customerService.customerInfoT24$.getValue();
			this.mappingSecurQToHashMap(bodyT24 ? bodyT24.securityQuestions : []);
			if (!this.oldOccu && bodyT24) {
				this.oldOccu = this.frm.occupation.value;
				bodyT24.occupation = this.frm.occupation.value;
				this.customerService.customerInfoT24$.next(bodyT24);
			}
			if (!this.customerService.firstBindingForm) {
				this.customerService.firstBindingForm = this.customerForm.value;
			}
		} else {
			this.isUpdateCustInfo$.next(false);
			this.isCheckedUpdate = false;
			this.commonService.isUpdateCus$.next(false);
			this.commonService.isUpdateProspectId$.next(false);
			this.commonService.isUpdateSignature$.next(false);
			// this.removeValidators(this.customerForm);
			// this.parentForm.removeControl('customerForm');
			// this.customerForm.disable();

		}
	}

	clearDate(event) {
		event.stopPropagation();
		this.customerForm.controls.idenTimeValue.reset();
	}

	onChangeOccupation() {
		this.customerForm.patchValue({occupation: null});
		if (this.frm.employment.value) {
			this.getOccupation(this.frm.employment.value);
		} else {
			this.occupationList$.next([]);
		}
	}

	loadIndustry(industryGroup) {
		if (industryGroup) {
			this.industrys$.next(this.industryDatas.filter(value => value.parentIndustry == industryGroup));
		} else {
			this.customerForm.patchValue({industry: null, industryClass: null});
			this.industrys$.next([]);
			this.industryClass$.next([]);
		}
	}

	onChangeIndustry() {
		this.customerForm.patchValue({industry: null, industryClass: null});
		if (this.frm.industryGroup.value) {
			this.industrys$.next(this.industryDatas.filter(value => value.parentIndustry == this.frm.industryGroup.value));
		} else {
			this.customerForm.patchValue({industry: null, industryClass: null});
			this.industrys$.next([]);
			this.industryClass$.next([]);
		}
	}

	loadIndustryClass(industry) {
		if (industry) {
			this.industryClass$.next(this.industryDatas.filter(value => value.parentIndustry == industry));
		} else {
			this.industryClass$.next([]);
		}
	}

	onChangeIndustryClass() {
		this.customerForm.patchValue({industryClass: null});
		if (this.frm.industry.value) {
			this.industryClass$.next(this.industryDatas.filter(value => value.parentIndustry == this.frm.industry.value));
		} else {
			this.industryClass$.next([]);
		}
	}

	checkCustomerExists(ownCust?) {
		this.ownerId$.next(null);

		if ((this.customerForm.controls.ownCustomer.value || ownCust)) {
			if (ownCust) {
				this.getCustomerInfo(ownCust);
			} else {
				this.getCustomerInfo(this.customerForm.controls.ownCustomer.value);
			}

		}
	}

	//Check exists customer
	getCustomerInfo(customerId) {
		this.commonService.checkCusExists$.next(true);
		this.isLoadingCheckOwnerExists$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;

		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCheckOwnerExists$.next(false)))
			.pipe(finalize(() => this.commonService.checkCusExists$.next(false)))
			.subscribe(res => {
				if (res) {
					if (this.customerForm.controls.ownCustomer.value) {
						this.ownerId$.next(res.enquiry.shortName);
					}
				} else {
					this.customerForm.controls.ownCustomer.setValue(null);
					// if (this.customerForm.controls.ownCustomer.hasError('notExist')) {
					// 	this.customerForm.controls.ownCustomer.setErrors(null);
					// }
					// this.customerForm.controls.ownCustomer.setErrors({notExist: true});
					// this.customerForm.controls.ownCustomer.markAsTouched();
					this.ownerId$.next('Mã KH không tồn tại');
					return;
				}
			});
	}

	passNameToAcc() {
		if (this.customerForm.controls.customerName.value) {
			if (this.parentForm.get('accountInfoForm.accountName')) {
				this.parentForm.get('accountInfoForm.accountName').setValue(this.customerForm.controls.customerName.value);
			}
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.cusDataFrmDash && !changes.cusDataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('cusDataFrmDash')) {
				this.ngOnInit();
			}
		}
	}

	fillDataToSms(index, type) {
		this.parentForm.addControl('customerForm', this.customerForm);
		let dataSms = this.parentForm.value.smsRegisterForm.formArray;
		if (index == 0 && type == 'email') {
			const formArray = this.parentForm.get('customerForm.contactInfos') as FormArray;
			const email = formArray.controls[0].get('email').value;
			this.commonService.emailAutoFill$.next(email);
			dataSms.forEach(element => {
				element.email = email;
			});
		}

		if (index == 0 && type == 'mobile') {
			const formArray = this.parentForm.get('customerForm.contactInfos') as FormArray;
			const phoneNumber = formArray.controls[0].get('mobile').value;
			this.commonService.mobileAutoFill$.next(phoneNumber);
			dataSms.forEach(element => {
				element.phoneNumber = phoneNumber;
			});
		}
	}

	checkSpecialChar(e) {
		let keynum;
		let keychar;
		let numcheck;
		// For Internet Explorer
		if (window.event) {
			keynum = e.keyCode;
		}
		// For Netscape/Firefox/Opera
		else if (e.which) {
			keynum = e.which;
		}
		keychar = String.fromCharCode(keynum);
		//List of special characters you want to restrict
		if (keychar == '\'' || keychar == '`' || keychar == '!' || keychar == '@' || keychar == '#' || keychar == '$' || keychar == '%' || keychar == '^' || keychar == '&' || keychar == '*' || keychar == '(' || keychar == ')' || keychar == '-' || keychar == '_' || keychar == '+' || keychar == '=' || keychar == '/' || keychar == '~' || keychar == '<' || keychar == '>' || keychar == ',' || keychar == ';' || keychar == ':' || keychar == '|' || keychar == '?' || keychar == '{' || keychar == '}' || keychar == '[' || keychar == ']' || keychar == '¬' || keychar == '£' || keychar == '"' || keychar == '\\') {
			return false;
		} else {
			return true;
		}
	}

	passDataIdenMultiple(legalID, legalDocName, legalHolderName, legalIssDate, legalIssAuth, legalExpDate) {
		let dataMultipleIden = [];

		let listLegalID = legalID.split('#');
		let listDocName = legalDocName.split('#');
		let listHolderName = legalHolderName.split('#');
		let listIssDate = legalIssDate.split('#');
		let listIssAuth = legalIssAuth.split('#');
		let listExpDate = legalExpDate.split('#');

		for (let i = 0; i < listLegalID.length; i++) {
			dataMultipleIden.push({
				id: '',
				gttt: listLegalID[i] || '',
				idenType: listDocName[i] || '',
				organization: listHolderName[i] || '',
				idenTime: moment(listIssDate[i]).format('DD-MM-YYYY') || null,
				idenAdress: listIssAuth[i] || '',
				idenTimeExpired: moment(listExpDate[i]).format('DD-MM-YYYY') || null,
				idCustomer: this.commonService.cusTransId$.getValue()
			});
		}
		return dataMultipleIden;
	}

//addrLocation
	passContactMultiple(phone, email, sms, priority): any {
		let dataMultipleContact = [];

		let listPhone = phone.split('#');
		let listSms = sms.split('#');
		let listEmail = email.split('#');
		let listPriority = priority.split('#');

		for (let i = 0; i < listPhone.length; i++) {
			dataMultipleContact.push({
				phone: listPhone[i] || '',
				mobile: listSms[i],
				email: listEmail[i],
				priority: listPriority[i],
				idCustomer: this.commonService.cusTransId$.getValue()
			});
		}

		return dataMultipleContact;
	}

	checkLengthIdenAd(index, event) {
		if (this.identification.controls[index].get('idenAdress').hasError('longerError')) {
			this.identification.controls[index].get('idenAdress').setErrors(null);
		}
		if (event.target.value.length > 20) {
			this.identification.controls[index].get('idenAdress').setErrors({longerError: true});
			this.identification.controls[index].get('idenAdress').markAsTouched();
		}

	}

	checkLengthIdenAd1(index, event) {
		if (event.length > 20) {
			this.identification.controls[index].get('idenAdress').setErrors({longerError: true});
			this.identification.controls[index].get('idenAdress').markAsTouched();
		}

	}

	setRequiredCurrency(event) {
		const salary = this.customerForm.get('salaryReq').value;
		if (salary && salary.length) {
			this.customerForm.controls.customerCurrency.setValidators(Validators.required);
		} else {
			this.customerForm.controls.customerCurrency.clearValidators();
		}
		this.customerForm.controls.customerCurrency.updateValueAndValidity();
	}

	// change moi quan he
	setRequireIdRelate(event, index) {
		if (event) {
			this.relates.controls[index].get('idRelate').setValidators(Validators.required);
			this.relates.controls[index].get('idRelate').markAsTouched();
		} else {
			this.relates.controls[index].get('idRelate').clearValidators();
		}

		this.relates.controls[index].get('idRelate').updateValueAndValidity();
	}

	getCustomerInfoRelate(customerId, index?) {
		this.commonService.checkCusExists$.next(true);
		this.listName[index] = '';
		if (!customerId.target.value) {
			this.listName[index] = '';
			this.relates.controls[index].get('relationCustomer').clearValidators();
			this.relates.controls[index].get('relationCustomer').updateValueAndValidity();
			return;
		}
		this.relates.controls[index].get('relationCustomer').setValidators(Validators.required);
		this.relates.controls[index].get('relationCustomer').updateValueAndValidity();

		this.isLoadingCheckOwnerExists$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId.target.value;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCheckOwnerExists$.next(false)))
			.pipe(finalize(() => this.commonService.checkCusExists$.next(false)))
			.subscribe(res => {
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

	resetFormRelate(event, index) {
		if (event) {
			this.listName[index] = '';
		}
	}

	filterIdByOccupationName() {
		const nameEn: string = this.frm.occupation.value;
		if (nameEn && nameEn.includes(' ')) {
			const occus = this.occupationList$.getValue();
			const occu = occus.find(ele => ele.nameEN == nameEn.trim());
			if (occu) {
				this.frm.occupation.setValue(occu.nhomNgeId);
			}
		}
	}

	get isReadonly(): Observable<boolean> {
		if (this.authoriserble) {
			return of(true);
		}
		if (this.commonService.isUpdateCus$.getValue()) {
			return of(false);
		}
		if (this.disableField$.getValue()) {
			return of(true);
		}

		if (this.commonService.accountStatus$.getValue()) {
			if (this.commonService.canReupdateCustomer$.getValue()) {
				return of(false);
			} else {
				return of(true);
			}
		}

		return of(false);
	}

	onDateChangeIdenTimeExpired(event) {
		if (moment(event.value).startOf('d').isBefore(moment(new Date()).startOf('d'))) {
			this.idenTimeExpired$.next(true);
		} else {
			this.idenTimeExpired$.next(false);
		}
	}

	onChangeMucDich(event): void {
		console.warn('>>>>>>>>>>>>>> on change muc dich giao dich', event);
		console.warn('>>>>>>>>>>>>>> purposeList', this.purposeList);
	}

	get disabledAddress(): Observable<boolean> {
		if(!(this.frm.stress.value && this.frm.province.value && this.frm.district.value && this.frm.town.value)) {
			return of(true);
		}
		return of(false);
	}

	cloneAddress(event) {
		// this.isSameAddress = event.checked;
		if (event.checked) {
			this.isSameCheckbox = true;
			this.customerForm.controls.isSameIdenAddress.setValue(true);
			let cityCache = this.localStorage.retrieve('citycached');
			let districtCache;
			let idenAddress;
			let cityData;
			cityData = cityCache.find(city => city.cityID == this.frm.province.value).name_gb;
			districtCache = this.districtList.find(district => district.districID == this.frm.district.value).name_gb;
			idenAddress = this.frm.stress.value + ',' + this.frm.town.value + ',' + districtCache + ',' + cityData;
			this.frm.idenAddress.setValue(idenAddress);
		} else {
			this.customerForm.controls.isSameIdenAddress.setValue(false);
			this.frm.idenAddress.setValue(null);
		}
	}

	checkLength(event, type?) {
		if (event && type == 'stress' && event.includes('  ')) {
			this.stressTwoSpaces$.next('Vui lòng không nhập 2 ký tự space cạnh nhau');
		} else {
			this.stressTwoSpaces$.next(null);
		}

		if (event && type == 'town' && event.includes('  ')) {
			this.townTwoSpaces$.next('Vui lòng không nhập 2 ký tự space cạnh nhau');
		} else {
			this.townTwoSpaces$.next(null);
		}

		if (event && this.frm.stress.value && this.frm.town.value && (this.frm.stress.value.length + this.frm.town.value.length > 69)) {
			this.maxLengthAddress$.next('Độ dài trường Đường/Phố + Phường/Xã phải < 69 ký tự');
		} else {
			this.maxLengthAddress$.next(null);
		}
	}

	buildDataAddress() {
		let dataAdress;
		let textCity;
		let textDistrict;
		if (this.frm.province.value) {
			textCity = this.cityList.find(city => city.cityID == this.frm.province.value).name_gb;
		}
		if (this.frm.district.value) {
			textDistrict = this.districtList.find(dist => dist.districID == this.frm.district.value).name_gb;
		}

		dataAdress = this.frm.stress.value + ',' + this.frm.town.value + ',' + textDistrict + ',' + textCity;

		return dataAdress;
	}

	cloneCountry(country) {
		console.log(country);
		if (country) {
			this.frm.country.setValue(country.nameVi);
		}
	}

	compareValueHasChange(formCotrolName: string, formControlValue: string, typeInput?: any,
						  idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string {
		return this.customerService.compareValueHasChange(formCotrolName, formControlValue, typeInput,
			idxFormControl, dateFormat, dropdownList, code, value, prop);
	}

	getValueChange(formCotrolName: string, formControlValue: string, typeInput?: any,
				   idxFormControl?: number, dateFormat?: string, dropdownList?: any[], code?: string, value?: string, prop?: string): string {
		return this.customerService.getValueChange(formCotrolName, formControlValue, typeInput,
			idxFormControl, dateFormat, dropdownList, code, value, prop);
	}

	getValueChangeReport() {
		const marriedStatus = this.getValueChange('maritalStatus', this.frm.maritalStatus.value, this.ngSelectType,
			null, null, this.maritalStatusList, 'value', 'nameVi');

		const gender = this.getValueChange('sex', this.frm.sex.value, this.ngSelectType, null, null, this.genderList, 'code', 'value');
		const street = this.getValueChange('stress', this.frm.stress.value, null, null, null, null, null, null);
		const phuongXa = this.getValueChange('town', this.frm.town.value, null, null, null, null, null, null);
		const currentAdress = (street ? street + ', ' : street) + phuongXa;
		const district = this.compareValueHasChange('district', this.frm.district.value, this.ngSelectType, null, null, this.oldDistrictList, 'districID', 'name_gb');
		const province = this.compareValueHasChange('province', this.frm.province.value, this.ngSelectType, null, null, this.cityList, 'cityID', 'name_gb');
		// const gttt = this.identification.controls[0].get('gttt').value
		let gtttDiff = '';
		let issueAddDiff = '';
		let issueDateDiff = '';
		let i = 0;
		for (const iden of this.identification.controls) {
			const gttt = this.getValueChange('gttt', iden.get('gttt').value, null, i, null, null, 'gttt', null);
			const date = this.getValueChange('idenTime', iden.get('idenTime').value, this.dateInputType, i, this.dateFormatT24, null, 'idenTime', null);
			const add = this.getValueChange('idenAdress', iden.get('idenAdress').value, null, i, null, null, 'idenAdress', null, null);
			i++;
			if (gttt) {
				gtttDiff = gtttDiff + gttt + ';';
			}
			if (add) {
				issueAddDiff = issueAddDiff + add + ';';
			}
			if (date && date != 'Invalid date') {
				issueDateDiff = issueDateDiff + date + ';';
			}
		}
		gtttDiff.charAt(gtttDiff.length - 1) == ';' && (gtttDiff = gtttDiff.slice(0, gtttDiff.length - 1));
		issueAddDiff.charAt(issueAddDiff.length - 1) == ';' && (issueAddDiff = issueAddDiff.slice(0, issueAddDiff.length - 1));
		issueDateDiff.charAt(issueDateDiff.length - 1) == ';' && (issueDateDiff = issueDateDiff.slice(0, issueDateDiff.length - 1));


		const infoChange = {
			birthDate: this.getValueChange('birthday', this.frm.birthday.value, this.dateInputType,
				null, this.dateFormatT24, null, null, null),
			birthPlace: this.getValueChange('placeOfBirth', this.frm.placeOfBirth.value, this.ngSelectType,
				null, null, this.countries, 'countryId', 'nameGb'),
			coQuan: {
				quanCoQuan: '',
				diaChiCoQuan: this.getValueChange('employerAddress', this.frm.employerAddress.value),
				phone: '',
				tenCoQuan: '',
				tinhCoQuan: ''
			},
			cuaKhau: '',
			currentAddress: currentAdress,
			chucVu: '',
			diaChiNN: '',
			email: this.getValueChange('email', this.contactInfo.controls[0].get('email').value, null, 0, null, null, 'email', null),
			fromDate: '',
			fullName: this.getValueChange('customerName', this.frm.customerName.value),
			gender: gender ? (gender == 'Nữ' ? 'FEMALE' : 'MALE') : '',
			gttt: gtttDiff,
			hoKhau: this.getValueChange('idenAddress', this.frm.idenAddress.value, null, null, null, null, null, null),
			isMarried: marriedStatus == 'Đã kết hôn',
			issueDate: issueDateDiff,
			issuesAddress: issueAddDiff,
			job: this.getValueChange('occupation', this.frm.occupation.value, this.ngSelectType, null, null, this.occupationList$.getValue(), 'nhomNgeId', 'nameEN'),
			mobilePhone: this.getValueChange('mobile', this.contactInfo.controls[0].get('mobile').value, null, 0, null, null, 'mobile', null),
			nationality: this.getValueChange('national', this.frm.national.value, this.ngSelectType),
			ngayNhapCanh: '',
			otherMarried: marriedStatus ? (!['Đã kết hôn', 'Chưa kết hôn'].includes(marriedStatus)) ? marriedStatus : null : null,
			otherQuan: district ? this.districtList.find(ele => ele.districID == this.frm.district.value).name_gb : '',
			otherTinh: province ? this.cityList.find(ele => ele.cityID == this.frm.province.value).name_gb : '',
			otherPhone: '',
			proTitle: this.getValueChange('title', this.frm.title.value, this.ngSelectType, null, null, this.titleList),
			quanHuyen: '',
			soThiThuc: '',
			thuNhap: this.getValueChange('salaryReq', this.frm.salaryReq.value),
			tinhTp: '',
			toDate: '',
			marriedChange: !!marriedStatus,
			ownerBen: this.getValueChange('ownerBen', this.frm.ownerBen.value, this.ngSelectType, null, null, this.ownerBenefitList, null, null),
			purpose: this.getValueChange('purpose', this.frm.purpose.value, this.ngSelectType, null, null, this.purposeList, 'value', 'nameVi')
		};
		console.log('> infor change ', infoChange);
		return infoChange;
	}

	/**
	 * hàm này khoá option select box nếu đã chọn câu hỏi bảo mật rồi
	 * @param nameVi
	 */
	disabledOptionQ(nameVi: string) {
		for (const value of this.mapSelectedQuestion.values()) {
			if (value == nameVi) {
				return true;
			}
		}
		return false;
	}

	onChangeQuestion(i: number, event: any) {
		if (event) {
			const old = this.mapSelectedQuestion.get(i);
			if (old == event) {
				this.mapSelectedQuestion.delete(i);
				this.questionAnswer.controls[i].get('question').setValue(null);
			} else {
				this.mapSelectedQuestion.set(i, event);
			}
		}
	}

	/**
	 * hàm này viêt riêng để so sánh sự thay đổi câu hỏi và câu trả lời bảo mật
	 *
	 * @param question
	 * @param answer
	 * @param type
	 * @return trả về chuỗi giá trị cũ nếu bị thay đổi
	 */
	compareValueQuestion(question: string, answer: string, type: string, index: number): string {
		const questions = this.questionAnswer.value.reduce((acc, next) => {
			return acc.concat(next.question);
		}, []);
		const custInfoT24 = this.customerService.customerInfoT24$.getValue();
		if (custInfoT24) {
			const securityQ: any[] = custInfoT24.securityQuestions;
			const securityQArr = custInfoT24.securityQuestions.reduce((acc, next) => {
				return acc.concat(next.question);
			}, []);
			if (securityQ && securityQ.length > 0) {
				// Tìm kiếm vị trí của câu hỏi
				const idx = securityQ.findIndex(ele => ele.question == question);
				if (idx > -1) { // Nếu câu hỏi tồn tại rồi
					if (answer != securityQ[idx].answer) {
						if (type == 'a') {
							return securityQ[idx].answer;
						}
					}
				} else {
					// Xet xem cau hoi cu co con khong
					if (securityQArr.length == 1) {
						if (!questions.includes(securityQArr[0]) && index == 0) {
							if (type == 'a') {
								return securityQ[0].answer;
							}
							return securityQArr[0];
						}
					}
					if (securityQArr.length == 2 && questions.length == 1) {
						if (!securityQArr.includes(questions[0]) && index == 0) {
							if (type == 'a') {
								return securityQ[0].answer;
							}
							return securityQArr[0];
						}
					}

				}
			}
		}
		return '';
	}

	mappingSecurQToHashMap(securityQs: any[]) {
		for (let i = 0; i < securityQs.length; i++) {
			this.mapSelectedQuestion.set(i, securityQs[i].question);
		}
	}

	bindingNational(national: string, otherNational: string) {
		let listNational = [];
		let listOther = [];
		listNational.push(national);
		if (otherNational) {
			listOther = otherNational.split('#');

			listOther.forEach(nation => {
				listNational.push(nation);
			});
		}
		return listNational;

	}

	bindingTax(tax: string, separator: string) {
		if (!this.taxs) {
			this.customerForm.addControl('taxs', this.fb.array([]));
		}
		if (tax) {
			this.taxs.removeAt(0);
			let customerObjectTax = tax.split(separator);
			customerObjectTax.map(item => {
				this.taxs.push(this.newTax(item));
			});
		} else {
			this.taxs.push(this.newTax());
		}
	}

	bindingFax(fax: string, separator: string) {
		if (!this.faxs) {
			this.customerForm.addControl('faxs', this.fb.array([]));
		}
		if (fax) {
			this.faxs.removeAt(0);
			const customerObjectfax1 = fax.split(separator);
			customerObjectfax1.map(item => {
				this.faxs.push(this.newFax(item));
			});
		} else {
			this.faxs.push(this.newFax());
		}
	}

	bindingRealtionCode(relation: any[]) {
		if (!this.relates) {
			this.customerForm.addControl('relates', this.fb.array([]));
		}
		if (relation) {
			relation.forEach(element => {
				this.relates.push(this.newRelate(element));
			});
		}
	}

	/**
	 *
	 * remove formarray cu
	 * @param formArray
	 */
	clearFormArray(formArray: FormArray) {
		while (formArray.length) {
			formArray.removeAt(0);
		}
	}

	checkBoxSameAddress() {
		const city = this.cityList.find(city => city.cityID == this.frm.province.value).name_gb;
		const district = this.districtList.find(district => district.districID == this.frm.district.value).name_gb;
		const address = this.frm.stress.value + ', ' + this.frm.town.value + ', ' + district + ', ' + city;
		const t24Adrees = this.frm.idenAddress.value;
		if (safeRemoveAllSpace(address) == safeRemoveAllSpace(t24Adrees)) {
			this.isSameCheckbox = true;
		}
	}

	checkAge() {
		this.invalidDate = moment(this.frm.birthday.value).startOf('d').isAfter(moment(this.maxDate).startOf('d'));
		return this.invalidDate;
	}
}
