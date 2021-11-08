import {LocalStorageService} from 'ngx-webstorage';
import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreAiService} from '../identify-customer/service/core-ai.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {CommonService} from '../../../../common-service/common.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import 'assets/js/global/identifyScan/gpyhs.js';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalIdentifyComponent} from './modal-identify/modal-identify.component';
import {DomSanitizer} from '@angular/platform-browser';
import {ModalCaptureSignatureComponent} from '../customer-manage/modal-capture-signature/modal-capture-signature.component';
import {BodyRequestTransactionModel} from '../../../../model/body-request-transaction.model';
import {
	DELETE_MULTIPLE_FILE,
	GET_ENQUIRY,
	GET_LIST_FILES,
	GET_TRANSACTION,
	STATUS_OK,
	UPLOAD_MULTIPLE_FILE
} from '../../../../../shared/util/constant';
import {TransactionModel} from '../../../../model/transaction.model';
import {EnquiryModel} from '../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../model/body-request-enquiry-model';
import {ModalAskComponent} from '../../../../../shared/directives/modal-common/modal-ask/modal-ask.component';
import {FileUploadModel, VerifySignature} from '../customer-manage/customer.model';
import {SignatureService} from '../identify-customer/service/signature.service';
import {ModalCaptureFaceComponent} from './modal-capture-face/modal-capture-face.component';

declare var Fingerprint: any;
// Gọi function trong assets/js/global/identifyScan/gpyhs.js
declare var Cam_ControlInit: any;


@Component({
	selector: 'kt-aside-right',
	templateUrl: './aside-right.component.html',
	styleUrls: ['./aside-right.component.scss']
})
export class AsideRightComponent implements OnInit, OnDestroy {

	@ViewChild('fileUpload', {static: false}) myFile: ElementRef;

	isLoading$ = new BehaviorSubject<boolean>(false);
	isLoadingVerifySig$ = new BehaviorSubject<boolean>(false);
	isLoadingFinger$ = new BehaviorSubject<boolean>(false);
	imgFingerPrintPreviewLeft$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	isUploading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	msg: string = null;
	isFingerPrintScan: boolean = false;
	deviceId$: BehaviorSubject<any> = new BehaviorSubject<any>([]);
	isAddFile: boolean = false;
	files: any;
	filesCheckbox: any[] = [];
	imgSrc: string;
	imgData: string;
	angle: number = 0;

	reader: any;

	fingerForm: FormGroup;
	isDisplayFinger: boolean = false;
	arrayOfImage: any[] = [];
	authoriser$ = new BehaviorSubject<boolean>(false);
	checkPassport$: boolean = false;
	destroy$ = new Subject<void>();

	constructor(public coreAiService: CoreAiService,
				public commonService: CommonService,
				public _sanitizer: DomSanitizer,
				public signatureService: SignatureService,
				private toastService: ToastrService,
				private router: Router,
				private fb: FormBuilder,
				private modalService: NgbModal,
				private localStorage: LocalStorageService
	) {
	}

	ngOnInit() {
		this.checkRigth(this.router.url);
		this.reader = new Fingerprint.WebApi;
		this.fingerForm = this.fb.group({
			fingerLeft: ['', Validators.required],
			fingerRight: ['', Validators.required]
		});
		this.getDeviceFingerPrintId();
	}

	checkRigth(url: string) {
		const rights = this.commonService.getRightIdsByUrl(url);
		if (rights.includes('A')) {
			this.authoriser$.next(true);
		} else {
			this.authoriser$.next(false);
		}
	}

	ngOnDestroy(): void {
		this.onStopCapture();
		this.commonService.filesUploadCombo$.next(null);
		// this.signatureService.gtttUrlModel$.next(null);
		if (!this.coreAiService.navigateToCombo$.getValue()) {
			this.coreAiService.faceScan$.next(null);
			this.coreAiService.cardFrontScan$.next(null);
			this.coreAiService.cardBackScan$.next(null);
			this.coreAiService.fingerLeftScan$.next(null);
			this.coreAiService.fingerRightScan$.next(null);
			this.signatureService.verifySignature$.next(null);
		}
		this.signatureService.updateSignatureFileUpload([]);
		this.destroy$.next();
		this.destroy$.complete();
	}

