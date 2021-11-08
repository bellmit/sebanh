import { LocalStorageService } from 'ngx-webstorage';
import {FormBuilder, Validators} from '@angular/forms';
import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonService} from '../../../../../../common-service/common.service';
import {Router} from '@angular/router';
import {QueryTransReportService} from '../../query-trans-report.service';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {CHARGE_BUSINESS_TYPE, FEE_POLICIES, STATUS_OK, SERVER_API_CUST_INFO, HEADER_API_ACCOUNT, HEADER_API_STATEMENT,
 SERVER_API_SAO_KE, CACHE_CO_CODE, HEADER_SEATELLER, USERNAME_CACHED, NOTIFICATION, GET_TRANSACTION, GET_REPORT} from '../../../../../../../shared/util/constant';
import {AccountInfoModel} from '../../model/statement.model';
import {getRandomTransId} from '../../../../../../../shared/util/random-number-ultils';
import { ChargeInfoComponent } from '../../../charge-info/charge-info.component';
import {ChargeInfoService} from "../../../charge-info/charge-info.service";
import {CustomerRequestDTO} from "../../../../../../../shared/model/constants/customer-requestDTO";
import {AppConfigService} from '../../../../../../../app-config.service';
import {DataPowerService} from "../../../../../../../shared/services/dataPower.service";
import { parseString } from 'xml2js';
import {formartDateYYYYMMDD} from '../../../../../../../shared/util/Utils';
import {ExportService} from './../../../../../../common-service/export.service';
import {ReportService} from "../../../../../../common-service/report.service";
import moment from "moment";
import {DataLinkMinio} from './../../../../../../model/data-link-minio';
import { WebsocketClientService } from "../../../../../../../shared/services/websocket-client.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {TransactionModel} from "../../../../../../model/transaction.model";
import {BodyRequestTransactionModel} from "../../../../../../model/body-request-transaction.model";
import {ModalDeleteComponent} from "../../../../../../../shared/directives/modal-common/modal-delete/modal-delete.component";

@Component({
	selector: 'kt-statement',
	templateUrl: './statement.component.html',
	styleUrls: ['./statement.component.scss']
})
export class StatementComponent implements OnInit {
	@ViewChild(ChargeInfoComponent, {static: false})
	chargeInfoComponent: ChargeInfoComponent;
	submitLoading$ = new BehaviorSubject<boolean>(false)
	bodyRequest: any = {
		command: '',
		transaction: {
			authenType: '',
			data: {}
		}
	};

