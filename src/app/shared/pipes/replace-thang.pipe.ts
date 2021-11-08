import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'replaceThang'
})
export class ReplaceThangPipe implements PipeTransform {

	transform(value: any, ...args: any[]): any {
		let replaceChar = args[0];
		let replaceBy = args[1];
		if (value) {
			if (!replaceBy) {
				replaceBy = '';
			}
			if (!replaceChar) {
				replaceChar = '';
			}
			return value.replace(new RegExp(replaceChar, 'g'), replaceBy);
		}
		return null;
	}

}
