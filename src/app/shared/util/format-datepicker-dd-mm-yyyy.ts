import {Injectable} from "@angular/core";
import * as moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class FormatDatepicker {
	 formatDateDDMMYYYY(dateString) {
		let momentDateObject = moment(dateString, 'DD-MM-YYYY');
		return momentDateObject.format('DD-MM-YYYY');
	}
}
