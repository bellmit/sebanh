import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from '../../../../../common-service/common.service';
import {CoreAiService} from '../service/core-ai.service';
import {Router} from '@angular/router';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {
	CODE_00,
	GET_ENQUIRY, GET_TRANSACTION,
	HEADER_API_T24_ENQUIRY,
	SEVER_API_T24_ENQUIRY, STATUS_OK,
} from '../../../../../../shared/util/constant';
import {AppConfigService} from '../../../../../../app-config.service';
import {finalize, first, map, take} from 'rxjs/operators';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalNotifyComponent} from '../../../../../../shared/directives/modal-common/modal-notify/modal-notify.component';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {IOrcCardModel} from '../../../../../../shared/model/orc-card.model';
import {Store} from '@ngrx/store';
import {removeOrcCard, updateOrcCard} from '../../../../../../shared/state/action/orc-card.action';
import moment from 'moment';
import {LocalStorageService} from 'ngx-webstorage';

@Component({
	selector: 'kt-not-found-customer',
	templateUrl: './not-found-customer.component.html',
	styleUrls: ['./not-found-customer.component.scss']
})
export class NotFoundCustomerComponent implements OnInit, OnDestroy {
	header: any;
	apiUrl: any;
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isChecking$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isPredicting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	customersFromSearch: any[] = [];
	isSearch: boolean = false;
	similarCompareUser: any;
	similarValue: number;
	predictUser: any[] = [];
	selectedCustomer$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	suggestProductSelling$ = new BehaviorSubject<any[]>([]);
	customerId: string = null;

	constructor(private commonService: CommonService,
				public coreAiService: CoreAiService,
				private dataPowerService: DataPowerService,
				private appConfigService: AppConfigService,
				private localStorage: LocalStorageService,
				private router: Router,
				private modalService: NgbModal,
				private store: Store<{ orcCard: IOrcCardModel }>
	) {
		this.header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		this.apiUrl = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
	}

	ngOnInit() {

		this.checkFaceScanned();
		this.openModalNotFound();
		this.subscribeIdentifyIds();
		this.subscribeFingerIds();
	}

	ngOnDestroy() {
		// this.commonService.isAsideRight$.next(false);
		// this.commonService.isDisplayAsideRight$.next(false);
		this.coreAiService.isScanIdentity$.next(false);
		this.coreAiService.IdsFromIdentification$.next(null);
		this.commonService.isDisplayNotice$.next(false);
		this.commonService.textNotify$.next(null);
		this.isLoading$.next(false);
		this.isChecking$.next(false);
		this.isPredicting$.next(false);
	}

	checkFaceScanned() {
		console.log('check face');
		if (!this.coreAiService.faceScan$.getValue()) {
			this.router.navigateByUrl('/pages/identify');
			return;
		}
	}

	openModalNotFound() {
		const modalRef = this.modalService.open(ModalNotifyComponent, {
			size: 'md',
			centered: true,
			windowClass: 'notificationDialog'
		});
		modalRef.componentInstance.content = 'Khách hàng không trùng khớp với ID nào trong hệ thống';
		this.commonService.isAsideRight$.next(true);
		this.commonService.isDisplayAsideRight$.next(true);
	}

	subscribeIdentifyIds() {
		console.log('check gttt');
		this.coreAiService.IdsFromIdentification$
			.subscribe(res => {
				console.log('resIDSFromIdem', res);
				if (res && res.length > 0) {
					this.navigateIdentifyInfo();
				} else if (res && res.length == 0) {
					if (this.coreAiService.isScanIdentity$.getValue() && this.router.url == '/pages/identify/not-found-customer') {
						this.checkMatchCardAndGeneral();
					}
				}
			});
	}

	subscribeFingerIds() {
		console.log('fingerrrrrrrrrrr');
		this.coreAiService.IdsFromFingerPrint$
			.subscribe(res => {
				console.log('IdsFromFingerPrint', res);
				if (res && res.length > 0) {
					console.log('resIDSFromFinger', res);
					this.navigateFingerInfo();
				} else {
					if (this.coreAiService.isClickScanFinger$.getValue() && this.router.url == '/pages/identify/not-found-customer') {
						this.checkMatchCardAndGeneral();
					}
				}
			});
	}

	navigateIdentifyInfo() {
		console.log('navigation iden');
		const identify = this.coreAiService.IdsFromIdentification$.getValue();
		if (identify.length > 0) {
			this.router.navigateByUrl('/pages/identify/info', {
				state: {
					data: identify,
					identification: true
				}
			});
		}
	}

	navigateFingerInfo() {
		console.log('navigation finger');
		const finger: any = this.coreAiService.IdsFromFingerPrint$.getValue();
		if (finger && finger.length > 0) {
			console.log('navigation finger length 1');
			this.router.navigateByUrl('/pages/identify/info', {
				state: {
					data: finger,
					fingerData: true
				}
			});
		}
	}


