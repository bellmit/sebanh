import {AbstractControl, FormGroup} from '@angular/forms';
import * as moment from 'moment';

/**
 * VALIDATORS AND FUNCTION VALIDATORS FOR DATE
 */
export class CustomDateValidator {
	static invalidDate(AC: AbstractControl) {
		if (AC && AC.value) {
			if (!moment(AC.value, 'YYYY-MM-DD', true).isValid()) {
				return {'invalidDate': true};
			}
			return null;
		}
	}

	static greaterThanToDayDate(AC: AbstractControl) {
		if (AC && AC.value) {
			if (!moment(AC.value, 'YYYY-MM-DD', true).isValid()) {
				return {'invalidDate': true};
			} else {
				const currentDate: Date = moment().toDate();
				currentDate.setHours(0, 0, 0, 0);

				const inputDate: Date = new Date(AC.value);
				inputDate.setHours(0, 0, 0, 0);

				if (inputDate.getTime() > currentDate.getTime()) {
					return {'greaterThanToDayDate': true};
				}
			}
		}
		return null;
	}

	static smallerThanToDayDate(AC: AbstractControl) {
		if (AC && AC.value) {
			if (!moment(AC.value, 'YYYY-MM-DD', true).isValid()) {
				return {'invalidDate': true};
			} else {
				const currentDate: Date = moment().toDate();
				currentDate.setHours(0, 0, 0, 0);

				const inputDate: Date = new Date(AC.value);
				inputDate.setHours(0, 0, 0, 0);

				if (inputDate.getTime() < currentDate.getTime()) {
					return {'smallerThanToDayDate': true};
				}
			}
		}
		return null;
	}

	static smallerThanToDayDate6Month(AC: AbstractControl) {
		// console.log(AC);
		if (AC && AC.value) {
			if (!moment(AC.value, 'YYYY-MM-DD', true).isValid()) {
				return {'invalidDate': true};
			} else {
				const currentDate: Date = moment().toDate();
				currentDate.setHours(0, 0, 0, 0);
				let checkDate = new Date(currentDate.setMonth(currentDate.getMonth() - 6));
				const inputDate: Date = new Date(AC.value);
				inputDate.setHours(0, 0, 0, 0);

				if (inputDate.getTime() < checkDate.getTime()) {
					return {'smallerThanToDayDate6Month': true};
				}
			}
		}
		return null;
	}
}

export function fromDateGreaterThanToDate(formGroup: FormGroup, fromDateControlName: string, toDateControlName: string) {
	return (formGroup) => {
		let from = formGroup.controls[fromDateControlName];
		let to = formGroup.controls[toDateControlName];

		if (to.errors && !to.errors.fromDateSmallerThanToDate) {
			// return if another validator has already found an error on the matchingControl
			return;
		}
		// set error on matchingControl if validation fails
		if (from.value && to.value && new Date(from.value).getTime() > new Date(to.value).getTime()) {
			from.setErrors({fromDateGreaterThanToDate: true});
		} else {
			from.setErrors(null);
		}
	};
}

/**
 * VALIDATORS AND FUNCTION VALIDATORS FOR INPUT
 */
export class CustomInputValidators {
	static maxLength200(AC: AbstractControl) {
		if (AC && AC.value) {
			let m = encodeURIComponent(AC.value).match(/%[89ABab]/g);
			if ((AC.value.length + (m ? m.length : 0)) > 200) {
				return {'maxlength': true};
			}
		}
		return null;
	}

	static maxLength500(AC: AbstractControl) {
		if (AC && AC.value) {
			let m = encodeURIComponent(AC.value).match(/%[89ABab]/g);
			if ((AC.value.length + (m ? m.length : 0)) > 500) {
				return {'maxlength': true};
			}
		}
		return null;
	}
}

export function smallerThanToDayDate6Month(formGroup: FormGroup, dateControlName: string,) {
	return (formGroup) => {
		let date = formGroup.controls[dateControlName];
		const currentDate: Date = moment().toDate();
		currentDate.setHours(0, 0, 0, 0);
		let checkDate = new Date(currentDate.setMonth(currentDate.getMonth() - 6));
		const inputDate: Date = new Date(date.value);
		inputDate.setHours(0, 0, 0, 0);

		if (inputDate.getTime() < checkDate.getTime()) {
			date.setErrors({'smallerThanToDayDate6Month': true});
		}
	};
}
