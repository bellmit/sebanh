import { CommonService } from './../../../../views/common-service/common.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
@Component({
	selector: "kt-modal-notification",
	templateUrl: "./modal-notification.component.html",
	styleUrls: ["./modal-notification.component.scss"],
})
export class ModalNotification implements OnInit {
	textNotify: string = '';

	constructor(
		private _activeModal: NgbActiveModal,
		private _toastr: ToastrService,
		public commonService: CommonService
	) {}

	ngOnInit() {
	}

	closeX(): void {
		this._activeModal.close(false);
	}

	close(): void {
		this._activeModal.close(true);
	}


}
