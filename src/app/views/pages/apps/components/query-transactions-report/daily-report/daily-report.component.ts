// tslint:disable:indent

import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {LocalStorageService} from 'ngx-webstorage';
import {QueryTransReportService} from '../query-trans-report.service';
import {CommonService} from '../../../../../common-service/common.service';
import moment from 'moment';
import {
	CACHE_CO_CODE,
	HEADER_API_ACCOUNT,
	HEADER_API_REPORT,
	HEADER_API_T24_ENQUIRY,
	SERVER_API_CUST_INFO,
	SEVER_API_REPORT,
	SEVER_API_T24_ENQUIRY,
	USERNAME_CACHED,
} from '../../../../../../shared/util/constant';
import {finalize} from 'rxjs/operators';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {ExportService} from '../../../../../common-service/export.service';
import {AppConfigService} from '../../../../../../app-config.service';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {AccountRequestDTO} from '../../../../../../shared/model/constants/account-requestDTO';
import {formatDate, formatDateReseve} from '../../../../../../shared/util/date-format-ultils';


@Component({selector: 'kt-daily-report',
	templateUrl: './daily-report.component.html',
	styleUrls: ['./daily-report.component.scss']
})
export class DailyReportComponent implements OnInit {
	constructor(
		private fb: FormBuilder,
		private localStorage: LocalStorageService,
		private service: QueryTransReportService,
		public commonService: CommonService,
		private dataPowerService: DataPowerService,
		public exportService: ExportService,
		private appConfigService: AppConfigService
	) {
	}
	reportType = [{nameVi: 'Liệt kê giao dịch trong ngày', value: 'DAILY_TRANSACTION'},
		{nameVi: 'Nhật ký thu chi', value: 'DAILY_STATEMENT'}];

	// SearchForm
	searchForm = this.fb.group({
		type: ['DAILY_STATEMENT', Validators.required],
		fundAccount: ['', Validators.required],
		fromDate: [new Date(), [Validators.required]],
		toDate: [new Date(), [Validators.required]],
	});

	page = 1;
	pageSize = 30;

	listCompany: any [] = [];
	isLoadingTransaction$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	listDataReport$: BehaviorSubject<any[]> = new BehaviorSubject<any>([]);

	today: any = moment(new Date).format('DD/MM/YYYY');
	tableData: any = [];

	// tai khoan quy
	isLoadingCheckFundAccount$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	fundAccountInfo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	fundAccountName$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	soDuKhaDung: number;
	TK_QUY_TAI_QUAY_GIAO_DICH = '10001';

	ngOnInit() {
		this.listCompany = this.localStorage.retrieve('co_code_list').map(item => {
			return item.group_id;
		});
		console.log('listCompany', this.listCompany);
	}

