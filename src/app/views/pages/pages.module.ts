// Angular
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// Partials
// Pages
import {SharedModule} from '../../shared/shared.module';
import {UserRouterAccessGuard} from '../../core/auth/_guards/user-router-access.guard';
import {RouterModule, Routes} from '@angular/router';
import {SampleComponent} from './apps/components/sample/sample.component';
import {CustomerInfoComponent} from './apps/components/combo/customer-info/customer-info.component';
import {GeneralInfoComponent} from './apps/components/combo/general-info/general-info.component';
import {AuditInfoComponent} from './apps/components/combo/audit-info/audit-info.component';
import {Combo1Component} from './apps/components/combo/combo1/combo1.component';
import {PaymentAccountComponent} from './apps/components/payment-account/payment-account.component';
import {OpenAccountInfoComponent} from './apps/components/combo/open-account-info/open-account-info.component';
import {SmsRegisterComponent} from './apps/components/combo/sms-register/sms-register.component';
import {EbankRegisterComponent} from './apps/components/combo/ebank-register/ebank-register.component';
import {Combo2Component} from './apps/components/combo/combo2/combo2.component';
import {Combo3Component} from './apps/components/combo/combo3/combo3.component';
import {OtherInfoComponent} from './apps/components/combo/other-info/other-info.component';
import {SuperComponent} from './apps/components/super/super/super.component';
import {Combo1ExCustomerComponent} from './apps/components/combo/combo-exCustomers/combo1-ex-customer/combo1-ex-customer.component';
import {Combo2ExCustomerComponent} from './apps/components/combo/combo-exCustomers/combo2-ex-customer/combo2-ex-customer.component';
import {Combo3ExCustomerComponent} from './apps/components/combo/combo-exCustomers/combo3-ex-customer/combo3-ex-customer.component';
import {SmsServiceRegisterExCusComponent} from './apps/components/combo/combo-exCustomers/sms-service-register-ex-cus/sms-service-register-ex-cus.component';
import {AsideRightComponent} from './apps/components/aside-right/aside-right.component';
import {DashboardNewComponent} from './apps/components/dasboard-new/dashboard-new.component';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatPaginatorModule} from '@angular/material';
import {StylePaginatorDirective} from './apps/components/dasboard-new/style-paginator.directive';
import {ComboInfoComponent} from './apps/components/combo/combo-info/combo-info.component';
import {SmsComponent} from './apps/components/transaction-operations/sms/sms.component';
import {data} from './apps/components/transaction-operations/seanet/seanet.component';
import {TransactionInfoComponent} from './apps/components/transaction-operations/transaction-info/transaction-info.component';
import {CardComponent} from './apps/components/transaction-operations/card/card.component';
import {AccountComponent} from './apps/components/transaction-operations/account/account.component';
import {TitleTopComponent} from './apps/components/title-top/title-top.component';
import {MockComboComponent} from './apps/components/mock-combo/mock-combo.component';
import {CustomerManagerComponent} from './apps/components/customer-manage/customer-manage.component';
import {AdminNotificationComponent} from './apps/components/dasboard-new/admin-notification/admin-notification.component';
import {PopupNotificationComponent} from './apps/components/dasboard-new/admin-notification/popup-notification/popup-notification.component';
import {SlaChartComponent} from './apps/components/dasboard-new/sla-chart/sla-chart.component';
import {ModalContactComponent} from './apps/components/modal-contact/modal-contact.component';
import {SearchCustomerComponent} from './apps/components/search-customer/search-customer.component';
import {UpdateSignatureComponent} from './apps/components/customer-manage/update-signature/update-signature.component';
import {ModalIdentifyComponent} from './apps/components/aside-right/modal-identify/modal-identify.component';
import {ModalCaptureSignatureComponent} from './apps/components/customer-manage/modal-capture-signature/modal-capture-signature.component';
import {UpdateProspectIdInfoComponent} from './apps/components/customer-manage/update-prospect-id-info/update-prospect-id-info.component';
import {StoreModule} from '@ngrx/store';
import {orcCardReducer} from '../../shared/state/reducer/orc-card.reducer';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {NgxImageCompressService} from 'ngx-image-compress';
import {ModalViewTemplateComponent} from './apps/components/aside-right/modal-view-template/modal-view-template.component';
import {ApprovedErrorComponent} from './apps/components/combo/approvedError/approved-error.component';
import {coreAiUserReducer} from '../../shared/state/reducer/core-ai-user.reducer';
import {TableApproveErrorComponent} from './apps/components/table-approve-error/table-approve-error.component';
import {OpenCardComboComponent} from './apps/components/combo/open-card-combo/open-card-combo.component';
import {UpdateCustomerInfoComponent} from './apps/components/customer-manage/update-customer-info/update-customer-info.component';
import { ChatBotComponent } from './apps/chat-bot/chat-bot.component';
import { ModalCaptureFaceComponent } from './apps/components/aside-right/modal-capture-face/modal-capture-face.component';
import {WebcamModule} from 'ngx-webcam';
import { ChargeInfoComponent } from './apps/components/charge-info/charge-info.component';
export const MY_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY'
	},
};

