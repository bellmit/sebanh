import {NgModule} from '@angular/core';
import {SharedLibsModule} from './shared-libs.module';
import {BlockSpecialKeyDirective} from './directives/block-special-key.directive';
import {InputCurrencyDirective} from './directives/input-currency.directive';
import {ModalNotifyComponent} from './directives/modal-common/modal-notify/modal-notify.component';
import {ModalAskComponent} from './directives/modal-common/modal-ask/modal-ask.component';
import {DatePipe, DecimalPipe} from '@angular/common';
import {ConvertStringToDateSTO, DateFormatPipe} from './util/function-common';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material';
import {APP_DATE_FORMATS, AppDateAdapter} from './util/format-datepicker';
import {HasAnyAuthorityDirective} from './directives/has-any-authority.directive';
import {AutofocusDirective} from './directives/autofocus.directive';
import {DynamicTableComponent} from './commons/dynamic-table/dynamic-table.component';
import {KtDynamicTableComponent} from './commons/kt-dynamic-table/kt-dynamic-table.component';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {BlockNonNumberDirective} from './directives/block-non-number.directive';
import {ScrollerDirective} from '../core/_base/layout/directives/scroller.directive';
import {ModalDeleteComponent} from './directives/modal-common/modal-delete/modal-delete.component';
import {ModalChangeCoCode} from './directives/modal-common/modal-change-cocode/modal-change-cocode.component';
import {ModalChangePass} from '../views/pages/auth/t24/modal-change-pass/modal-change-pass.component';
import {ModalNotification} from './directives/modal-common/modal-notification/modal-notification.component';
import {TrimFirstLastDirective} from './directives/trim-first-last.directive';
import {TrimSpaceDirective} from './directives/trim-space.directive';
import {RemoveVietnameseDirective} from './directives/remove-vietnamese.directive';
import {ModalChooseCustomerComponent} from './directives/modal-common/modal-choose-customer/modal-choose-customer.component';
import {ModalDetailChartComponent} from './directives/modal-common/modal-detail-chart/modal-detail-chart.component';
import {ModalQuickActionComponent} from './directives/modal-common/modal-quick-action/modal-quick-action.component';
import {DateEnterDirective} from './directives/date-enter.directive';
import {DotdotdotPipe} from './pipes/dotdotdot.pipe';
import {HighLightChangeInputDirective} from './directives/high-light-change-input.directive';
import {OldValueT24Component} from './commons/old-value-t24/old-value-t24.component';
import {ReplaceThangPipe} from './pipes/replace-thang.pipe';


@NgModule({
	imports: [
		SharedLibsModule
	],
	declarations: [
		BlockSpecialKeyDirective,
		HasAnyAuthorityDirective,
		InputCurrencyDirective,
		ModalNotifyComponent,
		ModalAskComponent,
		ModalDeleteComponent,
		ModalChangeCoCode,
		ModalNotification,
		ModalChangePass,
		DateFormatPipe,
		ConvertStringToDateSTO,
		AutofocusDirective,
		DynamicTableComponent,
		KtDynamicTableComponent,
		BlockNonNumberDirective,
		ScrollerDirective,
		TrimFirstLastDirective,
		TrimSpaceDirective,
		RemoveVietnameseDirective,
		ModalChooseCustomerComponent,
		ModalDetailChartComponent,
		ModalQuickActionComponent,
		DateEnterDirective,
		DotdotdotPipe,
		HighLightChangeInputDirective,
		OldValueT24Component,
		ReplaceThangPipe
	],
	exports: [
		SharedLibsModule,
		BlockSpecialKeyDirective,
		HasAnyAuthorityDirective,
		InputCurrencyDirective,
		ModalNotifyComponent,
		ModalAskComponent,
		DateFormatPipe,
		ConvertStringToDateSTO,
		AutofocusDirective,
		DynamicTableComponent,
		KtDynamicTableComponent,
		BlockNonNumberDirective,
		ScrollerDirective,
		TrimFirstLastDirective,
		TrimSpaceDirective,
		RemoveVietnameseDirective,
		ModalChooseCustomerComponent,
		DateEnterDirective,
		DotdotdotPipe,
		HighLightChangeInputDirective,
		OldValueT24Component,
		ReplaceThangPipe
	],
	entryComponents: [
		ModalNotifyComponent,
		ModalAskComponent,
		ModalDeleteComponent,
		ModalChangeCoCode,
		ModalChangePass,
		ModalNotification,
		ModalChooseCustomerComponent,
		ModalDetailChartComponent,
		ModalQuickActionComponent
	],
	providers: [
		DatePipe,
		DecimalPipe,
		NgbActiveModal,
		DateFormatPipe,
		{provide: DateAdapter, useClass: AppDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
		{provide: MAT_DATE_LOCALE, useValue: 'vi-VN'},
	],
})
export class SharedModule {
}
