import {
	Component,
	OnDestroy,
	OnInit,
} from '@angular/core';
import {CoreAiService} from '../service/core-ai.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {finalize, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {
	CODE_00,
	CODE_OK,
	GET_ENQUIRY, GET_LIST_PRODUCT, HEADER_API_ADMIN_MANAGER, PROSPECT_KEY,
	SEVER_API_URL_ADMIN_MANAGER,
	STATUS_OK,
	TYPE_CORE_AI_FACE
} from '../../../../../../shared/util/constant';
import {CommonService} from '../../../../../common-service/common.service';
import {CoreAiModel, Info, MatchedUser} from '../../../../../model/core-ai-model';
import {ToastrService} from 'ngx-toastr';
import {LocalStorageService} from 'ngx-webstorage';
import {buildRequest, getResponseApi} from '../../../../../../shared/util/api-utils';
import moment from 'moment/moment';
import {AppConfigService} from '../../../../../../app-config.service';
import {HttpClient} from '@angular/common/http';
import {WebsocketClientService} from '../../../../../../shared/services/websocket-client.service';
import 'assets/js/global/identifyScan/gpyhs.js';
import {SignatureService} from '../service/signature.service';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';

@Component({
	selector: 'kt-identify-customer',
	templateUrl: './identify-customer.component.html',
	styleUrls: ['./identify-customer.component.scss']
})
export class IdentifyCustomerComponent implements OnInit, OnDestroy {

	isLoading$ = new BehaviorSubject<boolean>(false);

	listCustomer: MatchedUser[] = [];
	advertisements: any[] = [];

	// toggle webcam on/off
	showWebcam = true;
	allowCameraSwitch = true;
	multipleWebcamsAvailable = false;
	deviceId: string;
	facingMode: string = 'environment';
	errors: WebcamInitError[] = [];

	// latest snapshot
	webcamImage$ = new BehaviorSubject<WebcamImage>(null);

	// webcam snapshot trigger
	private trigger: Subject<void> = new Subject<void>();
	// switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
	private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
	msg: string = null;
	uploadedFilePath: string = null;


	constructor(
		private coreAiService: CoreAiService,
		private router: Router,
		private commonService: CommonService,
		private toastService: ToastrService,
		private localStorage: LocalStorageService,
		private appConfigService: AppConfigService,
		private http: HttpClient,
		private webSocketClient: WebsocketClientService,
		private signatureService: SignatureService
	) {
	}

	ngOnInit() {
		this.getSimilarity();
		this.getAdvertising();
		this.signatureService.gtttUrlModel$.next(null);
		this.signatureService.verifySignature$.next(null);
		WebcamUtil.getAvailableVideoInputs()
			.then((mediaDevices: MediaDeviceInfo[]) => {
				this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
			});
	}

	ngOnDestroy() {
		this.commonService.isDisplayNotice$.next(false);
		this.commonService.textNotify$.next(null);
	}

	/**
	 * Send request face recognize to Core
	 */
	captureFaceId(): void {
		const image = this.webcamImage$.getValue() ? this.webcamImage$.getValue().imageAsDataUrl : null;
		if (!image) {
			this.commonService.setNotifyInfo('Bạn chưa capture khuôn mặt', 'error', 15000);
			return;
		}
		this.coreAiService.faceScan$.next(image);
		this.coreAiService.cardFrontScan$.next(null);
		this.coreAiService.cardBackScan$.next(null);
		// this.coreAiService.fingerPrintScan$.next(null);

		this.coreAiService.fingerLeftScan$.next(null);
		this.coreAiService.fingerRightScan$.next(null);
		this.isLoading$.next(true);

		const percentOfSimilarFace = this.localStorage.retrieve('similarFace') ? (this.localStorage.retrieve('similarFace').newValue / 100) : 0.80;
		const imageBase64 = image.split(',')[1];

		this.coreAiService.getCustInfoByFace(imageBase64, percentOfSimilarFace)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe((response) => {
				console.warn('response from scan face', response);
				if (response.body.status == STATUS_OK) {
					if (response.body.utility) {
						const profiles = response.body.utility.output.profile;
						let user: CoreAiModel;
						if (profiles && profiles.length > 0) {
							user = response.body.utility.output.profile[0];
						} else { // khong phat hien khuon mat trong hinh
							this.router.navigate(['/pages/identify/not-found-customer']).then();
							return;
						}
						if (user && user.result && user.result.is_matched && user.result.is_matched.length) {
							this.listCustomer = user.result.matched_users;
							const isMatched = user.result.is_matched;
							if (this.listCustomer.length) {
								const infos: Info[] = response.body.utility.output.infos;
								this.listCustomer.forEach(ele => {
									const userId = this.getUser_id(ele);
									ele.info = infos.find(ele => ele.user_id == userId);
									ele.similarity = isMatched.find(ele => ele.user_id == userId).similarity;
								});
								console.warn('match_users >>>>>>>', this.listCustomer);
								this.router.navigate(['/pages/identify/info'], {
									state: {
										isNavigate: true,
										data: this.listCustomer,
										typeCoreAi: TYPE_CORE_AI_FACE
									}
								}).then();
							} else {
								this.router.navigate(['/pages/identify/not-found-customer']).then();
								return;
							}
						} else {// khong co user nao trung khop
							this.router.navigate(['/pages/identify/not-found-customer']).then();
							return;
						}
					}
				} else {
					this.commonService.error('Xảy ra lỗi trong quá trình nhận diện');
				}
			});
	}

