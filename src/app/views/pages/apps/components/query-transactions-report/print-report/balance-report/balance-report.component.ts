import {ExportService} from './../../../../../../common-service/export.service';
import {WebsocketClientService} from './../../../../../../../shared/services/websocket-client.service';
import {DataLinkMinio} from './../../../../../../model/data-link-minio';
import {LocalStorageService} from 'ngx-webstorage';
import {
	CACHE_CO_CODE, CHARGE_BUSINESS_TYPE,
	CODE_00,
	FEE_POLICIES,
	GET_ENQUIRY, GET_TRANSACTION,
	HEADER_API_ACCOUNT,
	NOTIFICATION,
	SERVER_API_CUST_INFO,
	STATUS_OK,
	USERNAME_CACHED,
} from './../../../../../../../shared/util/constant';
import {QueryTransReportService} from '../../query-trans-report.service';
import {AccountInfoModel} from './../../model/statement.model';
import {Router} from '@angular/router';
import {CommonService} from './../../../../../../common-service/common.service';
import {finalize} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CustomerRequestDTO} from "../../../../../../../shared/model/constants/customer-requestDTO";
import {DataPowerService} from "../../../../../../../shared/services/dataPower.service";
import {AppConfigService} from '../../../../../../../app-config.service';
import {HEADER_API_T24_ENQUIRY, SEVER_API_T24_ENQUIRY} from '../../../../../../../shared/util/constant';
import {getRandomTransId} from '../../../../../../../shared/util/random-number-ultils';
import {EnquiryModel} from '../../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../../model/body-request-enquiry-model';
import {ReportService} from '../../../../../../common-service/report.service';
import moment from 'moment';
import {TransactionModel} from "../../../../../../model/transaction.model";
import {BodyRequestTransactionModel} from "../../../../../../model/body-request-transaction.model";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalDeleteComponent} from "../../../../../../../shared/directives/modal-common/modal-delete/modal-delete.component";
import {formartDateYYYYMMDD, formartDateListYYYYMMDD} from '../../../../../../../shared/util/Utils';
import {ChargeInfoComponent} from "../../../charge-info/charge-info.component";
import {AccountRequestDTO} from "../../../../../../../shared/model/constants/account-requestDTO";
import {ChargeInfoService} from "../../../charge-info/charge-info.service";
import * as CONSTANTS from "constants";


@Component({
	selector: 'kt-balance-report',
	templateUrl: './balance-report.component.html',
	styleUrls: ['./balance-report.component.scss']
})
export class BalanceReportComponent implements OnInit, OnDestroy {
	@ViewChild(ChargeInfoComponent, {static: false})
	chargeInfoComponent: ChargeInfoComponent;
	feePolicies = FEE_POLICIES;
	chargeBusinessType = CHARGE_BUSINESS_TYPE;
	rejected$ = new BehaviorSubject<boolean>(false)
	disablePlus$ = new BehaviorSubject<boolean>(false);
	accountName$ = new BehaviorSubject<string>(null);
	listAccountInfo: any[] = [];

	isLoading$ = new BehaviorSubject<boolean>(false)
	listAcc$ = new BehaviorSubject<any>(null)

	isLoadingCustomerInfo$ = new BehaviorSubject<boolean>(false);
	customerObject: any;

	accessRightIds: any;
	inputtable$ = new BehaviorSubject<boolean>(false);
	authorisable$ = new BehaviorSubject<boolean>(false);
	APPROVED = new BehaviorSubject<boolean>(false);
	hideCcy$ = new BehaviorSubject<boolean>(false);
	searchForm = this.fb.group({
		type: ['INSODU_TK'],
		priority: ['PRIMARY'],
		transId: [null],
		custId: [null, Validators.required],
		accountArray: this.fb.array([this.newAccount()]),
		languageArray: this.fb.array([this.newLanguage()]),
		reason: [null]

	});

	isLoadingBalance$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	listDataBalance$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	today = new Date();
	dataCacheRouter: any;
	bodyRequest: any = {
		command: '',
		transaction: {
			authenType: '',
			data: {}
		}
	};

	constructor(
		private fb: FormBuilder,
		private dataPowerService: DataPowerService,
		private appConfigService: AppConfigService,
		public commonService: CommonService,
		private router: Router,
		private reportService: QueryTransReportService,
		private printReportService: ReportService,
		private localStorage: LocalStorageService,
		private websocketClientService: WebsocketClientService,
		private  modalService: NgbModal,
		public exportService: ExportService,
		private chargeInfoService: ChargeInfoService
	) {
		this.accessRightIds = this.commonService.getRightIdsByUrl(
			this.router.url
		);
	}

