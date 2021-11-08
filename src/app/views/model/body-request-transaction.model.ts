import {TransactionModel} from "./transaction.model";

export class BodyRequestTransactionModel {
	command: string;
	transaction: TransactionModel;

	constructor(command: string, transaction: TransactionModel) {
		this.command = command;
		this.transaction = transaction;
	}
}
