import {Component, Input, OnInit} from '@angular/core';
import {IHeaderTableErrorModel} from '../../../../../shared/model/table-approve-error.model';

@Component({
	selector: 'kt-table-approve-error',
	templateUrl: './table-approve-error.component.html',
	styleUrls: ['./table-approve-error.component.scss']
})
export class TableApproveErrorComponent implements OnInit {

	@Input('headers') headers: IHeaderTableErrorModel[] = [];
	@Input('data') data: any;

	constructor() {
	}

	ngOnInit() {
	}

}
