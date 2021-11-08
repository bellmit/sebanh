import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: 'cardStatus'
})
export class CardStatusPipe implements PipeTransform {

	constructor(private translate: TranslateService) {
	}

	transform(value: any, ...args: any[]): any {

		if (value === undefined || value === null) {
			return;
		}

		if(args[0] == "L" && value == '14'){
			return this.translate.instant('Non-active');
		}
		// if (value == '14') {
		// 	return this.translate.instant('OK');
		// } else {
		// 	return this.translate.instant('LOCK');
		// }


		switch (value) {
			case '14':
				return this.translate.instant('Card OK');
			case '51':
				return this.translate.instant('Account OK');
			case '63':
				return this.translate.instant('PickUp S 43');
			case '64':
				return this.translate.instant('Call Issuer');
			case '74':
				return this.translate.instant('PickUp L41');
			case  '85':
				return this.translate.instant('Device OK');

			case '86':
				return this.translate.instant('Account Closed');

			case '97':
				return this.translate.instant('PickUp 04');
			case '98':
				return this.translate.instant('Card Do not honor');
			case '102':
				return this.translate.instant('Device Closed');
			case '109':
				return this.translate.instant('Card Closed');
			case '166':
				return this.translate.instant('Account Decline');
			case '170':
				return this.translate.instant('zCODE 08');
			case '171':
				return this.translate.instant('zCODE 36');
			case '173':
				return this.translate.instant('zCODE 37');
			case '174':
				return this.translate.instant('zCODE 38');
			case '175':
				return this.translate.instant('zCODE 58');
			case '176':
				return this.translate.instant('zCODE 62');
			case '177':
				return this.translate.instant('zCODE 65');
			case '178':
				return this.translate.instant('zCODE 66');
			case '179':
				return this.translate.instant('zCODE 67');
			case '181':
				return this.translate.instant('zCODE 76');
			case '182':
				return this.translate.instant('zDECLINE 57');
			case '183':
				return this.translate.instant('Card No Renewal');
			case '184':
				return this.translate.instant('Honour');
			case '185':
				return this.translate.instant('PIN Blocked');
		}
	}
}
