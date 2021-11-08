import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import moment from "moment";

@Injectable({
	providedIn: 'root'
})
export class SlaTimeService {

	startTimeSLA$: BehaviorSubject<number> = new BehaviorSubject<number>(null)
	endTimeSLA$: BehaviorSubject<number> = new BehaviorSubject<number>(null)

	constructor() {
	}

	startCalculateSlaTime() {
		this.startTimeSLA$.next(new Date().getTime());
		console.log("SLA bắt đầu được tính lúc: ======================>>>", new Date());
		console.log("SLA START TIME: ======================>>>", this.getStartTimeSLA());
	}

	endCalculateSlaTime() {
		this.endTimeSLA$.next(new Date().getTime());
		console.log("SLA kết thúc lúc: ======================>>>", new Date());
		console.log("SLA END TIME ======================>>>", this.getTimeEndSLA());
	}

	totalTimeSla(): number {
		let timeStart = this.startTimeSLA$.getValue();
		let timeEnd = this.endTimeSLA$.getValue();

		if (timeEnd > timeStart) {
			return timeEnd - timeStart;

		} else return 0;

	}

	getStartTimeSLA() {
		return this.startTimeSLA$.getValue();
	}

	getTimeEndSLA() {
		return this.endTimeSLA$.getValue();
	}

	clearTimeSLA() {
		this.startTimeSLA$.next(null);
		this.endTimeSLA$.next(null);
	}


	calculateSlaTimeInput(dataCacheRouter: any) {
		let timeTotal: number = 0;

		if (dataCacheRouter == null) {
			timeTotal += this.totalTimeSla();
		}

		/**
		 * 	CÁCH TÍNH THỜI GIAN SLA CHO BẢN GHI THỰC HIỆN CẬP NHẬT THÔNG TIN - INPUTTER
		 *
		 * Tổng thời gian SLA trước đó - timeSLAInputter -> định dạng millisecond (1)
		 * Tổng thời gian cập nhật thông tin cho bản ghi của inputter -> định dạng millisecond (2)
		 *
		 *
		 * Công thức chung: (1) + (2);
		 *
		 */

		if (dataCacheRouter != null && dataCacheRouter.status != 'REJECTED') {
			let timeSlaInputWasSavedResponse = dataCacheRouter.timeSlaInputter ? dataCacheRouter.timeSlaInputter : 0;
			let totalTimeInputAgain = this.totalTimeSla();

			timeTotal = Number(timeSlaInputWasSavedResponse) + totalTimeInputAgain;
		}

		/**
		 * 	CÁCH TÍNH THỜI GIAN SLA CHO BẢN GHI BỊ TỪ CHỐI - INPUTTER
		 *
		 * Thời gian Authoriser từ chối bản ghi - timeRejected (1)
		 * Thời gian kết thúc chỉnh sửa lại bản ghi sau khi bị authoriser từ chối - timeUpdate (2)
		 * Thời gian SLA trước khi bị từ chối của inputter - timeSLAInputter (định dạng millisecond) (3)
		 *
		 * Công thức chung: (3) + { (2) - (1) }
		 *
		 */

		if (dataCacheRouter != null && dataCacheRouter.status == 'REJECTED') {
			let timeSlaInputWasSavedResponse = dataCacheRouter.timeSlaInputter;
			let rejectedTime = new Date(moment(dataCacheRouter.timeRejected, 'DD/MM/YYYY HH:mm:ss').format("MM/DD/YYYY HH:mm:ss")).getTime();
			let timeEndInputAgain = this.getTimeEndSLA();

			timeTotal = Number(timeSlaInputWasSavedResponse) + (timeEndInputAgain - rejectedTime)
		}

		return timeTotal;
	}


	calculateSlaTimeAuth(dataCacheRouter: any) {
		let timeTotal = 0;

		let timeRejected = dataCacheRouter.timeRejected ? new Date(moment(dataCacheRouter.timeRejected, 'DD/MM/YYYY HH:mm:ss').format("MM/DD/YYYY HH:mm:ss")).getTime() : 0;
		let timeEndApprove = this.getTimeEndSLA();

		let timeUpdateOfInputter = dataCacheRouter.timeUpdate ? new Date(moment(dataCacheRouter.timeUpdate, 'DD/MM/YYYY HH:mm:ss').format("MM/DD/YYYY HH:mm:ss")).getTime() : 0;

		if (timeRejected != 0 && timeRejected > timeUpdateOfInputter) {
			timeTotal += timeRejected - timeUpdateOfInputter;
		}

		let timeSlaAuthWasSavedResponse = dataCacheRouter.timeSlaAuthorise ? dataCacheRouter.timeSlaAuthorise : 0;
		timeTotal += timeSlaAuthWasSavedResponse + (timeEndApprove - timeUpdateOfInputter)

		return timeTotal;
	}
}
