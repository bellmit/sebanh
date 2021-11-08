import {Component, Input, OnInit} from '@angular/core';

@Component({
	selector: 'kt-title-top',
	templateUrl: './title-top.component.html',
	styleUrls: ['./title-top.component.scss']
})
export class TitleTopComponent implements OnInit {

	@Input() parentTitle
	@Input() childOne
	@Input() childTwo

	constructor() {
	}

	ngOnInit() {
	}
}
