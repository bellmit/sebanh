import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from "../../../../common-service/common.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {NATIONALITIES} from "../../../../../shared/util/constant";

@Component({
	selector: 'kt-mock-combo',
	templateUrl: './mock-combo.component.html',
	styleUrls: ['./mock-combo.component.scss']
})
export class MockComboComponent implements OnInit, OnDestroy {

	customerForm: FormGroup;
	nationalities = NATIONALITIES

	constructor(public commonService: CommonService,
				private fb: FormBuilder) {
		this.customerForm = this.fb.group({
			customerId: [''],
			customerName: ['', Validators.required],
			sex: ['', Validators.required],
			birthday: ['', Validators.required],
			placeOfBirth: ['', Validators.required],
			maritalStatus: ['', Validators.required],
			purpose: ['', Validators.required],
			national: ['', Validators.required],
			// nationals: this.fb.array([]),
			residentStstus: ['', Validators.required],
			residentNational: [''],

			gttt: this.fb.array([]),
			idenType: ['', Validators.required],
			organization: [''],
			idenTime: [''],
			idenAdress: [''],
			idenTimeExpired: [''],
			idenTimeValue: [''],
			idenAddress: ['', Validators.required],

			phone: this.fb.array([]),
			mobile: ['', Validators.required],
			email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
			occupation: ['', Validators.required],
			piority: ['', Validators.required],
			stress: ['', Validators.required],
			district: ['', Validators.required],
			province: ['', Validators.required],
			country: [''],
			customerAddress: [''],
			securityQues: ['', Validators.required],
			answer: ['', Validators.required],
			loyalty: [''],

			campaignId: [''],
			saleType: [''],
			saleId: [''],
			brokerType: [''],
			brokerId: [''],

			inputter: [''],
			authoriser: [''],
			coCode: [''],
			departCode: [''],

			priority: [''],
			title: ['', Validators.required],
			portfolio: [''],
			ownerBen: ['', Validators.required],
			ownCustomer: [''],
			employment: ['', Validators.required],
			employerName: ['', Validators.required],
			employerAddress: ['', Validators.required],
			industryGroup: ['', Validators.required],
			industry: ['', Validators.required],
			industryClass: ['', Validators.required],

			noOfDependents: [''],
			customerCurrency: [''],
			salaryReq: [''],
			fax: [''],
			taxId: [''],
			relate: [''],
			relationCustomer: [''],
		})
	}

	isShow: boolean;

	ngOnInit() {
		this.commonService.isAsideRight$.next(true);
		this.commonService.isDisplayAsideRight$.next(true);
	}

	ngOnDestroy() {
		this.commonService.isAsideRight$.next(false);
		this.commonService.isDisplayAsideRight$.next(false);
	}

	abc() {
		this.isShow = true
	}

}