	/**
	 * Get similarity Core AI then compare to @variable confidence in identify-customer-info.component
	 */
	getSimilarity(): void {
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		const seabReq = {
			seabReq: {
				header: header,
				body: {
					command: GET_ENQUIRY,
					enquiry: {
						authenType: 'GetListCoreAi',
						type: 'ALL'
					}
				}
			}
		};

		this.http.post(apiUrl, buildRequest(seabReq), {observe: 'response'})
			.pipe(map(res => getResponseApi(res.body)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.responseCode == CODE_OK) {
					let listData: any[] = res.seabRes.body.data;
					listData.sort((prev, next) => {
						return moment(next.timeUpdate, 'DD-MM-YYYY HH:mm:ss').unix() - moment(prev.timeUpdate, 'DD-MM-YYYY HH:mm:ss').unix();
					});
					let faceObject = listData.find(face => {
						return (face.type == 'FACE' && face.status == 'ON');
					});

					let signatureObject = listData.find(signature => {
						return (signature.type == 'SIGNATURE' && signature.status == 'ON');
					});

					let fingerPrintObject = listData.find(fingerPrint => {
						return (fingerPrint.type == 'FINGER_PRINT' && fingerPrint.status == 'ON');
					});

					let idObject = listData.find(gttt => {
						return (gttt.type == 'ID' && gttt.status == 'ON');
					});

					this.localStorage.store('similarFace', faceObject);
					this.localStorage.store('similarFingerPrint', fingerPrintObject);
					this.localStorage.store('similarSignature', signatureObject);
					this.localStorage.store('similarIdentity', idObject);
				}
			});
	}

	/**
	 * Get advertising to display tablet
	 */
	getAdvertising() {
		let today = moment(new Date()).format('DD/MM/YYYY');
		console.log(today, 'today');
		const apiUrl = this.appConfigService.getConfigByKey(SEVER_API_URL_ADMIN_MANAGER);
		const header = this.appConfigService.getConfigByKey(HEADER_API_ADMIN_MANAGER);
		const seabReq = {
			seabReq: {
				header: header,
				body: {
					command: GET_ENQUIRY,
					enquiry: {
						authenType: GET_LIST_PRODUCT,
						productName: '',
						dateTime: today,
						status: 'ALL'
					}
				}
			}
		};

		this.http.post(apiUrl, buildRequest(seabReq), {observe: 'response'})
			.pipe(map(res => getResponseApi(res.body)))
			.subscribe(res => {
				if (res && res.seabRes.body.status == STATUS_OK
					&& res.seabRes.body.responseCode == CODE_00) {
					this.advertisements = res.seabRes.body.data;
					this.advertisements = this.advertisements.filter(ads => {
						return ads.status == true;
					});
					this.webSocketClient.sendMessageToTablet(this.advertisements, 'advertisement');
					console.log('Advertisement list: ', JSON.stringify(res));
				}
			});
	}

	getUser_id(matchUser: MatchedUser) {
		// quet khuon mat
		if (matchUser) {
			if (matchUser.user_id == PROSPECT_KEY) {// neu la kh vang lai
				return matchUser.id;
			}
			return matchUser.user_id;
		}
		// quet gttt va van tay
		return null;
	}

	public triggerSnapshot(): void {
		this.trigger.next();
	}

	public toggleWebcam(): void {
		this.showWebcam = !this.showWebcam;
		this.webcamImage$.next(null);
	}

	public handleInitError(error: WebcamInitError): void {
		if (error.mediaStreamError && error.mediaStreamError.name === 'NotAllowedError') {
			console.warn('Camera access was not allowed by user!');
		}
		this.errors.push(error);
	}

	public showNextWebcam(directionOrDeviceId: boolean | string): void {
		// true => move forward through devices
		// false => move backwards through devices
		// string => move to device with given deviceId
		this.nextWebcam.next(directionOrDeviceId);
	}

	public handleImage(webcamImage: WebcamImage): void {
		console.log('received webcam image', webcamImage);
		this.webcamImage$.next(webcamImage);
	}

	public cameraWasSwitched(deviceId: string): void {
		console.log('active device: ' + deviceId);
		this.deviceId = deviceId;
	}

	public get triggerObservable(): Observable<void> {
		return this.trigger.asObservable();
	}

	public get nextWebcamObservable(): Observable<boolean | string> {
		return this.nextWebcam.asObservable();
	}

	public get videoOptions(): MediaTrackConstraints {
		const result: MediaTrackConstraints = {};
		if (this.facingMode && this.facingMode !== '') {
			result.facingMode = {ideal: this.facingMode};
		}

		return result;
	}

	fileProgress(event) {
		this.webcamImage$.next(null);
		if (!event.target.files[0] || event.target.files[0].length == 0) {
			this.msg = 'Bạn cần chọn một bức ảnh';
			return;
		}

		let mimeType = event.target.files[0].type;

		if (mimeType.match(/image\/*/) == null) {
			this.msg = 'Chỉ định dạng ảnh được hỗ trợ';
			return;
		}

		let reader = new FileReader();
		reader.readAsDataURL(event.target.files[0]);

		reader.onload = (_event) => {
			this.msg = '';
			const imageAsDataUrl = reader.result.toString();
			this.webcamImage$.next(new WebcamImage(imageAsDataUrl, 'image/jpeg', null));
		};
	}
}
