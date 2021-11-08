import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import fakeData from "./fakeData.json"
import {BehaviorSubject} from "rxjs";
import {CONFIG_TABLE_ANNOUNCEMENT} from "../../../../../shared/model/constants/constant-table";
import {Route, Router} from "@angular/router";

@Component({
	selector: 'kt-announcements-management',
	templateUrl: './announcements-management.component.html',
	styleUrls: ['./announcements-management.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AnnouncementsManagementComponent implements OnInit {
	searchField: any;
	fakeData: any = fakeData;
	configTableAnnouncement = CONFIG_TABLE_ANNOUNCEMENT;
	isLoading$: BehaviorSubject<any> = new BehaviorSubject<any>(false);

	constructor(private route: Router) {
	}

	ngOnInit() {
	}

	search() {

	}

	onSearch() {

	}

	addAnnouncement() {
		this.route.navigateByUrl("/pages/admin/add-announcement");
	}
}
