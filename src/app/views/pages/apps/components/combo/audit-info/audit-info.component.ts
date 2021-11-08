import {AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {CommonService} from '../../../../../common-service/common.service';
import {CACHE_CO_CODE, APPROVE} from '../../../../../../shared/util/constant';
import {formatDateFromApi} from '../../../../../../shared/util/date-format-ultils';
import moment from 'moment';
import {BehaviorSubject} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';

@Component({
	selector: 'kt-audit-info',
	templateUrl: './audit-info.component.html',
	styleUrls: ['./audit-info.component.scss']
})
export class AuditInfoComponent implements OnInit, OnChanges, AfterViewInit {

	@Input() parentForm: FormGroup;
	@Input() inputter: boolean;
	@Input() authoriser: boolean;
	auditInfoForm: FormGroup;
	@Input() dataFrmDash: any;
	@Input() cusTomerObject: any;
	@Input() dataCacheRouter: any;
	timeNow = moment().format('DD/MM/YYYY HH:mm:ss');
	rejected$ = new BehaviorSubject(false);

	constructor(private fb: FormBuilder,
				private localStorage: LocalStorageService,
				public commonService: CommonService,
				private sessionStorage: SessionStorageService
	) {
	}

	ngOnInit() {
		this.initData();
	}

	initData() {
		this.auditInfoForm = this.fb.group({
			inputter: [null],
			authoriser: [null],
			timeUpdate: [null],
			timeAuth: [null],
			coCode: [null],
			roomCode: [null],
			reason: [null],
			// reason: ['', [Validators.required]],
		});
		let userProfile = this.sessionStorage.retrieve('userprofile');
		if (!this.dataFrmDash && this.dataCacheRouter) {
			this.dataFrmDash = this.dataCacheRouter;
		} else if (!this.dataCacheRouter && this.dataFrmDash) {
			this.dataCacheRouter = this.dataFrmDash;
		}

		if ((this.dataFrmDash && this.dataFrmDash.combo) || this.cusTomerObject) {
			if (this.cusTomerObject) {
				this.dataFrmDash = this.cusTomerObject;
			}

			this.auditInfoForm.patchValue({
				inputter: this.dataFrmDash.combo.inputter ? this.dataFrmDash.combo.inputter : null,
				authoriser: this.dataFrmDash.combo.authoriser ? this.dataFrmDash.combo.authoriser : userProfile.user_id,
				timeUpdate: this.dataFrmDash.combo.timeUpdate ? (this.dataFrmDash.combo.timeUpdate) : null,
				timeAuth: this.dataFrmDash.combo.timeAuth ? (this.dataFrmDash.combo.timeAuth) : this.timeNow,
				coCode: this.dataFrmDash.combo.coCode ? this.dataFrmDash.combo.coCode : null,
				roomCode: this.dataFrmDash.combo.departCode ? this.dataFrmDash.combo.departCode : null,
				reason: this.dataFrmDash.combo.reasonReject ? this.dataFrmDash.combo.reasonReject : null,
			});
		} else if (this.dataFrmDash && !this.dataFrmDash.combo) {
			// console.log('this.dataFrmDash', this.dataFrmDash);
			// cai nay danh cho ocr gttt khach hang moi
			if (this.commonService.isPredictUserExists$.getValue()) {
				this.dataFrmDash = null;
				this.dataCacheRouter = null;
				this.auditInfoForm.patchValue({
					inputter: userProfile.user_id,
					authoriser: '',
					coCode: this.localStorage.retrieve(CACHE_CO_CODE),
					roomCode: '1234',
					reason: null,
					timeUpdate: this.timeNow,
					timeAuth: this.timeNow
				});
			} else {
				this.auditInfoForm.patchValue({
					inputter: this.dataFrmDash.inputter ? this.dataFrmDash.inputter : null,
					authoriser: this.dataFrmDash.authoriser ? this.dataFrmDash.authoriser : userProfile.user_id,
					coCode: this.dataFrmDash.coCode ? this.dataFrmDash.coCode : null,
					roomCode: this.dataFrmDash.departCode ? this.dataFrmDash.departCode : null,
					reason: (this.dataFrmDash.reason ? this.dataFrmDash.reason : this.auditInfoForm.controls.reason.value) || this.dataFrmDash.reasonReject,
					timeUpdate: this.dataFrmDash.timeUpdate ? (this.dataFrmDash.timeUpdate) : null,
					timeAuth: this.dataFrmDash.timeAuth ? (this.dataFrmDash.timeAuth) : this.timeNow,
				});
			}
		} else {
			this.auditInfoForm.controls.inputter.setValue(userProfile.user_id);
			this.auditInfoForm.controls.timeUpdate.setValue(this.timeNow);
			this.auditInfoForm.controls.coCode.setValue(this.localStorage.retrieve(CACHE_CO_CODE));
			this.auditInfoForm.controls.authoriser.setValue(userProfile.user_id);
			this.auditInfoForm.controls.timeAuth.setValue(this.timeNow);
			this.auditInfoForm.controls.roomCode.setValue('1234');
		}

		if ((this.dataCacheRouter && this.dataCacheRouter.status == 'REJECTED'
			|| this.dataFrmDash && this.dataFrmDash.combo && this.dataFrmDash.combo.status == 'REJECTED' || this.dataFrmDash && this.dataFrmDash.status == 'REJECTED')) {
			this.rejected$.next(true);
		}

		// this.parentForm.addControl('auditInfoForm', this.auditInfoForm);
	}

	trimReason() {
		const reason = this.auditInfoForm.controls.reason.value;
		if (reason) {
			this.auditInfoForm.patchValue({
				reason: this.auditInfoForm.controls.reason.value.trim()
			});
		}
	}


	ngOnChanges(changes: SimpleChanges): void {
		if (changes.dataFrmDash && !changes.dataFrmDash.isFirstChange()) {
			if (changes.hasOwnProperty('dataFrmDash')) {
				this.initData();
			}
		}
	}

	ngAfterViewInit(): void {
		this.parentForm.addControl('auditInfoForm', this.auditInfoForm);
	}

	get APPROVED() {
		if (this.dataCacheRouter) {
			return this.dataCacheRouter.combo ? this.dataCacheRouter.combo.status.startsWith(APPROVE) : this.dataCacheRouter.status.startsWith(APPROVE);
		}
	}

	autoGrowTextarea() {
		let elmtextFieldnt = document.getElementById('textarea');
		let text = this.auditInfoForm.controls.reason.value;
		let lines = text.split(/\r|\r\n|\n/).length;

		if (lines <= 1) {
			elmtextFieldnt.style.height = 42 + 'px';
		} else if (lines > 1) {
			elmtextFieldnt.style.height =
				42 + (lines - 1) * 20 + 'px';
		}

	}
}
