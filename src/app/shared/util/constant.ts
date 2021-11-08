/**
 * constant for response code
 */
export const APP_TIME_OUT = 'APP_TIME_OUT';
export const CODE_00 = '00';
export const STATUS_OK = 'OK';
export const APP_ID = 'APP_ID';
export const COMMON_ERROR = 'Đã có lỗi xảy ra, vui lòng thử lại';
export const MINIO_LINK = 'MINIO_LINK';
export const NHAN_THE_TAI_DVKD = 'Nhận thẻ tại ĐVKD';

export const HTTP_STATUS = {
	OK: 200
};
export const STATUS_BODY_RES = {
	OK: 'OK',
	FAILE: 'FAILE'
};

export const HAN_MUC_THE = {
	POS: 'pos_r',
	ECOM: 'ecom_r',
	ATM_NOI_DIA: 'trnx',
	ATM_QUOC_TE: 'cw',
};

export const SLA_BUSINESS_GROUP = {
	COMBO: 'COMBO',
	QLSPDV: 'QLSPDV',
	QLTTKH: 'QLTTKH'
};

export const CARD_STATUS = {
	PIN_BLOCKED: '185',
	PICKUP_L41: '74',
	CARD_OK: '14',
	CARD_DO_NOT_HONOR: '98'
};

export const SLA_BUSINESS_DETAIL = {
	OPEN_COMBO1: 'OPEN_COMBO1',
	OPEN_COMBO2: 'OPEN_COMBO2',
	OPEN_COMBO3: 'OPEN_COMBO3',
	ACCOUNT: 'ACCOUNT',
	CARD: 'CARD',
	SEANET: 'SEANET',
	SMS: 'SMS'

};

export const SERVICE_STATUS = {
	OPEN: 'OPEN'
};

export const TYPE_DANH_MUC = {
	FT_COMMISSION_TYPE: 'FT_COMMISSION_TYPE',
	PORTFOLIO: 'PORTFOLIO',
	CAMPAIGN: 'CAMPAIGN'
};

export const CARD_TYPE = {
	SLAVE: 'slave',
	MASTER: 'master'
};

export const CARD_STATUS_NAME = {
	CARD_CLOSE: 'Card Closed',
	CARD_OK: 'Card OK'
};
/**
 * const header and api url
 */
// Const header
export const HEADER_ACC_UTIL = 'HEADER_ACC_UTIL';
export const HEADER_LOGIN = 'HEADER_LOGIN';
export const HEADER_SEATELLER = 'HEADER_SEATELLER';
export const HEADER_UTILITY = 'HEADER_UTILITY';
export const HEADER_EBANK = 'HEADER_EBANK';
export const HEADER_PERMISSION = 'HEADER_PERMISSION';
export const HEADER_API_CARD = 'HEADER_API_CARD';
export const HEADER_API_CARD_TOKEN = 'HEADER_API_CARD_TOKEN';
export const HEADER_API_CARD_ODCPE = 'HEADER_API_CARD_ODCPE';
export const HEADER_API_ADMIN_MANAGER = 'HEADER_API_ADMIN_MANAGER';
export const HEADER_SEA_PAY_ACCOUNT = 'HEADER_SEA_PAY_ACCOUNT';
export const HEADER_API_T24_ENQUIRY = 'HEADER_API_T24_ENQUIRY';
export const HEADER_API_REPORT = 'HEADER_API_REPORT';
export const HEADER_API_ACCOUNT = 'HEADER_API_ACCOUNT';
export const HEADER_API_REG_SMS = 'HEADER_API_REG_SMS';
export const HEADER_API_USERMAN = 'HEADER_API_USERMAN';
export const HEADER_API_CORE_AI = 'HEADER_API_CORE_AI';
export const HEADER_API_STATEMENT = 'HEADER_API_STATEMENT';
// const api url

export const SERVER_API_SAO_KE = 'SERVER_API_SAO_KE';
export const SERVER_API_URL_ACC_UTIL = 'SERVER_API_URL_ACC_UTIL';
export const SERVER_API_ACCOUNT = 'SERVER_API_ACCOUNT';
export const SEVER_API_URL_LOGIN = 'SEVER_API_URL_LOGIN';
export const SEVER_API_URL_SEATELLER = 'SEVER_API_URL_SEATELLER';
export const SEVER_API_URL_UTILITY = 'SERVER_API_URL_UTILITY';
export const SEVER_API_URL_E_BANK = 'SEVER_API_URL_E_BANK';
export const SEVER_API_URL_CARD = 'SEVER_API_URL_CARD';
export const SEVER_API_URL_CARD_ENQUIRY = 'SEVER_API_URL_CARD_ENQUIRY';
export const SEVER_API_URL_CARD_ENQUIRY_OPDCE = 'SEVER_API_URL_CARD_ENQUIRY_OPDCE';
export const SEVER_API_URL_PERMISSION = 'SEVER_API_URL_PERMISSION';
export const SERVER_API_REG_SMS = 'SERVER_API_REG_SMS';
export const SERVER_API_USERMAN = 'SERVER_API_USERMAN';
export const SERVER_API_URL_CORE_AI = 'SERVER_API_URL_CORE_AI';
export const SEVER_API_URL_ADMIN_MANAGER = 'SEVER_API_URL_ADMIN_MANAGER';
export const SERVER_SEA_PAY_ACCOUNT_URL = 'SERVER_SEA_PAY_ACCOUNT_URL';
export const SEVER_API_T24_ENQUIRY = 'SEVER_API_T24_ENQUIRY';
export const SEVER_API_REPORT = 'SEVER_API_REPORT';
export const CORE_AI_MINIO_LINK = 'CORE_AI_MINIO_LINK';
export const GET_CUSTOMER_INFO_BY_ID = 'GET_CUSTOMER_INFO_BY_ID';
export const GET_USER_BY_USER_ID_AI_DPW = 'GET_USER_BY_USER_ID_AI_DPW';
export const GET_USER_BY_FACE_AI_DPW = 'GET_USER_BY_FACE_AI_DPW';
export const GET_USER_BY_ID_CARD_DPW = 'GET_USER_BY_ID_CARD_DPW';
export const GET_USER_BY_FINGER_PRINT_DPW = 'GET_USER_BY_FINGER_PRINT_DPW';
export const CHECK_MATCH_CARD_GENERAL_DPW = 'CHECK_MATCH_CARD_GENERAL_DPW';
export const PREDICT_IDENTITY = 'PREDICT_IDENTITY';
export const SERVER_API_CUST_INFO = 'SERVER_API_CUST_INFO';
export const SERVER_API_URL_VERIFY_SIGNATURE = 'SERVER_API_URL_VERIFY_SIGNATURE';
export const CHATBOT_URL = 'CHATBOT_URL';
/**
 * const
 */
export const CODE_OK = '00';
export const USER_PROFILE = 'userProfile';
export const USER_PERMISSION = 'userPermission';
export const GET_ENQUIRY = 'GET_ENQUIRY';
export const GET_REPORT = 'GET_REPORT';
export const GET_TRANSACTION = 'GET_TRANSACTION';
export const AUTH_DATA = 'AUTH_DATA';
/**
 * constant for cache
 */
// cache permission
export const MAP_USER_MATRIX_CACHE = 'user_matrix_cache';
export const PERMISSION_CACHE = 'user_permission_cache';
export const CACHE_CO_CODE = 'cache_co_code';
export const CACHE_TIME_T24 = 'cache_time_t24';
export const CO_CODE_LIST = 'co_code_list';
export const USERNAME_CACHED = 'username';
export const DATA_FROM_DASHBOARD = 'dashboardData';
export const DATA_SAVE_FROM_DASHBOARD = 'dashboardSavedData';
export const LIST_GROUP_WITH_NAME = 'list_group_with_name';
export const LIST_GROUP_WITHOUT_NAME = 'list_group';
export const LIST_USER_GROUP_SEATELLER = 'list_user_group_seATeller';
export const LIST_SLA_BY_USER_GROUP = 'list_sla_user_group';
export const LIST_ADMIN_NOTFICATION = 'teller_admin_notify_cache';
export const SEATELLER_DB = {
	name: 'seatellerDb',
	schema: {
		name: 'readNotify',
		key_user: 'user',
		key_notif_id: 'notifyId'
	},
	schemaQuickAction: {
		name: 'quickAction',
		key_user: 'user',
		key_action: 'actions'
	}
};

export const SEAPAY_ACCOUNT_AUTHEN_TYPE = {
	QUERY_NICE_ACCOUNT_INFO: 'getNiceAcctId',
	QUERY_VIP_ACCOUNT_INFO: 'getVipNiceAc'
};

export const CHARGE_BUSINESS_TYPE = {
	ACCOUNT_BALANCE: 'ACCOUNT_BALANCE',
	ACCOUNT_COMBO: 'ACCOUNT_COMBO',
	CLOSE_CARD: 'CLOSE_CARD',
	EXTEND_CARD: 'EXTEND_CARD',
	RELEASE_CARD: 'RELEASE_CARD',
	STATEMENT: 'STATEMENT'
};


export const USER_GROUP = 'user_group_branch_';

/**
 *Constant for authentication type
 */
