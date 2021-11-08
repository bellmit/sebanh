import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IdentifyCustomerRoutingModule} from './identify-customer-routing.module';
import {IdentifyCustomerComponent} from './identify-customer/identify-customer.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {IdentifyCustomerInfoComponent} from './identify-customer-info/identify-customer-info.component';
import { NotFoundCustomerComponent } from './not-found-customer/not-found-customer.component';
import {PagesModule} from "../../../pages.module";
import {WebcamModule} from 'ngx-webcam';
// import {WebcamModule} from "ngx-webcam";

@NgModule({
	declarations: [
		IdentifyCustomerComponent,
		IdentifyCustomerInfoComponent,
		NotFoundCustomerComponent,
	],
    imports: [
        CommonModule,
        IdentifyCustomerRoutingModule,
        SharedModule,
        PagesModule,
        WebcamModule,
    ]
})
export class IdentifyCustomerModule {
}
