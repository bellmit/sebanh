import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'priorityPipe'
})
export class PriorityPipe implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: string, ...args: any[]): any {
		if (value === undefined || value === null) {
			return;
		}
		if (value.trim() == 'PRIMARY') {
			return this.translate.instant('Thường');
		} else {
			return this.translate.instant('Cao');
		}
	}

}
