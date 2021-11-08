// tslint:disable:indent
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {BehaviorSubject, Subscription} from 'rxjs';
import {QueryTransReportService} from '../../query-trans-report.service';
import {CommonService} from '../../../../../../common-service/common.service';
import {finalize} from 'rxjs/operators';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';

import {
	AUTHORISER_SEATELLER, CACHE_CO_CODE,
	CODE_OK,
	INPUTTER_SEATELLER,
	LIST_GROUP_WITH_NAME, MILLISECOND_1_MINUTE, SLA_CONFIG_CACHE, SLA_REALTIME_TRANS_CACHE,
	STATUS_OK
} from '../../../../../../../shared/util/constant';
import {AppConfigService} from '../../../../../../../app-config.service';
import {
	SeriesCircleChart,
	SeriesStackedBarChart, SlaBranchData,
	SlaReportModel, SlaStatusCount,
	SLaTimeConfig,
	SlaTimeConfigByBusiness,
	SlaTranMdel
} from '../../model/sla-report.model';
import moment from 'moment';
import {Router} from '@angular/router';

@Component({
	selector: 'kt-sla-realtime',
	templateUrl: './sla-realtime.component.html',
	styleUrls: ['./sla-realtime.component.scss', '../sla-report.component.scss']
})
export class SlaRealtimeComponent implements OnInit, OnDestroy {

	@ViewChild('semiChart', {static: false}) semiChart;
	@ViewChild('businessChart', {static: false}) businessChart;
	@ViewChild('statusTransChart', {static: false}) statusTransChart;
	@ViewChild('slaCircleChart', {static: false}) slaCircleChart;
	@ViewChild('slaBranchChart', {static: false}) slaBranchChart;
	@ViewChild('slaBusinessChart', {static: false}) slaBusinessChart;

	titleSLAChart: string = '';
	// phan quyen
	isShowArea$ = new BehaviorSubject<boolean>(false);
	rightIds: string[] = [];
	sub: Subscription;
	//
	processing$ = new BehaviorSubject<boolean>(false);
	transactions$ = new BehaviorSubject<SlaReportModel>(null);
	rawTransaction$ = new BehaviorSubject<SlaReportModel>(null);
	slaConfig$ = new BehaviorSubject<SLaTimeConfig[]>([]);

	// variable for semi circle donut chart
	totalTrans$ = new BehaviorSubject<number>(0);
	countOver$ = new BehaviorSubject<number>(0);
	countHalfOver$ = new BehaviorSubject<number>(0);
	// variable for business circle char
	seriesBusiness$ = new BehaviorSubject<SeriesCircleChart[]>([]);
	seriesStatusTrans$ = new BehaviorSubject<SeriesCircleChart[]>([]);
	seriesSla$ = new BehaviorSubject<SeriesCircleChart[]>([]);
	// variable for stacked bar, column chart
	categories$ = new BehaviorSubject<string[]>([]);
	seriesSlaBranch$ = new BehaviorSubject<SeriesStackedBarChart>(null);
	categoriesBusiness$ = new BehaviorSubject<string[]>([]);
	seriesSlaBusiness$ = new BehaviorSubject<SeriesStackedBarChart>(null);

	//user groups inputter + authoriser
	inputterGroupName: string;
	authoriserGroupName: string;

	mapSlaConfig: Map<string, SlaTimeConfigByBusiness> = new Map<string, SlaTimeConfigByBusiness>();

	areas = [
		{
			code: 'ALL',
			value: 'Tất cả'
		}
	];
	branchs = new BehaviorSubject<any[]>([]);
	business = this.apiService.business;
	statusTrans = this.apiService.satusTrans;
	statusSLA = this.apiService.satusSLA;

	searchForm = this.fb.group({
		area: ['ALL'],
		branch: ['ALL'],
		business: ['ALL'],
		user: ['']
	});

	constructor(
		private fb: FormBuilder,
		private apiService: QueryTransReportService,
		private commonService: CommonService,
		private localStorageService: LocalStorageService,
		private sessionStorageService: SessionStorageService,
		private appConfigService: AppConfigService,
		private router: Router
	) {
		this.inputterGroupName = this.appConfigService.getConfigByKey(INPUTTER_SEATELLER);
		this.authoriserGroupName = this.appConfigService.getConfigByKey(AUTHORISER_SEATELLER);
		this.rightIds = this.commonService.getRightIdsByUrl(this.router.url);
	}