export const AUTHEN_EBANK_INFO = 'getEbankInfor';
export const CREATE_COMBO = 'createCombo';
export const UPDATE_COMBO = 'updateCombo';
export const APPROVE_COMBO = 'approveCombo';
export const REJECT_COMBO = 'rejectCombo';
export const REJECT_CARD = 'rejectCard';
export const CARD_INSERT = 'createActionCard';
export const CARD_UPDATE = 'updateActionCard';
// export const CARD_DELETE = 'deleteDataActionCard';
export const CARD_GET_DETAIL = 'getActionCardDataDetail';
export const SMS_GET_LIST = 'getCustomerSmsReg-3';
export const APPROVE_CARD = 'approveCard';
export const ADD_NOTIFICATION = 'addNotification';
export const GET_ALL_NOTIFICATION = 'getUserNotification';
export const UPDATE_NOTIFICATION = 'updateNotification';
export const GET_LIST_PRODUCT = 'GetListProduct';
export const GET_LIST_ERROR = 'GetListError';
export const GET_LIST_FILES = 'getFilesByCustomerId';
export const UPDATE_SIGNATURE = 'updateSignature';
export const UPLOAD_MULTIPLE_FILE = 'uploadMultipleFile';
export const DELETE_MULTIPLE_FILE = 'deleteFile';
export const FIND_COMBO_BY_ID = 'findComboById';
export const NOTIFICATION = {
	INPUTTER: 'Bản ghi {0} {1} gửi duyệt',
	APPROVED: 'Bản ghi {0} {1} duyệt thành công',
	APPROVED_ERROR: 'Bản ghi {0} {1} duyệt không thành công',
	APPROVED_COMBO: 'Bản ghi {0} {1} đã duyệt - chờ xử lý',
	APPROVE_CANCEL: 'Bản ghi {0} {1} từ chối duyệt',
	PRODUCT_TYPE: {
		COMBO1: 'COMBO1',
		COMBO2: 'COMBO2',
		COMBO3: 'COMBO3',
		EX_COMBO1: 'EX_COMBO1',
		EX_COMBO2: 'EX_COMBO2',
		EX_COMBO3: 'EX_COMBO3',
		CUSTOMER_MANAGER: 'CUSTOMER_MANAGER',
		SUPPER: 'SUPPER',
		SEANET: 'SEANET',
		ACCOUNT: 'ACCOUNT',
		CARD: 'CARD',
		SMS: 'SMS',
		BALANCE: 'BALANCE',
		STATEMENT: 'STATEMENT'
	},
	NAVIGATE_TYPE: {
		COMBO1: '/pages/combo1',
		COMBO2: '/pages/combo2',
		COMBO3: '/pages/combo3',
		EX_COMBO1: '/pages/ex-combo1',
		EX_COMBO2: '/pages/ex-combo2',
		EX_COMBO3: '/pages/ex-combo3',
		CUSTOMER_MANAGER: '/pages/customer-manage',
		SUPPER: '/pages/super',
		SEANET: '/pages/e-bank',
		ACCOUNT: '/pages/account',
		CARD: '/pages/card',
		SMS: '/pages/sms'
	},
	AUTHEN_TYPE: {
		COMBO1: 'findComboById',
		COMBO2: 'findComboById',
		COMBO3: 'findComboById',
		EX_COMBO1: 'findComboById',
		EX_COMBO2: 'findComboById',
		EX_COMBO3: 'findComboById',
		CUSTOMER_MANAGER: 'findCustomerById',
		SUPPER: 'findComboById',
		SEANET: 'findEBankById',
		ACCOUNT: 'findAccountById',
		CARD: 'findCardById',
		SMS: 'findSmsById'
	},
	IS_UPDATE: {
		CUSTOMER_MANAGER: 'isUpdateCus$',
		ACCOUNT: 'isUpdateAccount$',
		SMS: 'isUpdateSMS$',
		COMBO1: 'isUpdateCombo$',
		COMBO2: 'isUpdateCombo$',
		COMBO3: 'isUpdateCombo$',
		COMBO1_EX: 'isUpdateCombo$',
		COMBO2_EX: 'isUpdateCombo$',
		COMBO3_EX: 'isUpdateCombo$'
	}
};

export const AU_THEN_TYPE = {
	E_BANK: {
		APPROVE: 'approveEBank',
		UPDATE_INFO: 'createEBank',
		EDIT_UPDATE_INFO: 'updateEBank',
		RESET_PASSWORD: 'resetMk',
		LOCK_UNlOCK_EB: 'lockUnlock',
		UPDATE_RECORD_RESET_PASSWORD: 'updateResetMk',
		UPDATE_RECORD_LOCK_UNlOCK_EB: 'updateLockUnlock',
		DELETE: 'deleteEBank',
		REJECT: 'rejectEBank'
	},

	CARD: {
		APPROVE: 'approveCard',
		UPDATE_INFO: 'createCard',
		EDIT_UPDATE_INFO: 'updateCard',
		DELETE: 'deleteCard',
		REJECT: 'rejectCard',
	},

	ACCOUNT: {
		APPROVE: 'approveAccount',
		UPDATE_INFO: 'createAccount',
		EDIT_UPDATE_INFO: 'updateAccount',
		DELETE: 'deleteAccount',
		REJECT: 'rejectAccount'
	}
};

export const ACTION_T24 = {
	LOCK_EBANK: 'LOCK_EB',
	UN_LOCK_EBANK: 'UNLOCK_EB',
	APPROVE: 'APPROVED',
	DELETED: 'DELETED',
	RESET_PASSWORD: 'RESET_PW',
	UPDATE_CUSTOMER_INFO: 'UPDATE_CUSTOMER_INFO',
	UPDATE_PROSPECT_ID: 'UPDATE_PROSPECT_ID',
	UPDATE_SIGNATURE: 'UPDATE_SIGNATURE',
};

export const ROLE_APPLICATION = {
	INPUTTER: 'I',
	AUTHORISER: 'A'
};

/**
 *Constant for priority
 */
export const PRIMARY = 'PRIMARY';
export const HIGH = 'HIGH';

/**
 *Constant for action T24
 */
export const UPDATE = 'UPDATE';
export const UPDATE_EBANK_INFO = 'UPDATE_EBANK_INFO';
export const UPDATE_ACCOUNT_INFO = 'UPDATE_ACCOUNT_INFO';
export const CREATE = 'CREATE';
export const INSERT_UPDATE_SMS_EXISTED = 'INSERT_UPDATE_SMS_EXISTED';
export const EBANK_UNLOCK = 'UNLOCK_EB';
export const EBANK_LOCK = 'LOCK_EB';
export const EBANK_RESET_PASSWORD = 'RESET_PW';
export const EBANK_CREATE = 'createEBank';
export const EBANK_RESET_LOCK = 'resetLockUnlockEBank';
export const ACCOUNT_LOCK = 'LOCK_ACC';
export const EDIT_LOCK_DOWN_ACCOUNT = 'EDIT_LOCK_DOWN_ACCOUNT';
export const UNLOCK_DOWN_ACCOUNT = 'UNLOCK_DOWN_ACCOUNT';
export const CLOSE_ACCOUNT = 'CLOSE_ACC';
export const ACCOUNT_RESTORE = 'RESTORE_CLOSED_ACCOUNT';
export const ACCOUNT_SETUP_INTEREST = 'SETUP_RATE';
export const ACCOUNT_SETUP_WARNING = 'SETUP_WANING';
export const APPROVE = 'APPROVED';
export const PENDING = 'PENDING';
export const DELETED = 'DELETED';
export const APPROVED_SUCCESS = 'APPROVED_SUCCESS';
export const APPROVED_ERROR = 'APPROVED_ERROR';
export const ACTIVE_CARD: string = 'ACTIVE_CARD';
export const LOCK_CARD = 'CLOSE_CARD';
export const UPDATE_STATUS = 'UPDATE_STATUS';
export const UPDATE_TRANS_LIMIT = 'UPDATE_TRANS_LIMIT';
export const UPDATE_INFO = 'UPDATE_INFO';
export const RESET_PIN_CARD_SERCURE = 'RESET_PIN_CARD_SERCURE';
export const RELEASE_CARD_PIN = 'RELEASE_CARD_PIN';
export const EXTEND_CARD = 'EXTEND_CARD';
export const MAIN_CARD_VERSION = 'SEAB.MAIN.CARD,IND.';
export const SUB_CARD_VERSION = 'SEAB.SUB.CARD,IND.';

/**
 *Constant for account rate method
 */
export const ACCOUNT_RATE_METHOD_LEVEL = 'level';
export const ACCOUNT_RATE_METHOD_BAND = 'band';

/**
 *Constant for combo type
 */
export const COMBO_TYPE_ONE = 'COMBO1';
export const COMBO_TYPE_TWO = 'COMBO2';
export const COMBO_TYPE_THREE = 'COMBO3';
/**
 * Constant for core ai
 */
export const SECURITY_KEY_CORE_AI = 'SECURITY_KEY_CORE_AI';
export const TYPE_CORE_AI_FACE = 'FACE';
export const TYPE_CORE_AI_CARD = 'CARD';

/**
 * Constant for link CoreAI
 */
export const PROSPECT_KEY = 'UNK';
export const PROSPECT_VALUE = 'PRO';

/**
 * Constant for error CoreAI
 */
export const GTTT_KHAC_GTTT_DA_DANG_KY = 'Cảnh báo: GTTT khác GTTT đã đăng ký';
export const ID_THEO_GTTT_KHAC_ID_THEO_KHUON_MAT = 'ID Khách hàng theo GTTT khác ID Khách hàng theo nhận diện khuôn mặt';
export const VAN_TAY_KHONG_KHOP_VOI_KHUON_MAT_VA_GTTT = 'Cảnh báo: Vân tay không khớp với ID theo nhận diện khuôn mặt và GTTT';
export const KHACH_HANG_CHUA_DANG_KY_VAN_TAY = 'Khách hàng chưa đăng ký vân tay';
export const KHACH_HANG_CHUA_DANG_KY_KHUON_MAT = 'KH chưa được đăng ký khuôn mặt';
export const GTTT_KHONG_KHOP_KIEM_TRA_LAI_HOAC_CAP_NHAT = 'Cảnh báo: GTTT không khớp kiểm tra lại hoặc cập nhật lại GTTT';
export const KHUON_MAT_VA_GTTT_KHONG_KHOP = 'Cảnh báo: Khuôn mặt KH và khuôn mặt trên GTTT không khớp';
export const KHONG_NHAN_DIEN_DUOC_ID_KH_HOP_LE = 'Cảnh báo: Không nhận diện được ID Khách hàng hơp lệ, vân tay không khớp với ID theo nhận diện khuôn mặt và GTTT';
export const KH_CHUA_DANG_KY_VAN_TAY = 'KH chưa đăng ký vân tay';
export const VAN_TAY_KHONG_KHOP_ID_KHUON_MAT_VA_GTTT = 'Cảnh báo: Vân tay KH không khớp với ID nhận diện từ khuôn mặt và GTTT';
export const ID_GTTT_VA_KHUON_MA_CHUA_KHOP_DUNG = 'ID GTTT và khuôn mặt chưa khớp đúng';
export const KH_CHUA_DUOC_DANG_KY_KHUON_MAT = 'KH chưa được đăng ký khuôn mặt';
export const GTTT_KHAC_GTTT_DANG_KY_ID_KH = 'Cảnh báo: GTTT khác GTTT đăng ký ID KH';
export const KH_CHUA_DUOC_DANG_KY_KHUON_MAT_VA_GTTT = 'KH chưa được đăng ký khuôn mặt và GTTT';
export const VAN_TAY_CUA_KH_CHUA_DUOC_DANG_KY_VOI_ID = 'Cảnh báo: Vân tay của KH chưa được đăng ký với ID';