	/**
	 * Get finger-print device id
	 */
	getDeviceFingerPrintId() {
		this.reader.enumerateDevices().then(res => {
			this.deviceId$.next(res[0]);
		});
	}

	/**
	 * Send request identify to Core AI
	 */
	captureIdentification(): void {

		const imageFrontCard = this.coreAiService.cardFrontScan$.getValue();
		const imageBackCard = this.coreAiService.cardBackScan$.getValue();
		// this.coreAiService.fingerPrintScan$.next(null);

		this.isLoading$.next(true);
		this.coreAiService.getCustInfoByGTTT(imageFrontCard)
			.pipe(finalize(() => {
				this.isLoading$.next(false);
			}))
			.subscribe(res => {
				if (res.body.status == STATUS_OK) {
					this.coreAiService.isClickScanIdentify$.next(true);
					this.coreAiService.isScanIdentity$.next(true);
					let profile: any[] = res.body.utility.output.profile;
					const infos: any[] = res.body.utility.output.infos;
					profile = profile.filter(p => p.user_id != 'UNK');
					profile.forEach(pro => {
						const info = infos.find(i => i.user_id == pro.user_id);
						if (info) {
							Object.assign(pro, {info: info});
						}
					});
					this.coreAiService.IdsFromIdentification$.next(profile);
					if (profile.length < 1) {
						this.commonService.error('Không tìm thấy khách hàng phù hợp với GTTT');
					}

					console.log(this.coreAiService.IdsFromIdentification$.getValue(), 'this.coreAiService.IdsFromIdentification$');
				}
			});
	}

	/**
	 * Send request finger-print to Core AI
	 */
	captureFingerPrint(): void {
		console.log('Sử dụng Vân tay trái');
		const image = this.coreAiService.fingerLeftScan$.getValue();
		this.isLoadingFinger$.next(true);
		console.log(image, 'imageTest');
		// return;
		this.coreAiService.getCustInfoByFingerPrint(image)
			.pipe(finalize(() => {
				this.isFingerPrintScan = true;
				this.isLoadingFinger$.next(false);
			})).subscribe(res => {
			console.log(res, ' ress');
			if (res && res.error) {
				this.toastService.error(res.error);
				return;
			} else if (res && res.output.profile.fingers) {
				this.coreAiService.isClickScanFinger$.next(true);
				this.coreAiService.fingerPrintScan$.next(image);
				this.coreAiService.isScanFinger$.next(true);
				let profile: any[] = res.output.profile;
				let infos: any[] = res.output.infos[0];

				Object.assign(profile, {info: infos, user_id: res.output.infos[0].user_id});

				let similarCoreAIFinger = this.localStorage.retrieve('similarFingerprint')
					? (this.localStorage.retrieve('similarFingerprint').newValue / 100) : 0.80;
				if (res && res.output.profile.fingers.is_matched.value == 'True' && res.output.profile.fingers.is_matched.confidence >= similarCoreAIFinger) {
					let data = [];
					data[0] = profile;

					this.coreAiService.IdsFromFingerPrint$.next(data);
					// this.coreAiService.IdsFromFingerPrint$.next(res.output);

					console.log(this.coreAiService.IdsFromFingerPrint$.getValue(), 'this.coreAiService.IdsFromFingerPrint$');
				} else {
					// Khi ngón tay trái không nhận diện được => dùng ngón phải
					this.captureRightFingerPrint();
				}
			} else {
				// Khi ngón tay trái không nhận diện được => dùng ngón phải
				this.captureRightFingerPrint();
			}

			// this.coreAiService.IdsFromFingerPrint$.next(CORE_AI_FINGER_PRINT);
		});
	}

