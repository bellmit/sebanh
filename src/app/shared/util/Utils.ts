import * as _moment from 'moment';

export function isNullOrEmpty(value: string) {
	return value == null || value == '';
}

export function trimSpace(object: any) {
	Object.keys(object).map(k => object[k] = typeof object[k] == 'string' ? object[k].trim() : object[k]);
}

export function checkCardByCardType(cardType: string) {
	let localDebit = ['S001', 'S002', 'S003', 'S004', 'S005', 'S006', 'S007', 'S008', 'S009', 'S010', 'SEB', 'SEBN', 'SEM', 'SES', 'SSEB', 'SVCC'];
	let visaDebit = ['VSBG', 'VSBS', 'VSME', 'VSMS', 'VSSB', 'VSSC', 'VSSD', 'VSSE', 'VSSF', 'VSSG', 'VSSH', 'VSSL', 'VSSN', 'VSSP', 'VSSQ', 'VSSR', 'VSSY'];
	let visaCredit = ['VSBC', 'VSCC', 'VSCG', 'VSCH', 'VSCL', 'VSCO', 'VSCR', 'VSCS', 'VSMC', 'VSMD', 'VSMF', 'VSMI', 'VSMJ', 'VSMM', 'VSPB', 'VSPC', 'VSPM', 'VSPN', 'VSPQ', 'VSPR',];

	if (localDebit.includes(cardType)) {
		return 'LOCAL_DEBIT';

	} else if (visaDebit.includes(cardType)) {
		return 'VISA_DEBIT';

	} else if (visaCredit.includes(cardType)) {
		return 'VISA_CREDIT';
	}
}


// TODO CONVERT -> feeString : VND1000000 to 1000000;
export function convertFeeInNiceAccount(feeString: string): string {
	return feeString && feeString.substring(3);
}

export function getUniqueListBy(arr, key) {
	return [...new Map(arr.map(item => [item[key], item])).values()];
}

export function dataURIToBlob(dataURI: string) {
	const splitDataURI = dataURI.split(',');
	const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
	const mimeString = splitDataURI[0].split(':')[1].split(';')[0];

	const ia = new Uint8Array(byteString.length);
	for (let i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}

	return new Blob([ia], {type: mimeString});
}

/**
 * Hàm này tính toán số tiền thu nhập của KH, chỉ lấy phần nguyên
 * Example: 3000000 -> 3;
 * @param value -> string number
 */
export function convertInteger(value: string) {

	if (!isNaN(Number(value))) {
		return Math.floor(Number(value) / 1000000).toString();
	}

	return null;
}

/**
 * Hàm này remove special character
 * @param src
 * @param from
 * @param replaceBy
 */
export function saveRemoveCharacter(src: string, from: string, replaceBy: string): string {
	if (!!src) {
		return src.replace(new RegExp(from, 'g'), replaceBy);
	}
	return src;
}

export function splitBy(input, char): string[] {
	if (input) {
		return input.split(char);
	}
	return [];
}

export function safeTrim(src: string): string {
	if (!src) {
		return null;
	}
	return src.trim();
}


export function safeRemoveAllSpace(src: string): string {
	if (!src) {
		return null;
	}
	return src.replace(/ /g, '');
}


/**
 * hàm này format date string YYYYMMDD -> dd/MM/yyyy
 * @param dateString -> định dạng YYYYMMDD
 */
export function formartDateYYYYMMDD(dateString: string): string {
	if (dateString == 'Invalid date') {
		return null;
	}
	return dateString ? _moment(dateString, 'YYYYMMDD').format('DD/MM/YYYY') : null;
}

export function formartDateListYYYYMMDD(dateString: string): any {
	// if(dateString) {
		let dateList = dateString.split('#')
		let convertDate = dateList.map((date) => {
			return _moment(date, "YYYYMMDD").format("DD/MM/YYYY");
		  });
		  return convertDate.toString().replace(/,/g, ';')
	// }
	// if (dateString == 'Invalid date') {
	// 	return null;
	// }
	// return dateString ? _moment(dateString, 'YYYYMMDD').format('DD/MM/YYYY') : null;
}

export function LOG(message: string, dataLog?: any) {
	if (dataLog) {
		console.log(`%c${message}`, 'background: red; color: white', dataLog);
	} else {
		console.log(`%c${message}`, 'background: red; color: white');
	}
}

/**
 * compare function object
 * @param a
 * @param b
 * @param prop
 */
export function compareFunc(a: any, b: any, prop: string) {
	if (a[prop] > b[prop]) {
		return 1;
	}
	if (a[prop] < b[prop]) {
		return -1;
	}
	return 0;
}
