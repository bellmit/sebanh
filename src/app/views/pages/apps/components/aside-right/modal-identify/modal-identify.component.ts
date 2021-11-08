import {AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import 'assets/js/global/identifyScan/gpyhs.js';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DomSanitizer} from '@angular/platform-browser';
import {BehaviorSubject} from 'rxjs';
import {SEATELLER_SCAN_NAME} from '../../../../../../shared/util/constant';

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
	selector: 'kt-modal-identify',
	templateUrl: './modal-identify.component.html',
	styleUrls: ['./modal-identify.component.scss']
})
export class ModalIdentifyComponent implements OnInit, AfterViewInit {
	isCamOn: boolean = false;
	positionEnum = PosiontionEnum;

	cardFront$ = new BehaviorSubject<any>(null);
	cardBack$ = new BehaviorSubject<any>(null);

	processingCardFront$ = new BehaviorSubject<boolean>(false);
	processingCardBack$ = new BehaviorSubject<boolean>(false);

	constructor(private activeModal: NgbActiveModal,
				public _sanitizer: DomSanitizer) {
	}

	ngOnInit() {
		document.getElementById('CameraPhoto').style.display = 'none';
	}

	ngAfterViewInit() {
	}

	// @HostListener('window:keydown', ['$event'])
	// loadDocument(event: KeyboardEvent) {
	// 	if (this.isCamOn == true) {
	// 		if (event.key == 'Enter') {
	// 			event.preventDefault();
	// 		}
	// 		return;
	// 	}
	// 	if (event.key == 'Enter') {
	// 		this.isCamOn = true;
	// 		let obj = document.getElementById('CameraCtl');
	// 		Cam_ControlInit(obj, 0, 0, 600, 400);
	// 		this.setCameraCutMode();
	//
	// 	}
	// }

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

	takePhoto(position: PosiontionEnum) {
		if (position == PosiontionEnum.FRONT) {
			this.processingCardFront$.next(true);
		} else {
			this.processingCardBack$.next(true);
		}
		let path = 'D:\\' + SEATELLER_SCAN_NAME + '.jpg';
		Cam_Photo(path); //Máy ảnh chính để chụp ảnh
		setTimeout(() => {
			this.getDataBase64(position);
		}, 2000);
	}

	getDataBase64(position: PosiontionEnum) {
		let base64DataImgElement: any = document.getElementById('CameraPhoto');
		if (position == PosiontionEnum.FRONT) {
			this.processingCardFront$.next(false);
			this.cardFront$.next(base64DataImgElement.src);
		} else {
			this.processingCardBack$.next(false);
			this.cardBack$.next(base64DataImgElement.src);
		}
	}

	submit() {
		this.activeModal.close({
			cardFront: this.cardFront$.getValue(),
			cardBack: this.cardBack$.getValue(),
		});
	}

	close() {
		this.activeModal.close();
	}
}

export enum PosiontionEnum {
	FRONT,
	BACK
}
