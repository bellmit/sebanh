// tslint:disable:indent

export class CustomerRequestDTO {
	public static BODY = {
		BODY_REPORT_EXPORT: {
			command: 'GET_REPORT',
			report: {
				authenType: 'getReport_SEATELLER_LKGD',
				exportType: 'WORD',
				coCode: '',
				date: '',
				printDate: '',
				printTime: '',
				tableData: [],
				username: ''
			}
		},
		BODY_DAILY_STATEMENT_REPORT_EXPORT: {
			command: 'GET_REPORT',
			report: {
				accountName: 'TIEN MAT TAI QUY CHINH CN SGD - VND',
				accountType: 'TK Tien mat quy chinh',
				authenType: 'getReport_SEATELLER_THU_CHI',
				exportType: 'PDF',
				teller: '',// chưa rõ, Đức đang hỏi BA lấy ở đâu
				branch: '',
				closeBalance: '',
				cocode: '',
				currency: '',
				date: '',
				openBalance: '',
				saveToMinio: false,// Hưng nó không cần cho vào
				tableData: [],
				totalCredit: '',
				totalDebit: ''
      		 }
		},
		BODY_BALANCE_REPORT: {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.SEAB.API.CUS.AC.BALANCE',
				customerId: '',
				acctId: '',
				ccy: '',
				custVip: ''
			}
		},
		BODY_DAILY_TRANSACTION: {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.SEAB.API.ENTRY.TODAY.SEABANK',
				inputter: '',
				company: '',
				usercob: '',
				authoriser: ''
			}
		},
		BODY_DAILY_STATEMENT: {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.ENQ.SEAB.BANK.STATEMENT.API',
				startDate: '',
				endDate: '',
				typeStatement: 'NKTC',
				accountId: ''
			}
		},
		BODY_PROSPECT_CUSTOMER: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getCurrAccInfo',
				legalId: '',
				dateBirth: '',
				customerName: '',
				phone: '',
				customerId: ''
			}
		},
		BODY_CUSTOMER_360: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getCust360Info',
				customerId: '',
			},
		},
		BODY_GET_CUSTOMER: {
			command: 'GET_ENQUIRY',
			enquiry: {
				// authenType: 'getCUST_IND-2',
				authenType: 'getCUST_IND-3',
				customerID: ''
			}
		},
		BODY_UPDATE_CUSTOMER: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'updateCustomer',
				data: {}
			}
		},
		BODY_UTILITY: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getCITIES'
			}
		},
		BODY_CREATE_CUSTOMER: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'createCustomer',
				data: {}
			}
		},
		BODY_APPROVE_CUSTOMER: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'approveCustomer',
				data: {}
			}
		},
		BODY_DELETE_CUSTOMER: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'deleteCustomer',
				data: {}
			}
		},
		BODY_REJECT_CUSTOMER: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'rejectCustomer',
				data: {}
			}
		},
		BODY_QUESTION: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getListSecurityQuestion',
				data: {
					customerId: ''
				}
			}
		}
	};

}
