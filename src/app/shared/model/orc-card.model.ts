export interface IOrcCardModel {
	legalId: string; // so gttt
	fullNameVn: string; // ten co dau
	fullNameEn: string; // ten khong dau
	birthDate: string; // ngay sinh
	issueDate: string; // ngay cap
	issueAddress: string; // noi cap
	legalType: string; // loai gttt
	gender: any; // gioi tinh
	ho_khau: string;
	ngay_het_han: string;
	hoKhau: IHoKhauThuongTru;
	// nguyenQuan: INguyenQuanModel;
}

export interface IHoKhauThuongTru {
	value: string;
	tinh: IKhuVucModel;
	huyen: IKhuVucModel;
	xa: IKhuVucModel;
}

export interface INguyenQuanModel {
	value: string;
	tinh: IKhuVucModel;
	huyen: IKhuVucModel;
	xa: IKhuVucModel;
}

export interface IKhuVucModel {
	code: any;
	value: string;
	value_unidecode: string;
}

export interface ICoreAiUserImageModel {
	face: string;
	frontCard: string;
	backCard: string;
	signature: string;
	fingerPrint: string;
}
