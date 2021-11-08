// tslint:disable:indent
// tslint:disable:max-line-length

import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Subscription} from 'rxjs';
import {Chart} from 'angular-highcharts';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {CommonService} from '../../../../../../common-service/common.service';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {NgbModal, NgbPaginationConfig} from '@ng-bootstrap/ng-bootstrap';
import {DatePipe} from '@angular/common';
import {ProductTypePipe} from '../../../../../../../core/_base/layout/pipes/product.pipe';
import {ComboTypePipe} from '../../../../../../../core/_base/layout/pipes/combo-type.pipe';
import {StatusPipe} from '../../../../../../../core/_base/layout/pipes/status.pipe';
import {AppConfigService} from '../../../../../../../app-config.service';
import {
	CACHE_CO_CODE,
	CODE_OK,
	DELETED,
	STATUS_OK,
	USERNAME_CACHED
} from '../../../../../../../shared/util/constant';
import {EnquiryModel} from '../../../../../../model/enquiry.model';
import moment from 'moment';
import {BodyRequestEnquiryModel} from '../../../../../../model/body-request-enquiry-model';
import {finalize} from 'rxjs/operators';
import {formatDate} from '../../../../../../../shared/util/date-format-ultils';
import {removeUTF8} from '../../../../../../../shared/model/remove-UTF8';

@Component({
  selector: 'kt-sla-history-detail',
  templateUrl: './sla-history-detail.component.html',
  styleUrls: ['./sla-history-detail.component.scss']
})
export class SlaHistoryDetailComponent implements OnInit  {
	circleData: any = [];
	transactions: any = [];
	savedCombos: any = [];
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	username: string;

	arr = [];
	browserLang: string;

	data: any;

	isLoadingData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	selectIndex: number;
	selectedData: any[] = [];
	masterSelected: boolean;

	// Sorting
	isIncreaseIndex = false;
	isIncreaseID = false;
	isIncreaseCusId = false;
	isIncreaseStatus = false;
	isIncreaseTransOpera = false;
	isIncreaseInputter = false;
	isIncreaseAuthoriser = false;
	isIncreaseTimeUpdate = false;
	isIncreaseGttt = false;
	isIncreaseIdenType = false;
	isIncreasePriority = false;

	// Paging
	page = 1;
	pageSize = 5;

	sub: Subscription;
	// filter by column
	rawData$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	filterStatus: string[] = [];
	filterPiority: string[] = [];

	dataGTTT: any[] = [];

