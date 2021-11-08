import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfigService} from '../../../../../../app-config.service';
import {
	CHECK_MATCH_CARD_GENERAL_DPW,
	CORE_AI_MINIO_LINK, GET_CUSTOMER_INFO_BY_ID,
	GET_USER_BY_FACE_AI_DPW,
	GET_USER_BY_FINGER_PRINT_DPW,
	GET_USER_BY_ID_CARD_DPW, HEADER_API_CORE_AI,
	PREDICT_IDENTITY,
	SECURITY_KEY_CORE_AI,
	SERVER_API_URL_CORE_AI, SERVER_API_URL_VERIFY_SIGNATURE
} from '../../../../../../shared/util/constant';
import * as CryptoJS from 'crypto-js';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {FileUploadModel} from '../../customer-manage/customer.model';
import {compareFunc, dataURIToBlob, LOG} from '../../../../../../shared/util/Utils';
import {SignatureModel} from '../../../../../../shared/model/GtttUrl.model';

@Injectable({
	providedIn: 'root'
})
export class CoreAiService {

	// public
	public faceScan$ = new BehaviorSubject(null); // Khuon mat KH dang phuc vu
	public cardFrontScan$ = new BehaviorSubject(null); // Mat truoc GTTT
	public cardBackScan$ = new BehaviorSubject(null); // Mat sau GTTT
	public fingerPrintScan$ = new BehaviorSubject(null); // mau van tay
	public fingerLeftScan$ = new BehaviorSubject(null); // mau van tay trái
	public fingerRightScan$ = new BehaviorSubject(null); // mau van tay phải
	public isScanIdentity$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public isScanFinger$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public IdsFromIdentification$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	public IdsFromFingerPrint$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	// public IdsFromFaceScan$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

	public isClickScanIdentify$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	public isClickScanFinger$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	navigateToCombo$ = new BehaviorSubject<boolean>(false);

	// private
	private coreAiLink: string = '';
	private faceLink: string = '';
	private customerInfoByUserIdLink: string = '';
	private cardLink: string = '';
	private fingerPrintLink: string = '';
	private checkMatchCardAndGeneralLink: string = '';
	private predictIdentityLink: string = '';
	private coreAiMinioLink: string = '';
	private secretKey: string = '';
	private verifySignatureLink: string = '';

	constructor(
		private http: HttpClient,
		private appConfigService: AppConfigService
	) {
		this.coreAiLink = this.appConfigService.getConfigByKey(SERVER_API_URL_CORE_AI);
		this.faceLink = this.appConfigService.getConfigByKey(GET_USER_BY_FACE_AI_DPW);
		this.coreAiMinioLink = this.appConfigService.getConfigByKey(CORE_AI_MINIO_LINK);
		this.customerInfoByUserIdLink = this.appConfigService.getConfigByKey(GET_CUSTOMER_INFO_BY_ID);
		this.secretKey = this.appConfigService.getConfigByKey(SECURITY_KEY_CORE_AI);
		this.cardLink = this.appConfigService.getConfigByKey(GET_USER_BY_ID_CARD_DPW);
		this.fingerPrintLink = this.appConfigService.getConfigByKey(GET_USER_BY_FINGER_PRINT_DPW);
		this.checkMatchCardAndGeneralLink = this.appConfigService.getConfigByKey(CHECK_MATCH_CARD_GENERAL_DPW);
		this.predictIdentityLink = this.appConfigService.getConfigByKey(PREDICT_IDENTITY);
		this.verifySignatureLink = this.appConfigService.getConfigByKey(SERVER_API_URL_VERIFY_SIGNATURE);
	}

	returnLinkGetImage(rawLink: string): string {
		const unsafe = this.encode(rawLink);
		if (!unsafe) {
			return null;
		}
		return `${this.coreAiLink}/thumbor/${unsafe}/filters:quality()/${this.coreAiMinioLink}${rawLink}`;
	}

