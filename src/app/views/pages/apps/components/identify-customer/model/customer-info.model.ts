export class CustomerInfoModel {
	public name: string = ''; // ten
	public custId: string = ''; // user id t24
	public cardType: string = ''; // loai giay to tuy than
	public idNumber: string = ''; // so giay to tuy than
	public confidence: string = ''; // do tin cay
	public email: string = '';
	public phone: string = '';
	public address: string = '';
}

export interface CustInfoModel {
	custId: string;
	custName: string;
	birthDate: string;
	legal: string;
	address: string;
	officer: string;
	phone: string;
	email: string;
	coCode: string;
	coName: string;
	sms1: string;
	issueDate: string;
	seabCuSegment: string;
	ebankId: string;
	accountId: string;
	legalDocName: string;
	custCoCode: string;
	custClass: string;
	gender: string;
	legalIssAuth: string;
}

export class IsMatched {
	value: string;
	similarity: number;
	confidence: number;
}

export class EmotionCount {
	neutral: number;
}

export class Id {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export class HoTen {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export class Year {
	value: number;
}

export class Month {
	value: number;
}

export class Day {
	value: number;
}

export class Normalized {
	value: string;
	year: Year;
	month: Month;
	day: Day;
	value_unidecode: string;
}

export class NgaySinh {
	value: string;
	confidence: number;
	normalized: Normalized;
	value_unidecode: string;
}

export class Normalized2 {
	value: number;
}

export class GioiTinh {
	value: string;
	normalized: Normalized2;
	confidence: number;
	value_unidecode: string;
}

export class Year2 {
	value: number;
}

export class Month2 {
	value: number;
}

export class Day2 {
	value: number;
}

export class Normalized3 {
	value: string;
	year: Year2;
	month: Month2;
	day: Day2;
	value_unidecode: string;
}

export class NgayHetHan {
	value: string;
	confidence: number;
	normalized: Normalized3;
	is_valid: boolean;
	value_unidecode: string;
}

export class Year3 {
	value: number;
}

export class Month3 {
	value: number;
}

export class Day3 {
	value: number;
}

export class Normalized4 {
	value: string;
	year: Year3;
	month: Month3;
	day: Day3;
	value_unidecode: string;
}

export class NgayCap {
	value: string;
	confidence: number;
	normalized: Normalized4;
	value_unidecode: string;
}

export class LoaiHoChieu {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export class PassportNo {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export class Normalized5 {
	value: string;
	code: string;
	code2: string;
	value_unidecode: string;
}

export class QuocTich {
	value: string;
	confidence: number;
	normalized: Normalized5;
	value_unidecode: string;
}

export class Tinh {
	value: string;
	code: number;
	value_unidecode: string;
}

export class Huyen {
	value: string;
	code: number;
	value_unidecode: string;
}

export class Xa {
	value: string;
	code: number;
	value_unidecode: string;
}

export class Normalized6 {
	value: string;
	tinh: Tinh;
	huyen: Huyen;
	xa: Xa;
	value_unidecode: string;
}

export class NguyenQuan {
	value: string;
	confidence: number;
	normalized: Normalized6;
	value_unidecode: string;
}

export class NoiCap {
	value: string;
	confidence: number;
	value_unidecode: string;
}

export class Normalized7 {
	value: number;
	code: string;
}

export class ClassName {
	value: string;
	confidence: number;
	normalized: Normalized7;
}

export class CardFront {
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

export class Normalized8 {
	value: number;
	code: string;
}

export class ClassName2 {
	value: string;
	normalized: Normalized8;
	confidence: number;
}

export class CardBack {
	class_name: ClassName2;
}

export class Nextgen {
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

export class Metadata {
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

export class GenderCount {
	Female: number;
}

export class MatchedUser {
	emotion_count: EmotionCount;
	metadata: Metadata;
	last_updated: string;
	cropped_card_front_url: string;
	cropped_card_back_url: string;
	gender: string;
	created: string;
	cropped_general_url: string;
	gender_count: GenderCount;
	emotion: string;
	updated_image: number;
	user_id: string;
	card_front_url: string;
	age: number;
	card_back_url: string;
	general_url: string;
	id: string;
}

export class Metadata2 {
	type: string;
}

export class MatchedFace {
	metadata: Metadata2;
	emotion: string;
	gender: string;
	head_pose: string;
	user_id: string;
	image_url: string;
	created: string;
	confidence: number;
	cropped_url: string;
	raw_user_id: string;
	age: number;
	id: string;
	similarity: number;
}

export class Result {
	is_matched: IsMatched;
	matched_user: MatchedUser;
	matched_faces: MatchedFace[];
}

export class Output {
	bbox: number[];
	confidence: number;
	polys: number[][];
	rotate_angle: number;
	head_pose: string;
	liveness: string;
	angle: number;
	gender: string;
	age: number;
	emotion: string;
	num_face: number;
	result: Result;
}

export class CoreAiInfoModel {
	output: Output[];
	time: number;
	api_version: string;
	mlchain_version: string;
}

