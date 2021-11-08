import {Directive, ElementRef, HostListener, Input} from '@angular/core';

@Directive({
	selector: '[blockSpecialKey]'
})
export class BlockSpecialKeyDirective {
	private regex: RegExp = new RegExp(/^-?[0-9a-zA-Z]+(\.[0-9a-zA-Z]*){0,1}$/g);
	private specialKeys: Array<string> = ['Backspace', 'Tab', 'Enter'];
	@Input() isAlphaNumeric: boolean;

	constructor(private el: ElementRef) {
	}

	@HostListener('keypress', ['$event'])
	onKeyPress(event: KeyboardEvent) {
		return this.regex.test(event.key);
	}

	@HostListener('paste', ['$event'])
	blockPaste(event: KeyboardEvent) {
		this.validateFields(event);
	}

	validateFields(event) {
		setTimeout(() => {
			this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^A-Za-z ]/g, '').replace(/\s/g, '');
			event.preventDefault();
		}, 100);
	}
}
