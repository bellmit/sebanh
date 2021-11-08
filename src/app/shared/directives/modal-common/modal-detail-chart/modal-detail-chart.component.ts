import {Component, Input, ViewEncapsulation} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'modal-detail-chart',
	templateUrl: './modal-detail.component.html',
	styleUrls: ['../modal-common.css'],
	encapsulation: ViewEncapsulation.None
})
export class ModalDetailChartComponent {
	@Input() contents: any[] = [];
	@Input() type: string;
	@Input() rightsId: string;
	@Input() chartType: string;

	page = 1;
	pageSize = 10;

	constructor(public activeModal: NgbActiveModal) {
	}

	calculateTotalPage() {
		const total = this.page * this.pageSize;
		if (total > this.contents.length) {
			return this.contents.length;
		} else {
			return this.page * this.pageSize;
		}
	}

	get inputter() {
		return this.rightsId.includes('I');
	}

	get authoriser() {
		return this.rightsId.includes('A');
	}

	get pieChart() {
		return this.chartType == 'pie'
	}

	get columnChart() {
		return this.chartType == 'column'
	}
}
