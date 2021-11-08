import {Component, Input, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'modal-notify',
	templateUrl: './modal-notify.component.html',
	styleUrls: ['../modal-common.css'],
	encapsulation: ViewEncapsulation.None
})
export class ModalNotifyComponent {
	@Input() content;

	constructor(public activeModal: NgbActiveModal) {
	}

}
