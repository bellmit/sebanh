import {Component, OnInit} from '@angular/core';
import {CONFIG_TABLE_MANAGE_HISTORY} from "../../../../shared/model/constants/constant-table";
import {BehaviorSubject} from "rxjs";

@Component({
	selector: 'kt-other-function',
	templateUrl: './other-function.component.html',
	styleUrls: ['./other-function.component.scss']
})
export class OtherFunctionComponent implements OnInit {
	selectedObject: any;
	objectActive: any;
	data = [
		{
			code: '1',
			action: 'Mở gói combo1 1',
			content: 'Lưu bản ghi',
			teller: "User 1",
			time: "20/10/2020"
		},
		{
			code: '2',
			action: 'Mở gói combo1 2',
			content: 'Lưu bản ghi',
			teller: "User 1",
			time: "20/10/2020"
		},
		{
			code: '3',
			action: 'Mở gói combo1 3',
			content: 'Lưu bản ghi',
			teller: "User 1",
			time: "20/10/2020"
		}
	];
	configTableManageHistory = CONFIG_TABLE_MANAGE_HISTORY;
	isLoading: BehaviorSubject<any> = new BehaviorSubject<any>(false);

	constructor() {
	}

	ngOnInit() {
	}

	chooseObject(object: any) {
		if (object) {
			this.selectedObject = object;
			this.objectActive = object;
		}
	}

}
