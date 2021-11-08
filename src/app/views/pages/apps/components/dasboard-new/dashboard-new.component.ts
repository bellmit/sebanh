import {Component, HostListener, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {Chart} from 'angular-highcharts';
import {EnquiryModel} from '../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../model/body-request-enquiry-model';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommonService} from '../../../../common-service/common.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import * as Highcharts from 'highcharts';
import {removeUTF8} from '../../../../../shared/model/remove-UTF8';
import {SeriesOptionsType} from 'highcharts';
import {Options} from 'highcharts';
import {NgbModal, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
// @ts-ignore
import {DatePipe} from '@angular/common';
import {formatDate, formatDate2} from '../../../../../shared/util/date-format-ultils';
import {finalize, map} from 'rxjs/operators';
import {
	AUTHORISER_SEATELLER,
	CACHE_CO_CODE, CODE_OK, DATA_FROM_DASHBOARD, DATA_SAVE_FROM_DASHBOARD,
	DELETED, INPUTTER_SEATELLER,
	LIST_SLA_BY_USER_GROUP, MILLISECOND_1_MINUTE, SLA_BUSINESS_DETAIL, SLA_BUSINESS_GROUP, SLA_CONFIG_CACHE, STATUS_BODY_RES,
	STATUS_OK, USERNAME_CACHED,
} from '../../../../../shared/util/constant';

import {ProductTypePipe} from '../../../../../core/_base/layout/pipes/product.pipe';
import {ComboTypePipe} from '../../../../../core/_base/layout/pipes/combo-type.pipe';
import {StatusPipe} from '../../../../../core/_base/layout/pipes/status.pipe';
import {AppConfigService} from '../../../../../app-config.service';
import {HttpClient} from '@angular/common/http';
import {
	COMBO1,
	COMBO1_EX,
	COMBO2,
	COMBO2_EX,
	COMBO3,
	COMBO3_EX
} from '../../../../../shared/model/constants/common-constant';
import moment from 'moment';
import {ModalDetailChartComponent} from '../../../../../shared/directives/modal-common/modal-detail-chart/modal-detail-chart.component';
import * as _ from 'lodash';
import {WarningSlaModel} from '../../../../model/warning-sla.model';
import {SLaTimeConfig, SlaTimeConfigByBusiness, SlaTranMdel} from '../query-transactions-report/model/sla-report.model';
import {QueryTransReportService} from '../query-transactions-report/query-trans-report.service';

declare var $: any;

@Component({
	selector: 'kt-dashboard-new',
	templateUrl: './dashboard-new.component.html',
	styleUrls: ['./dashboard-new.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class DashboardNewComponent implements OnInit, OnDestroy {
	circleData: any = [];
	transactions: any = [];
	savedCombos: any = [];
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	transactionByServiceChart: Chart = new Chart();
	rateCompletionSLAChart: Chart = new Chart();

	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	configSLAData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	username: string;

	listCombo: any[] = [];
	listSms: any[] = [];
	listCard: any[] = [];
	listAccount: any[] = [];
	listCustomer: any[] = [];
	listEBank: any[] = [];
	listBalance: any[] = [];
	listSaoKe: any[] = [];

	listComboByUser: any[] = [];
	listSmsByUser: any[] = [];
	listCardByUser: any[] = [];
	listAccountByUser: any[] = [];
	listEbankByUser: any[] = [];
	listCustomerByUser: any[] = [];

	listBalanceByUser: any[] = [];
	listBalanceByAuthoriser: any[] = [];
	listSaoKeByUser: any;
	listSaoKeByAuthoriser: any;

	listComboByAuthoriser: any[] = [];
	listSmsByAuthoriser: any[] = [];
	listCardByAuthoriser: any[] = [];
	listCustomerByAuthoriser: any[] = [];
	listAccountByAuthoriser: any[] = [];
	listEbankByAuthoriser: any[] = [];

	listSlAReach: any[] = [];
	listSlANotReach: any[] = [];

	slaComboTimeConfig;
	slaCombo1TimeConfig;
	slaCombo2TimeConfig;
	slaCombo3TimeConfig;
	slaSupperTimeConfig;

	SPDV_SLATimeConfig;
	smsSlaTimeConfig;
	cardSlaTimeConfig;
	eBankSlaTimeConfig;
	customerinfoSlaTimeConfig;
	accountSlaTimeConfig;

	numberOfTransactionsReachedSLA: number = 0;
	ratioReachedSLA: number = 0;
	arr = [];

	// init array chart
	arrChart = [
		{
			id: 1,
			type: 'CARD',
			totalTransactions: 0
		},
		{
			id: 2,
			type: 'ACCOUNT',
			totalTransactions: 0
		},
		{
			id: 3,
			type: 'EBANK',
			totalTransactions: 0
		},
		{
			id: 4,
			type: 'COMBO',
			totalTransactions: 0
		},
		{
			id: 5,
			type: 'SMS',
			totalTransactions: 0
		},
		{
			id: 6,
			type: 'CUSTOMER',
			totalTransactions: 0
		},
		{
			id: 8,
			type: 'OTHERS',
			totalTransactions: 0
		},
		{
			id: 9,
			type: 'INSODU_TK',
			totalTransactions: 0
		}
	];

	sixJarsPro = [
		{name: 'card', color: 'pink', id: 1},
		{name: 'account', color: 'black', id: 2},
		{name: 'ebank', color: 'gray', id: 3},
		{name: 'combo', color: 'green', id: 4},
		{name: 'sms', color: 'purple', id: 5},
		{name: 'customer', color: 'orange', id: 6},
		{name: 'other', color: 'yellow', id: 8},
		{name: 'sodu', color: 'cyan', id: 9},
	];

	circlePro = [
		{name: 'Đúng SLA', color: '#E8E8E8', textColor: 'black', id: 2},
		{name: 'Vượt SLA', color: '#d61817', textColor: 'white', id: 1},
	];

	enableCircleDataLabel: boolean = true;
	browserLang: string;

	data: any;

	searchForm: FormGroup;
	isLoadingData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	selectedObject$: BehaviorSubject<any> = new BehaviorSubject(null);
	selectIndex: number;
	selectedData: any[] = [];
	masterSelected: boolean;
	coCode: string;

	//Sorting
	isIncreaseIndex: boolean = false;
	isIncreaseID: boolean = false;
	isIncreaseCusId: boolean = false;
	isIncreaseStatus: boolean = false;
	isIncreaseTransOpera: boolean = false;
	isIncreaseInputter: boolean = false;
	isIncreaseAuthoriser: boolean = false;
	isIncreaseTimeUpdate: boolean = false;
	isIncreaseGttt: boolean = false;
	isIncreaseIdenType: boolean = false;
	isIncreasePriority: boolean = false;

	//Paging
	page = 1;
	pageSize = 5;
	// pagingSlaTable
	pagingSlaTable = {
		page: 1,
		pageSize: 5
	};

	today = new Date();
	totalTrans: number;

	sub: Subscription;
	// filter by column
	rawData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	filterStatus: string[] = [];
	filterPiority: string[] = [];

	dataGTTT: any[] = [];

	statusForm = this.fb.group({
		statusArray: this.fb.array([]),
	});
	priorityForm = this.fb.group({
		priorityArray: this.fb.array([])
	});

	@HostListener('window:resize', ['$event'])
	onResize(event?) {
		this.getCircleChartData();
		this.getColumnChartData();
	}

	// danh sach cac giao dich sap vuot sla
	listWarningSla$ = new BehaviorSubject<WarningSlaModel[]>([]);
	//user groups inputter + authoriser
	inputterGroupName: string;
	authoriserGroupName: string;

	mapSlaConfig: Map<string, SlaTimeConfigByBusiness> = new Map<string, SlaTimeConfigByBusiness>();
	slaConfig$ = new BehaviorSubject<SLaTimeConfig[]>([]);
	business = this.apiService.business;
	statusTrans = this.apiService.satusTrans;
	statusSLA = this.apiService.satusSLA;

	constructor(public translate: TranslateService,
				private localStorage: LocalStorageService,
				private sessionStorage: SessionStorageService,
				private fb: FormBuilder,
				public commonService: CommonService,
				private toastService: ToastrService,
				private router: Router,
				private config: NgbPaginationConfig,
				private datePipe: DatePipe,
				private productTypePipe: ProductTypePipe,
				private comboTypePipe: ComboTypePipe,
				private statusPipe: StatusPipe,
				private appConfigService: AppConfigService,
				private modalService: NgbModal,
				private apiService: QueryTransReportService,) {

		config.size = 'sm';
		config.boundaryLinks = true;
		this.browserLang = translate.getBrowserLang();
		this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
			this.browserLang = event.lang;
		});

		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);
		this.searchForm = this.fb.group({
			coCode: ['', Validators.required],
			fromDate: [new Date(), Validators.required],
			toDate: [new Date(), Validators.required],
		});

		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		this.inputterGroupName = this.appConfigService.getConfigByKey(INPUTTER_SEATELLER);
		this.authoriserGroupName = this.appConfigService.getConfigByKey(AUTHORISER_SEATELLER);
	}

	ngOnInit() {
		// this.numberOfTransactionsReachedSLA = 0;
		this.checkRight();
		this.getSlaByUserGroup();
		this.sub = this.commonService.groupOwner$.subscribe(res => {
			if (res) {
				this.searchForm.controls.coCode.setValue(res);
				this.localStorage.store(CACHE_CO_CODE, res);
				this.searchData();
				this.getDataSave();
			}
		});

		this.pushDataToArray();
		//--- init chart after load all data
		try {
			$(document).ready(() => {
				this.initAllChart();
			});
		} catch (e) {

		}


		// this.cachedData();
		this.translate.onLangChange.subscribe(() => {
			this.rateCompletionSLAChart = new Chart();
			this.rateCompletionSLAChart.ref = Highcharts.chart('rateCompletionSLAChart', this.buildRateCompletionSLAOptions());
			this.reloadAllChart();
			this.getCircleChartData();
			this.getColumnChartData();
		});
		this.getSlaConfig();

	}

	checkRight(): void {
		console.log(this.accessRightIds, 'rights');
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	ngOnDestroy() {
		this.commonService.isDisplayNotice$.next(false);
		// this.numberOfTransactionsReachedSLA = 0;
		this.sub.unsubscribe();
	}

	getDataSave() {
		let command = 'GET_ENQUIRY';
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'searchComboTemp';
		enquiry.data = {
			fromDate: moment(this.searchForm.controls.fromDate.value).format('DD-MM-YYYY HH:mm:ss'),
			toDate: moment(this.searchForm.controls.toDate.value).format('DD-MM-YYYY HH:mm:ss'),
			coCode: this.localStorage.retrieve(CACHE_CO_CODE),
			inputter: JSON.parse(localStorage.getItem('userProfile')).shortName
		};

		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		// this.isLoadingData$.next(true);
		console.warn(bodyRequest);
		this.commonService.actionGetEnquiryResponseApiSave(bodyRequest)
			.pipe(finalize(() => {
				// this.isLoadingData$.next(false);
			}))
			.subscribe(res => {
				if (res) {
					console.log('RESPONSE GET DATA Save TABLE --------------------------------------------->>>', res);

					this.savedCombos = res.enquiry.product;
					this.sessionStorage.store(DATA_SAVE_FROM_DASHBOARD, this.savedCombos);
					// this.pushDataSaveToArray();

				} else {
					return;
				}
			});
	}

	searchData() {
		// this.ratioReachedSLA = 0;
		// this.numberOfTransactionsReachedSLA = 0;
		this.selectedData = [];
		this.listWarningSla$.next([]);
		this.clearFilter();
		/**
		 * Body request of table data
		 */

		let command = 'GET_ENQUIRY';
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getCombos';
		enquiry.data = {
			fromDate: formatDate(this.searchForm.controls.fromDate.value),
			toDate: formatDate(this.searchForm.controls.toDate.value),
			coCode: this.localStorage.retrieve(CACHE_CO_CODE)
		};

		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.isLoadingData$.next(true);

		this.commonService.actionGetEnquiryResponseApi(bodyRequest)
			.pipe(finalize(() => {
				this.isLoadingData$.next(false);
			}))
			.subscribe(res => {
				console.log('RESPONSE GET DATA TABLE --------------------------------------------->>>', res);

				if (res) {

					this.transactions = res.enquiry.product;
					this.sessionStorage.store(DATA_FROM_DASHBOARD, this.transactions);
					console.log('das============================', this.transactions);
					this.calculateSlaIndex();
					this.pushDataToArray();
					this.initAllChart();

				} else {
					return;
				}
			});
	}

	searchData2() {
		// this.ratioReachedSLA = 0;
		// this.numberOfTransactionsReachedSLA = 0;
		this.selectedData = [];
		this.listWarningSla$.next([]);
		this.clearFilter();
		/**
		 * Body request of table data
		 */

		let command = 'GET_ENQUIRY';
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getAllTransaction';
		enquiry.data = {

			"fromDate": formatDate(this.searchForm.controls.fromDate.value),
			"toDate": formatDate(this.searchForm.controls.toDate.value),
			"coCode": this.localStorage.retrieve(CACHE_CO_CODE),
			"business": "ALL",
			"inputter": !!this.authorisable$.getValue ? null : JSON.parse(localStorage.getItem('userProfile')).shortName,
			"fatca": null
		};

		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.isLoadingData$.next(true);

		this.commonService.actionGetEnquiryResponseApi(bodyRequest)
			.pipe(finalize(() => {
				this.isLoadingData$.next(false);
			}))
			.subscribe(res => {
				console.log('RESPONSE GET DATA TABLE --------------------------------------------->>>', res);

				if (res) {

					this.transactions = res.enquiry.product;
					this.sessionStorage.store(DATA_FROM_DASHBOARD, this.transactions);
					console.log('das============================', this.transactions);
					this.calculateSlaIndex();
					this.pushDataToArray();
					this.initAllChart();

				} else {
					return;
				}
			});
	}
	

	pushDataSaveToArray() {
		if (this.savedCombos && this.savedCombos.length > 0) {
			console.log('this.savedCombos', this.savedCombos);
			this.savedCombos.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.combo.status == 'SAVED' && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}
		console.log('this.arr', this.arr);
	}

	pushDataToArray() {
		this.arr = [];
		/**
		 * Filter length of data for column chart
		 */

		if (this.savedCombos && this.savedCombos.length > 0) {
			console.log('this.savedCombos', this.savedCombos);
			this.savedCombos.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.combo.status == 'SAVED' && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}
		if (this.transactions) {
			this.arrChart.forEach(r => {
				if (r.type == 'INSODU_TK' && this.transactions.listAccountBalance) {
					this.listBalanceByUser = this.transactions.listAccountBalance.filter(r => {
						return (r.status != DELETED && (r.inputter == this.username));
					});
					this.listBalanceByAuthoriser = this.transactions.listAccountBalance.filter(r => {
						return (r.status != DELETED);
					});
					r.totalTransactions = this.transactions.listAccountBalance ? (this.inputtable$.getValue() ? this.listBalanceByUser.length : this.listBalanceByAuthoriser.length) : 0;
				}
				// if (r.type == 'SAO_KE' && this.transactions.listStatement) {
				// 	this.listSaoKeByUser = this.transactions.listStatement.filter(r => {
				// 		return (r.status != DELETED && (r.inputter == this.username));
				// 	});
				// 	this.listSaoKeByAuthoriser = this.transactions.listStatement.filter(r => {
				// 		return (r.status != DELETED);
				// 	});
				// }
				if (r.type == 'CARD' && this.transactions.listCard) {
					this.listCardByUser = this.transactions.listCard.filter(r => {
						return (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username);
					});

					this.listCardByAuthoriser = this.transactions.listCard.filter(r => {
						return (r.status != DELETED);
					});

					r.totalTransactions = this.transactions.listCard ? (this.inputtable$.getValue() ? this.listCardByUser.length : this.listCardByAuthoriser.length) : 0;
				}
				if (r.type == 'ACCOUNT' && this.transactions.listAccount) {
					this.listAccountByUser = this.transactions.listAccount.filter(r => {
						return (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username);
					});

					this.listAccountByAuthoriser = this.transactions.listAccount.filter(r => {
						return (r.status != DELETED);
					});

					r.totalTransactions = this.transactions.listAccount ? (this.inputtable$.getValue() ? this.listAccountByUser.length : this.listAccountByAuthoriser.length) : 0;
				}
				if (r.type == 'EBANK' && this.transactions.listEBank) {
					this.listEbankByUser = this.transactions.listEBank.filter(r => {
						return (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username);
					});

					this.listEbankByAuthoriser = this.transactions.listEBank.filter(r => {
						return (r.status != DELETED);
					});

					r.totalTransactions = this.transactions.listEBank ? (this.inputtable$.getValue() ? this.listEbankByUser.length : this.listEbankByAuthoriser.length) : 0;
				}
				if (r.type == 'COMBO' && this.transactions.listCombo) {
					this.listComboByUser = this.transactions.listCombo.filter(r => {
						return (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username);
					});

					this.listComboByAuthoriser = this.transactions.listCombo.filter(r => {
						return (r.status != DELETED);
					});

					r.totalTransactions = this.transactions.listCombo ? (this.inputtable$.getValue() ? this.listComboByUser.length : this.listComboByAuthoriser.length) : 0;
				}
				if (r.type == 'SMS' && this.transactions.listSms) {
					this.listSmsByUser = this.transactions.listSms.filter(r => {
						return (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username);
					});

					this.listSmsByAuthoriser = this.transactions.listSms.filter(r => {
						return (r.status != DELETED);
					});

					r.totalTransactions = this.transactions.listSms ? (this.inputtable$.getValue() ? this.listSmsByUser.length : this.listSmsByAuthoriser.length) : 0;
				}
				if (r.type == 'CUSTOMER' && this.transactions.listCustomer) {
					this.listCustomerByUser = this.transactions.listCustomer.filter(r => {
						return (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username);
					});

					this.listCustomerByAuthoriser = this.transactions.listCustomer.filter(r => {
						return (r.status != DELETED);
					});

					r.totalTransactions = this.transactions.listCustomer ? (this.inputtable$.getValue() ? this.listCustomerByUser.length : this.listCustomerByAuthoriser.length) : 0;
				}

				let totalCard = this.transactions.listCard ? (this.inputtable$.getValue() ? this.listCardByUser.length : this.listCardByAuthoriser.length) : 0;
				let totalAccount = this.transactions.listAccount ? (this.inputtable$.getValue() ? this.listAccountByUser.length : this.listAccountByAuthoriser.length) : 0;
				let totalSms = this.transactions.listSms ? (this.inputtable$.getValue() ? this.listSmsByUser.length : this.listSmsByAuthoriser.length) : 0;
				let totalEBank = this.transactions.listEBank ? (this.inputtable$.getValue() ? this.listEbankByUser.length : this.listEbankByAuthoriser.length) : 0;
				let totalCustomer = this.transactions.listCustomer ? (this.inputtable$.getValue() ? this.listCustomerByUser.length : this.listCustomerByAuthoriser.length) : 0;
				let totalCombo = this.transactions.listCombo ? (this.inputtable$.getValue() ? this.listComboByUser.length : this.listComboByAuthoriser.length) : 0;
				let totalBalance = this.transactions.listAccountBalance ? (this.inputtable$.getValue() ? this.listBalanceByUser.length : this.listBalanceByAuthoriser.length) : 0;
				// let totalStatement = this.transactions.listStatement ? (this.inputtable$.getValue() ? this.listSaoKeByUser.length : this.listSaoKeByAuthoriser.length) : 0;
				this.totalTrans = totalCard + totalAccount + totalSms + totalEBank + totalCustomer + totalCombo + totalBalance;// + totalStatement;
			});
		}

		/**
		 * Filter data and push to array
		 */
		if (this.transactions && this.transactions.listAccountBalance != null) {
			this.transactions.listAccountBalance.filter(r => r.type = 'INSODU_TK');
			this.transactions.listAccountBalance.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && r.inputter == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}

			});
		}
		// if (this.transactions && this.transactions.listStatement != null) {
		// 	this.transactions.listStatement.filter(r => r.type = 'SAO_KE');
		// 	this.transactions.listStatement.forEach(r => {
		// 		if (this.inputtable$.getValue()) {
		// 			if (r.status != DELETED && r.inputter == this.username) {
		// 				this.arr.push(r);
		// 			}
		// 		}
		//
		// 		if (this.authorisable$.getValue()) {
		// 			if (r.status != DELETED) {
		// 				this.arr.push(r);
		// 			}
		// 		}
		//
		// 	});
		// }

		if (this.transactions && this.transactions.listEBank != null) {
			this.transactions.listEBank.filter(r => r.type = 'ebank');
			this.transactions.listEBank.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && r.inputter == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}

			});
		}
		if (this.transactions && this.transactions.listCombo != null) {
			this.transactions.listCombo.filter(r => r.type = 'combo');
			this.transactions.listCombo.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}
		if (this.transactions && this.transactions.listSms != null) {
			this.transactions.listSms.filter(r => r.type = 'sms');
			this.transactions.listSms.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}

		if (this.transactions && this.transactions.listCard != null) {
			this.transactions.listCard.filter(r => r.type = 'card');
			this.transactions.listCard.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}
		if (this.transactions && this.transactions.listAccount != null) {
			this.transactions.listAccount.filter(r => r.type = 'account');
			this.transactions.listAccount.forEach(r => {
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}
		if (this.transactions && this.transactions.listCustomer != null) {
			this.transactions.listCustomer.filter(r => r.type = 'customer');
			console.log('this.transactions.listCustomer', this.transactions.listCustomer);

			this.transactions.listCustomer.forEach(r => {
				// this.dataGTTT = this.transactions.listCustomer.iden
				if (this.inputtable$.getValue()) {
					if (r.status != DELETED && (r.combo ? r.combo.inputter : r.inputter) == this.username) {
						this.arr.push(r);
					}
				}

				if (this.authorisable$.getValue()) {
					if (r.status != DELETED) {
						this.arr.push(r);
					}
				}
			});
		}
		this.arr.sort((prev, next) => {
			return moment(this.getTimeUpdate(next), 'DD-MM-YYYY HH:mm:ss').unix() - moment(this.getTimeUpdate(prev), 'DD-MM-YYYY HH:mm:ss').unix();
		});
		this.rawData$.next(this.arr);
		this.showDataToSlaWarning();
	}

	getTimeUpdate(trans: any): string {
		return trans.combo ? trans.combo.timeUpdate : trans.timeUpdate;
	}

	chooseTransaction(data: any) {
		console.log('data', data);
		let routerLinkData: string = '';
		if (data.type == 'combo' || data.combo && data.combo.status == 'SAVED') {
			this.commonService.isUpdateCombo$.next(true);
			let comboType = data.combo.comboType;
			console.log(comboType, 'comboType');
			switch (data.combo.comboType.trim()) {
				case 'COMBO1': {
					routerLinkData = '/pages/combo1';
					break;
				}

				case 'COMBO2': {
					routerLinkData = '/pages/combo2';
					break;
				}

				case 'COMBO3': {
					routerLinkData = '/pages/combo3';
					break;
				}

				case 'COMBO1_EX': {
					routerLinkData = '/pages/ex-combo1';
					break;
				}

				case 'COMBO2_EX': {
					routerLinkData = '/pages/ex-combo2';
					break;
				}

				case 'COMBO3_EX': {
					routerLinkData = '/pages/ex-combo3';
					break;
				}
			}

		} else {
			let actionT24 = data.actionT24;
			switch (data.type) {
				case 'sms':
					this.commonService.isUpdateSMS$.next(true);
					routerLinkData = actionT24 == 'CREATE' ? '/pages/sms' : '/pages/sms';
					break;

				case 'account':
					this.commonService.isUpdateAccount$.next(true);
					routerLinkData = actionT24 == 'CREATE' ? '/pages/account' : '/pages/account';
					break;

				case 'customer':
					// this.commonService.isUpdateCus$.next(true);
					routerLinkData = actionT24 == 'CREATE' ? '/pages/customer-manage' : '/pages/customer-manage';
					break;

				case 'ebank':
					routerLinkData = actionT24 == 'CREATE' ? '/pages/e-bank' : '/pages/e-bank';
					break;

				case 'card':
					routerLinkData = actionT24 == 'CREATE' ? '/pages/card' : '/pages/card';
					break;
				case 'INSODU_TK':
					routerLinkData = '/pages/report/balance';
					break;
				case 'SAO_KE':
					routerLinkData = '/pages/report/statement';
					break;
			}
		}

		this.selectedObject$.next(data);
		this.router.navigateByUrl(routerLinkData, {
			state: {
				data: this.selectedObject$.getValue()
			}
		}).then();
	}

	/**
	 * Sắp xếp các thuộc tính trong bảng
	 * @param property: tên thuộc tính cần sắp xếp
	 */
	sortColumn(property: string) {
		this.page = 1;
		let isIncreaseRow;
		switch (property) {

			case 'index': {
				isIncreaseRow = this.isIncreaseIndex = !this.isIncreaseIndex;
				break;
			}
			case 'id': {
				isIncreaseRow = this.isIncreaseID = !this.isIncreaseID;
				break;
			}
			case 'customerId': {
				isIncreaseRow = this.isIncreaseCusId = !this.isIncreaseCusId;
				break;
			}
			case 'gttt': {
				isIncreaseRow = this.isIncreaseGttt = !this.isIncreaseGttt;
				break;
			}
			case 'priority': {
				isIncreaseRow = this.isIncreasePriority = !this.isIncreasePriority;
				break;
			}
			case 'idenType': {
				isIncreaseRow = this.isIncreaseIdenType = !this.isIncreaseIdenType;
				break;
			}
			case 'transOpera': {
				isIncreaseRow = this.isIncreaseTransOpera = !this.isIncreaseTransOpera;
				break;
			}
			case 'status': {
				isIncreaseRow = this.isIncreaseStatus = !this.isIncreaseStatus;
				break;
			}

			case 'inputter': {
				isIncreaseRow = this.isIncreaseInputter = !this.isIncreaseInputter;
				break;
			}
			case 'authoriser': {
				isIncreaseRow = this.isIncreaseAuthoriser = !this.isIncreaseAuthoriser;
				break;
			}
			case 'timeUpdate': {
				isIncreaseRow = this.isIncreaseTimeUpdate = !this.isIncreaseTimeUpdate;
				break;
			}
		}

		if (property) {
			this.arr = this.arr.sort((previousTransaction, nextTransaction) => {
				let firstItem;
				let secondItem;
				switch (property) {
					case 'gttt': {
						firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.customer ? Number(previousTransaction.customer[property]) : null) : (previousTransaction[property] ? Number(previousTransaction[property]) : null));
						secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.customer ? Number(nextTransaction.customer[property]) : null) : (nextTransaction[property] ? Number(nextTransaction[property]) : null));
						break;
					}

					case 'idenType' : {
						firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.customer ? previousTransaction.customer[property] : null) : (previousTransaction[property] ? previousTransaction[property] : null));
						secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.customer ? nextTransaction.customer[property] : null) : (nextTransaction[property] ? nextTransaction[property] : null));
						break;
					}

					case 'status' : {
						firstItem = removeUTF8(previousTransaction.combo ? this.statusPipe.transform(previousTransaction.combo[property]) : this.statusPipe.transform(previousTransaction[property]));
						secondItem = removeUTF8(nextTransaction.combo ? this.statusPipe.transform(nextTransaction.combo[property]) : this.statusPipe.transform(nextTransaction[property]));
						break;
					}

					case 'transOpera' : {
						firstItem = removeUTF8(previousTransaction.combo ? this.comboTypePipe.transform(previousTransaction.combo[property]) : this.productTypePipe.transform(previousTransaction[property]));
						secondItem = removeUTF8(nextTransaction.combo ? this.comboTypePipe.transform(nextTransaction.combo[property]) : this.productTypePipe.transform(nextTransaction[property]));
						break;
					}

					default: {
						firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.combo[property] ? previousTransaction.combo[property] : null) : (previousTransaction[property] ? previousTransaction[property] : null));
						secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.combo[property] ? nextTransaction.combo[property] : null) : (nextTransaction[property] ? nextTransaction[property] : null));
						break;
					}
				}

				if (isIncreaseRow === true) {
					return (((firstItem ? firstItem : '').toUpperCase().toUpperCase()) > (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;

				} else {
					return ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() > (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;
				}
			});
		} else {
			return;
		}
	}

	/**
	 * Hiển thị các bản ghi trên 1 trang
	 */
	calculateTotalPage() {
		const total = this.page * this.pageSize;
		if (total > this.arr.length) {
			return this.arr.length;
		} else {
			return this.page * this.pageSize;
		}
	}

	/**
	 * Select box check hoặc uncheck all
	 */
	checkUncheckAll() {
		this.selectedData = [];
		for (let i = 0; i < this.arr.length; i++) {
			this.arr[i].isSelected = this.masterSelected;
			if (this.arr[i].isSelected == true) {
				this.selectedData.push(this.arr[i]);
			}
		}
		console.log(this.selectedData, 'all');
	}

	/**
	 * Select box check or uncheck only one
	 */
	isAllSelected(obj: any, event: any) {
		if (event.target.checked == true) {
			this.selectedData.push(obj);
			this.selectedData.filter(r => {
				return r.isSelected = true;
			});
			console.log(this.selectedData);
		} else {
			this.selectedData.splice(this.selectedData.indexOf(obj), 1);
			console.log(this.selectedData);
		}
	}

	/**
	 * Init all chart
	 */
	initChart(): void {
		// transaction service chart
		this.transactionByServiceChart.ref = Highcharts.chart('transactionByServiceChart', this.buildTransactionByServiceOptions());
		// rate completion SLA chart
		this.rateCompletionSLAChart.ref = Highcharts.chart('rateCompletionSLAChart', this.buildRateCompletionSLAOptions());

	}

	/**
	 * Build option chart transaction by services
	 */
	buildTransactionByServiceOptions(): any {
		return {
			chart: {
				type: 'column',
				events: {
					load: function() {
						if (this.series.length < 1) {
							return;
						}
						let points = this.series[0].points;
						points.forEach(function(point) {
							if (point.y == 0) {
								point.update(null, false);
							}
						});
						this.redraw();
					}
				}
			},
			lang: {
				noData: this.translate.instant('FINANCIAL.message.chartNoData'),
				loading: this.translate.instant('FINANCIAL.message.chartLoading')
			},
			tooltip: {
				// pointFormat: '{series.name}: <b>{point.y}</b><br/>',
				pointFormat: '<b>{point.y}</b><br/>',
				valueSuffix: ' GD',
				headerFormat: '',
				style: {
					color: 'white',
					fontWeight: 'bold',
					borderColor: 'red'
				},
				backgroundColor: 'red',
				borderColor: 'red'
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				series: {
					pointWidth: 20,
					cursor: 'pointer',
					dataLabels: {enabled: false},
					showInLegend: true,
					allowPointSelect: false,
					point: {
						events: {
							click: ((chart) => {
								const modalRef = this.modalService.open(ModalDetailChartComponent, {
									size: 'lg',
									centered: true,
								});

								modalRef.componentInstance.rightsId = this.accessRightIds;
								modalRef.componentInstance.chartType = 'column';
								switch (chart.point.color) {
									case 'orange':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listCustomerByUser : this.listCustomerByAuthoriser;
										modalRef.componentInstance.type = 'Khách hàng';
										break;
									case 'gray':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listEbankByUser : this.listEbankByAuthoriser;
										modalRef.componentInstance.type = 'SeANet';
										break;
									case 'pink':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listCardByUser : this.listCardByAuthoriser;
										modalRef.componentInstance.type = 'Thẻ';
										break;
									case 'black':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listAccountByUser : this.listAccountByAuthoriser;
										modalRef.componentInstance.type = 'Tài khoản';
										break;
									case 'green':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listComboByUser : this.listComboByAuthoriser;
										modalRef.componentInstance.type = 'Combo';
										break;
									case 'purple':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listSmsByUser : this.listSmsByAuthoriser;
										modalRef.componentInstance.type = 'SMS';
										break;
									case 'cyan':
										modalRef.componentInstance.contents = this.inputtable$.getValue() ? this.listBalanceByUser : this.listBalanceByAuthoriser;
										modalRef.componentInstance.type = 'Số dư';
										break;
								}
							})
						}
					}
				},

			},
			legend: {
				width: '30%',
				borderRadius: 10,
				// padding: 15,
				backgroundColor: '#E8E8E8',
				enabled: true,
				align: 'right',
				verticalAlign: 'top',
				layout: 'vertical',
				symbolPadding: 0,
				symbolWidth: 0.1,
				symbolHeight: 0.1,
				itemStyle: {'fontWeight': 'normal', fontSize: '13px'},
				useHTML: true,
				labelFormatter: function() {
					// @ts-ignore
					return '<i class="fa fa-square fa-1x mr-2" style="color: ' + this.options.color + ';"></i> ' + this.name;
				}
			},
			title: {text: ''},
			xAxis: {
				labels: {
					enabled: false
				},
				categories: [],
			},
			yAxis: {
				title: false,
			},
			responsive: {
				rules: [{
					condition: {
						maxWidth: 400,
						// minWidth: 900
					},
					chartOptions: {
						legend: {
							enabled: false
						},
						tooltip: {
							pointFormat: '{series.name}: <b>{point.y}</b><br/>',
							// pointFormat: '<b>{point.y}</b><br/>',
							valueSuffix: ' GD',
							headerFormat: '',
							style: {
								color: 'white',
								fontWeight: 'bold',
								borderColor: 'red'
							},
							backgroundColor: 'red',
							borderColor: 'red'
						},
					},
				}]
			},
			series: []
		};
	}

	getColumnChartData() {
		if (this.transactionByServiceChart.ref.series.length > 0) {
			this.transactionByServiceChart.ref.series = [];
		}

		let data: any[] = [];
		let j = 0;

		this.arrChart.filter(val => {
			let trans = this.sixJarsPro.find(s => s.id == val.id);
			let yAxis = Number(val.totalTransactions);
			data.push({name: trans.name, y: yAxis, x: j - 0.1, color: trans.color});
			j++;
		});

		data.forEach(a => {
			let tem: SeriesOptionsType = {
				type: 'column',
				name: this.translate.instant('DASHBOARD.chart.legend.' + a.name),
				data: [a],
				color: a.color,
				custom: {
					title: 'FINANCIAL.label.proportion',
					text: ' '
				}
			};
			this.transactionByServiceChart.ref.addSeries(tem);
			// console.log(tem);
		});
	}

	/**
	 * Build option rate completion SLA
	 */
	buildRateCompletionSLAOptions(): Options {
		return {
			chart: {
				type: 'pie',
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			lang: {
				noData: this.translate.instant('FINANCIAL.message.chartNoData'),
				loading: this.translate.instant('FINANCIAL.message.chartLoading')
			},
			title: {text: ''},
			legend: {
				enabled: false
			},
			credits: {
				enabled: false
			},
			tooltip: {
				enabled: true,
				followPointer: true,
				className: this.translate.currentLang,
				pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>',
				formatter: function(tooltip) {
					if (tooltip.options.className === 'vn' && this.color == '#ddd') {
						return 'Không có dữ liệu để hiển thị';

					} else if (tooltip.options.className === 'en' && this.color == '#ddd') {
						return 'No data to display';
					}

					let t = tooltip.options.className === 'vn' ? 'Tỷ trọng: ' : 'Proportion: ';
					let val = this.point.y.toFixed(1);
					return '<b>' + this.key + '</b><br>' + t + val + '%';
				}
			},
			plotOptions: {
				pie: {
					dataLabels: {
						enabled: true,
						formatter: function() {
							return this.color == '#ddd' ? '' : this.percentage.toFixed(1) + '%';
						},
						distance: -30,
						filter: {
							property: 'percentage',
							operator: '>',
							value: 2
						}
					},
					allowPointSelect: true,
					cursor: 'pointer',
					innerSize: '50%',
					point: {
						events: {
							click: ((chart) => {
								console.log(this.arr, 'arr');
								console.log(this.listSlAReach, 'listSlAReach');
								this.listSlANotReach = _.differenceWith(this.arr, this.listSlAReach, _.isEqual);
								console.log(this.listSlANotReach, 'listSlANotReach');
								const modalRef = this.modalService.open(ModalDetailChartComponent, {
									size: 'lg',
									centered: true,
								});

								modalRef.componentInstance.rightsId = this.accessRightIds;
								modalRef.componentInstance.chartType = 'pie';
								switch (chart.point.color) {
									case '#E8E8E8':
										modalRef.componentInstance.contents = this.listSlAReach;
										modalRef.componentInstance.type = 'Đúng SLA';
										break;
									case '#d61817':
										modalRef.componentInstance.contents = this.listSlANotReach;
										modalRef.componentInstance.type = 'Vượt SLA';
										break;
								}
							})
						}
					},

				}
			},
			series: [],
		};
	}

	getCircleChartData() {
		if (this.rateCompletionSLAChart.ref.series.length > 0) {
			this.rateCompletionSLAChart.ref.series[0].remove();
		}

		let data = this.circleData.map(x => {
			let jar = this.circlePro.find(s => s.id === x.id);
			return {
				nameCustom: '',
				name: x.type,
				custom: {title: 'FINANCIAL.title.' + jar.name},
				color: jar.color,
				textColor: jar.textColor,
				y: Number(x.percent),
			};
		});

		if (data && data.length < 1) {
			this.rateCompletionSLAChart.ref.series = [];
			return;
		}

		if (data.filter(x => x.y > 0).length === 0) {
			this.enableCircleDataLabel = true;
			data.push({
				nameCustom: null,
				name: null,
				textColor: null,
				custom: null,
				color: '#ddd',
				y: 100,
			});
		}
		// this.circleData = data;
		this.rateCompletionSLAChart.ref.addSeries({
			type: 'pie',
			name: this.translate.instant('FINANCIAL.label.proportion'),
			data: data,
			custom: {
				title: 'FINANCIAL.label.proportion',
				text: ' '
			}
		});
	}

	/**
	 * Reload legend chart
	 */
	reloadLegend(chart: Chart) {
		for (let i = 0; i < chart.ref.series.length; i++) {
			let o = chart.ref.series[i].options;
			try {
				o.name = o.custom.text != undefined ? this.translate.instant(o.className) + o.custom.text : this.translate.instant(o.className);
			} catch (e) {
				// console.error(e);
			}
			chart.ref.series[i].update(o);
		}
	}

	/* Update all chart
	*/
	reloadAllChart() {

		this.reloadLegend(this.rateCompletionSLAChart);
		this.reloadPieChart(this.rateCompletionSLAChart);

		let op = this.buildRateCompletionSLAOptions();
		this.transactionByServiceChart.ref.update(this.buildTransactionByServiceOptions(), true);
		this.rateCompletionSLAChart.ref.update(op, true);
	}

	/**
	 * Update pie chart
	 */
	reloadPieChart(chart: Chart) {
		if (!chart || !chart.ref || !chart.ref.series || chart.ref.series.length < 1) {
			this.rateCompletionSLAChart.ref.series = [];
			return;
		}
		chart.ref.series[0].points.forEach(p => {
			p.options.name = this.translate.instant(p.options.custom.title);
		});
		chart.ref.series[0].options.name = this.translate.instant(chart.ref.series[0].options.custom.title);
		chart.ref.series[0].update(chart.ref.series[0].options);
	}

	chartHover(index: number) {
		if (this.rateCompletionSLAChart && this.rateCompletionSLAChart.ref.series.length > 0) {
			this.rateCompletionSLAChart.ref.series[0].points[index].onMouseOver();
		}
	}

	onMouseOver(index: number) {
		$('#table-chart button').removeClass('sb-box-shadow');
		$('#table-chart').removeClass('sb-label-hover');
		$('#btn-' + index).addClass('sb-box-shadow');
		$('#td-' + index).addClass('sb-label-hover');
		if (this.rateCompletionSLAChart && this.rateCompletionSLAChart.ref.series.length > 0) {
			this.rateCompletionSLAChart.ref.series[0].points[index].onMouseOver();
		}
	}

	onMouseOut() {
		$('#table-chart button').removeClass('sb-box-shadow');
		$('#table-chart').removeClass('sb-label-hover');
	}

	initAllChart() {
		this.initChart();
		this.getColumnChartData();
		this.getCircleChartData();
		// this.reloadLegend(this.rateCompletionSLAChart);
	}

	calculateSlaIndex() {
		this.listCombo = this.transactions.listCombo ? this.transactions.listCombo : [];
		this.listSms = this.transactions.listSms ? this.transactions.listSms : [];
		this.listCard = this.transactions.listCard ? this.transactions.listCard : [];
		this.listAccount = this.transactions.listAccount ? this.transactions.listAccount : [];
		this.listCustomer = this.transactions.listCustomer ? this.transactions.listCustomer : [];
		this.listEBank = this.transactions.listEBank ? this.transactions.listEBank : [];
		this.listBalance = this.transactions.listAccountBalance ? this.transactions.listAccountBalance : [];
		this.listSaoKe = this.transactions.listStatement ? this.transactions.listStatement : [];

		console.log('tổng số giao dịch ============>', this.getNumberOfExecutedTransactionOfUser());

		if (this.getNumberOfExecutedTransactionOfUser() > 0) {
			if (this.accessRightIds.includes('I')) {
				this.classifySLAByInputter();
			}

			if (this.accessRightIds.includes('A')) {
				this.classifySLAByAuthoriser();

			}

			try {

				let calculateReachedRatioSLA = (this.numberOfTransactionsReachedSLA
					/ this.getNumberOfExecutedTransactionOfUser()) * 100;
				this.ratioReachedSLA = Number(calculateReachedRatioSLA.toFixed(1));

			} catch (e) {
				console.log(e);
			}

			let outOfSlaRatio = 100 - this.ratioReachedSLA;

			console.log('tỉ lệ vượt SLA ============>', JSON.stringify(outOfSlaRatio));
			console.log('giao dịch đạt sla của user ============>', this.numberOfTransactionsReachedSLA);
			console.log('tổng số ============>', this.getNumberOfExecutedTransactionOfUser());

			console.log('tỉ lệ đúng SLA ============>', this.ratioReachedSLA);

			this.circleData = [
				{
					id: 1,
					type: 'Vượt SLA',
					percent: outOfSlaRatio
				},
				{
					id: 2,
					type: 'Đúng SLA',
					percent: this.ratioReachedSLA
				}

			];
		} else {
			this.circleData = [
				{
					id: 2,
					type: 'không có dũ liệu',
					percent: 0
				},
			];
		}
	}

	getNumberOfExecutedTransactionOfUser() {

		if (this.accessRightIds.includes('I')) {

			const totalCombos = this.listCombo.filter(i => i.combo.inputter == this.username).length;
			const totalSms = this.listSms.filter(i => i.inputter == this.username).length;
			const totalCard = this.listCard.filter(i => i.inputter == this.username).length;
			const totalAccount = this.listAccount.filter(i => i.inputter == this.username).length;
			const totalCustomer = this.listCustomer.filter(i => i.inputter == this.username).length;
			const totalEBank = this.listEBank.filter(i => i.inputter == this.username).length;
			const totalBalance = this.listBalance.filter(i => i.inputter == this.username).length;

			return totalCombos + totalSms + totalCard + totalAccount + totalCustomer + totalEBank + totalBalance;
		}

		if (this.accessRightIds.includes('A')) {

			return this.listCombo.length + this.listSms.length + this.listCard.length
				+ this.listAccount.length + this.listCustomer.length + this.listEBank.length + this.listBalance.length;
		}
	}

	classifySLAByInputter() {
		this.numberOfTransactionsReachedSLA = 0;

		if (this.listCombo != null && this.listCombo.length > 0) {
			this.listCombo.filter(c => c.combo.inputter == this.username).forEach(i => {

				if ((i.combo.comboType == 'COMBO3' || i.combo.comboType == 'COMBO3_EX')
					&& (i.combo.timeSlaInputter <= this.slaCombo3TimeConfig
						? this.slaCombo3TimeConfig : this.slaComboTimeConfig)) {

					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}

				if ((i.combo.comboType == 'COMBO2' || i.combo.comboType == 'COMBO2_EX')
					&& (i.combo.timeSlaInputter <= this.slaCombo2TimeConfig
						? this.slaCombo2TimeConfig : this.slaComboTimeConfig)) {

					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}

				if ((i.combo.comboType == 'COMBO1' || i.combo.comboType == 'COMBO1_EX')
					&& (i.combo.timeSlaInputter <= this.slaCombo1TimeConfig
						? this.slaCombo1TimeConfig : this.slaComboTimeConfig)) {

					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}

		if (this.listSms != null && this.listSms.length > 0) {
			this.listSms.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}

		if (this.listCard != null && this.listCard.length > 0) {
			this.listCard.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}

		if (this.listAccount != null && this.listAccount.length > 0) {
			this.listAccount.filter(s => s.inputter == this.username).forEach(i => {

				if (i.timeSlaInputter <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}

		if (this.listCustomer != null && this.listCustomer.length > 0) {
			this.listCustomer.filter(s => s.inputter == this.username).forEach(i => {
				if (i.timeSlaInputter <= this.customerinfoSlaTimeConfig) {
					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}

		if (this.listEBank != null && this.listEBank.length > 0) {
			this.listEBank.filter(s => s.inputter == this.username).forEach(i => {
				// console.log('ebbbbbbbbbbbb', i)
				if (i.timeSlaInputter <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}

		if (this.listBalance != null && this.listBalance.length > 0) {
			this.listBalance.filter(s => s.inputter == this.username).forEach(i => {
				// console.log('ebbbbbbbbbbbb', i)
				if (i.timeSlaInputter <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
					this.listSlAReach.push(i);
				}
			});
		}
	}

	classifySLAByAuthoriser() {
		this.numberOfTransactionsReachedSLA = 0;

		let currentDateByTimeStamp = new Date().getTime();

		if (this.listCombo != null && this.listCombo.length > 0) {
			this.listCombo.forEach(k => {

				let timeSlaAuth = k.timeSlaAuthorise ? k.timeSlaAuthorise : (currentDateByTimeStamp - Number(k.combo.timeSlaInputter));

				let slaTimeCombo3Config = this.slaCombo3TimeConfig ? this.slaCombo3TimeConfig : this.slaComboTimeConfig;

				if ((k.combo.comboType === COMBO3 || k.combo.comboType == COMBO3_EX) && timeSlaAuth <= slaTimeCombo3Config) {

					this.numberOfTransactionsReachedSLA++;
				}

				let slaTimeCombo2Config = this.slaCombo2TimeConfig ? this.slaCombo2TimeConfig : this.slaComboTimeConfig;

				if ((k.combo.comboType == COMBO2 || k.combo.comboType == COMBO2_EX) && timeSlaAuth <= slaTimeCombo2Config) {

					this.numberOfTransactionsReachedSLA++;
				}

				let slaTimeCombo1Config = this.slaCombo1TimeConfig ? this.slaCombo1TimeConfig : this.slaComboTimeConfig;

				if ((k.combo.comboType == COMBO1 || k.combo.comboType == COMBO1_EX) && timeSlaAuth <= slaTimeCombo1Config) {

					this.numberOfTransactionsReachedSLA++;
				}
			});
		}

		if (this.listSms != null && this.listSms.length > 0) {
			this.listSms.forEach(i => {
				let timeSlaAuth = i.timeSlaAuthorise ? i.timeSlaAuthorise : (currentDateByTimeStamp - i.timeSlaInputter);
				if (timeSlaAuth <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
				}
			});
		}

		if (this.listCard != null && this.listCard.length > 0) {
			this.listCard.forEach(i => {
				let timeSlaAuth = i.timeSlaAuthorise ? i.timeSlaAuthorise : (currentDateByTimeStamp - i.timeSlaInputter);
				if (timeSlaAuth <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
				}
			});
		}

		if (this.listAccount != null && this.listAccount.length > 0) {
			this.listAccount.forEach(i => {
				let timeSlaAuth = i.timeSlaAuthorise ? i.timeSlaAuthorise : (currentDateByTimeStamp - i.timeSlaInputter);
				if (timeSlaAuth <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
				}
			});
		}

		if (this.listCustomer != null && this.listCustomer.length > 0) {
			this.listCustomer.forEach(i => {

				let timeSlaAuth = i.timeSlaAuthorise ? i.timeSlaAuthorise : (currentDateByTimeStamp - i.timeSlaInputter);
				if (timeSlaAuth <= this.customerinfoSlaTimeConfig) {
					this.numberOfTransactionsReachedSLA++;
				}
			});
		}

		if (this.listEBank != null && this.listEBank.length > 0) {
			this.listEBank.forEach(i => {

				let timeSlaAuth = i.timeSlaAuthorise ? i.timeSlaAuthorise : (currentDateByTimeStamp - i.timeSlaInputter);
				if (timeSlaAuth <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
				}
			});
		}

		if (this.listBalance != null && this.listBalance.length > 0) {
			this.listBalance.forEach(i => {

				let timeSlaAuth = i.timeSlaAuthorise ? i.timeSlaAuthorise : (currentDateByTimeStamp - i.timeSlaInputter);
				if (timeSlaAuth <= this.SPDV_SLATimeConfig) {
					this.numberOfTransactionsReachedSLA++;
				}
			});
		}
	}

	getSlaByUserGroup() {

		const cache = this.localStorage.retrieve(LIST_SLA_BY_USER_GROUP);
		if (cache) {
			this.configSLAData$.next(cache);
			this.configSlaTime();
			return;
		}


		let group;
		if (this.accessRightIds.includes('I')) {
			group = this.appConfigService.getConfigByKey('INPUTTER-SEATELLER');
		}

		if (this.accessRightIds.includes('A')) {
			group = this.appConfigService.getConfigByKey('AUTHORISER-SEATELLER');
		}

		let bodyReq = {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'GetListSLAByUserGroup',
				userGroup: group
			}
		};

		this.commonService.getListSlaByUserGroup(bodyReq)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.responseCode == CODE_OK) {
					console.log('getListSlaByUserGroup ::=================>', res.seabRes.body.data);
					this.configSLAData$.next(res.seabRes.body.data);
					this.localStorage.store(LIST_SLA_BY_USER_GROUP, res.seabRes.body.data);
					this.configSlaTime();

				} else if (res.seabRes.body.status == STATUS_BODY_RES.FAILE) {
					const desc = res.seabRes.error ? res.seabRes.error.desc : res.seabRes.body.responseDesc;
					this.toastService.error('Xảy ra lỗi ' + desc, 'Thông báo');
				}
			});
	}

	configSlaTime() {
		const cache = this.localStorage.retrieve(LIST_SLA_BY_USER_GROUP);

		if (cache.length > 0) {

			cache.forEach(i => {
				if (i.businessGroup == 'QLSPDV' && i.businessDetail != null || i.businessDetail != '') {
					this.SPDV_SLATimeConfig = i.standardTime * 60000;
					console.log('QLSPDV sla time ===================:::', i.standardTime);
				}

				if (i.businessGroup == 'QLTTKH' && i.businessDetail != null || i.businessDetail != '') {
					this.customerinfoSlaTimeConfig = i.standardTime * 60000;
					console.log('QLTTKH sla time ===================:::', i.standardTime);
				}

				if (i.businessGroup == SLA_BUSINESS_GROUP.COMBO && i.businessDetail != null || i.businessDetail != '') {
					this.slaComboTimeConfig = i.standardTime * 60000;
					console.log('COMBO sla time ===================:::', i.standardTime);
				}

				if (i.businessGroup == SLA_BUSINESS_GROUP.COMBO && i.businessDetail == SLA_BUSINESS_DETAIL.OPEN_COMBO1) {
					this.slaCombo1TimeConfig = i.standardTime * 60000;
					console.log('OPEN_COMBO1 sla time ===================:::', i.standardTime);
				}

				if (i.businessGroup == SLA_BUSINESS_GROUP.COMBO && i.businessDetail == SLA_BUSINESS_DETAIL.OPEN_COMBO2) {
					this.slaCombo2TimeConfig = i.standardTime * 60000;
					console.log('OPEN_COMBO2 sla time ===================:::', i.standardTime);
				}

				if (i.businessGroup == SLA_BUSINESS_GROUP.COMBO && i.businessDetail == SLA_BUSINESS_DETAIL.OPEN_COMBO3) {
					this.slaCombo3TimeConfig = i.standardTime * 60000;
					console.log('OPEN_COMBO3 sla time ===================:::', i.standardTime);
				}
			});
		}
	}

	//<editor-fold desc="filter data">

	onCheckboxStatusChange(event): void {
		const statusArray: FormArray = this.statusForm.get('statusArray') as FormArray;
		if (event.target.checked) {
			statusArray.push(new FormControl(event.target.value));
		} else if (!event.target.checked) {
			let i: number = 0;
			statusArray.controls.forEach((item: FormControl) => {
				if (item.value == event.target.value) {
					statusArray.removeAt(i);
					return;
				}
				i++;
			});
		}

		this.filterStatus = statusArray.value;
		this.handleFilterData(null, null);
	}

	onCheckboxPriorityChange(event): void {
		const priorityArray: FormArray = this.priorityForm.get('priorityArray') as FormArray;
		if (event.target.checked) {
			priorityArray.push(new FormControl(event.target.value));
		} else if (!event.target.checked) {
			let i: number = 0;
			priorityArray.controls.forEach((item: FormControl) => {
				if (item.value == event.target.value) {
					priorityArray.removeAt(i);
					return;
				}
				i++;
			});
		}

		this.filterPiority = priorityArray.value;
		this.handleFilterData(null, null);
	}

	onShowPopStatus(): void {
		setTimeout(() => {
			const statusArray: FormArray = this.statusForm.get('statusArray') as FormArray;
			statusArray.value.forEach(status => {
				const ele = document.getElementById(status) as HTMLInputElement;
				ele.checked = true;
			});
		}, 50);
	}

	onShowPopPriority(): void {
		setTimeout(() => {
			const priorityArray: FormArray = this.priorityForm.get('priorityArray') as FormArray;
			priorityArray.value.forEach(status => {
				const ele = document.getElementById(status) as HTMLInputElement;
				ele.checked = true;
			});
		}, 50);
	}

	handleFilterData(event, property: string): void {
		let arr = this.rawData$.getValue();
		if (this.filterStatus.length > 0) {
			arr = arr.filter(ele => {
				if (ele.combo) { // neu la combo thi de nguyen
					return this.filterStatus.includes(ele.combo.status);
				} else { // khong phai combo
					if (this.filterStatus.includes('APPROVED_SUCCESS')) { // tuong duong approved
						const filterStatus = this.filterStatus.concat('APPROVED');
						return filterStatus.includes(ele.status);
					}
					if (this.filterStatus.includes('APPROVED')) { // tuong duong voi approve_success o combo
						let filterStatus = this.filterStatus;
						filterStatus = filterStatus.filter(ele => ele != 'APPROVED');
						return filterStatus.includes(ele.status);
					}
					return this.filterStatus.includes(ele.status);
				}

			});
		}
		if (this.filterPiority.length > 0) {
			arr = arr.filter(ele => ele.combo ? this.filterPiority.includes(ele.combo.priority) : this.filterPiority.includes(ele.priority));
		}
		this.arr = arr;
	}

	clearFilter(): void {
		this.filterStatus = [];
		this.filterPiority = [];
		const arr = this.statusForm.get('statusArray') as FormArray;
		arr.clear();
		const arr1 = this.priorityForm.get('priorityArray') as FormArray;
		arr1.clear();
	}

	//</editor-fold desc="filter data">

	//<editor-fold desc="Sla for authorizer 14/10/2021">
	/**
	 * get sla time config
	 */
	getSlaConfig(): void {
		const cache = this.sessionStorage.retrieve(SLA_CONFIG_CACHE);
		if (cache) {
			this.slaConfig$.next(cache);
			this.calculateSlaConfig();
			return;
		}
		let groups = [this.inputterGroupName, this.authoriserGroupName];
		this.apiService.getSlaConfig('A', groups)
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.responseCode == CODE_OK) {
					const rawData = res.seabRes.body.data;
					this.slaConfig$.next(rawData);
					this.sessionStorage.store(SLA_CONFIG_CACHE, rawData);
					this.calculateSlaConfig();
				} else {
					// const desc = res.seabRes.error ? res.seabRes.error.desc : res.seabRes.body.responseDesc;
					// this.commonService.error('Lấy thông tin config sla time không thành công : ' + desc);
				}
			});
	}

	/**
	 * lay du lieu config sla va dua vao Map
	 */
	calculateSlaConfig(): void {
		// for inputter
		const slaTimeInput = this.slaConfig$.getValue().filter(ele => ele.userGroup == this.inputterGroupName);
		// for authoriser
		const slaTimeAuth = this.slaConfig$.getValue().filter(ele => ele.userGroup == this.authoriserGroupName);
		this.business.forEach(business => {
			const slaInput = this.getSlaConfigByBusinessDetail(business.business, business.businessDetail, slaTimeInput);
			const slaAuth = this.getSlaConfigByBusinessDetail(business.business, business.businessDetail, slaTimeAuth);
			const slaConfig: SlaTimeConfigByBusiness = {
				business: business.code,
				slaTimeAuth: slaAuth,
				slaTimeInput: slaInput,
				warningAuth: Math.round(slaAuth * this.getWarningTimeByBusinessDetail(business.business, business.businessDetail, slaTimeAuth) / 100),
				warningInput: Math.round(slaInput * this.getWarningTimeByBusinessDetail(business.business, business.businessDetail, slaTimeInput) / 100),
				percentWarning: this.getWarningTimeByBusinessDetail(business.business, business.businessDetail, slaTimeInput)
			};
			this.mapSlaConfig.set(business.code, slaConfig);
		});

		console.log('>>>>>>> map sla config', this.mapSlaConfig);
	}

	/**
	 * Get sla config
	 * @param business
	 * @param businessDetail
	 * @param sLaTimeConfig
	 */
	getSlaConfigByBusinessDetail(business: string, businessDetail: string, sLaTimeConfig: SLaTimeConfig[]): number {
		const slaGroup = sLaTimeConfig.filter(config => config.businessGroup == business);
		if (!businessDetail) {
			return slaGroup.length ? Number(slaGroup[0].standardTime) * MILLISECOND_1_MINUTE : 0;
		}
		const slaConfig = slaGroup.find(config => config.businessDetail == businessDetail);
		if (slaConfig) {
			return Number(slaConfig.standardTime) * MILLISECOND_1_MINUTE;
		}
		const sla = slaGroup.find(config => (config.businessGroup == business && !config.businessDetail));
		return sla ? Number(sla.standardTime) * MILLISECOND_1_MINUTE : 0;
	};

	/**
	 * get warning time
	 * @param business
	 * @param businessDetail
	 * @param sLaTimeConfig
	 */
	getWarningTimeByBusinessDetail(business: string, businessDetail: string, sLaTimeConfig: SLaTimeConfig[]): number {
		const slaGroup = sLaTimeConfig.filter(config => config.businessGroup == business);
		if (!businessDetail) {
			return slaGroup.length ? Number(slaGroup[0].warningTime) : 0;
		}
		const slaConfig = slaGroup.find(config => config.businessDetail == businessDetail);
		if (slaConfig) {
			return Number(slaConfig.warningTime);
		}
		const sla = slaGroup.find(config => (config.businessGroup == business && !config.businessDetail));
		return sla ? Number(sla.warningTime) : 0;
	};

	showDataToSlaWarning(): void {
		if (this.accessRightIds.includes('A')) {
			const now = new Date().getTime();
			const rawData = this.arr.map(trans => Object.assign({}, trans));
			rawData.forEach(ele => this.updateSlaTime(ele, now));
			const raw = rawData.map(ele => {
				const status = ele.type == 'combo' ? ele.combo.status : ele.status;
				if (status.includes('APPROVED')) {
					return null;
				}
				return {
					id: this.getTransactionId(ele),
					coCode: this.getCoCodeCreateTrans(ele),
					inputter: this.getInputter(ele),
					createdDate: this.getCreatedDate(ele),
					transactionId: this.getTransactionId(ele),
					percentSlaInput: '' + this.getPercentSlaInput(ele),
					restSlaInput: '' + this.getRestSlaInput(ele),
					percentSlaAuth: '' + this.getPercentSlaAuth(ele),
					restSlaAuth: '' + this.getRestSlaAuth(ele),
				};
			});

			this.listWarningSla$.next(raw.filter(ele => ele));
		}
	}

	private getInputter(ele: any) {
		switch (ele.type) {
			case 'combo':
				return ele.combo.inputter;
			case 'INSODU_TK':
				return ele.inputter;
			default:
				return ele.inputter;
		}
	}

	private getCoCodeCreateTrans(ele: any) {
		switch (ele.type) {
			case 'combo':
				return ele.combo.coCode;
			case 'INSODU_TK':
				return ele.coCode;
			default:
				return ele.coCode;
		}
	}

	private getTransactionId(ele: any) {
		switch (ele.type) {
			case 'combo':
				return ele.combo.id.slice(ele.combo.id.indexOf('_') + 1);
			case 'INSODU_TK':
				return ele.accBalId.slice(ele.accBalId.indexOf('_') + 1);
			default:
				return ele.id.slice(ele.id.indexOf('_') + 1);
		}
	}

	private getCreatedDate(ele: any) {
		switch (ele.type) {
			case 'combo':
				return ele.combo.createdTime ? ele.combo.createdTime : ele.combo.timeUpdate;
			case 'INSODU_TK':
				return ele.created;
			default:
				return ele.createdTime ? ele.createdTime : ele.timeUpdate;
		}
	}

	private getPercentSla(ele: any) {
		switch (ele.type) {
			case 'combo':
				if (['COMBO1', 'COMBO1_EX'].includes(ele.combo.comboType)) {
					return this.mapSlaConfig.get('COMBO1').percentWarning;
				}
				if (['COMBO2', 'COMBO2_EX'].includes(ele.combo.comboType)) {
					return this.mapSlaConfig.get('COMBO2').percentWarning;
				}
				return this.mapSlaConfig.get('COMBO3').percentWarning;
			case 'INSODU_TK':
				return 0;//ele.created;
			default:
				return this.mapSlaConfig.get(ele.type.toUpperCase()).percentWarning;
		}
	}

	calculateTotalPageSla() {
		const total = this.pagingSlaTable.page * this.pagingSlaTable.pageSize;
		if (total > this.listWarningSla$.getValue().length) {
			return this.listWarningSla$.getValue().length;
		} else {
			return this.pagingSlaTable.page * this.pagingSlaTable.pageSize;
		}
	}

	private getRestSlaInput(ele: any) {
		switch (ele.type) {
			case 'combo':
				let slaTimeInput = 0;
				if (['COMBO1', 'COMBO1_EX'].includes(ele.combo.comboType)) {
					slaTimeInput = this.mapSlaConfig.get('COMBO1').slaTimeInput;
				} else if (['COMBO2', 'COMBO2_EX'].includes(ele.combo.comboType)) {
					slaTimeInput = this.mapSlaConfig.get('COMBO2').slaTimeInput;
				} else {
					slaTimeInput = this.mapSlaConfig.get('COMBO3').slaTimeInput;
				}
				return Math.round((slaTimeInput - Number(ele.combo.timeSlaInputter)) / MILLISECOND_1_MINUTE);
			case 'INSODU_TK':
				return '';
			default:
				return Math.round((this.mapSlaConfig.get(ele.type.toUpperCase()).slaTimeInput - Number(ele.timeSlaInputter)) / MILLISECOND_1_MINUTE);
		}
	}

	private getRestSlaAuth(ele: any) {
		switch (ele.type) {
			case 'combo':
				let slaTimeAuth = 0;
				if (['COMBO1', 'COMBO1_EX'].includes(ele.combo.comboType)) {
					slaTimeAuth = this.mapSlaConfig.get('COMBO1').slaTimeAuth;
				} else if (['COMBO2', 'COMBO2_EX'].includes(ele.combo.comboType)) {
					slaTimeAuth = this.mapSlaConfig.get('COMBO2').slaTimeAuth;
				} else {
					slaTimeAuth = this.mapSlaConfig.get('COMBO3').slaTimeAuth;
				}
				return Math.round((slaTimeAuth - Number(ele.combo.timeSlaAuthorise)) / MILLISECOND_1_MINUTE);
			case 'INSODU_TK':
				return '';
			default:
				return Math.round((this.mapSlaConfig.get(ele.type.toUpperCase()).slaTimeAuth - Number(ele.timeSlaAuthorise)) / MILLISECOND_1_MINUTE);
		}
	}

	private getPercentSlaAuth(ele: any) {
		switch (ele.type) {
			case 'combo':
				let slaTimeAuth = 0;
				if (['COMBO1', 'COMBO1_EX'].includes(ele.combo.comboType)) {
					slaTimeAuth = this.mapSlaConfig.get('COMBO1').slaTimeAuth;
				} else if (['COMBO2', 'COMBO2_EX'].includes(ele.combo.comboType)) {
					slaTimeAuth = this.mapSlaConfig.get('COMBO2').slaTimeAuth;
				} else {
					slaTimeAuth = this.mapSlaConfig.get('COMBO3').slaTimeAuth;
				}
				return Math.round((Number(ele.combo.timeSlaAuthorise) / slaTimeAuth) * 100);
			case 'INSODU_TK':
				return '';
			default:
				return Math.round((Number(ele.timeSlaAuthorise) / this.mapSlaConfig.get(ele.type.toUpperCase()).slaTimeAuth) * 100);
		}
	}

	private getPercentSlaInput(ele: any) {
		switch (ele.type) {
			case 'combo':
				let slaTimeInput = 0;
				if (['COMBO1', 'COMBO1_EX'].includes(ele.combo.comboType)) {
					slaTimeInput = this.mapSlaConfig.get('COMBO1').slaTimeInput;
				} else if (['COMBO2', 'COMBO2_EX'].includes(ele.combo.comboType)) {
					slaTimeInput = this.mapSlaConfig.get('COMBO2').slaTimeInput;
				} else {
					slaTimeInput = this.mapSlaConfig.get('COMBO3').slaTimeInput;
				}
				return Math.round((Number(ele.combo.timeSlaInputter) / slaTimeInput) * 100);
			case 'INSODU_TK':
				return '';
			default:
				return Math.round((Number(ele.timeSlaInputter) / this.mapSlaConfig.get(ele.type.toUpperCase()).slaTimeInput) * 100);
		}
	}

	private updateSlaTime(ele: any, now) {
		const status = ele.combo ? ele.combo.status : ele.status;
		if (status == 'PENDING') {
			this.updateSlaTimeAuth(ele, now);
		}
		if (status == 'REJECTED') {
			this.updateSlaTimeInput(ele, now);
		}
	}


	/**
	 * cap nhat lai sla time input cho ban ghi
	 * @param tran
	 * @param now
	 */
	private updateSlaTimeInput(tran: any, now: number) {
		switch (tran.type) {
			case 'combo':
				const oldtimeSlaInput = Number(tran.combo.timeSlaInputter) ? Number(tran.combo.timeSlaInputter) : 0;
				const offsetTime = now - new Date(moment(tran.combo.timeUpdate, 'DD-MM-YYYY HH:mm:ss').toDate()).getTime();
				tran.timeSlaInputter = offsetTime + oldtimeSlaInput + '';
				break;
			default:
				const oldtimeSlaInput1 = Number(tran.timeSlaInputter) ? Number(tran.timeSlaInputter) : 0;
				const offsetTime1 = now - new Date(moment(tran.timeUpdate, 'DD-MM-YYYY HH:mm:ss').toDate()).getTime();
				tran.timeSlaInputter = offsetTime1 + oldtimeSlaInput1 + '';
		}
	}

	/**
	 * cap nhat lai slat time auth cho ban ghi
	 * @param tran
	 * @param now
	 */
	private updateSlaTimeAuth(tran: any, now: number) {
		switch (tran.type) {
			case 'combo':
				const oldtimeSlaAuth = Number(tran.combo.timeSlaAuthorise) ? Number(tran.combo.timeSlaAuthorise) : 0;
				const offsetTime = now - new Date(moment(tran.combo.timeUpdate, 'DD-MM-YYYY HH:mm:ss').toDate()).getTime();
				tran.combo.timeSlaAuthorise = offsetTime + oldtimeSlaAuth + '';
				break;
			default:
				const oldtimeSlaAuth1 = Number(tran.timeSlaAuthorise) ? Number(tran.timeSlaAuthorise) : 0;
				const offsetTime1 = now - new Date(moment(tran.timeUpdate, 'DD-MM-YYYY HH:mm:ss').toDate()).getTime();
				tran.timeSlaAuthorise = offsetTime1 + oldtimeSlaAuth1 + '';
		}
	}

	//</editor-fold desc="Sla for authorizer 14/10/2021">
}

