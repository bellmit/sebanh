import {Component, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {BehaviorSubject} from "rxjs";
import {
	CONFIG_TABLE_ADVERTISEMENT_MAPPING,
} from "../../../../shared/model/constants/constant-table";

@Component({
	selector: 'kt-advertisement-mapping',
	templateUrl: './advertisement-mapping.component.html',
	styleUrls: ['./advertisement-mapping.component.scss']
})
export class AdvertisementMappingComponent implements OnInit {

	data = [
		{
			id: "M1",
			description: "Điều kiện để quảng cáo gói tài khoản cho KH dưới 25 tuổi. Nữ",
			product: "Gói tài khoản",
			criteria: "A1, B1",
			order: "1",
			status: "ACTIVE",
			time: "10/10/2020",
			teller: "bao.nkg",
		},
		{
			id: "M2",
			description: "Điều kiện để quảng cáo gói tài khoản cho KH từ 25 - 45 tuổi. Nữ",
			product: "Gói tài khoản",
			criteria: "A1, B1",
			order: "1",
			status: "ACTIVE",
			time: "10/10/2020",
			teller: "bao.nkg",
		},
		{
			id: "M3",
			description: "Điều kiện để quảng cáo gói tài khoản cho KH từ 45 - 55 tuổi. Nữ",
			product: "Gói tài khoản",
			criteria: "A1, B1",
			order: "1",
			status: "ACTIVE",
			time: "10/10/2020",
			teller: "bao.nkg",
		},
		{
			id: "M4",
			description: "Điều kiện để quảng cáo gói tài khoản cho KH trên 55 tuổi. Nữ",
			product: "Gói tài khoản",
			criteria: "A1, B1",
			order: "1",
			status: "ACTIVE",
			time: "10/10/2020",
			teller: "bao.nkg",
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

	dataProduct = [
		{
			name: "Sản phẩm 1"
		},
		{
			name: "Sản phẩm 2"
		},
		{
			name: "Sản phẩm 3"
		},
	]

	dataCriteria = [
		{
			name: "A1"
		},
		{
			name: "A2"
		},
		{
			name: "B1"
		},
		{
			name: "B2"
		},
	]


	selectedObject: any;
	objectActive: any;
	selectIndex: number;
	editForm: FormGroup;
	isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoading1: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoading2: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	configTableAdsMapping = CONFIG_TABLE_ADVERTISEMENT_MAPPING;

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

	onSubmit(value: any) {

	}
}
