import {Pipe, PipeTransform} from '@angular/core';
import {PROSPECT_VALUE} from "../../../../shared/util/constant";

@Pipe({
	name: 'coreAITitlePipe'
})
export class CoreAiTitlePipe implements PipeTransform {

	constructor() {
	}

	transform(value: any, ...args: any[]): any {
		switch (args[0]) {
			case 'id':
				if ((value && value.result && value.result.matched_users && value.result.matched_users.length && value.result.matched_users[0].id &&
					value.result.matched_users[0].id.startsWith(PROSPECT_VALUE))) {
					return 'Prospect ID'
				} else if (value && value.id && value.id.startsWith(PROSPECT_VALUE)) {
					return 'Prospect ID'
				}

				return 'ID Khách hàng'
		}
	}

}
