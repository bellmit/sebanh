import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {User} from '..';
import {map, mergeMap} from 'rxjs/operators';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {Login} from '../index';
import {AppState} from '../../reducers';
import {Store} from '@ngrx/store';
import {
	APP_TIME_OUT,
	CODE_OK,
	GET_ENQUIRY,
	HEADER_API_ADMIN_MANAGER,
	HEADER_LOGIN,
	HEADER_PERMISSION,
	MAP_USER_MATRIX_CACHE,
	SEVER_API_URL_ADMIN_MANAGER,
	SEVER_API_URL_LOGIN,
	SEVER_API_URL_PERMISSION,
	STATUS_OK,
	USER_PROFILE
} from '../../../shared/util/constant';
import {MENU_FUNCTIONS} from '../../../shared/util/menu-function.constant';
import {AppConfigService} from '../../../app-config.service';
import {fromPromise} from 'rxjs/internal-compatibility';
import {buildRequest, getResponseApi} from '../../../shared/util/api-utils';
import {WebsocketClientService} from '../../../shared/services/websocket-client.service';

const API_USERS_URL = 'api/users';

@Injectable()
export class AuthService {

	isRememberMe$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private http: HttpClient,
				private $localStorage: LocalStorageService,
				private $sessionStorage: SessionStorageService,
				private store: Store<AppState>,
				private appConfigService: AppConfigService,
				private websoketClientService: WebsocketClientService
	) {

	}

	// Authentication/Authorization
	login(email: string, password: string): Observable<User> {
		return this.http.post<User>(API_USERS_URL, {email, password});
	}

	loginNew(username: string, password: string): Observable<User> {
		this.clearToken();
		const url = this.appConfigService.getConfigByKey(SEVER_API_URL_LOGIN);
		const header = this.appConfigService.getConfigByKey(HEADER_LOGIN);
		const body = {
			command: GET_ENQUIRY,
			enquiry: {
				authenType: 'getLogin',
				username: username,
				password: password
			}
		};
		let data = {
			header: header,
			body: body
		};

		return this.http
			.post<any>(url, data)
			.pipe(map(response => {
				localStorage.clear();
				this.$localStorage.store('username', data.body.enquiry.username);
				return this.authenticateSuccess(response);
			}));
	}

	loadPermissions(username: string): Observable<string[]> {
		return of(MENU_FUNCTIONS);
	}

	private loadPermissionsSuccess(res: any) {
		const permissions: string[] = [];
		// if (res == null || res.body == null || res.body.status !== 'OK') {
		// 	return permissions;
		// }
		// let functions: UserFunction[] = this.apiUtil.getEnquiryFromResponse(res).list;
		// if (functions && functions.length > 0) {
		// 	for (let i = 0; i < functions.length; i++) {
		// 		permissions.push(functions[i].function_code);
		// 	}
		// }
		return permissions;
	}

	private clearToken() {
		this.store.dispatch(new Login({authToken: ''}));
	}

	private authenticateSuccess(res: any) {
		this.store.dispatch(new Login({authToken: res.jwt}));
		// this.websoketClientService.connect();
		localStorage.setItem('secretKey', res.secretKey);
		return res;
	}

	/*
	 * Handle Http operation that failed.
	 * Let the app continue.
	*
	* @param operation - name of the operation that failed
	 * @param result - optional value to return as the observable result
	 */
	private handleError<T>(operation = 'operation', result?: any) {
		return (error: any): Observable<any> => {
			// TODO: send the error to remote logging infrastructure
			console.error(error); // log to console instead

			// Let the app keep running by returning an empty result.
			return of(result);
		};
	}

	// permission
	getUserPermission(username: string): Observable<any> {
		return fromPromise(this.consolRightUser(username))
			.pipe(mergeMap(res => {
				let header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);
				header.userID = username;
				let resourceUrl_UTILITY = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
				let bodyDataReq = {
					header: header,
					body: {
						command: 'GET_ENQUIRY',
						enquiry: {
							authenType: 'getUserRightApp',
							user_id: username,
							function_id: '',
							right_id: '',
							app_id: this.appConfigService.getConfigByKey('APP_ID')
						}
					}
				};
				const requestBody = buildRequest(bodyDataReq, true);
				return this.http.post(resourceUrl_UTILITY, requestBody, {observe: 'response'})
					.pipe(map(res => {
						const response = getResponseApi(res.body);
						if (response.seabRes.body.status == 'OK') {
							let userMatrix = response.seabRes.body.enquiry.usermatrix;
							this.$sessionStorage.store(MAP_USER_MATRIX_CACHE, userMatrix);
							return userMatrix.reduce((acc, current) => acc.concat(current.function_id), []);
						} else {
							return [];
						}
					}));
			}));
	}

	consolRightUser(username: string): Promise<any> {
		let header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);
		header.userID = username;
		let resourceUrl_UTILITY = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		let bodyDataReq = {
			seabReq: {
				header: header,
				body: {
					command: 'GET_TRANSACTION',
					transaction: {
						authenType: 'consolRightUser',
						user_id: username
					}
				}
			}
		};
		const requestBody = buildRequest(bodyDataReq);
		return this.http.post(resourceUrl_UTILITY, requestBody, {observe: 'response'})
			.toPromise();
	}

	// get config timeout
	getTimeout(): void {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		const seabReq = {
			seabReq: {
				header: header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'GetListTimeOut'
					}
				}
			}
		};

		this.http.post(apiUrl, buildRequest(seabReq), {observe: 'response'})
			.pipe(map(res => getResponseApi(res.body)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.responseCode == CODE_OK) {
					const rawData = res.seabRes.body.data ? res.seabRes.body.data : [];
					if (rawData.length) {
						const appTimeOut = Number(rawData[0].newValue);
						this.$sessionStorage.store(APP_TIME_OUT, appTimeOut);
					}
				}
			});
	}

	//get user information
	getUserInfo(username: string): void {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_PERMISSION);
		const header = this.appConfigService.getConfigByKey(HEADER_PERMISSION);
		const seabReq = {
			seabReq: {
				header: header,
				body: {
					command: 'GET_ENQUIRY',
					enquiry: {
						authenType: 'getUsers',
						user_id: username
					}
				}
			}
		};
		this.http.post(apiUrl, buildRequest(seabReq), {observe: 'response'})
			.pipe(map(res => getResponseApi(res.body)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.ResponseCode == CODE_OK) {
					const rawData = res.seabRes.body.enquiry.user ? res.seabRes.body.enquiry.user : [];
					if (rawData.length) {
						const userProfile = rawData[0];
						this.$sessionStorage.store(USER_PROFILE, userProfile);
					}
				}
			});
	}
}
