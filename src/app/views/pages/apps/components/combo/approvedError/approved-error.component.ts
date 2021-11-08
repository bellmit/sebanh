import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonService} from '../../../../../common-service/common.service';

@Component({
	selector: 'kt-approved-error',
	templateUrl: './approved-error.component.html',
	styleUrls: ['./approved-error.component.scss']
})
export class ApprovedErrorComponent implements OnInit, OnDestroy {

	isCombo1: boolean = false;

	constructor(public commonService: CommonService,) {
	}

	ngOnInit() {
		const dataUrl = window.location.href;
		if (dataUrl.includes('combo1')) {
			this.isCombo1 = true;
		}
	}

	ngOnDestroy(): void {

	}

	getViewStatus(src: string) {
		if (src && src == 'SUCCESS') {
			return 'Duyệt thành công';
		}
		if (src && src == 'ERROR') {
			return 'Duyệt lỗi';
		}
		return null;
	}

	getViewStatusCombo(src: string) {
		if (src && src == 'SUCCESS') {
			return 'Duyệt thành công';
		}
		if (src && src == 'ERROR') {
			return 'Duyệt lỗi';
		}
		if (src && ['WAITING_PROCESSING', 'WAITING'].includes(src)) {
			return 'Đang xử lý';
		}
		return null;
	}

	getViewResultCard(src: string) {
		if (src) {
			return src.replace(/#/g, '<br/>');
		}
		return null;
	}

}
