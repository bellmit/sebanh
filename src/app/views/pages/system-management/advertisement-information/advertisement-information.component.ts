import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {
	CONFIG_TABLE_ADVERTISEMENT_INFO,
} from "../../../../shared/model/constants/constant-table";
import {CommonService} from "../../../common-service/common.service";

@Component({
	selector: 'kt-advertisement-information',
	templateUrl: './advertisement-information.component.html',
	styleUrls: ['./advertisement-information.component.scss']
})
export class AdvertisementInformationComponent implements OnInit {
	paymentForm: FormGroup;
	editForm: FormGroup;
	url: string | ArrayBuffer;
	msg: string;
	isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	imgLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	configTableAnnouncement = CONFIG_TABLE_ADVERTISEMENT_INFO;
	data = [
		{
			id: "Sản phẩm 1",
			name: "Dưới 25 tuổi",
			status: "Active",
			startTime: "10/10/2020",
			endTime: "10/10/2020",
		},
		{
			id: "Sản phẩm 2",
			name: "Từ 25 - 45 tuổi",
			status: "Active",
			startTime: "10/10/2020",
			endTime: "10/10/2020",
		},
		{
			id: "Sản phẩm 3",
			name: "Từ 45 - 55 tuổi",
			status: "Active",
			startTime: "10/10/2020",
			endTime: "10/10/2020",
		},
		{
			id: "Sản phẩm 4",
			name: "Trên 55 tuổi",
			status: "Active",
			startTime: "10/10/2020",
			endTime: "10/10/2020",
		},

	];

	dataStatus = [
		{
			id: 1,
			status: "ACTIVE"
		},
		{
			id: 2,
			status: "CLOSED"
		}
	]
	selectedObject: any;
	objectActive: any;
	selectIndex: number;

	constructor(private fb: FormBuilder,
				private commonService: CommonService) {
		this.commonService.isAsideRight$.next(true);
		this.paymentForm = this.fb.group({
			name: [],
			status: []
		});

		this.editForm = this.fb.group({
			id: [],
			name: [],
			status: [],
			startDate: [],
			endDate: [],
			image: []
		})
	}

	ngOnInit() {
	}

	onSubmit(value: any) {

	}

	selectFile(event) {
		this.imgLoading.next(true);
		this.url = '';
		if (!event.target.files[0] || event.target.files[0].length == 0) {
			this.msg = 'You must select an image';
			return;
		}

		const mimeType = event.target.files[0].type;

		if (mimeType.match(/image\/*/) == null) {
			this.msg = "Only images are supported";
			return;
		}

		const reader = new FileReader();
		reader.readAsDataURL(event.target.files[0]);

		reader.onload = (_event) => {
			this.imgLoading.next(false);
			this.msg = "";
			this.url = reader.result;
		}
	}

	chooseObject(object: any) {
		if (object) {
			this.selectedObject = object;
			this.objectActive = object;
		}
	}
}
