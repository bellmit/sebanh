// VietNam
import {Locale} from '../../_base/layout/services/translation.service';
import {locale as enLang} from './shared/en';
import {locale as vnLang} from './shared/vn';
import {locale as vnVoucher} from './voucher/vn';
import {locale as enVoucher} from './voucher/en';
import {locale as vnUser} from './user-group/vn';
import {locale as enUser} from './user-group/en';
import {locale as vnDynamicTable} from './dynamic-table/vn';
import {locale as enDynamicTable} from './dynamic-table/en';
import {locale as vnDashboard} from './dashboard/vn';
import {locale as enDashboard} from './dashboard/en';


export const locales: Locale[] = [
	enLang, vnLang,
	vnVoucher, enVoucher,
	vnUser, enUser,
	vnDynamicTable, enDynamicTable,
	vnDashboard, enDashboard
];
