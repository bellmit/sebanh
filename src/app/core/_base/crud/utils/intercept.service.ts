// Angular
import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
// RxJS
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {AuthNoticeService, Logout} from '../../../auth';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalAskComponent} from '../../../../shared/directives/modal-common/modal-ask/modal-ask.component';
import {Store} from '@ngrx/store';
import {AppState} from '../../../reducers';
import {WebsocketClientService} from '../../../../shared/services/websocket-client.service';
import {CommonService} from '../../../../views/common-service/common.service';
import {AppConfigService} from '../../../../app-config.service';

/**
 * More information there => https://medium.com/@MetonymyQT/angular-http-interceptors-what-are-they-and-how-to-use-them-52e060321088
 */
@Injectable()
export class InterceptService implements HttpInterceptor {

	constructor(
		private toast: ToastrService,
		private router: Router,
		private authNoticeService: AuthNoticeService,
		private store: Store<AppState>,
		private modalService: NgbModal,
		private websocketClient: WebsocketClientService,
		public commonService: CommonService) {
	}

	// intercept request and add token
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(request).pipe(
			tap(
				event => {
					if (event instanceof HttpResponse) {
						if (event.status !== 200) {
							return;
						}

						let body = event.body;
						if (body.data) {
							let base64Decode: any = JSON.parse(window.atob((body.data)));
							if (base64Decode.seabRes && base64Decode.seabRes.body.enquiry && base64Decode.seabRes.body.enquiry.responseCode != '00') {
								this.commonService.displayError(event.url, base64Decode.seabRes.body.enquiry.responseCode);
							} else if (base64Decode.seabRes && base64Decode.seabRes.body.transaction && base64Decode.seabRes.body.transaction && base64Decode.seabRes.body.transaction.responseCode != '00') {
								this.commonService.displayError(event.url, base64Decode.seabRes.body.transaction.responseCode);
							} else if (base64Decode.seabRes && base64Decode.seabRes.error && base64Decode.seabRes.error.desc != '00') {
								this.commonService.displayError(event.url, base64Decode.seabRes.error.desc);
							} else if (base64Decode.error && base64Decode.error.code != '00' && !this.commonService.checkCusExists$.getValue()) {
								this.commonService.displayError(event.url, base64Decode.error.desc);
								// } else if (base64Decode.body.error && base64Decode.body.error.code != "00") {
								// 	this.commonService.displayError(event.url, base64Decode.body.error.code)
							} else if (base64Decode.body && base64Decode.body.enquiry && base64Decode.body.enquiry.responseCode != '00') {
								this.commonService.displayError(event.url, base64Decode.body.enquiry.responseCode);
							} else if (base64Decode.seabRes && base64Decode.seabRes.body && base64Decode.seabRes.body.responseCode != '00') {
								this.commonService.displayError(event.url, base64Decode.seabRes.body.responseCode);
							}
						}

						if (body && body.error) {
							console.error(body);
							console.log(body, 'body response');
							//this.toast.error( body.error.desc);
						}
					}
				}, error => {
					console.log(error);
					// Invalid Token error
					if (error && (error.error.httpMessage == 'Unauthorized' || error.status == 401)) {
						let modalRef = this.modalService.open(ModalAskComponent, {
							backdrop: 'static',
							keyboard: false,
							size: 'sm',
							centered: true
						});
						modalRef.componentInstance.content = 'Bạn đã nhập sai username hoặc password. Vui lòng nhập lại';
						this.router.navigateByUrl('/auth/login').then();
						return;
					}
					if (error && (error.error.moreInformation == 'JWS HMAC Validation Failed')) {
						this.websocketClient.disconnect();
						this.store.dispatch(new Logout());
						let modalRef = this.modalService.open(ModalAskComponent, {
							backdrop: 'static',
							keyboard: false,
							size: 'sm',
							centered: true
						});
						modalRef.componentInstance.content = 'Tài khoản SeATeller của bạn đã được đăng nhập trên một máy tính khác';
						modalRef.result.then(r => {
							if (r == 'ok') {
								this.modalService.dismissAll();
							}
						});
						return;
					}
					// this.toast.error('Hệ thống đang có lỗi.\n Xin vui lòng thử lại sau', 'Error: ' + error.status);
				}
			)
		);
	}
}
