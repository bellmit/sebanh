export interface GenderCount {
	Female: number;
}

export interface EmotionCount {
	neutral: number;
}

export interface Id {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export interface HoTen {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export interface Year {
	value: number;
}

export interface Month {
	value: number;
}

export interface Day {
	value: number;
}

export interface Normalized {
	value: string;
	year: Year;
	month: Month;
	day: Day;
	value_unidecode: string;
}

export interface NgaySinh {
	value: string;
	confidence: number;
	normalized: Normalized;
	value_unidecode: string;
}

export interface Normalized2 {
	value: number;
}

export interface GioiTinh {
	value: string;
	normalized: Normalized2;
	confidence: number;
	value_unidecode: string;
}

export interface Year2 {
	value: number;
}

export interface Month2 {
	value: number;
}

export interface Day2 {
	value: number;
}

export interface Normalized3 {
	value: string;
	year: Year2;
	month: Month2;
	day: Day2;
	value_unidecode: string;
}

export interface NgayHetHan {
	value: string;
	confidence: number;
	normalized: Normalized3;
	is_valid: boolean;
	value_unidecode: string;
}

export interface Year3 {
	value: number;
}

export interface Month3 {
	value: number;
}

export interface Day3 {
	value: number;
}

export interface Normalized4 {
	value: string;
	year: Year3;
	month: Month3;
	day: Day3;
	value_unidecode: string;
}

export interface NgayCap {
	value: string;
	confidence: number;
	normalized: Normalized4;
	value_unidecode: string;
}

export interface LoaiHoChieu {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export interface PassportNo {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export interface Normalized5 {
	value: string;
	code: string;
	code2: string;
	value_unidecode: string;
}

export interface QuocTich {
	value: string;
	confidence: number;
	normalized: Normalized5;
	value_unidecode: string;
}

export interface Tinh {
	value: string;
	code: number;
	value_unidecode: string;
}

export interface Huyen {
	value: string;
	code: number;
	value_unidecode: string;
}

export interface Xa {
	value: string;
	code: number;
	value_unidecode: string;
}

export interface Normalized6 {
	value: string;
	tinh: Tinh;
	huyen: Huyen;
	xa: Xa;
	value_unidecode: string;
}

export interface NguyenQuan {
	value: string;
	confidence: number;
	normalized: Normalized6;
	value_unidecode: string;
}

export interface NoiCap {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export interface Normalized7 {
	value: number;
	code: string;
}

export interface ClassName {
	value: string;
	confidence: number;
	normalized: Normalized7;
}

export interface CardFront {
	id: Id;
	ho_ten: HoTen;
	ngay_sinh: NgaySinh;
	gioi_tinh: GioiTinh;
	ngay_het_han: NgayHetHan;
	ngay_cap: NgayCap;
	loai_ho_chieu: LoaiHoChieu;
	passport_no: PassportNo;
	quoc_tich: QuocTich;
	nguyen_quan: NguyenQuan;
	noi_cap: NoiCap;
	class_name: ClassName;
}

export interface Normalized8 {
	value: number;
	code: string;
}

export interface ClassName2 {
	value: string;
	normalized: Normalized8;
	confidence: number;
}

export interface CardBack {
	class_name: ClassName2;
}

export interface Nextgen {
	country: string;
	occupation: string;
	jobTitle: string;
	channel: string;
	ofs1Customer: string;
	salary: string;
	authenType: string;
	email1: string;
	province: string;
	isModified: string;
	inputter: string;
	seabSbSubChannel: string;
	residence: string;
	cardStatus: string;
	legalIssDate: string;
	seabLegalAgree: string;
	legalDocName: string;
	legalIssAuth: string;
	ofs2Account: string;
	seabDistrict1: string;
	otp: string;
	signOnName: string;
	accountId: string;
	servicePackage: string;
	nationality: string;
	accountTitle1: string;
	seabBrokerType: string;
	shortName: string;
	name1: string;
	seabRegStatus: string;
	maritalStatus: string;
	seabPurpose: string;
	gender: string;
	ofs2Customer: string;
	seabSubChannel?: any;
	registerType: string;
	sms1: string;
	coCode: string;
	street: string;
	seabOwnBenefit: string;
	customerId: string;
	currency: string;
	altAcctId?: any;
	address: string;
	legalId: string;
	ofs1Account: string;
	dateOfBirth: string;
	legalHolderName: string;
	transLimit: string;
	rawUserId: string;
	seabBrokerId: string;
	customer?: any;
	employmentStatus?: any;
	taxId?: any;
}

export interface Metadata {
	card_front: CardFront;
	card_back: CardBack;
	card_name: string;
	card_name_unidecode: string;
	card_birthdate: string;
	card_id: string;
	card_nguyen_quan: string;
	card_nguyen_quan_unidecode: string;
	card_nguyen_quan_normalized_unidecode: string;
	card_ho_khau_thuong_tru: string;
	card_ho_khau_thuong_tru_unidecode: string;
	card_ho_khau_thuong_tru_normalized_unidecode: string;
	nextgen: Nextgen;
	version: number;
}

export interface OutputCard {
	user_id: string;
	gender: string;
	gender_count: GenderCount;
	age: number;
	emotion: string;
	emotion_count: EmotionCount;
	card_front_url: string;
	cropped_card_front_url: string;
	card_back_url: string;
	cropped_card_back_url: string;
	general_url: string;
	cropped_general_url: string;
	updated_image: number;
	created: string;
	metadata: Metadata;
	last_updated: string;
	id: string;
	similarity?: any;
}

export interface RootObject {
	output: OutputCard[];
	time: number;
	api_version: string;
	mlchain_version: string;
}


