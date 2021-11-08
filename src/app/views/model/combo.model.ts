import {CustomerModel} from "./customer.model";
import {AccountModel} from "./account.model";
import {SmsModel} from "./sms.model";
import {CardModel} from "./card.model";
import {EbankModel} from "./ebank.model";

export class ComboModel {
	customer?: CustomerModel;
	account?: AccountModel;
	sms?: SmsModel;
	card?: CardModel;
	ebank?: EbankModel;
	combo: Combo;
}

export class Combo {
	inputter: string;
	authoriser: string;
	coCode: string;
	comboType?: string;
}
