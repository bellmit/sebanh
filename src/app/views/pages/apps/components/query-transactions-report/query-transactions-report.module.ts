import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {QueryTransactionsReportRoutingModule} from './query-transactions-report-routing.module';
import {QueryTransactionComponent} from './query-transaction/query-transaction.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {PagesModule} from '../../../pages.module';
import {StatementComponent} from './print-report/statement/statement.component';
import {BalanceReportComponent} from './print-report/balance-report/balance-report.component';
import {FeeInformationComponent} from './print-report/fee-information/fee-information.component';
import {SlaReportComponent} from './sla-report/sla-report.component';
import {SemiCircleDonutChartComponent} from './sla-report/chart-component/semi-circle-donut-chart/semi-circle-donut-chart.component';
import {CircleChartComponent} from './sla-report/chart-component/circle-chart/circle-chart.component';
import {StackedBarChartComponent} from './sla-report/chart-component/stacked-bar-chart/stacked-bar-chart.component';
import {StackedColumnChartComponent} from './sla-report/chart-component/stacked-column-chart/stacked-column-chart.component';
import {SlaRealtimeComponent} from './sla-report/sla-realtime/sla-realtime.component';
import {SlaHistoryComponent} from './sla-report/sla-history/sla-history.component';
import {ErrorTransComponent} from './sla-report/error-trans/error-trans.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DailyReportComponent} from './daily-report/daily-report.component';
import { SlaHistoryDetailComponent } from './sla-report/sla-history-detail/sla-history-detail.component';

export const MY_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY'
	},
};

@NgModule({
    declarations: [
        QueryTransactionComponent,
        StatementComponent,
        DailyReportComponent,
        BalanceReportComponent,
        FeeInformationComponent,
        SlaReportComponent,
        SemiCircleDonutChartComponent,
        CircleChartComponent,
        StackedBarChartComponent,
        StackedColumnChartComponent,
        SlaRealtimeComponent,
        SlaHistoryComponent,
        ErrorTransComponent,
        SlaHistoryDetailComponent
    ],
    imports: [
        CommonModule,
        QueryTransactionsReportRoutingModule,
        SharedModule,
        PagesModule
    ],
    exports: [
    ],
    providers: [
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
        {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
    ]
})
export class QueryTransactionsReportModule {
}
