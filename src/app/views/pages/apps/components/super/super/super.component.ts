import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CustomerModel} from '../../combo/customer-info/customer-model';
import {AccountModel} from '../../../../../model/account.model';
import {SmsModel} from '../../../../../model/sms.model';
import {CardModel} from '../../../../../model/card.model';
import {EbankModel} from '../../../../../model/ebank.model';
import {ComboModel} from '../../../../../model/combo.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TransactionModel} from '../../../../../model/transaction.model';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {BehaviorSubject, Subscription} from 'rxjs';
import {CommonService} from '../../../../../common-service/common.service';
import {ToastrService} from 'ngx-toastr';
import {NavigationEnd, Router} from '@angular/router';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {ACTION_T24_CREATE} from '../../../../../../shared/model/constants/common-constant';
import {ModalDeleteComponent} from '../../../../../../shared/directives/modal-common/modal-delete/modal-delete.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {finalize} from 'rxjs/operators';
import {FormatDatepicker} from '../../../../../../shared/util/format-datepicker-dd-mm-yyyy';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {WebsocketClientService} from '../../../../../../shared/services/websocket-client.service';
import {
	APPROVE,
	APPROVE_COMBO,
	MAIN_CARD_VERSION,
	DATA_FROM_DASHBOARD,
	GET_TRANSACTION,
	NOTIFICATION, STATUS_OK,
	USERNAME_CACHED
} from '../../../../../../shared/util/constant';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import {formatDate} from '../../../../../../shared/util/date-format-ultils';
import {FormPDF} from '../../combo/formPDF';
import moment from 'moment';
import {CustomerInfoComponent} from '../../combo/customer-info/customer-info.component';
import {ReportService} from '../../../../../common-service/report.service';
import {DataLinkMinio} from '../../../../../model/data-link-minio';

@Component({
	selector: 'kt-super',
	templateUrl: './super.component.html',
	styleUrls: ['./super.component.scss']
})
export class SuperComponent implements OnInit, OnDestroy {

	@ViewChild(CustomerInfoComponent, {static: false})
	customerComponent: CustomerInfoComponent;

	customer: CustomerModel = new CustomerModel();
	account: AccountModel = new AccountModel();
	sms: SmsModel[] = [];
	card: CardModel = new CardModel();
	ebank: EbankModel = new EbankModel();
	combo1: ComboModel = new ComboModel();
	generalInfo: any;
	otherInfo: any;
	parentForm: FormGroup;
	transaction: TransactionModel = new TransactionModel();
	command: string;
	bodyRequest: BodyRequestTransactionModel;
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	isRemoving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	activeTab$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
	now = new Date();
	dataFrmDashboard: any;
	bodyDeleteRequest: BodyRequestTransactionModel;
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

	accessRightIds: string[];
	inputtable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	authorisable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	auditInfo: any;
	comboInfo: any;
	username: string;

	parentName: string;
	childOne: string;
	childTwo: string;

