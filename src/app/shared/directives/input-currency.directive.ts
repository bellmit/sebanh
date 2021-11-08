import {
	Directive,
	ElementRef,
	EventEmitter,
	forwardRef,
	HostBinding,
	Input,
	OnDestroy,
	OnInit,
	Output
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import Cleave from 'cleave.js';

export const INPUTMASK_VALUE_ACCESSOR: any = {
	provide: NG_VALUE_ACCESSOR,
	useExisting: forwardRef(() => InputCurrencyDirective),
	multi: true
};

@Directive({
	selector: '[inputCurrency]',
	providers: [INPUTMASK_VALUE_ACCESSOR],
	host: {
		'(blur)': 'onBlur()',
	}
})
export class InputCurrencyDirective implements OnInit, ControlValueAccessor, OnDestroy {
	@HostBinding('disabled')
	@Input() disabled: boolean;
	@Input() value: string;
	@Input() options: any = {};

	@Output() onValueChanged = new EventEmitter<any>();

	private onModelChange: Function = () => {
	};
	private onModelTouched: Function = () => {
	};
	private _instance: Cleave;

	constructor(public elRef: ElementRef) {
	}

	ngOnInit() {
		this.init();
	}

	ngOnChanges() {
		this.init();
	}

	private init() {
		if (this._instance) {
			this._instance.destroy();
			this._instance = null;
		}

		this._instance = new Cleave(this.elRef.nativeElement, {
			...this.options,
			onValueChanged: (e) => {
				this.value = e.target.rawValue;
				this.onModelChange(this.value);
				this.onValueChanged.next(e);
			}
		});
		this._instance.setRawValue(this.value);
	}

	onBlur() {
		this.onModelTouched(true);
	}

	ngOnDestroy() {
		this._instance.destroy();
		this._instance = null;
	}

	// implement ControlValueAccessor
	writeValue(obj: any): void {
		this.value = obj;
		if (this._instance) {
			this._instance.setRawValue(this.value);
		}

	}

	registerOnChange(fn: any): void {
		this.onModelChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onModelTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}
}

// <input type="text"
// class="form-control border-right-0" placeholder=""
// formControlName="amount" inputCurrency [options]="{numeral: true, numeralIntegerScale: 'thousand', numeralDecimalScale: 0}"/>
