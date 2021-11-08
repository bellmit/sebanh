import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {AppConfigService} from '../../../app-config.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

	X_IBM_CLIENT_ID: string;
	X_IBM_CLIENT_SECRET: string;

	constructor(
		private toast: ToastrService,
		private router: Router,
		private appConfig: AppConfigService) {
	}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

		let X_IBM_CLIENT_ID = this.appConfig.getConfigByKey('X_IBM_CLIENT_ID');
		let X_IBM_CLIENT_SECRET = this.appConfig.getConfigByKey('X_IBM_CLIENT_SECRET');

		if (!X_IBM_CLIENT_ID && !X_IBM_CLIENT_SECRET) {
			return this.addAuthorization(request, next);
		}

		if (!request || !request.url) {
			return this.addAuthorization(request, next);
		}

		if (request.url) {
			request = request.clone({
				headers: request.headers
					.set('X-IBM-Client-Id', X_IBM_CLIENT_ID)
					.set('X-IBM-Client-Secret', X_IBM_CLIENT_SECRET)
			});
		}
		return this.addAuthorization(request, next);
	};

	private addAuthorization(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		const token = localStorage.getItem(environment.authTokenKey);
		if (token && request.url != this.appConfig.getConfigByKey('SERVER_API_URL_SIGNATURE_CUSTOMER_DETAIL')) {
			request = request.clone({
				setHeaders: {
					Authorization: 'Bearer ' + token
				}
			});
		}
		// else {
		// 	this.toast.error('Hết phiên đăng nhập');
		// 	this.router.navigateByUrl('/auth/login');
		// 	// throwError('Hết phiên đăng nhập');
		// }

		return next.handle(request);
	}

}
