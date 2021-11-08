import { ModalNotification } from './../../../../../shared/directives/modal-common/modal-notification/modal-notification.component';
import { Validators, FormBuilder } from '@angular/forms';
import { CommonService } from '../../../../common-service/common.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import {T24Service} from '../t24.service';

@Component({
	selector: "kt-change-cocode",
	templateUrl: "./modal-change-pass.component.html",
	styleUrls: ["./modal-change-pass.component.scss"],
})
export class ModalChangePass implements OnInit {
	isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	userT24: any;
	userAD: any;
	passT24: any;

    accessForm = this._fb.group({
		userT24: ['', [Validators.required]],
		password: ['', [Validators.required]],
		new_pass: ['', [Validators.required]],
		re_pass: ['', [Validators.required]]
	});

	constructor(
		private t24Service: T24Service,
		private _activeModal: NgbActiveModal,
		private _fb: FormBuilder,
		private _toastr: ToastrService,
		private commonService: CommonService,
		public modal: NgbModal
	) {
	}


	ngOnInit() {
		console.log('mật khẩu cũ', this.passT24);
		if (this.userT24) {
			this.accessForm.patchValue({
				userT24: this.userT24
			});
		}
	}

	close(): void {
		this._activeModal.close(true);
	}

	onSubmit(): void {

			// this.deleteAccess();
			// return;

		if (this.accessForm.invalid) {
			this.accessForm.markAllAsTouched();
			return;
		}

		// mật khẩu mới không trùng nhau
		if(this.accessForm.controls.new_pass.value != this.accessForm.controls.re_pass.value) {
			this.accessForm.controls.re_pass.setErrors({notEqual: true})
			return
		}
		// mật khẩu mới không được trùng mật khẩu cũ
		if(this.accessForm.controls.new_pass.value == this.accessForm.controls.password.value) {
			this.accessForm.controls.new_pass.setErrors({errorEqual: true})
			return
		}
		// mật khẩu dưới 8 ký tự
		if(this.accessForm.controls.new_pass.value.length < 8) {
			this.accessForm.controls.new_pass.setErrors({eightCharacter: true})
			return
		}
		if(this.accessForm.controls.re_pass.value.length < 8) {
			this.accessForm.controls.re_pass.setErrors({eightCharacter: true})
			return
		}
		if(!this.accessForm.controls.re_pass.value.match('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')) {
			console.log('this.accessForm.controls.re_pass.value', this.accessForm.controls.re_pass.value);
			this.accessForm.controls.re_pass.setErrors({speCharacter: true})
			return
		}
		this.accessForm.controls.password.updateValueAndValidity();
		this.changeAccess()
	}
// xóa T24 để files đăng ký
	private deleteAccess() {
		this.t24Service.deleteAccess(this.userAD).subscribe();
	}
	private changeAccess() {
		this.isLoading$.next(true);
		if(this.accessForm.controls.password.value != this.passT24) {
			this.isLoading$.next(false);
			this.accessForm.controls.password.setErrors({passNotEqual: true})
			return
		}
		let body = {
			username: this.userT24.replace('.',''),
			password: this.accessForm.controls.new_pass.value
		}

		this.t24Service.changePassT24(body).subscribe(res => {
			if(res.body.status == 'OK' && res.body.transaction.responseCode == '00') {
				let params = {
					userAD: this.userAD,
					username: this.userT24,
					password: body.password,
				}
				this.t24Service.changeAccess(params).subscribe(res => {
					if(res.body.status == 'OK' && res.body.transaction.responseCode == '00') {
						const modalRef = this.modal.open(ModalNotification, {size: 'lg', windowClass: 'notificationDialog'})
										modalRef.componentInstance.textNotify = 'Đổi mật khẩu tài khoản T24 thành công';
										this.isLoading$.next(false);
										modalRef.result.then((result) => {
											if(result) {
												this.close();
											}
										});
									}
					else {
						const modalRef = this.modal.open(ModalNotification, {size: 'lg', windowClass: 'notificationDialog'})
										modalRef.componentInstance.textNotify = 'Đổi mật khẩu tài khoản T24 không thành công';
										this.isLoading$.next(false);
					}
				})
			} else {
				const modalRef = this.modal.open(ModalNotification, {size: 'lg', windowClass: 'notificationDialog'})
										modalRef.componentInstance.textNotify = 'Đổi mật khẩu tài khoản T24 không thành công';
										this.isLoading$.next(false);
			}
		})
	}

}
