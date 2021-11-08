export class AccountRequestDTO {
	public static BODY = {
		BODY_GET_ACCOUNT: {
			command: 'GET_ENQUIRY',
			enquiry: {
				// authenType: 'getACC_LIST-2',
				authenType: 'getACC_LIST-3',
				// customerID:"13981684",
				customerID: '',
				accountType: 'ALL'
			}
		},

		BODY_ACCOUNT: {
			'command': 'GET_ENQUIRY',
			'enquiry': {
				'enqID': 'T24ENQ.SEAB.GET.ACCCUST.SEATELLER',
				'custId': ''

			}

		},

		BODY_GET_CUR_ACCOUNT_INFO2: {
			'command': 'GET_ENQUIRY',
			'enquiry': {
				"authenType": "getCURR_INFO-2",
				"accountID": ""
			}

		}
	};
}
