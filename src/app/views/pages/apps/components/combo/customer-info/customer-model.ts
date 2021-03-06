import {Validators} from "@angular/forms";

export class CustomerModel {
	id?: number;
	customerId?: string;
	customerID?: string;
	customerName?: string;
	sex?: string;
	birthday?: string;
	placeOfBirth?: string;
	maritalStatus?: string;
	purpose?: string;
	national?: any;
	residentStstus?: string;
	residentNational?: string;
	gttt?: string;
	idenType?: string;
	organization?: string;
	idenTime?: string;
	idenAdress?: string;
	idenTimeExpired?: string;
	idenTimeValue?: string;
	idenAddress?: string;
	phone?: string;
	mobile?: string;
	email?: string;
	piority?: number;
	stress?: string;
	district?: string;
	province?: string;
	customerAddress?: string;
	campaignId?: string;
	saleType?: string;
	saleId?: string;
	brokerType?: string;
	brokerId?: string;
	status?: string;
	timeUpdate?: string;
	inputter?: string;
	authoriser?: string;
	timeAuth?: string;
	fromDate?: any;
	toDate?: any;
	coCode?: string;
	actionT24: string;

	addrLocation?: string;
	customerCurrency?: string;
	occupation: string;
	country: string;
	securityQues: string;
	answer: string;
	loyalty: string;
	departCode: string;

	priority: string;
	title: string;
	portfolio: string;
	ownerBen: string;
	ownCustomer: string;
	employment: string;
	employerName: string;
	employerAddress: string;
	industryGroup: string;
	industry: string;
	industryClass: string;

	identification: any;
	contactInfos: any = [];

	noOfDependents: string;
	salaryReq: string;
	fax: string;
	taxId: string;
	relate: string;
	relationCustomer: string;
	questionAnswer: any =[];
	relates: any = [];
	faxs: any = [];
	taxs: any = []
	securityQuestions: any;
	shortName: string;
	town: string;
	currTown: string;
	currDistrict: string;
	currCity: string;
	currCityId: string;
	legalID: any;
	legalIssDate: any;
	legalIssAuth: any;
	fullName: any;
	seabID: any;
	isSameIdenAddress: boolean;
}
