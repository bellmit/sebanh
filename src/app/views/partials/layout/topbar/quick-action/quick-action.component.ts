// Angular
import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ModalQuickActionComponent} from '../../../../../shared/directives/modal-common/modal-quick-action/modal-quick-action.component';
import {QuickActionService} from '../../../../common-service/quick-action.service';
import {Subscription} from 'rxjs';
import {MenuAsideModel} from '../../../../model/menu-aside.model';

@Component({
	selector: 'kt-quick-action',
	templateUrl: './quick-action.component.html',
})
export class QuickActionComponent implements OnInit, AfterViewInit, OnDestroy {
	// Public properties
	quickActions: MenuAsideModel[] = [];
	sub: Subscription;

	// Set icon class name
	@Input() icon = 'flaticon2-gear';

	@Input() iconType: '' | 'warning';

	// Set true to icon as SVG or false as icon class
	@Input() useSVG: boolean;

	// Set bg image path
	@Input() bgImage: string;

	// Set skin color, default to light
	@Input() skin: 'light' | 'dark' = 'light';

	@Input() gridNavSkin: 'light' | 'dark' = 'light';

	/**
	 * Component constructor
	 */
	constructor(
		private modal: NgbModal,
		private service: QuickActionService
	) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * After view init
	 */
	ngAfterViewInit(): void {
	}

	/**
	 * On init
	 */
	ngOnInit(): void {
		this.getQuickActionSetup();
		this.sub = this.service.quickActions$.subscribe(res => {
			if (res) {
				this.getQuickActionSetup();
			}
		});
	}

	ngOnDestroy(): void {
		if (this.sub) {
			this.sub.unsubscribe();
		}
	}

	setupQuickAction(): void {
		this.modal.open(ModalQuickActionComponent, {backdrop: true, keyboard: false});
	}

	getQuickActionSetup(): void {
		this.quickActions = this.service.getQuickActionSetup();
	}
}