	navigateSub: Subscription;


	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private toastService: ToastrService,
				private router: Router,
				private localStorage: LocalStorageService,
				private sessionStorage: SessionStorageService,
				private dateFormat: FormatDatepicker,
				private dataPowerService: DataPowerService,
				private modalService: NgbModal,
				private websocketClientService: WebsocketClientService,
				private reportService: ReportService) {
		this.username = this.localStorage.retrieve(USERNAME_CACHED);
		this.parentName = 'Trang chủ';
		this.childOne = 'Mở gói super';
		this.childTwo = '';
		this.parentForm = this.fb.group({
			inputter: [''],
			authoriser: [''],
			timeUpdate: [''],
			timeAuth: [''],
			coCode: [''],
			reason: [''],
			roomCode: [''],
		});
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);

		this.navigateSub = this.router.events.subscribe(event => {
			if (event instanceof NavigationEnd) {
				this.ngOnInit();
			}
		});
	}

	ngOnInit() {
		this.checkRight();
		this.dataFrmDashboard = window.history.state.data;
		this.commonService.isAsideRight$.next(true);
		this.commonService.isDisplayAsideRight$.next(true);

		let username = this.localStorage.retrieve('username');
		this.bodyRequest = new BodyRequestTransactionModel(this.command, this.transaction);
		this.bodyRequest.transaction.authenType = this.dataFrmDashboard ? 'updateCombo' : 'createCombo';
		this.bodyRequest.command = 'GET_TRANSACTION';
		this.parentForm.controls.inputter.setValue(username);
		this.parentForm.controls.timeUpdate.setValue(this.now.toISOString());
		this.parentForm.controls.coCode.setValue(this.commonService.groupOwner$.getValue());
		this.parentForm.controls.authoriser.setValue(username);
	}


	checkRight(): void {
		if (this.accessRightIds.includes('I')) {
			this.inputtable$.next(true);
		}
		if (this.accessRightIds.includes('A')) {
			this.authorisable$.next(true);
		}
	}

	ngAfterViewInit(): void {
		this.parentForm.valueChanges.subscribe(() => {
			this.comboInfo = this.parentForm.controls.comboInfoForm.value;
			this.customer = this.parentForm.controls.customerForm.value;
			this.generalInfo = this.parentForm.controls.infoForm.value;
			this.account = this.parentForm.controls.accountInfoForm.value;
			this.sms = this.parentForm.controls.smsRegisterForm.value.formArray;
			this.ebank = this.parentForm.controls.ebankForm.value;
			this.card = this.parentForm.controls.internationalCardForm.value.formArray;
			this.auditInfo = this.parentForm.controls.auditInfoForm.value;
			let smsCheckbox = this.parentForm.controls.smsRegisterForm.value.smsCheckbox;
			let cardCheckbox = this.parentForm.controls.internationalCardForm.value.cardCheckbox;
			this.auditInfo = this.parentForm.controls.auditInfoForm.value;
			let birthday = this.dateFormat.formatDateDDMMYYYY(this.parentForm.controls.customerForm.value.birthday);
			let idenTime = this.parentForm.controls.customerForm.value.idenTime ? this.dateFormat.formatDateDDMMYYYY(this.parentForm.controls.customerForm.value.idenTime) : null;
			let idenTimeExpired = this.parentForm.controls.customerForm.value.idenTimeExpired ? this.dateFormat.formatDateDDMMYYYY(this.parentForm.controls.customerForm.value.idenTimeExpired) : null;
			let idenTimeValue = this.parentForm.controls.customerForm.value.idenTimeValue ? this.dateFormat.formatDateDDMMYYYY(this.parentForm.controls.customerForm.value.idenTimeValue) : null;


			console.log(this.parentForm.controls.customerForm.status, 'customer form');
			console.log(this.parentForm.controls.infoForm.status, 'infoForm form');
			console.log(this.parentForm.controls.accountInfoForm.status, 'accountInfoForm form');
			console.log(this.parentForm.controls.smsRegisterForm.status, 'smsRegisterForm form');
			console.log(this.parentForm.controls.ebankForm.status, 'ebankForm form');
			console.log(this.parentForm.controls.customerForm.status, 'customer form');
			console.log(this.parentForm.controls.infoForm.status, 'infoForm form');
			console.log(this.parentForm.controls.accountInfoForm.status, 'accountInfoForm form');
			console.log(this.parentForm.controls.smsRegisterForm.status, 'smsRegisterForm form');
			console.log(this.parentForm.controls.ebankForm.status, 'ebankForm form');
			console.log(this.parentForm.controls.internationalCardForm.status, 'internationalCardForm form');

			this.bodyRequest.transaction.data = {
				customer: {
					id: (this.dataFrmDashboard && this.dataFrmDashboard.customer) ? this.dataFrmDashboard.customer.id : getRandomTransId(this.username,'customer'),
					customerName: this.customer.customerName,
					sex: this.customer.sex,
					birthday: birthday,
					placeOfBirth: this.customer.placeOfBirth,
					maritalStatus: this.customer.maritalStatus,
					purpose: this.customer.purpose,
					national: this.customer.national,
					residentStstus: this.customer.residentStstus,
					residentNational: this.customer.residentNational,
					gttt: this.customer.gttt,
					idenType: this.customer.idenType,
					organization: this.customer.organization,
					idenTime: idenTime,
					idenAdress: this.customer.idenAdress,
					idenTimeExpired: idenTimeExpired,
					idenTimeValue: idenTimeValue,
					idenAddress: this.customer.idenAddress,
					phone: this.customer.phone,
					mobile: this.customer.mobile,
					email: this.customer.email,
					stress: this.customer.stress,
					district: this.customer.district,
					province: this.customer.province,
					customerAddress: this.customer.customerAddress,
					// piority: this.customer.piority,
					priority: this.customer.piority,
					campaignId: this.generalInfo.campaignId,
					loyalty: this.customer.loyalty,
					title: this.customer.title,
					portfolio: this.customer.portfolio,
					ownerBen: this.customer.ownerBen,
					ownCustomer: this.customer.ownCustomer,
					employment: this.customer.employment,
					occupation: this.customer.occupation,
					employerName: this.customer.employerName,
					employerAddress: this.customer.employerAddress,
					industryGroup: this.customer.industryGroup,
					industry: this.customer.industry,
					industryClass: this.customer.industryClass,
					noOfDependents: this.customer.noOfDependents,
					customerCurrency: this.customer.customerCurrency,
					salaryReq: this.customer.salaryReq,
					fax: this.customer.fax,
					taxId: this.customer.taxId,
					relate: this.customer.relate,
					relationCustomer: this.customer.relationCustomer,
					answer: this.customer.answer,
					securityQues: this.customer.securityQues,
					actionT24: ACTION_T24_CREATE
				},
				account: this.account.accountCheckbox ? {
					id: (this.dataFrmDashboard && this.dataFrmDashboard.account) ? this.dataFrmDashboard.account.id : getRandomTransId(this.username,'account'),
					customerId: this.customer.customerId,
					accountName: this.customer.customerName,
					shortName: this.customer.customerName,
					idRelate: this.account.idRelate,
					relate: this.account.relate,
					accountNumber: this.account.accountNumber,
					currency: this.account.currency,
					actionT24: ACTION_T24_CREATE
				} : null,
				sms: smsCheckbox ? {
					id: (this.dataFrmDashboard && this.dataFrmDashboard.sms) ? this.dataFrmDashboard.sms.id : getRandomTransId(this.username,'sms'),
					priority: this.comboInfo.priority,
					actionT24: ACTION_T24_CREATE,
					smsDetail: this.parentForm.controls.smsRegisterForm.value.formArray,
				} : null,
				ebank: this.ebank.ebankCheckbox ? {
					id: (this.dataFrmDashboard && this.dataFrmDashboard.ebank) ? this.dataFrmDashboard.ebank.id : getRandomTransId(this.username,'ebank'),
					serviceId: this.ebank.serviceId,
					handyNumber: this.customer.mobile,
					packageService: this.ebank.packageService,
					passwordType: this.ebank.passwordType,
					promotionId: this.ebank.promotionId,
					limit: this.ebank.limit,
					transSeANetPro: this.ebank.transSeANetPro,
					departCode: this.auditInfo.roomCode,
					campaignId: null,
					mainCurrAcc: '0011136688',
					coreDate: this.commonService.timeT24$.getValue(),
					// coreDate: '28-12-2020',
					priority: this.comboInfo.priority,
					actionT24: ACTION_T24_CREATE
				} : null,
				card: cardCheckbox ? {
					id: (this.dataFrmDashboard && this.dataFrmDashboard.card) ? this.dataFrmDashboard.card.id : getRandomTransId(this.username,'card'),
					customerId: this.customer.customerId,
					cardName: this.card.cardName,
					cardType: this.card.cardType,
					promotionId: this.card.promotionId,
					transProId: this.card.transProId,
					accountNumber: '0011136688',
					cardVersion: `${MAIN_CARD_VERSION}${this.card.cardType}`,
					memberDateExpored: formatDate(this.card.memberDateExpored),
					lstSecondaryCard: this.parentForm.controls.internationalCardForm.value.formArray,
					ycomer: this.card.ycomer,
					memberCode: this.card.memberCode,
					infoList: this.card.infoList,
					infoDetail: this.card.infoDetail,
					actionT24: ACTION_T24_CREATE
				} : null,
				combo: {
					id: (this.dataFrmDashboard && this.dataFrmDashboard.combo) ? this.dataFrmDashboard.combo.id : this.comboInfo.transID,
					inputter: this.auditInfo.inputter,
					// authoriser: this.auditInfo.authoriser,
					coCode: this.auditInfo.coCode,
					departCode: this.auditInfo.roomCode,
					saleType: this.generalInfo.saleType,
					saleId: this.generalInfo.saleId,
					brokerType: this.generalInfo.brokerType,
					brokerId: this.generalInfo.brokerId,
					comboType: 'SUPER',
					priority: this.comboInfo.priority,
					actionT24: ACTION_T24_CREATE
				}
			};
		});

	}

	onImporterCreate() {
		this.commonService.isClickedButton$.next(true);
		if (this.parentForm.invalid) {
			console.log(this.parentForm);
			// new KTScrolltop(this.el.nativeElement, this.scrollTopOptions);
			// if (this.parentForm.controls.customerForm.invalid) {
			window.scroll(0, 0);
			// } else if (this.parentForm.controls.accountInfoForm.invalid) {
			// 	window.scroll(0, 2000);
			// } else if (this.parentForm.controls.smsRegisterForm.invalid) {
			// 	window.scroll(0, 2400);
			// } else if (this.parentForm.controls.ebankForm.invalid) {
			// 	window.scroll(0, 2650);
			// } else if (this.parentForm.controls.openCardForm.invalid) {
			// 	window.scroll(0, 3100);
			// } else if (this.parentForm.controls.infoForm.invalid) {
			// 	window.scroll(0, 3350);
			// }
			return;
		}
		console.log(this.bodyRequest);
		this.isLoading$.next(true);
		let body = this.bodyRequest;
		if (this.dataFrmDashboard) {
			this.bodyRequest.transaction.data.combo.id = this.dataFrmDashboard.combo.id;
		}
		console.log(body, 'bodyRequest>>>>>>>>>>>>>');
		this.commonService.actionGetTransactionResponseApi(this.bodyRequest).pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == 'OK' && r.seabRes.body.transaction.responseCode == '00') {
					this.toastService.success(this.dataFrmDashboard ? 'Cập nhật combo 3 thành công' : 'Thêm mới combo 3 thành công');
					this.websocketClientService.sendMessageToUserApproved(NOTIFICATION.INPUTTER, this.parentForm.controls.comboInfoForm.value.transID, NOTIFICATION.PRODUCT_TYPE.SUPPER);
					this.router.navigate(['/pages/dashboard']);
					this.sessionStorage.clear(DATA_FROM_DASHBOARD);
				} else {
					this.toastService.error(r.desc);
				}
			});
	}

	onApproved() {
		this.isLoading$.next(true);
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = APPROVE_COMBO;
		transaction.data = {
			id: this.dataFrmDashboard ? this.dataFrmDashboard.combo.id : '',
			authoriser: this.localStorage.retrieve(USERNAME_CACHED),
			actionT24: APPROVE
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		console.log(bodyRequest, 'bodyRequest>>>>>>>>>>>>>');
		let _this = this;
		this.commonService.actionGetTransactionResponseApi(bodyRequest)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(r => {
				if (r.seabRes.body.status == 'OK' && r.seabRes.body.transaction.responseCode == '00') {
					this.toastService.success(this.dataFrmDashboard ? 'Cập nhật combo 3 thành công' : 'Thêm mới combo 3 thành công');
					this.websocketClientService.sendMessageToUser(_this.dataFrmDashboard.inputter, NOTIFICATION.APPROVED, _this.dataFrmDashboard.id, NOTIFICATION.PRODUCT_TYPE.SUPPER);
					this.router.navigate(['/pages/dashboard']);
				} else {
					this.toastService.error(r.desc);
				}
			});
	}

	ngOnDestroy(): void {
		this.commonService.isClickedButton$.next(false);
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		if (this.navigateSub) {
			this.navigateSub.unsubscribe();
		}
	}

	removeForm() {
		this.parentForm.reset();
	}

	removeRecord() {
		let command = GET_TRANSACTION;
		let transaction = new TransactionModel();
		transaction.authenType = 'deleteCombo';
		transaction.data = {
			id: this.dataFrmDashboard.combo.id
		};
		let bodyRequest = new BodyRequestTransactionModel(command, transaction);
		let modalRef = this.modalService.open(ModalDeleteComponent, {
			size: 'sm',
			backdrop: 'static',
			keyboard: false,
			centered: true
		});

		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn xóa!';
		modalRef.componentInstance.data = this.dataFrmDashboard;
		modalRef.componentInstance.bodyDeleteRequest = bodyRequest;
		modalRef.result.then(r => {
			if (r == 'done') {
				this.toastService.success('Xóa combo 3 thành công');
			} else {
				this.toastService.error(r.desc);
			}
		});
	}

	get APPROVED() {
		if (this.dataFrmDashboard) {
			return this.dataFrmDashboard.combo.status.startsWith(APPROVE);
		}
	}

	get frm() {
		return this.parentForm.controls;
	}

	/**
	 * Get report
	 */
	getReportId() {
		let customerInfo = this.frm.customerForm.value;
		let accountInfo = this.frm.accountInfoForm.value;
		let seAnetInfo = this.frm.ebankForm.value;
		let smsInfo = this.frm.smsRegisterForm.value;
		let cardInfo = this.frm.internationalCardForm.value;
		let extraCardInfo: any;


		// @ts-ignore
		let city = this.customerComponent.cityLabel._projectedViews[0].context.label;
		// @ts-ignore
		let district = this.customerComponent.districtLabel._projectedViews[0].context.label;
		// @ts-ignore
		let nationality = this.customerComponent.nationalLabel._projectedViews[0].context.label;
		// @ts-ignore
		let residenceCountry = this.customerComponent.residenceLabel._projectedViews[0].context.label;
		// @ts-ignore
		let job = this.customerComponent.jobLabel._projectedViews[0].context.label;

		console.log(customerInfo);


		let body: FormPDF = new FormPDF();
		body.command = 'GET_REPORT';
		body.report = {
			authenType: 'getReport_SEATELLER_REGISTER',
			exportType: 'PDF',
			transactionId: this.frm.comboInfoForm.value.transID,
			customerInfo: {
				fullName: customerInfo.customerName,
				gttt: customerInfo.identification[0].gttt,
				issueDate: moment(customerInfo.identification[0].idenTime).format('DD/MM/YYYY'),
				issuesAddress: customerInfo.identification[0].organization,
				mobilePhone: customerInfo.contactInfos[0].mobile,
				email: customerInfo.contactInfos[0].email,
				otherPhone: customerInfo.contactInfos[0].phone,
				seabID: customerInfo.customerId
			},
			registerService: {
				isOtherTKKT: false,
				isSeaSave: false,
				isSelectAll: true,
				isSmsBanking: false,
				isTKKT: false,
				isUsdSeaSave: false,
				isUsdTKKT: false,
				isVndSeaSave: false,
				otherCurrency: null,
				otherSeaSave: null,
			},
			mainCard: cardInfo.cardCheckbox ? {
				addressReceiveCard: null,
				cardName: cardInfo.cardName,
				disagreeOnlineBanking: false,
				isCurrentAddress: false,
				isMasterCard: false,
				isMasterCardStandard: false,
				isNormal: true,
				isS24Card: false,
				isVisa: true,
				isVisaPremium: false,
				isVisaStandard: false,
			} : null,
		};

		if (customerInfo.ownerBen == '1.DONG SO HUU' && this.customerComponent.ownerBenData && this.customerComponent.ownerBenAccount) {
			let ownerBen = this.customerComponent.ownerBenData;
			let ownerAccount = this.customerComponent.ownerBenAccount;
			body.report.mainCustomer = {
				fullName: ownerBen.shortName,
				gender: ownerBen.gender,
				seabID: ownerAccount && ownerAccount.length > 0 ? (ownerAccount && ownerAccount.length > 0 ? ownerAccount[0].accountID : null) : null,

				// Nếu không có tài khoản tại SeABank
				birthDate: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.dateOfBirth,
				birthPlace: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.placeOfBirth,
				chucVu: '',
				cuaKhau: '',
				currentAddress: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.currentAddress,
				diaChiNN: '',
				diaChiVN: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.permanentAddress,
				email: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.email,
				fromDate: '',
				gttt: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.legalID,
				hoKhau: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.permanentAddress,
				isCuTru: false,
				isMarried: ownerAccount && ownerAccount.length > 0 ? '' : (ownerBen.maritalStatus == 'MARRIED' ? true : (ownerBen.maritalStatus == 'SINGLE' ? false : '')),
				isSameAddress: false,
				issueDate: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.legalIssDate,
				issuesAddress: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.legalIssAuth,
				job: '',
				mobilePhone: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.sms,
				nationality: ownerAccount && ownerAccount.length > 0 ? '' : ownerBen.nationality,
				ngayNhapCanh: '',
				otherAdd: '',
				otherMarried: '',
				otherNationality: '',
				otherPhone: '',
				otherPhuong: '',
				otherQuan: '',
				otherTinh: '',
				phuongXa: '',
				quanHuyen: ownerAccount && ownerAccount.length > 0 ? '' : (this.customerComponent.districtList2.find(c => Number(c.districID) == Number(ownerBen.seabDistrict1)).name_gb),
				relationship: '',
				school: '',
				soThiThuc: '',
				thuNhap: '',
				tinhTp: ownerAccount && ownerAccount.length > 0 ? '' : (this.customerComponent.cityList.find(c => Number(c.cityID) == Number(ownerBen.province)).name_gb),
				toDate: '',
			};
		}

		this.reportService.getReportForm(body).subscribe(res => {
			if (res && res.status == STATUS_OK && res.responseCode == '00') {
				console.log(res.report.data);
				let dataLink: DataLinkMinio = new DataLinkMinio();
				dataLink.fileName = res.report.data.fileName;
				dataLink.fileType = res.report.data.fileType;
				dataLink.bucketName = res.report.data.bucketName;
				dataLink.folder = res.report.data.folder;
				console.log(dataLink);
				this.websocketClientService.sendMessageToTablet(dataLink, 'viewForm');
			}
		});
	}
}
