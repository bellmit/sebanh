import {data} from './../../transaction-operations/seanet/seanet.component';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {CoreAiService} from '../service/core-ai.service';
import {BehaviorSubject, forkJoin, Observable, Subject} from 'rxjs';
import {
	CODE_00,
	GET_TRANSACTION,
	GTTT_KHAC_GTTT_DA_DANG_KY,
	GTTT_KHAC_GTTT_DANG_KY_ID_KH,
	GTTT_KHONG_KHOP_KIEM_TRA_LAI_HOAC_CAP_NHAT,
	ID_GTTT_VA_KHUON_MA_CHUA_KHOP_DUNG,
	ID_THEO_GTTT_KHAC_ID_THEO_KHUON_MAT,
	KH_CHUA_DANG_KY_VAN_TAY,
	KH_CHUA_DUOC_DANG_KY_KHUON_MAT,
	KH_CHUA_DUOC_DANG_KY_KHUON_MAT_VA_GTTT,
	KHACH_HANG_CHUA_DANG_KY_KHUON_MAT,
	KHONG_NHAN_DIEN_DUOC_ID_KH_HOP_LE,
	KHUON_MAT_VA_GTTT_KHONG_KHOP,
	PROSPECT_KEY,
	PROSPECT_VALUE,
	DATA_CART_TYPE_CREDIT,
	DATA_CART_TYPE_DEBIT,
	STATUS_OK,
	VAN_TAY_CUA_KH_CHUA_DUOC_DANG_KY_VOI_ID,
	VAN_TAY_KHONG_KHOP_ID_KHUON_MAT_VA_GTTT,
	VAN_TAY_KHONG_KHOP_VOI_KHUON_MAT_VA_GTTT,
	SERVER_API_URL_ACC_UTIL,
	HEADER_ACC_UTIL,
	SERVER_API_CUST_INFO,
	HEADER_API_ACCOUNT
} from '../../../../../../shared/util/constant';
import {CommonService} from '../../../../../common-service/common.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {LocalStorageService} from 'ngx-webstorage';
import {finalize, map, takeUntil} from 'rxjs/operators';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import * as _ from 'lodash';
import {CustomerInfoModel} from './prospect.model';
import {AppConfigService} from '../../../../../../app-config.service';
import {GtttUrlModel} from '../../../../../../shared/model/GtttUrl.model';
import {SignatureService} from '../service/signature.service';
import moment from 'moment';
import {getUniqueListBy, splitBy} from '../../../../../../shared/util/Utils';

@Component({
	selector: 'kt-identify-customer-info',
	templateUrl: './identify-customer-info.component.html',
	styleUrls: ['./identify-customer-info.component.scss']
})
export class IdentifyCustomerInfoComponent implements OnInit, OnDestroy {
	// List data in component
	listIDCustomer: any = [];
	customerId: string = null;
	prospectId: string = null;
	suggestProductSelling = [];
	idsFromFaceOnly: any[] = [];
	idsFromIdentifyOnly: any[] = [];
	idsFromFingerOnly: any[] = [];
	customerInfoFromSearch: any;
	customersInfo: any;
	selectedCustomer$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	selectedCustomerId$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	selectedObject$: BehaviorSubject<any> = new BehaviorSubject(null);
	selectedCustomerInformation$: BehaviorSubject<CustomerInfoModel> = new BehaviorSubject<CustomerInfoModel>({
		email: '',
		currentAddress: '',
		legalDocName: '',
		legalID: '',
		shortName: '',
		sms: '',
	});

	isLoading$: BehaviorSubject<any> = new BehaviorSubject<any>(false);
	isLoadingCustomerInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isShow360Customer = new BehaviorSubject<boolean>(false);
	allDataList: any = {};

	cusId: any;
	// Paging
	page = 1;
	pageSize = 1;
	maxSize = 5;

	// Similarity core AI percent
	similarCoreAIFace: any;
	similarCoreAIIdentify: any;
	similarCoreAIFinger: any;

	// Title
	items = ['Tài khoản', 'TKTG', 'Vay', 'Thẻ', 'Ebank', 'SMS', 'Bảo hiểm'];
	parentName: any;
	childOne: any;
	childTwo: any;
	dataCacheRouter: any;
	custId: any;
	rightIds: string[] = [];
	listCard$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	listCardDebit$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	listCardCredit$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	listSms$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	listEbank$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	listAcc$: BehaviorSubject<any> = new BehaviorSubject<any>([]);

	destroy$ = new Subject<void>();
	customerT24Info$ = new BehaviorSubject<any>(null);

	constructor(
		private coreAiService: CoreAiService,
		private commonService: CommonService,
		private toastService: ToastrService,
		private router: Router,
		private localStorage: LocalStorageService,
		private dataPowerService: DataPowerService,
		private appConfigService: AppConfigService,
		private signatureService: SignatureService
	) {
		this.parentName = 'Trang chủ';
		this.childOne = 'Nhận diện thông tin khách hàng';
		this.childTwo = null;
		this.rightIds = this.commonService.getRightIdsByUrl(this.router.url);
	}

