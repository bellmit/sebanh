import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ConfigTable, SortTable} from "../../model/config-table";
import {BehaviorSubject, Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
  selector: 'kt-kt-dynamic-table',
  templateUrl: './kt-dynamic-table.component.html',
  styleUrls: ['./kt-dynamic-table.component.scss']
})
export class KtDynamicTableComponent implements OnInit {

	@Input() data: any;
	@Input() configTable: ConfigTable;
	@Input() loading: BehaviorSubject<any>;
	@Output() selectedObject: EventEmitter<any> = new EventEmitter<any>();
	@Output() sortColumn = new EventEmitter<SortTable>();
	@Output() updateAction = new EventEmitter<any>();
	@Output() deleteAction = new EventEmitter<any>();
	isIncrease = false;
	page5: any;
	selectedIndex$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	masterSelected: boolean;

	selectedData: any = [];
	selectIndex: number;
	objectActive: any;
	showObject: any;
	p = 1;

	// Paginator | Paginators count
	paginatorTotalSubject = new BehaviorSubject<number>(0);
	paginatorTotal$: Observable<number>;

	constructor() {
	}

	ngOnInit(): void {

	}

	displayedColumns = ['select', 'position', 'name', 'weight', 'symbol'];
	// displayedColumns = ["select", "transactionCode", "customerId", "identityCode", "typeIdentity", "typeCustomer", "transactionType", "priority", "status", "inputUser", "approve"]
	dataSource = new MatTableDataSource<any>(ELEMENT_DATA);
	// dataSource: DataTableDataSource;
	selection = new SelectionModel<any>(true, []);

	@ViewChild(MatSort, {static: true}) sort: MatSort;
	@ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


	/**
	 * Set the sort after the view init since this component will
	 * be able to query its view for the initialized sort.
	 */

	/**
	 * Set the paginator after the view init since this component will
	 * be able to query its view for the initialized paginator.
	 */
	ngAfterViewInit() {
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;
	}


	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.dataSource.data.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => this.selection.select(row));
	}

}


export interface Element {
	transactionCode: any;
	customerId: any;
	identityCode: any;
	typeIdentity: any;
	typeCustomer: any;
	transactionType: any;
	priority: any;
	status: any;
	inputUser: any;
	approve: any;
}

const ELEMENT_DATA: Element[] = [
	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},
	{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB1111119",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},{
		transactionCode: "CB11112334",
		customerId: "001",
		identityCode: "Số GTTT",
		typeIdentity: "Loại GTTT",
		typeCustomer: "Phổ thông",
		transactionType:  "Tất toán sổ tiết kiệm",
		priority: "Cao",
		status: "pending",
		inputUser: "Kam.nd",
		approve: "Quy.lv"
	},
];
