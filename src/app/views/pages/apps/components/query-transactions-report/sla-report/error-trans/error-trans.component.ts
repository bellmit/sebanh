import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {QueryTransReportService} from '../../query-trans-report.service';
import {CommonService} from '../../../../../../common-service/common.service';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {AppConfigService} from '../../../../../../../app-config.service';
import {Router} from '@angular/router';
import {
	AUTHORISER_SEATELLER,
	CACHE_CO_CODE,
	CODE_OK,
	INPUTTER_SEATELLER,
	LIST_GROUP_WITH_NAME, MILLISECOND_1_MINUTE, SLA_CONFIG_CACHE, SLA_ERROR_TRANS_CACHE,
	STATUS_OK
} from '../../../../../../../shared/util/constant';
import {ErrorTranModel, ErrorTransModel, SLaTimeConfig, SlaTimeConfigByBusiness} from '../../model/sla-report.model';
import {BehaviorSubject, Subscription} from 'rxjs';
import moment from 'moment';
import {finalize} from 'rxjs/operators';

@Component({
	selector: 'kt-error-trans',
	templateUrl: './error-trans.component.html',
	styleUrls: ['./error-trans.component.scss', '../sla-report.component.scss']
})
export class ErrorTransComponent implements OnInit, OnDestroy {

	// phan quyen
	// isShowArea$ = new BehaviorSubject<boolean>(false);
	// rightIds: string[] = [];
	// sub: Subscription;
	// first table
	processing$ = new BehaviorSubject<boolean>(false);
	transactions$ = new BehaviorSubject<ErrorTransModel>(null);
	filteredData$ = new BehaviorSubject<ErrorTranModel[]>([]);
	dataTable$ = new BehaviorSubject<ErrorTranModel[]>([]);
	// Paging
	page = 1;
	pageSize = 5;
	// second table
	detailTrans$ = new BehaviorSubject<ErrorTranModel[]>([]);
	slaConfig$ = new BehaviorSubject<SLaTimeConfig[]>([]);
	//Paging
	pageDetail = 1;
	pageSizeDetail = 5;

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
	// statusTrans = this.apiService.satusTrans;
	// statusSLA = this.apiService.satusSLA;

	searchForm = this.fb.group({
		area: ['ALL'],
		branch: ['ALL'],
		business: ['ALL']
	});

	constructor(
		private fb: FormBuilder,
		private apiService: QueryTransReportService,
		private commonService: CommonService,
		private localStorageService: LocalStorageService,
		private sessionStorageService: SessionStorageService,
		private appConfigService: AppConfigService,
		// private router: Router
	) {
		this.inputterGroupName = this.appConfigService.getConfigByKey(INPUTTER_SEATELLER);
		this.authoriserGroupName = this.appConfigService.getConfigByKey(AUTHORISER_SEATELLER);
		// this.rightIds = this.commonService.getRightIdsByUrl(this.router.url);
	}

	ngOnInit() {
		this.sessionStorageService.clear(SLA_ERROR_TRANS_CACHE);
		this.getAllBranch();
		this.getSlaConfig();
		this.onSubmit();
		// this.sub = this.commonService.groupOwner$.subscribe(res => {
		// 	if (res) {
		// 		this.localStorageService.store(CACHE_CO_CODE, res);
		// 		this.checkRole(res);
		// 		this.onSubmit();
		// 	}
		// });
	}

	ngOnDestroy(): void {
		// if (this.sub) {
		// 	this.sub.unsubscribe();
		// }
	}

	// checkRole(branch: string): void {
	// 	if (this.rightIds.includes('A')) {
	// 		this.isShowArea$.next(false);
	// 		this.searchForm.get('branch').setValue(branch);
	// 	} else {
	// 		this.isShowArea$.next(true);
	// 	}
	// }

	onCancel(): void {
		this.searchForm.reset({
			area: 'ALL',
			branch: 'ALL',
			business: 'ALL'
		});
	}

