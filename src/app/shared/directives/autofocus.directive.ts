import {AfterViewInit, Directive, ElementRef} from "@angular/core";

@Directive({
	selector: '[autofocus]'
})
export class AutofocusDirective implements AfterViewInit{

	constructor(private el: ElementRef) {
	}

	ngAfterViewInit(): void {
		this.el.nativeElement.focus();
	}
}
