import {BaseModel} from '../../_base/crud';

export class UserFunction extends BaseModel {
	function_code: string;
	function_id: string;
	function_name: string;

	clear(): void {
		this.function_code = '';
		this.function_id = '';
		this.function_name = '';
	}
}