	onSubmit(): void {
		const cache = this.sessionStorageService.retrieve(SLA_ERROR_TRANS_CACHE);
		if (cache) {
			this.transactions$.next(cache);
			this.getDataForTable();
			return;
		}
		this.processing$.next(true);
		const area = this.searchForm.value.area;
		const branch = this.searchForm.value.branch == 'ALL' ? '' : this.searchForm.value.branch;
		const business = this.searchForm.value.business;
		const today = moment(new Date()).format('DD-MM-YYYY');
		this.onSearchData(area, branch, today, today, business);
	}

	/**
	 * call api to get transactions
	 * @param area
	 * @param branch
	 * @param fromDate
	 * @param toDate
	 * @param business
	 */
	onSearchData(area: string, branch: string, fromDate: string, toDate: string, business: string): void {
		this.apiService.getErrorTransactions(branch, fromDate, toDate, business, 'ERROR')
			.pipe(finalize(() => {
				this.processing$.next(false);
				this.getDataForTable();
				// console.log(this.mapSlaConfig);
				// this.calculateDataForChart();
			}))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.responseCode == CODE_OK) {
					this.transactions$.next(res.seabRes.body.enquiry.product);
					this.sessionStorageService.store(SLA_ERROR_TRANS_CACHE, res.seabRes.body.enquiry.product);
				} else {
					const desc = res.seabRes.error ? res.seabRes.error.desc : res.seabRes.body.enquiry.responseDesc;
					this.commonService.error('Truy vấn danh sách giao dịch không thành công ' + desc);
				}
			});
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
					const desc = res.seabRes.error ? res.seabRes.error.desc : res.seabRes.body.responseDesc;
					this.commonService.error('Lấy thông tin config sla time không thành công : ' + desc);
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
	 * create data for show to table
	 */
	getDataForTable(): void {
		const trans = this.transactions$.getValue();
		trans.listSms.forEach(sms => sms.comboType = 'SMS');
		trans.listEbank.forEach(ebank => ebank.comboType = 'EBANK');
		trans.listCustomer.forEach(cust => cust.comboType = 'CUSTOMER');
		trans.listCard.forEach(card => card.comboType = 'CARD');
		trans.listAccount.forEach(acc => acc.comboType = 'ACCOUNT');
		let data: ErrorTranModel[] = [];
		data = data.concat(trans.listCombo).concat(trans.listAccount).concat(trans.listCard).concat(trans.listCustomer).concat(trans.listEbank).concat(trans.listSms);
		console.log(data);
		console.log(this.mapSlaConfig);
		this.updatePercentSLA(data);
		// this.dataTable$.next(data);
		this.filterData(data);
	}

	updatePercentSLA(data: ErrorTranModel[]) {
		data.forEach(tran => {
			const slaConfig = this.mapSlaConfig.get(this.getComboType(tran.comboType));
			if (tran.status == 'ERROR') {
				const percent = Math.round((Number(tran.timeSlaInputter) / slaConfig.slaTimeInput) * 100);
				if (percent) {
					tran.percentSla = `${percent} %`;
				} else {
					tran.percentSla = '';
				}
				// if (Number(tran.timeSlaInputter)) {
				// 	const percent = Math.round(Number(tran.timeSlaInputter))
				// 	tran.percentSla = `${percent} %`;
				// } else {
				// 	tran.percentSla = '';
				// }
			} else {
				const percent = Math.round((Number(tran.timeSlaAuthorise) / slaConfig.slaTimeAuth) * 100);
				if (percent) {
					tran.percentSla = `${percent} %`;
				} else {
					tran.percentSla = '';
				}
			}
		});

	}

	getComboType(src: string): string {
		switch (src) {
			case 'COMBO1':
			case 'COMBO1_EX':
				return 'COMBO1';
				break;
			case 'COMBO2':
			case 'COMBO2_EX':
				return 'COMBO2';
				break;
			case 'COMBO3':
			case 'COMBO3_EX':
				return 'COMBO3';
				break;
			default:
				return src;
		}
	}

	filterData(rawData: ErrorTranModel[]): void {
		const branch = this.searchForm.get('branch').value;
		const business = this.searchForm.get('business').value;
		if (branch != 'ALL') {
			rawData = rawData.filter(err => err.coCode == branch);
		}
		if (business != 'ALL') {
			switch (business) {
				case 'COMBO1':
					rawData = rawData.filter(err => ['COMBO1', 'COMBO1_EX'].includes(err.comboType));
					break;
				case 'COMBO2':
					rawData = rawData.filter(err => ['COMBO2', 'COMBO2_EX'].includes(err.comboType));
					break;
				case 'COMBO3':
					rawData = rawData.filter(err => ['COMBO3', 'COMBO3_EX'].includes(err.comboType));
					break;
				case 'SUPPER':
					rawData = rawData.filter(err => ['SUPPER'].includes(err.comboType));
					break;
				case 'CARD':
					rawData = rawData.filter(err => err.comboType == 'CARD');
					break;
				case 'CUSTOMER':
					rawData = rawData.filter(err => err.comboType == 'CUSTOMER');
					break;
				case 'ACCOUNT':
					rawData = rawData.filter(err => err.comboType == 'ACCOUNT');
					break;
				case 'EBANK':
					rawData = rawData.filter(err => err.comboType == 'EBANK');
					break;
				case 'SMS':
					rawData = rawData.filter(err => err.comboType == 'SMS');
					break;
				default:
					break;
			}
		}
		this.dataTable$.next(rawData);
	}

	/**
	 * branch name
	 * @param cocde
	 */
	getViewBranch(cocode: string) {
		const branch = this.branchs.getValue().find(b => b.code == cocode);
		return branch.code + branch.value;
	}

	/**
	 * get business name
	 * @param comboType
	 */
	getViewBusiness(comboType: string) {
		switch (comboType) {
			case 'COMBO1':
			case 'COMBO1_EX':
				return 'Đăng ký combo 1';
				break;
			case 'COMBO2':
			case 'COMBO2_EX':
				return 'Đăng ký combo 2';
				break;
			case 'COMBO3':
			case 'COMBO3_EX':
				return 'Đăng ký combo 3';
				break;
			case 'SUPPER':
				return 'Gói Super 1';
				break;
			case 'SMS':
				return 'Sms';
				break;
			case 'CARD':
				return 'Thẻ';
				break;
			case 'CUSTOMER':
				return 'Quản lý thông tin KH';
				break;
			case 'EBANK':
				return 'SeANet';
				break;
			case 'ACCOUNT':
				return 'Tài khoản';
				break;
			default:
				return '';
		}
	}

	/**
	 * Hiển thị các bản ghi trên 1 trang page total
	 */
	calculateTotalPage() {
		const total = this.page * this.pageSize;
		if (total > this.dataTable$.getValue().length) {
			return this.dataTable$.getValue().length;
		} else {
			return this.page * this.pageSize;
		}
	}

	/**
	 * Hiển thị các bản ghi trên 1 trang page detail
	 */
	calculateTotalPageDetail() {
		const total = this.pageDetail * this.pageSizeDetail;
		if (total > this.detailTrans$.getValue().length) {
			return this.detailTrans$.getValue().length;
		} else {
			return this.pageDetail * this.pageSizeDetail;
		}
	}

	viewDetail(tran: ErrorTranModel) {
		let errorTrans: ErrorTranModel[] = [];
		if (['COMBO1', 'COMBO1_EX', 'COMBO2', 'COMBO2_EX', 'COMBO3', 'COMBO3_EX'].includes(tran.comboType)) {
			if (tran.card && tran.card.status.includes('ERROR')) {
				errorTrans.push(tran.card);
			}
			if (tran.ebank && tran.ebank.status.includes('ERROR')) {
				errorTrans.push(tran.ebank);
			}
			if (tran.customer && tran.customer.status.includes('ERROR')) {
				errorTrans.push(tran.customer);
			}
			if (tran.account && tran.account.status.includes('ERROR')) {
				errorTrans.push(tran.account);
			}
			if (tran.sms && tran.sms.status.includes('ERROR')) {
				errorTrans.push(tran.sms);
			}
		} else {
			errorTrans.push(tran);
		}
		this.detailTrans$.next(errorTrans);
	}
}
