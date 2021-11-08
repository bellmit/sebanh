import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'kt-popup-notification',
	templateUrl: './popup-notification.component.html',
	styleUrls: ['./popup-notification.component.scss']
})
export class PopupNotificationComponent implements OnInit {

	@Input('content') content: string;
	@Input('timeUpdate') timeUpdate: string;

	constructor(
		public activeModal: NgbActiveModal
	) {
	}

	ngOnInit() {
	}

}
