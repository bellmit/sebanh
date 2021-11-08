export class ConfigTable {
	// cấu trúc địch dạng title of table: TABLE.nameTable.en
	nameTable: string;
	properties: Property[];
	isNumericalOrder: boolean; // <= hiển thị số thứ tự của bảng
	isBorder?: boolean;
	isMultiSelect?: boolean;
	isScroll?: string;
	isSortByFieldColumn?: boolean;
	isCheckBoxByEachRecord?: boolean;
	isChooseAllRecord?: boolean;
	// Dùng khi hiển thị detail Object
	nameObjectDetail: string;

	backgroundTitleColor?: string;
	titleTextColor?: string;
	isDeleteAndEditAction?: boolean;
	isHighlightTextSelected?: boolean;
	isWrapText?: boolean;
	isPaginator?: boolean;
}

export class Property {
// Tên thuộc tính hiện trên bảng
	fieldName: any;
// Tên các thuộc tính nếu cần ghép chung một cột
	extends?: LangProperty[];
// ẩn column when responsive in mobile screen
	hiddenOnMobile?: boolean;
// xác định vị trí cột hiển thị amount, hiển thị giá trị nếu amount = true
	tail?: LangProperty;
// Độ rộng cột %
	colWidth?: string;
	textColor?: string;
	isLabelColor?: boolean;
}


export class LangProperty {
// Thuộc tính tiếng anh
	en: any;
// thuộc tính tiếng việt nếu có
	vn?: any;
}
export class SortTable {
	property?: string;
	sortIncrease?: boolean;
}