	ngOnInit() {
		this.getSlaConfig();
		this.sessionStorageService.clear(SLA_REALTIME_TRANS_CACHE);
		this.getAllBranch();
		this.sub = this.commonService.groupOwner$.subscribe(res => {
			if (res) {
				this.localStorageService.store(CACHE_CO_CODE, res);
				this.sessionStorageService.clear(SLA_REALTIME_TRANS_CACHE);
				this.checkRole(res);
				this.onSubmit();
			}
		});
	}

	ngOnDestroy(): void {
		if (this.sub) {
			this.sub.unsubscribe();
		}
	}

	checkRole(branch: string): void {
		if (this.rightIds.includes('A')) {
			this.isShowArea$.next(false);
			this.searchForm.get('branch').setValue(branch);
		} else {
			this.isShowArea$.next(true);
		}
	}

	onCancel(): void {
		if (this.rightIds.includes('A')) {
			this.searchForm.reset({
				area: 'ALL',
				branch: this.localStorageService.retrieve(CACHE_CO_CODE),
				business: 'ALL'
			});
		} else {
			this.searchForm.reset({
				area: 'ALL',
				branch: 'ALL',
				business: 'ALL'
			});
		}
	}

	onSubmit(): void {
		this.processing$.next(true);
		const area = this.searchForm.value.area;
		const branch = this.searchForm.value.branch == 'ALL' ? '' : this.searchForm.value.branch;
		const business = this.searchForm.value.business;
		const user = this.searchForm.value.user;
		const today = moment(new Date()).format('DD-MM-YYYY');
		// const today = '01-10-2021';
		this.onSearchData(area, branch, today, today, business, user);
	}

