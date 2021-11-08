import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'percentPipe'
})
export class PercentPipe implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: any, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		}
		return `${value * 100}%`
	}

}