	ngOnInit() {
		this.displayAsideRight();
		this.processListData();
	}

	/**
	 * Display aside right
	 */
	displayAsideRight() {
		this.commonService.isAsideRight$.next(true);
		this.commonService.isDisplayAsideRight$.next(true);
	}

	processListData() {

		console.log('window.history.state', window.history.state);
		let customerInfo = window.history.state.customerInfo;
		//Tìm kiếm nhanh bằng IDCustomer => Chỉ có 1 bản ghi
		if (customerInfo) {
			this.cusId = customerInfo.custId;
			this.getInfoCustomer360(this.cusId);
			this.commonService.customerId$.next(this.cusId);
			this.isLoadingCustomerInfo$.next(true);
			this.getCustomerInfo1(customerInfo.custId)
				.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
				.subscribe(customerInfo => {
					this.customersInfo = customerInfo;
					this.customerT24Info$.next(customerInfo);
					this.listIDCustomer.push(this.customersInfo);
					this.findProductSellingSuggest();
				});
			this.getImageOfUser(customerInfo.custId)
				.subscribe(imageInfo => {
					this.customerInfoFromSearch = imageInfo;
					this.passImageToAsideRight(imageInfo);
				});
		} else if (window.history.state.customerId) {// khong nhan dien duoc, kiem tra trung lap co id
			this.cusId = window.history.state.customerId;
			this.commonService.customerId$.next(this.cusId);
			this.getInfoCustomer360(this.cusId);
			this.isLoadingCustomerInfo$.next(true);
			this.getCustomerInfo1(this.cusId)
				.pipe(finalize(() => this.isLoadingCustomerInfo$.next(false)))
				.subscribe(customerInfo => {
					this.customersInfo = customerInfo;
					this.customerT24Info$.next(customerInfo);
					this.listIDCustomer.push(this.customersInfo);
					this.findProductSellingSuggest();
				});
			this.getImageOfUser(this.cusId)
				.subscribe(imageInfo => {
					this.customerInfoFromSearch = imageInfo;
					this.passImageToAsideRight(imageInfo);
				});
		} else if (window.history.state.data) {// Nhận diện được khuôn mặt hoặc GTTT hoặc vân tay
			console.warn('dataCustomerInfo >>>>', window.history.state.data);
			this.listIDCustomer = window.history.state.data;
			if (window.history.state.identification) {
				this.idsFromIdentifyOnly = window.history.state.data;

				console.log('window.history.state.identification', window.history.state.data);

			} else {
				this.idsFromFaceOnly = window.history.state.data;
			}
			if (this.listIDCustomer && this.listIDCustomer.length > 0) {
				this.selectedCustomerId$.next(this.listIDCustomer[0]);
				this.passImageToAsideRight(this.listIDCustomer[0].info);

				this.commonService.customerId$.next(this.selectedCustomerId$.getValue().user_id || this.selectedCustomerId$.getValue().info.user_id);

				this.getInfoCustomer360(this.commonService.customerId$.getValue());
			}
			if (!this.checkProspect(this.selectedCustomerId$.getValue())) {
				this.getCustomerInfo(this.selectedCustomerId$.getValue().user_id || this.selectedCustomerId$.getValue().info.user_id);
			}
			this.getAllCustomerID();
			this.getSimilarCoreAI();
		} else {
			this.router.navigate(['pages/identify']);
		}
	}

