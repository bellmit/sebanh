export class CardPDF {
	isDomesticCard?: string;
	isVisaCard?: string;
	isVisaSeaPremium?: string;
	isMasterCard?: string;
	releaseType?: string;
	cardName?: string;
	addressReceivedCard?: string;
	hasExtraCard?: string;
	extraCard?: ExtraCardPDF[];

	constructor() {
	}

}

export class ExtraCardPDF {
	extraCardType?: string;
	releaseType?: string;
	limitExtraCard?: string;
	customerName?: string;
	relationship?: string;
	extraCardName?: string;
	gender?: string;
	birthday?: string;
	nationality?: string;
	legalDocName?: string;
	legalID?: string;
	issuedBy?: string;
	issueDate?: string;
	address?: string;
	street?: string;
	district?: string;
	province?: string;
	phone?: string;
	email?: string;

	constructor() {
	}
}
