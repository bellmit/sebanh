import {AfterViewInit, Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import 'assets/js/global/identifyScan/gpyhs.js';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {BehaviorSubject, Subscription} from 'rxjs';
import {DomSanitizer} from '@angular/platform-browser';
import {SEATELLER_SCAN_NAME} from '../../../../../../shared/util/constant';
import {SignatureService} from '../../identify-customer/service/signature.service';
import {FileUploadModel} from '../customer.model';
import {CommonService} from '../../../../../common-service/common.service';

// Gọi function trong assets/js/global/identifyScan/gpyhs.js
declare var Cam_ControlInit: any;
declare var GetDevCountAndNameResultCB: any;
declare var Cam_Open: any;
declare var Cam_GetDevResolution: any;
declare var Cam_Close: any;
declare var Cam_Photo: any;
declare var Cam_SetCutMode: any;
declare var Cam_ReadIdCard: any;
declare var Cam_SetFileType: any;
declare var Cam_SetColorMode: any;
declare var Cam_SetDeleteBlackEdge: any;
declare var Cam_SetDeleteBgColor: any;

@Component({
	selector: 'kt-modal-capture-signature',
	templateUrl: './modal-capture-signature.component.html',
	styleUrls: ['./modal-capture-signature.component.scss']
})
export class ModalCaptureSignatureComponent implements OnInit, AfterViewInit, OnDestroy {

	isCamOn: boolean = false;
	isCapturing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	countImage: number = 0;
	imageSignatures: FileUploadModel[] = [];
	sub: Subscription;

	constructor(private activeModal: NgbActiveModal,
				public _sanitizer: DomSanitizer,
				public signatureService: SignatureService,
				private commonService: CommonService) {
	}

	ngOnInit() {
		document.getElementById('CameraPhoto').style.display = 'none';
		this.sub = this.signatureService.signatureFiles$.subscribe(res => {
			if (res) {
				this.countImage = 0;
				this.imageSignatures = [];
				res.forEach(ele => {
					if (!ele.fileType.includes('pdf')) {
						this.countImage++;
						this.imageSignatures.push(ele);
					}
				});
			}
		});
	}

	ngAfterViewInit() {
		console.log('>>> hungtt', this.imageSignatures);
	}

	ngOnDestroy(): void {
		if (this.sub) {
			this.sub.unsubscribe();
		}
	}

	selectDevice() {
		// @ts-ignore
		let CamID = document.getElementById('DevName').selectedIndex;
		//获取分辨率
		Cam_GetDevResolution(CamID);
	}

	selectResolution() {
		let obj: any = document.getElementById('DevResolution');
		let restr = obj[obj.selectedIndex].text;
		let pos = restr.lastIndexOf('*');
		let width = parseInt(restr.substring(0, pos));
		let height = parseInt(restr.substring(pos + 1, restr.length));
		let devNameElement: any = document.getElementById('DevName');
		let CamID = devNameElement.selectedIndex;
		Cam_Open(CamID, width, height);
	}

	setCameraCutMode() {
		Cam_SetCutMode(1);
	}

	toSetFileType() {
		let obj: any = document.getElementById('FileType');
		Cam_SetFileType(obj.selectedIndex);
	}

	toSetColorModel() {
		let obj: any = document.getElementById('ColorMode');
		Cam_SetColorMode(obj.selectedIndex);
	}

	toSetDeleteBlackEdge() {
		let obj: any = document.getElementById('Checkbox1');
		if (obj.checked) {
			Cam_SetDeleteBlackEdge(1);
		} else {
			Cam_SetDeleteBlackEdge(0);
		}
	}

	/*********************
	 ***   Đặt màu nền ***
	 **********************/
	toSetDeleteBgColor() {
		let obj: any = document.getElementById('Checkbox2');
		if (obj.checked) {
			Cam_SetDeleteBgColor(1);
		} else {
			Cam_SetDeleteBgColor(0);
		}
	}

	toOpenCamera() {
		const obj = document.getElementById('CameraCtl');
		if (this.isCamOn) {
			obj.style.display = '';
		} else {
			this.isCamOn = true;
			Cam_ControlInit(obj, 0, 0, 600, 400);
			this.setCameraCutMode();
		}
	}

	toCloseCamera() {
		const obj = document.getElementById('CameraCtl');
		if (obj) {
			obj.style.display = 'none';
		}
	}

	takePhoto() {
		this.isCapturing.next(true);
		let path = 'D:\\' + SEATELLER_SCAN_NAME + '.jpeg';
		// let path = SEATELLER_SCAN_FOLDER + name + '.jpg';
		Cam_Photo(path); //Máy ảnh chính để chụp ảnh
		// Set thời gian 2s mỗi khi chụp ảnh để lưu vào mảng
		setTimeout(() => {
			this.getDataBase64();
		}, 2000);
	}

	removeImage(index: number) {
		this.signatureService.removeSignatureFileUploadByIndex(index);
	}

	getDataBase64() {
		// Lấy src image từ id
		const base64DataImgElement: any = document.getElementById('CameraPhoto');
		let signatureFiles = this.signatureService.getSignatureFileUpload();
		if (base64DataImgElement && base64DataImgElement.src) {
			const src = base64DataImgElement.src.replace('data:', 'data:image/jpeg');
			if (this.commonService.isUpdateCombo$.getValue() && !this.signatureService.reUploadSignature$.getValue()) {
				this.signatureService.reUploadSignature$.next(true);
				signatureFiles = [];
			}
			this.signatureService.compressFile(src)
				.then(res => {
					signatureFiles.push({
						fileData: res,
						fileName: 'File scan_' + (this.countImage + 1),
						isSignature: false,
						fileType: 'jpeg'
					});

					this.signatureService.updateSignatureFileUpload(signatureFiles);
				});
		}
		this.isCapturing.next(false);
	}

	sendDataToParent() {
		this.activeModal.close();
	}

	close() {
		this.activeModal.close();
	}

	checkSignature(event, file: FileUploadModel) {
		file.isSignature = event.target.checked;
	}
}
