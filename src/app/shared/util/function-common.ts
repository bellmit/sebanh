import {FormGroup, Validators} from '@angular/forms';
import {RegexCfg} from '../model/regex-cfg.model';
import {TranslateService} from '@ngx-translate/core';
import {Pipe, PipeTransform} from '@angular/core';
import {DatePipe} from '@angular/common';
import {USER_PROFILE} from "./constant";
import {User} from "../../core/auth";

export function buildValidatorsFromRegexCfg(regexCfg: RegexCfg, form: FormGroup, controlName: string) {
	if (regexCfg === null || regexCfg === undefined) {
		return;
	}
	let cfg = [];
	let regex = '';
	cfg.push(Validators.required);
	if (regexCfg.maxLength !== null) {
		cfg.push(Validators.maxLength(Number(regexCfg.maxLength)));
	}
	if (regexCfg.allowAlphabet === 'Y') {
		regex += 'a-zA-Z';
	}
	if (regexCfg.allowNumber === 'Y') {
		regex += '0-9';
	}
	if (regexCfg.allowSpecialChar === 'Y' && regexCfg.allowSpecialCharList && regexCfg.allowSpecialCharList.length > 0) {
		regex += regexCfg.allowSpecialCharList;
	}
	if (regex !== '') {
		cfg.push(Validators.pattern('^[ ' + regex + ']+$'));
	}
	form.controls[controlName].setValidators(cfg);
	form.updateValueAndValidity();
	return cfg;
}

export function buildScheduleNameSTO(transDate: string, schedule: string, translate: TranslateService) {
	switch (schedule) {
		case 'DAILY':
			return translate.instant('BILLING.sto.period.schedule_daily');
		case 'WEEKLY':
			return translate.instant('BILLING.sto.period.schedule_week', {date: translate.instant('locale.data.BILLING.sto.performDate.' + transDate)});
		case 'MONTHLY':
			return translate.instant('BILLING.sto.period.schedule_month', {date: transDate});
	}
}

@Pipe({name: 'stringToDateSTO'})
export class ConvertStringToDateSTO implements PipeTransform {
	transform(value: any, ...args): any {
		let year = value.slice(0, 4);
		let month = value.slice(4, 6);
		let day = value.slice(6, 8);
		return day + '/' + month + '/' + year;
	}
}

@Pipe({name: 'dateFormat'})
export class DateFormatPipe extends DatePipe implements PipeTransform {
	transform(value: any, format: string, args?: any): any {
		if (format === null) {
			format = 'dd/MM/yyyy';
		}
		return super.transform(value, format);
	}
}

export function filterByProperties(items: any[], searchText: string, fieldNames: string[]): any[] {

	// return empty array if array is falsy
	if (!items) {
		return [];
	}

	// return the original array if search text is empty
	if (!searchText) {
		return items;
	}

	let results = [];

	for (let i = 0; i < items.length; i++) {
		let item = items[i];
		for (let j = 0; j < fieldNames.length; j++) {
			let fieldNameItem = fieldNames[j];
			if ((item[fieldNameItem]+'').toLowerCase().includes(searchText.toLowerCase())) {
				results.push(item);
				break;
			}
		}
	}
	return results;
}

export function getUserName(): string {
	let cache = localStorage.getItem(USER_PROFILE);
	const user: User = JSON.parse(cache);
	console.log('=>>>>>>>>>>>>>> start get username from localstorage', user.shortName);
	return user.shortName;
}
export function convert(str: string) {
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
	str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
	str = str.replace(/đ/g, "d");

	str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
	str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
	str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
	str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
	str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
	str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
	str = str.replace(/Đ/g, "D");
	return str;
}
