import {EnquiryModel} from "./enquiry.model";

export class BodyRequestEnquiryModel {
	command: string;
	enquiry: EnquiryModel;

	constructor(command: string, enquiry: EnquiryModel | any) {
		this.command = command;
		this.enquiry = enquiry;
	}
}
