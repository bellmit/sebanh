export function getRandomTransId(userId: string, type: string) {
	let result = '';
	let now = new Date();
	let year = now.getFullYear();
	let month = (now.getMonth() + 1);
	let day = now.getDate();
	let hour = now.getHours();
	let minute = now.getMinutes();
	let second = now.getSeconds();
	let newDate = new Date(year, month, day, hour, minute, second);

	const dayConvert = day < 10 ? `0${day}` : day;
	const monthConvert = month < 10 ? `0${month}` : month;
	switch (type) {
		case 'combo1': {
			result = `${userId}_CB1_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'combo2': {
			result = `${userId}_CB2_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'combo3': {
			result = `${userId}_CB3_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'super': {
			result = `${userId}_SUP_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'customer': {
			result = `${userId}_CUS_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'account': {
			result = `${userId}_AC_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'card': {
			result = `${userId}_CA_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'ebank': {
			result = `${userId}_IB_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'sms': {
			result = `${userId}_SMS_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'so_phu': {
			result = `${userId}_SKE_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}

		case 'so_du': {
			result = `${userId}_SODU_${dayConvert}${monthConvert}${year}_${newDate.getTime() / 1000}`;
			break;
		}
	}

	return result;
}
