import {AfterViewInit, Component, ElementRef, Input, OnInit} from '@angular/core';

@Component({
	selector: 'kt-old-value-t24',
	templateUrl: './old-value-t24.component.html',
	styleUrls: ['./old-value-t24.component.scss']
})
export class OldValueT24Component implements OnInit, AfterViewInit {

	@Input('valueDiff') valueDiff: string;
	// @Input('isSelect') isSelect: boolean = false;

	constructor(
		public element: ElementRef
	) {
		this.element.nativeElement;
	}

	ngOnInit() {
	}

	ngAfterViewInit() {
		// if (this.isSelect) {
		// 	const ele = this.element.nativeElement;
		// 	console.log('>>>>>>>>>>>> this.element.nativeElement;', ele);
		// 	console.log('>>>>>>>>>>>> this.element.nativeElement;', ele.parentNode);
		// 	// debugger;
		// }
	}

}