	/**
	 * Check match between card and face
	 */
	checkMatchCardAndGeneral() {
		const imageCard = this.coreAiService.cardFrontScan$.getValue();
		// const imageCard2 = this.coreAiService.cardBackScan$.getValue();
		const imageGeneral = this.coreAiService.faceScan$.getValue();

		if (imageCard && imageGeneral) {
			this.isChecking$.next(true);
			this.coreAiService.checkMatchCardAndGeneral(imageCard, imageGeneral)
				.pipe(
					map(res => res.body.utility),
					finalize(() => {
						this.isChecking$.next(false);
					}),
					first())
				.subscribe(res => {
					this.similarCompareUser = res.output;
					this.similarValue = Number(this.similarCompareUser.is_matched.similarity) * 100;
					if (this.similarCompareUser && this.similarCompareUser.is_matched.value == 'True' && !this.isPredicting$.getValue()) {
						this.predictIdentity();
					} else {

					}
				});
		}
	}

	/**
	 * Predict user based on card front
	 */
	predictIdentity() {
		this.store.dispatch(removeOrcCard());
		this.isPredicting$.next(true);

		forkJoin(this.predictCardFront(), this.predictCardBack())
			.pipe(finalize(() => {
				this.isPredicting$.next(false);
			}))
			.subscribe(([cardFront, cardBack]) => {
				if (cardFront && cardBack) {
					const output = Object.assign({
						dan_toc: cardBack.dan_toc,
						di_hinh: cardBack.di_hinh,
						ngay_cap: cardBack.ngay_cap,
						ngay_het_han: cardBack.ngay_het_han,
						noi_cap: cardBack.noi_cap,
						ton_giao: cardBack.ton_giao
					}, cardFront);
					this.predictUser = [output];
					console.log(JSON.stringify(this.predictUser), 'this.predictUser');
					const orcCard: IOrcCardModel = {
						legalId: this.predictUser[0] ? (this.predictUser[0].id ? this.predictUser[0].id.value : '') : '',
						birthDate: this.predictUser[0] ? (this.predictUser[0].ngay_sinh ? (this.predictUser[0].ngay_sinh.normalized.value) : '') : '',
						fullNameEn: this.predictUser[0] ? (this.predictUser[0].ho_ten ? (this.predictUser[0].ho_ten.value_unidecode) : '') : '',
						fullNameVn: this.predictUser[0] ? (this.predictUser[0].ho_ten ? (this.predictUser[0].ho_ten.value) : '') : '',
						gender: this.predictUser[0] ? (this.predictUser[0].gioi_tinh ? (this.predictUser[0].gioi_tinh.normalized.value) : '') : '',
						issueAddress: this.predictUser[0] ? (this.predictUser[0].noi_cap ? (this.predictUser[0].noi_cap.value) : '') : '',
						issueDate: this.predictUser[0] ? (this.predictUser[0].ngay_cap ? (this.predictUser[0].ngay_cap.normalized.value) : '') : '',
						legalType: this.predictUser[0] ? (this.predictUser[0].class_name ? (this.predictUser[0].class_name.normalized.code) : '') : '',
						ho_khau: this.predictUser[0] ? (this.predictUser[0].ho_khau_thuong_tru ? (this.predictUser[0].ho_khau_thuong_tru.value) : '') : '',
						ngay_het_han: this.predictUser[0] ? (this.predictUser[0].ngay_het_han ? (this.predictUser[0].ngay_het_han.normalized.value_unidecode) : '') : '',
						hoKhau: this.predictUser[0] ? Object.assign({}, this.predictUser[0].ho_khau_thuong_tru.normalized) : null
						// nguyenQuan: this.predictUser[0] ? Object.assign({}, this.predictUser[0].nguyen_quan.normalized) : null
					};
					this.store.dispatch(updateOrcCard(orcCard));
					return;
				}
				if (cardFront && !cardBack) {
					this.predictUser = [cardFront];
					console.log(JSON.stringify(this.predictUser), 'this.predictUser');
					const orcCard: IOrcCardModel = {
						legalId: this.predictUser[0] ? (this.predictUser[0].id ? this.predictUser[0].id.value : '') : '',
						birthDate: this.predictUser[0] ? (this.predictUser[0].ngay_sinh ? (this.predictUser[0].ngay_sinh.normalized.value) : '') : '',
						fullNameEn: this.predictUser[0] ? (this.predictUser[0].ho_ten ? (this.predictUser[0].ho_ten.value_unidecode) : '') : '',
						fullNameVn: this.predictUser[0] ? (this.predictUser[0].ho_ten ? (this.predictUser[0].ho_ten.value) : '') : '',
						gender: this.predictUser[0] ? (this.predictUser[0].gioi_tinh ? (this.predictUser[0].gioi_tinh.normalized.value) : '') : '',
						issueAddress: this.predictUser[0] ? (this.predictUser[0].noi_cap ? (this.predictUser[0].noi_cap.value) : '') : '',
						issueDate: this.predictUser[0] ? (this.predictUser[0].ngay_cap ? (this.predictUser[0].ngay_cap.normalized.value) : '') : '',
						legalType: this.predictUser[0] ? (this.predictUser[0].class_name ? (this.predictUser[0].class_name.normalized.code) : '') : '',
						ho_khau: this.predictUser[0] ? (this.predictUser[0].ho_khau_thuong_tru ? (this.predictUser[0].ho_khau_thuong_tru.value) : '') : '',
						ngay_het_han: this.predictUser[0] ? (this.predictUser[0].ngay_het_han ? (this.predictUser[0].ngay_het_han.normalized.value_unidecode) : '') : '',
						hoKhau: this.predictUser[0] ? (this.predictUser[0].ho_khau_thuong_tru ? Object.assign({}, this.predictUser[0].ho_khau_thuong_tru.normalized) : null) : null
						// nguyenQuan: this.predictUser[0] ? Object.assign({}, this.predictUser[0].nguyen_quan.normalized) : null
					};
					this.store.dispatch(updateOrcCard(orcCard));
					return;
				}
			});

	}