export const TYPE_RANDOM_TRANSACTION_ID = {

	COMBO1: 'combo1',

	COMBO2: 'combo2',

	COMBO3: 'combo3',

	SUPPER: 'super',

	E_BANK: 'ebank',

	ACCOUNT: 'account',

	CARD: 'card',

	SMS: 'sms',
};


/**
 * Constant for list select box
 */
export const EMPLOYMENTLIST = [
	{
		value: 'KHONGCOTHONGTIN',
		nameVi: 'khong co thong tin',
		nameEn: 'khong co thong tin'
	}];

export const OCCUPATIONLIST = [
	{
		value: 'Khong ap dung',
		nameVi: 'Khong ap dung',
		nameEn: 'Khong ap dung'
	}
];

export const TITLE = ['DR', 'MRS', 'MS', 'MISS', 'MR'];
export const MARITAL_STATUS = [
	{
		value: 'SINGLE',
		nameVi: 'Chưa kết hôn',
		nameEn: 'Single'
	},
	{
		value: 'MARRIED',
		nameVi: 'Đã kết hôn',
		nameEn: 'Married'
	},
	{
		value: 'DIVORCE',
		nameVi: 'Ly hôn',
		nameEn: 'Divorce'
	},
	{
		value: 'SEPARATED',
		nameVi: 'Ly thân',
		nameEn: 'Separated'
	},
	{
		value: 'WIDOWED',
		nameVi: 'Đang hẹn hò',
		nameEn: 'Widowed'
	},
];

export const PURPOSE_LIST = [
	{
		value: 'DAILY BANKING',
		nameVi: 'Giao dịch hàng ngày',
		nameEn: 'Daily banking'
	},
	{
		value: 'BORROW',
		nameVi: 'Vay tiền',
		nameEn: 'Borrow'
	},
	{
		value: 'FOREX TRADING',
		nameVi: 'Kinh doanh ngoại hối',
		nameEn: 'Forex trading'
	},
	{
		value: 'SAVING-INVEST',
		nameVi: 'Tiết kiệm - Đầu tư',
		nameEn: 'Saving - Invest'
	},
	{
		value: 'TRADE.FINANCE',
		nameVi: 'Thương mại - Tài chính',
		nameEn: 'Trade - Finance'
	},
	{
		value: 'OTHER',
		nameVi: 'Khác',
		nameEn: 'Other'
	},
];

export const RESIDENT_STATUS_LIST = [
	{
		value: 'YES',
		nameVi: 'Có',
		nameEn: 'Yes'
	},
	{
		value: 'NO',
		nameVi: 'Không',
		nameEn: 'No'
	}
];

export const OWNER_BENEFIT = [
	{
		value: '1.CHU TAI KHOAN',
		nameVi: 'Chủ tài khoản',
		nameEn: 'Chủ tài khoản'
	},
	{
		value: '1.DONG SO HUU',
		nameVi: 'Đồng sở hữu',
		nameEn: 'Đồng sở hữu'
	},
	{
		value: '2.CHU TICH',
		nameVi: 'Chủ tịch',
		nameEn: 'Chủ tịch'
	},
	{
		value: '2.GIAM DOC',
		nameVi: 'Giám đốc',
		nameEn: 'Giám đốc'
	},
	{
		value: '2.PHO CHU TICH',
		nameVi: 'Phó chủ tịch',
		nameEn: 'Phó chủ tịch'
	},
	{
		value: '2.PHO GIAM DOC',
		nameVi: 'Phó giám đốc',
		nameEn: 'Phó giám đốc'
	},
	{
		value: 'KHAC',
		nameVi: 'Khác',
		nameEn: 'Khác'
	},
];

export const IDENTIFICATION = [
	{
		value: 'BLX',
		nameVi: 'Bằng lái xe',
		nameEn: 'Driver license'
	},
	{
		value: 'CMND',
		nameVi: 'Chứng minh nhân dân',
		nameEn: 'Chứng minh nhân dân'
	},
	{
		value: 'CMNDCA',
		nameVi: 'CMNDCA',
		nameEn: 'CMNDCA'
	},
	{
		value: 'CMNDNG',
		nameVi: 'CMNDNG',
		nameEn: 'CMNDNG'
	},
	{
		value: 'CMNDQĐ',
		nameVi: 'CMNDQĐ',
		nameEn: 'CMNDQĐ'
	},
	{
		value: 'DKKD',
		nameVi: 'DKKD',
		nameEn: 'DKKD'
	},
	{
		value: 'GKS',
		nameVi: 'GKS',
		nameEn: 'GKS'
	},
	{
		value: 'GPTL',
		nameVi: 'GPTL',
		nameEn: 'GPTL'
	},
	{
		value: 'HDLIENDANH',
		nameVi: 'HDLIENDANH',
		nameEn: 'HDLIENDANH'
	},
	{
		value: 'OTHER',
		nameVi: 'OTHER',
		nameEn: 'OTHER'
	},
	{
		value: 'PP',
		nameVi: 'PP',
		nameEn: 'PP'
	},
	{
		value: 'SWIFT',
		nameVi: 'SWIFT',
		nameEn: 'SWIFT'
	},
	{
		value: 'TCC',
		nameVi: 'TCC',
		nameEn: 'TCC'
	},
	{
		value: 'VISA',
		nameVi: 'VISA',
		nameEn: 'VISA'
	},
];

export const RELATE_LIST = [
	{
		value: '5',
		nameVi: '5',
		nameEn: '5'
	},
	{
		value: '1',
		nameVi: 'HEAD OFFICE',
		nameEn: 'HEAD OFFICE'
	},
	{
		value: '10',
		nameVi: 'BRANCH',
		nameEn: 'BRANCH'
	},
	{
		value: '2',
		nameVi: 'SISTER COMPANY',
		nameEn: 'SISTER COMPANY'
	},
	{
		value: '3',
		nameVi: 'SPOUSE',
		nameEn: 'SPOUSE'
	},
	{
		value: '4',
		nameVi: 'AKIN TO',
		nameEn: 'AKIN TO'
	},

	{
		value: '6',
		nameVi: 'SIBLING',
		nameEn: 'SIBLING'
	},

	{
		value: '9',
		nameVi: 'SAME OWNER',
		nameEn: 'SAME OWNER'
	},
];


export const QUESTION = [
	{
		value: 'Nơi sinh của anh/chị ở đâu?',
		nameVi: 'Nơi sinh của anh/chị ở đâu?',
		nameEn: 'Nơi sinh của anh/chị ở đâu?'
	},
	{
		value: 'Tên trường tiểu học đầu tiên của anh/chị?',
		nameVi: 'Tên trường tiểu học đầu tiên của anh/chị?',
		nameEn: 'Tên trường tiểu học đầu tiên của anh/chị?'
	},
	{
		value: 'Tên bố/mẹ của anh/chị là gì?',
		nameVi: 'Tên bố/mẹ của anh/chị là gì?',
		nameEn: 'Tên bố/mẹ của anh/chị là gì?'
	}

];

export const NATIONALITIES = [
	{
		value: 'AD',
		nameVi: 'Andorra',
		nameEn: 'Andorra'
	},
	{
		value: 'AU',
		nameVi: 'Australia',
		nameEn: 'Australia'
	},
	{
		value: 'BD',
		nameVi: 'Bangladesh',
		nameEn: 'Bangladesh'
	},
	{
		value: 'BR',
		nameVi: 'Brazil',
		nameEn: 'Brazil'
	},
	{
		value: 'EU',
		nameVi: 'EUR Countries',
		nameEn: 'EUR Countries'
	},
	{
		value: 'FR',
		nameVi: 'France',
		nameEn: 'France'
	},
	{
		value: 'JP',
		nameVi: 'Japan',
		nameEn: 'Japan'
	},
	{
		value: 'KR',
		nameVi: 'Korea, Rep. of',
		nameEn: 'Korea, Rep. of'
	},
	{
		value: 'US',
		nameVi: 'USA',
		nameEn: 'USA'
	},
	{
		value: 'VN',
		nameVi: 'Vietnam',
		nameEn: 'Vietnam'
	},
	{
		value: 'YE',
		nameVi: 'Yemen',
		nameEn: 'Yemen'
	},

];

export const PRIORITY = [
	{
		value: 'PRIMARY',
		nameVi: 'PRIMARY',
		nameEn: 'PRIMARY'
	},
	{
		value: 'SECONDARY',
		nameVi: 'SECONDARY',
		nameEn: 'SECONDARY'
	},
	{
		value: 'OFFICE',
		nameVi: 'OFFICE',
		nameEn: 'OFFICE'
	},
];

export const CAREER_GROUP = [
	{
		value: 'CHUCUAHANGTUDOANH',
		nameVi: 'CHUCUAHANGTUDOANH',
		nameEn: 'CHUCUAHANGTUDOANH'
	},
	{
		value: 'DICHVUNGHENGHIEP',
		nameVi: 'DICHVUNGHENGHIEP',
		nameEn: 'DICHVUNGHENGHIEP'
	},
	{
		value: 'KHONGCOTHONGTIN',
		nameVi: 'KHONGCOTHONGTIN',
		nameEn: 'KHONGCOTHONGTIN'
	},
	{
		value: 'LANHDAO.QUANLY.CQNN',
		nameVi: 'LANHDAO.QUANLY.CQNN',
		nameEn: 'LANHDAO.QUANLY.CQNN'
	},
	{
		value: 'LAODONG',
		nameVi: 'LAODONG',
		nameEn: 'LAODONG'
	},
	{
		value: 'NGHIHUU',
		nameVi: 'NGHIHUU',
		nameEn: 'NGHIHUU'
	},
	{
		value: 'NGUOIKHONGCOVIECLAMKHAC',
		nameVi: 'NGUOIKHONGCOVIECLAMKHAC',
		nameEn: 'NGUOIKHONGCOVIECLAMKHAC'
	},
	{
		value: 'NHANVIEN',
		nameVi: 'NHANVIEN',
		nameEn: 'NHANVIEN'
	},
	{
		value: 'NONGDANTUDOANH',
		nameVi: 'NONGDANTUDOANH',
		nameEn: 'NONGDANTUDOANH'
	},
	{
		value: 'THOTHUCONGTUDOANH',
		nameVi: 'THOTHUCONGTUDOANH',
		nameEn: 'THOTHUCONGTUDOANH'
	},
	{
		value: 'THUKYKYTHUATVIEN',
		nameVi: 'THUKYKYTHUATVIEN',
		nameEn: 'THUKYKYTHUATVIEN'
	},
];

