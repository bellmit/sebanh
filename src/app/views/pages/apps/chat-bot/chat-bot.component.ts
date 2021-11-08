import {Component, OnInit} from '@angular/core';
import {CommonService} from '../../../common-service/common.service';
import {AppConfigService} from '../../../../app-config.service';
import {CHATBOT_URL} from '../../../../shared/util/constant';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
	selector: 'kt-chat-bot',
	templateUrl: './chat-bot.component.html',
	styleUrls: []
})
export class ChatBotComponent implements OnInit {

	hiddenChatBot = true;
	userAd: string = null;
	chatBotLink: SafeUrl = null;
	safeChatBotLink: SafeUrl = null;

	constructor(
		private readonly commonService: CommonService,
		private readonly appConfigService: AppConfigService,
		private readonly sanitizer: DomSanitizer
	) {
		this.userAd = commonService.getUserAD();
		this.chatBotLink = appConfigService.getConfigByKey(CHATBOT_URL);
		if (this.chatBotLink) {
			const url = this.chatBotLink + this.userAd;
			this.safeChatBotLink = sanitizer.bypassSecurityTrustResourceUrl(url);
		}
	}

	ngOnInit() {
	}

	triggerChatBot() {
		this.hiddenChatBot = !this.hiddenChatBot;
	}

}
