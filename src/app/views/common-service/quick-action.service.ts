import {Injectable} from '@angular/core';
import {SEATELLER_DB, USER_PROFILE} from '../../shared/util/constant';
import {SessionStorageService} from 'ngx-webstorage';
import {NgxIndexedDBService} from 'ngx-indexed-db';
import {BehaviorSubject} from 'rxjs';
import {MenuAsideModel} from '../model/menu-aside.model';
import {MenuConfig} from '../../core/_config/menu.config';
import {CommonService} from './common.service';

@Injectable({
	providedIn: 'root'
})
export class QuickActionService {

	username: string;
	quickActions$ = new BehaviorSubject([]);
	private list: MenuAsideModel[] = [];

	constructor(
		private session: SessionStorageService,
		private dbService: NgxIndexedDBService
	) {
		this.username = this.session.retrieve(USER_PROFILE) ? this.session.retrieve(USER_PROFILE).user_id : '';
		this.getAllDb();
		this.getAllRouters();
	}

	getAllDb(): void {
		this.dbService.getByIndex(SEATELLER_DB.schemaQuickAction.name, SEATELLER_DB.schema.key_user, this.username)
			.subscribe(res => {
				if (res && res.actions) {
					this.quickActions$.next(res.actions);
				}
			});
	}

	updateQuickAction(quickActions: MenuAsideModel[]) {
		this.quickActions$.next(quickActions);
		this.dbService.update(SEATELLER_DB.schemaQuickAction.name, {
			id: this.username,
			user: this.username,
			actions: quickActions
		});
	}

	private getAllRouters(): void {
		const menu: MenuAsideModel[] = new MenuConfig().configs.aside.items;
		menu.forEach(m => {
			if (m.submenu) {
				this.pushMenu(m);
			}
		});
	}

	private pushMenu(menu: MenuAsideModel) {
		this.list.push(menu);
		if (menu.submenu) {
			menu.submenu.forEach(child => {
				this.pushMenu(child);
			});
		}
	}

	getListMenu() {
		return this.list.filter(menu => menu.page);
	}

	getQuickActionSetup() {
		return this.quickActions$.getValue();
	}
}
