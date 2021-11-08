// tslint:disable:indent

export class MenuConfig {
	public defaults: any = {
		header: {
			self: {},
			items: []
		},
		aside: {
			self: {},
			items: [
				{section: ''},
				{
					title: 'Trang chủ',
					root: true,
					icon: 'ic-trang-chu.svg',
					page: '/pages/dashboard',
					bullet: 'dot',
					permission: ['pages/dashboard']
				},
				{
					title: 'Khách hàng cá nhân',
					root: true,
					icon: '',
					page: '',
					bullet: 'dot',
					permission: [
						'pages/combo1',
						'pages/combo2',
						'pages/combo3',
						'pages/ex-combo1',
						'pages/ex-combo2',
						'pages/ex-combo3',
						// ql khach hang
						'pages/customer-manage',
						// ql nghiep vu giao dich
						'pages/account',
						'pages/card',
						'pages/e-bank',
						'pages/sms',
						// truy van in bao cao
						'pages/report/trans',
						'pages/report/statement',
						'pages/report/daily',
						'pages/report/balance',
						'pages/report/sla'
					],
					submenu: [
						{
							title: 'Mở combo khách hàng mới',
							icon: 'flaticon-share',
							page: '',
							tooltip: 'Mở combo khách hàng mới',
							permission: [
								'pages/combo1',
								'pages/combo2',
								'pages/combo3'
							],
							notShowAuth: true,
							submenu: [
								{
									title: 'Combo 1',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/combo1',
									tooltip: 'Combo 1',
									permission: ['pages/combo1'],
									parent: 'Khách hàng mới',
									notShowAuth: true
								},
								{
									title: 'Combo 2',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/combo2',
									tooltip: 'Combo 2',
									permission: ['pages/combo2'],
									parent: 'Khách hàng mới',
									notShowAuth: true
								},
								{
									title: 'Combo 3',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/combo3',
									tooltip: 'Combo 3',
									permission: ['pages/combo3'],
									parent: 'Khách hàng mới',
									notShowAuth: true
								},
							]
						},
						// {
						// 	title: 'Mở combo khách hàng cũ',
						// 	icon: 'flaticon-share',
						// 	// bullet: 'dot',
						// 	page: '',
						// 	tooltip: 'Mở combo khách hàng cũ',
						// 	permission: [
						// 		'pages/ex-combo1',
						// 		'pages/ex-combo2',
						// 		'pages/ex-combo3'
						// 	],
						// 	submenu: [
						// 		{
						// 			title: 'Combo 1',
						// 			icon: '',
						// 			icon2: '',
						// 			bullet: 'dot',
						// 			page: '/pages/ex-combo1',
						// 			tooltip: 'Combo 1',
						// 			permission: ['pages/ex-combo1'],
						// 			parent: 'Khách hàng cũ'
						// 		},
						// 		{
						// 			title: 'Combo 2',
						// 			icon: '',
						// 			icon2: '',
						// 			bullet: 'dot',
						// 			page: '/pages/ex-combo2',
						// 			tooltip: 'Combo 2',
						// 			permission: ['pages/ex-combo2'],
						// 			parent: 'Khách hàng cũ'
						// 		},
						// 		{
						// 			title: 'Combo 3',
						// 			icon: '',
						// 			icon2: '',
						// 			bullet: 'dot',
						// 			page: '/pages/ex-combo3',
						// 			tooltip: 'Combo 3',
						// 			permission: ['pages/ex-combo3'],
						// 			parent: 'Khách hàng cũ'
						// 		},
						// 	]
						// },

						// quản lý khách hàng
						{
							title: 'Quản lý thông tin KH',
							icon: 'flaticon-share',
							page: '/pages/customer-manage',
							tooltip: 'Quản lý thông tin KH',
							permission: ['pages/customer-manage'],
							notShowAuth: true,
						},
						{
							title: 'QL nghiệp vụ GD',
							icon: 'flaticon-share',
							page: '',
							tooltip: 'QL nghiệp vụ GD',
							permission: [
								'pages/account',
								'pages/card',
								'pages/e-bank',
								'pages/sms'
							],
							notShowAuth: true,
							submenu: [
								{
									title: 'Tài khoản',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/account',
									tooltip: 'Tài khoản',
									permission: ['pages/account'],
									notShowAuth: true,
								},
								{
									title: 'Thẻ',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/card',
									tooltip: 'Thẻ',
									permission: ['pages/card'],
									notShowAuth: true,
								},
								{
									title: 'SeANet',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/e-bank',
									tooltip: 'SeANet',
									permission: ['pages/e-bank'],
									notShowAuth: true,
								},
								{
									title: 'SMS',
									icon: '',
									icon2: '',
									bullet: 'dot',
									page: '/pages/sms',
									tooltip: 'SMS',
									permission: ['pages/sms'],
									notShowAuth: true,
								},

							]
						},
						{
							title: 'Truy vấn/ In báo cáo',
							icon: 'flaticon-share',
							page: '',
							tooltip: 'Truy vấn/ In báo cáo',
							permission: [
								'pages/report/trans',
								'pages/report/statement',
								'pages/report/daily',
								'pages/report/balance',
								'pages/report/sla'
							],
							submenu: [
								{
									title: 'Truy vấn giao dịch',
									bullet: 'dot',
									page: '/pages/report/trans',
									tooltip: 'Truy vấn giao dịch',
									permission: ['pages/report/trans']
								},
								{
									title: 'In báo cáo',
									bullet: 'dot',
									page: '',
									tooltip: 'In báo cáo',
									permission: [
										'pages/report/statement',
										'pages/report/daily',
										'pages/report/balance',
										// 'pages/report/trans'
									],
									submenu: [
										{
											title: 'In xác nhận số dư',
											icon: '',
											icon2: '',
											bullet: 'line',
											page: '/pages/report/balance',
											tooltip: 'In xác nhận số dư',
											permission: [
												'pages/report/balance',
												// 'pages/report/trans'
											]
										},
										{
											title: 'In sổ phụ/Sao kê tài khoản',
											icon: '',
											icon2: '',
											bullet: 'line',
											page: '/pages/report/statement',
											tooltip: 'In sổ phụ/Sao kê tài khoản',
											permission: [
												'pages/report/statement',
												// 'pages/report/trans'
											]
										},

									]
								},
								{
									title: 'Báo cáo cuối ngày',
									bullet: 'dot',
									page: '/pages/report/daily',
									tooltip: 'Báo cáo cuối ngày',
									permission: [
										'pages/report/daily'
									]
								},
								{
									title: 'Báo cáo SLA',
									bullet: 'dot',
									page: '/pages/report/sla',
									tooltip: 'Báo cáo SLA',
									permission: [
										'pages/report/sla'
									]
								}
							]
						},
						{
							title: 'Link',
							icon: 'flaticon-share',
							// root: true,
							// icon: 'info',
							page: '',
							// bullet: 'dot',
							permission: ['pages/dashboard'],
							submenu: [
								{
									title: 'OBIEE',
									// icon: 'flaticon-share',
									page: 'OBIEE',
									bullet: 'dot',
									permission: ['pages/dashboard']
								},
								{
									title: 'Tạo yêu cầu tra soát thẻ',
									// icon: 'flaticon-share',
									page: 'CARDSUPPORT',
									bullet: 'dot',
									permission: ['pages/dashboard']
								},
								{
									title: 'Xem kết quả tra soát thẻ',
									// icon: 'flaticon-share',
									page: 'CARDSM',
									bullet: 'dot',
									permission: ['pages/dashboard']
								},
								{
									title: 'CRM (Ticket)',
									// icon: 'flaticon-share',
									page: 'CRM',
									bullet: 'dot',
									permission: ['pages/dashboard']
								},
							]
						}
					]
				},
				{
					title: 'Liên hệ',
					root: true,
					icon: 'info',
					page: 'contact',
					bullet: 'dot',
					permission: ['pages/dashboard']
				},
			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
