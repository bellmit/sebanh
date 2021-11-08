export class CardTemporaryModel {
	id?: string;
	customerId?: string;
	cardName?: string;
	cardType?: string;
	status?: string;
	timeUpdate?: string;
	inputter?: string;
	authoriser?: string;
	timeAuth?: string;
	coCode?: string;
	actionT24?: string;
	priority?: string;
	accountNumber?: string;
	cardId?: string;
	cardVersion?: string;
	cardStatus?: string;
	dateExpired?: string;
	tokenCard?: string;
	productStatus?: string;
	errorDesc?: string;
	timeSlaInputter?: string;
	cardNumber?: string;
	homeAddress?: string;
}

export function convertCardModelInCoreT24(cardObjectT24: any): CardTemporaryModel {
	let card = new CardTemporaryModel();
	card.cardId = cardObjectT24.mainId;
	card.cardName = cardObjectT24.embosingName;
	card.cardType = cardObjectT24.cardProduct;
	card.accountNumber = cardObjectT24.accountNo;
	card.cardNumber = cardObjectT24.cardNumber;
	card.homeAddress = cardObjectT24.address;
	return card;
}

export interface SubCardModel {
	id?: string;

	cardId?: string

	fullName?: string;

	mainCardId?: string;

	cardNumber?: string;

	embosingName?: string;

	phoneNumber?: string;

	homeAddress?: string;

	legalId?: string;

	legalDocName?: string;

	legalIssueDate?: string;

	legalIssuePlace?: string;

	prospectId?: string;

	cardType?: string;

	subCardLimit?: string;

	receiveAddress?: string;

	subCardRelation?: string;

	question?: string;

	answer?: string;
}

/**
 * Hàm này convert đường phố và phường xã lấy về từ t24
 * phường xã tính từ dấu phẩy cuối cùng trong chuỗi, đường phố là phần còn lại
 * @param street
 * @param type
 */
export function convertStreetT24(street: String, type: string){

	const streetArray = street.replace("#", ' ').split(',');
	switch (type){
		case 'WARD':
			if(streetArray.length > 1){
				return streetArray[streetArray.length - 1];
			}
			return '';

		case "STREET":

			if(streetArray.length == 1){
				return streetArray[0];
			}

			if(streetArray.length > 1){
				streetArray.pop();
				return streetArray.toString();
			}

			return '';

		default: return '';

	}
}
