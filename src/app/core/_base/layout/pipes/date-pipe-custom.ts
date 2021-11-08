import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'datePipeCustom'
})
export class DatePipeCustom implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: string, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		}
		// Value example 20200310
		let day, month, year: string;
		day = value.slice(6, 8);
		month = value.slice(4, 6);
		year = value.slice(0, 4);
		return day + '/' + month + '/' + year;
	}

}
