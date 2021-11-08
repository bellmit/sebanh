import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {AdminNoificationService} from './admin-noification.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {PopupNotificationComponent} from './popup-notification/popup-notification.component';
import moment from 'moment';
import {
	CODE_OK,
	LIST_GROUP_WITHOUT_NAME,
	LIST_USER_GROUP_SEATELLER, SEATELLER_DB,
	STATUS_OK, USER_PROFILE
} from '../../../../../../shared/util/constant';
import {LocalStorageService, SessionStorageService} from 'ngx-webstorage';
import {AdminNotificationModel} from '../../../../../../shared/model/admin-notification.model';
import {CommonService} from '../../../../../common-service/common.service';
import {NgxIndexedDBService} from 'ngx-indexed-db';

@Component({
	selector: 'kt-admin-notification',
	templateUrl: './admin-notification.component.html',
	styleUrls: ['./admin-notification.component.scss', '../dashboard-new.component.scss']
})
export class AdminNotificationComponent implements OnInit {

	notfications$: BehaviorSubject<AdminNotificationModel[]> = new BehaviorSubject<AdminNotificationModel[]>([]);
	readId$ = new BehaviorSubject<string[]>([]);
	allGroup: any[];
	username: string = '';
	contentIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
	sub: Subscription;

	constructor(
		private modal: NgbModal,
		private service: AdminNoificationService,
		private session: SessionStorageService,
		private localStorageService: LocalStorageService,
		private commonService: CommonService,
		private dbService: NgxIndexedDBService
	) {
		this.username = this.session.retrieve(USER_PROFILE) ? this.session.retrieve(USER_PROFILE).user_id : '';
	}

	ngOnInit() {
		this.sub = this.commonService.groupOwner$.subscribe(res => {
			if (res) {
				this.initNotifications();
			}
		});
		// console.log(this.commonService.groupOwner$.getValue());
		// if (this.commonService.groupOwner$.getValue()) {
		// 	this.initNotifications();
		// }
		this.getAllDb();
	}

	initNotifications(): void {
		if (this.sub) {
			this.sub.unsubscribe();
		}

		const today = moment(new Date()).format('DD/MM/YYYY');
		this.service.getListNotificaion(null, today, today)
			.subscribe(res => {
				if (res.seabRes.body.status == STATUS_OK && res.seabRes.body.responseCode == CODE_OK) {
					const rawData = res.seabRes.body.data ? res.seabRes.body.data : [];
					this.notfications$.next(this.filterNotification(rawData));
				} else {
					const desc = res.seabRes.error ? res.seabRes.error.desc : res.seabRes.body.responseDesc;
					//this.commonService.error(desc);
				}
			});
	}

	mouseOveredContent(i: number) {
		this.contentIndex$.next(i);
	}

	mouseOutOfContent() {
		this.contentIndex$.next(null);
	}

	showPopup(notification: AdminNotificationModel): void {
		const content = notification.description;
		const timeUpdate = this.getTimeUpdate(notification.timeUpdate);
		const modalRef = this.modal.open(PopupNotificationComponent, {
			centered: true,
			backdrop: 'static'
		});
		modalRef.componentInstance.content = content;
		modalRef.componentInstance.timeUpdate = timeUpdate;
		this.updateReadNotify(notification);
	}

	getTimeUpdate(src: string): string {
		const timeUpdate = moment(src, 'DD/MM/YYYY HH:mm:ss');
		const diffTime = moment.duration(moment().diff(timeUpdate));
		if (diffTime) {
			if (diffTime.asHours() > 48) {
				return Math.round(diffTime.asDays()) + ' ngày trước';
			}
			return Math.round(diffTime.asHours()) + ' giờ trước';
		}
		return '';
	}

	/**
	 * filter notifications that user can receive
	 * @param rawData
	 */
	filterNotification(rawData: AdminNotificationModel[]): AdminNotificationModel[] {
		this.getFullGroup();
		return rawData.filter(notification => this.checkNotification(notification));
	}

	/**
	 * check if notification can received by user
	 * @param notification
	 */
	checkNotification(notification: AdminNotificationModel) {

		const userActives = notification.userActive ? notification.userActive.split('#') : null;
		const userInActives = notification.userInactive ? notification.userInactive.split('#') : null;
		const groupActives = notification.groupUserActive ? notification.groupUserActive.split('#') : null;

		if (userInActives && userInActives.includes(this.username)) { // user thuoc nhom loai tru
			return false;
		}

		if (groupActives == null && userActives == null) { // nhom nhan rong, user nhan rong
			return true;
		}

		if (userActives && userActives.includes(this.username)) { // user thuoc nhung user duoc nhan
			return true;
		}
		return this.isContainsValue(this.allGroup, groupActives);
	}

	/**
	 * Check if arr1 has any value in arr2
	 * @param arr1
	 * @param arr2
	 */
	isContainsValue(arr1: any[], arr2: any[]): boolean {
		return arr1.some(item => arr2.includes(item));
	}

	/**
	 * get all group that user belong to
	 */
	getFullGroup(): void {
		const listgroup: any[] = this.localStorageService.retrieve(LIST_USER_GROUP_SEATELLER) || [];
		const branch: any[] = this.localStorageService.retrieve(LIST_GROUP_WITHOUT_NAME) || [];
		const fullGroup = listgroup.concat(branch);
		this.allGroup = fullGroup.reduce((prev, acc) => prev.concat(acc.group_id), []);
	}

	updateReadNotify(notification: AdminNotificationModel): void {
		let notifIds: string[] = this.readId$.getValue();
		if (!notifIds.includes(notification.id)) {
			notifIds.push(notification.id);
			this.dbService.update(SEATELLER_DB.schema.name, {
				id: this.username,
				user: this.username,
				notifyId: notifIds.join('#')
			});
		}
	}

	getAllDb(): void {
		this.dbService.getByIndex(SEATELLER_DB.schema.name, SEATELLER_DB.schema.key_user, this.username)
			.subscribe(res => {
				if (res) {
					console.log('>>>>>> data on db ', res);
					this.readId$.next(res.notifyId.split('#'));
				}
			});
	}

	isRead(notification: AdminNotificationModel): boolean {
		const readIds = this.readId$.getValue();
		return readIds.includes(notification.id);
	}
}
