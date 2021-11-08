import {Directive, ElementRef, HostListener, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FormControlName} from '@angular/forms';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

@Directive({
	selector: '[ktHighLightChangeInput]'
})
export class HighLightChangeInputDirective implements OnDestroy, OnInit {

	@Input('ktHighLightChangeInput') clazz: string = '';

	private destroy$ = new Subject<void>();

	constructor(private renderer2: Renderer2,
				private elementRef: ElementRef,
				private formControlName: FormControlName) {
	}

	ngOnInit() {
		if (this.formControlName) {
			this.formControlName.control.valueChanges
				.pipe(
					// debounceTime(100),
					takeUntil(this.destroy$)
				)
				.subscribe(res => {
					this.setHighLight(res);
				});
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
	}

	@HostListener('blur', ['$event'])
	onBlur() {
		const value = this.elementRef.nativeElement.value;
		if (value) {
			this.renderer2.addClass(this.elementRef.nativeElement, this.clazz);
		}
	}

	setHighLight(res) {
		if (res && res.startsWith('<b>') && res.endsWith('</b>')) {
			this.renderer2.addClass(this.elementRef.nativeElement, this.clazz);
			this.formControlName.control.setValue(res.replace('<b>', '').replace('</b>', ''));
		}
	}

}
