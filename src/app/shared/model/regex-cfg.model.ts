export class RegexCfg {
	constructor(
		public id: bigint,
		public accMaxLength: string,
		public accAllowAlphabet: string,
		public accAllowNumber: string,
		public accAllowSpecialChar: string,
		public accAllowSpecialCharList: string,
		public maxLength: bigint,
		public allowAlphabet: string,
		public allowNumber: string,
		public allowSpecialChar: string,
		public allowSpecialCharList: string,
		public allowVn: string,
		public minAmount: bigint,
		public ftTypeId: any,
		public spId: any
	) {
	}
}
