import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {IdentifyCustomerComponent} from './identify-customer/identify-customer.component';
import {UserRouterAccessGuard} from '../../../../../core/auth/_guards/user-router-access.guard';
import {IdentifyCustomerInfoComponent} from './identify-customer-info/identify-customer-info.component';
import {NotFoundCustomerComponent} from "./not-found-customer/not-found-customer.component";


const routes: Routes = [
	{
		path: '',
		component: IdentifyCustomerComponent,
		canActivate: [UserRouterAccessGuard]
	},
	{
		path: 'info',
		component: IdentifyCustomerInfoComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			reuse: true,
			path: 'identify/info',
			des: ['customer-manage']
		}
	},
	{
		path: 'not-found-customer',
		component: NotFoundCustomerComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			reuse: true,
			path: 'identify/not-found-customer',
			des: ['info']
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class IdentifyCustomerRoutingModule {
}
