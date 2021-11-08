export interface IHeaderTableErrorModel {
	code: string;
	value: string;
}

export interface CardTemporary {
	id: string;
	customerId: string;
	cardName: string;
	cardType: string;
	promotionId?: any;
	transProId?: any;
	ycomer?: any;
	memberCode?: any;
	memberDateExpored?: any;
	status: string;
	timeUpdate: string;
	inputter: string;
	authoriser?: any;
	timeAuth?: any;
	coCode: string;
	isCreatByCombo: boolean;
	actionT24: string;
	priority: string;
	accountNumber: string;
	cardId: string;
	cardVersion: string;
	cardStatus: string;
	dateExpired: string;
	tokenCard: string;
	productStatus: string;
	errorDesc?: any;
	homeAddress?: any;
	timeRejected?: any;
	reasonReject?: any;
	timeSlaInputter: string;
	timeSlaAuthorise?: any;
	coCodeT24: string;
	internationalCard: boolean;
	approvedError: boolean;
	approvedSuccess: boolean;
}

export interface CardActionUpdateStatus {
	idx: string;
	cardId: string;
	cardStatus: string;
	reasonId: string;
	reasonName?: any;
	detail: string;
	timeUpdate: string;
	status?: any;
	errorDesc?: any;
}

export interface CardActionUpdateInfo {
	idx: string;
	cardId: string;
	oldAccountAssociate: string;
	oldAutomaticallyDebit: string;
	newRegisEcom: string;
	newAccountAssociate: string;
	newAutomaticallyDebit: string;
	oldRegisEcom?: any;
	mainCardId: string;
	timeUpdate: string;
	status?: any;
	errorDesc?: any;
}

export interface CardActionReleaseCardPin {
	idx: string;
	cardId: string;
	oldNameCard: string;
	oldAddressCard: string;
	reasonName: string;
	feeCode: string;
	feeCollectionPlan: string;
	accountFee: string;
	feeAmount: string;
	newNameCard: string;
	newAddressCard: string;
	releaseType: string;
	timeUpdate: string;
	status?: any;
	errorDesc?: any;
}

export interface IActionCard {
	cardTemporary: CardTemporary;
	cardActionExtendCard?: any;
	cardActionActive?: any;
	cardActionLock?: any;
	cardActionUpdateStatus: CardActionUpdateStatus;
	lstCardActionUpdateTransLimit?: any;
	cardActionUpdateInfo: CardActionUpdateInfo;
	cardActionResetPinSercure?: any;
	cardActionReleaseCardPin: CardActionReleaseCardPin;
}
