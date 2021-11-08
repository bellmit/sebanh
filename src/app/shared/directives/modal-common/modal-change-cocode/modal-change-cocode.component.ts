import { CommonService } from './../../../../views/common-service/common.service';
import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from "ngx-toastr";
import {removeUTF8WithSpecial} from './../../../../shared/model/remove-UTF8';
@Component({
	selector: "kt-change-cocode",
	templateUrl: "./modal-change-cocode.component.html",
	styleUrls: ["./modal-change-cocode.component.scss"],
})
export class ModalChangeCoCode implements OnInit, OnDestroy {
	@Output() emitService = new EventEmitter<any>();

	keyword = "name";
	groupList: any;
	valueCode: any;

	show: any;
	dataSelect: any;
	// disabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private _activeModal: NgbActiveModal,
		private _toastr: ToastrService,
		private commonService: CommonService
	) {}

	ngOnInit() {
		this.show = [...this.groupList]
	}

	ngOnDestroy() {
		// this.disabled$.next(false);
	}

	close(): void {
		this._activeModal.close(true);
	}

	onSubmit(): void {
		this.emitService.next(this.dataSelect);
		this.commonService.setNotifyInfo('Chuyển chi nhánh thành công!','success', 3000);
		this.close()
	}

	onChangeCode(event: any) {
		if (event) {
			this.show =  this.groupList.filter((val) => removeUTF8WithSpecial(val.desc.concat(' ').concat(val.group_id)).toString().includes(removeUTF8WithSpecial(event.toLowerCase().trim())))
			
		} else {
			return this.show = [...this.groupList];
		}
	}
	radioSelected = (event, row) => {
		this.dataSelect = row;
		// this.disabled$.next(false)

	}
}