	onFundAccountChange() {
        if (this.frm.fundAccount.value === '') {
			this.fundAccountName$.next('');
		}
	}
	onSearch() {
		this.isLoadingTransaction$.next(true);
		// case transaction chưa làm vì chưa có api
		if (this.searchForm.controls.type.value === 'DAILY_TRANSACTION') {
			const bodyConfig = CustomerRequestDTO.BODY.BODY_DAILY_TRANSACTION;
			const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
			const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
			bodyConfig.enquiry.inputter = this.searchForm.controls.userId.value;
			bodyConfig.enquiry.company = this.searchForm.controls.company.value;
			this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingTransaction$.next(false)))
				.subscribe(res => {
					if (res) {
						this.listDataReport$.next(res.enquiry.seabApiEntryTodaySeabank);
					} else {
						return;
					}
				});
			// case tổng hợp thu chi cuối ngày
		} else if (this.searchForm.controls.type.value === 'DAILY_STATEMENT') {
			const bodyConfig = CustomerRequestDTO.BODY.BODY_DAILY_STATEMENT;
			const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
			const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
			bodyConfig.enquiry.accountId = this.frm.fundAccount.value;
			// định dạng yyyymmdd
			bodyConfig.enquiry.startDate = formatDateReseve(this.frm.fromDate.value);
			bodyConfig.enquiry.endDate = formatDateReseve(this.frm.toDate.value);

			this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingTransaction$.next(false)))
				.subscribe(res => {
					if (res) {
						this.listDataReport$.next(res.enquiry.enqSeabBankStatementApi);
						this.processDataDisplayForm();
					} else {
						return;
					}
				});
			}

	}

	processDataDisplayForm() {
		if (this.listDataReport$.getValue()) {
			if (this.searchForm.controls.type.value === 'DAILY_TRANSACTION') {

				this.tableData = this.listDataReport$.getValue().map(item => ({
					accCredit: item.acc1.trim(),
					accDebit: item.acc2.trim(),
					amount: item.amountLcy.trim(),
					authoriser: item.author.trim(),
					ccy: item.currency.trim(),
					dateTime: item.dateTime.trim(),
					narrative: item.narr,
					tranRef: item.refNo
				}));
				console.log('this.listDataReport$.getValue()', this.tableData);
			} else if (this.searchForm.controls.type.value === 'DAILY_STATEMENT') {
				this.tableData = this.listDataReport$.getValue().map(item => ({
					credit: item.debitAmount.trim(),
					debit: item.creditAmount.trim(),
					detail: item.transDetail.trim(),
					transNo: item.transNo.trim(),
					bangKe: item.mabangke.trim(),
				}));
				console.log('this.listDataReport$.getValue()', this.tableData);
			}
		}
		this.isLoadingTransaction$.next(true);
		const url = this.appConfigService.getConfigByKey(SEVER_API_REPORT);
		const header = this.appConfigService.getConfigByKey(HEADER_API_REPORT);

		// cần sửa tiếp
		const bodyConfig = CustomerRequestDTO.BODY.BODY_DAILY_STATEMENT_REPORT_EXPORT;

		//  account "accountName": "TIEN MAT TAI QUY CHINH CN SGD - VND"
		bodyConfig.report.accountName = this.listDataReport$.value[0].acctName.trim() + ' - ' + this.listDataReport$.value[0].ccy.trim();
		// "accountType": "TK Tien mat quy chinh"
		bodyConfig.report.accountType = this.listDataReport$.value[0].typeAcct.trim();
		// Đơn vị tiền tệ "currency": "VND"
		bodyConfig.report.currency = this.listDataReport$.value[0].ccy.trim();
		// todo lấy từ mã tài khoản quỹ của teller vd VND100010022001 => Cắt chuỗi 4 số sau 10001 là 0022;
		const accountID: string = this.fundAccountInfo.value.accountID;
		const indexStr = accountID.indexOf('10001');
		bodyConfig.report.teller = accountID.substring(indexStr + 5, indexStr + 9 );
		// Thông tin cocode và tên chi nhánh
		const codeList = this.localStorage.retrieve('co_code_list');
		const currCocode = this.localStorage.retrieve('cache_co_code');
		const currCocodeName = codeList.find(code => code.group_id == currCocode).desc;
		bodyConfig.report.cocode = currCocode;
		bodyConfig.report.branch = currCocodeName;

		// thông tin số dư đầu kỳ và số dư cuối kỳ
		const arrData = this.listDataReport$.value;
		bodyConfig.report.closeBalance = this.listDataReport$.value[0].balCuoiKy.trim();
		bodyConfig.report.openBalance = this.listDataReport$.value[0].balDauKy.trim();
        // ngày in thu chi: chọn là start date - định dạng dd/mm/yyyy
		bodyConfig.report.date = moment(this.frm.fromDate.value).format('DD/MM/YYYY');
		bodyConfig.report.tableData = this.tableData;
		// Tổng Thu  "totalCredit": "10,203,590",
		bodyConfig.report.totalCredit = this.listDataReport$.getValue().reduce((sum, obj) => sum + Number(obj.debitAmount.trim()), 0);
		// Tổng Chi "totalDebit": "9,229,352",
		bodyConfig.report.totalDebit = this.listDataReport$.getValue().reduce((sum, obj) => sum + Number(obj.creditAmount.trim()), 0);

		this.dataPowerService.actionGetTransactionResponseReportApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingTransaction$.next(false)))
			.subscribe(res => {
				if (res) {
					const data = res.seabRes.body.report.base64;
					if (this.listDataReport$.getValue()) {
						this.exportService.openPdfFile(data, 'NhatKyThuChi.pdf');
					}				} else {
					return;
				}
			});

	}

	/**
	 * Truy vấn, kiểm tra thông tin tài khoản thu phí theo api authenType: getCURR_INFO-2
	 * Số dư khả dụng của TK quỹ tại quầy = availBal * -1
	 * nếu tài khoản khác category 10001 (category tài khoản quỹ) hoặc loại tiền tệ khác VND thì báo lỗi -> TK ko tồn tại
	 * @param accountId
	 */

	checkFundAccount(accountId: any) {
		if (this.frm.fundAccount.hasError('required')) {
			return;
		}
		this.isLoadingCheckFundAccount$.next(true);
		this.fundAccountInfo.next(null);

		const bodyConfig = AccountRequestDTO.BODY.BODY_GET_CUR_ACCOUNT_INFO2;
		bodyConfig.enquiry.accountID = accountId;

		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCheckFundAccount$.next(false)))
			.subscribe(res => {
				if (res) {
					const accountInfo = res.enquiry.account[0];
					if ((accountInfo.category != this.TK_QUY_TAI_QUAY_GIAO_DICH) || (accountInfo.currency != 'VND')) {
						this.setFundAccountInValidate();
						return;
					}
					const tenTaiKhoan = accountInfo.productName + ' - ' + accountInfo.currency;
					this.fundAccountName$.next(tenTaiKhoan);
					this.frm.fundAccount.setValue(accountInfo.accountID);
					this.fundAccountInfo.next(accountInfo);
					this.frm.fundAccount.setErrors({notExist: false});
					this.frm.fundAccount.markAsTouched();
				} else {
					this.setFundAccountInValidate();
					return;
				}
			});
	}

	/**
	 * update UI tài khoản không hợp lệ
	 */
	setFundAccountInValidate() {
		this.fundAccountName$.next('');
		this.frm.fundAccount.setValue(null);
		this.frm.fundAccount.setErrors({notExist: true});
		this.frm.fundAccount.markAsTouched();
	}

	hasNoFundAccount(): boolean {
		return this.fundAccountName$.value ===  null ||  this.fundAccountName$.value === '' || this.fundAccountName$.value === undefined;
	}

	/**
	 * Lấy search form controls
	 */
	get frm() {
		if (this.searchForm && this.searchForm.controls) {
			return this.searchForm.controls;
		}
	}

	onSubmit() {
	}
}
