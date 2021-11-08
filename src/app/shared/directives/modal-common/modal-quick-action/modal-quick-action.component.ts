import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {QuickActionService} from '../../../../views/common-service/quick-action.service';
import {MenuAsideModel} from '../../../../views/model/menu-aside.model';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder, Validators} from '@angular/forms';
import {CommonService} from '../../../../views/common-service/common.service';
import {SessionStorageService} from 'ngx-webstorage';
import {MAP_USER_MATRIX_CACHE} from '../../../util/constant';

@Component({
	selector: 'kt-modal-quick-action',
	templateUrl: './modal-quick-action.component.html',
	styleUrls: ['../modal-common.css']
})
export class ModalQuickActionComponent implements OnInit {

	ACTION_EDIT = 'edit';
	ACTION_ADD = 'add';
	ACTION_DELETE = 'delete';
	quickActionSetup$ = new BehaviorSubject<MenuAsideModel[]>([]); // danh sách quick action đã config
	action$ = new BehaviorSubject<string>(null); // hành động thêm mới/ chỉnh sửa quick action
	menuList: MenuAsideModel[];
	currentIndex$ = new BehaviorSubject<number>(null);
	setupForm = this.fb.group({
		tooltip: [null, [Validators.required]],
		menu: [null, [Validators.required]]
	});
	confirm$ = new BehaviorSubject<boolean>(false);
	success$ = new BehaviorSubject<boolean>(false);
	rightId: string[] = [];

	constructor(
		public activeModal: NgbActiveModal,
		private service: QuickActionService,
		private fb: FormBuilder,
		private sessionService: SessionStorageService,
		private commonService: CommonService
	) {
		this.rightId = this.commonService.getRightIdsByUrl('pages/dashboard');
	}

	ngOnInit() {
		this.getQuickAction();
		this.getMenuList();
	}

	getQuickAction(): void {
		this.quickActionSetup$.next(this.service.getQuickActionSetup());
	}

	/**
	 * edit quick action config
	 * @param event
	 */
	editInfoAction(event: MenuAsideModel, index: number): void {
		this.action$.next(this.ACTION_EDIT);
		this.currentIndex$.next(index);
		this.patchValue(event);
	}

	/**
	 * delete quick action
	 * @param event
	 */
	deleteAction(index: number): void {
		let setup = this.quickActionSetup$.getValue();
		setup.splice(index, 1);
		this.quickActionSetup$.next(setup);
		this.service.updateQuickAction(setup);
	}

	/**
	 * update quick action
	 */
	updateQuickAction(menu: MenuAsideModel): void {
		let setup = this.quickActionSetup$.getValue();
		if (this.action$.getValue() == this.ACTION_ADD) {
			setup.push(menu);
		}
		if (this.action$.getValue() == this.ACTION_EDIT) {
			setup[this.currentIndex$.getValue()] = menu;
		}
		this.quickActionSetup$.next(setup);
		this.service.updateQuickAction(this.quickActionSetup$.getValue());
		this.action$.next(null);
		this.resetModal();
	}

	/**
	 * add one more quick action
	 */
	addQuickAction(): void {
		console.log('on click add menu');
		this.setupForm.reset();
		this.action$.next(this.ACTION_ADD);
	}

	onCancel(): void {
		if (this.action$.getValue() == null) {
			this.activeModal.close(false);
		} else {
			this.action$.next(null);
		}
	}

	onSubmit(): void {
		if (this.action$.getValue() == null) {
			this.activeModal.close(false);
		} else {
			this.confirm$.next(true);
		}
	}

	handleEditQuickAction(): void {
		console.log(this.setupForm.value);
		let menu = this.menuList.find(ele => ele.page == this.setupForm.get('menu').value);
		menu.tooltip = this.setupForm.get('tooltip').value;
		this.updateQuickAction(menu);
	}

	/**
	 * get all menu on aside left
	 */
	getMenuList(): void {
		let userMatrix = this.sessionService.retrieve(MAP_USER_MATRIX_CACHE);
		const matrix: string[] = userMatrix.reduce((acc, next) => acc.concat([`/${next.function_id}`]), []);
		const menuList = this.service.getListMenu().filter(menu => matrix.includes(menu.page));
		this.menuList = menuList.filter(menu => {
			if (this.rightId.includes('I')) {
				return menu.page;
			} else {
				return (menu.page && !menu.notShowAuth);
			}
		});
	}

	patchValue(menu: MenuAsideModel): void {
		this.setupForm.patchValue({
			tooltip: menu.tooltip,
			menu: menu.page
		});
	}

	handleDeleteItem(menu: MenuAsideModel, index: number): void {
		console.log('onclick delete menu');
		this.confirm$.next(true);
		this.action$.next(this.ACTION_DELETE);
		this.currentIndex$.next(index);
	}

	onConfirm(): void {
		if (this.action$.getValue() == this.ACTION_DELETE) {
			this.deleteAction(this.currentIndex$.getValue());
			this.success$.next(true);
		}
		if (this.action$.getValue() == this.ACTION_ADD || this.action$.getValue() == this.ACTION_EDIT) {
			this.handleEditQuickAction();
		}
	}

	onNotConfirm(): void {
		this.resetModal();
	}

	resetModal(): void {
		this.action$.next(null);
		this.confirm$.next(false);
		this.success$.next(false);
	}
}
