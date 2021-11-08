import { ModalNotification } from './../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import {CommonService} from './../../../../common-service/common.service';
import {finalize} from 'rxjs/operators';
import {Component, OnInit} from '@angular/core';
import {T24Service} from '../t24.service';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {BehaviorSubject} from 'rxjs';

@Component({
	selector: 'kt-t24-register',
	templateUrl: './t24-register.component.html',
	styleUrls: ['./t24-register.component.scss']
})
export class T24RegisterComponent implements OnInit {

	userT24: string = null;
	modalClass: string = null;
	userAD: string = null;
	userName: string = null;

	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	accessForm = this._fb.group({
		userT24: [null, [Validators.required]],
		password: [null, [Validators.required]]
	});

	constructor(
		private _service: T24Service,
		private _activeModal: NgbActiveModal,
		private _fb: FormBuilder,
		private _toastr: ToastrService,
		private commonService: CommonService,
		public modal: NgbModal
	) {
	}

	ngOnInit() {
		if (this.userT24) {
			this.accessForm.patchValue({
				userT24: this.userT24
			});
		}
	}

	close(): void {
		this._activeModal.close('');
	}

	clearRequire() {
		this.accessForm.controls.password.clearValidators()
		this.accessForm.controls.password.updateValueAndValidity();
	}

	onSubmit(data: any): void {
		this.accessForm.markAllAsTouched();
		if (this.accessForm.invalid) {
			return;
		}
		this.isLoading$.next(true);
		if (this.userT24) {
			this._service.changeAccess({
				userAD: this.userAD,
				username: data.userT24,
				password: data.password
			}).pipe(finalize(() => this.isLoading$.next(false)))
				.subscribe(res => {
				if (res.body.status == 'OK' && res.body.transaction.responseCode == '00') {
					// this._toastr.success('Cập nhật tài khoản T24 thành công ', 'Thông báo');
				this.commonService.setNotifyInfo('Cập nhật thông tin T24 thành công', 'success', 5000)
				this._activeModal.close('update');
			} else {
				this.accessForm.controls.password.setErrors({passNotExact: true})
				return;
				// this.commonService.setNotifyInfo('Cập nhật thông tin T24 không thành công. Bạn vui lòng kiểm tra lại user trên T24.', 'warning', 3000)
				// this._toastr.error('Cập nhật thông tin T24 không thành công. Bạn vui lòng kiểm tra lại user trên T24.', 'Lỗi');
			}
		});
		} else {
			this._service.checkExitstAccess(data.userT24.toUpperCase()).pipe(finalize(()=> this.isLoading$.next(false))).subscribe(
				res => {
					if(res.body.status == 'OK' && res.body.enquiry.responseCode == '00') {
						const modalRef = this.modal.open(ModalNotification, {size: 'lg', windowClass: 'notificationDialog'})
						modalRef.componentInstance.textNotify = 'Tài khoản ' + data.userT24.toUpperCase() + ' đã được liên kết với một tài khoản khác';
					} else {
						this.isLoading$.next(true);
						this._service.regAccess({
							userAD: this.userAD,
							username: data.userT24.toUpperCase(),
							password: data.password
						}).pipe(finalize(() => this.isLoading$.next(false)))
						.subscribe(res => {
						if (res.body.status == 'OK' && res.body.transaction.responseCode == '00') {
							const modalRef = this.modal.open(ModalNotification, {size: 'lg', windowClass: 'notificationDialog'})
							modalRef.componentInstance.textNotify = 'Đăng ký tài khoản T24 thành công';
							this.isLoading$.next(false);
							modalRef.result.then((result) => {
								if(result) {
									this._activeModal.close('register');
								}
							});
							// this._toastr.success('Liên kết tài khoản T24 thành công', 'Thông báo');
							// this.commonService.setNotifyInfo('Đăng ký T24 thành công', 'success', 3000)
						} else {
							// this.commonService.setNotifyInfo('Thông tin User T24 chưa đúng. Bạn vui lòng kiểm tra lại user trên T24.', 'warning', 3000)
							this.accessForm.controls.password.setErrors({notExact: true})
							return;
							}
						});
					}
				}
			)

			
		}
	}
}
