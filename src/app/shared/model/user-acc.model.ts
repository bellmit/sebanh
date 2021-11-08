export interface IUserAcc {
	accountType?: string;
	shortName?: string;
	shortTitle?: string;
	currency?: string;
	accountID?: string;
	account13?: string;
	category?: string;
	company?: string;
	availBal?: string;
	clearedBal?: string;
	addShortName?: string;
	addShortTitle?: string;
	addAccountType?: string;
	interest?: string;
	totalInterest?: string;
	maturityDate?: string;
	openingDate?: string;
	productCode?: string;
	productName?: string;
	keyMap?: string;
	ruleOption?: string;
	accountNmVi?: string;
	accountNmEn?: string;
	companyNameGB?: string;
	companyNameVI?: string;
	customerID?: string;
	customerType?: string;
	faceValue?: string;
	contributionType?: string;
	groupCode?: string;
}

export class UserAcc implements IUserAcc {
	constructor(
		public accountType?: string,
		public shortName?: string,
		public shortTitle?: string,
		public currency?: string,
		public accountID?: string,
		public account13?: string,
		public category?: string,
		public company?: string,
		public availBal?: string,
		public clearedBal?: string,
		public addShortName?: string,
		public addShortTitle?: string,
		public addAccountType?: string,
		public interest?: string,
		public totalInterest?: string,
		public maturityDate?: string,
		public openingDate?: string,
		public productCode?: string,
		public productName?: string,
		public keyMap?: string,
		public ruleOption?: string,
		public accountNmVi?: string,
		public accountNmEn?: string,
		public companyNameGB?: string,
		public companyNameVI?: string,
		public customerID?: string,
		public customerType?: string,
		public faceValue?: string,
		public contributionType?: string,
		public groupCode?: string
	) {
	}
}