	feePolicies = FEE_POLICIES;
	chargeBusinessType = CHARGE_BUSINESS_TYPE;
	APPROVED = new BehaviorSubject<boolean>(false);
	isLoading$ = new BehaviorSubject<boolean>(false);
	listAcc = [];
	rightIds: string[] = [];
	today = new Date();
	dataCacheRouter: any;
	accessRightIds: any;
	inputtable$ = new BehaviorSubject<boolean>(false);
	authorisable$ = new BehaviorSubject<boolean>(false);
	isLoadingSubmitStatement$ = new BehaviorSubject<boolean>(false);
	searchForm = this.fb.group({
		account: [null, [Validators.required]],
		customerId: [null,[Validators.required]],
		fromDate: [new Date(), [Validators.required]],
		toDate: [new Date(), [Validators.required]],
		transId: [null],
		priority: ['PRIMARY'],
		reason: [null]
	});
	rejected$ = new BehaviorSubject<boolean>(false)
	constructor(
		private fb: FormBuilder,
		private commonService: CommonService,
		private router: Router,
		private reportService: QueryTransReportService,
		private localStorage: LocalStorageService,
		private chargeInfoService: ChargeInfoService,
		private appConfigService: AppConfigService,
		private dataPowerService: DataPowerService,
		private exportService: ExportService,
		private printReportService: ReportService,
		private websocketClientService: WebsocketClientService,
		private  modalService: NgbModal,

	) {
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);
	}

	ngOnInit() {
		const username = this.localStorage.retrieve('username');
		
		if (window.history.state.data) {
			this.dataCacheRouter = window.history.state.data;
			if (this.dataCacheRouter.status.includes('APPROVED')) {
				this.APPROVED.next(true);
			}

			if (!this.dataCacheRouter.status.includes('APPROVED')) {
				this.getAccountByCustId(this.dataCacheRouter.customerId);
				this.getAccountByCustIdBlur(this.dataCacheRouter.customerId);
				this.getCustomerInfo();
				this.chargeInfoService.customerIdOfAccounts.next(this.dataCacheRouter.customerId);
			}

			this.searchForm.patchValue({
				type: this.dataCacheRouter.type,
				priority: this.dataCacheRouter.priority,
				transId: this.dataCacheRouter.accBalId,
				customerId: this.dataCacheRouter.customerId,
				account: this.dataCacheRouter.accountNumber,
				reason: this.dataCacheRouter.reason ? this.dataCacheRouter.reason : null
			})
			console.log('this.dataCacheRouter', this.dataCacheRouter);
		} else {
			this.genTransId(username)
		}

		if ((this.dataCacheRouter && this.dataCacheRouter.status == 'REJECTED')) {
			this.rejected$.next(true);
		}
		this.checkRight()
	}

	get frm() {
		return this.searchForm.controls;
	}

	checkRight(): void {
		console.log(this.accessRightIds, 'accessRightIds');
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	get isReadonly(): Observable<boolean> {
		if (this.authorisable$.getValue()) {
			return of(true);
		}
		if (this.APPROVED.getValue()) {
			return of(true)
		}
		return of(false);
	}

	genTransId(userId: string): void {
		this.searchForm.get('transId').setValue(getRandomTransId(userId, 'so_phu'));
	}

	isLoadingCustomerInfo$ = new BehaviorSubject<boolean>(false);
	ownerCustomerId$ = new BehaviorSubject<string>(null);
	customerObject: any;
	listAcc$ = new BehaviorSubject<any>(null);
	getCustomerInfo(event?) {
		this.commonService.checkCusExists$.next(true);
		this.ownerCustomerId$.next(null)
		let cusId
		// if (this.dataCacheRouter ? this.dataCacheRouter.customerId : this.searchForm.controls.custId.value) {
		if (event && event.target.value) {
			cusId = event.target.value;
			this.chargeInfoService.customerIdOfAccounts.next(cusId);
		}

		if (!event) {
			cusId = this.dataCacheRouter.customerId;
		}
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = cusId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		if (cusId) {
			this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
				.subscribe(res => {
					if (res) {
						this.customerObject = res.enquiry;
						console.log(this.customerObject, 'customerObject');
						this.ownerCustomerId$.next(res.enquiry.shortName)

					} else {
						this.ownerCustomerId$.next('Mã KH không tồn tại');
						// this.frm.customerId.setValue(null)
						return;
					}
				});
		}
	}


	getAccountByCustIdBlur(event) {
		if (event) {
			console.warn(event);
			this.listAcc$.next(null);
			this.frm.account.setValue(null)
			this.chargeInfoService.customerIdOfAccounts.next(event);
		}
		this.isLoading$.next(true);
		this.reportService.getAccountByCustId(event)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
				this.getDataAccount(this.frm.account.value);
			}))
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.seabGetAcccustSeateller) {
					const rawAcc = res.body.enquiry.seabGetAcccustSeateller;
					console.log('rawAcc',rawAcc);
					this.listAcc$.next(rawAcc);

				}
			});
	}

	getAccountByCustId(custId: string) {
		this.isLoading$.next(true);
		this.reportService.getAccountByCustId(custId)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.seabGetAcccustSeateller) {
					const rawAcc: AccountInfoModel[] = res.body.enquiry.seabGetAcccustSeateller;
					this.listAcc = this.getListAccount(rawAcc);
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
	listGD: any[] = [];
	fullData: any;
	loadingSearch$ = new BehaviorSubject<boolean>(false);
		onSearch() {
			if(this.frm.customerId.value && this.frm.account.value && this.frm.toDate.value && this.frm.fromDate.value) {
				this.loadingSearch$.next(true)
				const url = this.appConfigService.getConfigByKey(SERVER_API_SAO_KE);
				const header = this.appConfigService.getConfigByKey(HEADER_API_STATEMENT);
				const coCode = this.localStorage.retrieve(CACHE_CO_CODE);
				let report = {
					"type":"SK1",
					"language":"EN",
					"account":this.frm.account.value,
					"exportTo":"XML",
					"fromDate": formartDateYYYYMMDD(this.frm.fromDate.value),
					"toDate":formartDateYYYYMMDD(this.frm.toDate.value),
					"coCode": coCode
				}
		
				this.reportService.getDataSaoke(report)
					.pipe(finalize(() => {
						this.loadingSearch$.next(false)
					}))
					.subscribe(res => {
						console.log('res', res);
						if(res && res.body.status == "OK") {
							let resXML = res.body.report.result;
							const t = this;
							parseString(resXML, function (err, result) {
								if(result) {
									t.fullData = result.seabReport;
									t.listGD = result.seabReport && result.seabReport.gds[0].gd;
									console.log('aaaaaaaaaaaassdsa', t.listGD);
									console.log('aaaaaaaaaaaassdsa', t.fullData);
								}
		
							});
						}
					});
			} 
	}

	
	onSubmit() {
		let username = this.localStorage.retrieve(USERNAME_CACHED);
		let coCode = this.localStorage.retrieve(CACHE_CO_CODE);
		console.log('this.bodyRequest.transaction.data', this.bodyRequest.transaction.data);
		if (this.searchForm.invalid) {
			console.log('this.searchForm', this.searchForm);
			this.commonService.error('Vui lòng kiểm tra lại thông tin đã nhập');
			this.searchForm.markAllAsTouched();
			return;
		}
		this.submitLoading$.next(true);
		this.bodyRequest.transaction.authenType = this.dataCacheRouter ? "updateAccountBalance" : "createAccountBalance";
		this.bodyRequest.transaction.data = {
			"accBalId": this.frm.transId.value,
			"accountNumber": this.frm.account.value,
			"ccy": null,
			"coCode": coCode,
			"customerId": this.frm.customerId.value,
			"inputter": username,
			"language": null,
			"reportNumber": null,
			"priority": this.frm.priority.value,
			"type":'SAO_KE',
			"created": moment(Date.now()).format('DD-MM-YYYY hh:mm:ss'),
			"actionT24": CHARGE_BUSINESS_TYPE.STATEMENT,
			isSelectedAllAccount: false,
			chargeInfo: this.chargeInfoComponent.frm.feePolicy.value == "MIEN_PHI" ? null : this.chargeInfoComponent.buildRequestCharge()
		}
			this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
			.pipe(finalize(() => this.submitLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK) {
					this.commonService.success((this.dataCacheRouter) ? `Cập nhật bản ghi ${this.frm.transId.value} thành công` : `Bản ghi ${this.frm.transId.value} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.frm.transId.value, NOTIFICATION.PRODUCT_TYPE.STATEMENT);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	isLoadingReport$ = new BehaviorSubject<boolean>(false)
	processDataDisplayForm() {
		let codeList = this.localStorage.retrieve('co_code_list');
		let currCocode = this.localStorage.retrieve('cache_co_code');
		let currCocodeName = codeList.find(code => code.group_id == currCocode).desc;
		let tableData;
		if(this.listGD.length > 0 && this.listGD[0] != "") {
			tableData = this.listGD.map(trans => (
				{
					balance: trans.balance[0],
					credit: trans.credit[0],
					debit: trans.debit[0],
					detail: trans.details[0],
					transDate: formartDateYYYYMMDD(trans.transactionDate[0]),
					transNo: trans.transactionNo[0] 
				}
			));
		console.log('this.listGD', tableData);
		} else {
			tableData = this.listGD.map(trans => (
				{
					balance: '',
					credit: '',
					debit: '',
					detail: '',
					transDate: '',
					transNo: '' 
				}
			));
		}

		let body: any;
		if (this.searchForm.invalid) {
			this.commonService.error('Vui lòng kiểm tra lại thông tin đã nhập');
			this.searchForm.markAllAsTouched();
			return;
		}
		body = {
			command: GET_REPORT,
			report: {
				"accountName": this.accountSelected.acctName,
                "accountNo":  this.frm.account.value,
                "accountType":this.accountSelected.productGroup,
                "authenType": "getReport_SEATELLER_SAO_KE_SO_PHU",
                "branch": currCocodeName,
                "closeBalance": this.fullData.header[0].closingBalance[0],
                "cocode": currCocode,
                "currency": this.accountSelected.currency,
                "custId": this.frm.customerId.value,
                "exportType": "PDF",
                "fromDate": formartDateYYYYMMDD(this.frm.fromDate.value),
				"toDate": formartDateYYYYMMDD(this.frm.toDate.value),
                "openBalance": this.fullData.header[0].openingBalance[0],
                "saveToMinio": true,
				tableData: tableData,
                "totalCredit": this.fullData.header[0].totalCredit[0],
                "totalDebit": this.fullData.header[0].totalDebit[0],
                "transactionId": this.frm.transId.value
			}
		}
		this.printReportService.getReportForm(body)
		.pipe(finalize(() => this.isLoadingReport$.next(false)))
		.subscribe(res => {

			console.log('report data', res);
			if (res && res.status == STATUS_OK) {
				const data = res.report.base64;
				this.exportService.openPdfFile(data, `Sao kê tài khoản ${this.frm.account.value}}.pdf`);
			}
		});	
	}
openBranch: any;
accountName: any;
accountSelected: any;
	getDataAccount(event) {
		console.log(event);
		this.accountSelected = this.listAcc$.getValue().find(account => account.acct == event);
		if(this.accountSelected) {
			this.openBranch = this.accountSelected.coNameVN;
			this.accountName = this.accountSelected.acctName
		}
	}
	printSuggest() {
		let codeList = this.localStorage.retrieve('co_code_list');
		let currCocode = this.localStorage.retrieve('cache_co_code');
		let currCocodeName = codeList.find(code => code.group_id == currCocode).desc;


		if (this.searchForm.invalid) {
			this.commonService.error('Vui lòng kiểm tra lại thông tin đã nhập');
			this.searchForm.markAllAsTouched();
			return;
		}
		let today = new Date()

		let dataCustomer = {
			fullName: this.customerObject.shortName,
            gttt: this.customerObject.legalID.split('#')[0],
            issueDate: "03/08/2013",
            issuesAddress: this.customerObject.legalIssAuth.split('#')[0],
            currentAddress: "Thon Tien, Xa Duc Tu, Huyen Dong Anh, Tp Ha Noi"
		}
		let body: any;
		body = {
			command: 'GET_REPORT',
			report: {
				authenType: "getRequest_SEATELLER_SAO_KE_SO_PHU",
				transactionId: this.frm.transId.value,
				address: this.customerObject.address.replaceAll('#', ''),
				branch: currCocodeName,
				custId: this.frm.customerId.value,
                exportType: "PDF",
                customerInfo: dataCustomer,
                saveToMinio: false,
                accounts: [
					{
						accountNumber: this.frm.account.value,
					}
				],
                openBranch: this.accountSelected.coNameVN,
                saoKe: {
                    fromDate: formartDateYYYYMMDD(this.frm.fromDate.value),
					toDate:formartDateYYYYMMDD(this.frm.toDate.value),
                },
                soPhu: {
					fromDate: formartDateYYYYMMDD(this.frm.fromDate.value),
					toDate:formartDateYYYYMMDD(this.frm.toDate.value),
                },
                receiver: dataCustomer,
                diaChiChuyenPhat: null,
                phi: this.chargeInfoComponent.frm.totalFeeAmt.value,
                stkThuPhi: this.chargeInfoComponent.frm.feeAccount.value
            }
		}

		this.printReportService.getReportForm(body)
			.pipe(finalize(() => this.isLoadingReport$.next(false)))
			.subscribe(res => {
				if (res && res.status == STATUS_OK && res.responseCode == '00') {
					const dataLinks: DataLinkMinio[] = [];
					const dataLink: DataLinkMinio = new DataLinkMinio();
					const comboTemplate = res.report.data;
					dataLink.fileName = comboTemplate.fileName;
					dataLink.fileType = comboTemplate.fileType;
					dataLink.bucketName = comboTemplate.bucketName;
					dataLink.folder = comboTemplate.folder;
					dataLinks.push(dataLink);
					window.open(`${this.printReportService.minioLink}/${comboTemplate.bucketName}/${comboTemplate.folder}`, '_blank');
					console.warn('>>>>> dataLinks', dataLinks);
					this.websocketClientService.sendMessageToTablet(dataLinks, 'viewForm');
				}
			});
	}

	onBlurFromDate(event) {
		console.log('>>>>> slsls event', event);
		console.log('>>>>> slsls event', event.target);
	}

	resetForm() {

	}
	isLoadingRejectStatement$ = new BehaviorSubject<boolean>(false)
	isLoadingApproveStatement$ = new BehaviorSubject<boolean>(false)
	
	rejectStatement() {
		console.log('click từ chối');
		if (!this.frm.reason.value) {
			this.frm.reason.setErrors({required: true});
			this.frm.reason.markAllAsTouched();
			return;
		}
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = 'rejectAccountBalance';
		transaction.data = {
			id: this.dataCacheRouter.accBalId,
			reasonReject: this.frm.reason.value,
			authoriser: this.localStorage.retrieve(USERNAME_CACHED),
			timeRejected: moment(new Date()).format('DD-MM-YYYY hh:mm:ss'),
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		let modalRef = this.modalService.open(ModalDeleteComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
			centered: true
		});

		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn từ chối bản ghi!';
		modalRef.componentInstance.data = this.dataCacheRouter;
		modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
		modalRef.result.then(r => {
			if (r == true) {
				return;
			} else if (r == 'done') {
				this.commonService.success('Đã từ chối bản ghi');
			} else {
				return;
			}
		});
	}

	approveStatement() {
		let username = this.localStorage.retrieve(USERNAME_CACHED);
		this.bodyRequest.transaction.authenType = "approvedAccountBalance";
		this.bodyRequest.transaction.data = {
			"id": this.dataCacheRouter ? this.dataCacheRouter.accBalId : '',
			"authoriser": username,
			"actionT24": "APPROVED",
			"timeSlaAuthorise": "21212",
			"timeAuth": moment(Date.now()).format('DD-MM-YYYY hh:mm:ss')
		}
		this.isLoadingApproveStatement$.next(true);
		this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
			.pipe(finalize(() => this.isLoadingApproveStatement$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK) {
					this.commonService.success(`Duyệt bản ghi ${this.searchForm.controls.transId.value} thành công`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.searchForm.controls.transId.value, NOTIFICATION.PRODUCT_TYPE.BALANCE);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	onDelete() {
		if(this.dataCacheRouter) {
			let command = GET_TRANSACTION;
			let transaction = new TransactionModel();
			transaction.authenType = 'deleteAccountBalance';
			transaction.data = {
				id: this.dataCacheRouter.accBalId
			};
			let bodyRequest = new BodyRequestTransactionModel(command, transaction);
			let modalRef = this.modalService.open(ModalDeleteComponent, {
				size: 'lg',
				backdrop: 'static',
				keyboard: false,
				centered: true,
				windowClass: 'notificationDialog'
			});

			modalRef.componentInstance.content = 'Bạn có chắc chắn muốn xóa!';
			modalRef.componentInstance.data = this.dataCacheRouter;
			modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
			modalRef.result.then(r => {
				if (r == true) {
					return;
				} else if (r == 'done') {
					this.commonService.success('Xóa bản ghi xác nhận số dư thành công');
				} else {
				}
			});

		}else {
			this.ownerCustomerId$.next(null);
			this.searchForm.patchValue({
				custId: null

			})
		}
	}
}
