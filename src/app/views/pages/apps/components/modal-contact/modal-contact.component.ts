import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AppConfigService} from '../../../../../app-config.service';

@Component({
	selector: 'kt-modal-contact',
	templateUrl: './modal-contact.component.html',
	styleUrls: ['./modal-contact.component.scss']
})
export class ModalContactComponent implements OnInit {

	hotline: string;
	email: string;

	constructor(
		public activeModal: NgbActiveModal,
		private appConfigService: AppConfigService
	) {
	}

	ngOnInit() {
		this.hotline = this.appConfigService.getConfigByKey('hotline');
		this.email = this.appConfigService.getConfigByKey('email-contact');
	}

}