	ngOnInit() {
		const username = this.localStorage.retrieve('username');
		if (window.history.state.data) {
			this.dataCacheRouter = window.history.state.data;

			console.log('this.dataCacheRouter', this.dataCacheRouter);

			// this.accountName$.next(this.listAcc$.getValue()[0].acctName);
			console.warn(this.dataCacheRouter);
		} else {
			this.genTransId(username)
		}

		this.checkRight()
		this.getCcyList()


		// PatchValue to form from dashboard - update balance
		if (this.dataCacheRouter) {
			if (this.dataCacheRouter.status.includes('APPROVED')) {
				this.APPROVED.next(true);
			}

			if ((this.dataCacheRouter && this.dataCacheRouter.status == 'REJECTED')) {
				this.rejected$.next(true);
			}

			if (!this.dataCacheRouter.status.includes('APPROVED')) {
				this.getAccountByCustId(this.dataCacheRouter.customerId);
				this.getAccountByCustIdBlur(this.dataCacheRouter.customerId);
				this.getCustomerInfo();
				this.chargeInfoService.customerIdOfAccounts.next(this.dataCacheRouter.customerId);
			}
			let objectArr = [];
			let objectlangArr = [];
			this.searchForm.patchValue({
				type: this.dataCacheRouter.type,
				priority: this.dataCacheRouter.priority,
				transId: this.dataCacheRouter.accBalId,
				custId: this.dataCacheRouter.customerId,
				reason: this.dataCacheRouter.reason ? this.dataCacheRouter.reason : null
			})

			if (this.dataCacheRouter.accountNumber && this.dataCacheRouter.ccy) {
				if(!!this.dataCacheRouter.isSelectedAllAccount) {
					this.hideCcy$.next(true);
					this.accountArray.removeAt(0);
					this.accountArray.push(this.newAccount({accountNumber: 'ALL', currency: null}));
				} else {
					let listAccount = this.dataCacheRouter.accountNumber.split(';');
					let listCcy = this.dataCacheRouter.ccy.split(';');
					for (let i = 0; i < listAccount.length; i++) {
						objectArr.push({
							accountNumber: listAccount[i].trim(),
							currency: listCcy[i].trim()
						})
					}
					if (objectArr.length > 0) {
						this.accountArray.removeAt(0);

						objectArr.forEach(element => {
							this.accountArray.push(this.newAccount(element))
						})
					}
				}
			}

			if (this.dataCacheRouter.language && this.dataCacheRouter.reportNumber) {
				let listLanguage = this.dataCacheRouter.language.split(';');
				let listNumber = this.dataCacheRouter.reportNumber.split(';');
				for (let i = 0; i < listLanguage.length; i++) {
					objectlangArr.push({
						language: listLanguage[i],
						number: listNumber[i]
					})
				}
				if (objectlangArr.length > 0) {
					this.removeLang(0);
					objectlangArr.forEach(element => {
						this.languageArray.push(this.newLanguage(element))
					})
				}

			}

		}
	}

	ngOnDestroy() {
		this.listAcc$.next(null);
		this.commonService.checkCusExists$.next(false);
		this.authorisable$.next(false);
		this.inputtable$.next(false);
		this.disablePlus$.next(false);
		this.APPROVED.next(false);
		this.chargeInfoService.customerIdOfAccounts.next(null);

	}

	genTransId(userId: string): void {
		this.searchForm.get('transId').setValue(getRandomTransId(userId, 'so_du'));
	}