	ngOnDestroy() {
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
		this.coreAiService.IdsFromIdentification$.next([]);
		this.coreAiService.IdsFromFingerPrint$.next([]);
		this.coreAiService.isClickScanIdentify$.next(false);
		this.coreAiService.isClickScanFinger$.next(false);
		this.commonService.isDisplayNotice$.next(false);
		this.commonService.textNotify$.next(null);
		this.listIDCustomer = [];
		this.idsFromFaceOnly = [];
		this.idsFromIdentifyOnly = [];
		this.idsFromFingerOnly = [];
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Get similarity Core AI from Admin management
	 */
	getSimilarCoreAI() {
		this.similarCoreAIFinger = this.localStorage.retrieve('similarFingerprint')
			? (this.localStorage.retrieve('similarFingerprint').newValue / 100) : 0.80;

		this.similarCoreAIIdentify = this.localStorage.retrieve('similarIdentity') ?
			(this.localStorage.retrieve('similarIdentity').newValue / 100) : 0.80;

		this.similarCoreAIFace = this.localStorage.retrieve('similarFace') ?
			(this.localStorage.retrieve('similarFace').newValue / 100) : 0.80;
	}

	getAllCustomerID() {
		this.getAllCustomerIdFromIdentify();
		this.getAllCustomerIdFromFingerPrint();
		// this.findProductSellingSuggest();
	}

	getAllCustomerIdFromIdentify() {
		this.coreAiService.IdsFromIdentification$
			.pipe(takeUntil(this.destroy$))
			.subscribe(identification => {
				if (identification && this.coreAiService.isClickScanIdentify$.getValue()) {
					let listIdByIdentification: any[] = this.coreAiService.IdsFromIdentification$.getValue();
					let IdsFromFace: string[] = [];
					let IdsFromIdentification: string[] = [];

					/**
					 * Lấy ra user_id từ nhận diện khuôn mặt và push vào mảng #IdsFromFace
					 */

					console.log('listIdByIdentification', listIdByIdentification);
					if (this.listIDCustomer && this.listIDCustomer.length > 0) {
						this.listIDCustomer.forEach((idFromFace) => {
							if (!idFromFace) {
								this.listIDCustomer.splice(this.listIDCustomer.indexOf(idFromFace), 1);
							}
							if (idFromFace) {
								IdsFromFace.push(idFromFace.user_id);
							}
						});
					}

					/**
					 * Lấy ra user_id từ quét GTTT và push vào mảng #IdsFromIdentification
					 */
					listIdByIdentification.forEach(identificationId => {
						if (identificationId.metadata.card_front.id.confidence >= this.similarCoreAIIdentify) {
							IdsFromIdentification.push(identificationId.user_id);
							this.idsFromIdentifyOnly.push(identificationId);
						}
					});
				}
				this.subscribeIdentifyChanges();
			});
	}

	getAllCustomerIdFromFingerPrint() {
		this.coreAiService.IdsFromFingerPrint$
			.pipe(takeUntil(this.destroy$))
			.subscribe(fingerPrintId => {
				if (fingerPrintId && this.coreAiService.isClickScanFinger$.getValue()) {
					let listFingerPrint: any[] = this.coreAiService.IdsFromFingerPrint$.getValue();
					let IdsTotal: string[] = [];
					let IdsFromFingerprint: string[] = [];

					//Get total Ids from face scan and identification scan
					this.listIDCustomer.forEach(idFromTotal => {
						IdsTotal.push(idFromTotal.info.user_id);
					});

					this.idsFromFingerOnly.push(listFingerPrint[0]);
					console.log('listFingerPrint', listFingerPrint[0]);
					// this.idsFromFingerOnly.push(listFingerPrint);

					console.log('this.idsFromFingerOnly', this.idsFromFingerOnly);
				}
				this.subscribeFingerPrintChanges();
			});
	}

	/**
	 * Subscribe identify changes then assigned to #variable lisIDCustomer
	 */
	subscribeIdentifyChanges() {
		// Tạo ra 2 mảng để chứa user_id của khuôn mặt, gttt, vân tay
		let idsFace: any[] = [], idsIdentity: any[] = [], idsFinger: any[] = [];
		this.idsFromFaceOnly = getUniqueListBy(this.idsFromFaceOnly, 'user_id');
		this.idsFromFaceOnly.map(face => {
			// if (face.result && face.result.matched_users[0]) {
			// 	idsFace.push(face.result.matched_users[0].user_id);
			// }
			idsFace.push(face.user_id);
		});
		this.idsFromIdentifyOnly = getUniqueListBy(this.idsFromIdentifyOnly, 'user_id');
		console.log('this.idsFromIdentifyOnly', this.idsFromIdentifyOnly);
		this.idsFromIdentifyOnly.map(iden => {
			idsIdentity.push(iden.user_id);
		});
		this.idsFromFingerOnly = getUniqueListBy(this.idsFromFingerOnly, 'user_id');

		console.log('this.idsFromFingerOnly', this.idsFromFingerOnly);
		this.idsFromFingerOnly.map(finger => {
			idsFinger.push(finger.info.user_id);
		});
		const finalIdFormIden = idsIdentity[idsIdentity.length - 1];
		const equalFaceVsIden = idsFace.findIndex(id => id == finalIdFormIden);

		/**
		 * TH1: NHẬN DIỆN RA 1 KH KHI QUÉT KHUÔN MẶT
		 */
		if (this.coreAiService.isClickScanIdentify$.getValue() && this.coreAiService.cardFrontScan$.getValue()) {
			if (idsFace && idsFace.length == 1) {
				// Nếu quét GTTT không ra ID
				if (idsIdentity && idsIdentity.length == 0) {
					this.listIDCustomer = this.idsFromFaceOnly;
					// this.commonService.setNotifyInfo(GTTT_KHAC_GTTT_DA_DANG_KY, 'error', 15000);
					// Nếu quét GTTT ra ID khác
				} else if (idsIdentity && idsIdentity.length) {
					this.listIDCustomer.push(...this.idsFromIdentifyOnly);
					this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
					if (equalFaceVsIden < 0) {
						this.commonService.setNotifyInfo(ID_THEO_GTTT_KHAC_ID_THEO_KHUON_MAT, 'error', 15000);
					}
				}
			}
		}

		/**
		 * TH2: NHẬN DIỆN RA n KH KHI QUÉT KHUÔN MẶT
		 */
		if (this.coreAiService.isClickScanIdentify$.getValue() && this.coreAiService.cardFrontScan$.getValue()) {
			if (idsFace.length > 1) {
				// Kiểm tra trùng khớp ID khuôn mặt và GTTT
				let equalFaceVsIden = idsFace.filter(item => idsIdentity.indexOf(item) >= 0);
				console.log(equalFaceVsIden, 'equalFaceVsIden');
				// Nếu quét GTTT không ra ID nào
				if (idsIdentity.length == 0) {
					this.commonService.setNotifyInfo(GTTT_KHAC_GTTT_DA_DANG_KY, 'error', 15000);
				} else if (idsIdentity.length > 0) {//
					if (equalFaceVsIden.length > 0) {// có nhiều user khớp khuôn mặt với gttt
						let indexFaceEqual = _.findIndex(this.idsFromIdentifyOnly, function(o) {
							return o.user_id == equalFaceVsIden[0];
						});
						console.warn('indexFaceEqual', indexFaceEqual);
						this.listIDCustomer.push(...this.idsFromIdentifyOnly);
						this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
					} else if (equalFaceVsIden.length == 0) {
						this.listIDCustomer.push(...this.idsFromIdentifyOnly);
						this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
						this.commonService.setNotifyInfo(GTTT_KHAC_GTTT_DA_DANG_KY, 'error', 15000);
					}
				}
			}
		}


		/**
		 * TH3: KHÔNG NHẬN DIỆN RA KH
		 */
		// if (this.coreAiService.isClickScanIdentify$.getValue()) {
		// 	if (idsFace.length == 0) {
		// 		if (idsIdentity.length > 1) {
		// 			this.listIDCustomer = this.idsFromIdentifyOnly;
		// 			this.commonService.setNotifyInfo(`Cảnh báo: Có ${idsIdentity.length} KH trùng GTTT`, 'error', 15000)
		// 		}
		// 	}
		// }

	}

	/**
	 * Subscribe finger-print changes then assigned to #variable lisIDCustomer
	 */
	subscribeFingerPrintChanges() {
		// Tạo ra 2 mảng để chứa user_id của khuôn mặt, gttt, vân tay
		let idsFace: any[] = [], idsIdentity: any[] = [], idsFinger: any[] = [];
		this.idsFromFaceOnly.map(face => {
			idsFace.push(face.user_id);
			// if (face.result && face.result.matched_users[0]) {
			// 	idsFace.push(face.result.matched_users[0].user_id);
			// }
		});

		this.idsFromIdentifyOnly.map(iden => {
			idsIdentity.push(iden.user_id);
		});

		console.log('this.idsFromFingerOnly', this.idsFromFingerOnly);
		// return
		this.idsFromFingerOnly.map(finger => {
			idsFinger.push(finger.info.user_id || finger[0].info.user_id);
		});


		let equalFaceVsIden = idsFace.map(item => idsIdentity.indexOf(item) >= 0);

		/**
		 * TH1: NHẬN DIỆN RA 1 KH KHI QUÉT VÂN TAY
		 */
		if (this.coreAiService.isClickScanFinger$.getValue()) {
			if (idsFace && idsFace.length == 1) {
				// Quét GTTT trùng với khuôn mặt
				if (equalFaceVsIden.length > 0) {
					// Kiểm tra ID của vân tay có khớp với ID của (khuôn mặt + GTTT) không
					let differentFingerVsFaceAndIden = idsFinger.filter(f => equalFaceVsIden.indexOf(f) < 0);
					console.log(differentFingerVsFaceAndIden, 'differentFingerVsFaceAndIden');
					// Nếu quét vân tay không khớp với ID theo GTTT và ID khuôn mặt
					if (differentFingerVsFaceAndIden.length > 1) {
						this.listIDCustomer.push(...this.idsFromFingerOnly);
						this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
						this.commonService.setNotifyInfo(VAN_TAY_KHONG_KHOP_VOI_KHUON_MAT_VA_GTTT, 'error', 15000);
						// Nếu quét vân tay không ra ID nào
					} else if (differentFingerVsFaceAndIden.length == 0) {
						this.listIDCustomer = this.idsFromFaceOnly;
						// this.commonService.setNotifyInfo(KHACH_HANG_CHUA_DANG_KY_VAN_TAY, 'error', 15000);
					}
					// Quét GTTT không trùng với khuôn mặt
				} else if (equalFaceVsIden.length == 0) {
					// Kiểm tra trùng khớp Vân tay và GTTT
					let equalFingerVsIden = idsFinger.filter(i => idsIdentity.indexOf(i) >= 0);
					console.log(equalFingerVsIden, 'equalFingerVsIden');
					// Nếu vân tay và GTTT trùng khớp
					if (equalFingerVsIden.length > 0) {
						let indexIdenEqual = _.findIndex(this.idsFromIdentifyOnly, function(o) {
							return o.user_id == equalFingerVsIden[0];
						});
						this.listIDCustomer = [];
						this.listIDCustomer.push(this.idsFromIdentifyOnly[indexIdenEqual]);
						this.listIDCustomer.push(...this.idsFromFingerOnly);
						this.commonService.setNotifyInfo(KHACH_HANG_CHUA_DANG_KY_KHUON_MAT, 'error', 15000);
					}

					// Kiểm tra trùng khớp vân tay và khuôn mặt
					let equalFingerVsFace = idsFinger.filter(g => idsFace.indexOf(g) >= 0);
					console.log(equalFingerVsFace, 'equalFingerVsFace');
					// Nếu quét vân tay ra ID khớp với ID khuôn mặt
					if (equalFingerVsFace.length > 0) {
						let indexIdenEqual = _.findIndex(this.idsFromFingerOnly, function(o) {
							return o.user_id == equalFingerVsFace[0];
						});
						this.listIDCustomer = [];
						// this.listIDCustomer.push(this.idsFromFingerOnly[indexIdenEqual]);
						this.listIDCustomer.push(this.idsFromFaceOnly[indexIdenEqual]);
						this.listIDCustomer.push(...this.idsFromFingerOnly);
						this.commonService.setNotifyInfo(GTTT_KHONG_KHOP_KIEM_TRA_LAI_HOAC_CAP_NHAT, 'error', 15000);
					}

					// Nếu quét vân tay ra ID không khớp với ID khuôn mặt và GTTT
					if (equalFingerVsIden.length == 0 && equalFingerVsFace.length == 0) {
						this.listIDCustomer.push(...this.idsFromFingerOnly);
						this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
						// this.processDataSendTablet('recognizing');
						this.commonService.setNotifyInfo(VAN_TAY_KHONG_KHOP_ID_KHUON_MAT_VA_GTTT, 'error', 15000);
					}

					// Nếu quét vân tay không ra ID nào
					if (idsFinger.length == 0) {
						this.commonService.setNotifyInfo(KHONG_NHAN_DIEN_DUOC_ID_KH_HOP_LE, 'error', 15000);
					}
				}
			}
			console.log('this.listIDCustomer', this.listIDCustomer);
		}

		/**
		 * TH2: NHẬN DIỆN RA n KH KHI QUÉT KHUÔN MẶT
		 */
		if (this.coreAiService.isClickScanFinger$.getValue()) {
			if (idsFace.length > 1) {
				// Kiểm tra trùng khớp ID khuôn mặt và GTTT
				let equalFaceVsIden = idsFace.filter(item => idsIdentity.indexOf(item) >= 0);
				// Nếu 1 ID của GTTT trùng khớp với 1 ID của khuôn mặt
				if (equalFaceVsIden.length > 0) {
					// Nếu quét vân tay không ra ID nào
					if (idsFinger.length == 0) {
						// this.listIDCustomer vẫn thê
						this.commonService.setNotifyInfo(KH_CHUA_DANG_KY_VAN_TAY, 'error', 15000);
					} else if (idsFinger.length > 0) {
						// Nếu quét vân tay ra ID khác với ID khuôn mặt và GTTT
						let equalFingerVsFaceAndIden = equalFaceVsIden.filter(e => idsFinger.indexOf(e) >= 0);
						if (equalFingerVsFaceAndIden.length == 0) {
							this.listIDCustomer.push(...this.idsFromFingerOnly);
							this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
							this.commonService.setNotifyInfo(VAN_TAY_KHONG_KHOP_ID_KHUON_MAT_VA_GTTT, 'error', 15000);
						}
					}
					// Nếu GTTT và khuôn mặt ra nhiều ID hoặc k có ID nào
				} else if (equalFaceVsIden.length == 0) {
					if (idsFinger.length == 0) {
						// listIDCustomer vẫn thế
						this.commonService.setNotifyInfo(ID_GTTT_VA_KHUON_MA_CHUA_KHOP_DUNG, 'error', 15000);
					} else if (idsFinger.length > 0) {
						// Kiểm tra trùng khớp vân tay với GTTT
						let equalFingerVsIden = idsFinger.filter(fin => idsIdentity.indexOf(fin) >= 0);
						console.log(equalFingerVsIden, 'equalFingerVsIden');
						// Nếu quét vân tay trùng ID với GTTT
						if (equalFingerVsIden.length > 0) {
							let indexIdenEqual = _.findIndex(this.idsFromIdentifyOnly, function(o) {
								return o.user_id == equalFingerVsIden[0];
							});
							this.listIDCustomer = [];
							this.listIDCustomer.push(this.idsFromIdentifyOnly[indexIdenEqual]);
							this.listIDCustomer.push(...this.idsFromFingerOnly);
							this.commonService.setNotifyInfo(KH_CHUA_DUOC_DANG_KY_KHUON_MAT, 'error', 15000);
						}

						// Kiểm tra trùng khớp khuôn mặt với vân tay
						let equalFaceVsFinger = idsFinger.filter(fin2 => idsFace.indexOf(fin2) >= 0);
						// Nếu quét vân tay trùng khớp với khuôn mặt
						if (equalFaceVsFinger.length > 0) {
							let indexFaceEqual = _.findIndex(this.idsFromFingerOnly, function(o) {
								return o.user_id == equalFaceVsFinger[0];
							});
							this.listIDCustomer = [];
							// this.listIDCustomer.push(this.idsFromFingerOnly[indexFaceEqual]);
							this.listIDCustomer.push(this.idsFromFaceOnly[indexFaceEqual]);
							this.listIDCustomer.push(...this.idsFromFingerOnly);
							this.commonService.setNotifyInfo(VAN_TAY_KHONG_KHOP_ID_KHUON_MAT_VA_GTTT, 'error', 15000);
						}

						if (equalFingerVsIden.length == 0 && equalFaceVsFinger.length == 0) {
							this.listIDCustomer.push(...this.idsFromFingerOnly);
							this.listIDCustomer = getUniqueListBy(this.listIDCustomer, 'user_id');
						}

					}
				}
			}
		}

		/**
		 * TH3: KHÔNG NHẬN DIỆN RA KH KHI QUÉT KHUÔN MẶT
		 */
		if (this.coreAiService.isClickScanFinger$.getValue()) {
			if (idsFace.length == 0) {

				if (idsIdentity.length == 0) {
					if (idsFinger.length == 1) {
						this.listIDCustomer = this.idsFromFingerOnly;
						this.commonService.setNotifyInfo(KH_CHUA_DUOC_DANG_KY_KHUON_MAT_VA_GTTT, 'error', 15000);
					} else if (idsFinger.length > 1) {
						this.listIDCustomer = this.idsFromFingerOnly;
						this.commonService.setNotifyInfo(`Cảnh báo: Có ${this.idsFromFingerOnly.length} KH trùng vân tay`, 'error', 15000);
					}
				} else {
					if (idsFinger.length == 0) {
						// listCustomer vẫn thế
						this.commonService.setNotifyInfo(VAN_TAY_CUA_KH_CHUA_DUOC_DANG_KY_VOI_ID, 'error', 15000);
					} else if (idsFinger.length > 0) {
						let equalFingerVsIdentity = idsFinger.filter(r => idsIdentity.indexOf(r) >= 0);
						if (equalFingerVsIdentity.length > 0) {
							let indexIdentifyEqual = _.findIndex(this.idsFromFingerOnly, function(o) {
								return o.user_id == equalFingerVsIdentity[0];
							});
							this.listIDCustomer = [];
							// this.listIDCustomer.push(this.idsFromFingerOnly[indexIdentifyEqual]);
							this.listIDCustomer.push(this.idsFromIdentifyOnly[indexIdentifyEqual]);
							this.commonService.setNotifyInfo(KH_CHUA_DUOC_DANG_KY_KHUON_MAT, 'error', 15000);

						} else if (equalFingerVsIdentity.length == 0) {
							this.listIDCustomer.push(...this.idsFromFingerOnly);
							this.commonService.setNotifyInfo(VAN_TAY_CUA_KH_CHUA_DUOC_DANG_KY_VOI_ID, 'error', 15000);
						}
					}
				}
			}
		}
	}

	/**
	 * Call request get suggest product
	 */
	findProductSellingSuggest() {
		let gender, age: any;
		if (this.listIDCustomer != null && this.listIDCustomer.length != 0) {
			if (this.customersInfo) {
				// let timeDiff = Math.abs(Date.now() - moment(this.customersInfo.dateOfBirth).unix());
				// let timeDiff = Math.abs(Date.now() - parseDateFrmStr(this.customersInfo.dateOfBirth).getTime());
				// age = String(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365.25));
				age = Math.floor(moment(new Date()).diff(moment(this.customersInfo.dateOfBirth, 'YYYYMMDD'), 'years', true));

				console.log('ageeeeeeeeeeeeee', age);

				gender = this.customersInfo.gender.toUpperCase();
			} else if (this.selectedCustomerId$.getValue().user_id) {

				if (this.selectedCustomerInformation$.getValue()) {
					age = `${moment(new Date()).get('y') - moment(this.selectedCustomerInformation$.getValue().dateOfBirth, 'YYYYMMDD').get('y')}`;
					gender = this.selectedCustomerInformation$.getValue().gender;
				} else {
					gender = this.selectedCustomerId$.getValue().gender;
					age = this.selectedCustomerId$.getValue().age;
				}
			}
		}
		if (gender || age) {
			let body: object = {
				command: GET_TRANSACTION,
				transaction: {
					authenType: 'FindProductsSellingSuggest',
					sex: gender ? gender.toUpperCase() : null,
					age: age + ''
				}
			};
			this.isLoading$.next(true);
			this.commonService.getListSlaByUserGroup(body)
				.pipe(finalize(() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res && res.seabRes.body.status === STATUS_OK && res.seabRes.body.responseCode === CODE_00) {
						this.suggestProductSelling = res.seabRes.body.data;
					}
				});
		}
	}

