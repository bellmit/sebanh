import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {Observable, Subject} from 'rxjs';

@Component({
	selector: 'kt-modal-capture-face',
	templateUrl: './modal-capture-face.component.html',
	styleUrls: ['./modal-capture-face.component.scss']
})
export class ModalCaptureFaceComponent implements OnInit {

	// toggle webcam on/off
	public showWebcam = true;
	public allowCameraSwitch = true;
	public multipleWebcamsAvailable = false;
	public deviceId: string;
	public facingMode: string = 'environment';
	public errors: WebcamInitError[] = [];

	// latest snapshot
	public webcamImage: WebcamImage = null;

	// webcam snapshot trigger
	private trigger: Subject<void> = new Subject<void>();
	// switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
	private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();
	msg: string = null;
	uploadedFilePath: string = null;

	constructor(
		public readonly activeModal: NgbActiveModal
	) {
	}

	public ngOnInit(): void {
		WebcamUtil.getAvailableVideoInputs()
			.then((mediaDevices: MediaDeviceInfo[]) => {
				this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
			});
	}

	public triggerSnapshot(): void {
		this.trigger.next();
	}

	public toggleWebcam(): void {
		this.showWebcam = !this.showWebcam;
		this.webcamImage = null;
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
		this.webcamImage = webcamImage;
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
		this.webcamImage = null;
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
			this.webcamImage = new WebcamImage(imageAsDataUrl, 'image/jpeg', null);
		};
	}

	closeModal() {
		this.activeModal.close(this.webcamImage);
	}
}
