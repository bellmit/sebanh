import {CommonService} from './../../../../../common-service/common.service';
import {AuthHttpService} from './../../../../../../shared/services/auth-http.service';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {SessionStorageService} from 'ngx-webstorage';
import {
	buildRequest,
	getResponseApi,
} from '../../../../../../shared/util/api-utils';
import {BodyRequestTransactionModel} from '../../../../../model/body-request-transaction.model';
import {AppConfigService} from '../../../../../../app-config.service';
import {HEADER_SEATELLER, SEVER_API_URL_SEATELLER} from '../../../../../../shared/util/constant';

@Injectable({
	providedIn: 'root',
})
export class CardServices {

	constructor(
		private _http: HttpClient,
		private _session: SessionStorageService,
		private authHttpService: AuthHttpService,
		public commonService: CommonService,
		private appConfigService: AppConfigService
	) {
	}

	approveCard(body: BodyRequestTransactionModel): Observable<any> {
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_SEATELLER);
		const header = this.appConfigService.getConfigByKey(HEADER_SEATELLER);

		const bodyReq = {
			header: header,
			body: body,
		};
		const req = buildRequest(bodyReq, true);
		return this.authHttpService.callPostApi(req, url).pipe(
			map((model: any) => {
				const response = getResponseApi(model);
				return response;
			})
		);
	}

}