export const LOYALTY = [
	{
		value: '1',
		nameVi: '1',
		nameEn: '1'
	},
	{
		value: '2',
		nameVi: '2',
		nameEn: '2'
	},
	{
		value: '3',
		nameVi: '3',
		nameEn: '3'
	},
];

export const FAKE_USER_ID = [
	{
		value: '13775074',
	},
	{
		value: '13775075',
	},
	{
		value: '13775076',
	}
];

export const FAKE_USER_NAME = [
	{
		value: 'NHUNGNH3',
	},
	{
		value: 'NHUNGNH4',
	},
	{
		value: 'NHUNGNH5',
	}
];


export const DATE_IN_WEEK = [
	{
		value: 'MONDAY',
		name: 'MONDAY'
	},
	{
		value: 'TUESDAY',
		name: 'TUESDAY'
	},
	{
		value: 'WEDNESDAY',
		name: 'WEDNESDAY'
	},
	{
		value: 'THURSDAY',
		name: 'THURSDAY'
	},
	{
		value: 'FRIDAY',
		name: 'FRIDAY'
	},
	{
		value: 'SATURDAY',
		name: 'SATURDAY'
	},
	{
		value: 'SUNDAY',
		name: 'SUNDAY'
	}
];

export const SALE_LIST = [
	{
		value: 'ACRO.IND',
		nameVi: 'ACRO.IND',
		nameEn: 'ACRO.IND'
	},
	{
		value: 'CALLCENTER.CSKH',
		nameVi: 'CALLCENTER.CSKH',
		nameEn: 'CALLCENTER.CSKH'
	},
	{
		value: 'CALLCENTER.TELESALES',
		nameVi: 'CALLCENTER.TELESALES',
		nameEn: 'CALLCENTER.TELESALES'
	},
	{
		value: 'CRO.IND',
		nameVi: 'CRO.IND',
		nameEn: 'CRO.IND'
	},
	{
		value: 'CRO.IND.HO',
		nameVi: 'CRO.IND.HO',
		nameEn: 'CRO.IND.HO'
	},
	{
		value: 'CRO.SME',
		nameVi: 'CRO.SME',
		nameEn: 'CRO.SME'
	},
	{
		value: 'CSO.IND',
		nameVi: 'CSO.IND',
		nameEn: 'CSO.IND'
	},
	{
		value: 'RM',
		nameVi: 'RM',
		nameEn: 'RM'
	},
	{
		value: 'TELLER',
		nameVi: 'TELLER',
		nameEn: 'TELLER'
	},
	{
		value: 'VCRO',
		nameVi: 'VCRO',
		nameEn: 'VCRO'
	},
];

export const BROKER_TYPE = [
	{
		value: 'CONGTACVIEN',
		nameVi: 'CONGTACVIEN',
		nameEn: 'CONGTACVIEN'
	},
	{
		value: 'DOITACLIENKET',
		nameVi: 'DOITACLIENKET',
		nameEn: 'DOITACLIENKET'
	},
	{
		value: 'KHACHHANG',
		nameVi: 'KHACHHANG',
		nameEn: 'KHACHHANG'
	},
	{
		value: 'NHANVIEN',
		nameVi: 'NHANVIEN',
		nameEn: 'NHANVIEN'
	},
	{
		value: '1599',
		nameVi: '1599',
		nameEn: '1599'
	},
];

export const CAMPAIGN = [
	{
		value: '1',
		nameVi: '1',
		nameEn: '1'
	},
	{
		value: '2',
		nameVi: '2',
		nameEn: '2'
	},
];

export const SALE_ID = [
	{
		value: '14158072',
		nameVi: '14158072',
		nameEn: '14158072'
	},
];

export const PROMOTION = [
	{
		value: 'SEANET-12T-20100608',
		nameVi: 'SEANET-12T-20100608',
		nameEn: 'SEANET-12T-20100608'
	},
	{
		value: 'SEANET-12T-20100531',
		nameVi: 'SEANET-12T-20100531',
		nameEn: 'SEANET-12T-20100531'
	},
	{
		value: '20100531',
		nameVi: '20100531',
		nameEn: '20100531'
	},
];

export const SERVICE = [
	{
		value: 'CC.SEABANK',
		nameVi: 'CC.SEABANK',
		nameEn: 'CC.SEABANK'
	},
	{
		value: 'EMAIL.SD',
		nameVi: 'EMAIL.SD',
		nameEn: 'EMAIL.SD'
	},
	{
		value: 'IB.SEABANK',
		nameVi: 'IB.SEABANK',
		nameEn: 'IB.SEABANK'
	},
];

export const SERVICE_EBANK_CODE = [
	{
		value: 'MB.SEABANK',
		nameVi: 'MB.SEABANK',
		nameEn: 'MB.SEABANK'
	},
	{
		value: 'CC.SEABANK',
		nameVi: 'CC.SEABANK',
		nameEn: 'CC.SEABANK'
	},
	{
		value: 'IB.SEABANK',
		nameVi: 'IB.SEABANK',
		nameEn: 'IB.SEABANK'
	},
];

export const LIMIT = [
	{
		value: '50000000',
		nameVi: '50,000000',
		nameEn: '50,000000',
	},
	{
		value: '100000000',
		nameVi: '100,000,000',
		nameEn: '100,000,000',
	},
	{
		value: '200000000',
		nameVi: '200,000,000',
		nameEn: '200,000,000',
	},
	{
		value: '300000000',
		nameVi: '300,000,000',
		nameEn: '300,000,000',
	},
	{
		value: '500000000',
		nameVi: '500,000,000',
		nameEn: '500,000,000',
	},
];

export const CARD_VERSION = [
	{
		value: 'SEAB.MAIN.CARD,IND.SVCC'
	},
	{
		value: 'SEAB.MAIN.CARD,IND.VSSC'
	},
	{
		value: 'SEAB.MAIN.CARD,IND.VSSG'
	},
	{
		value: 'SEAB.MAIN.CARD,IND.VSSL'
	},
	{
		value: 'SEAB.MAIN.CARD,IND.VSSP'
	},
	{
		value: 'SEAB.MAIN.CARD,IND.VSSR'
	},
	{
		value: 'SEAB.MAIN.CARD,IND.VSSN'
	},
];


export const CARD_TYPE_NOI_DIA = [
	{
		value: 'SVCC',
		nameVi: 'SVCC',
		nameEn: 'SVCC'
	}
];

export const CARD_TYPE_QUOC_TE = [
	{
		value: 'VSSC',
		nameVi: 'VSSC',
		nameEn: 'VSSC'
	},
	{
		value: 'VSSG',
		nameVi: 'VSSG',
		nameEn: 'VSSG'
	},
	{
		value: 'VSSL',
		nameVi: 'VSSL',
		nameEn: 'VSSL'
	},
	{
		value: 'VSSP',
		nameVi: 'VSSP',
		nameEn: 'VSSP'
	},
	{
		value: 'VSSR',
		nameVi: 'VSSR',
		nameEn: 'VSSR'
	},
	{
		value: 'VSSN',
		nameVi: 'VSSN',
		nameEn: 'VSSN'
	},
];

export const DEBIT_LEVEL_LIST = [
	{
		value: 'Toàn phần',
		nameVi: 'Toàn phần',
		nameEn: 'Toàn phần'
	},
	{
		value: 'Tối thiểu',
		nameVi: 'Tối thiểu',
		nameEn: 'Tối thiểu'
	},
	{
		value: 'Không',
		nameVi: 'Không',
		nameEn: 'Không'
	},
];


export const ECOM_REGISTER_LIST = [
	{
		value: 'YES',
		nameVi: 'YES',
		nameEn: 'YES'
	},
	{
		value: 'NO',
		nameVi: 'NO',
		nameEn: 'NO'
	}
];

export const REASON_CARD_LIST = [
	{
		value: 'KH làm mất thẻ',
		nameVi: 'KH làm mất thẻ',
		nameEn: 'KH làm mất thẻ'
	},
	{
		value: 'KH yêu cầu khóa thẻ tạm thời',
		nameVi: 'KH yêu cầu khóa thẻ tạm thời',
		nameEn: 'KH yêu cầu khóa thẻ tạm thời'
	},
	{
		value: 'KH yêu cầu mở khóa thẻ',
		nameVi: 'KH yêu cầu mở khóa thẻ',
		nameEn: 'KH yêu cầu mở khóa thẻ'
	},
	{
		value: 'Khác',
		nameVi: 'Khác',
		nameEn: 'Khác'
	},
];

export const CARD_STATUS_LIST = [
	{
		value: 'LOCK',
		nameVi: 'Card do not honor',
		nameEn: 'Card do not honor'
	},
	{
		value: 'UNLOCK',
		nameVi: 'Card OK',
		nameEn: 'Card OK'
	},
	{
		value: 'PICKUP-L41',
		nameVi: 'PICKUP-L41',
		nameEn: 'PICKUP-L41'
	}
];

export const CARD_RELEASE_RESON = [
	{
		value: 'KH làm mất thẻ',
		nameVi: 'KH làm mất thẻ',
		nameEn: 'KH làm mất thẻ'
	},
	{
		value: 'KH quên mã PIN',
		nameVi: 'KH quên mã PIN',
		nameEn: 'KH quên mã PIN'
	},
	{
		value: 'Thẻ bị hỏng/lỗi',
		nameVi: 'Thẻ bị hỏng/lỗi',
		nameEn: 'Thẻ bị hỏng/lỗi'
	}
];

