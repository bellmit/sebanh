import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'dotdotdot'
})
export class DotdotdotPipe implements PipeTransform {

	transform(value: any, ...args: any[]): any {
		return value.length > args[0] ? value.substring(0, args[0]) + '...' : value;
	}

}
