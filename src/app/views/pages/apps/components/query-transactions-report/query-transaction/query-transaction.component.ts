import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import moment from 'moment';
import { CommonService } from '../../../../../common-service/common.service';
import { CACHE_CO_CODE, CODE_00, DELETED, STATUS_OK, USER_GROUP } from '../../../../../../shared/util/constant';
import { LocalStorageService } from 'ngx-webstorage';
import { QueryTransReportService } from '../query-trans-report.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'kt-query-transaction',
    templateUrl: './query-transaction.component.html',
    styleUrls: ['./query-transaction.component.scss', '../../dasboard-new/dashboard-new.component.scss']
})
export class QueryTransactionComponent implements OnInit {

    isLoadingData$ = new BehaviorSubject<boolean>(false);
    rawData$ = new BehaviorSubject<any[]>([]);
    filteredData$ = new BehaviorSubject<any[]>([]);
    transType$ = new BehaviorSubject<string>(null);
    selectedTrans$ = new BehaviorSubject<any>(null);
    users$ = new BehaviorSubject<any[]>([]);

    transTypes = [
        { code: 'ALL', value: 'Tất cả' },
        { code: 'COMBO1', value: 'Mở combo 1' },
        { code: 'COMBO2', value: 'Mở combo 2' },
        { code: 'COMBO3', value: 'Mở combo 3' },
        { code: 'QLSPDV', value: 'Quản lý SPDV' },
        { code: 'customer', value: 'Quản lý thông tin KH' },
    ];

    //Paging
    page = 1;
    pageSize = 5;

    // form search
    searchForm = this.fb.group({
        fatca: [null],
        transId: [null],
        custId: [null],
        inputter: [null],
        fromDate: [new Date(), [Validators.required]],
        toDate: [new Date(), [Validators.required]],
        transType: ['ALL']
    });

    today = new Date();

    constructor(
        private fb: FormBuilder,
        private localStorage: LocalStorageService,
        private service: QueryTransReportService,
        private commonService: CommonService
    ) {
    }

    ngOnInit() {
        this.getUsersInGroup();
        this.onSearch();
    }

    onSearch(): void {
        this.transType$.next(null);
        const inputter = this.searchForm.controls.inputter.value;
        const fatca = this.searchForm.controls.fatca.value;
        const transId = this.searchForm.controls.transId.value;
        const transtype = this.searchForm.controls.transType.value ? this.searchForm.controls.transType.value : 'ALL';
        const custId = this.searchForm.controls.custId.value;
        const fromDate = moment(this.searchForm.controls.fromDate.value).format('DD-MM-YYYY');
        const toDate = moment(this.searchForm.controls.toDate.value).format('DD-MM-YYYY');
        const coCode = this.localStorage.retrieve(CACHE_CO_CODE);
        this.isLoadingData$.next(true);
        const body = {
            fromDate,
            toDate,
            coCode,
            business: transtype,
            inputter,
            fatca,
        };
        this.service.getTransactions(body)
            .pipe(finalize(() => {
                this.isLoadingData$.next(false);
                // this.filterByInputter(inputter);
                this.filterByParams(custId, transId);
            }))
            .subscribe(res => {
                if (res.seabRes.body.status == 'OK' && res.seabRes.body.enquiry.responseCode == '00') {
                    const rawData = res.seabRes.body.enquiry.product;
                    this.rawData$.next(this.pushDataToArray(rawData));
                } else {
                    this.commonService.error('Hệ thống đang xảy ra lỗi. Vui lòng thử lại');
                }
            });
    }

    /**
     * Hiển thị các bản ghi trên 1 trang
     */
    calculateTotalPage() {
        const total = this.page * this.pageSize;
        if (total > this.filteredData$.getValue().length) {
            return this.filteredData$.getValue().length;
        } else {
            return this.page * this.pageSize;
        }
    }

    chooseTransaction(data: any): void {
        this.transType$.next(null);
        setTimeout(() => {
            this.checkTransType(data);
        }, 100);
    }

    checkTransType(data): void {
        if (data.type == 'combo') {
            this.commonService.isUpdateCombo$.next(true);
            let comboType = data.combo.comboType;
            console.log(comboType, 'comboType');
            switch (data.combo.comboType.trim()) {
                case 'COMBO1': {
                    this.transType$.next('COMBO1');
                    break;
                }

                case 'COMBO2': {
                    this.transType$.next('COMBO2');
                    break;
                }

                case 'COMBO3': {
                    this.transType$.next('COMBO3');
                    break;
                }

                case 'COMBO1_EX': {
                    this.transType$.next('COMBO1_EX');
                    break;
                }

                case 'COMBO2_EX': {
                    this.transType$.next('COMBO2_EX');
                    break;
                }

                case 'COMBO3_EX': {
                    this.transType$.next('COMBO3_EX');
                    break;
                }
            }
        } else {
            let actionT24 = data.actionT24;
            switch (data.type) {
                case 'sms':
                    this.commonService.isUpdateSMS$.next(true);
                    // routerLinkData = actionT24 == 'CREATE' ? '/pages/sms' : '/pages/sms';
                    this.transType$.next('sms');
                    break;

                case 'account':
                    this.commonService.isUpdateAccount$.next(true);
                    // routerLinkData = actionT24 == 'CREATE' ? '/pages/account' : '/pages/account';
                    this.transType$.next('account');
                    break;

                case 'customer':
                    this.commonService.isUpdateCus$.next(true);
                    // routerLinkData = actionT24 == 'CREATE' ? '/pages/customer-manage' : '/pages/customer-manage';
                    this.transType$.next('customer');
                    break;

                case 'ebank':
                    // routerLinkData = actionT24 == 'CREATE' ? '/pages/e-bank' : '/pages/e-bank';
                    this.transType$.next('ebank');
                    break;

                case 'card':
                    // routerLinkData = actionT24 == 'CREATE' ? '/pages/card' : '/pages/card';
                    this.transType$.next('card');
                    break;
            }
        }
        this.selectedTrans$.next(data);
    }

