import {Directive, ElementRef, HostListener, Input, Optional} from '@angular/core';
import {FormControlName} from '@angular/forms';
import moment from 'moment';

@Directive({
	selector: '[ktDateEnter]'
})
export class DateEnterDirective {

	constructor(@Optional() private formControlName: FormControlName,
				@Optional() private el: ElementRef
	) {
	}

	@HostListener('blur', ['$event'])
	toDate() {
		const value = this.el.nativeElement.value;
		const control = this.formControlName.control;
		const date = moment(value, 'DD/MM/YYYY');
		if (date.isValid()) {
			control.setValue(date);
		} else {
			control.setValue(null);
		}
	}

}
