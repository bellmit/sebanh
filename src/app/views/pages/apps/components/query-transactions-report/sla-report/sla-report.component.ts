import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {CommonService} from '../../../../../common-service/common.service';
// tslint:disable:indent

@Component({
	selector: 'kt-sla-report',
	templateUrl: './sla-report.component.html',
	styleUrls: ['./sla-report.component.scss']
})
export class SlaReportComponent implements OnInit {
	enumType = EnumTypeReport;
	typeReport$ = new BehaviorSubject<number>(EnumTypeReport.RealTime);
	isVhdk$ = new BehaviorSubject<boolean>(false);
	rightIds: string[] = [];

	constructor(
		private router: Router,
		private commonService: CommonService
	) {
		this.rightIds = this.commonService.getRightIdsByUrl(this.router.url);
	}

	ngOnInit() {
		this.checkVhdk();
	}

	checkVhdk(): void {
		if (this.rightIds.includes('R')) {
			this.isVhdk$.next(true);
		}
	}

	switchReport(type: EnumTypeReport): void {
		this.typeReport$.next(type);
	}

}

enum EnumTypeReport {
	RealTime,
	Error,
	HistoryTrans
}
