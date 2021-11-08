import {CustomerTemplateModel} from '../customer-manage/customer.model';

export class FormPDF {
	command?: string;
	report?: Report;

	constructor() {
	}
}

export class Report {
	authenType?: string;
	customerInfo?: CustomerInfo;
	exportType?: string;
	transactionId?: string;
	extraCard?: ExtraCard;
	mainCard?: MainCard;
	mainCustomer?: MainCustomer;
	registerService?: RegisterService;
	niceAcct?: NiceAcctModel;
	listExtraCard?: ExtraCard[];
	existMainCard?: ExtraCard;
	customerTemplate?: CustomerTemplateModel;
	accountInfo?: any;
	actionAccount?: any;
	blockAccount?: any;
	closeAccount?: any;
	unblockAccounts?: any;
	fatca?:any;

	"custId"?: any;
	"branch"?: any;
	"printDate"?: any;
	"saveToMinio"?: any;
	sameOwner?: any;
}

export class CustomerInfo {
	birthDate?: string;
	birthPlace?: string;
	chucVu?: string;
	cuaKhau?: string;
	currentAddress?: string;
	diaChiNN?: string;
	diaChiVN?: string;
	email?: string;
	fromDate?: string;
	fullName?: string;
	gender?: string;
	gttt?: string;
	hoKhau?: string;
	isCuTru?: boolean;
	isMarried?: boolean;
	isSameAddress?: boolean;
	issueDate?: string;
	issuesAddress?: string;
	job?: string;
	mobilePhone?: string;
	nationality?: string;
	ngayNhapCanh?: string;
	otherAdd?: string;
	otherMarried?: string;
	otherNationality?: string;
	otherPhone?: string;
	otherPhuong?: string;
	otherQuan?: string;
	otherTinh?: string;
	phuongXa?: string;
	quanHuyen?: string;
	relationship?: string;
	school?: string;
	seabID?: string;
	soThiThuc?: string;
	thuNhap?: string;
	tinhTp?: string;
	toDate?: string;
	listQuestion?: Question[];
	maSoThue?: string;
	dcLienHe?: string;
}

export class ExtraCard {
	address?: any;
	addressReceiveCard?: any;
	birthDate?: any;
	cardName?: any;
	disagreeOnlineBanking?: boolean;
	email?: any;
	exportType?: any;
	fullName?: any;
	gender?: any;
	gttt?: any;
	homePhone?: any;
	huyen?: any;
	isCurrentAddress?: boolean;
	isMasterCard?: boolean;
	isMasterCardStandard?: boolean;
	isNormal?: boolean;
	isS24Card?: boolean;
	isVisa?: boolean;
	isVisaPremium?: boolean;
	isVisaStandard?: boolean;
	limitCard?: any;
	mobilePhone?: any;
	nationality?: any;
	ngayCap?: any;
	noiCap?: any;
	relationShip?: any;
	school?: any;
	tinh?: any;
	xa?: any;
	isBrgElite?: boolean;
	brgId?: any;
	otherNationality?: any;
	soThiThuc?: any;
	fromDate?: any;
	toDate?: any;
	ngayNhapCanh?: any;
	cuaKhau?: any;
	hoKhau?: any;
	diaChiNN?: any;
	job?: any;
	chucVu?: any;
	thuNhap?: any;
	sixthFirstCardNum?: string;
	seventhLastCardNum?: string;
	branchName?: string;
	cardType?: string;
}

export class MainCard {
	address?: string;
	addressReceiveCard?: string;
	birthDate?: string;
	cardName?: string;
	disagreeOnlineBanking?: boolean;
	email?: string;
	exportType?: string;
	fullName?: string;
	gender?: string;
	gttt?: string;
	homePhone?: string;
	huyen?: string;
	isCurrentAddress?: boolean;
	isMasterCard?: boolean;
	isMasterCardStandard?: boolean;
	isNormal?: boolean;
	isS24Card?: boolean;
	isVisa?: boolean;
	isVisaPremium?: boolean;
	isVisaStandard?: boolean;
	limitCard?: string;
	mobilePhone?: string;
	nationality?: string;
	ngayCap?: string;
	noiCap?: string;
	relationShip?: string;
	school?: string;
	tinh?: string;
	xa?: string;
	isBrgElite?: boolean;
	brgId?: any;
	sixthFirstCardNum?: string;
	seventhLastCardNum?: string;
	branchName?: string;
	cardType?: string;
}

export class MainCustomer {
	birthDate?: string;
	birthPlace?: string;
	chucVu?: string;
	cuaKhau?: string;
	currentAddress?: string;
	diaChiNN?: string;
	diaChiVN?: string;
	email?: string;
	fromDate?: string;
	fullName?: string;
	gender?: string;
	gttt?: string;
	hoKhau?: string;
	isCuTru?: boolean;
	isMarried?: any;
	isSameAddress?: boolean;
	issueDate?: string;
	issuesAddress?: string;
	job?: string;
	mobilePhone?: string;
	nationality?: string;
	ngayNhapCanh?: string;
	otherAdd?: string;
	otherMarried?: string;
	otherNationality?: string;
	otherPhone?: string;
	otherPhuong?: string;
	otherQuan?: string;
	otherTinh?: string;
	phuongXa?: string;
	quanHuyen?: string;
	relationship?: string;
	school?: string;
	seabID?: string;
	soThiThuc?: string;
	thuNhap?: string;
	tinhTp?: string;
	toDate?: string;
	listQuestion?: Question[];
	maSoThue?: string;
	dcLienHe?: string;
}

export class RegisterService {
	isOtherTKKT?: boolean;
	isSeaSave?: boolean;
	isSelectAll?: boolean;
	isSmsBanking?: boolean;
	isTKKT?: boolean;
	isUsdSeaSave?: boolean;
	isUsdTKKT?: boolean;
	isVndSeaSave?: boolean;
	otherCurrency?: string;
	otherSeaSave?: string;
}

export class Question {
	question: string;
	answer: string;
}

export class NiceAcctModel {
	transactionId: string;
	custId: string;
	branchName: string;
	fullName: string;
	ngay: string;
	niceAcct: string;
	phi: string;
	phiStr: string;
	soDu: string;
}



