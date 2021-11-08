// Angular
import {CommonService} from '../../views/common-service/common.service';
import {Injectable} from '@angular/core';
import {LocalStorageService} from 'ngx-webstorage';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition,} from '@angular/material/snack-bar';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {AuthorizationSerivce} from './authorization.serivce';
import {
	ADD_NOTIFICATION,
	APP_ID,
	CODE_00,
	GET_TRANSACTION,
	STATUS_OK,
	WEBSOCKET_API,
	WEBSOCKET_API_KEY,
	WEBSOCKET_URL
} from '../util/constant';
import {TransactionModel} from '../../views/model/transaction.model';
import {BodyRequestTransactionModel} from '../../views/model/body-request-transaction.model';
import {formatStringToLongTime} from '../util/date-format-ultils';
import {BehaviorSubject} from 'rxjs';
import {String} from 'typescript-string-operations';
import {AppConfigService} from '../../app-config.service';

@Injectable({providedIn: 'root'})
export class WebsocketClientService {
	api: string;
	apiKey: string;
	appName: string;
	WEBSOCKET_URL: string;
	stompClient: any;
	horizontalPosition: MatSnackBarHorizontalPosition = 'right';
	verticalPosition: MatSnackBarVerticalPosition = 'top';
	INPUTTER: string = 'INPUTTER';
	APPROVED: string = 'APPROVED';
	numberOfNewNotification$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
	dataNotifications: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
	countReconnect: number = 0;

	/**
	 * Service Constructor
	 *
	 * @param localStorage: LocalStorageService
	 * @param _snackBar
	 * @param authorizationSerivce
	 * @param commonService
	 */
	constructor(private localStorage: LocalStorageService,
				private _snackBar: MatSnackBar,
				private authorizationSerivce: AuthorizationSerivce,
				private commonService: CommonService,
				private appConfigService: AppConfigService
	) {
	}

	connect() {
		console.log('This is number of times reconnect to web socket ', this.countReconnect);
		if (this.countReconnect > 50) {
			this.disconnect();
			return;
		}
		this.countReconnect++;
		console.log('Connecting to websocket... at ' + new Date());
		this.api = this.appConfigService.getConfigByKey(WEBSOCKET_API);
		this.apiKey = this.appConfigService.getConfigByKey(WEBSOCKET_API_KEY);
		this.appName = this.appConfigService.getConfigByKey(APP_ID);
		this.WEBSOCKET_URL = this.appConfigService.getConfigByKey(WEBSOCKET_URL) + this.api + '&apiKey=' + this.apiKey;
		let _this = this;
		let ws = new SockJS(this.WEBSOCKET_URL);
		console.log('this.stompClient: ', this.stompClient);
		this.stompClient = Stomp.over(ws);
		this.stompClient.debug = false;
		let user: string = _this.localStorage.retrieve('username');
		if (user != null && this.stompClient) {
			this.stompClient.connect({username: user, appName: this.appName}, () => {
					let topicUserPath: string = `/topic/${this.appName}${user}`;
					console.log('WebsocketApi connect success');
					if (!_this.stompClient.counter) {
						_this.stompClient.subscribe(topicUserPath, function(params) {
							_this.onMessageReceivedTopicUser(params);
						});
					}
				},
				err => this.errorCallBack(err)
			);
		}
	}

	private onMessageReceivedTopicUser(message) {
		try {
			console.log('ReceivedTopicUser message from server', message);
			let body = JSON.parse(message.body);
			let content = JSON.parse(body.content);
			let userId: string = this.localStorage.retrieve('username');
			this._snackBar.open(content.message, 'Đóng', {
				duration: 5000,
				horizontalPosition: this.horizontalPosition,
				verticalPosition: this.verticalPosition,
			});
			this.sendStatusReceiveMessage(body.id);
			let command = GET_TRANSACTION;
			let transaction = new TransactionModel();
			transaction.authenType = ADD_NOTIFICATION;
			transaction.data = {
				'notificationId': body.id,
				'contentId': content.contentId,
				'content': content.message,
				'productType': content.productType,
				'actionType': content.actionType,
				'inputter': content.actionType == this.INPUTTER ? body.sender : null,
				'authoriser': content.actionType != this.INPUTTER ? body.sender : null,
				'userId': userId,
				'created': formatStringToLongTime(body.sendTime)
			};
			this.dataNotifications.getValue().unshift(transaction.data);
			this.dataNotifications.next(this.dataNotifications.getValue());
			this.numberOfNewNotification$.next(this.numberOfNewNotification$.getValue() + 1);
			let bodyReq = new BodyRequestTransactionModel(command, transaction);
			this.commonService.actionGetTransactionResponseApi(bodyReq).subscribe();
		} catch (e) {
			console.log(e);
		}

	}

