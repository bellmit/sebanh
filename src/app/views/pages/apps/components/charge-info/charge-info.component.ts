import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, AfterViewInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {
	CODE_00,
	HEADER_API_ACCOUNT,
	HEADER_API_T24_ENQUIRY,
	SERVER_API_CUST_INFO,
	SEVER_API_T24_ENQUIRY,
	STATUS_OK,
	UTILITY
} from '../../../../../shared/util/constant';
import {AccountRequestDTO} from '../../../../../shared/model/constants/account-requestDTO';
import {BehaviorSubject} from 'rxjs';
import {LocalStorageService} from 'ngx-webstorage';
import {UtilityService} from '../../../../../shared/services/utility.service';
import {DataPowerService} from '../../../../../shared/services/dataPower.service';
import {AppConfigService} from '../../../../../app-config.service';
import moment from 'moment';
import {LOCAL_DATE} from '../../../../../shared/model/constants/common-constant';
import {ChargeInfoService} from './charge-info.service';
import {CommonService} from '../../../../common-service/common.service';

@Component({
	selector: 'kt-charge-info',
	templateUrl: './charge-info.component.html',
	styleUrls: ['./charge-info.component.scss']
})

/**
 * @author namnd
 */
export class ChargeInfoComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

	@Input() parentForm: FormGroup; //Form của component cha
	@Input() feePolicies: any[];    //Chính sách thu phí, truyền động theo các component
	@Input() customerId: any;       //sử dụng customerId để truy vấn ds TK thanh toán của KH
	@Input() chargeInfoData: any;   // data được lấy từ bảng danh sách giao dịch trang chủ
	@Input() businessType: string;  //TÊN LOẠI NGHIÊP VỤ
	@Input() idParent: string;      // Khóa ngoại, tham chiếu đến id của bảng cha
	@Input() isReadOnly: any;

	chargeInfoForm: FormGroup;
	isThuPhi: boolean;
	accountInfo$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	chargeCodes$ = new BehaviorSubject<any[]>([]);
	tenTaiKhoanThuPhi$: BehaviorSubject<string> = new BehaviorSubject<string>('');
	isLoadingAccountInfo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	isLoadingCheckTaiKhoanThuPhi$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	thongTinTaiKhoanThuPhi: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	TAI_KHOAN_THANH_TOAN = '1001';
	TK_QUY_TAI_QUAY_GIAO_DICH = '10001';

	soDuKhaDung: number;

	isClicked: boolean;
	vat: any;
	listAccountOfUser$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
	isLoadingListAccountOfCustomer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private fb: FormBuilder,
				private localStorage: LocalStorageService,
				private utilityService: UtilityService,
				private dataPowerService: DataPowerService,
				private appConfigService: AppConfigService,
				private chargeInfoService: ChargeInfoService,
				public commonService: CommonService
	) {

	}

	ngOnInit() {
		this.getChargeCodes();

		this.chargeInfoForm = this.fb.group({
			id: [null], // id khóa chính,
			idParent: [null], // id khóa ngoại,
			feePolicy: ['MIEN_PHI'], // phương thức thu phí ,
			accountPolicy: ['MIEN_PHI'], // phương thức thu phí combo
			feeAccount: [null], //TK thu phí
			feeDate: [new Date()],
			totalFeeAmt: [null],
			chgId: [null], //Bút toán thu phí
			explain: [null],
			businessType: [null],
			feeInfos: this.fb.array([this.initNewFeeInfoForm()]),
			vat: [null]
		});


		this.parentForm.addControl('chargeInfoForm', this.chargeInfoForm);

		if (this.chargeInfoData) {
			this.patchValue(this.chargeInfoData);
			let feeCode = this.chargeCodes$.getValue().find(fee => fee.id == this.chargeInfoData.feeCode);
			this.vat = feeCode ? feeCode.vat : null;

			const hinhThuTHuPhi = this.frm.feePolicy.value || this.frm.accountPolicy.value;
			const taiKhoanTHuPhi = this.frm.feeAccount.value;

			if ('TIEN_MAT' === hinhThuTHuPhi) {
				this.checkTaiKhoanThuPhi(taiKhoanTHuPhi);
			}
		}
		//form array mã phí thay đổi, tính lại tổng tiền thu;
		this.chargeInfoForm.get('feeInfos').valueChanges.subscribe(changes => {
			let totalAmount: number = 0;
			for (let i = 0; i < (changes && changes.length); i++) {
				const feeAmt = Number(changes[i].feeAmt);
				const tax = Number(changes[i].tax);
				totalAmount = Number(totalAmount) + feeAmt + tax;
			}
			this.frm.totalFeeAmt.setValue(totalAmount);

			// Check số dư khả dụng của TK thu phí
			this.checkSoDuKhaDung(this.soDuKhaDung, totalAmount);
		});
	}

	ngAfterViewInit() {
		this.chargeInfoService.customerIdOfAccounts.subscribe(customerId => {
			if (customerId) {
				this.getListAccountOfCustomer(customerId);
			}
		});
	}


	get frm() {
		if (this.chargeInfoForm && this.chargeInfoForm.controls) {
			return this.chargeInfoForm.controls;
		}
	}

	get parentFrm() {
		if (this.parentForm && this.parentForm.controls) {
			return this.parentForm.controls;
		}
	}


	/**
	 * Hàm này tính tổng số tiền thu phí, số tiền phí và VAT
	 * VAT giai đoan này fix cứng 10% -> BA confirmed
	 * VAT trên T24 đang tự động là tròn, nên client cũng sử dụng Match.round để tự động làm tròn
	 *  if(taxCode = null of = 99 -> VAT = 0; else VAT = 10%)
	 * @param feeAmount -> số tiền phí/ mã phí
	 * @param chargeCodeObj
	 * @param index
	 */
	 listFee: any = [];
	zeroFee$ = new BehaviorSubject<any[]>([])
	calculateTotalAmount(feeAmount: any, chargeCodeObj?: any, index?: number) {
		// Hiển thị khi nhập tay
		if(feeAmount && feeAmount == 0) {
			this.listFee[index] = 'Số tiền phí phải lớn hơn 0'
				this.zeroFee$.next(this.listFee)
		} else {
			this.listFee[index] = '';
			this.zeroFee$.next(this.listFee)
		}

		if (chargeCodeObj) {
			this.vat = chargeCodeObj.vat;

			// Hiển thị khi chọn mã phí
			if(chargeCodeObj.flatAmt == 0) {
			console.log('chargeCodeObj', chargeCodeObj);
			this.listFee[index] = 'Số tiền phí phải lớn hơn 0'
				this.zeroFee$.next(this.listFee)
				// this.feeInfosFormArray.at(index).get('feeAmt').setErrors({free: true})
				// 	this.feeInfosFormArray.at(index).get('feeAmt').markAsTouched();
			} else {
				this.listFee[index] = '';
				this.zeroFee$.next(this.listFee)
			}
		} else {
			const feeCode = this.feeInfosFormArray.at(index).get('feeCode').value;
			if (feeCode) {
				chargeCodeObj = this.chargeCodes$.getValue().find(c => c.id == feeCode);
			}
		}

		//clear mã phí, xóa trắng các formControl liên quan
		if (!feeAmount && !chargeCodeObj && !index) {
			this.resetFormChargeInfo();
		}
		const feeAmountConvertNumber = feeAmount.replace(/,/g, '');
		const tax = chargeCodeObj ? (Number(feeAmountConvertNumber) * Number(chargeCodeObj.vat)) / 100 : 0;

		this.feeInfosFormArray.at(index).get('feeAmt').setValue(feeAmountConvertNumber);
		this.feeInfosFormArray.at(index).get('tax').setValue(Math.round(tax));
	}

	/**
	 * custom tìm kiếm mã phí
	 * @param term
	 * @param item
	 */
	customSearchFee(term: string, item: any) {
		term = term.toLocaleLowerCase();
		return item.id.toLocaleLowerCase().indexOf(term) > -1 ||
			item.gbDescription.toLocaleLowerCase().indexOf(term) > -1 ||
			item.currency.toLocaleLowerCase().indexOf(term) > -1;
	}

	/**
	 * Truy vấn ds mã phí
	 */
	getChargeCodes(): void {
		const cache = this.localStorage.retrieve(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE);
		if (cache) {
			const dataFiltered = cache.filter(ele => ele.flatAmt);
			this.chargeCodes$.next(dataFiltered);
			return;
		}
		this.utilityService.getPortfoliosNew(UTILITY.PORTFOLIOS.PORTFOLIOS_TYPE.FT_COMMISSION_TYPE)
			.subscribe(res => {
				if (res.body.status == STATUS_OK && res.body.enquiry.responseCode == CODE_00) {
					const commisstions = res.body.enquiry.catalogs;
					const dataFiltered = commisstions.filter(ele => ele.flatAmt);
					this.chargeCodes$.next(dataFiltered);
					this.localStorage.store(UTILITY.PORTFOLIOS.PORTFOLIOS_CACHE.FT_COMMISSION_TYPE, commisstions);
				}
			});
	}

	/**
	 * Hàm này sẽ thực hiện việc thêm và xóa validator nếu hình thức thu phí là miễn phí
	 * Nếu user chọn tiền mặt hoặc tài khoản thì thêm validator
	 * @param value
	 */

	updateValidatorThuPhi(value: any) {
		this.tenTaiKhoanThuPhi$.next(null);
		switch (value) {
			case 'TAI_KHOAN':
			case 'TIEN_MAT':
			case 'THU.PHI':
			case 'DUY.TRI.SO.DU':
				this.addValidatorChargeInfoForm();
				this.isThuPhi = true;
				break;

			case 'MIEN_PHI':
			default:
				this.removeValidatorFeeForm();
				this.isThuPhi = false;
		}
	}

	/**
	 * Hàm này sẽ xóa trắng các trường nhập liệu của phần thu phí
	 */
	resetFormChargeInfo() {
		const fieldCloseCard = ['feeAccount', 'explain', 'tax', 'feeAmount'];
		for (let i = 0; i < fieldCloseCard.length; i++) {
			const currentFormControl = this.frm[fieldCloseCard[i]];
			if (currentFormControl) {
				currentFormControl.reset();
			}
		}

		//Xóa trắng form array mã phí
		this.feeInfosFormArray.clear();
		this.addMoreFeeInfoFormArray();
	}

	/**
	 * Hàm này xóa validator cho các ràng buộc required
	 * form control name remove validator: ['feeAccount', 'explain'];
	 */
	removeValidatorFeeForm() {
		const listFieldValidate = ['feeAccount', 'explain'];

		for (let i = 0; i < listFieldValidate.length; i++) {
			const currentFormControl = this.frm[listFieldValidate[i]];
			if (currentFormControl) {
				currentFormControl.clearValidators();
				currentFormControl.markAsUntouched();
				currentFormControl.updateValueAndValidity();
			}
		}

		// xóa validator trong form array mã phí, số tiền phí, thuế
		this.clearValidatorFeeInfoFormArray();
	}


	/**
	 * hàm này khởi tạo form array cho các trường mã phí, số tiền phí, thuế
	 * @param info
	 */
	initNewFeeInfoForm(info?: any): FormGroup {
		return this.fb.group({
			feeAmt: [info ? info.feeAmt : null],
			feeCode: [info ? info.feeCode : null],
			tax: [info ? info.tax : null]
		});
	}

	/**
	 * Thêm mới 1 cụm mã phí, số tiền phí, thuế
	 */
	addMoreFeeInfoFormArray() {
		this.feeInfosFormArray.push(this.initNewFeeInfoForm());
	}

	/**
	 * xóa form mã phí, tiền phí tại index (i)
	 * @param i
	 */
	removeFeeInfoFormAtIndex(i: number) {
		this.feeInfosFormArray.removeAt(i);
	}


	/**
	 * Hàm này xóa toàn bộ validator cho các trường mã phí, số tiền phí -> muiltiple
	 */
	clearValidatorFeeInfoFormArray() {
		for (let i = 0; i < this.feeInfosFormArray.controls.length; i++) {
			for (const fieldName in this.feeInfosFormArray.controls[i]['controls']) {
				this.feeInfosFormArray.controls[i]['controls'][fieldName].clearValidators();
				this.feeInfosFormArray.controls[i]['controls'][fieldName].markAsUntouched();
				this.feeInfosFormArray.controls[i]['controls'][fieldName].updateValueAndValidity();
			}
		}
	}

	/**
	 * Hàm này thêm validator cho các trường mã phí, số tiền phí -> muiltiple
	 */
	addValidatorFeeFormArray() {
		const listFieldValidate = ['feeAmt', 'feeCode'];

		for (let i = 0; (this.feeInfosFormArray.controls && i < this.feeInfosFormArray.controls.length); i++) {
			for (const fieldName in this.feeInfosFormArray.controls[i]['controls']) {
				if (listFieldValidate.includes(fieldName)) {
					this.feeInfosFormArray.controls[i]['controls'][fieldName].setValidators([Validators.required]);
					this.feeInfosFormArray.controls[i]['controls'][fieldName].updateValueAndValidity();
				}
			}
		}
	}

	/**
	 * Hàm này thêm validator cho form thu phí
	 * hàm addValidatorFeeFormArray() -> thêm validator cho cụm mã phí
	 */
	addValidatorChargeInfoForm() {
		const listFieldValidate = ['feeAccount', 'explain'];

		for (let i = 0; i < listFieldValidate.length; i++) {
			const currentFormControl = this.frm[listFieldValidate[i]];
			if (currentFormControl) {
				currentFormControl.setValidators([Validators.required]);
				currentFormControl.updateValueAndValidity();
			}
		}
		this.addValidatorFeeFormArray();
	}


	get feeInfosFormArray(): FormArray {
		if (this.chargeInfoForm) {
			return this.chargeInfoForm.get('feeInfos') as FormArray;
		}
	}

	/**
	 * fill value lên form nếu có dữ liệu từ FE api seateller trả về;
	 * @param data
	 */
	patchValue(data: any) {
		this.chargeInfoForm.patchValue({
			id: data.id ? data.id : null,
			idParent: data.idParent ? data.idParent : null,
			totalFeeAmt: data.totalFeeAmt ? data.totalFeeAmt : null,
			explain: data.explain ? data.explain : null,
			feeAccount: data.feeAccount ? data.feeAccount : null,
			feeDate: data.feeDate ? moment(data.feeDate, 'dd-MM-yyyy').toDate() : null,
			feePolicy: data.feePolicy ? data.feePolicy : null,
			accountPolicy: data.feePolicy ? data.feePolicy : null,
			chgId: data.chgId ? data.chgId : null,
			businessType: data.businessType ? data.businessType : null,
		});
		this.feeInfosFormArray.clear();
		this.patchValueChargeInfoFormArray(data.feeAmt, data.feeCode, data.tax);
	}

	/**
	 * hàm này fill value cho cụm mã phí, tiền phí, thuế
	 * @param feeAmt
	 * @param feeCode
	 * @param tax
	 */
	patchValueChargeInfoFormArray(feeAmt: string, feeCode: string, tax: string) {
		const soTienPhi = feeAmt.split('#');
		const maPhi = feeCode.split('#');
		const taxes = tax.split('#');
		const size = soTienPhi.length;

		for (let i = 0; i < size; i++) {
			this.feeInfosFormArray.push(this.initNewFeeInfoForm({
				feeAmt: soTienPhi[i],
				feeCode: maPhi[i],
				tax: taxes[i],
			}));
		}

		this.updateValidatorThuPhi(this.chargeInfoData.feePolicy);
	}

	/**
	 * Hàm này sẽ build thông tin request thu phí cho API
	 */
	buildRequestCharge() {
		let feeAmt = '';
		let feeCode = '';
		let tax = '';

		this.feeInfosFormArray.value.forEach(i => {
			feeAmt = feeAmt ? (feeAmt + '#' + i.feeAmt) : i.feeAmt;
			feeCode = feeCode ? (feeCode + '#' + i.feeCode) : i.feeCode;
			tax = tax ? (tax + '#' + i.tax) : i.tax;
		});

		return {
			id: this.frm.id.value,
			feeAmt: feeAmt,
			feeCode: feeCode,
			tax: tax,
			idParent: this.frm.idParent.value ? this.frm.idParent.value : this.idParent,
			totalFeeAmt: this.frm.totalFeeAmt.value,
			explain: this.frm.explain.value,
			feeAccount: this.frm.feeAccount.value,
			feeDate: moment(this.frm.feeDate.value).format(LOCAL_DATE),
			feePolicy: this.frm.feePolicy.value,
			accountPolicy: this.frm.feePolicy.value,
			businessType: this.businessType,
			vat: this.vat
		};
	}

	/**
	 * Truy vấn, kiểm tra thông tin tài khoản thu phí theo api authenType: getCURR_INFO-2
	 * Số dư khả dụng của TK quỹ tại quầy = availBal * -1
	 * nếu TK thu phí khác category 10001 và 1001 hoặc loại tiền tệ khác VND thì báo lỗi -> TK ko tồn tại
	 * @param accountId
	 */

	checkTaiKhoanThuPhi(accountId: any) {
		if (!accountId) {
			return;
		}

		this.tenTaiKhoanThuPhi$.next(null);
		this.frm.totalFeeAmt.clearValidators();
		this.frm.totalFeeAmt.updateValueAndValidity();
		this.soDuKhaDung = null;
		this.isLoadingCheckTaiKhoanThuPhi$.next(true);
		this.thongTinTaiKhoanThuPhi.next(null);

		let bodyConfig = AccountRequestDTO.BODY.BODY_GET_CUR_ACCOUNT_INFO2;
		bodyConfig.enquiry.accountID = accountId;

		const url = this.appConfigService.getConfigByKey(SERVER_API_CUST_INFO);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ACCOUNT);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingCheckTaiKhoanThuPhi$.next(false)))
			.subscribe(res => {
				if (res) {
					const accountInfo = res.enquiry.account[0];
					console.log('accountInfo', accountInfo);
					const accountCategoryValid = [this.TAI_KHOAN_THANH_TOAN, this.TK_QUY_TAI_QUAY_GIAO_DICH];
					if (!accountCategoryValid.includes(accountInfo.category) || (accountInfo.currency != 'VND')) {
						this.setTaiKhoanThuPhiKhongHopLe();
						return;
					}

					const tenTaiKhoan = accountInfo.shortTitle + ' - ' + accountInfo.currency;
					this.tenTaiKhoanThuPhi$.next(tenTaiKhoan);
					this.frm.feeAccount.setValue(accountInfo.accountID);
					this.thongTinTaiKhoanThuPhi.next(accountInfo);

					const soDuKhaDung = accountInfo.availBal;
					if (accountInfo.category == this.TK_QUY_TAI_QUAY_GIAO_DICH) {
						this.soDuKhaDung = Number(soDuKhaDung) * -1;
					} else {
						this.soDuKhaDung = Number(soDuKhaDung);
					}

					this.checkSoDuKhaDung(this.soDuKhaDung, this.frm.totalFeeAmt.value);

				} else {
					this.setTaiKhoanThuPhiKhongHopLe();
					return;
				}
			});
	}

	/**
	 * Hàm này check số dư khả dụng của TK khi hình thức thu phí là tài khoản
	 * @param account
	 */
	checkSoDuKhaDungChoTKThuPhiCuaKH(account: any) {
		this.soDuKhaDung = null;
		this.frm.totalFeeAmt.clearValidators();
		this.frm.totalFeeAmt.updateValueAndValidity();
		let soDuKhaDung = account.workingBalance.replaceAll(',', '').trim();
		this.soDuKhaDung = Number(soDuKhaDung);
		this.checkSoDuKhaDung(this.soDuKhaDung, this.frm.totalFeeAmt.value);
	}


	/**
	 * So sánh số dư khả dụng với tổng số tiền thu phí
	 * nếu tổng số tiền thu lớn hơn số sư khả dụng thì báo lỗi -> Không đủ số dư
	 * @param availableBalance
	 * @param inputAmount
	 */
	checkSoDuKhaDung(availableBalance: number, inputAmount: number) {
		if (!availableBalance || !inputAmount) {
			return;
		}

		if (inputAmount > availableBalance) {
			this.frm.totalFeeAmt.setErrors({inputAmountGreaterThanAvailableBalance: true});
			this.frm.totalFeeAmt.markAsTouched();
		} else {
			this.frm.totalFeeAmt.clearValidators();
			this.frm.totalFeeAmt.updateValueAndValidity();
		}
	}

	setTaiKhoanThuPhiKhongHopLe() {
		// this.frm.feeAccount.setValue(null);
		this.frm.feeAccount.setErrors({notExist: true});
		this.frm.feeAccount.markAsTouched();
	}


	/**
	 * Truy vấn thông tin tài khoản thanh toán của KH
	 * sử dụng enquiry truy vấn T24ENQ.SEAB.GET.ACCCUST.SEATELLER
	 * @param customerId
	 */

	getListAccountOfCustomer(customerId: any) {
		this.listAccountOfUser$.next([]);
		this.isLoadingListAccountOfCustomer$.next(true);

		let bodyConfig = AccountRequestDTO.BODY.BODY_ACCOUNT;
		bodyConfig.enquiry.custId = customerId;

		const url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		const header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);
		this.dataPowerService.actionGetEnquiryResponseApi(bodyConfig, header, url)
			.pipe(finalize(() => this.isLoadingListAccountOfCustomer$.next(false)))
			.subscribe(res => {
				if (res) {
					let listTaiKhoanThanhToanKH = res.enquiry.seabGetAcccustSeateller.filter(i => i.category == '1001' && i.currency == 'VND');
					this.listAccountOfUser$.next(listTaiKhoanThanhToanKH);

				} else {
					return;
				}
			});
	}


	ngOnChanges(changes: SimpleChanges): void {

	}

	ngOnDestroy(): void {
		this.isLoadingCheckTaiKhoanThuPhi$.next(false);
		this.thongTinTaiKhoanThuPhi.next(null);
	}
}
