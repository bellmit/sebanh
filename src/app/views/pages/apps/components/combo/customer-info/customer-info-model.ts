export class CustomerInfoModel {
	accOfficer: string;
	addCurrentAddress: string;
	addPermanentAddress: string;
	addShortName: string;
	answer: string;
	currentAddress: string;
	customerClass: string;
	customerID: string;
	customerStatus: string;
	customerType: string;
	dateOfBirth: string;
	email: string;
	employersAdd: string;
	employersName: string;
	employmentStatus: string;
	gender: string;
	industry: string;
	industryClass: string;
	industryGroup: string;
	legalDocName: any;
	legalID: string;
	legalIssAuth: any;
	legalIssDate: string;
	maritalStatus: string;
	nationality: string;
	noOfDependents: string;
	occupation: string;
	passExpDate: string;
	passIssDate: string;
	passPlaceIss: string;
	permanentAddress: string;
	phone: string;
	province: string;
	question: string;
	resident: string;
	responseCode: string;
	salary: string;
	seabDistrict1: string;
	seabOwnCust: string;
	seabOwnerBen: string;
	seabPob: string;
	seabPurpose: string;
	seabRegStatus: string;
	shortName: string;
	sms: string;
	sms2: string;
	subIndustry: string;
	taxID: string;
	title: string;
	country: string;
	legalHolderName: string;
	addrLocation: string;
	fax1: string;
	loyalty: string;
	legalExpDate: string;
	address: any;
	isSameIdenAddress: boolean;
	relationCode: string;
	relCustomer: string;
	portfolio: string;
	customerCcy: number;
	otherNationalty: string;
}


/**
 * convert trường address trong truy vấn customer core T24
 * định dạng trả ra: 'OTHER:38 YET KIEU&&CURRTOWN:PHUONG#CUA NAM&&CURRDISTRICT:QUAN HOAN KIE#M&&CURRCITY:HA NOI CITY&&CURRCITYID#:4';
 */
export class CustomerAddress {
	other?: string;

	currTown?: string;

	currDistrict?: string;

	currCity?: string;

	currCityId?: string;
}

// export function convertCustomerAddress(address: any): CustomerAddress {
// 	if (address == null) {
// 		return null;
// 	}
//
// 	const addressList = (address && address.includes('&&') && address.includes(':')) ? address.replace(/#/g, '').split('&&'): [];
//
// 	if (addressList.length < 1) {
// 		return null;
// 	}
//
// 	let customerAddress = new CustomerAddress();
//
// 	for (let i = 0; i < addressList.length; i++) {
//
// 		if (!addressList[i].includes(':')) {
// 			continue;
// 		}
//
// 		let key = addressList[i].substring(0, addressList[i].indexOf(':'));
// 		let value = addressList[i].substring(addressList[i].indexOf(':') + 1);
//
// 		switch (key.toUpperCase()) {
// 			case 'OTHER':
// 				customerAddress.other = value ? value : '';
// 				break;
//
// 			case 'CURRTOWN':
// 				customerAddress.currTown = value ? value : '';
// 				break;
//
// 			case 'CURRDISTRICT':
// 				customerAddress.currDistrict = value ? value : '';
// 				break;
//
// 			case 'CURRCITY':
// 				customerAddress.currCity = value ? value : '';
// 				break;
//
// 			case 'CURRCITYID':
// 				customerAddress.currCityId = value ? value : '';
// 				break;
// 		}
// 	}
// 	return customerAddress;
//
// }

export function convertCustomerAddress(address: any): CustomerAddress {
	if (address == null) {
		return null;
	}

	const addressList = (address && address.includes('&&')) ? address.replace(/#/g, '').split('&&') : [];

	if (addressList.length < 1) {
		return null;
	}

	let customerAddress = new CustomerAddress();

	if (addressList.length > 0) {
		customerAddress.other = addressList[0] ? addressList[0] : '';
	}

	if (addressList.length > 1) {
		customerAddress.currTown = addressList[1] ? addressList[1] : '';
	}

	if (addressList.length > 2) {
		customerAddress.currDistrict = addressList[2] ? addressList[2] : '';
	}

	if (addressList.length > 3) {
		customerAddress.currCity = addressList[3] ? addressList[3] : '';
	}

	return customerAddress;

}
