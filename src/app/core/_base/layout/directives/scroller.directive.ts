import { Directive, Renderer2, ElementRef } from '@angular/core';

@Directive({
	selector: '[scroller]',
})
export class ScrollerDirective {
	constructor(elRef: ElementRef, renderer: Renderer2) {
		renderer.listen(elRef.nativeElement, 'wheel', (event) => {
			const el = elRef.nativeElement;
			const conditions = ((el.scrollTop + el.offsetHeight >= el.scrollHeight)) && event.deltaY > 0 || el.scrollTop === 0 && event.deltaY < 0;
			if (conditions === true) {
				event.preventDefault();
				event.returnValue = false;
			}
		});
	}
}