export const FEE_COLLECTION_PLANS = [
	{
		value: 'CASH',
		nameVi: 'Tiền mặt',
		nameEn: 'Tiền mặt'
	},
	{
		value: 'ACCOUNT',
		nameVi: 'Tài khoản',
		nameEn: 'Tài khoản'
	},
	{
		value: 'FREE',
		nameVi: 'Miễn phí',
		nameEn: 'Miễn phí'
	}
];

export const FEE_POLICIES = [
	{
		id: 'TIEN_MAT',
		name: 'Tiền mặt'

	},
	{
		id: 'TAI_KHOAN',
		name: 'Tài khoản',
	},
	{
		id: 'MIEN_PHI',
		name: 'Miễn phí'
	}
];

export const COMBO_FEE_POLICIES = [
	// THU_PHI = 'THU.PHI';
	// DUY_TRI_SO_DU = 'DUY.TRI.SO.DU';
	// MIEN_PHI = 'MIEN.PHI';
	{
		id: 'THU.PHI',
		name: 'Thu phí'

	},
	{
		id: 'DUY.TRI.SO.DU',
		name: 'Cam kết số dư tối thiểu',
	},
	{
		id: 'MIEN_PHI',
		name: 'Miễn phí'
	}
];

export const FEE_COLLECTION_PLANS_REPORT = [
	{
		value: 'TIEN_MAT',
		nameVi: 'Tiền mặt',
		nameEn: 'Tiền mặt'
	},
	{
		value: 'TAI_KHOAN',
		nameVi: 'Tài khoản',
		nameEn: 'Tài khoản'
	},
	{
		value: 'MIEN_PHI',
		nameVi: 'Miễn phí',
		nameEn: 'Miễn phí'
	}
];

export const FEE_COLLECTION_PLANS_2 = [
	{
		value: 'CASH',
		nameVi: 'Tiền mặt',
		nameEn: 'Tiền mặt'
	},
	{
		value: 'ACCOUNT',
		nameVi: 'Tài khoản',
		nameEn: 'Tài khoản'
	}
];

export const INFO_LIST = [
	{
		value: 'EMAIL',
		nameVi: 'EMAIL',
		nameEn: 'EMAIL'
	},
	{
		value: 'FAX',
		nameVi: 'FAX',
		nameEn: 'FAX'
	},
	{
		value: 'HOME.ADDRESS',
		nameVi: 'HOME.ADDRESS',
		nameEn: 'HOME.ADDRESS'
	},
	{
		value: 'MAIL',
		nameVi: 'MAIL',
		nameEn: 'MAIL'
	},
	{
		value: 'SMS',
		nameVi: 'SMS',
		nameEn: 'SMS'
	},
	{
		value: 'SMS.NOTIFY',
		nameVi: 'SMS.NOTIFY',
		nameEn: 'SMS.NOTIFY'
	},

];

export const ECOMMER = [
	{
		value: true,
		nameVi: 'YES',
		nameEn: true
	},
	{
		value: false,
		nameVi: 'NO',
		nameEn: false
	},
];

export const TRANSPRO = [
	{
		value: '1',
		nameVi: '1',
		nameEn: '1'
	},
	{
		value: '2',
		nameVi: '2',
		nameEn: '2'
	},
	{
		value: '3',
		nameVi: '3',
		nameEn: '3'
	},
];

/**
 * Constant for error prefix
 */
export const ERROR_SEATELLER = '';
export const ERROR_SEATELLER_AUTHENAPI = 'SEATELLER-AUTHENAPI-';
export const ERROR_SEATELLER_CARDOPCDEAPI = 'SEATELLER-CARDOPCDEAPI-';
export const ERROR_SEATELLER_CARDQUERYAPI = 'SEATELLER-CARDQUERYAPI-';

export const ERROR_SEATELLER_CARD = 'SEATELLER-CARD-';
export const ERROR_SEATELLER_PERMISSION = 'SEATELLER-PERMISSION-';
export const ERROR_SEATELLER_ADMIN = 'SEATELLER-ADMIN-';
export const ERROR_SEATELLER_T24 = 'SEATELLER-T24-';
export const ERROR_SEATELLER_REPORT = 'SEATELLER-REPORT-';
export const ERROR_SEATELLER_CUST_INFO = 'SEATELLER-CUSTINFO-';
export const ERROR_SEATELLER_SEAPAY_ACCOUNT = 'SEATELLER-SEAPAYACCOUNT-';
export const ERROR_SEATELLER_REGSMSAPI = 'SEATELLER-REGSMSAPI-';
export const ERROR_SEATELLER_UTILITY = 'SEATELLER-UTILITY-';
export const ERROR_SEATELLER_EBANK = 'SEATELLER-EBANK-';

