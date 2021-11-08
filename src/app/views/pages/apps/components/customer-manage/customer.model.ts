export interface FileUploadModel {
	fileName: string;
	fileData: string;
	fileType: string;
	isSignature: boolean;
	// response from api
	bucketName?: string;
	comboType?: string;
	customerId?: string;
	folder?: string;
	id?: string;
	note?: string;
	trackId?: string;
	transactionId?: string;
	// fileData: null
	// fileName: "Don_dang_ky_combo_4977f014-fc65-4f59-b66a-5637671e9403.jpeg"
	// fileType: "jpeg"
	// isSignature: null
}

export interface IdentityPaper {
	gttt?: string;
	organization: string;
	idenTimeExpired: string;
	idenType: string;
	idenTime: string;
	idenAdress: string;
}

export interface VerifySignature {
	value: string;
	similarity: number;
	confidence: number;
	signatures: string[];
}

export class SercurityQuestion {
	question: string;
	answer: string;
}

export class CustomerTemplateModel {
	authenType: string;
	transactionId: string;
	custId: string;
	saveToMinio: boolean;
	exportType: string;
	actionCustomer: ActionCustomer;
	customerInfo: CustomerInfo;
	infoChange: InfoChange;
	ownerCustomer: OwnerCustomer;
	ownerPaymentAcc: OwnerPaymentAcc;
	sercurityQuestions: SercurityQuestion[];

	constructor() {

	}
}


export class ActionCustomer {
	other: string;
	updateInfo: boolean;
	updateOwnerInfo: boolean;
	changeSecurityQuestion: boolean;

	constructor() {
	}
}

export class CustomerInfo {
	fullName: string;
	gttt: string;
	issueDate: string;
	issuesAddress: string;
	customerID: string;

	constructor() {
	}
}

export class CoQuan {
	diaChiCoQuan: string;
	phone: string;
	quanCoQuan: string;
	tenCoQuan: string;
	tinhCoQuan: string;

	constructor() {
	}
}

export class InfoChange {
	birthDate: string;
	birthPlace: string;
	coQuan: CoQuan;
	cuaKhau: string;
	currentAddress: string;
	chucVu: string;
	diaChiNN: string;
	email: string;
	fromDate: string;
	fullName: string;
	gender: string;
	gttt: string;
	hoKhau: string;
	isMarried: boolean;
	issueDate: string;
	issuesAddress: string;
	job: string;
	mobilePhone: string;
	nationality: string;
	ngayNhapCanh: string;
	otherMarried: string;
	otherQuan: string;
	otherTinh: string;
	otherPhone: string;
	proTitle: string;
	quanHuyen: string;
	soThiThuc: string;
	thuNhap: string;
	tinhTp: string;
	toDate: string;
	marriedChange: boolean;
	purpose?: string;
	ownerBen?: string;

	constructor() {
	}
}

export class OwnerCustomer {
	ownerAcc: boolean;
	ownerExtraCard: boolean;
	ownerSeab: boolean;
	otherOwnerName: string;
	otherOwner: boolean;
	purposeOfTrans: string;

	constructor() {
	}
}


export class OwnerPaymentAcc {
	birthDate: string;
	birthPlace: string;
	coQuan: CoQuan;
	currentAddress: string;
	email: string;
	fullName: string;
	gender: string;
	gttt: string;
	hoKhau: string;
	isMarried: boolean;
	issueDate: string;
	issuesAddress: string;
	mobilePhone: string;
	nationality: string;
	otherMarried: string;
	otherQuan: string;
	otherTinh: string;
	otherPhone: string;
	proTitle: string;
	quanHuyen: string;
	tinhTp: string;

	constructor() {
	}
}

export class BodyUdpateCustomerInfoModel {
	actionT24: string;
	birthday: string;
	coCode: string;
	country: string;
	cusRelationships: CusRelationship[];
	customerAddress: string;
	customerCommunications: CustomerCommunication[];
	customerCurrency: string;
	customerId: string;
	customerName: string;
	district: string;
	employerAddress: string;
	employerName: string;
	employment: string;
	fax: string;
	id: string;
	idenAddress: string;
	idenTimeValue: string;
	identityPapers: IdentityPaper[];
	industry: string;
	industryClass: string;
	industryGroup: string;
	inputter: string;
	isSameIdenAddress: boolean;
	listFile: ListFile[];
	loyalty: string;
	maritalStatus: string;
	national: string;
	noOfDependents: string;
	occupation: string;
	ownCustomer: string;
	ownerBen: string;
	placeOfBirth: string;
	portfolio: string;
	priority: string;
	province: string;
	purpose: string;
	residentNational: string;
	residentStstus: string;
	salaryReq: string;
	securityQuestions: SecurityQuestion[];
	sex: string;
	similarityCoreAi: string;
	stress: string;
	taxId: string;
	timeSlaInputter: string;
	timeUpdate: string;
	title: string;
	questionsOnly?: boolean = false;
}

export class CusRelationship {
	id: string;
	idParent: string;
	idRelate: string;
	relationCustomer: string;
	wasRelatedCustomer: string;
}

export class CustomerCommunication {
	email: string;
	id: string;
	idCustomer: string;
	mobile: string;
	phone: string;
	priority: string;
}

export class IdentityPaper {
	gttt?: string;
	id: string;
	idCustomer: string;
	idenAdress: string;
	idenTime: string;
	idenTimeExpired: string;
	idenType: string;
	organization: string;
}

export class ListFile {
	bucketName: string;
	comboType: string;
	customerId: string;
	fileData: string;
	fileName: string;
	fileType: string;
	folder: string;
	id: string;
	isSignature: boolean;
	note: string;
	trackId: string;
	transactionId: string;
}

export class SecurityQuestion {
	answer: string;
	customerTransId: string;
	productType: string;
	question: string;
}
