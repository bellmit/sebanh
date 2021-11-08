import {Injectable} from '@angular/core';
import {AppConfigService} from '../../../../../../app-config.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {LocalStorageService} from 'ngx-webstorage';
import {FileUploadModel, VerifySignature} from '../../customer-manage/customer.model';
import {NgxImageCompressService} from 'ngx-image-compress';
import {MINIO_LINK} from '../../../../../../shared/util/constant';
import {GtttUrlModel} from '../../../../../../shared/model/GtttUrl.model';

@Injectable({
	providedIn: 'root'
})
export class SignatureService {

	signatureFiles$ = new BehaviorSubject<FileUploadModel[]>([]);
	gtttUrlModel$ = new BehaviorSubject<GtttUrlModel>(null);
	reUploadSignature$ = new BehaviorSubject<boolean>(false); // đánh dấu việc upload lại file đăng ký chứa chữ ký của KH
	verifySignature$ = new BehaviorSubject<VerifySignature>(null);

	API_URL_SIGNATURE_CUSTOMER_DETAIL: string;

	constructor(private appConfigService: AppConfigService,
				private localStorageService: LocalStorageService,
				private http: HttpClient,
				private ngxImageCompressService: NgxImageCompressService) {
		this.API_URL_SIGNATURE_CUSTOMER_DETAIL = this.appConfigService.getConfigByKey('SERVER_API_URL_SIGNATURE_CUSTOMER_DETAIL');
	}

	getCustomerDetail(customerId: string): Observable<any> {
		let param = new HttpParams().set('user_id', customerId);
		return this.http.get(this.API_URL_SIGNATURE_CUSTOMER_DETAIL, {params: param})
			.pipe(map((res: any) => {
				return res.output;
			}));
	}

	updateSignatureFileUpload(listFileUpload: FileUploadModel[]) {
		this.signatureFiles$.next(listFileUpload);
	}

	getSignatureFileUpload() {
		return this.signatureFiles$.getValue();
	}

	addSignatureFileUpload(fileUploadModel: FileUploadModel) {
		const listFile = this.signatureFiles$.getValue();
		listFile.push(fileUploadModel);
		this.signatureFiles$.next(listFile);
	}

	removeSignatureFileUploadByIndex(index: number) {
		const listFile = this.signatureFiles$.getValue();
		listFile.splice(index, 1);
		this.signatureFiles$.next(listFile);
	}

	compressFile(image: any, compress?: boolean): Promise<any> {
		if (!compress) {
			return Promise.resolve(image);
		}
		const orientation = -1;
		return this.ngxImageCompressService.compressFile(image, orientation, 75, 85);
	}

	buildImgSrc(src: FileUploadModel) {
		if (src) {
			const minioLink: string = this.appConfigService.getConfigByKey(MINIO_LINK);
			return minioLink + '/' + src.bucketName + '/' + src.folder;
		}
		return null;
	}

	buildImgSrcForGttt(src: string) {
		if (src) {
			const minioLink: string = this.appConfigService.getConfigByKey(MINIO_LINK);
			return minioLink + '/' + src;
		}
		return null;
	}
}