	private sendStatusReceiveMessage(id: string) {
		this.stompClient.send('/app/send-status-receive-message', {}, JSON.stringify({
			id: id
		}));
	}

	sendMessageToUser(toUser: string, message: string, contentId: string, productType: string) {
		console.log('Sending notification start...');
		let user: string = this.localStorage.retrieve('username');
		let params: object = {
			'sender': user,
			'fromApplication': this.appName,
			'toApplication': this.appName,
			'toUsername': toUser,
			'content': JSON.stringify({
				contentId: contentId,
				productType: productType,
				actionType: this.APPROVED,
				sender: user,
				message: String.Format(message, productType, contentId)
			})
		};
		console.log('Sending notification to user:', toUser);
		this.stompClient.send('/app/send-message-to-user', {}, JSON.stringify(params));
		console.log('Sending notification success...');
	}

	sendMessageToUserApproved(message: string, contentId: string, productType: string) {
		console.log('Sending notification start...');
		let user: string = this.localStorage.retrieve('username');
		let _this = this;
		let userCocode = [];
		let userApproved = [];
		this.authorizationSerivce.callPostApiUserCoCode<any>().subscribe(res => {
			if (res && res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.ResponseCode == CODE_00) {
				userCocode = res.seabRes.body.enquiry.user_group.map(data => data.user_id);
				this.authorizationSerivce.callPostApiUserAuthoriserSeateller<any>().subscribe(res => {
					if (res && res.seabRes.body.status == STATUS_OK && res.seabRes.body.enquiry.ResponseCode == CODE_00) {
						userApproved = res.seabRes.body.enquiry.user_group.map(data => data.user_id);
						let userSend = userApproved.filter(x => userCocode.includes(x));
						console.log('Sending notification to user:', userSend.toString());
						let params: object = {
							'sender': user,
							'fromApplication': _this.appName,
							'toApplication': _this.appName,
							'toUsername': userSend.toString(),
							'content': JSON.stringify({
								contentId: contentId,
								productType: productType,
								actionType: this.INPUTTER,
								sender: user,
								message: String.Format(message, productType, contentId)
							})
						};
						this.stompClient.send('/app/send-message-to-user', {}, JSON.stringify(params));
					}
				});
			}
			console.log('Sending notification success...');
		});
	}

	sendMessageToTablet(contentData, event) {
		console.log('Sending notification start...');
		let user: string = this.localStorage.retrieve('username');
		let params: any = {
			sender: user,
			fromApplication: this.appName,
			toApplication: this.appName,
			toUsername: `TAB_${user.toUpperCase()}`,
			// toUsername: user,
			content: JSON.stringify({
				event: event,
				contentData: contentData
			})
		};
		// console.log("Sending notification to user:", `${user}`);
		console.log('Sending notification to user:', params.content);
		this.stompClient.send('/app/send-message-to-user', {}, JSON.stringify(params));
		console.log('Sending notification success...');
	}

	private errorCallBack(error) {
		console.log('errorCallBack -> at ' + error);
		setTimeout(() => {
			this.disconnect();
			this.connect();
		}, 60000);
	}

	disconnect() {
		console.log('this.stompClient: ', this.stompClient);
		if (this.stompClient !== undefined && this.stompClient !== null && this.stompClient.connected) {
			this.stompClient.disconnect();
			this.stompClient = null;
		}
		console.log('Disconnected');
	}
}
