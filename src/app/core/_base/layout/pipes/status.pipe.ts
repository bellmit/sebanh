import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'statusDashboard'
})
export class StatusPipe implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: any, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		}

		if (args[0] == "COMBO") {
			if (value == 'APPROVED') {
				return this.translate.instant('Duyệt - Đang xử lý');
			} else if (value == 'PENDING') {
				return this.translate.instant('Chờ duyệt');
			} else if (value == 'REJECTED') {
				return this.translate.instant('Chờ bổ sung');
			} else if (value == 'APPROVED_SUCCESS') {
				return this.translate.instant('Duyệt thành công');
			} else if (value == 'APPROVED_ERROR') {
				return this.translate.instant('Duyệt không thành công');
			} else if(value == 'SAVED') {
				return this.translate.instant('Đã lưu');
			}
			
			else {
				return this.translate.instant('Hủy');
			}

		} else {
			if (value == 'APPROVED') {
				return this.translate.instant('Duyệt thành công');
			} else if (value == 'PENDING') {
				return this.translate.instant('Chờ duyệt');
			} else if (value == 'REJECTED') {
				return this.translate.instant('Chờ bổ sung');
			} else if (value == 'APPROVED_SUCCESS') {
				return this.translate.instant('Duyệt thành công');
			} else if (value == 'APPROVED_ERROR') {
				return this.translate.instant('Duyệt không thành công');
			} else {
				return this.translate.instant('Hủy');
			}
		}
	}


}
