import moment from 'moment';

export function formatDate(dateString: string) {
	const momentFromDateObj = moment(dateString, 'DD-MM-YYYY');
	const momentFromDateStr = momentFromDateObj.format('DD-MM-YYYY');
	return momentFromDateStr;
}

export function formatDate2(dateString: string) {
	const momentFromDateObj = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
	const momentFromDateStr = momentFromDateObj.local().format('DD/MM/YYYY HH:mm:ss');
	return momentFromDateStr;
}

export function formatDateReseve(dateString: string) {
	const momentFromDateObj = moment(dateString, 'YYYYMMDD');
	const momentFromDateStr = momentFromDateObj.local().format('YYYYMMDD');
	return momentFromDateStr;
}

export function formatDateDDMMYYYHHss(date: Date) {
	return moment(date).format('DD/MM/YYYY HH:mm');
}


export function formatTimeStamp(dateString: string) {
	const momentFromDateObj = moment(dateString, 'DD-MM-YYYY HH:mm:ss');
	const momentFromDateStr = momentFromDateObj.format('DD-MM-YYYY HH:mm:ss');
	return momentFromDateStr;
}

export function parseDateFrmStr(value: string, type?: string): Date | null {
	if (type == 'month') {
		const str = value.split('/');

		const year = Number(str[1]);
		const month = Number(str[0]) - 1;
		const date = Number(9);

		return new Date(year, month, date);
	} else if (type == 'string') {
		console.log('ssssssssssssssssss', value);
		let year1 = value.substr(0, 4);
		let month1 = value.substr(4, 2);
		let day1 = value.substr(6, 2);


		const year = Number(year1);
		const month = Number(month1) - 1;
		const date = Number(day1);
		return new Date(year, month, date);

	} else if ((typeof value === 'string') && (value.includes('-'))) {
		const str = value.split('-');

		const year = Number(str[2]);
		const month = Number(str[1]) - 1;
		const date = Number(str[0]);

		console.log('new Date(year, month, date);', new Date(year, month, date));
		return new Date(year, month, date);
	} else if ((typeof value === 'string') && value === '') {
		return new Date();
	} else if (((typeof value === 'string') && (value.includes('/')))) {
		const str = value.split('/');

		const year = Number(str[2]);
		const month = Number(str[1]) - 1;
		const date = Number(str[0]);

		return new Date(year, month, date);
	}
	const timestamp = typeof value === 'number' ? value : Date.parse(value);
	return isNaN(timestamp) ? null : new Date(timestamp);
}

export function betweenTwoDay(expireDay: any) {
	const expireDate: any = moment(expireDay).format('x');

	const today = Date.now();
	const oneDay = 24 * 60 * 60 * 1000;
	const diffDays = Math.round(Math.abs((expireDate - today) / oneDay));
	return diffDays;
}

export function parseDateyMdFrmStr(value: string): Date | null {
	if ((typeof value === 'string') && (value.includes('-'))) {
		const str = value.split('-');

		const year = Number(str[0]);
		const month = Number(str[1]) - 1;
		const date = Number(str[2]);

		return new Date(year, month, date);
	} else if ((typeof value === 'string') && value === '') {
		return new Date();
	}
	const timestamp = typeof value === 'number' ? value : Date.parse(value);
	return isNaN(timestamp) ? null : new Date(timestamp);
}

export function formatDateFromApi(value: string) {
	if (typeof value == 'string') {
		let dateTime = value.split(' ');
		let date = dateTime[0];
		let time = dateTime[1];

		let dateArr = date.split('-');
		let day = Number(dateArr[2]);
		let month = Number(dateArr[1]);
		let year = Number(dateArr[0]);

		let timeArr = time.split(':');
		let hour = Number(timeArr[0]);
		let minute = Number(timeArr[1]);
		let second = Number(timeArr[2]);

		return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
	}
}

export function formatDateSLA(dateString: any) {
	return moment(dateString, 'DD/MM/YYYY HH:mm:ss').format('MM/DD/YYYY HH:mm:ss');
}

export function formatStringToLongTime(dateString: string) {
	const momentFromDateObj = moment(dateString, 'DD/MM/YYYY HH:mm:ss a');
	// @ts-ignore
	return new Date(momentFromDateObj).getTime();
}

export function parseDate(dateString: string, format: string) {
	// @ts-ignore
	return new Date(moment(dateString, format));
}

export function timeSince(date) {

	// @ts-ignore
	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = seconds / 31536000;

	if (interval > 1) {
		return Math.floor(interval) + ' years';
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		return Math.floor(interval) + ' months';
	}
	interval = seconds / 86400;
	if (interval > 1) {
		return Math.floor(interval) + ' days';
	}
	interval = seconds / 3600;
	if (interval > 1) {
		return Math.floor(interval) + ' hours';
	}
	interval = seconds / 60;
	if (interval > 1) {
		return Math.floor(interval) + ' minutes';
	}
	return Math.floor(seconds) + ' seconds';
}

export function stringToDate(src: string, format: string) {
	const date = moment(src, format);
	return date.isValid() ? date : null;
}
