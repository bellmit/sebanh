// Angular
import {BrowserModule, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DateAdapter, GestureConfig, MAT_DATE_FORMATS, MatProgressSpinnerModule} from '@angular/material';
import {OverlayModule} from '@angular/cdk/overlay';
// Angular in memory
import {HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
// Perfect Scroll bar
import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';
// SVG inline
import {InlineSVGModule} from 'ng-inline-svg';
// Env
import {environment} from '../environments/environment';
// Hammer JS
import 'hammerjs';
// NGX Permissions
import {NgxPermissionsModule} from 'ngx-permissions';
// NGRX
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
// State
import {metaReducers, reducers} from './core/reducers';
// Copmponents
import {AppComponent} from './app.component';
// Modules
import {AppRoutingModule} from './app-routing.module';
import {CoreModule} from './core/core.module';
import {ThemeModule} from './views/theme/theme.module';
// Partials
import {PartialsModule} from './views/partials/partials.module';


// Layout Services
import {
	DataTableService,
	KtDialogService,
	LayoutConfigService,
	LayoutRefService,
	MenuAsideService,
	MenuConfigService,
	MenuHorizontalService,
	PageConfigService,
	SplashScreenService,
	SubheaderService
} from './core/_base/layout';
// Auth
import {AuthModule} from './views/pages/auth/auth.module';
import {AuthService} from './core/auth';
// CRUD
import {HttpUtilsService, LayoutUtilsService, TypesUtilsService} from './core/_base/crud';
// Config
import {LayoutConfig} from './core/_config/layout.config';
// Highlight JS
import {HIGHLIGHT_OPTIONS, HighlightLanguage} from 'ngx-highlightjs';
import * as typescript from 'highlight.js/lib/languages/typescript';
import * as scss from 'highlight.js/lib/languages/scss';
import * as xml from 'highlight.js/lib/languages/xml';
import * as json from 'highlight.js/lib/languages/json';
import {NgxWebstorageModule} from 'ngx-webstorage';
import {ToastrModule} from 'ngx-toastr';
import {SharedModule} from './shared/shared.module';
import {APP_DATE_FORMATS, AppDateAdapter} from './shared/util/format-datepicker';
import {AppConfigService} from './app-config.service';
import {T24RegisterComponent} from './views/pages/auth/t24/t24-register/t24-register.component';
import {CommonModule} from '@angular/common';
import {NgxPrintDirective} from 'ngx-print';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DBConfig, NgxIndexedDBModule} from 'ngx-indexed-db';
import {SEATELLER_DB} from './shared/util/constant';
import {ServiceWorkerModule} from '@angular/service-worker';
import {WebcamModule} from 'ngx-webcam';

// tslint:disable-next-line:class-name
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	wheelSpeed: 0.5,
	swipeEasing: true,
	minScrollbarLength: 40,
	maxScrollbarLength: 300,
};

export function initializeLayoutConfig(appConfig: LayoutConfigService) {
	appConfig.resetConfig();
	// initialize app by loading default demo layout config
	return () => {
		if (appConfig.getConfig() === null) {
			appConfig.loadConfigs(new LayoutConfig().configs);
		}
	};
}

const dbConfig: DBConfig = {
	name: SEATELLER_DB.name,
	version: 1,
	objectStoresMeta: [
		{
			store: SEATELLER_DB.schema.name,
			storeConfig: {keyPath: SEATELLER_DB.schema.key_user, autoIncrement: false},
			storeSchema: [
				{name: SEATELLER_DB.schema.key_user, keypath: SEATELLER_DB.schema.key_user, options: {unique: true}},
				{name: SEATELLER_DB.schema.key_notif_id, keypath: SEATELLER_DB.schema.key_notif_id, options: {unique: false}}
			]
		},
		{
			store: SEATELLER_DB.schemaQuickAction.name,
			storeConfig: {keyPath: SEATELLER_DB.schemaQuickAction.key_user, autoIncrement: false},
			storeSchema: [
				{name: SEATELLER_DB.schemaQuickAction.key_user, keypath: SEATELLER_DB.schemaQuickAction.key_user, options: {unique: true}},
				{
					name: SEATELLER_DB.schemaQuickAction.key_action,
					keypath: SEATELLER_DB.schemaQuickAction.key_action,
					options: {unique: false}
				}
			]
		}
	]
};

export function hljsLanguages(): HighlightLanguage[] {
	return [
		{name: 'typescript', func: typescript},
		{name: 'scss', func: scss},
		{name: 'xml', func: xml},
		{name: 'json', func: json}
	];
}

const appInitializer = (appConfig: AppConfigService) => {
	return () => {
		return appConfig.loadAppConfig();
	};
};

@NgModule({
	declarations: [AppComponent],
	imports: [
		CommonModule,
		BrowserAnimationsModule,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		NgxPermissionsModule.forRoot(),
		PartialsModule,
		CoreModule,
		OverlayModule,
		StoreModule.forRoot({reducers}, {metaReducers}),
		EffectsModule.forRoot([]),
		StoreRouterConnectingModule.forRoot({stateKey: 'router'}),
		StoreDevtoolsModule.instrument(),
		AuthModule.forRoot(),
		TranslateModule.forRoot(),
		MatProgressSpinnerModule,
		InlineSVGModule.forRoot(),
		NgxWebstorageModule.forRoot(),
		ToastrModule.forRoot({
			timeOut: 5000,
			positionClass: 'toast-top-center',
			progressBar: true,
			preventDuplicates: true,
			closeButton: true
		}),
		ThemeModule,
		SharedModule,
		NgbModule,
		NgxIndexedDBModule.forRoot(dbConfig),
		ServiceWorkerModule.register('ngsw-worker.js', {enabled: false}),
		WebcamModule
	],
	exports: [],
	providers: [
		AuthService,
		LayoutConfigService,
		LayoutRefService,
		MenuConfigService,
		PageConfigService,
		KtDialogService,
		DataTableService,
		SplashScreenService,
		NgxPrintDirective,
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		},
		{
			provide: HAMMER_GESTURE_CONFIG,
			useClass: GestureConfig
		},
		{
			// layout config initializer
			provide: APP_INITIALIZER,
			useFactory: initializeLayoutConfig,
			deps: [LayoutConfigService], multi: true
		},
		{
			provide: HIGHLIGHT_OPTIONS,
			useValue: {languages: hljsLanguages}
		},
		// template services
		SubheaderService,
		MenuHorizontalService,
		MenuAsideService,
		HttpUtilsService,
		TypesUtilsService,
		LayoutUtilsService,
		{provide: DateAdapter, useClass: AppDateAdapter},
		{provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS},
		AppConfigService,
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializer,
			multi: true,
			deps: [AppConfigService]
		},
	],
	bootstrap: [AppComponent],
	entryComponents: [T24RegisterComponent]
})
export class AppModule {
}
