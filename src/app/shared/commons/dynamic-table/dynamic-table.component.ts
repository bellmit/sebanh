import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {ConfigTable, SortTable} from "../../model/config-table";
import {BehaviorSubject} from "rxjs";
import {NgbPaginationConfig} from "@ng-bootstrap/ng-bootstrap";

@Component({
	selector: 'kt-dynamic-table',
	templateUrl: './dynamic-table.component.html',
	styleUrls: ['./dynamic-table.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DynamicTableComponent implements OnInit {
	@Input() data: any;
	@Input() configTable: ConfigTable;
	@Input() loading: BehaviorSubject<any>;
	@Output() selectedObject: EventEmitter<any> = new EventEmitter<any>();
	@Output() sortColumn = new EventEmitter<SortTable>();
	@Output() updateAction = new EventEmitter<any>();
	@Output() deleteAction = new EventEmitter<any>();
	isIncrease = false;
	selectedIndex$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
	masterSelected: boolean;

	selectedData: any = [];
	selectIndex: number;
	objectActive: any;
	showObject: any;

	page = 1;
	pageSize = 5;

	constructor(config: NgbPaginationConfig) {
		// customize default values of paginations used by this component tree
		config.size = 'sm';
		config.boundaryLinks = true;
		if(this.data){
			for (let i = 0; i< this.data.length; i++) {
				this.data = this.data[i].push({"stt": i + 1})
			}
		}
	}

	ngOnInit(): void {
	}

	sortEmit(type: string, index: number, isSortByFieldColumn: boolean) {
		if (isSortByFieldColumn) {
			const selectedIndex = this.selectedIndex$.getValue();
			this.selectedIndex$.next(index)
			if ((index == selectedIndex) || (index !== selectedIndex
				&& this.isIncrease == false) || selectedIndex == null) {
				this.isIncrease = !this.isIncrease;
			}
			this.selectedIndex$.next(index)
			let eventEmit = new SortTable();
			eventEmit.sortIncrease = this.isIncrease;
			eventEmit.property = type;
			this.sortColumn.emit(eventEmit);
		} else return;
	}

	checkUncheckAll() {
		this.selectedData = [];
		for (let i = 0; i < this.data.length; i++) {
			this.data[i].isSelected = this.masterSelected;
		}
		this.getCheckedItemList();
	}

	getCheckedItemList() {
		// this.selectedData = [];
		for (var i = 0; i < this.data.length; i++) {
			if (this.data[i].isSelected)
				this.selectedData.push(this.data[i]);
		}
		// console.log(this.selectedData)
		// this.checkedList = JSON.stringify(this.checkedList);
	}

	isAllSelected(obj: any) {
		this.selectedData.push(obj);
		this.selectedData = this.selectedData.filter(i => i.isSelected == true);
		// if(obj.isSelected == true){
		// 	this.selectedData.push(obj);
		// }else {
		// 	for (let i =0; i< this.selectedData; i++){
		// 		this.selectedData = this.selectedData.filter(i => i.isSelected == false);
		// 	}
		// }
		// // console.log(obj)
		// console.log(this.selectedData)
	}

	chooseObject(object: any, index: number) {
		if (object) {
			this.showObject = object;
			this.objectActive = object;
			this.selectIndex = index;
			this.selectedObject.emit(object);
		}
	}

	emitEditAction(object: any) {
		this.updateAction.emit(object);
	}

	emitDeleteAction(object: any) {
		this.deleteAction.emit(object);
	}

	calculateTotalPage() {
		const total = this.page * this.pageSize
		if(total > this.data.length){
			return this.data.length;
		}else
		return this.page * this.pageSize
	}
}
