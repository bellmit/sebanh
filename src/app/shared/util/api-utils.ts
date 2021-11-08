import {sha256} from 'js-sha256';
import {Base64Util} from './base-64-util';
import {LOG} from './Utils';


export function buildRequest(request: any, seabReq?: boolean) {
	let bodyReq = null;

	if (seabReq) {
		// dataBase64 = Base64Util.encode(JSON.stringify({seabReq: request}));
		bodyReq = {
			seabReq: request
		};
	} else {
		bodyReq = request;
	}

	LOG('data request >>>>>>', JSON.stringify(bodyReq));
	const dataBase64 = Base64Util.encode(JSON.stringify(bodyReq));

	const bodyRequest = {
		data: dataBase64,
		checksum: getCheckSum(dataBase64)
	};
	return bodyRequest;
}

export function buildRequest2(request: any, seabRes?: boolean) {
	LOG('data request >>>>>>:::::', JSON.stringify(request));
	let dataBase64 = Base64Util.encode(JSON.stringify(request));

	if (seabRes) {
		dataBase64 = Base64Util.encode(JSON.stringify({seabRes: request}));
		LOG('data request seaReq >>>>>>:::::', JSON.stringify({seabRes: request}));
	}

	const bodyRequest = {
		data: dataBase64,
		checksum: getCheckSum(dataBase64)
	};
	return bodyRequest;
}

export function getResponseApi(response) {
	const dataResBase64 = response.data;
	const checkSumRes = response.checksum;
	const appCheckSum = getCheckSum(dataResBase64);

	if (checkSumRes != appCheckSum) {
		LOG(`---------- CheckSum invalid ---------`);
		return null;
	} else {
		const response = Base64Util.decode(dataResBase64);
		LOG('data response >>>>>>', response);
		return JSON.parse(response);
	}
}

export function getCheckSum(dataReqBase64) {
	const secretKey = localStorage.getItem('secretKey');
	if (secretKey) {
		return sha256.hmac(secretKey, dataReqBase64);
	}
}
