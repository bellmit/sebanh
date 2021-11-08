export class EBankDto {
	id?: string;
	status?: string;
	serviceId?: string;
	similarityCoreAi?: any;
	reasonReject?: string;
	handyNumber?: string;
	packageService?: string;
	passwordType?: string;
	promotionId?: string;
	limit?: string;
	transSeANetPro?: string;
	departCode?: string;
	actionT24?: string;
	priority?: string;
	campaignId?: string;
	mainCurrAcc?: string;
	coreDate?: string;
	customerId?: string;
	username?: string;
	inputter?: string;
	coCode?: string;
	saleType?: string;
	saleId?: string;
	brokerType?: string;
	brokerId?: string;
	serviceStatus?: string;
	email?: string;
	timeSlaInputter?: any;
	timeUpdate?: string;
	coCodeT24?: string;
	userStatus?: string;
	// cap nhat hinh anh KH vao core ai
	cardFrontBase64?: string;
	cardBackBase64?: string;
	pictureFaceBase64?: string;
	fingerLeftBase64?: string;
	fingerRightBase64?: string;
	cardFront?: string;
	cardBack?: string;
	pictureFace?: string;
	fingerLeft?: string;
	fingerRight?: string;
}

export class EBankDtoT24 {
	responseCode: string;
	customerId: string;
	nationalIssueDate: string;
	nationalIssuePlace: string;
	handyNumber: string;
	email: string;
	sector: string;
	address: string;
	startDate: string;
	endDate: string;
	serviceId: string;
	authenticationType: string;
	servicePackage: string;
	serviceStatus: string;
	userFunction: string;
	transLimit: string;
	mainCurrAcc: string;
	promotionId: string;
	campaignId: string;
	salesType: string;
	salesId: string;
	brokerType: string;
	brokerId: string;
	transSeanetBase: string;
	transSeanetPro: string;
	coCode: string;
	userStatus?: string;
}

export function eBankDtoMapper(eBankT24: EBankDtoT24): EBankDto {

	if (!eBankT24) {
		return null;
	}

	let eBank: EBankDto = new EBankDto();

	eBank.username = eBankT24.customerId ? (eBankT24.customerId + '00') : null;
	eBank.customerId = eBankT24.customerId ? eBankT24.customerId : null;
	eBank.handyNumber = eBankT24.handyNumber ? eBankT24.handyNumber : null;
	eBank.email = eBankT24.email ? eBankT24.email : null;
	eBank.passwordType = eBankT24.authenticationType ? eBankT24.authenticationType : null;
	eBank.serviceId = eBankT24.serviceId ? eBankT24.serviceId : null;
	eBank.packageService = eBankT24.servicePackage ? eBankT24.servicePackage : null;
	eBank.serviceStatus = eBankT24.serviceStatus ? eBankT24.serviceStatus : null;
	eBank.coCodeT24 = eBankT24.coCode ? eBankT24.coCode : null;
	eBank.limit = eBankT24.transLimit ? eBankT24.transLimit : null;
	eBank.mainCurrAcc = eBankT24.mainCurrAcc ? eBankT24.mainCurrAcc : null;
	eBank.promotionId = eBankT24.promotionId ? eBankT24.promotionId : null;
	eBank.campaignId = eBankT24.campaignId ? eBankT24.campaignId : null;
	eBank.saleType = eBankT24.salesType ? eBankT24.salesType : null;
	eBank.saleId = eBankT24.salesId ? eBankT24.salesId : null;
	eBank.brokerType = eBankT24.brokerType ? eBankT24.brokerType : null;
	eBank.brokerId = eBankT24.brokerId ? eBankT24.brokerId : null;
	eBank.transSeANetPro = eBankT24.transSeanetPro ? eBankT24.transSeanetPro : null;
	eBank.coCodeT24 = eBankT24.coCode ? eBankT24.coCode : null;
	eBank.userStatus = eBankT24.userStatus ? eBankT24.userStatus : null;

	return eBank;
}

export interface ICampaignModel {
	description: string;
	endDate: string;
	gbShortDesc: string;
	opporDef: string;
	primCtxTbl: string;
	recid: string;
	startDate: string;
	type: string;
}