export const CORE_AI_FACES =
	[
		// {
		// 	confidence: 0.98,
		// 	rotate_angle: 0,
		// 	head_pose: 'center',
		// 	liveness: 'VALID',
		// 	angle: 0,
		// 	gender: 'Female',
		// 	age: 29,
		// 	emotion: 'neutral',
		// 	num_face: 1,
		// 	result: {
		// 		is_matched: {
		// 			value: 'True',
		// 			similarity: 0.99524975,
		// 			confidence: 0.99
		// 		},
		// 		matched_user: {
		// 			emotion_count: {
		// 				neutral: 1
		// 			},
		// 			metadata: {
		// 				card_front: {
		// 					id: {
		// 						value: '001188011923',
		// 						confidence: 0.9899959874153137,
		// 						value_unidecode: '001188011923'
		// 					},
		// 					ho_ten: {
		// 						value: 'TRẦN HUYỀN TRANG',
		// 						confidence: 0.9899991738796234,
		// 						value_unidecode: 'TRAN HUYEN TRANG'
		// 					},
		// 					ngay_sinh: {
		// 						value: '04/09/1988',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: '04/09/1988',
		// 							year: {
		// 								value: 1988
		// 							},
		// 							month: {
		// 								value: 9
		// 							},
		// 							day: {
		// 								value: 4
		// 							},
		// 							value_unidecode: '04/09/1988'
		// 						},
		// 						value_unidecode: '04/09/1988'
		// 					},
		// 					gioi_tinh: {
		// 						value: 'NỮ / F',
		// 						normalized: {
		// 							value: 1
		// 						},
		// 						confidence: 0.9,
		// 						value_unidecode: 'NU / F'
		// 					},
		// 					ngay_het_han: {
		// 						value: '16/04/2029',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: '16/04/2029',
		// 							year: {
		// 								value: 2029
		// 							},
		// 							month: {
		// 								value: 4
		// 							},
		// 							day: {
		// 								value: 16
		// 							},
		// 							value_unidecode: '16/04/2029'
		// 						},
		// 						is_valid: true,
		// 						value_unidecode: '16/04/2029'
		// 					},
		// 					ngay_cap: {
		// 						value: '16/04/2019',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: '16/04/2019',
		// 							year: {
		// 								value: 16
		// 							},
		// 							month: {
		// 								value: 4
		// 							},
		// 							day: {
		// 								value: 2019
		// 							},
		// 							value_unidecode: '16/04/2019'
		// 						},
		// 						value_unidecode: '16/04/2019'
		// 					},
		// 					loai_ho_chieu: {
		// 						value: 'P',
		// 						confidence: 1,
		// 						value_unidecode: 'P'
		// 					},
		// 					passport_no: {
		// 						value: 'C7160594',
		// 						confidence: 1,
		// 						value_unidecode: 'C7160594'
		// 					},
		// 					quoc_tich: {
		// 						value: 'VIETNAM',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: 'VIETNAM',
		// 							code: 'VNM',
		// 							code2: 'VN',
		// 							value_unidecode: 'VIETNAM'
		// 						},
		// 						value_unidecode: 'VIETNAM'
		// 					},
		// 					nguyen_quan: {
		// 						value: 'HÀ NỘI',
		// 						confidence: 0.9899994099140167,
		// 						normalized: {
		// 							value: 'TP HÀ NỘI',
		// 							tinh: {
		// 								value: 'TP HÀ NỘI',
		// 								code: 4,
		// 								value_unidecode: 'TP HA NOI'
		// 							},
		// 							huyen: {
		// 								value: 'N/A',
		// 								code: -1,
		// 								value_unidecode: 'N/A'
		// 							},
		// 							xa: {
		// 								value: 'N/A',
		// 								code: -1,
		// 								value_unidecode: 'N/A'
		// 							},
		// 							value_unidecode: 'TP HA NOI'
		// 						},
		// 						value_unidecode: 'HA NOI'
		// 					},
		// 					noi_cap: {
		// 						value: 'CỤC QUẢN LÝ XUẤT NHẬP CẢNH',
		// 						confidence: 1,
		// 						value_unidecode: 'CUC QUAN LY XUAT NHAP CANH'
		// 					},
		// 					class_name: {
		// 						value: 'HỘ CHIẾU - MẶT TRƯỚC',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: 5,
		// 							code: 'PP'
		// 						}
		// 					}
		// 				},
		// 				card_back: {
		// 					class_name: {
		// 						value: 'OTHER',
		// 						normalized: {
		// 							value: -1,
		// 							code: 'OTHER'
		// 						},
		// 						confidence: 0.95
		// 					}
		// 				},
		// 				card_name: 'TRẦN HỒNG HẢI',
		// 				card_name_unidecode: 'TRAN HUYEN TRANG',
		// 				card_birthdate: '04/09/1988',
		// 				card_id: '001188011923',
		// 				card_nguyen_quan: 'HÀ NỘI',
		// 				card_nguyen_quan_unidecode: 'HA NOI',
		// 				card_nguyen_quan_normalized_unidecode: 'TP HA NOI',
		// 				card_ho_khau_thuong_tru: '',
		// 				card_ho_khau_thuong_tru_unidecode: '',
		// 				card_ho_khau_thuong_tru_normalized_unidecode: '',
		// 				nextgen: {
		// 					country: 'VIET NAM',
		// 					occupation: '10',
		// 					jobTitle: '16',
		// 					channel: 'SEAMOBILE3.0',
		// 					ofs1Customer: 'CUSTOMER,VNPT/I/PROCESS,',
		// 					salary: '100000',
		// 					authenType: 'InputCustomer',
		// 					email1: 'abc@gmail.com',
		// 					province: '4',
		// 					isModified: 'N',
		// 					inputter: '',
		// 					seabSbSubChannel: 'SEANET',
		// 					residence: 'VN',
		// 					cardStatus: 'DEFINED',
		// 					legalIssDate: '20200101',
		// 					seabLegalAgree: 'YES',
		// 					legalDocName: 'CMND',
		// 					legalIssAuth: 'RGFSDFS',
		// 					seabDistrict1: '18',
		// 					otp: '493509',
		// 					signOnName: 'DONGDEN',
		// 					accountId: '',
		// 					servicePackage: 'SUPPER',
		// 					nationality: 'VN',
		// 					accountTitle1: 'CONG TY ABC',
		// 					seabBrokerType: '',
		// 					shortName: 'NGUYEN THI VAN',
		// 					name1: 'NGUYEN VAN DONG',
		// 					seabRegStatus: 'YES',
		// 					maritalStatus: 'SINGLE',
		// 					seabPurpose: 'DAILY BANKING',
		// 					gender: 'MALE',
		// 					seabSubChannel: null,
		// 					registerType: 'NEW_CUSTOMER',
		// 					sms1: '0988009582',
		// 					coCode: 'VN0010001',
		// 					street: 'TRAN HUNG DAO',
		// 					seabOwnBenefit: 'YES',
		// 					customerId: '4444',
		// 					currency: 'VND',
		// 					altAcctId: null,
		// 					address: 'Số 188 Nguyễn Xiển, P. Hạ Đình, Q. Thanh Xuân, TP. Hà Nội',
		// 					legalId: '017023046',
		// 					dateOfBirth: '19910111',
		// 					legalHolderName: 'CMND',
		// 					transLimit: 'VND10M',
		// 					rawUserId: 'a4ddf364-d46c-4efc-bd28-89fdfbad7e3f',
		// 					seabBrokerId: '',
		// 					customer: null,
		// 					employmentStatus: null,
		// 					taxId: null
		// 				},
		// 				version: 1
		// 			},
		// 			last_updated: '2020-11-26 11:44:19',
		// 			cropped_card_front_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/CARD_FRONT_7ff004b5-bdd1-45af-ad79-545f303d4044_cropped.jpg',
		// 			cropped_card_back_url: '',
		// 			gender: 'Female',
		// 			created: '2020-11-26 11:44:19',
		// 			cropped_general_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/1d78a471-3e80-457f-9770-d3700b483642_cropped.jpg',
		// 			gender_count: {
		// 				Female: 1
		// 			},
		// 			emotion: 'neutral',
		// 			updated_image: 1,
		// 			user_id: '2222',
		// 			card_front_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/CARD_FRONT_7ff004b5-bdd1-45af-ad79-545f303d4044.jpg',
		// 			age: 29,
		// 			card_back_url: '',
		// 			general_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/1d78a471-3e80-457f-9770-d3700b483642.jpg',
		// 			id: 'a4ddf364-d46c-4efc-bd28-89fdfbad7e3f'
		// 		},
		// 	}
		// },
		// {
		// 	confidence: 0.98,
		// 	rotate_angle: 0,
		// 	head_pose: 'center',
		// 	liveness: 'VALID',
		// 	angle: 0,
		// 	gender: 'Female',
		// 	age: 29,
		// 	emotion: 'neutral',
		// 	num_face: 1,
		// 	result: {
		// 		is_matched: {
		// 			value: 'True',
		// 			similarity: 0.99524975,
		// 			confidence: 0.99
		// 		},
		// 		matched_user: {
		// 			emotion_count: {
		// 				neutral: 1
		// 			},
		// 			metadata: {
		// 				card_front: {
		// 					id: {
		// 						value: '001188011923',
		// 						confidence: 0.9899959874153137,
		// 						value_unidecode: '001188011923'
		// 					},
		// 					ho_ten: {
		// 						value: 'TRẦN HUYỀN TRANG',
		// 						confidence: 0.9899991738796234,
		// 						value_unidecode: 'TRAN HUYEN TRANG'
		// 					},
		// 					ngay_sinh: {
		// 						value: '04/09/1988',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: '04/09/1988',
		// 							year: {
		// 								value: 1988
		// 							},
		// 							month: {
		// 								value: 9
		// 							},
		// 							day: {
		// 								value: 4
		// 							},
		// 							value_unidecode: '04/09/1988'
		// 						},
		// 						value_unidecode: '04/09/1988'
		// 					},
		// 					gioi_tinh: {
		// 						value: 'NỮ / F',
		// 						normalized: {
		// 							value: 1
		// 						},
		// 						confidence: 0.9,
		// 						value_unidecode: 'NU / F'
		// 					},
		// 					ngay_het_han: {
		// 						value: '16/04/2029',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: '16/04/2029',
		// 							year: {
		// 								value: 2029
		// 							},
		// 							month: {
		// 								value: 4
		// 							},
		// 							day: {
		// 								value: 16
		// 							},
		// 							value_unidecode: '16/04/2029'
		// 						},
		// 						is_valid: true,
		// 						value_unidecode: '16/04/2029'
		// 					},
		// 					ngay_cap: {
		// 						value: '16/04/2019',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: '16/04/2019',
		// 							year: {
		// 								value: 16
		// 							},
		// 							month: {
		// 								value: 4
		// 							},
		// 							day: {
		// 								value: 2019
		// 							},
		// 							value_unidecode: '16/04/2019'
		// 						},
		// 						value_unidecode: '16/04/2019'
		// 					},
		// 					loai_ho_chieu: {
		// 						value: 'P',
		// 						confidence: 1,
		// 						value_unidecode: 'P'
		// 					},
		// 					passport_no: {
		// 						value: 'C7160594',
		// 						confidence: 1,
		// 						value_unidecode: 'C7160594'
		// 					},
		// 					quoc_tich: {
		// 						value: 'VIETNAM',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: 'VIETNAM',
		// 							code: 'VNM',
		// 							code2: 'VN',
		// 							value_unidecode: 'VIETNAM'
		// 						},
		// 						value_unidecode: 'VIETNAM'
		// 					},
		// 					nguyen_quan: {
		// 						value: 'HÀ NỘI',
		// 						confidence: 0.9899994099140167,
		// 						normalized: {
		// 							value: 'TP HÀ NỘI',
		// 							tinh: {
		// 								value: 'TP HÀ NỘI',
		// 								code: 4,
		// 								value_unidecode: 'TP HA NOI'
		// 							},
		// 							huyen: {
		// 								value: 'N/A',
		// 								code: -1,
		// 								value_unidecode: 'N/A'
		// 							},
		// 							xa: {
		// 								value: 'N/A',
		// 								code: -1,
		// 								value_unidecode: 'N/A'
		// 							},
		// 							value_unidecode: 'TP HA NOI'
		// 						},
		// 						value_unidecode: 'HA NOI'
		// 					},
		// 					noi_cap: {
		// 						value: 'CỤC QUẢN LÝ XUẤT NHẬP CẢNH',
		// 						confidence: 1,
		// 						value_unidecode: 'CUC QUAN LY XUAT NHAP CANH'
		// 					},
		// 					class_name: {
		// 						value: 'HỘ CHIẾU - MẶT TRƯỚC',
		// 						confidence: 1,
		// 						normalized: {
		// 							value: 5,
		// 							code: 'PP'
		// 						}
		// 					}
		// 				},
		// 				card_back: {
		// 					class_name: {
		// 						value: 'OTHER',
		// 						normalized: {
		// 							value: -1,
		// 							code: 'OTHER'
		// 						},
		// 						confidence: 0.95
		// 					}
		// 				},
		// 				card_name: 'TRẦN HỒNG HẢI',
		// 				card_name_unidecode: 'TRAN HUYEN TRANG',
		// 				card_birthdate: '04/09/1988',
		// 				card_id: '001188011923',
		// 				card_nguyen_quan: 'HÀ NỘI',
		// 				card_nguyen_quan_unidecode: 'HA NOI',
		// 				card_nguyen_quan_normalized_unidecode: 'TP HA NOI',
		// 				card_ho_khau_thuong_tru: '',
		// 				card_ho_khau_thuong_tru_unidecode: '',
		// 				card_ho_khau_thuong_tru_normalized_unidecode: '',
		// 				nextgen: {
		// 					country: 'VIET NAM',
		// 					occupation: '10',
		// 					jobTitle: '16',
		// 					channel: 'SEAMOBILE3.0',
		// 					ofs1Customer: 'CUSTOMER,VNPT/I/PROCESS,',
		// 					salary: '100000',
		// 					authenType: 'InputCustomer',
		// 					email1: 'abc@gmail.com',
		// 					province: '4',
		// 					isModified: 'N',
		// 					inputter: '',
		// 					seabSbSubChannel: 'SEANET',
		// 					residence: 'VN',
		// 					cardStatus: 'DEFINED',
		// 					legalIssDate: '20200101',
		// 					seabLegalAgree: 'YES',
		// 					legalDocName: 'CMND',
		// 					legalIssAuth: 'RGFSDFS',
		// 					seabDistrict1: '18',
		// 					otp: '493509',
		// 					signOnName: 'DONGDEN',
		// 					accountId: '',
		// 					servicePackage: 'SUPPER',
		// 					nationality: 'VN',
		// 					accountTitle1: 'CONG TY ABC',
		// 					seabBrokerType: '',
		// 					shortName: 'NGUYEN THI VAN',
		// 					name1: 'NGUYEN VAN DONG',
		// 					seabRegStatus: 'YES',
		// 					maritalStatus: 'SINGLE',
		// 					seabPurpose: 'DAILY BANKING',
		// 					gender: 'MALE',
		// 					seabSubChannel: null,
		// 					registerType: 'NEW_CUSTOMER',
		// 					sms1: '0988009582',
		// 					coCode: 'VN0010001',
		// 					street: 'TRAN HUNG DAO',
		// 					seabOwnBenefit: 'YES',
		// 					customerId: '4444',
		// 					currency: 'VND',
		// 					altAcctId: null,
		// 					address: 'Số 188 Nguyễn Xiển, P. Hạ Đình, Q. Thanh Xuân, TP. Hà Nội',
		// 					legalId: '017023046',
		// 					dateOfBirth: '19910111',
		// 					legalHolderName: 'CMND',
		// 					transLimit: 'VND10M',
		// 					rawUserId: 'a4ddf364-d46c-4efc-bd28-89fdfbad7e3f',
		// 					seabBrokerId: '',
		// 					customer: null,
		// 					employmentStatus: null,
		// 					taxId: null
		// 				},
		// 				version: 1
		// 			},
		// 			last_updated: '2020-11-26 11:44:19',
		// 			cropped_card_front_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/CARD_FRONT_7ff004b5-bdd1-45af-ad79-545f303d4044_cropped.jpg',
		// 			cropped_card_back_url: '',
		// 			gender: 'Female',
		// 			created: '2020-11-26 11:44:19',
		// 			cropped_general_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/1d78a471-3e80-457f-9770-d3700b483642_cropped.jpg',
		// 			gender_count: {
		// 				Female: 1
		// 			},
		// 			emotion: 'neutral',
		// 			updated_image: 1,
		// 			user_id: '1111',
		// 			card_front_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/CARD_FRONT_7ff004b5-bdd1-45af-ad79-545f303d4044.jpg',
		// 			age: 29,
		// 			card_back_url: '',
		// 			general_url: '/biometrics/a4ddf364-d46c-4efc-bd28-89fdfbad7e3f/1d78a471-3e80-457f-9770-d3700b483642.jpg',
		// 			id: 'a4ddf364-d46c-4efc-bd28-89fdfbad7e3f'
		// 		},
		// 	}
		// },
	];

