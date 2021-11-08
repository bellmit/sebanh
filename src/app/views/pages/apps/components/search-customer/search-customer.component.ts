import {CommonService} from '../../../../common-service/common.service';
import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ToastrService} from 'ngx-toastr';
import {DataPowerService} from '../../../../../shared/services/dataPower.service';
import {HEADER_API_T24_ENQUIRY, SEVER_API_T24_ENQUIRY, STATUS_OK} from '../../../../../shared/util/constant';
import {finalize} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {formatDate, formatDateReseve} from '../../../../../shared/util/date-format-ultils';
import {Router} from '@angular/router';
import {removeUTF8} from '../../../../../shared/model/remove-UTF8';
import {convert} from '../../../../../shared/util/function-common';
import {AppConfigService} from '../../../../../app-config.service';
import {CoreAiService} from '../identify-customer/service/core-ai.service';

@Component({
	selector: 'kt-search-customer',
	templateUrl: './search-customer.component.html',
	styleUrls: ['./search-customer.component.scss']
})
export class SearchCustomerComponent implements OnInit, OnDestroy {
	@Output() emitService = new EventEmitter<any>();
	today = new Date();
	dataCustomer = [];
	t24Url: string = null;
	isIncreaseCustomerId: boolean = false;
	isIncreaseCustomerName: boolean = false;
	isIncreaseCusDob: boolean = false;
	isIncreaseCusIdentify: boolean = false;
	isIncreasePhoneNumber: boolean = false;
	isIncreaseAddress: boolean = false;
	isIncreaseCustomerType: boolean = false;
	isIncreaseCoCode: boolean = false;
	header: any;

	page = 1;
	pageSize = 5;
	groupList: any;

	show: any;
	dataSelect: any;
	isLoading$: BehaviorSubject<any> = new BehaviorSubject<any>(false);

	searchForm: FormGroup;

	constructor(
		private _activeModal: NgbActiveModal,
		private _toastr: ToastrService,
		private commonService: CommonService,
		private dpwService: DataPowerService,
		private fb: FormBuilder,
		private router: Router,
		private appConfigService: AppConfigService,
		private coreAiService: CoreAiService
	) {
		this.t24Url = this.appConfigService.getConfigByKey(SEVER_API_T24_ENQUIRY);
		this.header = this.appConfigService.getConfigByKey(HEADER_API_T24_ENQUIRY);

		this.searchForm = this.fb.group({
			customerId: [''],
			customerName: [''],
			customerDob: [''],
			legalId: [''],
			phoneNumber: ['']
		});
	}

	parentName: string;
	childOne: string;
	childTwo: string;

	ngOnInit() {
		this.parentName = 'Trang chủ';
		this.childOne = 'Tìm kiếm';
		this.childTwo = '';
	}

	ngOnDestroy() {
		// this.disabled$.next(false);
	}

	close(): void {
		this._activeModal.close(true);
	}

	search(): void {
		this.searchForm.patchValue({
			customerId: this.searchForm.controls.customerId.value ? this.searchForm.controls.customerId.value : '',
			customerName: this.searchForm.controls.customerName.value ? this.searchForm.controls.customerName.value : '',
			customerDob: this.searchForm.controls.customerDob.value ? this.searchForm.controls.customerDob.value : '',
			legalId: this.searchForm.controls.legalId.value ? this.searchForm.controls.legalId.value : '',
			phoneNumber: this.searchForm.controls.phoneNumber.value ? this.searchForm.controls.phoneNumber.value : ''
		});

		this.isLoading$.next(true);
		let body: object = {
			'command': 'GET_ENQUIRY',
			'enquiry': {
				'enqID': 'T24ENQ.CUSTOMER.FIND2',
				'customerId': this.searchForm.controls.customerId.value,
				'customerName': convert(this.searchForm.controls.customerName.value).toUpperCase(),
				'legalId': this.searchForm.controls.legalId.value,
				'phoneNumber': this.searchForm.controls.phoneNumber.value,
				'dob': this.searchForm.controls.customerDob.value ? formatDateReseve(this.searchForm.controls.customerDob.value) : ''
			}
		};
		this.dpwService.getListCustomerIfnfo(body, this.header, this.t24Url, false)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(res => {
				this.coreAiService.faceScan$.next(null);
				this.coreAiService.cardFrontScan$.next(null);
				this.coreAiService.cardBackScan$.next(null);
				if (res && res.body.status == STATUS_OK && res.body.enquiry.customerFind2) {
					this.childTwo = 'Kết quả tìm kiếm';
					const rawData: any[] = res.body.enquiry.customerFind2;
					console.log('rawData', rawData);
					this.dataCustomer = rawData.filter(customer => !customer.errorId);
					this.dataCustomer.map(item => {
						let itemData = item.address.replaceAll('#', '').split('&&');
						let itemClone = [...itemData];
						if (itemClone.length == 5) {
							itemData[0] = itemClone[0].substr(6);
							itemData[1] = itemClone[1].substr(9);
							itemData[2] = itemClone[2].substr(13);
							itemData[3] = itemClone[3].substr(9);
							itemData[4] = itemClone[4].substr(11);

							item.address = itemData.toString().replaceAll(',', ', ');
						} else {
							item.address = item.address;
						}
					});

				} else {
					this.dataCustomer = [];
				}
			});
	}

