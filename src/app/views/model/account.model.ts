export class AccountModel {
	id: number;
	customerId: string;
	accountName: string;
	shortName: string;
	idRelate: string;
	relate: string;
	accountNumber: string;
	status: string;
	timeUpdate: string;
	inputter: string;
	authoriser: string;
	timeAuth: string;
	coCode: string;
	accountCheckbox: boolean;
	currency: string;
	relates: any = [];

	classifyNiceAccount?: string;
	goldenAccountType?: string;
	classNiceAccount?: string;
	feeAmount?: string;
	totalAmount?: string;
	dateFee?: string;
	feeAccount?: string;
	tax?: string;
	description?: string;
	accountPolicy?: string;
	lockDownAmount?: string;
	feeCode?: string;
	phoneNumberAccount?: string;
}
