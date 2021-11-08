import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {getRandomTransId} from '../../../../../../shared/util/random-number-ultils';
import {PRIMARY} from '../../../../../../shared/util/constant';
import {LocalStorageService} from 'ngx-webstorage';
import {Router} from '@angular/router';

@Component({
	selector: 'kt-combo-info',
	templateUrl: './combo-info.component.html',
	styleUrls: ['./combo-info.component.scss']
})
export class ComboInfoComponent implements OnInit, OnDestroy, OnChanges {
	comboInfoForm: FormGroup;
	@Input() parentForm: FormGroup;
	@Input() dataFrmDash: any;

	constructor(private fb: FormBuilder,
				public commonService: CommonService,
				private localStorage: LocalStorageService,
				private router: Router) {

	}

	ngOnInit() {
		this.comboInfoForm = this.fb.group({
			transID: [''],
			priority: [''],
			customerChecked: [false]
		});

		let username = this.localStorage.retrieve('username');
		if (this.dataFrmDash && !this.commonService.isPredictUserExists$.getValue()) {
			this.comboInfoForm.patchValue({
				transID: this.dataFrmDash.combo.id
			});
		} else {
			this.comboInfoForm.controls.transID.setValue(getRandomTransId(username.toUpperCase(), this.chooseType(this.router.url)));
			// this.commonService.cusTransId$.next(getRandomTransId(username, 'customer'));
			console.log(this.comboInfoForm.controls.transID.value, 'infotransID.value');
			console.log(this.chooseType(this.router.url), 'type');
			console.log(username.toUpperCase, 'username');
		}
		this.frm.priority.setValue(PRIMARY);
		this.parentForm.addControl('comboInfoForm', this.comboInfoForm);
		this.commonService.tranIdGlobal$.next(this.comboInfoForm.controls.transID.value);
		// console.log(' this.commonService.tranIdGlobal$.getValue', this.commonService.tranIdGlobal$.getValue());
	}

	get frm() {
		if (this.comboInfoForm && this.comboInfoForm.controls) {
			return this.comboInfoForm.controls;
		}
	}

	ngOnDestroy(): void {
		this.commonService.activeTab$.next(0);
	}

	chooseType(routerUrl: string) {
		switch (routerUrl) {
			case '/pages/ex-combo1':
			case '/pages/combo1': {
				return 'combo1';
			}

			case '/pages/ex-combo2':
			case '/pages/combo2': {
				return 'combo2';
			}

			case '/pages/ex-combo3':
			case '/pages/combo3': {
				return 'combo3';
			}

			case '/pages/super': {
				return 'super';
			}
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataFrmDash && !changes.dataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('dataFrmDash')) {
				this.ngOnInit();
			}
		}
	}
}
