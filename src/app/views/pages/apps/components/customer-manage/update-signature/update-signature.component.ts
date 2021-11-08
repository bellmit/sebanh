import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnDestroy,
	OnInit, SimpleChanges,
	ViewChild
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonService} from '../../../../../common-service/common.service';
import {SignatureService} from '../../identify-customer/service/signature.service';
import {FileUploadModel, VerifySignature} from '../customer.model';
import {DomSanitizer} from '@angular/platform-browser';
import {ModalCaptureSignatureComponent} from '../modal-capture-signature/modal-capture-signature.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {finalize, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';
import {CoreAiService} from '../../identify-customer/service/core-ai.service';
import {STATUS_OK} from '../../../../../../shared/util/constant';

@Component({
	selector: 'kt-update-signature',
	templateUrl: './update-signature.component.html',
	styleUrls: ['./update-signature.component.scss']
})

export class UpdateSignatureComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

	@ViewChild('fileElement', {static: false}) myFile: ElementRef;
	@Input('user_id') user_id: string = null;
	@Input('parentForm') parentForm: FormGroup;
	@Input('dataUpdate') dataUpdate: any;
	@Input('disabledField') disabledField: boolean = false;

	isShowSignature: boolean = false;
	signatureForm = this._fb.group({
		description: [null]
	});
	destroy$ = new Subject<void>();
	isLoading$ = new BehaviorSubject<boolean>(false);

	constructor(private _fb: FormBuilder,
				public _commonService: CommonService,
				public _signatureService: SignatureService,
				public _sanitizer: DomSanitizer,
				private _modalService: NgbModal,
				private _coreAiService: CoreAiService) {
	}

	ngOnInit() {
		this._commonService.isUpdateSignature$
			.pipe(takeUntil(this.destroy$))
			.subscribe(res => {
				this.isShowSignature = res;
			});
	}

	ngAfterViewInit() {
		this.parentForm.addControl('signatureForm', this.signatureForm);
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.dataUpdate) {
			if (changes.hasOwnProperty('dataUpdate')) {
				this.signatureForm.patchValue({
					description: this.dataUpdate ? this.dataUpdate.description : null
				});
			}
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
	}

	onchangeUpdate(event) {
		this.isShowSignature = event.target.checked;
		if (event.target.checked) {
			this._commonService.isUpdateSignature$.next(true);
			this._commonService.isUpdateProspectId$.next(false);
			this._commonService.isUpdateCus$.next(false);
		} else {
			this._commonService.isUpdateSignature$.next(false);
		}
	}

	onSelectFile(event) {
		if (event.target.files) {
			let listFile = this._signatureService.getSignatureFileUpload();
			const fileUpload = event.target.files[0];
			const fileUploadName = event.target.files[0].name;
			const reader = new FileReader();
			reader.readAsDataURL(fileUpload);
			reader.onload = (event: any) => {
				listFile.push({
					fileName: fileUploadName,
					fileData: event.target.result,
					fileType: fileUploadName.slice(fileUploadName.lastIndexOf('.') + 1),
					isSignature: false
				});
				this._signatureService.updateSignatureFileUpload(listFile);
			};
		}
	}

	checkSignature(event, file: FileUploadModel) {
		this._signatureService.getSignatureFileUpload().map(file => file.isSignature = false);
		file.isSignature = event.target.checked;
	}

	removeFile(file: FileUploadModel, index: number): void {
		if (file.id) {
			this._commonService.deleteFileById(file.id).subscribe();
		}
		this._signatureService.removeSignatureFileUploadByIndex(index);
	}

	resetFileName(): void {
		this.myFile.nativeElement.value = '';
	}

	openModalCaptureSignature() {
		const modalRef = this._modalService.open(ModalCaptureSignatureComponent, {
			backdrop: 'static',
			size: 'xl',
			centered: true
		});
	}

	verifySignature() {
		const listFile: FileUploadModel[] = this._signatureService.getSignatureFileUpload();
		if ((listFile.length < 1) || (listFile.findIndex(ele => ele.isSignature) < 0)) {
			this._commonService.error('Bạn chưa upload file chứa chữ ký');
			return;
		}
		const signatureFile = listFile.find(f => f.isSignature);
		const user_id = this.user_id || this._commonService.customerId$.getValue();
		if (!!signatureFile.fileData) {
			this.isLoading$.next(true);
			this._coreAiService.verifySignature(user_id, signatureFile.fileData, signatureFile.fileType)
				.pipe(finalize(() => this.isLoading$.next(false)))
				.subscribe(res => {
					if (res.body && res.body.status == STATUS_OK) {
						const output = res.body.utility.output;
						const verifySig: VerifySignature = {
							value: output.value,
							similarity: Math.round(output.real_score * 100),
							confidence: 0,
							signatures: this.buildLinkImageSig(output.signatures)
						};
						this._signatureService.verifySignature$.next(verifySig);
					}
				});
		}
	}

	buildLinkImageSig(inputs: string[]): string[] {
		const sigs: string[] = [];
		if (inputs) {
			inputs.forEach(s => {
				sigs.push(this.getLink(s) || 'assets/media/logos/nodata.png');
			});
		}
		return sigs;
	}

	getLink(link) {
		return this._coreAiService.returnLinkGetImage(link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?')));
	}
}