	captureRightFingerPrint(): void {
		console.log('Sử dụng Vân tay phải');
		const imageRight = this.coreAiService.fingerRightScan$.getValue();
		this.isLoadingFinger$.next(true);
		console.log(imageRight, 'imageTest');
		// return;
		this.coreAiService.getCustInfoByFingerPrint(imageRight)
			.pipe(finalize(() => {
				this.isFingerPrintScan = true;
				this.isLoadingFinger$.next(false);
			})).subscribe(res => {
			console.log(res, ' ress');
			if (res && res.error) {
				this.toastService.error(res.error);
				return;
			} else if (res && res.output.profile.fingers) {
				this.coreAiService.isClickScanFinger$.next(true);
				this.coreAiService.fingerPrintScan$.next(imageRight);
				this.coreAiService.isScanFinger$.next(true);

				let profile: any[] = res.output.profile;
				let infos: any[] = res.output.infos[0];

				Object.assign(profile, {info: infos});

				let similarCoreAIFinger = this.localStorage.retrieve('similarFingerprint')
					? (this.localStorage.retrieve('similarFingerprint').newValue / 100) : 0.80;
				if (res && res.output.profile.fingers.is_matched.value == 'True' && res.output.profile.fingers.is_matched.confidence >= similarCoreAIFinger) {
					let data = [];
					data[0] = profile;

					this.coreAiService.IdsFromFingerPrint$.next(data);
					// this.coreAiService.IdsFromFingerPrint$.next(res.output);

					console.log(this.coreAiService.IdsFromFingerPrint$.getValue(), 'this.coreAiService.IdsFromFingerPrint$');
					// this.coreAiService.IdsFromFingerPrint$.next(profile);
					// console.log(this.coreAiService.IdsFromFingerPrint$.getValue(),'this.coreAiService.IdsFromFingerPrint$');
				} else {
					this.commonService.error('Không nhận diện được khách hàng có vân tay trùng khớp');
				}
			} else {
				this.commonService.error('Không nhận diện được khách hàng có vân tay trùng khớp');
			}
			// this.coreAiService.IdsFromFingerPrint$.next(CORE_AI_FINGER_PRINT);
		});
	}

	/**
	 * Get left finger-print data
	 */
	getLeftFingerPrint() {
		// if (!this.fingerForm.controls.fingerLeft.hasError('required')) {
		// 	this.commonService.setNotifyInfo("Đang đợi KH lấy vân tay trái", "success", 30000)
		// } else {
		// 	this.commonService.setNotifyInfo("KH chưa chọn vân tay trái", "error", 30000)
		// }
		this.startCaptureFingerPrint();
		this.readDataLeftFingerPrint();

	}

	/**
	 * Get right finger-print data
	 */
	getRightFingerPrint() {
		// if (!this.fingerForm.controls.fingerRight.hasError('required')) {
		// 	this.commonService.setNotifyInfo("Đang đợi KH lấy vân tay phải", "success", 30000)
		// } else {
		// 	this.commonService.setNotifyInfo("KH chưa chọn vân tay phải", "error", 30000)
		// }
		this.startCaptureFingerPrint();
		this.readDataRightFingerPrint();
	}

	/**
	 * On start capture finger-print with device id
	 */
	startCaptureFingerPrint() {
		this.reader.startAcquisition(5, this.deviceId$.getValue()).then((res) => {
			console.log('///////// starting capture', res);
		});
	}

	/**
	 * Read data from device then assign to @variable imgFingerPrintPreviewLeft$
	 */

	readDataLeftFingerPrint() {
		this.reader.onSamplesAcquired = (res) => {
			let samples = JSON.parse(res.samples);
			try {
				this.coreAiService.fingerLeftScan$.next(
					`data:image/png;base64,${Fingerprint.b64UrlTo64(samples[0])}`
				);

				console.clear();
				console.log(this.coreAiService.fingerLeftScan$.getValue());
			} catch (e) {
				console.log(e);
			}
		};
	}


