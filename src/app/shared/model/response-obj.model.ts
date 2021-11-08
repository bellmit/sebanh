export class ResponseObjModel<T> {
	constructor(
		public code?: string,
		public message?: string,
		public messageVi?: string,
		public messageEn?: string,
		public data?: T
	) {
	}
}
