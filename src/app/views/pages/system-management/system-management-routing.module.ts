import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AnnouncementsManagementComponent} from "./announcement/announcements-management/announcements-management.component";
import {UserRouterAccessGuard} from "../../../core/auth/_guards/user-router-access.guard";
import {AdvertisementInformationComponent} from "./advertisement-information/advertisement-information.component";
import {DeclareSystemParametersComponent} from "./declare-system-parameters/declare-system-parameters.component";
import {DeclareSimilarAIComponent} from "./declare-system-parameters/declare-similar-ai/declare-similar-ai.component";
import {AdvertisementMappingComponent} from "./advertisement-mapping/advertisement-mapping.component";
import {ManageCatalogTableComponent} from "./manage-catalog-table/manage-catalog-table.component";
import {OtherFunctionComponent} from "./other-function/other-function.component";
import {Combo1Component} from "../apps/components/combo/combo1/combo1.component";


const routes: Routes = [
	{
		path: 'announcement',
		component: AnnouncementsManagementComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'advertisement-info',
		component: AdvertisementInformationComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'declare-system-parameter',
		component: DeclareSystemParametersComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'declare-similar-ai',
		component: DeclareSimilarAIComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'advertisement-mapping',
		component: AdvertisementMappingComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'manage-catalog-table',
		component: ManageCatalogTableComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
	{
		path: 'other-function',
		component: OtherFunctionComponent,
		canActivate: [UserRouterAccessGuard],
		data: {
			authorities: ['ADMIN', 'SUPER_ADMIN'],
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SystemManagementRoutingModule {
}
