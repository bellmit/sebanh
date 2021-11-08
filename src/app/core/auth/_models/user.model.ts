import {BaseModel} from '../../_base/crud';

export class User extends BaseModel {
	customerID: string;
	shortName: string;
	customerType: string;
	dateOfBirth: string;
	nationality: string;
	phone: string;
	sms: string;
	email: string;
	customerStatus: string;
	customerClass: string;
	sms2: string;
	gender: string;
	accessToken: string;
	refreshToken: string;
	authorities: string[];

	clear(): void {
		this.customerID = '';
		this.shortName = '';
		this.customerType = '';
		this.dateOfBirth = '';
		this.nationality = '';
		this.gender = '';
		this.phone = '';
		this.sms = '';
		this.email = '';
		this.customerStatus = '';
		this.customerClass = '';
		this.sms2 = '';
		this.authorities = [];

		this.accessToken = 'access-token-' + Math.random();
		this.refreshToken = 'access-token-' + Math.random();
	}
}