    /**
     * push rawdata to array for display on table
     * @param transactions
     */
    pushDataToArray(transactions: any) {
        let result = [];
        /**
         * Filter data and push to array
         */
        if (transactions && transactions.listEBank != null) {
            transactions.listEBank.filter(r => r.type = 'ebank');
            transactions.listEBank.forEach(r => {
                if (r.status != DELETED) {
                    result.push(r);
                }
            });
        }
        if (transactions && transactions.listCombo != null) {
            transactions.listCombo.filter(r => r.type = 'combo');
            transactions.listCombo.forEach(r => {
                if (r.combo.status != DELETED) {
                    result.push(r);
                }
            });
        }
        if (transactions && transactions.listSms != null) {
            transactions.listSms.filter(r => r.type = 'sms');
            transactions.listSms.forEach(r => {
                if (r.status != DELETED) {
                    result.push(r);
                }
            });
        }

        if (transactions && transactions.listCard != null) {
            transactions.listCard.filter(r => r.type = 'card');
            transactions.listCard.forEach(r => {
                if (r.status != DELETED) {
                    result.push(r);
                }
            });
        }
        if (transactions && transactions.listAccount != null) {
            transactions.listAccount.filter(r => r.type = 'account');
            transactions.listAccount.forEach(r => {
                if (r.status != DELETED) {
                    result.push(r);
                }
            });
        }
        if (transactions && transactions.listCustomer != null) {
            transactions.listCustomer.filter(r => r.type = 'customer');
            transactions.listCustomer.forEach(r => {
                if (r.status != DELETED) {
                    result.push(r);
                }
            });
        }
        result.sort((prev, next) => {
            return moment(this.getTimeUpdate(next), 'DD-MM-YYYY HH:mm:ss').unix() - moment(this.getTimeUpdate(prev), 'DD-MM-YYYY HH:mm:ss').unix();
        });
        return result;
    }

    getTimeUpdate(trans: any): string {
        return trans.combo ? trans.combo.timeUpdate : trans.timeUpdate;
    }

    /**
     * filter transaction by params
     * @param inputter - user nhap
     * @param custId - ma khach hang
     * @param transId - ma giao dich
     * @param transType - loai giao dich
     */
    filterByParams(custId: string, transId: string): void {
        let data = this.rawData$.getValue();
        if (transId) {
            data = data.filter(ele => ele.combo ? ele.combo.id.includes(transId.toUpperCase()) : ele.id.includes(transId.toUpperCase()));
        }
        if (custId) {
            data = data.filter(ele => custId == this.getCustId(ele));
        }
        this.filteredData$.next(data);
    }

    getUsersInGroup(): void {
        const branch = this.localStorage.retrieve(CACHE_CO_CODE);
        const cache = this.localStorage.retrieve(USER_GROUP + branch);
        if (cache) {
            this.users$.next(cache);
            return;
        }
        this.service.getUsersByGroup(branch)
            .subscribe(res => {
                if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.ResponseCode == CODE_00) {
                    const rawData = res.seabRes.body.enquiry.user_group ? res.seabRes.body.enquiry.user_group : [];
                    this.users$.next(rawData);
                    if (rawData.length > 0) {
                        this.localStorage.store(USER_GROUP + branch, rawData);
                    }
                }
            });
    }

    /**
     * get customer id from transaction
     * @param trans
     */
    getCustId(trans: any): string {
        // return trans.combo ? (trans?.combo?.customerId || trans?.combo?.username?.slice(0, -2)) : trans?.customerId || trans?.username?.slice(0, -2);
        let result = '';
        if (trans.combo) {
            result = trans.combo.customerId ? trans.combo.customerId : (trans.combo.username ? trans.combo.username.slice(0, -2) : '');
        } else {
            result = trans.customerId ? trans.customerId : (trans.username ? trans.username.slice(0, -2) : '');
        }

        return result;
    }

    /**
     * get type of transaction
     * @param data
     */
    getTransType(data: any) {
        let transType = '';
        if (data.type == 'combo') {
            let comboType = data.combo.comboType;
            console.log(comboType, 'comboType');
            switch (data.combo.comboType.trim()) {
                case 'COMBO1': {
                    transType = 'COMBO1';
                    break;
                }

                case 'COMBO2': {
                    transType = 'COMBO2';
                    break;
                }

                case 'COMBO3': {
                    transType = 'COMBO3';
                    break;
                }

                case 'COMBO1_EX': {
                    transType = 'COMBO1';
                    break;
                }

                case 'COMBO2_EX': {
                    transType = 'COMBO2';
                    break;
                }

                case 'COMBO3_EX': {
                    transType = 'COMBO3';
                    break;
                }
            }
        } else {
            switch (data.type) {
                case 'sms':
                    this.commonService.isUpdateSMS$.next(true);
                    transType = 'QLSPDV';
                    break;

                case 'account':
                    this.commonService.isUpdateAccount$.next(true);
                    transType = 'QLSPDV';
                    break;

                case 'customer':
                    this.commonService.isUpdateCus$.next(true);
                    transType = 'customer';
                    break;

                case 'ebank':
                    transType = 'QLSPDV';
                    break;

                case 'card':
                    transType = 'QLSPDV';
                    break;
            }
        }
        return transType;
    }
}
