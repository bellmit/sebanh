import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'comboType'
})
export class ComboTypePipe implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: any, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		}
		if (value == 'COMBO1' || value == 'COMBO1_EX') {
			return this.translate.instant('Mở combo 1');
		} else if (value == 'COMBO2' || value == 'COMBO2_EX') {
			return this.translate.instant('Mở combo 2');
		} else if (value == 'COMBO3' || value == 'COMBO3_EX') {
			return this.translate.instant('Mở combo 3');
		} else {
			return this.translate.instant('Mở gói Super');
		}
	}

}