	statusForm = this.fb.group({
		statusArray: this.fb.array([]),
	});
	priorityForm = this.fb.group({
		priorityArray: this.fb.array([])
	});
	accessRightIds: any;
	inputtable$ = new BehaviorSubject<boolean>(false);
	authorisable$ = new BehaviorSubject<boolean>(false);
	constructor(public translate: TranslateService,
				         private localStorage: LocalStorageService,
				         private sessionStorage: SessionStorageService,
				         private fb: FormBuilder,
				         public commonService: CommonService,
				         private toastService: ToastrService,
				         private router: Router,
				         private config: NgbPaginationConfig,
				         private datePipe: DatePipe,
				         private productTypePipe: ProductTypePipe,
				         private comboTypePipe: ComboTypePipe,
				         private statusPipe: StatusPipe,
				 ) {
		this.accessRightIds = this.commonService.getRightIdsByUrl(this.router.url);
		config.size = 'sm';
		config.boundaryLinks = true;
		this.browserLang = translate.getBrowserLang();
		this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
			this.browserLang = event.lang;
		});

		this.username = this.localStorage.retrieve(USERNAME_CACHED);
	}

	ngOnInit() {
		this.searchData();
	}

	ngOnDestroy() {
		this.commonService.isDisplayNotice$.next(false);
		this.sub.unsubscribe();
		this.checkRight()
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

	searchData() {

		this.selectedData = [];
		this.clearFilter();
		/**
		 * Body request of table data
		 */
		const command = 'GET_ENQUIRY';
		const enquiry = new EnquiryModel();
		enquiry.authenType = 'getCombos';
		enquiry.data = {
		};

		const bodyRequest = new BodyRequestEnquiryModel(command, enquiry);
		this.isLoadingData$.next(true);

		this.commonService.actionGetEnquiryResponseApi(bodyRequest)
			.pipe(finalize(() => {
				this.isLoadingData$.next(false);
			}))
			.subscribe(res => {
				console.log('RESPONSE GET DATA TABLE --------------------------------------------->>>', res);
				if (res) {

					this.transactions = res.enquiry.product;
					this.pushDataToArray();

				} else {
					return;
				}
			});
	}

	pushDataToArray() {
		this.arr = [];
		/**
		 * Filter data and push to array
		 */
		if (this.transactions && this.transactions.listAccountBalance != null) {
			this.transactions.listAccountBalance.filter(r => r.type = 'INSODU_TK');
			this.transactions.listAccountBalance.forEach(r => {
				this.arr.push(r);
			});
		}
		if (this.transactions && this.transactions.listStatement != null) {
			this.transactions.listStatement.filter(r => r.type = 'SAO_KE');
			this.transactions.listStatement.forEach(r => {
				 this.arr.push(r);
			});
		}

		if (this.transactions && this.transactions.listEBank != null) {
			this.transactions.listEBank.filter(r => r.type = 'ebank');
			this.transactions.listEBank.forEach(r => {
				this.arr.push(r);
			});
		}
		if (this.transactions && this.transactions.listCombo != null) {
			this.transactions.listCombo.filter(r => r.type = 'combo');
			this.transactions.listCombo.forEach(r => {
			    this.arr.push(r);
			});
		}
		if (this.transactions && this.transactions.listSms != null) {
			this.transactions.listSms.filter(r => r.type = 'sms');
			this.transactions.listSms.forEach(r => {
				this.arr.push(r);
			});
		}

		if (this.transactions && this.transactions.listCard != null) {
			this.transactions.listCard.filter(r => r.type = 'card');
			this.transactions.listCard.forEach(r => {
				this.arr.push(r);
			});
		}
		if (this.transactions && this.transactions.listAccount != null) {
			this.transactions.listAccount.filter(r => r.type = 'account');
			this.transactions.listAccount.forEach(r => {
				this.arr.push(r);
			});
		}

		if (this.transactions && this.transactions.listCustomer != null) {
			this.transactions.listCustomer.filter(r => r.type = 'customer');
			console.log('this.transactions.listCustomer', this.transactions.listCustomer);

			this.transactions.listCustomer.forEach(r => {
						this.arr.push(r);
			});
		}
		this.arr.sort((prev, next) => {
			return moment(this.getTimeUpdate(next), 'DD-MM-YYYY HH:mm:ss').unix() - moment(this.getTimeUpdate(prev), 'DD-MM-YYYY HH:mm:ss').unix();
		});
		this.rawData$.next(this.arr);
	}

	getTimeUpdate(trans: any): string {
		return trans.combo ? trans.combo.timeUpdate : trans.timeUpdate;
	}

	chooseTransaction(data: any) {

	}

	/**
	 * Sắp xếp các thuộc tính trong bảng
	 * @param property: tên thuộc tính cần sắp xếp
	 */
	sortColumn(property: string) {
		this.page = 1;
		let isIncreaseRow;
		switch (property) {

			case 'index': {
				isIncreaseRow = this.isIncreaseIndex = !this.isIncreaseIndex;
				break;
			}
			case 'id': {
				isIncreaseRow = this.isIncreaseID = !this.isIncreaseID;
				break;
			}
			case 'customerId': {
				isIncreaseRow = this.isIncreaseCusId = !this.isIncreaseCusId;
				break;
			}
			case 'gttt': {
				isIncreaseRow = this.isIncreaseGttt = !this.isIncreaseGttt;
				break;
			}
			case 'priority': {
				isIncreaseRow = this.isIncreasePriority = !this.isIncreasePriority;
				break;
			}
			case 'idenType': {
				isIncreaseRow = this.isIncreaseIdenType = !this.isIncreaseIdenType;
				break;
			}
			case 'transOpera': {
				isIncreaseRow = this.isIncreaseTransOpera = !this.isIncreaseTransOpera;
				break;
			}
			case 'status': {
				isIncreaseRow = this.isIncreaseStatus = !this.isIncreaseStatus;
				break;
			}

			case 'inputter': {
				isIncreaseRow = this.isIncreaseInputter = !this.isIncreaseInputter;
				break;
			}
			case 'authoriser': {
				isIncreaseRow = this.isIncreaseAuthoriser = !this.isIncreaseAuthoriser;
				break;
			}
			case 'timeUpdate': {
				isIncreaseRow = this.isIncreaseTimeUpdate = !this.isIncreaseTimeUpdate;
				break;
			}
		}

		if (property) {
			this.arr = this.arr.sort((previousTransaction, nextTransaction) => {
				let firstItem;
				let secondItem;
				switch (property) {
					case 'gttt': {
						firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.customer ? Number(previousTransaction.customer[property]) : null) : (previousTransaction[property] ? Number(previousTransaction[property]) : null));
						secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.customer ? Number(nextTransaction.customer[property]) : null) : (nextTransaction[property] ? Number(nextTransaction[property]) : null));
						break;
					}

					case 'idenType' : {
						firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.customer ? previousTransaction.customer[property] : null) : (previousTransaction[property] ? previousTransaction[property] : null));
						secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.customer ? nextTransaction.customer[property] : null) : (nextTransaction[property] ? nextTransaction[property] : null));
						break;
					}

					case 'status' : {
						firstItem = removeUTF8(previousTransaction.combo ? this.statusPipe.transform(previousTransaction.combo[property]) : this.statusPipe.transform(previousTransaction[property]));
						secondItem = removeUTF8(nextTransaction.combo ? this.statusPipe.transform(nextTransaction.combo[property]) : this.statusPipe.transform(nextTransaction[property]));
						break;
					}

					case 'transOpera' : {
						firstItem = removeUTF8(previousTransaction.combo ? this.comboTypePipe.transform(previousTransaction.combo[property]) : this.productTypePipe.transform(previousTransaction[property]));
						secondItem = removeUTF8(nextTransaction.combo ? this.comboTypePipe.transform(nextTransaction.combo[property]) : this.productTypePipe.transform(nextTransaction[property]));
						break;
					}

					default: {
						firstItem = removeUTF8(previousTransaction.combo ? (previousTransaction.combo[property] ? previousTransaction.combo[property] : null) : (previousTransaction[property] ? previousTransaction[property] : null));
						secondItem = removeUTF8(nextTransaction.combo ? (nextTransaction.combo[property] ? nextTransaction.combo[property] : null) : (nextTransaction[property] ? nextTransaction[property] : null));
						break;
					}
				}

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

	/**
	 * Hiển thị các bản ghi trên 1 trang
	 */
	calculateTotalPage() {
		const total = this.page * this.pageSize;
		if (total > this.arr.length) {
			return this.arr.length;
		} else {
			return this.page * this.pageSize;
		}
	}

	/**
	 * Select box check hoặc uncheck all
	 */
	checkUncheckAll() {
		this.selectedData = [];
		for (let i = 0; i < this.arr.length; i++) {
			this.arr[i].isSelected = this.masterSelected;
			if (this.arr[i].isSelected == true) {
				this.selectedData.push(this.arr[i]);
			}
		}
		console.log(this.selectedData, 'all');
	}


	/**
	 * Select box check or uncheck only one
	 */
	isAllSelected(obj: any, event: any) {
		if (event.target.checked == true) {
			this.selectedData.push(obj);
			this.selectedData.filter(r => {
				return r.isSelected = true;
			});
			console.log(this.selectedData);
		} else {
			this.selectedData.splice(this.selectedData.indexOf(obj), 1);
			console.log(this.selectedData);
		}
	}


	// <editor-fold desc="filter data">

	onCheckboxStatusChange(event): void {
		const statusArray: FormArray = this.statusForm.get('statusArray') as FormArray;
		if (event.target.checked) {
			statusArray.push(new FormControl(event.target.value));
		} else if (!event.target.checked) {
			let i = 0;
			statusArray.controls.forEach((item: FormControl) => {
				if (item.value == event.target.value) {
					statusArray.removeAt(i);
					return;
				}
				i++;
			});
		}

		this.filterStatus = statusArray.value;
		this.handleFilterData(null, null);
	}

	onCheckboxPriorityChange(event): void {
		const priorityArray: FormArray = this.priorityForm.get('priorityArray') as FormArray;
		if (event.target.checked) {
			priorityArray.push(new FormControl(event.target.value));
		} else if (!event.target.checked) {
			let i = 0;
			priorityArray.controls.forEach((item: FormControl) => {
				if (item.value == event.target.value) {
					priorityArray.removeAt(i);
					return;
				}
				i++;
			});
		}

		this.filterPiority = priorityArray.value;
		this.handleFilterData(null, null);
	}

	onShowPopStatus(): void {
		setTimeout(() => {
			const statusArray: FormArray = this.statusForm.get('statusArray') as FormArray;
			statusArray.value.forEach(status => {
				const ele = document.getElementById(status) as HTMLInputElement;
				ele.checked = true;
			});
		}, 50);
	}

	onShowPopPriority(): void {
		setTimeout(() => {
			const priorityArray: FormArray = this.priorityForm.get('priorityArray') as FormArray;
			priorityArray.value.forEach(status => {
				const ele = document.getElementById(status) as HTMLInputElement;
				ele.checked = true;
			});
		}, 50);
	}

	handleFilterData(event, property: string): void {
		let arr = this.rawData$.getValue();
		if (this.filterStatus.length > 0) {
			arr = arr.filter(ele => {
				if (ele.combo) { // neu la combo thi de nguyen
					return this.filterStatus.includes(ele.combo.status);
				} else { // khong phai combo
					if (this.filterStatus.includes('APPROVED_SUCCESS')) { // tuong duong approved
						const filterStatus = this.filterStatus.concat('APPROVED');
						return filterStatus.includes(ele.status);
					}
					if (this.filterStatus.includes('APPROVED')) { // tuong duong voi approve_success o combo
						let filterStatus = this.filterStatus;
						filterStatus = filterStatus.filter(ele => ele != 'APPROVED');
						return filterStatus.includes(ele.status);
					}
					return this.filterStatus.includes(ele.status);
				}

			});
		}
		if (this.filterPiority.length > 0) {
			arr = arr.filter(ele => ele.combo ? this.filterPiority.includes(ele.combo.priority) : this.filterPiority.includes(ele.priority));
		}
		this.arr = arr;
	}

	clearFilter(): void {
		this.filterStatus = [];
		this.filterPiority = [];
		const arr = this.statusForm.get('statusArray') as FormArray;
		arr.clear();
		const arr1 = this.priorityForm.get('priorityArray') as FormArray;
		arr1.clear();
	}

	// </editor-fold desc="filter data">
}
