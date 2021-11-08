// Anglar
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
// Layout Directives
// Services
import {
	ContentAnimateDirective,
	FirstLetterPipe,
	GetObjectPipe,
	HeaderDirective,
	JoinPipe,
	MenuDirective,
	OffcanvasDirective,
	SafePipe,
	ScrollTopDirective,
	SparklineChartDirective,
	StickyDirective,
	TabClickEventDirective,
	TimeElapsedPipe,
	ToggleDirective,
	TwoDigitDecimaNumberDirective
} from './_base/layout';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {AuthInterceptor} from "./auth/interceptor/auth.interceptor";
import {CardStatusPipe} from "./_base/layout/pipes/card-status.pipe";
import {StatusPipe} from "./_base/layout/pipes/status.pipe";
import {ComboTypePipe} from "./_base/layout/pipes/combo-type.pipe";
import {ProductTypePipe} from "./_base/layout/pipes/product.pipe";
import {PriorityPipe} from "./_base/layout/pipes/priority.pipe";
import {PercentPipe} from "./_base/layout/pipes/percent.pipe";
import {DatePipeCustom} from "./_base/layout/pipes/date-pipe-custom";
import {TimeSlaMinutePipe} from "./_base/layout/pipes/time-sla-minute.pipe";
import {CoreAiPipe} from "./_base/layout/pipes/core-ai.pipe";
import {CoreAiTitlePipe} from "./_base/layout/pipes/core-ai-title.pipe";

@NgModule({
	imports: [CommonModule],
	declarations: [
		// directives
		ScrollTopDirective,
		HeaderDirective,
		OffcanvasDirective,
		ToggleDirective,
		MenuDirective,
		TwoDigitDecimaNumberDirective,
		TabClickEventDirective,
		SparklineChartDirective,
		ContentAnimateDirective,
		StickyDirective,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		FirstLetterPipe,
		CardStatusPipe,
		StatusPipe,
		ComboTypePipe,
		ProductTypePipe,
		PriorityPipe,
		PercentPipe,
		DatePipeCustom,
		TimeSlaMinutePipe,
		CoreAiPipe,
		CoreAiTitlePipe
	],
	exports: [
		// directives
		ScrollTopDirective,
		HeaderDirective,
		OffcanvasDirective,
		ToggleDirective,
		MenuDirective,
		TwoDigitDecimaNumberDirective,
		TabClickEventDirective,
		SparklineChartDirective,
		ContentAnimateDirective,
		StickyDirective,
		// pipes
		TimeElapsedPipe,
		JoinPipe,
		GetObjectPipe,
		SafePipe,
		FirstLetterPipe,
		CardStatusPipe,
		StatusPipe,
		ComboTypePipe,
		ProductTypePipe,
		PriorityPipe,
		PercentPipe,
		DatePipeCustom,
		TimeSlaMinutePipe,
		CoreAiPipe,
		CoreAiTitlePipe
	],
	providers: [
		ProductTypePipe,
		ComboTypePipe,
		StatusPipe,
		PriorityPipe,
		PercentPipe,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true
		}
	]
})
export class CoreModule {
}
