export class ComboConfig {
	public static BODY = {
		BODY_COMBO_LIST: {
			command: 'GET_ENQUIRY',
			enquiry: {
				authenType: 'getGroups'
			}
		},

		BODY_COMBO_CREATE: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'createGroup',
				group_id: '',
				name: '',
				desc: '',
				inputer: ''
			}
		},

		BODY_COMBO_UPDATE: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'updateGroup',
				group_id: '',
				name: '',
				desc: '',
				inputer: ''
			}
		},

		BODY_COMBO_DELETE: {
			command: 'GET_TRANSACTION',
			transaction: {
				authenType: 'deleteGroup',
				group_id: ''
			}
		}
	};
}

