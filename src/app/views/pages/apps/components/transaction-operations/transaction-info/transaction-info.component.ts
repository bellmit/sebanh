import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import {Router} from '@angular/router';
import {LocalStorageService} from 'ngx-webstorage';
import {CommonService} from '../../../../../common-service/common.service';
import {BehaviorSubject} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {STATUS_OK} from '../../../../../../shared/util/constant';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalChooseCustomerComponent} from '../../../../../../shared/directives/modal-common/modal-choose-customer/modal-choose-customer.component';
import {isNullOrEmpty} from '../../../../../../shared/util/Utils';
import {CoreAiService} from '../../identify-customer/service/core-ai.service';
import {SignatureService} from '../../identify-customer/service/signature.service';

@Component({
	selector: 'kt-transaction-info',
	templateUrl: './transaction-info.component.html',
	styleUrls: ['./transaction-info.component.scss']
})
export class TransactionInfoComponent implements OnInit, OnDestroy, OnChanges {
	@Input() parentForm: FormGroup;
	@Input() isLoading: boolean;
	@Input() dataFrmDash: any;
	@Input() inputter: boolean;
	@Input() authoriser: boolean;
	@Input() customerId$: BehaviorSubject<string> = new BehaviorSubject<string>('');

	transactionForm: FormGroup;

	@Output() onSearch: EventEmitter<any> = new EventEmitter<any>();
	@Output() onResetFormValue: EventEmitter<any> = new EventEmitter<any>();

	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	dataCustomer: any = [];

	constructor(private fb: FormBuilder,
				private router: Router,
				private localStorage: LocalStorageService,
				public commonService: CommonService,
				private modal: NgbModal,
				private coreAiService: CoreAiService,
				private signatureService: SignatureService
	) {
		this.transactionForm = this.fb.group({
			transId: [''],
			priority: [''],
			customerId: [''],
			gttt: [''],
		});
	}

	ngOnInit() {
		this.parentForm.addControl('transactionForm', this.transactionForm);
		let username = this.localStorage.retrieve('username');
		if (this.dataFrmDash) {
			console.log('this.dataFrmDash', this.dataFrmDash);
			this.transactionForm.patchValue({
				transId: this.dataFrmDash.id,
				priority: this.dataFrmDash.priority,
				customerId: this.dataFrmDash.customerId,
				gttt: this.dataFrmDash.gttt
			});
		} else {
			this.transactionForm.patchValue({
				transId: getRandomTransId(username.toUpperCase(), this.chooseType(this.router.url)),
				// transId: getRandomNumber(this.chooseType(this.router.url)),
				priority: 'PRIMARY'
			});
			this.commonService.cusTransId$.next(this.transactionForm.controls.transId.value);
		}

		if (this.commonService.isUpdateSMS$.getValue() || this.commonService.isUpdateCus$.getValue() || this.commonService.isUpdateAccount$.getValue()) {
			this.transactionForm.controls.transId.disable();
			this.transactionForm.controls.priority.disable();
			this.transactionForm.controls.customerId.disable();
			this.transactionForm.controls.gttt.disable();
		}
		// if (this.commonService.selectUpdateCus$.getValue()) {
		// 	this.customerId$.subscribe(id => {
		// 		this.transactionForm.controls.customerId.setValue(id);
		// 		// this.onSearch.emit();
		// 	})
		// }


		// có action360 => patch value customerId
		if (this.commonService.isAction360$.getValue()) {
			this.transactionForm.patchValue({
				customerId: this.commonService.customerId$.getValue()
			});
		}
	}

	chooseType(routerUrl: string) {
		switch (routerUrl) {
			case '/pages/e-bank': {
				return 'ebank';
			}

			case '/pages/sms': {
				return 'sms';
			}

			case '/pages/card': {
				return 'card';
			}

			case '/pages/account': {
				return 'account';
			}

			case '/pages/customer': {
				return 'customer';
			}

			case '/pages/customer-manage': {
				return 'customer';
			}

			case '/pages/combo1': {
				return 'combo1';
			}

			case '/pages/combo2': {
				return 'combo2';
			}

			case '/pages/combo3': {
				return 'combo3';
			}

			case '/pages/super': {
				return 'super';
			}
		}
	}

	searchCustomerInfo() {
		// clear image on aside right
		this.coreAiService.cardBackScan$.next(null);
		this.coreAiService.cardFrontScan$.next(null);
		this.coreAiService.faceScan$.next(null);
		this.coreAiService.fingerLeftScan$.next(null);
		this.coreAiService.fingerRightScan$.next(null);
		this.signatureService.verifySignature$.next(null);


		this.commonService.isFoundCustomerInfo.next(false);

		let customerId = this.transactionForm.controls.customerId.value;
		let legalId = this.transactionForm.controls.gttt.value;

		if ((!isNullOrEmpty(customerId) && isNullOrEmpty(legalId))) {
			this.commonService.isFoundCustomerInfo.next(true);
			this.commonService.customerId$.next(customerId);
			this.onSearch.emit();
			return;
		}

		this.isLoading$.next(true);
		let body: any = {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.CUSTOMER.FIND2',
				customerId: this.transactionForm.controls.customerId.value,
				legalId: this.transactionForm.controls.gttt.value
			}
		};

		this.commonService.getListCustomerInfo(body, false)
			.pipe(finalize(() => this.isLoading$.next(false)))
			.subscribe(res => {
				if (res && res.body.status == STATUS_OK && res.body.enquiry.customerFind2) {
					this.commonService.isFoundCustomerInfo.next(true);
					this.dataCustomer = res.body.enquiry.customerFind2;
					this.showChoiceModal(this.dataCustomer);
				} else {
					this.dataCustomer = [];
					this.commonService.isFoundCustomerInfo.next(false);
					this.commonService.error('không tìm thấy thông tin khách hàng');
					this.onResetFormValue.emit();
					return;
				}
			});
	}

	showChoiceModal(customerInfos: any) {
		this.commonService.changeCustomerGTTT$.next(true);
		const modal = this.modal.open(ModalChooseCustomerComponent,
			{
				backdrop: 'static',
				keyboard: false,
				size: 'sm',
				centered: true,
				windowClass: 'changeCodeDialog'
			});
		modal.componentInstance.listCustomerInfo = customerInfos;

		modal.componentInstance.emitService.subscribe(i => {
			this.commonService.customerId$.next(i.custId);
			this.onSearch.emit();
		});
	}

	ngOnDestroy(): void {
		this.commonService.isAction360$.next(null);
		this.commonService.customerId$.next(null);
		this.commonService.changeCustomerGTTT$.next(null);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataFrmDash && !changes.dataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('dataFrmDash')) {
				this.ngOnInit();
			}
		}
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
}
