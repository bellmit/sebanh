export interface SLaTimeConfig {
	id: string;
	status: boolean;
	timeUpdate: string;
	inputter: string;
	userGroup: string;
	businessDetail: string;
	businessGroup: string;
	standardTime: string;
	warningTime: string;
}

export interface SlaReportModel {
	listCombo: SlaTranMdel[];
	listSms: SlaTranMdel[];
	listEbank: SlaTranMdel[];
	listCard: SlaTranMdel[];
	listCustomer: SlaTranMdel[];
	listAccount: SlaTranMdel[];
}

export interface SlaTranMdel {
	id: string;
	timeUpdate: string;
	timeSlaInputter: string;
	timeSlaAuthorise: string;
	caltimeSlaInputter: string;
	caltimeSlaAuthorise: string;
	timeRejected: string;
	coCode: string;
	inputter: string;
	authoriser: string;
	timeAuth: string;
	status: string;
	comboType: string;
	errorDesc: string;
	isOverSla?: boolean;
	isHalfOver?: boolean;
	isOverSlaInputter?: boolean;
	isHalfOverInputter?: boolean;
	isOverSlaAuth?: boolean;
	isHalfOverAuth?: boolean;
}

export interface SlaTimeConfigByBusiness {
	business: string;
	slaTimeInput: number;
	slaTimeAuth: number;
	warningInput: number;
	warningAuth: number;
	percentWarning?: number;
}

export interface SeriesCircleChart {
	name: string;
	y: number;
	color: string;
}

export interface SeriesStackedBarChart {
	inSla: number[];
	halfOverSla: number[];
	overSla: number[];
}

export interface SlaStatusCount {
	inSla: number;
	halfOverSla: number;
	overSla: number;
}

export interface SlaBranchData {
	coCode?: string;
	inputter?: string;
	trans: SlaTranMdel[];
	series: SlaStatusCount;
}

export interface ErrorTransModel {
	listCombo: ErrorTranModel[];
	listSms: ErrorTranModel[];
	listEbank: ErrorTranModel[];
	listCard: ErrorTranModel[];
	listCustomer: ErrorTranModel[];
	listAccount: ErrorTranModel[];
}

export interface ErrorTranModel {
	id: string;
	timeUpdate: string;
	timeSlaInputter: string;
	timeSlaAuthorise: string;
	timeRejected: string;
	coCode: string;
	inputter: string;
	authoriser: string;
	timeAuth: string;
	status: string;
	comboType: string;
	errorDesc: string;
	isOverSla?: boolean;
	isHalfOver?: boolean;
	isOverSlaInputter?: boolean;
	isHalfOverInputter?: boolean;
	isOverSlaAuth?: boolean;
	isHalfOverAuth?: boolean;
	idCard?: string;
	idCustomer?: string;
	idAccount?: string;
	idEbank?: string;
	idSms?: string;
	card?: SlaTranMdel;
	account?: SlaTranMdel;
	customer?: SlaTranMdel;
	ebank?: SlaTranMdel;
	sms?: SlaTranMdel;
	percentSla?: string;
}

