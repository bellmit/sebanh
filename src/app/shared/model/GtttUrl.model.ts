export class GtttUrlModel {

	cardFront?: string;

	cardBack?: string;

	pictureFace?: string;

	fingerLeft?: string;

	fingerRight?: string;

	signatures?: SignatureModel[] = [];

	signature1?: string;

	signature2?: string;

	signature3?: string;

	signature4?: string;


	constructor(cardFront: string, cardBack: string, pictureFace: string, fingerLeft: string, fingerRight: string, signature1?: string, signature2?: string, signatures?: SignatureModel[]) {
		this.cardFront = cardFront;
		this.cardBack = cardBack;
		this.pictureFace = pictureFace;
		this.fingerLeft = fingerLeft;
		this.fingerRight = fingerRight;
		this.signature1 = signature1 || null;
		this.signature2 = signature2 || null;
		this.signatures = signatures || [];
	}

	// constructor(cardFront: string, cardBack: string, pictureFace: string, fingerLeft: string, fingerRight: string, signature1: string, signature2?: string) {
	// 	this.cardFront = cardFront;
	// 	this.cardBack = cardBack;
	// 	this.pictureFace = pictureFace;
	// 	this.fingerLeft = fingerLeft;
	// 	this.fingerRight = fingerRight;
	// 	this.signature1 = signature1;
	// 	this.signature2 = signature2;
	// }
}

export class SignatureModel {
	co_holder?: boolean;
	link: string;
	title?: string;
}
