// Angular
import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
// Material
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule} from '@angular/material';
// Translate
import {TranslateModule} from '@ngx-translate/core';
// NGRX
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
// CRUD
import {InterceptService} from '../../../core/_base/crud/';
// Module components
import {AuthComponent} from './auth.component';
import {LoginComponent} from './login/login.component';
import {AuthNoticeComponent} from './auth-notice/auth-notice.component';
// Auth
import {AuthEffects, AuthGuard, authReducer, AuthService} from '../../../core/auth';
import {SharedModule} from "../../../shared/shared.module";
import {T24RegisterComponent} from './t24/t24-register/t24-register.component';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

const routes: Routes = [
	{
		path: '',
		component: AuthComponent,
		children: [
			{
				path: '',
				redirectTo: 'login',
				pathMatch: 'full'
			},
			{
				path: 'login',
				component: LoginComponent,
				data: {returnUrl: window.location.pathname}
			},
		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		RouterModule.forChild(routes),
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		TranslateModule.forChild(),
		StoreModule.forFeature('auth', authReducer),
		EffectsModule.forFeature([AuthEffects]),
		SharedModule
	],
	providers: [
		InterceptService,
		NgbActiveModal,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: InterceptService,
			multi: true
		},
	],
	exports: [AuthComponent],
	declarations: [
		AuthComponent,
		LoginComponent,
		AuthNoticeComponent,
		T24RegisterComponent
	]
})

export class AuthModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: AuthModule,
			providers: [
				AuthService,
				AuthGuard
			]
		};
	}
}
