import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {CardInfoToken} from '../../commons/models/CardInfoToken';
import {
	CARDTYPE,
	CODE_00,
	ECOMMER,
	GET_ENQUIRY,
	HEADER_API_ACCOUNT,
	HEADER_API_CARD,
	HEADER_API_CARD_TOKEN,
	IDENTIFICATION,
	INFO_LIST,
	LOCAL_CARD,
	SERVER_API_CUST_INFO,
	SEVER_API_URL_CARD,
	SEVER_API_URL_CARD_ENQUIRY,
	HEADER_API_T24_ENQUIRY,
	SEVER_API_T24_ENQUIRY,
	STATUS_OK,
	UTILITY
} from '../../../../../../shared/util/constant';
import {PromotionCardModel} from '../../../../../../shared/model/promotion-card.model';
import {TransPromotionCardModel} from '../../../../../../shared/model/trans-promotion-card.model';
import {CommonService} from '../../../../../common-service/common.service';
import {AppConfigService} from '../../../../../../app-config.service';
import {LocalStorageService} from 'ngx-webstorage';
import {DataPowerService} from '../../../../../../shared/services/dataPower.service';
import {UtilityService} from '../../../../../../shared/services/utility.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {finalize, takeUntil} from 'rxjs/operators';
import {EnquiryModel} from '../../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../../model/body-request-enquiry-model';
import {CardRequestDTO} from '../../../../../../shared/model/constants/card-requestDTO';
import {ModalChooseCustomerComponent} from '../../../../../../shared/directives/modal-common/modal-choose-customer/modal-choose-customer.component';
import moment from 'moment';
import {ModalNotification} from '../../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {convertCardModelInCoreT24, convertStreetT24} from './CardTemporary-model';
import {ACTION_T24_CREATE, CREATE_SECONDARY_CARD} from '../../../../../../shared/model/constants/common-constant';
import {CustomerRequestDTO} from '../../../../../../shared/model/constants/customer-requestDTO';
import {CityModel} from '../../../../../../shared/model/city.model';
import {CountryModel} from '../../../../../../shared/model/country.model';
import {convertCustomerAddress} from '../customer-info/customer-info-model';
import {async} from '@angular/core/testing';

@Component({
	selector: 'kt-open-card-combo',
	templateUrl: './open-card-combo.component.html',
	styleUrls: ['./open-card-combo.component.scss']
})
export class OpenCardComboComponent implements OnInit, OnChanges, OnDestroy {

	@Input() parentForm: FormGroup;
	@Input() isExCombo;
	@Input() carListInfo: BehaviorSubject<CardInfoToken[]> = new BehaviorSubject<CardInfoToken []>([]);
	@Input() cardDataFrmDash: any;
	@Input() inputtable: boolean;
	@Input() authoriserble: boolean;
	@Input() isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	@Input() accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	@Input() cardTypeCreated: string;

	createCardForm: FormGroup;
	headerApiCard: any;
	apiUrlApiCard: any;
	headerApiCardToken: any;
	apiUrlCardToken: any;
	apiT24: any;
	headerT24: any;

	showPrimaryForm: boolean = false;
	hideAddPrimaryCardButton: boolean = false;
	hideAddSecondaryCardButton: boolean = true;
	hideAddSecondaryCardButton$ = new BehaviorSubject<boolean>(false)
	infoList = INFO_LIST;
	identificationList = IDENTIFICATION;
	ecommerList = ECOMMER;
	localCardTypes = LOCAL_CARD;
	internationalCardTypes = CARDTYPE;
	cardTypeList = [];
	cardList: CardInfoToken[] = [];

	promotionCards$ = new BehaviorSubject<PromotionCardModel[]>([]);
	transPromotionCards$ = new BehaviorSubject<TransPromotionCardModel[]>([]);
	isLoadingCardInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isNotFoundCustomerSearchDataFromGttt$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isNotFoundCustomerSearchDataFromCustomerId$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingSearchingCustomerByGttt$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingSearchingCustomerByCustomerId$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	cardInfo$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	dataCardError$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
	primaryCardSelected$ = new BehaviorSubject<any>(null);
	promotion$ = new BehaviorSubject<string>(null);
	transPro$ = new BehaviorSubject<string>(null);
	isLoadingCustomerIND_3Detail$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingDistrict$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoadingCities$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


	districtList: CityModel[] = [];
	cityList: CityModel[] = [];
	countrys: CountryModel [] = [];

	dataSearchCustomer: any = [];
	currentIndexFormSearchCustomerInfo: number;
	totalSubCardOfExistedMainCard: number = 0;
	checkedValue: any;
	private componentDestroyed = new Subject<void>();
	accountsVndOfCustomer$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	isOpenAccountVND: boolean;

	THE_QUOC_TE = 'INTERANTIONAL_CREDIT_CARD';
	THE_NOI_DIA = 'DOMESTIC_CREDIT_CARD';
	THE_CHINH = 'master';
	THE_PHU = 'slave';
	CARD_CLOSED = 'Card Closed';
	TYPE_VSSN = 'VSSN';
	TYPE_VSSP = 'VSSP';
	PROMOTION = 'promotionId';
	TRANS_PRO = 'transProId';
	cardDataList: any = [];

