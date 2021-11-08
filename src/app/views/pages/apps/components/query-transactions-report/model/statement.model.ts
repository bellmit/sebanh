export interface AccountInfoModel {
	errorCode: string;
	acct: string;
	acctName: string;
	category: string; // "category": "1001" -- tài khoản thanh toán, "category": "6005", -- sổ tiết kiệm
	currency: string;
	onlineBal: string;
	workingBalance: string;
	amtLimit: string;
	interest: string;
	openingDate: string;
	coCode: string;
	coNameEN: string;
	coNameVN: string;
	coAdd: string;
	legacy: string;
	group: string;
	onlineClearedBalance: string;
	minBal: string;
	lockedAmt: string;
	totalInterest: string;
	jhAccount: string;
	relationCode: string;
	seabSaleType: string;
	seabSaleId: string;
	seabBrokerType: string;
	seabBrokerId: string;
	additionValue: string;
	sbVipType: string;
	sbVipClass: string;
	seabAcStatus: string;
	recordStatus: string;
	productGroup: string;
}