const routes: Routes = [
	{
		path: '',
		component: DashboardNewComponent,
		children: [
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full'
			},
			{
				path: 'dashboard',
				component: DashboardNewComponent,
				canActivate: [UserRouterAccessGuard],
				data: {
					authorities: ['ADMIN', 'SUPER_ADMIN'],
					reuse: true,
					path: 'dashboard',
					des: ['combo1', 'combo2', 'combo3', 'ex-combo1', 'ex-combo2', 'ex-combo3']
				}
			},
		]
	},
	{
		path: 'combo1',
		component: Combo1Component,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'combo2',
		component: Combo2Component,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'combo3',
		component: Combo3Component,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'super',
		component: SuperComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'ex-combo1',
		component: Combo1ExCustomerComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'ex-combo2',
		component: Combo2ExCustomerComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'ex-combo3',
		component: Combo3ExCustomerComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'sms',
		component: SmsComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'card',
		component: CardComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'e-bank',
		component: data,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'account',
		component: AccountComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'identify',
		loadChildren: () => import('./apps/components/identify-customer/identify-customer.module').then(m => m.IdentifyCustomerModule),
	},
	{
		path: 'mock',
		component: MockComboComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'customer-manage',
		component: CustomerManagerComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'search-customer',
		component: SearchCustomerComponent,
		canActivate: [UserRouterAccessGuard],
	},
	{
		path: 'report',
		loadChildren: () => import('./apps/components/query-transactions-report/query-transactions-report.module').then(m => m.QueryTransactionsReportModule)
	}
];

@NgModule({
	declarations: [
		SampleComponent,
		CustomerInfoComponent,
		GeneralInfoComponent,
		AuditInfoComponent,
		Combo1Component,
		PaymentAccountComponent,
		OpenAccountInfoComponent,
		SmsRegisterComponent,
		EbankRegisterComponent,
		Combo2Component,
		Combo3Component,
		OtherInfoComponent,
		SuperComponent,
		Combo1ExCustomerComponent,
		Combo2ExCustomerComponent,
		Combo3ExCustomerComponent,
		SmsServiceRegisterExCusComponent,
		AsideRightComponent,
		DashboardNewComponent,
		StylePaginatorDirective,
		ComboInfoComponent,
		ApprovedErrorComponent,
		SmsComponent,
		data,
		TransactionInfoComponent,
		CardComponent,
		AccountComponent,
		TitleTopComponent,
		MockComboComponent,
		CustomerManagerComponent,
		AdminNotificationComponent,
		PopupNotificationComponent,
		SlaChartComponent,
		ModalContactComponent,
		SearchCustomerComponent,
		UpdateSignatureComponent,
		ModalIdentifyComponent,
		ModalCaptureSignatureComponent,
		UpdateProspectIdInfoComponent,
		ModalViewTemplateComponent,
		TableApproveErrorComponent,
		OpenCardComboComponent,
		UpdateCustomerInfoComponent,
		ChatBotComponent,
		ModalCaptureFaceComponent,
		ChargeInfoComponent,
	],
    exports: [
        AsideRightComponent,
        Combo1Component,
        Combo2Component,
        Combo3Component,
        Combo1ExCustomerComponent,
        Combo2ExCustomerComponent,
        Combo3ExCustomerComponent,
        SmsComponent,
        AccountComponent,
        CustomerManagerComponent,
        data,
        CardComponent,
        TitleTopComponent,
        AuditInfoComponent,
        ChatBotComponent,
        ChargeInfoComponent
    ],
	imports: [
		CommonModule,
		MatPaginatorModule,
		SharedModule,
		RouterModule.forChild(routes),
		StoreModule.forFeature('orcCard', orcCardReducer),
		StoreModule.forFeature('coreAiUser', coreAiUserReducer),
		WebcamModule
	],
	providers: [
		{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
		{provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
		NgxImageCompressService
	],
	entryComponents: [
		PopupNotificationComponent,
		ModalContactComponent,
		ModalIdentifyComponent,
		ModalCaptureSignatureComponent,
		ModalViewTemplateComponent,
		ModalCaptureFaceComponent
	],
})
export class PagesModule {
}
