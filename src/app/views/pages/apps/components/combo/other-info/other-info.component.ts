import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonService} from "../../../../../common-service/common.service";

@Component({
	selector: 'kt-other-info',
	templateUrl: './other-info.component.html',
	styleUrls: ['./other-info.component.scss']
})
export class OtherInfoComponent implements OnInit {

	@Input() parentForm: FormGroup;
	otherInfoForm: FormGroup;
	isShowOtherInfo: boolean = false;
	isSelected: boolean = true;

	constructor(private fb: FormBuilder , public commonService: CommonService) {
		this.otherInfoForm = this.fb.group({
			numberDependent: [''],
			ccyType: [''],
			fax: [''],
			income: [''],
			taxNumber: [''],
			loyalty: [''],
			relate: [''],
			idRelate: ['']
		})
	}

	ngOnInit() {
		this.parentForm.addControl('otherInfoForm', this.otherInfoForm);
	}

	toggleOtherInfo() {
		this.isShowOtherInfo = !this.isShowOtherInfo;
	}

	get isClicked(): boolean {
		if (this.commonService.isClickedButton$) {
			return this.commonService.isClickedButton$.getValue();
		}
	}
}
