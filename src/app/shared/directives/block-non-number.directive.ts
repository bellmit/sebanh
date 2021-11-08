import {Directive, HostListener} from "@angular/core";
@Directive({
	selector: '[blockNonNumber]'
})
export class BlockNonNumberDirective {
	constructor() { }

	@HostListener('keypress') onkeypress(e){
		let event = e || window.event;
		if(event){
			return BlockNonNumberDirective.isNumberKey(event);
		}
	}

	static isNumberKey(event){
		let charCode = (event.which) ? event.which : event.keyCode;
		return !(charCode > 31 && (charCode < 48 || charCode > 57));

	}
}
