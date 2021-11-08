import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {SystemManagementRoutingModule} from './system-management-routing.module';
import {AdvertisementInformationComponent} from "./advertisement-information/advertisement-information.component";
import {AdvertisementMappingComponent} from "./advertisement-mapping/advertisement-mapping.component";
import {AnnouncementsManagementComponent} from "./announcement/announcements-management/announcements-management.component";
import {AddAnnouncementComponent} from "./announcement/add-announcement/add-announcement.component";
import {SystemTimeoutComponent} from "./declare-system-parameters/system-timeout/system-timeout.component";
import {DeclareSimilarAIComponent} from "./declare-system-parameters/declare-similar-ai/declare-similar-ai.component";
import {ManageCatalogTableComponent} from "./manage-catalog-table/manage-catalog-table.component";
import {OtherFunctionComponent} from "./other-function/other-function.component";
import {DeclareSystemParametersComponent} from "./declare-system-parameters/declare-system-parameters.component";
import {SharedModule} from "../../../shared/shared.module";


@NgModule({
	declarations: [
		OtherFunctionComponent,
		ManageCatalogTableComponent,
		DeclareSimilarAIComponent,
		SystemTimeoutComponent,
		AddAnnouncementComponent,
		AnnouncementsManagementComponent,
		AdvertisementMappingComponent,
		AdvertisementInformationComponent,
		AnnouncementsManagementComponent,
		AdvertisementInformationComponent,
		AddAnnouncementComponent,
		DeclareSimilarAIComponent,
		SystemTimeoutComponent,
		DeclareSystemParametersComponent
	],
	imports: [
		CommonModule,
		SystemManagementRoutingModule,
		CommonModule,
		SharedModule,
	]
})
export class SystemManagementModule {
}
