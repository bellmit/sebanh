import {Injectable} from '@angular/core';
import {SwUpdate} from '@angular/service-worker';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalAskComponent} from '../../../shared/directives/modal-common/modal-ask/modal-ask.component';

@Injectable({
	providedIn: 'root'
})
export class UpdateService {

	constructor(
		private update: SwUpdate,
		private modalService: NgbModal
	) {
		update.available.subscribe(res => {
			let modalRef = this.modalService.open(ModalAskComponent, {
				backdrop: 'static',
				keyboard: false,
				size: 'sm',
				centered: true
			});
			modalRef.componentInstance.content = 'Đã có phiên bản mới của ứng dụng. Bạn vui lòng thực hiện xoá cache để thấy bug đã không còn!!!';
			return;
		});
	}
}
