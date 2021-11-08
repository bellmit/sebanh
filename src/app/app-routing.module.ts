// Angular
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// Components
import {BaseComponent} from './views/theme/base/base.component';
import {ErrorPageComponent} from './views/theme/content/error-page/error-page.component';
// Auth
import {AuthGuard} from './core/auth';

// @ts-ignore
const routes: Routes = [
	{path: 'auth', loadChildren: () => import('app/views/pages/auth/auth.module').then(m => m.AuthModule)},
	{
		path: '',
		component: BaseComponent,
		canActivate: [AuthGuard],
		children: [
			{
				path: 'pages',
				loadChildren: () => import('app/views/pages/pages.module').then(m => m.PagesModule)
			},
			{
				path: 'admin',
				data: {roles: ['ROLE_ADMIN']},
				loadChildren: () => import('./views/pages/system-management/system-management.module').then(m => m.SystemManagementModule),
			},
			{
				path: 'error/403',
				component: ErrorPageComponent,
				data: {
					type: 'error-v6',
					code: 403,
					title: '403... Access forbidden',
					desc: 'Looks like you don\'t have permission to access for requested page.<br> Please, contact administrator',
				},
			},
			{path: 'error/:type', component: ErrorPageComponent},
			{path: '', redirectTo: 'pages', pathMatch: 'full'},
			{path: '**', redirectTo: 'pages', pathMatch: 'full'},
		],
	},
	{
		path: '**',
		redirectTo: 'error/403',
		pathMatch: 'full'
	},
];

@NgModule({
	imports: [
		RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {
}
