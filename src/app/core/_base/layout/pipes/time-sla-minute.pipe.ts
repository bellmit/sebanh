import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'timeSlaMinute'
})
export class TimeSlaMinutePipe implements PipeTransform {

	constructor() {
	}

	transform(value: any, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		} else {
			return (Number(value) / 60000).toFixed(2)
		}

	}

}
