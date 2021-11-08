export class WarningSlaModel {
	id: string;
	transactionId: string; // ma giao dich
	inputter: string; // user nhap
	coCode: string; // chi nhanh
	createdDate: string; // thoi gian bat dau nhap
	percentSlaInput: string; // % sla nhap
	restSlaInput: string; // sla con lai nhap
	percentSlaAuth: string; // sla con lai duyet
	restSlaAuth: string; // sla con lai duyet
}