	displayCustomer360() {
		const current = this.isShow360Customer.getValue();
		this.isShow360Customer.next(!current);
	}

	calculateTotalPage() {
		const total = this.page * this.pageSize;
		if (total > this.listIDCustomer.length) {
			return this.listIDCustomer.length;
		} else {
			return this.page * this.pageSize;
		}
	}

	updateCustomerInfo(customer: any, type: string) {
		console.log('customerSelected', customer);
		this.commonService.selectUpdateCus$.next(true);
		this.selectedCustomer$.next(customer);
		let customerId;
		if (this.cusId) {
			customerId = this.cusId;//this.customerInfoFromSearch.custId || this.customerInfoFromSearch.user_id;
		} else {
			// Hiện tại đang chưa có khách hàng vãng lai nên không check PROSPECT
			// if (this.selectedCustomer$.getValue().id.startsWith('PRO')) {
			// 	customerId = this.selectedCustomer$.getValue().id;
			// } else
			// {
			customerId = this.selectedCustomer$.getValue().user_id ? this.selectedCustomer$.getValue().user_id : (this.selectedCustomer$.getValue().profile[0].user_id ? this.selectedCustomer$.getValue().profile[0].user_id : this.selectedCustomer$.getValue().customerID);
			// }
		}
		if (type == 'updateCustomer') {
			this.router.navigateByUrl('pages/customer-manage', {
				state: {
					customerId: customerId,
				}
			});
		} else if (type == 'signature') {
			this.router.navigateByUrl('pages/customer-manage', {
				state: {
					customerId: customerId,
					isUpdateSignature: true
				}
			});
		}
	}

