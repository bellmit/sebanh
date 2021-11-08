import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'productType'
})
export class ProductTypePipe implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: any, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		}
		if (value == 'account' || value == 'ebank' || value == 'card' || value == 'sms') {
			return this.translate.instant('Quản lý SPDV');
		} else if (value == 'customer') {
			return this.translate.instant('Quản lý thông tin KH');
		} else if (value == 'INSODU_TK') {
			return this.translate.instant('Xác nhận số dư');
		}
	}
}
