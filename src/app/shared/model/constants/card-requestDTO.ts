export class CardRequestDTO {
	public static BODY = {
		BODY_GET_CARD: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getCustomerCardInfo',
				customerID: ''
			},
		},

		BODY_GET_CARD_TYPE: {
			command: 'GET_ENQUIRY',
			enquiry: {
				enqID: 'T24ENQ.SEAB.API.GET.PRODUCT.CARD',
			},
		},

		BODY_GET_CARD_STATUS_PICKUP_L41: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getCustomerCard2',
				customerID: ''
			},
		},
		BODY_GET_CARD_INFO_BY_CARD_TOKEN: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getPartnerCardInfo',
				tokenCard: '',
				partnerID: ''
			}
		},

		BODY_GET_WRONG_ENTRY_PIN_CODE_INFO: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getMaxNumAttemp3D',
				tokenCard: '',
				partnerID: ''
			}
		},
		BODY_GET_CARD_LIMIT: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getLimits',
				tokenCard: '',
				partnerID: ''
			}
		},
		BODY_GET_ECOM_STATUS: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getOperators',
				tokenCard: '',
				partnerID: ''
			}
		}
	};
}

export class SimilarityCoreAI {
	public static BODY = {
		BODY_GET_SIMILARITY: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'GetListCoreAi',
				type: 'ALL'
			},
		},
	};
}