	/**
	 * call api to get transactions
	 * @param area
	 * @param branch
	 * @param fromDate
	 * @param toDate
	 * @param business
	 * @param user
	 */
	onSearchData(area: string, branch: string, fromDate: string, toDate: string, business: string, user: string): void {
		this.apiService.getSlaTransactions(branch, fromDate, toDate, business, user, '')
			.pipe(finalize(() => {
				this.processing$.next(false);
				// console.log(this.mapSlaConfig);
				// this.calculateDataForChart();
				this.filterDataByBusiness();
			}))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.responseCode == CODE_OK) {
					this.rawTransaction$.next(res.seabRes.body.enquiry.product);
					this.sessionStorageService.store(SLA_REALTIME_TRANS_CACHE, res.seabRes.body.enquiry.product);
				} else {
					// const desc = res.seabRes.error ? res.seabRes.error.desc : res.seabRes.body.enquiry.responseDesc;
					// this.commonService.error('Truy vấn danh sách giao dịch không thành công ' + desc);
				}
			});
	}

	filterDataByBusiness(): void {
		const businessDetail = this.searchForm.get('business').value;
		const rawData = this.rawTransaction$.getValue();
		let data: SlaReportModel = new class implements SlaReportModel {
			listAccount: SlaTranMdel[];
			listCard: SlaTranMdel[];
			listCombo: SlaTranMdel[];
			listCustomer: SlaTranMdel[];
			listEbank: SlaTranMdel[];
			listSms: SlaTranMdel[];
		};
		if (businessDetail != 'ALL') {
			switch (businessDetail) {
				case 'COMBO1':
					data.listCombo = rawData.listCombo.filter(combo => ['COMBO1', 'COMBO1_EX'].includes(combo.comboType));
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
				case 'COMBO2':
					data.listCombo = rawData.listCombo.filter(combo => ['COMBO2', 'COMBO2_EX'].includes(combo.comboType));
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
				case 'COMBO3':
					data.listCombo = rawData.listCombo.filter(combo => ['COMBO3', 'COMBO3_EX'].includes(combo.comboType));
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
				case 'SUPPER':
					data.listCombo = rawData.listCombo.filter(combo => combo.comboType == 'SUPPER');
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
				case 'CUSTOMER':
					data.listCombo = [] ;
					data.listAccount = [];
					data.listCustomer = rawData.listCustomer;
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
				case 'ACCOUNT':
					data.listCombo = [];
					data.listAccount = rawData.listAccount;
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
				case 'CARD':
					data.listCombo = [];
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = rawData.listCard;
					data.listEbank = [];
					break;
				case 'SEANET':
					data.listCombo = [];
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = rawData.listEbank;
					break;
				case 'SMS':
					data.listCombo = [];
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = rawData.listSms;
					data.listCard = [];
					data.listEbank = [];
					break;
				default:
					data.listCombo = [];
					data.listAccount = [];
					data.listCustomer = [];
					data.listSms = [];
					data.listCard = [];
					data.listEbank = [];
					break;
			}
		} else {
			data = rawData;
		}
		this.transactions$.next(data);
		this.calculateDataForChart();
	}

	/**
	 * get all branch co code
	 */
	getAllBranch(): void {
		const allGroup = this.localStorageService.retrieve(LIST_GROUP_WITH_NAME);
		if (allGroup) {
			const allBranch = allGroup.reduce((acc, next) => {
				if (next.group_id.startsWith('VN')) {
					return acc.concat({code: next.group_id, value: next.group_id});
				}
				return acc;
			}, [{code: 'ALL', value: 'Tất cả'}]);
			allBranch.sort();
			this.branchs.next(allBranch);
			return;
		}
		this.apiService.getGroups()
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.ResponseCode == CODE_OK) {
					const allGroup = res.seabRes.body.enquiry.group;
					this.localStorageService.store(LIST_GROUP_WITH_NAME, allGroup);
				}
			});
	}

	/**
	 * get sla time config
	 */
	getSlaConfig(): void {
		const cache = this.sessionStorageService.retrieve(SLA_CONFIG_CACHE);
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
					this.sessionStorageService.store(SLA_CONFIG_CACHE, rawData);
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
				warningInput: Math.round(slaInput * this.getWarningTimeByBusinessDetail(business.business, business.businessDetail, slaTimeInput) / 100)
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

	/**
	 * Tinh toan gia tri cho bieu do
	 */
	calculateDataForChart(): void {
		// cap nhat gia tri sla time den thoi diem hien tai
		const now = new Date().getTime();
		const listCombo1 = this.updateCalculateTime(this.getListCombo(this.transactions$.getValue().listCombo, ['COMBO1', 'COMBO1_EX']), now, 'COMBO1');
		const listCombo2 = this.updateCalculateTime(this.getListCombo(this.transactions$.getValue().listCombo, ['COMBO2', 'COMBO2_EX']), now, 'COMBO2');
		const listCombo3 = this.updateCalculateTime(this.getListCombo(this.transactions$.getValue().listCombo, ['COMBO3', 'COMBO3_EX']), now, 'COMBO3');
		const listSupper = this.updateCalculateTime(this.getListCombo(this.transactions$.getValue().listCombo, ['SUPPER']), now, 'SUPPER');
		const listEbank = this.updateCalculateTime(this.transactions$.getValue().listEbank, now, 'SEANET');
		const listCard = this.updateCalculateTime(this.transactions$.getValue().listCard, now, 'CARD');
		const listSms = this.updateCalculateTime(this.transactions$.getValue().listSms, now, 'SMS');
		const listCustomer = this.updateCalculateTime(this.transactions$.getValue().listCustomer, now, 'CUSTOMER');
		const listAccount = this.updateCalculateTime(this.transactions$.getValue().listAccount, now, 'ACCOUNT');
		// cum bieu do 1
		this.calculateSemiCircleChat(listCombo1, listCombo2, listCombo3, listEbank, listCard, listSms, listCustomer, listAccount, listSupper);
		// bieu do bao cao theo nghiep vu
		this.calculateBusinessChart(listCombo1, listCombo2, listCombo3, listEbank, listCard, listSms, listCustomer, listAccount, listSupper);
		// bieu do bao cao tinh trang giao dich
		this.calculateStatusTransChart(listCombo1, listCombo2, listCombo3, listEbank, listCard, listSms, listCustomer, listAccount, listSupper);
		// bieu do bao cao tinh trang sla
		this.calculateSlaCircleChart();
		// bieu do sla theo chi nhanh -- Khi chon 1 chi nhanh cu the >>> chuyen sang tinh toan cho user
		const branch = this.searchForm.get('branch').value;
		if (branch == 'ALL') {
			this.calculateSlaByBranch(listCombo1, listCombo2, listCombo3, listEbank, listCard, listSms, listCustomer, listAccount, listSupper);
			this.titleSLAChart = 'SLA theo CN/PGD';
		} else {
			this.calculateSlaByUsers(listCombo1, listCombo2, listCombo3, listEbank, listCard, listSms, listCustomer, listAccount, listSupper);
			this.titleSLAChart = 'SLA theo User';
		}
		// bieu do sla theo nghiep vu
		this.calculateSlaByBusiness(listCombo1, listCombo2, listCombo3, listEbank, listCard, listSms, listCustomer, listAccount, listSupper);
	}

	/**
	 * get transactions by combo type
	 * @param trans
	 * @param comboType
	 */
	getListCombo(trans: SlaTranMdel[], comboType: string[]) {
		return trans.filter(tran => comboType.includes(tran.comboType));
	}

	/**
	 * Tinh toan sla time cho toi thoi diem hien tai
	 * @param listTrans
	 * @param business
	 * @param now
	 */
	updateCalculateTime(rawlistTrans: SlaTranMdel[], now: number, businessDetail: string): SlaTranMdel[] {
		const listTrans = rawlistTrans.filter(ele => ele.status != 'APPROVED');
		listTrans.forEach(tran => {
			if (tran.status == 'PENDING') {
				this.updateSlaTimeAuth(tran, now);
			}
			if (tran.status == 'REJECTED') {
				this.updateSlaTimeInput(tran, now);
			}
		});
		this.updateStatusSla(listTrans, businessDetail);
		console.log(listTrans);
		return listTrans;
	}

	/**
	 * cap nhat lai sla time input cho ban ghi
	 * @param tran
	 * @param now
	 */
	updateSlaTimeInput(tran: SlaTranMdel, now: number) {
		const oldtimeSlaInput = Number(tran.timeSlaInputter);

		const offsetTime = now - new Date(moment(tran.timeUpdate, 'DD-MM-YYYY HH:mm:ss').toDate()).getTime();
		// tran.timeSlaInputter = offsetTime + oldtimeSlaInput + '';
		tran.caltimeSlaInputter = offsetTime + oldtimeSlaInput + '';
		// return offsetTime + oldtimeSlaInput + '';
		// return tran;
	}

	/**
	 * cap nhat lai slat time auth cho ban ghi
	 * @param tran
	 * @param now
	 */
	updateSlaTimeAuth(tran: SlaTranMdel, now: number) {
		const oldtimeSlaAuth = Number(tran.timeSlaAuthorise);
		const offsetTime = now - new Date(moment(tran.timeUpdate, 'DD-MM-YYYY HH:mm:ss').toDate()).getTime();
		// tran.timeSlaAuthorise = offsetTime + oldtimeSlaAuth + '';
		tran.caltimeSlaAuthorise = offsetTime + oldtimeSlaAuth + '';
		// return offsetTime + oldtimeSlaAuth + '';
		// return tran;
	}

	/**
	 * Cap nhat trang thai sla - vuot, sap vuot sla cho cac ban ghi theo nghiep vu
	 * @param trans
	 * @param business
	 */
	updateStatusSla(trans: SlaTranMdel[], businessDetail: string): void {
		const slaConfig = this.mapSlaConfig.get(businessDetail);
		trans.forEach(tran => {
			// if (Number(tran.timeSlaAuthorise) > slaConfig.slaTimeAuth) {
			if (Number(tran.caltimeSlaAuthorise) > slaConfig.slaTimeAuth) {
				tran.isOverSla = true;
				tran.isOverSlaAuth = true;
			}
			// if (Number(tran.timeSlaInputter) > slaConfig.slaTimeInput) {
			if (Number(tran.caltimeSlaInputter) > slaConfig.slaTimeInput) {
				tran.isOverSla = true;
				tran.isOverSlaInputter = true;
			}
			// if (Number(tran.timeSlaInputter) > slaConfig.warningInput) {
			if (Number(tran.caltimeSlaInputter) > slaConfig.warningInput) {
				tran.isHalfOver = true;
				tran.isHalfOverInputter = true;
			}
			// if (Number(tran.timeSlaAuthorise) > slaConfig.warningAuth) {
			if (Number(tran.caltimeSlaAuthorise) > slaConfig.warningAuth) {
				tran.isHalfOver = true;
				tran.isHalfOverAuth = true;
			}
		});
	}

	/**
	 * Tinh toan cho cum bieu do so 1, nua duong tron
	 * output -- tong giao dich, % giao dich vuot sla, % giao dich sap vuot sla
	 * @param listCombo1
	 * @param listCombo2
	 * @param listCombo3
	 * @param listEbank
	 * @param listCard
	 * @param listSms
	 * @param listCustomer
	 * @param listAccount
	 */
	calculateSemiCircleChat(listCombo1: SlaTranMdel[], listCombo2: SlaTranMdel[], listCombo3: SlaTranMdel[], listEbank: SlaTranMdel[],
							listCard: SlaTranMdel[], listSms: SlaTranMdel[], listCustomer: SlaTranMdel[], listAccount: SlaTranMdel[], listSupper: SlaTranMdel[]): void {
		const total = listCombo1.length + listCombo2.length + listCombo3.length + listAccount.length + listCard.length + listCustomer.length + listEbank.length + listSms.length + listSupper.length;
		this.totalTrans$.next(total);
		// get over sla
		const overSlaCombo1 = this.countOverSla(listCombo1);
		const overSlaCombo2 = this.countOverSla(listCombo2);
		const overSlaCombo3 = this.countOverSla(listCombo3);
		const overSupper = this.countOverSla(listSupper);
		const overSlaSeanet = this.countOverSla(listEbank);
		const overSlaCard = this.countOverSla(listCard);
		const overSlaSms = this.countOverSla(listSms);
		const overSlaCustomer = this.countOverSla(listCustomer);
		const overSlaAccount = this.countOverSla(listAccount);
		this.countOver$.next(overSlaCombo1 + overSlaCombo2 + overSlaCombo3 + overSlaSeanet + overSlaCard + overSlaSms + overSlaCustomer + overSlaAccount + overSupper);
		// get half over sla
		const halfSlaCombo1 = this.countHalfOver(listCombo1);
		const halfSlaCombo2 = this.countHalfOver(listCombo2);
		const halfSlaCombo3 = this.countHalfOver(listCombo3);
		const halfSlaSupper = this.countHalfOver(listSupper);
		const halfSlaSeanet = this.countHalfOver(listEbank);
		const halfSlaCard = this.countHalfOver(listCard);
		const halfSlaSms = this.countHalfOver(listSms);
		const halfSlaCustomer = this.countHalfOver(listCustomer);
		const halfSlaAccount = this.countHalfOver(listAccount);
		this.countHalfOver$.next(halfSlaCombo1 + halfSlaCombo2 + halfSlaCombo3 + halfSlaSeanet + halfSlaCard + halfSlaSms + halfSlaCustomer + halfSlaAccount + halfSlaSupper);

		// reload all chart data
		this.semiChart.reloadChart();
	}

	/**
	 * dem so ban ghi vuot sla
	 * @param trans
	 */
	countOverSla(trans: SlaTranMdel[]): number {
		let count = 0;
		trans.forEach(tran => {
			tran.isOverSla && (count++);
		});
		return count;
	}

	/**
	 * dem so ban ghi sap vuot sla
	 * @param trans
	 */
	countHalfOver(trans: SlaTranMdel[]): number {
		let count = 0;
		trans.forEach(tran => {
			(tran.isHalfOver && !tran.isOverSla) && (count++);
		});
		return count;
	}

	/**
	 * Tinh toan cho bieu do cao cao theo nghiep vu
	 * @param listCombo1
	 * @param listCombo2
	 * @param listCombo3
	 * @param listEbank
	 * @param listCard
	 * @param listSms
	 * @param listCustomer
	 * @param listAccount
	 */
	calculateBusinessChart(listCombo1: SlaTranMdel[], listCombo2: SlaTranMdel[], listCombo3: SlaTranMdel[], listEbank: SlaTranMdel[],
						   listCard: SlaTranMdel[], listSms: SlaTranMdel[], listCustomer: SlaTranMdel[], listAccount: SlaTranMdel[], listSupper: SlaTranMdel[]) {
		const data: SeriesCircleChart[] = [
			{// data combo1
				name: this.business[0].value,
				y: listCombo1.length,
				color: this.business[0].color
			},
			{// data combo2
				name: this.business[1].value,
				y: listCombo2.length,
				color: this.business[1].color
			},
			{// data combo3
				name: this.business[2].value,
				y: listCombo3.length,
				color: this.business[2].color
			},
			{// data super
				name: this.business[3].value,
				y: listSupper.length,
				color: this.business[3].color
			},
			{// data Quản lý thông tin KH
				name: this.business[4].value,
				y: listCustomer.length,
				color: this.business[4].color
			},
			{// data 'Tài khoản',
				name: this.business[5].value,
				y: listAccount.length,
				color: this.business[5].color
			},
			{// data Thẻ
				name: this.business[6].value,
				y: listCard.length,
				color: this.business[6].color
			},
			{// data SeANet
				name: this.business[7].value,
				y: listEbank.length,
				color: this.business[7].color
			},
			{// data SMS
				name: this.business[8].value,
				y: listSms.length,
				color: this.business[8].color
			}
		];

		this.seriesBusiness$.next(data);

		this.businessChart.reloadChart();
	}

	/**
	 * Tinh toan cho bieu do cao cao tinh trang giao dich
	 * @param listCombo1
	 * @param listCombo2
	 * @param listCombo3
	 * @param listEbank
	 * @param listCard
	 * @param listSms
	 * @param listCustomer
	 * @param listAccount
	 */
	calculateStatusTransChart(listCombo1: SlaTranMdel[], listCombo2: SlaTranMdel[], listCombo3: SlaTranMdel[], listEbank: SlaTranMdel[],
							  listCard: SlaTranMdel[], listSms: SlaTranMdel[], listCustomer: SlaTranMdel[], listAccount: SlaTranMdel[], listSupper: SlaTranMdel[]) {
		let approved = 0;
		let rejected = 0;
		let pending = 0;

		const raw = listCombo1.concat(listCombo2).concat(listCombo3).concat(listEbank).concat(listCard).concat(listSms).concat(listCustomer).concat(listAccount).concat(listSupper);
		raw.forEach(tran => {
			if (tran.status == 'PENDING') {
				pending++;
			}
			if (tran.status == 'REJECTED') {
				rejected++;
			}
			if (tran.status == 'APPROVED') {
				approved++;
			}
		});


		const data: SeriesCircleChart[] = [
			{// da duyet
				name: this.statusTrans[0].value,
				y: approved,
				color: this.statusTrans[0].color
			},
			{// cho bo xung
				name: this.statusTrans[1].value,
				y: rejected,
				color: this.statusTrans[1].color
			},
			{// cho xu ly
				name: this.statusTrans[2].value,
				y: pending,
				color: this.statusTrans[2].color
			}
		];

		this.seriesStatusTrans$.next(data);

		this.statusTransChart.reloadChart();
	}

	/**
	 * tinh toan cho bieu do tinh trang sla
	 */
	calculateSlaCircleChart() {
		const data: SeriesCircleChart[] = [
			{
				name: this.statusSLA[0].value,
				y: this.totalTrans$.getValue() - this.countOver$.getValue(),
				color: this.statusSLA[0].color
			},
			{
				name: this.statusSLA[1].value,
				y: this.countOver$.getValue(),
				color: this.statusSLA[1].color
			}
		];

		this.seriesSla$.next(data);

		this.slaCircleChart.reloadChart();
	}

	/**
	 * Tinh toan cho bieu do sla theo CN/PGD
	 * @param listCombo1
	 * @param listCombo2
	 * @param listCombo3
	 * @param listEbank
	 * @param listCard
	 * @param listSms
	 * @param listCustomer
	 * @param listAccount
	 */
	calculateSlaByBranch(listCombo1: SlaTranMdel[], listCombo2: SlaTranMdel[], listCombo3: SlaTranMdel[], listEbank: SlaTranMdel[],
						 listCard: SlaTranMdel[], listSms: SlaTranMdel[], listCustomer: SlaTranMdel[], listAccount: SlaTranMdel[], listSupper: SlaTranMdel[]) {
		const rawData = listCombo1.concat(listCombo2).concat(listCombo3).concat(listEbank).concat(listCard).concat(listSms).concat(listCustomer).concat(listAccount).concat(listSupper);
		let series: SlaBranchData[] = [];
		this.branchs.getValue().forEach(branch => {
			const trans = rawData.filter(tran => tran.coCode == branch.code);
			const serie: SlaBranchData = {
				coCode: branch.code,
				trans: trans,
				series: this.countSeriesForTrans(trans)
			};
			series.push(serie);
		});
		series = series.filter(s => s.series);
		// console.log(series);
		const categories = series.reduce((acc, next) => acc.concat(next.coCode), []);
		let inSlas: number[] = [];
		let overSlas: number[] = [];
		let halfOverSlas: number[] = [];
		series.forEach(s => {
			inSlas.push(s.series.inSla);
			overSlas.push(s.series.overSla);
			halfOverSlas.push(s.series.halfOverSla);
		});
		this.categories$.next(categories);
		this.seriesSlaBranch$.next({
			overSla: overSlas,
			halfOverSla: halfOverSlas,
			inSla: inSlas
		});

		this.slaBranchChart.reloadChart();
	}

	/**
	 * dem so ban ghi theo trang thai sla
	 * @param transactions
	 */
	countSeriesForTrans(transactions: SlaTranMdel[]): SlaStatusCount {
		let inSla = 0;
		let halfOverSla = 0;
		let overSla = 0;
		if (transactions.length > 0) {
			transactions.forEach(tran => {
				if (tran.isOverSla) {
					overSla++;
				}
				if (tran.isHalfOver && !tran.isOverSla) {
					halfOverSla++;
				}
				if (!tran.isOverSla && !tran.isHalfOver) {
					inSla++;
				}
			});
			return {
				inSla,
				halfOverSla,
				overSla
			};
		}
		return null;
	}

	/**
	 * Tinh toan cho bieu do sla theo nghiep vu
	 * @param listCombo1
	 * @param listCombo2
	 * @param listCombo3
	 * @param listEbank
	 * @param listCard
	 * @param listSms
	 * @param listCustomer
	 * @param listAccount
	 */
	calculateSlaByBusiness(listCombo1: SlaTranMdel[], listCombo2: SlaTranMdel[], listCombo3: SlaTranMdel[], listEbank: SlaTranMdel[],
						   listCard: SlaTranMdel[], listSms: SlaTranMdel[], listCustomer: SlaTranMdel[], listAccount: SlaTranMdel[], listSupper: SlaTranMdel[]) {
		const categories = this.business.reduce((acc, next) => acc.concat(next.value), []);
		let series: SlaStatusCount[] = [];
		const businessDetail = this.searchForm.get('business').value;
		switch (businessDetail) {
			case 'COMBO1':
				series.push(this.countSeriesForBusiness(listCombo1));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'COMBO2':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listCombo2));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'COMBO3':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listCombo3));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'SUPPER':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listSupper)); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'CUSTOMER':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness(listCustomer));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'ACCOUNT':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listAccount));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'CARD':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listCard));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'SEANET':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listEbank));
				series.push(this.countSeriesForBusiness([]));
				break;
			case 'SMS':
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness([]));
				series.push(this.countSeriesForBusiness(listSms));
				break;
			default:
				series.push(this.countSeriesForBusiness(listCombo1));
				series.push(this.countSeriesForBusiness(listCombo2));
				series.push(this.countSeriesForBusiness(listCombo3));
				series.push(this.countSeriesForBusiness([])); // SUPPER
				series.push(this.countSeriesForBusiness(listCustomer));
				series.push(this.countSeriesForBusiness(listAccount));
				series.push(this.countSeriesForBusiness(listCard));
				series.push(this.countSeriesForBusiness(listEbank));
				series.push(this.countSeriesForBusiness(listSms));
				break;
		}

		let inSlas: number[] = [];
		let overSlas: number[] = [];
		let halfOverSlas: number[] = [];
		series.forEach(s => {
			inSlas.push(s.inSla);
			overSlas.push(s.overSla);
			halfOverSlas.push(s.halfOverSla);
		});
		this.categoriesBusiness$.next(categories);
		this.seriesSlaBusiness$.next({
			overSla: overSlas,
			halfOverSla: halfOverSlas,
			inSla: inSlas
		});

		this.slaBusinessChart.reloadChart();
	}

	/**
	 * dem so ban ghi theo trang thai sla cho business
	 * @param transactions
	 */
	countSeriesForBusiness(transactions: SlaTranMdel[]): SlaStatusCount {
		let inSla = 0;
		let halfOverSla = 0;
		let overSla = 0;
		if (transactions.length > 0) {
			transactions.forEach(tran => {
				if (tran.isOverSla) {
					overSla++;
				}
				if (tran.isHalfOver && !tran.isOverSla) {
					halfOverSla++;
				}
				if (!tran.isOverSla && !tran.isHalfOver) {
					inSla++;
				}
			});
			return {
				inSla,
				halfOverSla,
				overSla
			};
		}
		return {
			overSla: 0,
			halfOverSla: 0,
			inSla: 0,
		};
	}

	/**
	 * Khi chon chi nhanh cu the
	 * Lay ra danh sach cac inputter + authoriser cua chi nhanh
	 * hoi lai BA doan nay -> khi ban ghi dang cho duyet -> ko biet authoriser nao se duyet ban ghi -> ko the lay duoc time sla theo user authorsier
	 */

	/**
	 * Tinh toan cho bieu do sla theo User
	 * @param listCombo1
	 * @param listCombo2
	 * @param listCombo3
	 * @param listEbank
	 * @param listCard
	 * @param listSms
	 * @param listCustomer
	 * @param listAccount
	 */
	calculateSlaByUsers(listCombo1: SlaTranMdel[], listCombo2: SlaTranMdel[], listCombo3: SlaTranMdel[], listEbank: SlaTranMdel[],
						listCard: SlaTranMdel[], listSms: SlaTranMdel[], listCustomer: SlaTranMdel[], listAccount: SlaTranMdel[], listSupper: SlaTranMdel[]) {
		const rawData = listCombo1.concat(listCombo2).concat(listCombo3).concat(listEbank).concat(listCard).concat(listSms).concat(listCustomer).concat(listAccount).concat(listSupper);
		let inputters = rawData.reduce((acc, next) => {
			return acc.includes(next.inputter) ? acc : acc.concat(next.inputter);
		}, []);
		// console.log(inputters);
		let series: SlaBranchData[] = [];
		inputters.forEach(inputter => {
			const trans = rawData.filter(tran => tran.inputter == inputter);
			const serie: SlaBranchData = {
				inputter: inputter,
				trans: trans,
				series: this.countSeriesForInputter(trans)
			};
			series.push(serie);
		});

		// console.log(series);
		const categories = inputters;
		let inSlas: number[] = [];
		let overSlas: number[] = [];
		let halfOverSlas: number[] = [];
		series.forEach(s => {
			inSlas.push(s.series.inSla);
			overSlas.push(s.series.overSla);
			halfOverSlas.push(s.series.halfOverSla);
		});
		this.categories$.next(categories);
		this.seriesSlaBranch$.next({
			overSla: overSlas,
			halfOverSla: halfOverSlas,
			inSla: inSlas
		});

		this.slaBranchChart.reloadChart();
	}

	/**
	 * dem so ban ghi theo trang thai sla cua inputter
	 * @param transactions
	 */
	countSeriesForInputter(transactions: SlaTranMdel[]): SlaStatusCount {
		let inSla = 0;
		let halfOverSla = 0;
		let overSla = 0;
		if (transactions.length > 0) {
			transactions.forEach(tran => {
				if (tran.isOverSlaInputter) {
					overSla++;
				}
				if (tran.isHalfOverInputter && !tran.isOverSlaInputter) {
					halfOverSla++;
				}
				if (!tran.isOverSlaInputter && !tran.isHalfOverInputter) {
					inSla++;
				}
			});
			return {
				inSla,
				halfOverSla,
				overSla
			};
		}
		return null;
	}
}
