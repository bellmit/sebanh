// Angular
import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {CommonService} from '../../../../common-service/common.service';
import {
	CODE_00,
	GET_ALL_NOTIFICATION,
	GET_ENQUIRY,
	GET_TRANSACTION,
	NOTIFICATION,
	STATUS_OK,
	UPDATE_NOTIFICATION
} from '../../../../../shared/util/constant';
import {LocalStorageService} from 'ngx-webstorage';
import {EnquiryModel} from '../../../../model/enquiry.model';
import {BodyRequestEnquiryModel} from '../../../../model/body-request-enquiry-model';
import {formatDateDDMMYYYHHss} from '../../../../../shared/util/date-format-ultils';
import {TransactionModel} from '../../../../model/transaction.model';
import {BodyRequestTransactionModel} from '../../../../model/body-request-transaction.model';
import {WebsocketClientService} from '../../../../../shared/services/websocket-client.service';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {NgbDropdown} from '@ng-bootstrap/ng-bootstrap';


@Component({
	selector: 'kt-notification',
	templateUrl: './notification.component.html',
	styleUrls: ['notification.component.scss']
})
export class NotificationComponent implements OnInit {

	// Show dot on top of the icon
	@Input() dot: string;

	// Show pulse on icon
	@Input() pulse: false;

	@Input() pulseLight: boolean;

	// Set icon class name
	@Input() icon = 'flaticon2-bell-alarm-symbol';
	@Input() iconType: '' | 'success';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';

	@Input() type: 'brand' | 'success' = 'success';
	@ViewChild(NgbDropdown, {static: true}) public dropdown: NgbDropdown;


	dataNotification = [];

	/**
	 * Component constructor
	 *
	 * @param sanitizer: DomSanitizer
	 */
	constructor(private sanitizer: DomSanitizer,
				private commonService: CommonService,
				private localStorage: LocalStorageService,
				private cdr: ChangeDetectorRef,
				public websocketClient: WebsocketClientService,
				private router: Router) {
	}


	backGroundStyle(): string {
		if (!this.bgImage) {
			return 'none';
		}

		return 'url(' + this.bgImage + ')';
	}

	ngOnInit(): void {
		let userId = this.localStorage.retrieve('username');
		let command = GET_ENQUIRY;
		let enquiryModel = new EnquiryModel();
		enquiryModel.authenType = GET_ALL_NOTIFICATION;
		enquiryModel.data = {
			'userId': userId
		};
		// console.log('Transaction data: ', enquiryModel.data);
		let _this = this;
		let bodyReq = new BodyRequestEnquiryModel(command, enquiryModel);
		this.commonService.actionGetEnquiryResponseApi(bodyReq).subscribe(res => {
			// console.log('response get all notification: ', res);
			if (res) {
				// console.log('success');
				_this.dataNotification = res.enquiry.product;
				_this.websocketClient.numberOfNewNotification$.next(_this.dataNotification.filter(value => !value.isRead).length);
				_this.websocketClient.dataNotifications.next(_this.dataNotification);
			}
			_this.cdr.detectChanges();
		});
	}

	formatDate(longTime: number) {
		return formatDateDDMMYYYHHss(new Date(longTime));
	}

	updateStatusNotification(notification: object) {
		let _this = this;
		let userId = this.localStorage.retrieve('username');
		this.dataNotification = this.dataNotification.map(value => {
			// @ts-ignore
			if (value.notificationId == notification.notificationId && !value.isRead) {
				// @ts-ignore
				// console.log('Update status notification with id: ' + notification.notificationId);
				let command = GET_TRANSACTION;
				let transactionModel = new TransactionModel();
				transactionModel.authenType = UPDATE_NOTIFICATION;
				transactionModel.data = {
					'userId': userId,
					// @ts-ignore
					'notificationId': notification.notificationId
				};
				value.isRead = true;
				_this.websocketClient.numberOfNewNotification$.next(_this.websocketClient.numberOfNewNotification$.getValue() - 1);
				let bodyReq = new BodyRequestTransactionModel(command, transactionModel);
				this.commonService.actionGetTransactionResponseApi(bodyReq).subscribe();
			}
			return value;
		});
		// console.log('this.dataNotification: ', this.dataNotification);
		_this.websocketClient.dataNotifications.next(this.dataNotification);
		this.navigate(notification);
	}

	navigate(notification: object) {
		const _this = this;
		const enquiryModel = new EnquiryModel();
		const command = GET_ENQUIRY;
		// @ts-ignore
		enquiryModel.authenType = NOTIFICATION.AUTHEN_TYPE[notification.productType];
		enquiryModel.data = {
			// @ts-ignore
			'transactionId': notification.contentId
		};
		const bodyReq = new BodyRequestEnquiryModel(command, enquiryModel);
		this.commonService.actionGetEnquiryResponseApi(bodyReq).subscribe(res => {
			if (res) {
				let data = res.enquiry.product;
				// @ts-ignore
				if (this.commonService[NOTIFICATION.IS_UPDATE[notification.productType]] instanceof BehaviorSubject) {
					// @ts-ignore
					this.commonService[NOTIFICATION.IS_UPDATE[notification.productType]].next(true);
				}
				_this.dropdown.close();
				// @ts-ignore
				this.router.navigateByUrl(NOTIFICATION.NAVIGATE_TYPE[notification.productType], {
					state: {
						data: data
					}
				});
			}
		});
	}

}