	calculateTotalPage() {
		const total = this.page * this.pageSize;
		if (total > this.dataCustomer.length) {
			return this.dataCustomer.length;
		} else {
			return this.page * this.pageSize;
		}
	}

	onNavigateIdentify(object: object) {
		this.router.navigateByUrl('/pages/identify/info', {
			state: {
				customerInfo: object
			}
		});
	}

	/**
	 * Sắp xếp các thuộc tính trong bảng
	 * @param property: tên thuộc tính cần sắp xếp
	 */
	sortColumn(property: string) {
		this.page = 1;
		let isIncreaseRow;
		switch (property) {
			case 'custId': {
				isIncreaseRow = this.isIncreaseCustomerId = !this.isIncreaseCustomerId;
				break;
			}
			case 'custName': {
				isIncreaseRow = this.isIncreaseCustomerName = !this.isIncreaseCustomerName;
				break;
			}
			case 'birthDate': {
				isIncreaseRow = this.isIncreaseCusDob = !this.isIncreaseCusDob;
				break;
			}
			case 'legal': {
				isIncreaseRow = this.isIncreaseCusIdentify = !this.isIncreaseCusIdentify;
				break;
			}
			case 'phone': {
				isIncreaseRow = this.isIncreasePhoneNumber = !this.isIncreasePhoneNumber;
				break;
			}
			case 'address': {
				isIncreaseRow = this.isIncreaseAddress = !this.isIncreaseAddress;
				break;
			}
			case 'seabCuSegment': {
				isIncreaseRow = this.isIncreaseCustomerType = !this.isIncreaseCustomerType;
				break;
			}
			case 'custCoCode': {
				isIncreaseRow = this.isIncreaseCoCode = !this.isIncreaseCoCode;
				break;
			}
		}

		if (property) {
			this.dataCustomer = this.dataCustomer.sort((previousTransaction, nextTransaction) => {
				let secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.combo[property] ? nextTransaction.combo[property] : null) : (nextTransaction[property] ? nextTransaction[property] : null));
				let firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.combo[property] ? previousTransaction.combo[property] : null) : (previousTransaction[property] ? previousTransaction[property] : null));
				if (isIncreaseRow === true) {
					return (((firstItem ? firstItem : '').toUpperCase().toUpperCase()) > (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;
				} else {
					return ((firstItem ? firstItem : '').toUpperCase() < (secondItem ? secondItem : '').toUpperCase()) ? -1 : ((firstItem ? firstItem : '').toUpperCase() > (secondItem ? secondItem : '').toUpperCase()) ? 1 : 0;
				}
			});
		} else {
			return;
		}

	}

	clearData(property: string) {
		this.searchForm.controls[property].reset();
	}

	checkSpecialChar(e) {
		var keynum;
		var keychar;
		var numcheck;
		// For Internet Explorer
		if (window.event) {
			keynum = e.keyCode;
		}
		// For Netscape/Firefox/Opera
		else if (e.which) {
			keynum = e.which;
		}
		keychar = String.fromCharCode(keynum);
		//List of special characters you want to restrict
		if (keychar == '\'' || keychar == '`' || keychar == '!' || keychar == '@' || keychar == '#' || keychar == '$' || keychar == '%' || keychar == '^' || keychar == '&' || keychar == '*' || keychar == '(' || keychar == ')' || keychar == '-' || keychar == '_' || keychar == '+' || keychar == '=' || keychar == '/' || keychar == '~' || keychar == '<' || keychar == '>' || keychar == ',' || keychar == ';' || keychar == ':' || keychar == '|' || keychar == '?' || keychar == '{' || keychar == '}' || keychar == '[' || keychar == ']' || keychar == '¬' || keychar == '£' || keychar == '"' || keychar == '\\') {
			return false;
		} else {
			return true;
		}
	}

	splitBy(input, char): string[] {
		if (input) {
			return input.split(char);
		}
		return [];
	}
}