	predictCardFront(): Observable<any> {
		const imageCard = this.coreAiService.cardFrontScan$.getValue();
		if (imageCard) {
			return this.coreAiService.predictIdentity(imageCard.split(',')[1])
				.pipe(map(res => {
					// console.log('hungtt card_front >>>', res);
					return res.output[0];
				}));
		}
		return of(null);
	}

	predictCardBack(): Observable<any> {
		const imageCard = this.coreAiService.cardBackScan$.getValue();
		if (imageCard) {
			return this.coreAiService.predictIdentity(imageCard.split(',')[1])
				.pipe(map(res => {
					// console.log('hungtt card_back >>>', res);
					return res.output[0];
				}));
		}
		return of(null);
	}

	/**
	 * Call 2 request at the same time
	 */
	filterUser() {
		this.isSearch = true;
		return this.getUserFromLegalId()
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(res => {
				if (res && res.body.status == STATUS_OK && res.body.enquiry.customerFind2) {
					const data = res.body.enquiry.customerFind2;
					this.customersFromSearch.push(...data);
					this.customerId = data[0].custId;
					this.callSugestProductSelling(data[0]);	
				}
			})
			// .subscribe(legalId => {
			// 	console.warn('>>>>>>> ', legalId);
			// 	this.customersFromSearch.push(...legalId);
			// 	this.customerId = legalId[0].custId;
			// 	this.callSugestProductSelling(legalId[0]);
			// });
	}

	getUserFromLegalId() {
		let body = {
			command: GET_ENQUIRY,
			enquiry: {
				enqID: 'T24ENQ.CUSTOMER.FIND2',
				customerId: '',
				customerName: '',
				legalId: this.predictUser[0].id.value,
				phoneNumber: '',
				dob: ''
			}
		};
		this.isLoading$.next(true);
		return this.dataPowerService.getListCustomerIfnfo(body, this.header, this.apiUrl, false);
			// .pipe(map((res) => res.body.enquiry.hasOwnProperty('customerByLegal') ? res.body.enquiry.customerFind2 : null));
	}

	/**
	 * Navigate to customer-manager.component with customerId
	 * @param customer: Which is customer data selected
	 */
	navigateCustomerManage(customer: any) {
		this.selectedCustomer$.next(customer);
		const customerId = this.selectedCustomer$.getValue().custId;
		this.router.navigateByUrl('pages/identify/info', {
			state: {
				customerId: customerId
			}
		});
	}

	redirectCombo(combo) {
		let routerLink: string = '';
		this.commonService.isPredictUserExists$.next(true);
		switch (combo) {
			case 'combo1':
				routerLink = 'pages/combo1';
				break;
			case 'combo2':
				routerLink = 'pages/combo2';
				break;
			case 'combo3':
				routerLink = 'pages/combo3';
				break;
		}

		this.router.navigateByUrl(routerLink, {
			state: {
				predictUserData: this.predictUser
			}
		}).then();
	}

	getGender(src: string): string {
		if (src == 'FEMALE') {
			return 'Nữ';
		}
		if (src == 'MALE') {
			return 'Nam';
		}
		return '';
	}

	viewGender(predictUser: any) {
		if (predictUser && predictUser.gioi_tinh) {
			const value = predictUser.gioi_tinh.normalized.value;
			if (value == 0) {
				return 'NAM';
			}
			if (value == 1) {
				return 'NỮ';
			}
			return null;
		}
		return null;
	}

	callSugestProductSelling(customerInfo: any) {
		const age = moment(new Date()).get('y') - moment(customerInfo.birthDate, 'DD/MM/YYYY').get('y');
		const gender = customerInfo.gender;

		let body: object = {
			command: GET_TRANSACTION,
			transaction: {
				authenType: 'FindProductsSellingSuggest',
				sex: gender ? gender.toUpperCase() : null,
				age: age ? `${age}` : null
			}
		};
		this.commonService.getListSlaByUserGroup(body)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(res => {
				if (res && res.seabRes.body.status === STATUS_OK && res.seabRes.body.responseCode === CODE_00) {
					this.suggestProductSelling$.next(res.seabRes.body.data);
				}
			});
	}

	onNavigateUrl(url: string) {
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
}