export const CORE_AI_GTTT =
	[
		// {
		// 	user_id: "3333",
		// 	gender: "Male",
		// 	gender_count: {
		// 		"Male": 1
		// 	},
		// 	age: 27,
		// 	emotion: "happy",
		// 	emotion_count: {
		// 		"happy": 1
		// 	},
		// 	card_front_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4.jpg",
		// 	cropped_card_front_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4_cropped.jpg",
		// 	card_back_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106.jpg",
		// 	cropped_card_back_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106_cropped.jpg",
		// 	general_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a.jpg",
		// 	cropped_general_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a_cropped.jpg",
		// 	updated_image: 1,
		// 	created: "2021-01-21 16:00:39",
		// 	metadata: {
		// 		card_front: {
		// 			id: {
		// 				value: "026096003205",
		// 				confidence: 0.9899998819828033,
		// 			},
		// 			ho_ten: {
		// 				value: "NGUYỄN KHẮC GIA BẢO",
		// 			},
		// 			ngay_sinh: {
		// 				value: "21/12/1996",
		// 				confidence: 0.9899997639656066,
		// 			},
		// 			gioi_tinh: {
		// 				value: "NAM",
		// 				value_unidecode: "NAM"
		// 			},
		// 			card_name: "NGUYỄN KHẮC GIA BẢO",
		// 			card_name_unidecode: "NGUYEN KHAC GIA BAO",
		// 			card_birthdate: "21/12/1996",
		// 			card_id: "026096003205",
		// 			card_nguyen_quan: "HỢP THỊNH, TAM DƯƠNG, VĨNH PHÚC",
		// 		}
		// 	}
		// },
		// {
		// 	user_id: "4444",
		// 	gender: "Male",
		// 	gender_count: {
		// 		"Male": 1
		// 	},
		// 	age: 27,
		// 	emotion: "happy",
		// 	emotion_count: {
		// 		"happy": 1
		// 	},
		// 	card_front_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4.jpg",
		// 	cropped_card_front_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4_cropped.jpg",
		// 	card_back_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106.jpg",
		// 	cropped_card_back_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106_cropped.jpg",
		// 	general_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a.jpg",
		// 	cropped_general_url: "/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a_cropped.jpg",
		// 	updated_image: 1,
		// 	created: "2021-01-21 16:00:39",
		// 	metadata: {
		// 		card_front: {
		// 			id: {
		// 				value: "026096003205",
		// 				confidence: 0.9899998819828033,
		// 			},
		// 			ho_ten: {
		// 				value: "NGUYỄN KHẮC GIA BẢO",
		// 			},
		// 			ngay_sinh: {
		// 				value: "21/12/1996",
		// 				confidence: 0.9899997639656066,
		// 			},
		// 			gioi_tinh: {
		// 				value: "NAM",
		// 				value_unidecode: "NAM"
		// 			},
		// 			card_name: "NGUYỄN KHẮC GIA BẢO",
		// 			card_name_unidecode: "NGUYEN KHAC GIA BAO",
		// 			card_birthdate: "21/12/1996",
		// 			card_id: "026096003205",
		// 			card_nguyen_quan: "HỢP THỊNH, TAM DƯƠNG, VĨNH PHÚC",
		// 		}
		// 	}
		// },

	];

export const CORE_AI_FINGER_PRINT =
	[
		{
			user_id: '9999',
			gender: 'Male',
			gender_count: {
				'Male': 1
			},
			age: 27,
			emotion: 'happy',
			emotion_count: {
				'happy': 1
			},
			card_front_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4.jpg',
			cropped_card_front_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4_cropped.jpg',
			card_back_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106.jpg',
			cropped_card_back_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106_cropped.jpg',
			general_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a.jpg',
			cropped_general_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a_cropped.jpg',
			updated_image: 1,
			created: '2021-01-21 16:00:39',
			metadata: {
				card_front: {
					id: {
						value: '026096003205',
						confidence: 0.9899998819828033,
					},
					ho_ten: {
						value: 'NGUYỄN KHẮC GIA BẢO',
					},
					ngay_sinh: {
						value: '21/12/1996',
						confidence: 0.9899997639656066,
					},
					gioi_tinh: {
						value: 'NAM',
						value_unidecode: 'NAM'
					},
					card_name: 'NGUYỄN KHẮC GIA BẢO',
					card_name_unidecode: 'NGUYEN KHAC GIA BAO',
					card_birthdate: '21/12/1996',
					card_id: '026096003205',
					card_nguyen_quan: 'HỢP THỊNH, TAM DƯƠNG, VĨNH PHÚC',
				}
			}
		},
		{
			user_id: '8888',
			gender: 'Male',
			gender_count: {
				'Male': 1
			},
			age: 27,
			emotion: 'happy',
			emotion_count: {
				'happy': 1
			},
			card_front_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4.jpg',
			cropped_card_front_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_FRONT_d7682066-23b6-4309-bf67-c397daef13a4_cropped.jpg',
			card_back_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106.jpg',
			cropped_card_back_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/CARD_BACK_81a37a6e-c9ed-448a-9389-e072d9993106_cropped.jpg',
			general_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a.jpg',
			cropped_general_url: '/biometrics/f78c5b6d-8406-41c0-a873-12ddf98a5fe3/5be6e4c0-ad8c-4211-b166-50af1724471a_cropped.jpg',
			updated_image: 1,
			created: '2021-01-21 16:00:39',
			metadata: {
				card_front: {
					id: {
						value: '026096003205',
						confidence: 0.9899998819828033,
					},
					ho_ten: {
						value: 'NGUYỄN KHẮC GIA BẢO',
					},
					ngay_sinh: {
						value: '21/12/1996',
						confidence: 0.9899997639656066,
					},
					gioi_tinh: {
						value: 'NAM',
						value_unidecode: 'NAM'
					},
					card_name: 'NGUYỄN KHẮC GIA BẢO',
					card_name_unidecode: 'NGUYEN KHAC GIA BAO',
					card_birthdate: '21/12/1996',
					card_id: '026096003205',
					card_nguyen_quan: 'HỢP THỊNH, TAM DƯƠNG, VĨNH PHÚC',
				}
			}
		}

	];

export const SERVICE_STATUS_LIST = [
	'OPEN',
	'PENDING',
	'CLOSE'
];

export const TRAN_SEANET_PRO = [
	{
		value: 'SEANET.NVSB.TRANS'
	},
	{
		value: 'SEANET.SEAPAY.100.TRANS'
	},
	{
		value: 'PK.TRANS.EBANK-20170208'
	}
];

// export const PROMOTION_ID = [
// 	{
// 		value: 'SEANET-100-33556688',
//
// 	},
// 	{
// 		value: 'SEANET-12T-33556688'
// 	}
// ];


export const VIP_TYPE_ACCOUNTS = [
	{
		id: '10',
		value: 'Số đẹp V10',
	},
	{
		id: '3',
		value: 'Số đẹp V3',
	},
	{
		id: '4',
		value: 'Số đẹp V4',
	},
	{
		id: '5',
		value: 'Số đẹp V5',
	}, {
		id: '6',
		value: 'Số đẹp V6',
	}, {
		id: '7',
		value: 'Số đẹp V7',
	},
	{
		id: '8',
		value: 'Số đẹp V8',
	},
	{
		id: '9',
		value: 'Số đẹp V9',
	},
	{
		id: 'TUYCHON',
		value: 'Tùy chọn',
	},
];

export const VIP_CLASS_ACCOUNTS = [
	{
		id: '1',
		value: 'Số đẹp hạng 1',
	}, {
		id: '2',
		value: 'Số đẹp hạng 2',
	}, {
		id: '3',
		value: 'Số đẹp hạng 3',
	}
];

export const CHARGE_CODE = [

	{
		id: '1TKSODEP3',
		value: '1TKSODEP3',
		fee: '6000000'
	},
	{
		id: '1TKSODEP1',
		value: '1TKSODEP1',
		fee: '1500000'
	}
];

