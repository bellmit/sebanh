import {Component, Input, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CommonService} from '../../../../views/common-service/common.service';
import {BodyRequestTransactionModel} from '../../../../views/model/body-request-transaction.model';
import {BehaviorSubject} from 'rxjs';
import {TransactionModel} from '../../../../views/model/transaction.model';
import {Router} from '@angular/router';

@Component({
	selector: 'modal-delete',
	templateUrl: './modal-delete.component.html',
	styleUrls: ['../modal-common.css'],
	encapsulation: ViewEncapsulation.None
})
export class ModalDeleteComponent {
	@Input() content;
	@Input() data: any;
	@Input() bodyDeleteRequest: BodyRequestTransactionModel;
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	command: string;
	transaction: TransactionModel;

	constructor(public activeModal: NgbActiveModal,
				public commonService: CommonService,
				private router: Router) {
	}

	action() {
		this.isLoading$.next(true);
		console.log(this.bodyDeleteRequest, 'body');
		this.commonService.actionGetTransactionResponseApi(this.bodyDeleteRequest).subscribe(r => {
			this.isLoading$.next(false);
			if (r.seabRes.body.status == 'OK' && r.seabRes.body.transaction.responseCode == '00') {
				this.activeModal.close('done');
				this.router.navigate(['/pages/dashboard']);
			} else {
				this.activeModal.close(r);
			}
		});
	}

	test() {
		this.isLoading$.next(true);
	}
}