	/**
	 * Stop capture finger-print with device id
	 */
	onStopCapture(): void {
		this.reader.stopAcquisition(this.deviceId$.getValue())
			.then((res) => {
				this.handleStopCapture(res);
			});
	}

	handleStopCapture(res): void {
		this.showMessage('Stopped captrue', res);
	}

	showMessage(src: string, obj?: any): void {
		obj ? console.log(`/////// ${src}`, obj) : console.log(`/////// ${src}`);
	}

	/**
	 * Display finger-print region
	 */
	displayFinger() {
		this.isDisplayFinger = true;
	}

	/**
	 * Read data from device then assign to @variable imgFingerPrintPreviewRight$
	 */
	readDataRightFingerPrint() {
		this.reader.onSamplesAcquired = (res) => {
			let samples = JSON.parse(res.samples);
			try {
				this.coreAiService.fingerRightScan$.next(
					`data:image/png;base64,${Fingerprint.b64UrlTo64(samples[0])}`
				);
			} catch (e) {
				console.log(e);
			}
		};
	}

	/**
	 * Upload image
	 */
	fileProgress(event, type: string) {
		if (type == 'cardFront') {
			// this.imgIdentityCardFrontPreview$.next(null);
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
				this.coreAiService.cardFrontScan$.next(reader.result);
			};
		}

