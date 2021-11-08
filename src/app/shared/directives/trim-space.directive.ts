import {Directive, HostListener, Input, Optional} from "@angular/core";
import {FormControlDirective, FormControlName} from "@angular/forms";

@Directive({
	selector: '[trimSpace]',
})
export class TrimSpaceDirective {
	@Input() type: string;

	// @ts-ignore
	constructor(@Optional() private formControlDir: FormControlDirective,
				@Optional() private formControlName: FormControlName) {
	}

	@HostListener('blur')
	@HostListener('keydown.enter')
	trimValue() {
		const control = this.formControlName.control;
		if (typeof control.value === 'string') {
			control.setValue(control.value.trim().split(' ').filter(item => item.length > 0).join(''));
		}
	}
}
