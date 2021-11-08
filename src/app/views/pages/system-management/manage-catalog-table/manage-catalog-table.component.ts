import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {
	CONFIG_TABLE_MANAGE_CATALOG_TABLE, CONFIG_TABLE_MANAGE_TABLE_DETAIL
} from "../../../../shared/model/constants/constant-table";
import {FormGroup} from "@angular/forms";

@Component({
	selector: 'kt-manage-catalog-table',
	templateUrl: './manage-catalog-table.component.html',
	styleUrls: ['./manage-catalog-table.component.scss']
})
export class ManageCatalogTableComponent implements OnInit {

	data = [
		{
			tableName: "PROMOTION_ID",
			description: "Mã ưu đãi promotion 1",
			source: "T24",
			timeUpdate: "10/10/2020",
			personUpdate: "bao.nkg",
			time: "1",
		},
		{
			tableName: "QUOC_GIA",
			description: "Mã ưu đãi promotion 1",
			source: "T24",
			timeUpdate: "10/10/2020",
			personUpdate: "bao.nkg",
			time: "1",
		},
		{
			tableName: "LOAI_GTTT",
			description: "Mã ưu đãi promotion 1",
			source: "T24",
			timeUpdate: "10/10/2020",
			personUpdate: "bao.nkg",
			time: "1",
		},
		{
			tableName: "QUAN_HUYEN",
			description: "Mã ưu đãi promotion 1",
			source: "T24",
			timeUpdate: "10/10/2020",
			personUpdate: "bao.nkg",
			time: "1",
		},
		{
			tableName: "TINH_THANHPHO",
			description: "Mã ưu đãi promotion 1",
			source: "T24",
			timeUpdate: "10/10/2020",
			personUpdate: "bao.nkg",
			time: "1",
		},
	];

	data2 = [
		{
			cardCode: "12325",
			description: "Mô tả 1",
		},
		{
			cardCode: "12325",
			description: "Mô tả 1",
		},
		{
			cardCode: "12325",
			description: "Mô tả 1",
		}
	]
	selectedObject: any;
	objectActive: any;
	isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	editForm: FormGroup;
	configTableManageCatalogTable = CONFIG_TABLE_MANAGE_CATALOG_TABLE;
	configTableManageTableDetail = CONFIG_TABLE_MANAGE_TABLE_DETAIL;

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
