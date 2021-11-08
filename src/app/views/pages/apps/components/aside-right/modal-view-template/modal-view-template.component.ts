import {Component, OnInit} from '@angular/core';
import {SignatureService} from '../../identify-customer/service/signature.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploadModel} from '../../customer-manage/customer.model';

@Component({
	selector: 'kt-modal-view-template',
	templateUrl: './modal-view-template.component.html',
	styleUrls: ['./modal-view-template.component.scss']
})
export class ModalViewTemplateComponent implements OnInit {

	listFile$: FileUploadModel[] = [];
	imgSrc: string = null;

	constructor(
		private signatureService: SignatureService,
		public _sanitizer: DomSanitizer,
		private ngbModal: NgbActiveModal
	) {
	}

	ngOnInit() {
		this.signatureService.signatureFiles$.subscribe(res => {
			this.listFile$ = res;
			this.buildSrc(this.listFile$[0]);
		});
	}

	buildSrc(src: FileUploadModel) {
		this.imgSrc = this.signatureService.buildImgSrc(src);
	}

	close() {
		this.ngbModal.close();
	}

}
