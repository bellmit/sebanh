export class ApiConfig {
	public static BODY = {
		BODY_GET_EBANK: {
			command: "GET_ENQUIRY",
			enquiry: {
				authenType: "getEbankInfor",
				inputter: "",
				ebankId: "",
				// getIdsFromIdentification: ""
				// username: "itsol.namnd",
				// password: "123456a@"
			}
		},

		BODY_RESET_LOCK_EBANK: {
			command: "GET_TRANSACTION",
			transaction: {
				authenType: "resetLockUnlockEBank",
				data: {
					id: "",
					username: "",
					inputter: "",
					coCode: "",
					actionT24: "",
					departCode: "",
					priority: ""
				}
			}
		},

		BODY_CREATE_EBANK: {
			command: "GET_TRANSACTION",
			transaction: {
				authenType: "inputRegEbank",
				inputer: "duc.la",
				noOfAuthorise: "1",
				customerId: "14060189",
				handyNumber: "000994300184",
				email: "ABC@GMAIL.COM",
				startDate: "20200601",
				mainCurrAcc: "0020009547003",
				serviceId: "IB.SEABANK",
				servicePackage: "SUPPER",
				transLimit: "5000000000",
				signOnName: "LONGNGUYENPHI",
				channel: "BRANCH",
				promotionId: "SEANET-20100608",
				campaignId: "SEANET-20100608",
				salesType: "KHACHHANG",
				salesId: "14714472",
				brokerType: "KHACHHANG",
				brokerId: "14714472",
				transSeanetBase: "SEANET.IND.BASE",
				transSeanetPro: "14060189",
				coCode: "VN0010002"
			}
		}
	}
}