	onNavigateUrl(url: string) {
		console.warn(this.selectedCustomerId$.getValue(), 'selected customer');
		if (this.selectedCustomerId$.getValue()) {
			this.passImageToAsideRight(this.selectedCustomerId$.getValue().info);
		}
		if (this.listIDCustomer && this.listIDCustomer.length != 0) {
			if (this.customersInfo) {
				this.customerId = this.customersInfo.customerID;
			} else {
				this.customerId = this.selectedCustomerId$.getValue().user_id;
			}
		}
		this.coreAiService.navigateToCombo$.next(true);

		if (this.customerId) {
			this.localStorage.store('customerCombo', this.customerId);
			this.router.navigateByUrl(url, {
				state: {
					customerId: this.customerId
				}
			});
		} else {
			this.router.navigateByUrl(url);
		}
	}

	onPageChange(obj: object) {
		const profile = this.listIDCustomer[this.page - 1];
		console.warn('>>> profile ', profile);
		this.selectedCustomerId$.next(profile);
		this.passImageToAsideRight(profile.info);
		if (profile.user_id || profile.info.user_id) {
			this.commonService.customerId$.next(profile.user_id || profile.info.user_id);
			this.getInfoCustomer360(profile.user_id || profile.info.user_id);
			if (!this.checkProspect(profile)) {
				this.getCustomerInfo(profile.user_id || profile.info.user_id);
			}
		} else if (profile.customerID) {
			this.commonService.customerId$.next(profile.customerID);
			this.getInfoCustomer360(profile.customerID);
			if (!this.checkProspect(profile)) {
				this.getCustomerInfo(profile.customerID);
			}
		}
		// this.findProductSellingSuggest();
	}

