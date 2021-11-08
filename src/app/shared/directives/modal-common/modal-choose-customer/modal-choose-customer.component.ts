import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastrService} from "ngx-toastr";

@Component({
	selector: 'kt-modal-choose-customer',
	templateUrl: './modal-choose-customer.component.html',
	styleUrls: ['./modal-choose-customer.component.scss']
})
export class ModalChooseCustomerComponent implements OnInit {
	@Output() emitService = new EventEmitter<any>();

	@Input() listCustomerInfo: any = [];

	dataSelect: any;

	isCheckbox: boolean;

	constructor(
		private _activeModal: NgbActiveModal,
		private _toastr: ToastrService
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy() {
	}

	close(): void {
		this._activeModal.close(true);
	}

	onSubmit(): void {
		this.emitService.next(this.dataSelect);

		this._activeModal.close(this.dataSelect);
	}

	radioSelected = (event, row) => {
		console.log(row)
		this.dataSelect = row;
		this.isCheckbox = true
	}
}
