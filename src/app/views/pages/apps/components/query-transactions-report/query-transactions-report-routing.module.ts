// tslint:disable:indent

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {QueryTransactionComponent} from './query-transaction/query-transaction.component';
import {UserRouterAccessGuard} from '../../../../../core/auth/_guards/user-router-access.guard';
import {StatementComponent} from './print-report/statement/statement.component';
import {BalanceReportComponent} from './print-report/balance-report/balance-report.component';
import {SlaReportComponent} from './sla-report/sla-report.component';
import {DailyReportComponent} from './daily-report/daily-report.component';

const routes: Routes = [
	{
		path: 'trans',
		component: QueryTransactionComponent,
		canActivate: [UserRouterAccessGuard]
	},
	{
		path: 'balance',
		component: BalanceReportComponent,
		canActivate: [UserRouterAccessGuard]
	},
	{
		path: 'statement',
		component: StatementComponent,
		canActivate: [UserRouterAccessGuard]
	},
	{
		path: 'daily',
		component: DailyReportComponent,
		canActivate: [UserRouterAccessGuard]
	},
	{
		path: 'sla',
		component: SlaReportComponent,
		canActivate: [UserRouterAccessGuard]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class QueryTransactionsReportRoutingModule {
}
