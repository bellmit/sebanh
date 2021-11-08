import {ConfigTable} from "../config-table";

export const CONFIG_TABLE_DASHBOARD: ConfigTable = {
		nameObjectDetail: 'nameObjectDetail',
		nameTable: 'dashboard',
		properties: [
			{
				fieldName: 'transactionCode',
				textColor: 'blue'
			},
			{
				fieldName: 'customerId',
			},
			{
				fieldName: 'gttt',
			},
			{
				fieldName: 'idenType',
			},
			{
				fieldName: 'customerType',
			},
			{
				fieldName: 'transactionType',
			},
			{
				fieldName: 'piority'
			},
			{
				fieldName: 'status',
				isLabelColor: true
			},
			{
				fieldName: 'inputter',
			},
			{
				fieldName: 'authoriser',
			},
		],

		isScroll: '215px',
		isNumericalOrder: true,
		isSortByFieldColumn: true,
		isCheckBoxByEachRecord: true,
		isChooseAllRecord: true,
		isPaginator: true
	}
;


export const CONFIG_TABLE_ANNOUNCEMENT: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'announcement',
	properties: [
		{
			fieldName: 'announceCode',
		},
		{
			fieldName: 'name',
		},
		{
			fieldName: 'title',
		},
		{
			fieldName: 'startDate',
		},
		{
			fieldName: 'endDate',
		},
		{
			fieldName: 'createDate',
		},
		{
			fieldName: 'createPerson'
		},
	],
	isNumericalOrder: true,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817'
}

export const CONFIG_TABLE_DECLARE_SIMILAR_AI: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'similar_AI',
	properties: [
		{
			fieldName: 'reliability',
		},
		{
			fieldName: 'timeChange',
		},
		{
			fieldName: 'changePerson',
		},
		{
			fieldName: 'note',
		}
	],
	isNumericalOrder: true,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817'
}

export const CONFIG_TABLE_ADVERTISEMENT_INFO: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'ads_info',
	properties: [
		{
			fieldName: 'id',
		},
		{
			fieldName: 'name',
		},
		{
			fieldName: 'status',
		},
		{
			fieldName: 'startTime',
		},
		{
			fieldName: 'endTime',
		}
	],
	isNumericalOrder: true,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817',
	isHighlightTextSelected: true
}

export const CONFIG_TABLE_ADVERTISEMENT_MAPPING: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'ads_mapping',
	properties: [
		{
			fieldName: 'id',
		},
		{
			fieldName: 'description',
		},
		{
			fieldName: 'product',
		},
		{
			fieldName: 'criteria',
		},
		{
			fieldName: 'order',
		},
		{
			fieldName: 'status',
		},
		{
			fieldName: 'time',
		},
		{
			fieldName: 'teller',
		},

	],
	isNumericalOrder: true,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817',
	isHighlightTextSelected: true
}

export const CONFIG_TABLE_MANAGE_CATALOG_TABLE: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'manage_catalog_table',
	properties: [
		{
			fieldName: 'tableName',
		},
		{
			fieldName: 'description',
		},
		{
			fieldName: 'source',
		},
		{
			fieldName: 'timeUpdate',
		},
		{
			fieldName: 'personUpdate',
		},
		{
			fieldName: 'time',
		}
	],
	isNumericalOrder: true,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817',
	isHighlightTextSelected: true
}

export const CONFIG_TABLE_MANAGE_TABLE_DETAIL: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'manage_table_detail',
	properties: [
		{
			fieldName: 'cardCode',
		},
		{
			fieldName: 'description',
		},
	],
	isNumericalOrder: true,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817',
	isHighlightTextSelected: true,
	isDeleteAndEditAction: true
}

export const CONFIG_TABLE_MANAGE_HISTORY: ConfigTable = {
	nameObjectDetail: 'nameObjectDetail',
	nameTable: 'other_function',
	properties: [
		{
			fieldName: 'code',
		},
		{
			fieldName: 'action',
		},
		{
			fieldName: 'content',
		},
		{
			fieldName: 'teller',
		},
		{
			fieldName: 'time',
		},
	],
	isNumericalOrder: false,
	isBorder: true,
	titleTextColor: 'white',
	backgroundTitleColor: '#d61817'
}