	encode(rawLink: string) {
		// return 'unsafe';

		if (!rawLink) {
			return null;
		}
		const link = `filters:quality()/${this.coreAiMinioLink}${rawLink}`;
		const sha = CryptoJS.HmacSHA256(link, this.secretKey);
		const raw = CryptoJS.enc.Base64.stringify(sha);
		return raw.replace(/\+/g, '-').replace(/\//g, '_');//.replace(/=+$/g, '');
	}

	getCustInfoByFace(image: string, thresold: number): Observable<any> {

		const header = this.appConfigService.getConfigByKey(HEADER_API_CORE_AI);

		let body = {
			command: 'GET_COREAI',
			processMode: 'SINGLE',
			batchID: new Date().getTime(),
			sequences: '1',
			utility: {
				threshold: thresold,
				limit_face: 1,
				target_size: '640',
				image: null
			}
		};
		body.utility.image = image;
		let formData = new FormData();
		formData.append('header', JSON.stringify(header));
		formData.append('body', JSON.stringify(body));
		// formData.append('image', image);
		return this.callApiCoreAi(this.faceLink, formData);
		// return this.http.post(this.faceLink, formData, {observe: 'response'})
		// 	.pipe(map(res => res.body));
	}

	getCustInfoByGTTT(image: string): Observable<any> {

		const header = this.appConfigService.getConfigByKey(HEADER_API_CORE_AI);

		let body = {
			command: 'GET_COREAI',
			processMode: 'SINGLE',
			batchID: `${new Date().getTime()}`,
			sequences: '1',
			utility: {
				limit: 10,
				// source: 'thirdpartyname',
			},
			// input: null
		};
		const imageBlob = dataURIToBlob(image);
		let formData = new FormData();
		formData.append('header', JSON.stringify(header));
		formData.append('body', JSON.stringify(body));
		formData.append('input', imageBlob, `${new Date().getTime()}.png`);
		return this.callApiCoreAi(this.cardLink, formData);
		// return this.http.post(this.cardLink, formData, {observe: 'response'})
		// 	.pipe(map(res => res.body));
	}

	getCustomerInfoByUserId(userId: string): Observable<any> {
		const header = this.appConfigService.getConfigByKey(HEADER_API_CORE_AI);

		let body = {
			command: 'GET_COREAI',
			processMode: 'SINGLE',
			batchID: new Date().getTime(),
			sequences: '1',
			utility: {
				user_id: userId
			}
		};
		let formData = new FormData();
		formData.append('header', JSON.stringify(header));
		formData.append('body', JSON.stringify(body));
		return this.callApiCoreAi(this.customerInfoByUserIdLink, formData);
	}

	getCustInfoByFingerPrint(image: string): Observable<any> {
		let formData = new FormData();
		formData.append('image', image);
		return this.callApiCoreAi(this.fingerPrintLink, formData);
		// return this.http.post(this.fingerPrintLink, formData, {observe: 'response'})
		// 	.pipe(map(res => res.body));
	}

	checkMatchCardAndGeneral(imageCard: string, imageGeneral: string): Observable<any> {
		const header = this.appConfigService.getConfigByKey(HEADER_API_CORE_AI);
		const body = {
			command: 'GET_COREAI',
			processMode: 'SINGLE',
			batchID: `${new Date().getTime()}`,
			sequences: '1',
			utility: {
				threshold: 0.01
			}
		};
		const imageCardBlob = dataURIToBlob(imageCard);
		const imageGeneralBlob = dataURIToBlob(imageGeneral);
		let formData = new FormData();
		formData.append('header', JSON.stringify(header));
		formData.append('body', JSON.stringify(body));
		// formData.append('threshold', '0.1');
		formData.append('image_card', imageCardBlob, `imageCardBlob_${new Date().getTime()}.png`);
		formData.append('image_general', imageGeneralBlob, `imageGeneralBlob_${new Date().getTime()}.png`);
		return this.callApiCoreAi(this.checkMatchCardAndGeneralLink, formData);
		// return this.http.post(this.checkMatchCardAndGeneralLink, formData, {observe: 'response'})
		// 	.pipe(map(res => res.body));
	}

	predictIdentity(image: string): Observable<any> {
		let formData = new FormData();
		formData.append('input', image);
		return this.callApiCoreAi(this.predictIdentityLink, formData);
		// return this.http.post(this.predictIdentityLink, formData, {observe: 'response'})
		// 	.pipe(map(res => res.body));
	}

	/**
	 *
	 * @param user_id
	 * @param image
	 * @return observer
	 */
	verifySignature(user_id: string, base64: string, fileType: string): Observable<any> {
		const header = this.appConfigService.getConfigByKey(HEADER_API_CORE_AI);
		let body = {
			command: 'GET_COREAI',
			processMode: 'SINGLE',
			batchID: `${new Date().getTime()}`,
			sequences: '1',
			utility: {
				cus_id: user_id
			}
		};
		const valueBlob = dataURIToBlob(base64);
		let formData = new FormData();
		formData.append('header', JSON.stringify(header));
		formData.append('body', JSON.stringify(body));
		formData.append('input', valueBlob, `${new Date().getTime()}.${fileType}`);
		// formData.append('user_id', user_id);
		return this.callApiCoreAi(this.verifySignatureLink, formData);
	}

	callApiCoreAi(url: string, formData: FormData): Observable<any> {
		const header = JSON.stringify(formData.get('header'));
		const body = JSON.stringify(formData.get('body'));
		const input = JSON.stringify(formData.get('input'));
		LOG('data request core ai >>>>', `{header:${header}, body: ${body}, input: ${input}}`);
		return this.http.post(url, formData, {observe: 'response'})
			.pipe(map(res => {
				LOG('data response core ai >>>>>>', JSON.stringify(res));
				return res.body;
			}));
	}

	// get multiple link signature by co_holderr
	getSignatureLinks(signatures: any) {
		const signatureArray: any[] = signatures.filter(ele => ele.image_url.includes('SIGNATURE_FULL'));
		const sigs: SignatureModel[] = [];
		signatureArray.forEach(ele => {
			sigs.push({
				link: this.getRawLinkSignature(ele.image_url) || 'assets/media/logos/nodata.png',
				title: ele.title || '',
				co_holder: ele.co_holder
			});
		});
		return sigs.sort((a, b) => compareFunc(a, b, 'co_holder'));
	}

	getRawLinkSignature(link: string): string {
		if (!!link) {
			return this.returnLinkGetImage(link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?')));
		}
		return null;
	}
}
