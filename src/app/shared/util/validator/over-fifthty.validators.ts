import {ValidatorFn, AbstractControl} from '@angular/forms';
import * as moment from 'moment';

export function overFifteen(): ValidatorFn {
	return (control: AbstractControl): { [key: string]: any } => {
		const dob = control.value;
		const today = moment().startOf('day');
		const delta = today.diff(dob, 'years', false);

		if (delta <= 15) {
			return {
				underFifteen: {
					'requiredAge': '15+',
					'currentAge': delta
				}
			};
		}

		return null;
	};
}
