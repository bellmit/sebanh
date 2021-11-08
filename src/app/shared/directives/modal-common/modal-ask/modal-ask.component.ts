import {Component, Input, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject} from "rxjs";

@Component({
	selector: 'modal-notify',
	templateUrl: './modal-ask.component.html',
	styleUrls: ['../modal-common.css'],
	encapsulation: ViewEncapsulation.None
})
export class ModalAskComponent {
	@Input() title;
	@Input() content;
	@Input() isLoading$: BehaviorSubject<boolean>;

	constructor(public activeModal: NgbActiveModal) {
	}


}