		if (type == 'cardBack') {
			// this.imgIdentityCardBackPreview$.next(null);
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
				this.coreAiService.cardBackScan$.next(reader.result);
			};
		}

		if (type == 'finger') {
			this.imgFingerPrintPreviewLeft$.next(null);
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
				this.imgFingerPrintPreviewLeft$.next(reader.result);
			};
		}
	}

	@HostListener('window:load')
	loadDocument() {
		let obj = document.getElementById('CameraCtl');
		if (obj) {
			Cam_ControlInit(obj, 0, 0, 600, 400);
		}
	}

	openModalScanGTTT() {
		const modalRef = this.modalService.open(ModalIdentifyComponent, {
			backdrop: 'static',
			size: 'xl',
			centered: true,
		});

		modalRef.result.then(res => {
			if (res) {
				this.coreAiService.cardFrontScan$.next(res.cardFront);
				this.coreAiService.cardBackScan$.next(res.cardBack);
			}
		});
	}

	openModalSignature() {
		this.arrayOfImage = [];
		const modalRef = this.modalService.open(ModalCaptureSignatureComponent, {
			backdrop: 'static',
			size: 'xl',
			centered: true
		});

		modalRef.result.then(res => {
			if (res) {
				console.log(res, 'arr');
				this.commonService.filesUploadCombo$.next(this.arrayOfImage);
				console.log(this.commonService.filesUploadCombo$.getValue(), 'filesUploadNewCombo$');
			}
		});
	}

	onSelectFile(event) {
		const orientation = -1;
		if (event.target.files) {
			let listFile = this.signatureService.getSignatureFileUpload();
			const fileUploadName = event.target.files[0].name;
			const fileUpload = event.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(fileUpload);
			reader.onload = (event: any) => {
				if (this.commonService.isUpdateCombo$.getValue() && !this.signatureService.reUploadSignature$.getValue()) {
					this.signatureService.reUploadSignature$.next(true);
					listFile = [];
				}
				if (fileUploadName.endsWith('.pdf')) {
					listFile.push({
						fileName: fileUploadName,
						fileData: event.target.result,
						fileType: fileUploadName.slice(fileUploadName.lastIndexOf('.') + 1),
						isSignature: false
					});
					this.signatureService.updateSignatureFileUpload(listFile);
				} else {
					this.signatureService.compressFile(event.target.result)
						.then(res => {
							listFile.push({
								fileName: fileUploadName,
								fileData: res,
								fileType: fileUploadName.slice(fileUploadName.lastIndexOf('.') + 1),
								isSignature: false
							});
							this.signatureService.updateSignatureFileUpload(listFile);
						});

				}
			};
		}
	}

	addFile() {
		this.isAddFile = true;
	}

	uploadFileToMino() {
		if (!this.arrayOfImage || this.arrayOfImage.length < 1) {
			this.commonService.error('Bạn chưa chọn file');
			return;
		}

		this.arrayOfImage = this.arrayOfImage.map((r) => {
			return {
				fileData: r.split(',')[1],
				fileName: 'File_khach_hang',
				fileType: 'png',
				folder: '',
				id: '',
				isSignature: false,
				note: ''
			};
		});

		this.isUploading$.next(true);
		let command = GET_TRANSACTION;
		let transaction: TransactionModel = new TransactionModel();
		transaction.authenType = UPLOAD_MULTIPLE_FILE;
		transaction.data = {
			customerId: this.commonService.customerIdAside$.getValue(),
			transactionId: '',
			listFile: this.arrayOfImage
		};
		let body: BodyRequestTransactionModel = new BodyRequestTransactionModel(command, transaction);
		this.commonService.actionGetTransactionResponseApi(body)
			.pipe(finalize(() => this.isUploading$.next(false)))
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK) {
					// this.commonService.success("Tải lên file thành công");
					this.getFilesByCustomerId(this.commonService.customerIdAside$.getValue());
				}
			});
	}

	removeFileMinio(file) {
		const modalRef = this.modalService.open(ModalAskComponent, {
			size: 'sm',
			centered: true
		});

		modalRef.componentInstance.content = 'Bạn có chắc chắn muốn xóa?';

		modalRef.result.then(res => {
			if (res == 'ok') {
				let command = GET_TRANSACTION;
				let transaction: TransactionModel = new TransactionModel();
				transaction.authenType = DELETE_MULTIPLE_FILE;
				transaction.data = {
					id: file.id
				};
				let body: BodyRequestTransactionModel = new BodyRequestTransactionModel(command, transaction);
				this.commonService.actionGetTransactionResponseApi(body)
					.pipe()
					.subscribe(res => {
						if (res.seabRes.body.status == STATUS_OK) {
							// this.commonService.success("Xóa file thành công");
							this.getFilesByCustomerId(this.commonService.customerIdAside$.getValue());
						}
					});
			}
		});
	}

	getFilesByCustomerId(customerId: string) {
		this.commonService.isLoadingFiles$.next(true);
		let command = GET_ENQUIRY;
		let enquiry = new EnquiryModel();
		enquiry.authenType = GET_LIST_FILES;
		enquiry.data = {
			transactionId: '',
			customerId: customerId
		};
		let body = new BodyRequestEnquiryModel(command, enquiry);
		console.log(body, 'body for files');
		this.commonService.actionGetEnquiryResponseApi(body)
			.pipe(finalize(() => this.commonService.isLoadingFiles$.next(false)))
			.subscribe(res => {
				console.log(res, 'response for signature');
				if (res && res.status == STATUS_OK) {
					this.commonService.filesUploadByUserId.next(res.enquiry.product);
					this.commonService.customerIdAside$.next(customerId);
				}
			});
	}

	onChangeCheckbox(event, file) {
		console.log(event, 'event');
		console.log(file, 'file');
		if (event.target.checked) {
			this.filesCheckbox.push(file);
		} else {
			this.filesCheckbox.splice(this.filesCheckbox.indexOf(file), 1);
		}
		console.log(this.filesCheckbox, 'this.filesCheckbox');
	}

	reset(): void {
		this.myFile.nativeElement.value = '';
	}

	removeFile(file: FileUploadModel, index: number): void {
		if (file.id) {
			this.commonService.deleteFileById(file.id).subscribe();
		}
		this.signatureService.removeSignatureFileUploadByIndex(index);
	}

	checkSignature(event, file: FileUploadModel) {
		this.signatureService.getSignatureFileUpload().map(file => file.isSignature = false);
		file.isSignature = event.target.checked;
	}

	viewModalTemplate(file: FileUploadModel) {
		this.imgData = null;
		this.imgSrc = null;
		if (file.fileType == 'pdf') {
			if (!file.fileData) {
				window.open(this.signatureService.buildImgSrc(file), '_blank');
			}
		} else {
			const modal = document.getElementById('myModal');
			if (file.fileData) {
				this.imgData = file.fileData;
			} else {
				this.imgSrc = this.signatureService.buildImgSrc(file);
			}
			modal.style.display = 'block';
		}
	}

	closeModal() {
		const modal = document.getElementById('myModal');
		modal.style.display = 'none';
	}

	rotateImg() {
		this.angle = (this.angle + 90) % 360;
		const imgContainer = document.getElementById('myModal');
		imgContainer.className = 'modal ' + 'rotate' + this.angle;
	}

	/**
	 * @return
	 */
	get checkNhanDien(): boolean {
		if (this.checkPassport$) {
			if (this.coreAiService.cardFrontScan$.getValue()) {
				return true;
			}
		} else {
			return (this.coreAiService.cardBackScan$.getValue() && this.coreAiService.cardFrontScan$.getValue());
		}
		return false;
	}

	get checkNhanDienVantay(): boolean {
		if (this.coreAiService.fingerLeftScan$.getValue() && this.coreAiService.fingerRightScan$.getValue()) {
			return true;
		}
		return false;
	}

	checkPassport(event) {
		this.checkPassport$ = event.target.checked;
		if (this.checkPassport$) {
			this.coreAiService.cardBackScan$.next(null);
		}
	}

	removeFingerRight() {
		this.coreAiService.fingerRightScan$.next(null);
		if (this.signatureService.gtttUrlModel$.getValue() != null && this.signatureService.gtttUrlModel$.getValue().fingerRight != null) {
			this.signatureService.gtttUrlModel$.getValue().fingerRight = null;
		}
	}

	removeFingerLeft() {
		this.coreAiService.fingerLeftScan$.next(null);
		if (this.signatureService.gtttUrlModel$.getValue() != null && this.signatureService.gtttUrlModel$.getValue().fingerLeft != null) {
			this.signatureService.gtttUrlModel$.getValue().fingerLeft = null;
		}
	}

	verifySignature() {
		const listFile: FileUploadModel[] = this.signatureService.getSignatureFileUpload();
		if ((listFile.length < 1) || (listFile.findIndex(ele => ele.isSignature) < 0)) {
			this.commonService.error('Bạn chưa upload file chứa chữ ký');
			return;
		}
		const signatureFile = listFile.find(f => f.isSignature);
		const user_id = this.commonService.customerId$.getValue();
		if (!!signatureFile.fileData) {
			this.isLoadingVerifySig$.next(true);
			this.coreAiService.verifySignature(user_id, signatureFile.fileData, signatureFile.fileType)
				.pipe(finalize(() => this.isLoadingVerifySig$.next(false)))
				.subscribe(res => {
					if (res.body.status == STATUS_OK) {
						const output = res.body.utility.output;
						const verifySig: VerifySignature = {
							value: output.value,
							similarity: Math.round(output.real_score * 100),
							confidence: 0,
							signatures: this.buildLinkImageSig(output.signatures),
						};
						this.signatureService.verifySignature$.next(verifySig);
					}
				});
		}
	}

	get isShowIdentifyButton() {
		const url = this.router.url;
		return url.includes('pages/identify');
	}

	openModalCaptureFace() {
		const modalRef = this.modalService.open(ModalCaptureFaceComponent, {
			backdrop: 'static',
			centered: true,
			size: 'lg'
		});
		modalRef.result.then(res => {
			if (res) {
				this.coreAiService.faceScan$.next(res.imageAsDataUrl);
			}
		});
	}

	hiddenQlspdv(linkCoreAi: any) {
		const url = this.router.url;
		const link = linkCoreAi ? (linkCoreAi != 'assets/media/logos/nodata.png' ? linkCoreAi : null) : null;
		return !url.includes('pages/identify') && link;
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
		return this.coreAiService.returnLinkGetImage(link.substring(link.lastIndexOf('/signature/'), link.lastIndexOf('\?')));
	}
}