	getAccountByCustId(event) {
		this.isLoading$.next(true);
		this.reportService.getAccountByCustId(event)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.seabGetAcccustSeateller) {
					const rawAcc = res.body.enquiry.seabGetAcccustSeateller;
					this.listAcc$.next(rawAcc);
					// const rawAcc: AccountInfoModel[] = res.body.enquiry.seabGetAcccustSeateller;
					// this.listAcc$.next(this.getListAccount(rawAcc))
				}
			});
	}

	resetForm(event) {
		// this.feeInformationComponent.feeForm.controls.account.setValue(null);
		this.accountArray.reset();
	}

	listSTK$ = new BehaviorSubject<AccountInfoModel[]>([]);
	listTK$ = new BehaviorSubject<AccountInfoModel[]>([]);
	rawAcc: any[] = [];
	getAccountByCustIdBlur(event) {
		if (event) {
			this.getListAccountBalance(event);
			this.getListSTKBalance(event);
			this.chargeInfoService.customerIdOfAccounts.next(event);
			console.log('this.chargeInfoService.customerIdOfAccounts.getValue()',this.chargeInfoService.customerIdOfAccounts.getValue());
		}
	}

	getListAccountBalance(event) {
			// this.feeInformationComponent.feeForm.controls.account.setValue(null);
			this.accountArray.reset();
			this.isLoading$.next(true);
			this.reportService.getListAccountByCustId(event)
				.pipe(finalize(() => {
					this.isLoading$.next(false);
				}))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.seabApiCusAcBalance) {
						this.rawAcc = res.body.enquiry.seabApiCusAcBalance;
						console.warn('ListAccountBalance', this.rawAcc);
						this.listTK$.next(this.rawAcc);
						if(this.searchForm.controls.type && this.searchForm.controls.type.value == "INSODU_STK") {
							this.listAcc$.next(this.listSTK$.getValue())
						} else {
							this.listAcc$.next(this.listTK$.getValue())
						}
					}
				});
	}

	isLoadingSTK$ = new BehaviorSubject<boolean>(false);
	getListSTKBalance(event) {
			// this.feeInformationComponent.feeForm.controls.account.setValue(null);
			this.accountArray.reset();
			this.isLoadingSTK$.next(true);
			this.reportService.getListStkByCustId(event)
				.pipe(finalize(() => {
					this.isLoadingSTK$.next(false);
				}))
				.subscribe(res => {
					if (res.body.status == STATUS_OK && res.body.enquiry.seabApiCusAzBalance) {
						this.rawAcc = res.body.enquiry.seabApiCusAzBalance;
						console.warn('ListSTKBalance', this.rawAcc);
						this.listSTK$.next(this.rawAcc)
						if(this.searchForm.controls.type && this.searchForm.controls.type.value == "INSODU_STK") {
							this.listAcc$.next(this.listSTK$.getValue())
						} else {
							this.listAcc$.next(this.listTK$.getValue())
						}
					}
				});
	}

	changeDataListAcc(event) {
		// Chuyển loại hình xác nhận số dư => clear list Account
		this.accountArray.clear();
		this.addAccount();

		if(event == "INSODU_STK") {
			this.listAcc$.next(this.listSTK$.getValue())

		}
		if(event =="INSODU_TK") {
			this.listAcc$.next(this.listTK$.getValue())
		}
	}

	getListAccount(rawData: AccountInfoModel[]) {
		return rawData.reduce((acc, next) => {
			if (!next.errorCode) {
				return acc.concat({
					acct: next.acct,
					acctName: next.acctName,
					currency: next.currency,
					coCode: next.coCode,
					category: next.category,
					productGroup: next.productGroup
				});
			}
			return acc;
		}, []);
	}

	get accountArray(): FormArray {
		if (this.searchForm && this.searchForm.get('accountArray')) {
			return this.searchForm.get('accountArray') as FormArray;
		}
	}

	get languageArray(): FormArray {
		if (this.searchForm && this.searchForm.get('languageArray')) {
			return this.searchForm.get('languageArray') as FormArray;
		}
	}

	newAccount(account?: any): FormGroup {
		return this.fb.group({
			accountNumber: [account ? account.accountNumber : null, Validators.required],
			currency: [account ? account.currency : null],
		});
	}

	newLanguage(language?: any): FormGroup {
		return this.fb.group({
			language: [language ? language.language : null, Validators.required],
			number: [language ? language.number : null, Validators.required],
		});
	}

	removeAcc(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.accountArray.removeAt(i);
			}
		});
	}

	removeLang(i: number) {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.languageArray.removeAt(i);
			}
		});
	}

	addAccount() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.accountArray.push(this.newAccount());
			}
		});
	}

	addLang() {
		this.isReadonly.toPromise().then(res => {
			if (!res) {
				this.languageArray.push(this.newLanguage());
			}
		});
	}

	ccyList: any;
	isLoadingCcyList$ = new BehaviorSubject<boolean>(false);

	getCcyList() {
		let ccyCached = this.localStorage.retrieve('ccyCached');
		if (ccyCached) {
			this.ccyList = ccyCached;
			console.warn(this.ccyList, 'this.ccyList');
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


	onSearch() {
		this.isLoadingBalance$.next(true);
		if (this.searchForm.controls.type.value == "1") {
			let bodyConfig = CustomerRequestDTO.BODY.BODY_BALANCE_REPORT;
			const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
			const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);

			bodyConfig.enquiry.customerId = this.searchForm.controls.custId.value;
			this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
				.pipe(finalize(() => this.isLoadingBalance$.next(false)))
				.subscribe(res => {
					if (res) {
						console.log('response balance', res);
						this.listDataBalance$.next(res.enquiry.seabApiCusAcBalance)
						if (this.listDataBalance$.getValue()) {
							let item = this.listDataBalance$.getValue();
							// this.feeInformationComponent.feeForm.patchValue({
							// 	transId: '',
							// 	priority: '',
							// 	account: item.altAcct,
							// 	transDate: [new Date()],
							// })
						}
					} else {
						return
					}
				});
		}
	}

	get frm() {
		return this.searchForm.controls;
	}

	submitLoading$ = new BehaviorSubject<boolean>(false);

	onSubmit() {
		let accountData;
		let listFeeAcc;
		let listLanguage;
		let listNumber;
		let languageClone;
		let listCcy;
		console.log('languageArray.value', this.languageArray.value);
		let username = this.localStorage.retrieve(USERNAME_CACHED);
		let coCode = this.localStorage.retrieve(CACHE_CO_CODE);

		// console.log('this.chargeInfoComponent.feeInfosFormArray', this.chargeInfoComponent.feeInfosFormArray.value);
		// if((this.chargeInfoComponent.frm.feePolicy.value == 'TIEN_MAT' 
		// || this.chargeInfoComponent.frm.feePolicy.value == 'TAI_KHOAN') && this.chargeInfoComponent.feeInfosFormArray.value[0].feeAmt == '0') {
		// 	this.commonService.error('Số tiền phí phải lớn hơn 0!');
		// 	return
		// }

		if (this.accountArray.value[0].accountNumber == 'ALL') {
			let accountCopy = [...this.listAcc$.getValue()];
			listFeeAcc = accountCopy.map(item => {
				return item.altAcct.trim()
			});
			listCcy = accountCopy.map(item => {
				return item.acctCCy.trim();
			});
		} else {
			accountData = [...this.accountArray.value];
			listFeeAcc = accountData.map(item => {
				return item.accountNumber.trim();
			});

			listCcy = accountData.map(item => {
				return item.currency.trim();
			});
		}


		if (this.languageArray.value) {
			languageClone = [...this.languageArray.value]
			listLanguage = languageClone.map(item => {
				return item.language
			})

			listNumber = languageClone.map(item => {
				return item.number
			})
		}
		// if(this.chargeInfoComponent.frm.)

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
			"accountNumber": listFeeAcc.toString().replace(/\,/g, ";"),
			"ccy": listCcy.toString().replace(/\,/g, ";"),

			"coCode": coCode,
			"customerId": this.frm.custId.value,

			"inputter": username,
			"language": listLanguage.toString().replace(/\,/g, ";"),
			"reportNumber": listNumber.toString().replace(/\,/g, ";"),
			"priority": this.frm.priority.value,
			"type": "INSODU_TK",
			"created": moment(Date.now()).format('DD-MM-YYYY hh:mm:ss'),
			"actionT24": CHARGE_BUSINESS_TYPE.ACCOUNT_BALANCE,
			"isSelectedAllAccount": (this.accountArray.value[0].accountNumber == 'ALL') ? true : false,
			"chargeInfo": this.chargeInfoComponent.frm.feePolicy.value == "MIEN_PHI" ? null : this.chargeInfoComponent.buildRequestCharge()


		}

		this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
			.pipe(finalize(() => this.submitLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == STATUS_OK) {
					this.commonService.success((this.dataCacheRouter) ? `Cập nhật bản ghi ${this.searchForm.controls.transId.value} thành công` : `Bản ghi ${this.searchForm.controls.transId.value} đã được gửi duyệt tới KSV`);
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.searchForm.controls.transId.value, NOTIFICATION.PRODUCT_TYPE.BALANCE);
					this.router.navigate(['/pages/dashboard']);
				} else {
					return;
				}
			});
	}

	approveLoading$ = new BehaviorSubject<boolean>(false);

	onApprove() {
			let username = this.localStorage.retrieve(USERNAME_CACHED);
			this.bodyRequest.transaction.authenType = "approvedAccountBalance";
			this.bodyRequest.transaction.data = {
				"id": this.dataCacheRouter ? this.dataCacheRouter.accBalId : '',
				"authoriser": username,
				"actionT24": "APPROVED",
				"timeSlaAuthorise": "21212",
				"timeAuth": moment(Date.now()).format('DD-MM-YYYY hh:mm:ss')
			}
			this.approveLoading$.next(true);
			this.commonService.actionGetTransactionResponseApi(this.bodyRequest)
				.pipe(finalize(() => this.approveLoading$.next(false)))
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
			this.accountArray.clear();
			this.languageArray.clear();
			this.searchForm.patchValue({
				custId: null

			})
			this.addAccount();
			this.addLang();
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

	checkRight(): void {
		console.log(this.accessRightIds, 'accessRightIds');
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	isLoadingReport$ = new BehaviorSubject<boolean>(false);

	printSuggest() {
		let accountData;
		let listAccClone;


		let codeList = this.localStorage.retrieve('co_code_list');
		let currCocode = this.localStorage.retrieve('cache_co_code');
		let currCocodeName = codeList.find(code => code.group_id == currCocode).desc;


		if (this.searchForm.invalid) {
			this.commonService.error('Vui lòng kiểm tra lại thông tin đã nhập');
			this.searchForm.markAllAsTouched();
			return;
		}
		let today = new Date()

		// Nếu chọn list tài khoản in xác nhận thông thường
		accountData = [...this.accountArray.value];
		console.log('this.accountArray.value', this.accountArray.value);
		accountData.forEach(element => {
			delete element.currency
		});

		// Nếu chọn tài khoản in xác nhận là ALL
		if (accountData[0].accountNumber == 'ALL') {
			listAccClone = [...this.listAcc$.getValue()];
			accountData = listAccClone.map(item => {
				return {
					accountNumber: item.altAcct
				}
			})
		}

		let body: any;
		if(this.searchForm.controls.type.value == "INSODU_TK") {
			body = {
				command: 'GET_REPORT',
				// report: {
				// 	authenType: "getRequest_SEATELLER_XN_SO_DU",
				// 	transactionId: this.searchForm.controls.transId.value,
				// 	address: this.customerObject.currentAddress.replaceAll('#',' '),
				// 	// address: this.customerObject.address.replaceAll('#', ''),
				// 	branch: currCocodeName,
				// 	custId: this.searchForm.controls.custId.value,
				// 	customerName: this.customerObject.shortName,
				// 	exportType: "PDF",
				// 	gttt: this.customerObject.legalID.split('#')[0],
				// 	listAcct: accountData,
				// 	ngayCap: moment(today).format('DD/MM/YYYY'),
				// 	ngayYeuCau: moment(today).format('DD/MM/YYYY'),
				// 	noiCap: this.customerObject.legalIssAuth.split('#')[0],
				// 	saveToMinio: true,
				// 	soBanChinh: '',
				// 	soBanPhoTo: '',
				// 	stkTrichNo: this.chargeInfoComponent.frm.feeAccount.value,
				// 	tenTaiKhoan: this.accountName$.getValue(),
				// 	feeType: this.chargeInfoComponent.frm.feePolicy.value
				// }
				report: {
					authenType: "getRequest_SEATELLER_XN_SO_DU",
					transactionId: this.searchForm.controls.transId.value,
					address: this.customerObject.currentAddress.replaceAll('#',' '),
					// address: this.customerObject.address.replaceAll('#', ''),
					branch: currCocodeName,
					custId: this.searchForm.controls.custId.value,
					customerName: this.customerObject.shortName,
					exportType: "PDF",
					gttt: this.customerObject.legalID.replaceAll('#', ';'),
					listAcct: accountData,
					ngayCap: formartDateListYYYYMMDD(this.customerObject.legalIssDate),
					ngayYeuCau: moment(today).format('DD/MM/YYYY'),
					noiCap: this.customerObject.legalIssAuth.replaceAll('#',';'),
					saveToMinio: true,
					soBanChinh: '',
					soBanPhoTo: '',
					stkTrichNo: this.chargeInfoComponent.frm.feeAccount.value,
					tenTaiKhoan: this.accountName$.getValue(),
					feeType: this.chargeInfoComponent.frm.feePolicy.value
				}
				// customer: {
				// 	fullName: this.customerObject.shortName,
				// 	gttt: this.customerObject.legalID.replaceAll('#', ';'),
				// 	issueDate: formartDateListYYYYMMDD(this.customerObject.legalIssDate),
				// 	issuesAddress: this.customerObject.legalIssAuth.replaceAll('#',';'),
				// 	currentAddress: this.customerObject.currentAddress.replaceAll('#',' ')
				// },
			}
		} else {
			accountData = [...this.accountArray.value];
			if(accountData[0].accountNumber == 'ALL') {
				this.listAccountInfo = []
				this.listAcc$.getValue().map(stk => {
					const strBalance = stk.workBalance.trim();
									let index1stSpace = strBalance.indexOf(' ');
									let balance = strBalance.slice(0,index1stSpace);
									this.listAccountInfo.push({
										
										ccy: stk.acctCCy.trim(),
										endDate:  stk.matDate.trim(),
										stk: stk.altAcct.trim(),
										soDu: balance,
										startDate: stk.openDate.trim(),
										equivalent: null,
										// rateTmp: stk.rateTmp.trim().split('#')[0],
										tgianGui: stk.term,  
											
										})
				})
			} else {
				this.listAccountInfo = []
				for(let i = 0; i < this.listAcc$.getValue().length; i ++) {
					for(let j = 0; j < this.accountArray.value.length; j ++) {
						if(this.listAcc$.getValue()[i].altAcct.trim() == this.accountArray.value[j].accountNumber.trim()) {
									const strBalance = this.listAcc$.getValue()[i].workBalance.trim();
									let index1stSpace = strBalance.indexOf(' ');
									let balance = strBalance.slice(0,index1stSpace);
									this.listAccountInfo.push({
										
										ccy: this.listAcc$.getValue()[i].acctCCy.trim(),
										endDate:  this.listAcc$.getValue()[i].matDate.trim(),
										stk: this.listAcc$.getValue()[i].altAcct.trim(),
										soDu: balance,
										startDate: this.listAcc$.getValue()[i].openDate.trim(),
										equivalent: null,
										// rateTmp: this.listAcc$.getValue()[i].rateTmp.trim().split('#')[0],
											tgianGui: this.listAcc$.getValue()[i].term,  
											
										})
							}
						}
					}
					console.log(this.listAccountInfo);
			}
		
			body = {
				command: 'GET_REPORT',
				report: {
					authenType: "getRequest_SEATELLER_XN_SO_DU_TK",
					transactionId: this.searchForm.controls.transId.value,
					custId: this.searchForm.controls.custId.value,
					exportType: "PDF",
					branch: currCocodeName,
					// "customerInfo": {
					// 	"currentAddress": dataCustomer.currentAddress.replaceAll('#',' '),
					// 	"email": dataCustomer.email.replaceAll('#', ';'),
					// 	"fullName": dataCustomer.shortName,
					// 	"gttt": dataCustomer.legalID.replaceAll('#', ';'),
					// 	"issueDate": formartDateListYYYYMMDD(dataCustomer.legalIssDate),
					// 	"issuesAddress": dataCustomer.legalIssAuth.replaceAll('#',';'),
					// 	"mobilePhone": dataCustomer.sms.replaceAll('#', ';')
					// },
					customer: {
						fullName: this.customerObject.shortName,
						gttt: this.customerObject.legalID.replaceAll('#', ';'),
						issueDate: formartDateListYYYYMMDD(this.customerObject.legalIssDate),
						issuesAddress: this.customerObject.legalIssAuth.replaceAll('#',';'),
						currentAddress: this.customerObject.currentAddress.replaceAll('#',' ')
					},
					// customer: {
					// 	fullName: this.customerObject.shortName,
					// 	gttt: this.customerObject.legalID.split('#')[0],
					// 	issueDate: moment(today).format('DD/MM/YYYY'),
					// 	issuesAddress: this.customerObject.legalIssAuth.split('#')[0],
					// 	currentAddress: this.customerObject.currentAddress.replaceAll('#',' ')
					// },
					saveToMinio: false,
					debitAcc: this.chargeInfoComponent.frm.feeAccount.value,
					language: this.languageArray.value[0].language,

					totalAmount: "",
					totalAmountStr: "",
					totalFee: this.chargeInfoComponent.frm.totalFeeAmt.value,
					soTietKiem: this.listAccountInfo
				}
			}
		}


		console.log(body);
		// return
		this.printReportService.getReportForm(body)
			.pipe(finalize(() => this.isLoadingReport$.next(false)))
			.subscribe(res => {
				if (res && res.status == STATUS_OK && res.responseCode == '00') {
					const dataLinks: DataLinkMinio[] = [];
					// for (let i = 0; i < res.report.data.length; i++) {
					const dataLink: DataLinkMinio = new DataLinkMinio();
					const comboTemplate = res.report.data;
					dataLink.fileName = comboTemplate.fileName;
					dataLink.fileType = comboTemplate.fileType;
					dataLink.bucketName = comboTemplate.bucketName;
					dataLink.folder = comboTemplate.folder;
					dataLinks.push(dataLink);
					// this.websocketClientService.sendMessageToTablet(dataLink, 'viewForm');
					window.open(`${this.printReportService.minioLink}/${comboTemplate.bucketName}/${comboTemplate.folder}`, '_blank');
					// }
					console.warn('>>>>> dataLinks', dataLinks);
					this.websocketClientService.sendMessageToTablet(dataLinks, 'viewForm');
				}
			});
	}

	showTemplate() {

		let codeList = this.localStorage.retrieve('co_code_list');
		let currCocode = this.localStorage.retrieve('cache_co_code');
		let currCocodeName = codeList.find(code => code.group_id == currCocode).desc;
		let dataCustomer = this.customerObject;

		console.log(' this.listAcc$.getValue()',  this.listAcc$.getValue());
		console.log('this.accountArray.value', this.accountArray.value);
		if(this.accountArray.value.length > 0) {
			if(this.accountArray.value[0].accountNumber == 'ALL') {
				this.listAccountInfo = [];
				this.listAcc$.getValue().map(account => {
					if(this.searchForm.controls.type.value == "INSODU_TK") {
									const strBalance = account.workBalance.trim();
									let index1stSpace = strBalance.indexOf(' ');
									let balance = strBalance.slice(0,index1stSpace);

									const strBalanceEnqui = account.balanceEnqui.trim();
									let index1stSpaceBalance = strBalanceEnqui.indexOf(' ');
									let equivalent = strBalanceEnqui.slice(0,index1stSpaceBalance);
									console.log(balance);
							this.listAccountInfo.push({
							accountNo: account.altAcct.trim(),
							balance: balance,
							balanceStr: account.workBalance,
							equivalent: equivalent,  
							equivalentStr: account.balanceEnqui,
							exchangeRate: account.rateTmp.trim(),
							openDate: account.openDate.trim(),
							acctCCy: account.acctCCy.trim()
						})
					} else {
						const strBalance = account.workBalance.trim();
									let index1stSpace = strBalance.indexOf(' ');
									let balance = strBalance.slice(0,index1stSpace);

									const strBalanceEnqui = account.balanceEnqui.trim();
									let index1stSpaceBalance = strBalanceEnqui.indexOf(' ');
									let equivalent = strBalanceEnqui.slice(0,index1stSpaceBalance);

						this.listAccountInfo.push({
							accNo: account.altAcct.trim(),
							balance: balance,
							endDate:  account.matDate.trim(), 
							equivalent: equivalent, 
							balanceStr: account.workBalance,
							equivalentStr:account.balanceEnqui,
							rateTmp: account.rateTmp.trim(), 
							openDate: account.openDate.trim(),
							term: account.term,  
							currency: account.acctCCy.trim()
						})		
					}

				})
			} else {
				this.listAccountInfo = [];
				for(let i = 0; i < this.listAcc$.getValue().length; i ++) {
					for(let j = 0; j < this.accountArray.value.length; j ++) {
						if(this.listAcc$.getValue()[i].altAcct.trim() == this.accountArray.value[j].accountNumber.trim()) {
							if(this.searchForm.controls.type.value == "INSODU_TK") {
								const strBalance = this.listAcc$.getValue()[i].workBalance.trim();
								let index1stSpace = strBalance.indexOf(' ');
								let balance = strBalance.slice(0,index1stSpace);

								const strBalanceEnqui = this.listAcc$.getValue()[i].balanceEnqui.trim();
								let index1stSpaceBalance = strBalanceEnqui.indexOf(' ');
								let equivalent = strBalanceEnqui.slice(0,index1stSpaceBalance);

									this.listAccountInfo.push({
										accountNo: this.listAcc$.getValue()[i].altAcct.trim(),
										balance: balance,
										balanceStr: this.listAcc$.getValue()[i].workBalance,
										equivalent: equivalent,
										equivalentStr: this.listAcc$.getValue()[i].balanceEnqui,
										exchangeRate: this.listAcc$.getValue()[i].rateTmp.trim(),
										openDate: this.listAcc$.getValue()[i].openDate.trim(),
										acctCCy: this.listAcc$.getValue()[i].acctCCy.trim()
									})
								}else {
									const strBalance = this.listAcc$.getValue()[i].workBalance.trim();
									let index1stSpace = strBalance.indexOf(' ');
									let balance = strBalance.slice(0,index1stSpace);

									const strBalanceEnqui = this.listAcc$.getValue()[i].balanceEnqui.trim();
									let index1stSpaceBalance = strBalanceEnqui.indexOf(' ');
									let equivalent = strBalanceEnqui.slice(0,index1stSpaceBalance);
									this.listAccountInfo.push({
										accNo: this.listAcc$.getValue()[i].altAcct.trim(),
										balance: balance,
										endDate:  this.listAcc$.getValue()[i].matDate.trim(),
										equivalent: equivalent,
										rateTmp: this.listAcc$.getValue()[i].rateTmp.trim(),
										openDate: this.listAcc$.getValue()[i].openDate.trim(),
										term: this.listAcc$.getValue()[i].term,  
										currency: this.listAcc$.getValue()[i].acctCCy.trim(),
										balanceStr: this.listAcc$.getValue()[i].workBalance,
										equivalentStr:this.listAcc$.getValue()[i].balanceEnqui,
									})
								}
						}
					}
				}
			}

		}
		console.log('tableData', this.listAccountInfo);

		if (this.searchForm.invalid) {
			this.commonService.error('Vui lòng kiểm tra lại thông tin đã nhập');
			this.searchForm.markAllAsTouched();
			return;
		}
		// getReport_SEATELLER_XN_SO_DU_TK xac nhận số dư sổ tiết kiệm
		let body: any;
		body = {
			command: 'GET_REPORT',
		}
		if(this.searchForm.controls.type.value == "INSODU_TK") {
			body.report = {
				// xác nhận số dư TK
				"authenType": "getReport_SEATELLER_XN_SO_DU",
				"customerInfo": {
					"currentAddress": dataCustomer.currentAddress.replaceAll('#',' '),
					"email": dataCustomer.email.replaceAll('#', ';'),
					"fullName": dataCustomer.shortName,
					"gttt": dataCustomer.legalID.replaceAll('#', ';'),
					"issueDate": formartDateListYYYYMMDD(dataCustomer.legalIssDate),
					"issuesAddress": dataCustomer.legalIssAuth.replaceAll('#',';'),
					"mobilePhone": dataCustomer.sms.replaceAll('#', ';')
				},
				"branch": currCocodeName,
				"equivalent": null,
				"equivalentStr":null,
				"exchangeRate": null,
				"language": this.languageArray.value[0].language,
				"saveToMinio": false,
				"tableData": this.listAccountInfo,
				"totalBalance": null,
				"totalBalanceStr": null,
				"exportType": "PDF",
				"id": null,
				"printTime": moment(Date.now()).format('DD/MM/YYYY hh:mm:ss')
			}
		} else {
			body.report = {
				"authenType":"getReport_SEATELLER_XN_SO_DU_TK",
				"tableData": this.listAccountInfo,
				"exportType":"PDF",
				"branch": currCocodeName,
                "customerInfo": {
                    "fullName": dataCustomer.shortName,
                    "gttt": dataCustomer.legalID.replaceAll('#', ';'),
                    "issueDate": formartDateListYYYYMMDD(dataCustomer.legalIssDate),
                    "issuesAddress": dataCustomer.legalIssAuth.replaceAll('#',';'),
                    "currentAddress": dataCustomer.currentAddress.replaceAll('#',' ')
                },
                "language": this.languageArray.value[0].language
			}
		}
		this.printReportService.getReportForm(body)
			.pipe(finalize(() => this.isLoadingReport$.next(false)))
			.subscribe(res => {

				console.log('report data', res);
				if (res && res.status == STATUS_OK && res.responseCode == '00') {
					const data = res.report.data.base64Data;
					if(this.searchForm.controls.type.value == "INSODU_TK"){
						this.exportService.openPdfFile(data, 'XAC NHAN SO DU TAI KHOAN.pdf');
					} else {
						this.exportService.openPdfFile(data, 'XAC NHAN SO DU SO TIET KIEM.pdf');
					}
				}
			});
	}

	ownerCustomerId$ = new BehaviorSubject<string>(null)

	getCustomerInfo(event?) {
		this.commonService.checkCusExists$.next(true);
		this.ownerCustomerId$.next(null)
		let cusId
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
						// this.searchForm.controls.custId.setValue(null)
						return;
					}
				});
		}
	}

	patchValueCcy(event, index) {
		console.warn(this.listAcc$.getValue(), 'this.listAcc');
		console.warn(event, index);
		if (event == 'ALL') {
			this.accountArray.clear();
			this.accountArray.push(this.newAccount({accountNumber: 'ALL', currency: null}))
			this.disablePlus$.next(true);
			if(this.listAcc$.getValue().length > 0) {
				this.accountName$.next(this.listAcc$.getValue()[0].acctName);
			}
			console.warn(this.disablePlus$.getValue());
		} else {
			this.disablePlus$.next(false);
			let accountSelect = this.listAcc$.getValue().find(acc => acc.altAcct.trim() == event.trim());
			console.log('accountSelect', accountSelect);
			this.accountArray.at(index).get('currency').setValue(accountSelect.acctCCy.trim())
			if(index == 0) {
				this.accountName$.next(accountSelect.acctName)
			}

		}
	}

	onReject() {
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


}