	prefixIdRadioBoxCard = 'mainCardId';
	attributeKeyAutoCheckedRadioBox = 'AUTO_CLICK';
	attributeValueAutoCheckedRadioBox = 'AUTO';

	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private appConfigService: AppConfigService,
				private localStorage: LocalStorageService,
				private dataPowerService: DataPowerService,
				private utilityService: UtilityService,
				private cdr: ChangeDetectorRef,
				public _sanitizer: DomSanitizer,
				private modalService: NgbModal,) {

		this.headerApiCard = this.appConfigService.getConfigByKey(HEADER_API_CARD);
		this.apiUrlApiCard = this.appConfigService.getConfigByKey(SEVER_API_URL_CARD);
		this.apiT24 = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		this.headerT24 = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		this.headerApiCardToken = this.appConfigService.getConfigByKey(HEADER_API_CARD_TOKEN);
		this.apiUrlCardToken = this.appConfigService.getConfigByKey(SEVER_API_URL_CARD_ENQUIRY);
	}


	ngOnInit() {
		this.getDataCardType();
		this.accountInfo$.subscribe(account => {
			if (account) {
				const temporaryAccounts: [] = account.filter(i => i.currency == 'VND');
				this.accountsVndOfCustomer$.next(temporaryAccounts);
			}
		});

		this.parentForm.get('accountInfoForm').get('currency').valueChanges.subscribe(currency => {
			if (currency == 'VND') {
				this.isOpenAccountVND = true;
			} else {
				if (this.frm.accountNumber.value == 'newAccount') {
					this.frm.accountNumber.setValue(null);
				}
				this.isOpenAccountVND = false;
			}
		});		

		// switch (this.cardTypeCreated) {
		// 	case this.THE_QUOC_TE:
		// 		this.cardTypeList = this.internationalCardTypes;
		// 		break;

		// 	case this.THE_NOI_DIA:
		// 		this.cardTypeList = this.localCardTypes;
		// 		break;
		// }

		this.createCardForm = this.fb.group({
			cardRecordID: [null],
			cardName: [null],
			cardType: [null],
			promotionId: [null],
			transProId: [null],
			ycomer: [null],
			memberCode: [null],
			memberDateExpored: [null],
			accountNumber: [null],
			inputter: [null],
			authoriser: [null],
			coCode: [null],
			transID: [null],
			homeAddress: ['Nh???n th??? t???i ??VKD'],
			priority: [null],
			lstSecondaryCard: this.fb.array([]),
			informations: this.fb.array([this.initNewInformationForm()]),
			cardCheckbox: [false],
			actionT24: [ACTION_T24_CREATE],
			cardNumber: [null],
		});
		this.parentForm.addControl('openCardForm', this.createCardForm);

		// if (this.isExCombo) {
		// 	this.getListCardOfCustomerFromCore();
		// } else {
		// 	this.showPrimaryForm = true;
		// }
		if (!this.isExCombo) {
			this.showPrimaryForm = true;
		}

		this.getTransPromotionCards();
		this.getPromotionCards();

		if (this.cardDataFrmDash && this.cardDataFrmDash.card) {
			this.createCardForm.controls.cardCheckbox.setValue(true);
			let cardDataFromSeATellerApi = this.cardDataFrmDash.card;

			if (this.cardDataFrmDash.card.actionT24 && this.cardDataFrmDash.card.actionT24 == CREATE_SECONDARY_CARD) {
				this.createCardForm.get('actionT24').setValue(CREATE_SECONDARY_CARD);
				this.showPrimaryForm = false;
			} else {
				this.showPrimaryForm = true;
			}

			this.patchValueCreateCardForm(cardDataFromSeATellerApi);
			// N???u l?? b???n ghi ???? l??u 
			if(this.cardDataFrmDash.combo.status == 'SAVED') {
				let dataSecondCard = this.cardDataFrmDash.card.lstSecondaryCard;
				if (dataSecondCard && dataSecondCard.length > 0) {
					for (let index = 0; index < dataSecondCard.length; index++) {
						this.secondaryCardForm.push(this.initNewSecondaryCardForm(dataSecondCard[index], index));
					}
					this.addValidatorSecondaryCardForm();
				}
			} else {
				// N???u kh??ng ph???i b???n ghi l??u th?? g???i API list th??? ph???
				this.getSecondaryCardDetailFromSeATellerApi(cardDataFromSeATellerApi.id);
			}

			if (this.cardDataFrmDash.card.status == 'ERROR' && this.cardDataFrmDash.card.errorDesc) {
				this.dataCardError$.next(this.cardDataFrmDash.card.errorDesc);
			}

		} else {
			this.createCardForm.controls.cardCheckbox.setValue(false);
		}

		this.carListInfo.subscribe(res => {
			if (res != null) {
				console.log('@Input Cards --------->>>>', res);
				this.cardList = res;
			}
		});

		this.transPromotionCards$
			.pipe(takeUntil(this.componentDestroyed))
			.subscribe(res => {
				if (res.length) {
					const transPromotionId = this.createCardForm.get('transProId').value;
					const transPromotion = res.find(ele => ele.transPromoCardId == transPromotionId);
					transPromotion && this.setValueDescriptionUnderLabel(transPromotion, 'transPro');
				}
			});

		this.promotionCards$
			.pipe(takeUntil(this.componentDestroyed))
			.subscribe(res => {
				if (res.length) {
					const promotionId = this.createCardForm.get('promotionId').value;
					const promotion = res.find(ele => ele.promoCardId == promotionId);
					promotion && this.setValueDescriptionUnderLabel(promotion, 'promotion');
				}
			});

		this.getCityList();
		this.getListCountry();

		/*
		N???u m??? t??i kho???n m???i, lo???i ti???n t??? l?? VND th?? th??m t??i kho???n thanh to??n m???i v??i STK c???a th???;
		 */
		const openAccountForm = this.parentForm.get('accountInfoForm');
		if (openAccountForm) {
			const accountCurrency = openAccountForm.get('currency').value;
			if (accountCurrency == 'VND') {
				this.isOpenAccountVND = true;
			}
		}
	}

	/**
	 * X??a tr???ng card create form theo c??c formcontrols name trong list fields
	 */
	resetCreateCardForm() {
		let fields = ['cardRecordID', 'cardName', 'cardType', 'promotionId', 'transProId', 'ycomer', 'memberCode', 'memberDateExpored', 'accountNumber', 'cardNumber', 'homeAddress'];

		fields.forEach(item => {
			if (item == 'homeAddress') {
				this.frm.homeAddress.setValue('Nh???n th??? t???i ??VKD');

			} else if (this.createCardForm.get(item)) {
				this.createCardForm.get(item).reset();
			}
		});
	}

	addValidatorCreateCardForm(form: FormGroup) {
		const fieldsSetValidator = ['cardName', 'cardType', 'accountNumber', 'homeAddress'];
		for (const fieldFormName in form.controls) {

			if (fieldFormName == 'lstSecondaryCard') {
				this.addValidatorSecondaryCardForm();
			}

			fieldsSetValidator.forEach(field => {

				if (fieldFormName == field) {

					if (field == 'cardName') {
						form.get(fieldFormName).setValidators([Validators.required, Validators.maxLength(20)]);
					} else {
						form.get(fieldFormName).setValidators([Validators.required]);
					}

					form.get(fieldFormName).updateValueAndValidity();
				}
			});
		}
	}

	addValidatorSecondaryCardForm() {

		const fieldsValidator = ['prospectId', 'fullName', 'legalId', 'embosingName',
			'legalDocName', 'phoneNumber', 'homeAddress', 'legalIssuePlace', 'legalIssueDate'];

		for (let i = 0; (this.secondaryCardForm.controls && i < this.secondaryCardForm.controls.length); i++) {
			for (const fieldName in this.secondaryCardForm.controls[i]['controls']) {
				if (fieldsValidator.includes(fieldName)) {

					switch (fieldName) {
						case 'embosingName':
							this.secondaryCardForm.controls[i]['controls'][fieldName].setValidators(
								[Validators.required, Validators.maxLength(19)]);
							break;

						case 'phoneNumber':
							this.secondaryCardForm.controls[i]['controls'][fieldName].setValidators(
								[Validators.required, Validators.pattern('(0[3|5|7|8|9])+([0-9]{8})')]);
							break;

						case 'homeAddress':
							this.secondaryCardForm.controls[i]['controls'][fieldName].setValidators(
								[Validators.maxLength(35)]);
							break;

						case 'legalIssuePlace':
							this.secondaryCardForm.controls[i]['controls'][fieldName].setValidators(
								[Validators.required, Validators.maxLength(35)]);
							break;

						default:
							this.secondaryCardForm.controls[i]['controls'][fieldName].setValidators(
								[Validators.required]);
							break;
					}

					this.secondaryCardForm.controls[i]['controls'][fieldName].updateValueAndValidity();
				}
			}
		}
	}

	clearValidatorSecondaryCardForm() {
		for (let i = 0; i < this.secondaryCardForm.controls.length; i++) {
			for (const fieldName in this.secondaryCardForm.controls[i]['controls']) {
				this.secondaryCardForm.controls[i]['controls'][fieldName].clearValidators();
				this.secondaryCardForm.controls[i]['controls'][fieldName].markAsUntouched();
				this.secondaryCardForm.controls[i]['controls'][fieldName].updateValueAndValidity();
			}
		}
	}

	removeAllValidatorCreateCardForm(form: FormGroup) {
		for (const key in form.controls) {
			if (key == 'lstSecondaryCard') {
				this.clearValidatorSecondaryCardForm();
			}

			form.get(key).clearValidators();
			form.get(key).markAsUntouched();
			form.get(key).updateValueAndValidity();
		}
	}

	removeValidatorCreateCardForm(form: FormGroup) {
		for (const key in form.controls) {
			if (key !== 'lstSecondaryCard') {
				form.get(key).clearValidators();
				form.get(key).markAsUntouched();
				form.get(key).updateValueAndValidity();
			}
		}
	}

	/**
	 * fill c??c th??ng tin v??o from t??? d??? li???u ???? ??c l??u ??? t???ng SeAteller api;
	 * @param card
	 */
	patchValueCreateCardForm(card: any) {

		if (!card) {
			return;
		}
		// if(card.cardType) {
		// 	let cardType = this.cardTypeList.filter(type => type.cardType == card.cardType)
		// 	if(cardType) {
		// 		this.onChangeCardType(cardType);
		// 	}
		// }
		this.createCardForm.patchValue({

			cardRecordID: card.cardId ? card.cardId : null,

			cardName: card.cardName ? card.cardName : null,

			cardType: card.cardType ? card.cardType : null,

			promotionId: card.promotionId ? card.promotionId : null,

			transProId: card.transProId ? card.transProId : null,

			ycomer: card.ycomer ? card.ycomer : null,

			memberCode: card.memberCode ? card.memberCode : null,

			accountNumber: card.accountNumber ? card.accountNumber : 'newAccount',

			inputter: card.inputter ? card.inputter : null,

			authoriser: card.authoriser ? card.authoriser : null,

			coCode: card.coCode ? card.coCode : null,

			memberDateExpored: card.memberDateExpored ? moment(card.memberDateExpored, 'dd-MM-yyyy').toDate() : null,

			cardNumber: this.primaryCardSelected$.getValue() ? this.primaryCardSelected$.getValue().cardNumber : null,

			homeAddress: card.homeAddress ? card.homeAddress : 'Nh???n th??? t???i ??VKD',
		});

		this.secondaryCardForm.clear();

		let isInformationCardInfo = card.cardInfos && card.cardInfos.length > 0;
		if (isInformationCardInfo) {
			this.informationFormArray.clear();
			card.cardInfos.forEach(element => {
				this.informationFormArray.push(this.initNewInformationForm(element));
			});
		}

		this.addValidatorCreateCardForm(this.createCardForm);
	}

	/**
	 * patchValue sau khi truy v???n TT KH, KH v??ng lai t??? gi???y t??? t??y th??n trong coreT24
	 * @param data -> d??? li???u core tr??? ra
	 * @param index v??? tr?? ph???n t??? form trong form array
	 */
	patchValueSecondaryCardFormAfterGetCustomerInfo(data: any, index: number) {
		let address = convertCustomerAddress(data.address);
		this.secondaryCardForm.at(index).patchValue({

			fullName: data.custName ? data.custName : null,

			legalId: data.legal ? data.legal.split('#')[0] : null,

			embosingName: data.custName ? data.custName : null,

			legalDocName: data.legalDocName ? data.legalDocName.split('#')[0] : null,

			phoneNumber: data.sms1 ? data.sms1.split('#')[0] : null,

			homeAddress: (address != null) ? address.other : data.address.split('#')[0],

			legalIssuePlace: data.legalIssAuth ? data.legalIssAuth.split('#')[0] : null,

			legalIssueDate: data.issueDate ? moment(data.issueDate, 'YYYYMMDD').toDate() : null,

			prospectId: data.custId ? data.custId : null,

			birthDate: data.birthDate ? data.birthDate : null,

			email: data.email ? data.email.split('#')[0] : '',

			gender: data.gender ? data.gender : '',

			phone: data.phone ? data.phone.split('#')[0] : '',

			addressT24: data.address ? data.address : '',
		});

		this.secondaryCardForm.at(index).get('homeAddress').markAsTouched();
	}


	getTransPromotionCards(): void {
		const cache = this.localStorage.retrieve(UTILITY.TRANS_PRO_CARD.TRANS_PRO_CARD_CACHE);
		if (cache) {
			this.transPromotionCards$.next(cache);
			return;
		}

		this.utilityService.getTransPromotionCardsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const transPromotionCards = res.body.enquiry.transPromotionCards;
					this.transPromotionCards$.next(transPromotionCards);
					this.localStorage.store(UTILITY.TRANS_PRO_CARD.TRANS_PRO_CARD_CACHE, transPromotionCards);
				}
			});
	}

	getPromotionCards(): void {
		const cache = this.localStorage.retrieve(UTILITY.PROMOTION_CARD.PROMOTION_CARD_CACHE);
		if (cache) {
			this.promotionCards$.next(cache);
			return;
		}
		this.utilityService.getPromotionCardsNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const promotionCards = res.body.enquiry.promotionCards;
					this.promotionCards$.next(promotionCards);
					this.localStorage.store(UTILITY.PROMOTION_CARD.PROMOTION_CARD_CACHE, promotionCards);
				}
			});
	}

	getSecondaryCardDetailFromSeATellerApi(cardTransactionId: any) {
		let command = 'GET_ENQUIRY';
		let enquiry = new EnquiryModel();
		enquiry.authenType = 'getSecondaryCard';
		enquiry.data = {
			cardTransactionId: cardTransactionId
		};

		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.commonService.actionGetEnquiryResponseApi(bodyRequest)
			.pipe()
			.subscribe(res => {
				if (res) {
					let secondaryCards = res.enquiry.product;

					this.secondaryCardForm.clear();
					if (secondaryCards && secondaryCards.length > 0) {
						for (let index = 0; index < secondaryCards.length; index++) {
							this.secondaryCardForm.push(this.initNewSecondaryCardForm(secondaryCards[index], index));
						}

						this.addValidatorSecondaryCardForm();
					}

				} else {
					return;
				}
			});
	}
	listCardType: any[] = [];
	getDataCardType() {
		let url = this.apiT24;
		let header = this.headerT24;
		let bodyConfig = CardRequestDTO.BODY.BODY_GET_CARD_TYPE;
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
		.subscribe(res => {
			if (res && res.status == 'OK') {
				let today = new Date().getTime();
				let allData = res.enquiry.seabApiGetProductCard && res.enquiry.seabApiGetProductCard.filter(type => moment(type.expireDate.trim(), "YYYYMMDD").unix()*1000 > today)
				// let allList = res.enquiry.seabApiGetProductCard;
				let listLocalCard = allData.filter(cardType => cardType.cardgroup.trim() == 'LOCAL.DEBIT');
				let listInterCard = allData.filter(cardType => cardType.cardgroup.trim() == 'MASTER.DEBIT' || cardType.cardgroup.trim() == 'VISA.DEBIT');
				switch (this.cardTypeCreated) {
					case this.THE_QUOC_TE:
						this.cardTypeList = listInterCard;
						break;
		
					case this.THE_NOI_DIA:
						this.cardTypeList = listLocalCard;
						break;
				}

				console.log('this.cardTypeList', this.cardTypeList);

				this.listCardType = this.cardTypeList.map(type => {
					return type.cardtype.trim()
				})

				console.log('listCardType', this.listCardType);

				this.isExCombo && this.getListCardOfCustomerFromCore()
			}
		})
	}
	/**
	 * truy v???n danh s??ch th??? c???a KH c?? -> combo KH c??
	 */
	getListCardOfCustomerFromCore() {
		this.isLoadingCardInfo$.next(true);
		this.hideAddPrimaryCardButton = false;
		let url = this.apiUrlApiCard;
		let header = this.headerApiCard;
		let bodyConfig = CardRequestDTO.BODY.BODY_GET_CARD;
		bodyConfig.enquiry.customerID = this.commonService.customerId$.getValue();

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCardInfo$.next(false)))
			.pipe(finalize(() => this.autoClickRadioBox()))
			.subscribe(res => {
				if (res) {
					switch (this.cardTypeCreated) {
						case this.THE_QUOC_TE:
							this.cardDataList = res.enquiry.customer_card.filter(card => card.cardProduct && card.cardProduct != 'SVCC' && card.cardStatusName != this.CARD_CLOSED);
							break;

						case this.THE_NOI_DIA:
							this.cardDataList = res.enquiry.customer_card.filter(card => card.cardProduct && card.cardProduct == 'SVCC' && card.cardStatusName != this.CARD_CLOSED);

							/**
							 * KH c?? n???u ???? c?? th??? ch??nh r???i th?? kh??ng ???n button t???o th??? ch??nh
							 */
							if (this.cardDataList.length > 0) {
								let mainCard = this.cardDataList.filter(card => card.type == this.THE_CHINH);

								if (mainCard) {
									this.hideAddPrimaryCardButton = true;
								}
							}
							break;
					}
					let dataListCardFollowType;
					this.cardDataList && this.cardDataList.sort((prev, next) => {
						return prev.mainId.localeCompare(next.mainId);
					});
					console.log('this.cardDataList', this.listCardType);
					dataListCardFollowType = this.cardDataList.filter(card => 
						this.listCardType.includes(card.cardProduct)
					)

					// this.cardInfo$.next(this.cardDataList);
					this.cardInfo$.next(dataListCardFollowType);
					console.log('cardInfo$', this.cardInfo$.getValue());
					// console.log('dataListCardFollowType', dataListCardFollowType);
				}
			});
	}

	/**
	 * H??m n??y s??? t??? ?????ng click radio button l???a ch???n b???n ghi ph?? h???p khi inputter ???? g???i duy???t ok,
	 * sau ???? quay tr??? l???i update ho???c view l???i b???n ghi
	 */
	autoClickRadioBox() {
		if (this.cardDataFrmDash && this.cardDataFrmDash.card.cardId) {
			setTimeout(() => {
				let element = document.getElementById(this.prefixIdRadioBoxCard + this.cardDataFrmDash.card.cardId);
				element.setAttribute(this.attributeKeyAutoCheckedRadioBox, this.attributeValueAutoCheckedRadioBox);
				element.click();
			}, 300);
		}
	}

	/**
	 * - Kh???i t???o th??? ph???
	 * - M???c ?????nh subCardLimit-h???n m???c th??? ph??? = 50%
	 * - Tr?????ng ?????a ch??? nh???n th??? n???u l?? th??m th??? ph??? cho th??? ch??nh ???? c?? -> l???y theo tr?????ng address truy v???n way4,
	 * n???u kh??ng m???c ?????nh l?? 'Nh???n th??? t???i ??VKD';
	 * - Tr?????ng ?????a ch??? nh???n th??? n???u l?? m??? th??? ph??? c??ng v???i t???o th??? ch??nh th?? ??u ti??n l???y theo info-detail khi info-list = HOME.ADDRESS,
	 * n???u kh??ng l???y theo form-control homeAddress;
	 * @param card
	 * @param index
	 */
	initNewSecondaryCardForm(card?: any, index?: number) {

		let totalSecondaryCard = this.secondaryCardForm.controls.length + this.totalSubCardOfExistedMainCard;
		if (totalSecondaryCard > 2) {
			this.hideAddSecondaryCardButton$.next(true);
			// return;
		}

		if (card && card.prospectId && index != null) {
			this.getCustomerInfoDetail(card.prospectId, index);
		}

		let receiveAddress = '';

		let containInfoListHomeAddress = false;
		!this.primaryCardSelected$.getValue() && this.informationFormArray.controls.forEach(i => {
			const infoListValue = i.get('infoList').value;
			const infoDetail = i.get('infoDetail').value;
			if (infoListValue && infoListValue == 'HOME.ADDRESS') {
				receiveAddress = infoDetail;
				containInfoListHomeAddress = true;
			}
		});

		if (!containInfoListHomeAddress) {
			receiveAddress = this.frm.homeAddress.value ? this.frm.homeAddress.value : (this.primaryCardSelected$.getValue() ? this.primaryCardSelected$.getValue().address : 'Nh???n th??? t???i ??VKD');
		}

		return this.fb.group({

			fullName: [card ? card.fullName : null],

			legalId: [card ? card.legalId : null],

			embosingName: [card ? card.embosingName : null],

			legalDocName: [card ? card.legalDocName : null],

			phoneNumber: [card ? card.phoneNumber : null],

			homeAddress: [card ? card.homeAddress : null],

			legalIssuePlace: [card ? card.legalIssuePlace : null],

			legalIssueDate: [(card && card.legalIssueDate) ? moment(card.legalIssueDate, 'dd-MM-yyyy').toDate() : null],

			prospectId: [card ? card.prospectId : null],

			mainCardId: [card ? card.mainCardId : null],

			subCardRelation: [card ? card.subCardRelation : null, Validators.required],

			subCardLimit: ['50%'],

			receiveAddress: [card ? card.receiveAddress : receiveAddress],

			//c???m tr?????ng b??n d?????i ph???c v??? m???u bi???u

			birthDate: [''],

			email: [''],

			gender: [''],

			district: [''],

			province: [''],

			ward: [''],

			nationality: [''],

			phone: [''],

			addressT24: [''],

			salary: [''],

			occupation: [''],

			seabRegStatus: [''], //T??nh

			street: [''],

			currentAddress: [''], //?????a ch??? th?????ng tr??
		});
	}

	/**
	 * show modal th??ng b??o v???i combo KH c??, KH ???? c?? th??? ch??nh v?? full 3 th??? ph???
	 */
	showNotifyModal(textNotify: string) {
		this.commonService.isNotifyHasCancel$.next(false);
		let modalRef = this.modalService.open(ModalNotification, {
			size: 'lg',
			backdrop: 'static',
			keyboard: false,
			centered: true,
			windowClass: 'notificationDialog'
		});
		modalRef.componentInstance.textNotify = textNotify;
	}


	/**
	 * M???i th??? ch??nh ch??? ??c t???o t???i ??a 3 th??? ph???
	 */
	addNewSecondaryCard() {
		let totalSecondaryCard = this.secondaryCardForm.controls.length + this.totalSubCardOfExistedMainCard;
		if (totalSecondaryCard > 2) {
			this.hideAddSecondaryCardButton$.next(true);
			return;
		}

		this.secondaryCardForm.push(this.initNewSecondaryCardForm());
		this.addValidatorSecondaryCardForm();
	}


	/**
	 * h??m n??y t??nh s??? l?????ng th??? ph??? c???a 1 th??? ch??nh ???????c ch???n (combo KH c??)
	 * n???u list form + th??? ph??? ???? c?? c???a th??? ch??nh > 3 th??? ph???, ???n button th??m th??? ph???
	 * @param mainCardId -> th??? ch??nh ???????c ch???n
	 */
	calculateNumberOfSubCardByMainCardId(mainCardId: string) {
		if (!mainCardId) {
			return;
		}

		let dataSubCard: [] = this.cardDataList
			.filter(card => card.mainId.includes(mainCardId)
				&& card.type == this.THE_PHU
				&& card.cardStatusName != this.CARD_CLOSED);

		this.totalSubCardOfExistedMainCard = dataSubCard.length ? dataSubCard.length : 0;

		let totalSecondaryCard = this.secondaryCardForm.controls.length + this.totalSubCardOfExistedMainCard;

		this.hideAddSecondaryCardButton$.next(totalSecondaryCard > 2);
	}

	removeSecondaryCardFormAtIndex(i) {
		this.hideAddSecondaryCardButton$.next(false);
		this.secondaryCardForm.removeAt(i);
	}

	get informationFormArray(): FormArray {
		if (this.createCardForm) {
			return this.createCardForm.get('informations') as FormArray;
		}
	}

	get secondaryCardForm(): FormArray {
		if (this.createCardForm) {
			return this.createCardForm.get('lstSecondaryCard') as FormArray;
		}
	}

	initNewInformationForm(info?: any): FormGroup {
		return this.fb.group({
			id: [info ? info.id : null],
			idParent: [info ? info.idParent : null],
			infoList: [info ? info.infoList : null],
			infoDetail: [info ? info.infoDetail : null]
		});
	}

	addMoreInformationForm() {
		this.informationFormArray.push(this.initNewInformationForm());
	}

	/**
	 * x??a form info-list info-detail t???i index i
	 * ki???m tra n???u info-list value = HOME.ADDRESS b??? remove n???u c?? -> set ?????a ch??? nh???n th??? ph??? = homeAddress th??? ch??nh n???u c??
	 * @param i
	 */
	removeInformationFormAtIndex(i: number) {
		this.informationFormArray.removeAt(i);

		let containInfoListHomeAddress = false;
		this.informationFormArray.controls.forEach(i => {
			const infoListValue = i.get('infoList').value;
			if (infoListValue && infoListValue == 'HOME.ADDRESS') {
				containInfoListHomeAddress = true;
			}
		});

		if (!containInfoListHomeAddress) {
			let receiveAddress = this.frm.homeAddress.value;
			if (receiveAddress != null || receiveAddress != '') {
				this.secondaryCardForm.controls.forEach(f => {
					f.get('receiveAddress').setValue(receiveAddress);
				});
			}
		}
	}


	get isClicked(): boolean {
		return this.commonService.isClickedButton$.getValue();
	}

	onChangeValidate() {

		let isCheckedOpenCardCheckbox = this.createCardForm.controls.cardCheckbox.value;

		if (isCheckedOpenCardCheckbox && this.parentForm.controls.customerForm) {
			this.addValidatorCreateCardForm(this.createCardForm);
			this.createCardForm.get('cardName').setValue(this.parentForm.get('customerForm').get('customerName').value);
		} else {
			this.removeAllValidatorCreateCardForm(this.createCardForm);
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.cardDataFrmDash && !changes.cardDataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('cardDataFrmDash')) {
				this.ngOnInit();
			}
		}
	}

	resultSearchCustomerFind2$: BehaviorSubject<string> = new BehaviorSubject<string>('');

	/**
	 * Truy v???n th??ng tin KH theo customerId v?? s??? gttt
	 * @param index v??? tr?? form search
	 * @param event
	 * @param typeSearch lo???i search 'GTTT' || ''CUSTOMER_ID
	 */
	searchCustomerInfoInSecondaryCard(index: number, event: any, typeSearch: string) {
		this.resultSearchCustomerFind2$.next('');
		let inputtedValue = event.target.value;
		if (inputtedValue == null || inputtedValue == '') {
			return;
		}

		this.currentIndexFormSearchCustomerInfo = index;

		switch (typeSearch) {
			case 'GTTT':
				this.isLoadingSearchingCustomerByGttt$.next(true);
				this.isNotFoundCustomerSearchDataFromGttt$.next(false);
				break;
			case 'CUSTOMER_ID':
				this.isLoadingSearchingCustomerByCustomerId$.next(true);
				this.isNotFoundCustomerSearchDataFromCustomerId$.next(false);
				break;
		}

		let body: any = {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.CUSTOMER.FIND2',
				customerId: '',
				legalId: ''
			}
		};
		typeSearch == 'GTTT' ? body.enquiry.legalId = inputtedValue : body.enquiry.customerId = inputtedValue;

		async
		this.commonService.getListCustomerInfo(body, false)
			.pipe(finalize(() => this.isLoadingSearchingCustomerByGttt$.next(false)))
			.pipe(finalize(() => this.isLoadingSearchingCustomerByCustomerId$.next(false)))
			.subscribe(async res => {
				if (res && res.body.status == STATUS_OK && res.body.enquiry.customerFind2) {
					this.commonService.isFoundCustomerInfo.next(true);
					this.dataSearchCustomer = res.body.enquiry.customerFind2;

					let dataFound;
					if (this.dataSearchCustomer.length > 1) {
						dataFound = await this.showChoiceCustomerModal(this.dataSearchCustomer).then(result => {
							if (result != null) {
								return result;
							}
						});
					}

					if (this.dataSearchCustomer.length == 1) {
						dataFound = this.dataSearchCustomer[0];
					}

					if (dataFound && dataFound.seabCuSegment != null && dataFound.seabCuSegment != '' && dataFound.seabCuSegment != '14') {
						const messageError = 'Ph???i nh???p l?? Customer ID c???a kh??ch h??ng c?? nh??n';
						this.showNotifyIfGetCustomerFind2HasError(index, typeSearch, messageError);
						return;
					}

					if (dataFound && dataFound.errorDetail != null && dataFound.errorDetail != '') {
						const messageError = 'Kh??ng t??m th???y th??ng tin kh??ch h??ng';
						this.showNotifyIfGetCustomerFind2HasError(index, typeSearch, messageError);
						return;
					}

					if (dataFound) {
						this.patchValueSecondaryCardFormAfterGetCustomerInfo(dataFound, index);
						let customerId = dataFound.custId;
						this.getCustomerInfoDetail(customerId, index);
						return;
					}
				} else {
					this.dataSearchCustomer = [];
					const messageError = '???? c?? l???i x???y ra, vui l??ng th??? l???i';
					this.showNotifyIfGetCustomerFind2HasError(index, typeSearch, messageError);
					return;
				}
			});
	}

	/**
	 * show th??ng b??o n???u customerId t??m ki???m kh??ng ph???i l?? KH c?? nh??n, ho???c kh??ng t??m th???y th??ng tin KH
	 * @param index
	 * @param typeSearch
	 * @param message -> th??ng b??o text l???i
	 */
	showNotifyIfGetCustomerFind2HasError(index: number, typeSearch: string, message: string) {
		this.resultSearchCustomerFind2$.next(message);
		switch (typeSearch) {
			case 'GTTT':
				this.isNotFoundCustomerSearchDataFromGttt$.next(true);
				document.getElementById('legalId' + index).focus();
				break;
			case 'CUSTOMER_ID':
				this.isNotFoundCustomerSearchDataFromCustomerId$.next(true);
				document.getElementById('prospectId' + index).focus();
				break;
		}

		this.secondaryCardForm.at(index).reset();
	}

	/**
	 * Hi???n th??? cho user ch???n khi truy v???n th??ng tin customer tr??? ra > 1 b???n ghi
	 * @param customerInfos
	 */
	showChoiceCustomerModal(customerInfos: any): any {
		const modal = this.modalService.open(ModalChooseCustomerComponent,
			{
				backdrop: 'static',
				keyboard: false,
				size: 'lg',
				centered: true,
				windowClass: 'changeCodeDialog'
			});
		modal.componentInstance.listCustomerInfo = customerInfos;
		return modal.result
	}

	get isReadonly(): Observable<boolean> {

		if (this.authoriserble) {
			return of(true);
		}

		if (this.commonService.cardStatus$.getValue()) {
			if (this.commonService.canReupdateCard$.getValue()) {
				return of(false);
			}
			return of(true);

		}

		let accountCheckBoxChecked = this.parentForm.get('accountInfoForm') && this.parentForm.get('accountInfoForm').get('accountCheckbox').value;
		if (!accountCheckBoxChecked && !this.isExCombo) {
			return of(true);
		}

		return of(false);
	}

	onChangeInfoList(event, index: number) {
		if (event) {
			this.informationFormArray.controls[index].get('infoDetail').setValidators([Validators.required]);
			this.informationFormArray.controls[index].get('infoDetail').markAsTouched();

		} else {
			this.informationFormArray.controls[index].get('infoDetail').clearValidators();
			this.informationFormArray.controls[index].get('infoDetail').markAsUntouched();
			this.informationFormArray.controls[index].get('infoDetail').setValue(null);
		}
		this.informationFormArray.controls[index].get('infoDetail').updateValueAndValidity();
	}

	onChangeCardType(cardType: any) {
		console.log('cardType', cardType);
		if (!cardType) {
			if (this.createCardForm.get('cardType').hasError('existed')) {
				this.createCardForm.get('cardType').setErrors({existed: null});
				this.createCardForm.get('cardType').markAsTouched();
			}
			this.createCardForm.get('promotionId').clearValidators();
			this.createCardForm.get('memberCode').clearValidators();
		}

		if (cardType) {
			console.log('cardType', cardType);
			if (cardType.subCard.trim() == 'YES') {
				this.hideAddSecondaryCardButton$.next(false);
			} else {
				this.hideAddSecondaryCardButton$.next(true);
				this.secondaryCardForm.clear();
				return;
			}

			const cardList: any[] = this.cardInfo$.getValue();
			const cardExist = cardList.find(card => (card.cardProduct == cardType.cardtype.trim() && card.type == this.THE_CHINH));

			if (cardExist && cardExist.cardStatusName != this.CARD_CLOSED) {
				this.createCardForm.get('cardType').setErrors({existed: true});
				this.createCardForm.get('cardType').markAsTouched();

			} else if (this.createCardForm.get('cardType').hasError('existed')) {
				this.createCardForm.get('cardType').setErrors({existed: null});
				this.createCardForm.get('cardType').markAsTouched();
			}


			if (this.cardTypeCreated == this.THE_QUOC_TE) {
				switch (cardType.cardtype.trim()) {
					case this.TYPE_VSSN:  // member code required
						this.createCardForm.get('promotionId').clearValidators();
						this.createCardForm.get('memberCode').setValidators([Validators.required]);
						this.createCardForm.get('memberCode').markAsTouched();
						break;

					case this.TYPE_VSSP: // promotionID required
						this.createCardForm.get('promotionId').setValidators([Validators.required]);
						this.createCardForm.get('memberCode').clearValidators();
						this.createCardForm.get('promotionId').markAsTouched();
						break;

					default:
						this.createCardForm.get('promotionId').clearValidators();
						this.createCardForm.get('memberCode').clearValidators();
						break;
				}
			}
		}

		this.createCardForm.get('promotionId').updateValueAndValidity();
		this.createCardForm.get('memberCode').updateValueAndValidity();
	}

	/**
	 * H??m common khi thay ?????i data trong ng-select th?? hi???n th??? gi?? tr??? description b??n d?????i ng-select tag
	 * @param event object ???????c l???a ch???n
	 * @param type formControl name
	 */

	setValueDescriptionUnderLabel(event, formControlName) {

		switch (formControlName) {
			case this.PROMOTION:
				this.promotion$.next(event ? event.description : null);
				break;

			case this.TRANS_PRO:
				this.transPro$.next(event ? event.description : null);
				break;
		}
	}

	onChangeCardRecord(mainCardObject, index) {
		this.checkedValue = index;
		this.totalSubCardOfExistedMainCard = 0;
		this.primaryCardSelected$.next(mainCardObject);
		this.frm.cardNumber.setValue(mainCardObject.cardNumber);
		this.calculateNumberOfSubCardByMainCardId(mainCardObject.mainId);

		let element = document.getElementById(this.prefixIdRadioBoxCard + mainCardObject.mainId);
		let attribute = element.getAttribute(this.attributeKeyAutoCheckedRadioBox);

		if (attribute == this.attributeValueAutoCheckedRadioBox) {
			return;
		}

		/*
		 * convert d??? li???u th??? ??c ch???n t??? radiobox core API -> patch value v??o createCard form
		 */
		let card = convertCardModelInCoreT24(mainCardObject);
		this.patchValueCreateCardForm(card);

		this.showPrimaryForm = false;

		this.hideAddSecondaryCardButton$.next(false);

		if (this.isExCombo && this.checkedValue != null) {
			this.createCardForm.controls.actionT24.setValue(CREATE_SECONDARY_CARD);
		} else {
			this.createCardForm.controls.actionT24.setValue(ACTION_T24_CREATE);
		}

		if ((this.secondaryCardForm.controls.length + this.totalSubCardOfExistedMainCard) > 3) {
			this.secondaryCardForm.clear();
			this.secondaryCardForm.push(this.initNewSecondaryCardForm());
			this.addValidatorSecondaryCardForm();
		}

		if (this.totalSubCardOfExistedMainCard > 2) {
			let textNotify = 'Kh??ch h??ng ch??? c?? th??? m??? t???i ??a 3 th??? ph???.';
			this.showNotifyModal(textNotify);
			this.secondaryCardForm.clear();
			this.hideAddSecondaryCardButton$.next(true);
		}

		if (mainCardObject.cardProduct == this.TYPE_VSSP) {
			let textNotify = 'B???n kh??ng ???????c ph??p m??? th??? ph??? cho lo???i th??? n??y';
			this.showNotifyModal(textNotify);
			this.secondaryCardForm.clear();
			this.hideAddSecondaryCardButton$.next(true);
		}
	}

	addPrimaryCard() {
		this.hideAddSecondaryCardButton$.next(false);
		this.checkedValue = null;
		this.createCardForm.get('actionT24').setValue(ACTION_T24_CREATE);

		this.primaryCardSelected$.next(null);

		this.totalSubCardOfExistedMainCard = 0;
		this.resetCreateCardForm();
		this.informationFormArray.reset();


		this.secondaryCardForm.clear();
		this.showPrimaryForm = !this.showPrimaryForm;
		if (this.showPrimaryForm == false) {
			this.removeAllValidatorCreateCardForm(this.createCardForm);
			this.createCardForm.clearValidators();
			this.createCardForm.updateValueAndValidity();

		} else {
			this.addValidatorCreateCardForm(this.createCardForm);
		}
	}

	get frm() {
		return this.createCardForm.controls;
	}

	/**
	 * H??m n??y x??t ?????a ch??? nh???n th??? cho th??? ph??? khi t???o th??? ch??nh v?? ph??? m???i
	 * n???u info-list = HOME.ADDRESS -> ??u ti??n l???y info detail, info-list != HOME.ADDRESS l???y theo tr?????ng ?????a ch??? c???a th??? ch??nh
	 * @param receiveAddress
	 * @param index -> index c???a info detail
	 */
	setHomeAddressNameInSecondaryCard(receiveAddress: string, index?: any) {

		if (receiveAddress == null || receiveAddress == '') {
			return;
		}

		if (index != null) {
			const infoListValue = this.informationFormArray.at(index).get('infoList').value;
			if (infoListValue && infoListValue !== 'HOME.ADDRESS') {
				return;
			}
		} else {

			let containInfoListHomeAddress = false;
			this.informationFormArray.controls.forEach(i => {
				const infoListValue = i.get('infoList').value;
				if (infoListValue && infoListValue == 'HOME.ADDRESS') {
					containInfoListHomeAddress = true;
				}
			});

			if (containInfoListHomeAddress) {
				return;
			}
		}

		this.secondaryCardForm.controls.forEach(f => {
			f.get('receiveAddress').setValue(receiveAddress);
		});

	}

	/**
	 * truy v???n th??ng tin KH chi ti???t theo API truy v???n KH IND-3 cho th??? ph??? ????? l???y th??m th??ng tin hi???n th??? l??n bi???u m???u
	 * @param customerId -> m?? KH
	 * @param index -> ch??? s??? c???a ph???n t??? form th??? ph??? hi???n t???i
	 */

	getCustomerInfoDetail(customerId, index: any) {
		this.isLoadingCustomerIND_3Detail$.next(true);

		const bodyConfig = CustomerRequestDTO.BODY.BODY_GET_CUSTOMER;
		bodyConfig.enquiry.customerID = customerId;

		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);

		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCustomerIND_3Detail$.next(false)))

			.subscribe(res => {
				if (res) {
					const result = res.enquiry;
					this.getDistrict1(result.province, result.seabDistrict1, index);
					const provinceT24 = this.cityList.find(i => i.cityID == result.province);
					const provinceName = provinceT24 && provinceT24.name_gb ? provinceT24.name_gb : '';

					const nationalityT24 = this.countrys.find(i => i.countryId == result.nationality);
					const nationalityName = nationalityT24 && nationalityT24.nameGb ? nationalityT24.nameGb : '';

					const wardName = convertStreetT24(result.permanentAddress, 'WARD');

					const street = convertStreetT24(result.permanentAddress, 'STREET');

					const salaryCustomer = result.salary ? result.salary : '';

					const occupationCustomer = result.occupation ? result.occupation : '';

					const genderCustomer = result.gender ? result.gender : '';

					const seabRegStatus = result.seabRegStatus ? result.seabRegStatus : ''; //c?? tr??

					const birthDate = result.dateOfBirth ? result.dateOfBirth : '';

					const email = result.email ? result.email.split('#')[0] : '';

					const phoneHome = result.phone ? result.phone.split('#')[0] : '';

					const currentAddress = result.currentAddress ? result.currentAddress.replaceAll('#', ' ') : ''; //?????a ch??? th?????ng tr??

					this.secondaryCardForm.at(index).patchValue({
						province: provinceName,
						nationality: nationalityName,
						ward: wardName,
						salary: salaryCustomer,
						occupation: occupationCustomer,
						addressT24: result.address,
						gender: genderCustomer,
						seabRegStatus: seabRegStatus,
						phone: phoneHome,
						email: email,
						birthDate: birthDate,
						street: street,
						currentAddress: currentAddress
					});

				} else {
					return;
				}
			});
	}

	/**
	 * H??m n??y ki???m tra vi???c m??? th??? c?? g???n v???i t??i kho???n VND kh??ng.
	 * @return false n???u kh??ng th???a m??n ??i???u ki???n, disable check box ch???n m??? th???
	 * v?? tooltip show l??n th??ng b??o : 'M??? t??i kho???n VND ????? ch???n m??? th???'
	 */
	isOpenCardWithAccountVndCurrency(): Observable<boolean> {
		const cardCheckBox = this.frm.cardCheckbox.value;
		if (cardCheckBox) {
			return of(true);
		}

		const accountCheckBoxChecked = this.parentForm.get('accountInfoForm').get('accountCheckbox').value;
		let accountCurrency = this.parentForm.get('accountInfoForm').get('currency').value;
		// @ts-ignore
		const isVND = accountCurrency == 'VND';

		//Disable checkbox m??? th??? n???u combo KH m???i kh??ng m??? k??m t??i kho???n thanh to??n VND
		if (this.isExCombo == false && (!accountCheckBoxChecked || !accountCurrency || !isVND)) {
			return of(false);
		}

		//Disable checkbox m??? th??? n???u list account c???a KH c?? kh??ng c?? t??i kho???n VND
		// v?? KH c??ng ko ch???n m??? m???i account VND trong combo
		const accountsVND = this.accountsVndOfCustomer$.getValue();
		if (this.isExCombo && (accountsVND.length == 0 && (accountCheckBoxChecked == false || !isVND))) {
			return of(false);
		}

		return of(true);
	}


	getDistrict1(provinceId?: string, districtId?: any, index?: any) {

		if (provinceId == null || districtId == null || index == null) {
			return;
		}

		let command = GET_ENQUIRY;
		let enquiry: {};
		enquiry = {
			authenType: 'getDISTRICTS',
			cityID: provinceId
		};
		this.isLoadingDistrict$.next(true);
		let bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.commonService.actionGetEnquiryUtility(bodyRequest).pipe(finalize(
			() => this.isLoadingDistrict$.next(false)))
			.subscribe(r => {
				if (r.status == STATUS_OK && r.enquiry.responseCode == CODE_00) {
					this.districtList = r.enquiry.district;

					const district = this.districtList.find(i => i.districID == districtId);
					const districtName = district && district.name_gb ? district.name_gb : '';
					this.secondaryCardForm.at(index)['controls']['district'].setValue(districtName);

				} else {
					this.districtList = [];
				}
			});
	}

	getCityList() {
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
					}
				});
		}
	}

	getListCountry() {
		const cache = this.localStorage.retrieve(UTILITY.COUNTRY.COUNTRY_CACHE);
		if (cache) {
			this.countrys = cache;
			return;
		}
		this.utilityService.getCountrysNew()
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					this.countrys = res.body.enquiry.countrys;
					this.localStorage.store(UTILITY.COUNTRY.COUNTRY_CACHE, this.countrys);
				}
			});
	}

	ngOnDestroy() {
		this.commonService.cardStatus$.next(null);
		this.commonService.cardError$.next(null);
		this.promotion$.next(null);
		this.transPro$.next(null);
		this.componentDestroyed.next();
	}
}