export const DATA_TABLE_360 = {
	'lstAcc': [{
		'contractId': '4510003506005',
		'description': 'TÃ i khoáº£n thanh toÃ¡n',
		'category': '1001',
		'currency': 'VND',
		'limitAmt': '0',
		'workingBal': '0',
		'lockAmt': '0',
		'availAmt': '0',
		'accrCrAmount': '0'
	}],
	'lstCard': [
		{
			'mainId': '14673821.20190315.0002',
			'customerId': '14673821',
			'cardType': 'VSCGEM',
			'mainAccount': '000083600035',
			'limitRef': '1100.01',
			'productionStatus': 'R',
			'effDate': '2019-03-15 00:00:00',
			'expDate': '03/24',
			'cardId': '43654622B5B0B8B7418BFAD2470DA9B4D5714143DAF7FB3782',
			'cardStatus': 'YES'
		},
		{
			'mainId': '14673821.20180907.0001',
			'customerId': '14673821',
			'cardType': 'MCSKEM',
			'mainAccount': '4510003506005',
			'productionStatus': 'R',
			'effDate': '2018-09-07 00:00:00',
			'expDate': '09/21',
			'cardId': '5403928B0A5C7C01D9CD25B6AA1160C347AEB4FF32F3B46647',
			'cardStatus': 'YES'
		}
	],
	'lstLimit': [{
		'contractId': '14673821.0001100.01',
		'customerId': '14673821',
		'source': 'LIMIT',
		'limitAmt': '50000000',
		'expiryDate': '2020-03-15 00:00:00'
	}],
	'lstLoan': [
		{
			'contractId': 'LD1909100192',
			'source': 'LD',
			'customerId': '14673821',
			'seabProductDe': '622',
			'contractRef': '000083600035',
			'limitAmt': '0',
			'workingBal': '3333330',
			'interestRate': '0',
			'openDate': '2019-04-01 00:00:00',
			'maturityDate': '2020-04-15 00:00:00'
		},
		{
			'contractId': 'LD1909100189',
			'source': 'LD',
			'customerId': '14673821',
			'seabProductDe': '622',
			'contractRef': '000083600035',
			'limitAmt': '0',
			'workingBal': '1666670',
			'interestRate': '0',
			'openDate': '2019-04-01 00:00:00',
			'maturityDate': '2020-04-15 00:00:00'
		},
		{
			'contractId': 'LD1909100190',
			'source': 'LD',
			'customerId': '14673821',
			'seabProductDe': '622',
			'contractRef': '000083600035',
			'limitAmt': '0',
			'workingBal': '1666670',
			'interestRate': '0',
			'openDate': '2019-04-01 00:00:00',
			'maturityDate': '2020-04-15 00:00:00'
		}
	],
	'lstOverdue': [{
		'contractId': 'PDLD1909100192',
		'customerId': '14673821',
		'source': 'PD',
		'seabProductDe': '622',
		'contractRef': '4510003506005',
		'limitRef': '1100.01',
		'totalAmtToRepay': '204797',
		'interestRate': '30'
	}],
	'lstProfile': [{
		'customerId': '14673821',
		'customerName': 'VU THI SANG',
		'legalId': '172650337',
		'legalIssDate': '2011-07-07 00:00:00',
		'legalIssAuth': 'THANH HOA',
		'dateOfBirth': '1984-10-02 00:00:00',
		'gender': 'FEMALE',
		'age': '36',
		'address': 'HA CHAU HA TRUNG THANH HOA',
		'province': '37',
		'provinceName': 'THANH HOA',
		'industry': '1905',
		'industryName': 'Hoat dong dich vu khac',
		'companyCode': 'VN0010001',
		'customerClass': 'IND.PFS.S.MASS.UNDF',
		'totalCredit': '0',
		'totalDebit': '6666670',
		'totalOverDebit': '0'
	}],
	'lstService': [
		{
			'source': 'SMS',
			'contractId': '14673821.4.000083600035.SMS.CREDIT',
			'customer': '14673821',
			'mainAccount': '000083600035',
			'startDate': '2019-03-18 00:00:00',
			'coCode': 'VN0010451'
		},
		{
			'source': 'SMS',
			'contractId': '14673821.2.000080601556.SMS.CREDIT',
			'customer': '14673821',
			'mainAccount': '000080601556',
			'startDate': '2019-03-18 00:00:00',
			'coCode': 'VN0010451'
		},
		{
			'source': 'SMS',
			'contractId': '14673821.1.4510003506005.SMS.ALL',
			'customer': '14673821',
			'mainAccount': '4510003506005',
			'serviceStatus': 'OPEN',
			'startDate': '2018-09-07 00:00:00',
			'coCode': 'VN0010451'
		},
		{
			'source': 'SMS',
			'contractId': '14673821.3.000080601557.SMS.CREDIT',
			'customer': '14673821',
			'mainAccount': '000080601557',
			'startDate': '2019-03-18 00:00:00',
			'coCode': 'VN0010451'
		}]

};

export const DATA_CART_TYPE_CREDIT = [
	'MCCT', 'VSBC', 'VSCG', 'VSCH', 'VSCL', 'VSCO', 'VSCR', 'VSCS', 'VSDG', 'VSMC', 'VSMD', 'VSMF',
	'VSMI', 'VSMJ', 'VSMM', 'VSPB', 'VSPC', 'VSPM', 'VSPN', 'VSPQ', 'VSPR',
];

export const DATA_CART_TYPE_DEBIT = [
	'MCSC', 'MCSF', 'MCSG', 'MCSH', 'MCSK', 'MCSL', 'S002', 'S001', 'S003', 'S004', 'S005', 'S006',
	'S007', 'S008', 'S009', 'S010', 'SEB', 'SEBN', 'SEM', 'SES', 'SSEB', 'SVCC', 'VSBG', 'VSBS', 'VSME',
	'VSMS', 'VSSB', 'VSSC', 'VSSD', 'VSSE', 'VSSF', 'VSSG', 'VSSH', 'VSSL', 'VSSN', 'VSSP', 'VSSQ', 'VSSR', 'VSSY',
];

/**
 * Constant for sla report
 */
export const INPUTTER_SEATELLER = 'INPUTTER-SEATELLER';
export const AUTHORISER_SEATELLER = 'AUTHORISER-SEATELLER';
export const MILLISECOND_1_MINUTE = 60_000;
export const SLA_REALTIME_TRANS_CACHE = 'sla_realtime_trans';
export const SLA_HISTORY_TRANS_CACHE = 'sla_history_trans';
export const SLA_ERROR_TRANS_CACHE = 'sla_error_trans';
export const SLA_CONFIG_CACHE = 'sla_config';

/*
External link
 */
export const EXTERNAL_LINK = {
	OBIEE: 'OBIEE',
	CARDSUPPORT: 'CARDSUPPORT',
	CARDSM: 'CARDSM',
	CRM: 'CRM'
};
/**
 * constant for websocket
 */
export const WEBSOCKET_URL = 'WEBSOCKET_URL';
export const WEBSOCKET_API = 'WEBSOCKET_API';
export const WEBSOCKET_API_KEY = 'WEBSOCKET_API_KEY';

/**
 * CONSTANT TÀI KHOẢN SỐ ĐẸP
 */

export const TAI_KHOAN = {
	SO_DEP_10_SO: 'ACCOUNT_NICE_10',
	SO_DEP_12_SO: 'ACCOUNT_NICE_12',
	SO_DEP_9_SO: 'ACCOUNT_NICE_9',
	SO_DEP_8_SO: 'ACCOUNT_NICE_8',
	SO_DEP_7_SO: 'ACCOUNT_NICE_7',
	SO_DEP_6_SO: 'ACCOUNT_NICE_6',
};

export const SEATELLER_SCAN_NAME = 'temp_scan';
export const MAX_SIZE_IMAGE = 500000; // in bytes
/**
 * CONSTANT FOR UTILITY
 */
export const UTILITY = {
	PORTFOLIOS: {
		PORTFOLIOS_TYPE: {
			PORTFOLIO: 'PORTFOLIO',
			CAMPAIGN: 'CAMPAIGN',
			FT_COMMISSION_TYPE: 'FT_COMMISSION_TYPE'
		},
		PORTFOLIOS_CACHE: {
			PORTFOLIO: 'portfolioCache',
			CAMPAIGN: 'campaignCache',
			FT_COMMISSION_TYPE: 'commissionCache'
		}
	},
	RELATION: {
		RELATION_CACHE: 'relationsCache'
	},
	INDUSTRY: {
		INDUSTRY_CACHE: 'industryCached'
	},
	CAREER: {
		CAREER_CACHE: 'careerCache'
	},
	COUNTRY: {
		COUNTRY_CACHE: 'countrysCached'
	},
	OCCUPATIONS: {
		OCCUPATIONS_CACHE: 'occupationCache'
	},
	BROKER: {
		BROKER_CACHE: 'brokersCached'
	},
	SALE: {
		SALE_CACHE: 'saleCache'
	},
	BASIC_RATE: {
		BASIC_RATE_CACHE: 'basicRateCache'
	},
	ACC_BLOCK_TEXT: {
		ACC_BLOCK_TEXT_CACHE: 'accBlockText'
	},
	SERVICE_PACKAGE: {
		SERVICE_PACKAGE_CACHE: 'servicePackagesCache'
	},
	TRAN_LIMIT: {
		TRAN_LIMIT_CACHE: 'tranLimitsCache'
	},
	PROMOTION: {
		PROMOTION_CACHE: 'promotionCache'
	},
	MA_DICH_VU: {
		MA_DICH_VU_CACHE: 'madichvusCache'
	},
	PROMOTION_CARD: {
		PROMOTION_CARD_CACHE: 'promotionCardCache'
	},
	TRANS_PRO_CARD: {
		TRANS_PRO_CARD_CACHE: 'transPromotionCardCache'
	}

};

export const CARDTYPE = [
	{
		cardTypeId: 'VSSC',
		description: 'Visa Chip Stand Debit Currency.'
	},
	{
		cardTypeId: 'VSSP',
		description: 'Visa Debit Platinum'
	},
	{
		cardTypeId: 'VSSG',
		description: 'Visa Chip Stand Debit Gold'
	},
	{
		cardTypeId: 'VSSN',
		description: 'Debit Classic BRG Elite'
	},
];

export const LOCAL_CARD = [
	{
		cardTypeId: 'SVCC',
		description: 'Local Chip Debit Card'
	}
];

export const NHOM_NGANH_ID_LOAI_BO = ['NGUOIKOCOVIECLAMKHAC01', 'CANBODIEUHANH', 'QUANLYCAPCAODN'];

export const NICE_ACCT_SO_DU = 'theo mức Số dư duy trì tối thiểu của TKTT thông thường';