	getCustomerInfo(customerId: string) {
		this.isLoadingCustomerInfo$.next(true);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => {
				this.isLoadingCustomerInfo$.next(false);
				this.findProductSellingSuggest();
			}))
			.subscribe(res => {
				console.log(res, 'customerInfo');
				if (res && res.status == STATUS_OK) {
					this.selectedCustomerInformation$.next(res.enquiry);
					this.customerT24Info$.next(res.enquiry);
					console.log('selectedCustomerInformation$', this.selectedCustomerInformation$.getValue());
				}
			});
	}

	getCustomerInfo1(customerId: string): Observable<any> {
		let bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;

		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);

		return this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(map((res) => res.enquiry));
	}

	getImageOfUser(userId): Observable<any> {
		return this.coreAiService.getCustomerInfoByUserId(userId)
			.pipe(map((res) => {
				const outputs = res.body.utility.output.infos;
				if (outputs.length) {
					return outputs[0];
				}
				return null;
			}));
	}

	/**
	 *  Check if customer is prospect or not
	 * @param object: which is customer data selected
	 */
	checkProspect(object: any): boolean {
		// if (object && object.result && object.result.matched_users[0] && object.result.matched_users[0].user_id) {
		// 	// let id = object.result.matched_users[0].id;
		// 	let customerId = object.result.matched_users[0].user_id;
		// 	// return (id && id.startsWith(PROSPECT_VALUE) || customerId == PROSPECT_KEY);
		// 	return (customerId && customerId.startsWith(PROSPECT_VALUE));
		// } else
		if (object && object.user_id) {
			const customerId = object.user_id;
			return (customerId && customerId.startsWith(PROSPECT_VALUE));
		}
		if (object && object.id) {
			let id = object.id;
			let customerId = object.user_id;
			return (id && (id.startsWith(PROSPECT_VALUE) || customerId == PROSPECT_KEY));
		}
		return false;
	}

	/**
	 *
	 * @param customerId: id customer
	 */
	getInfoCustomer360(customerId: string): void {
		this.listAcc$.next([]);
		this.listCard$.next([]);
		this.listSms$.next([]);
		this.listEbank$.next([]);
		this.isLoading$.next(true);
		this.custId = customerId;
		console.log('customerIdaaaaaaaaaa', customerId);
		let bodyConfig = CustomerRequestDTO.BODY.BODY_CUSTOMER_360;
		bodyConfig.enquiry.customerId = customerId;
		const url = this.appConfigService.getConfigByKey(SERVER_API_URL_ACC_UTIL);
		const header = this.appConfigService.getConfigByKey(HEADER_ACC_UTIL);


		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(res => {
				if (res) {
					this.allDataList = res.enquiry;
					console.log('this.allDataList', this.allDataList);

					if (this.allDataList) {
						if (this.allDataList.lstAcc) {
							let listAcc = this.allDataList.lstAcc.map(item => {
								return item;
							});
							this.listAcc$.next(listAcc);
						}
						if (this.allDataList.lstCard) {
							this.listCard$.next(this.allDataList.lstCard);
							let listCard = this.allDataList.lstCard.map(item => {
								return item;
							});
							let allCard = [...listCard];
							let listCredit = allCard.filter(item => DATA_CART_TYPE_CREDIT.includes(item.cardType));
							let listDebit = allCard.filter(item => DATA_CART_TYPE_DEBIT.includes(item.cardType));

							this.listCardDebit$.next(listDebit);
							this.listCardCredit$.next(listCredit);
						}

						if (this.allDataList.lstSMS) {
							this.listSms$.next(this.allDataList.lstSMS);
						}
						if (this.allDataList.lstEbank) {
							this.listEbank$.next(this.allDataList.lstEbank);
						}

					}
				}
			});
	}

	chooseTransaction(item, type) {
		let routerLinkData: string = '';
		this.commonService.isAction360$.next(true);
		switch (type) {
			case 'account' :
				routerLinkData = '/pages/account';
				break;
			case 'sms':
				routerLinkData = '/pages/sms';
				break;
			case 'ebank':
				routerLinkData = '/pages/e-bank';
				break;
			case 'card':
				routerLinkData = '/pages/card';
				break;
			// case 'profile':
			// 	console.log('aaaaaaaa', item);
			// 	break;
			default:
				break;
		}
		this.selectedObject$.next(item);
		this.router.navigateByUrl(routerLinkData, {
			state: {
				obj360: this.selectedObject$.getValue(),
				custId: this.custId
			}
		}).then();
	}

	getLinkImage(rawLink: string): string {
		if (!rawLink) {
			return 'assets/media/logos/nodata.png';
		}
		return this.coreAiService.returnLinkGetImage(rawLink);
	}

	passImageToAsideRight(custInfo) {
		if (custInfo) {
			let imageUser = new GtttUrlModel(null, null, null, null, null);
			if (custInfo.idcard) {
				imageUser.cardFront = this.getLinkImage(custInfo.idcard.cropped_card_front_url);
				imageUser.cardBack = this.getLinkImage(custInfo.idcard.cropped_card_back_url);
				imageUser.pictureFace = this.getLinkImage(custInfo.idcard.general_url); // anh khuon mat
			}
			if (custInfo.finger && custInfo.finger.length) {
				imageUser.fingerLeft = this.getLinkImage(custInfo.finger[0].image_url);
				imageUser.fingerRight = this.getLinkImage(custInfo.finger[1] ? custInfo.finger[1].image_url : null);
			}
			if (custInfo.signature && custInfo.signature.length) {
				imageUser.signatures = this.coreAiService.getSignatureLinks(custInfo.signature);
			}
			this.signatureService.gtttUrlModel$.next(imageUser);
		} else {
			this.signatureService.gtttUrlModel$.next(null);
		}
	}

	getSignatureLink(input: any, position: number) {
		if (!!input) {
			const signatures = input.hasOwnProperty('signature') ? input.signature.filter(ele => ele.image_url.includes('SIGNATURE_FULL')) : [];
			if (signatures.length) {
				switch (position) {
					case 1:
						return signatures.length ? this.getRawLink(signatures[0].image_url) : 'assets/media/logos/nodata.png';
					default:
						return signatures.length > 1 ? this.getRawLink(signatures[1].image_url) : 'assets/media/logos/nodata.png';
				}
			}
		}
		return 'assets/media/logos/nodata.png';
	}

	getFingerLink(input: any, position: number) {
		if (!!input) {
			const fingers = input.hasOwnProperty('finger') ? input.finger : [];
			if (fingers.length) {
				switch (position) {
					case 1:
						return this.getLinkImage(fingers.length ? fingers[0].image_url : null);
					default:
						return this.getLinkImage(fingers.length > 1 ? fingers[1].image_url : null);
				}
			}
		}
		return 'assets/media/logos/nodata.png';
	}

	getFaceLink(input: any) {
		if (!!input) {
			// const faces = input.hasOwnProperty('faces') ? input.faces : [];
			// if (faces.length) {
			// 	return this.getLinkImage(faces[0].image_url);
			// }
			const idcard = input.hasOwnProperty('idcard') ? input.idcard : null;
			if (idcard) {
				return this.getLinkImage(idcard.general_url);
			}
		}
		return 'assets/media/logos/nodata.png';
	}

	getRawLink(link: string): string {
		return this.coreAiService.returnLinkGetImage(link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?')));
	}

	splitBy(input: any, char: string) {
		return splitBy(input, char);
	}
}
