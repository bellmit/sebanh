export interface IErrorModel {
	customer: ResultModel;
	account: ResultModel;
	ebank: ResultModel;
	card: ResultModel;
	sms: ResultModel;
	extraCard: ResultModel;
}

export class ResultModel {
	status: string;
	error: string;
	resultID: string;
}
