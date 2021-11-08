import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AccountService} from '../_services/account.service';
import {Observable, of} from 'rxjs';
import {USER_PERMISSION, USER_PROFILE} from '../../../shared/util/constant';
import {NgxPermissionsService} from 'ngx-permissions';
import {ToastrService} from 'ngx-toastr';
import {Logout, User} from '../index';
import {AppState} from '../../reducers';
import {Store} from '@ngrx/store';
import {map, tap} from 'rxjs/operators';
import {ModalAskComponent} from '../../../shared/directives/modal-common/modal-ask/modal-ask.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Injectable({providedIn: 'root'})
export class UserRouterAccessGuard implements CanActivate {
	constructor(
		private router: Router,
		private accountService: AccountService,
		private permissionsService: NgxPermissionsService,
		private toast: ToastrService,
		private modalService: NgbModal,
		private store: Store<AppState>) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
		const authorities = route.data['authorities'];
		return this.checkAccess(authorities, state.url);
	}

	checkAccess(authorities: string[], url: string): Observable<boolean> {
		if (localStorage.getItem(USER_PROFILE)) {
			let user: User = JSON.parse(localStorage.getItem(USER_PROFILE));
			return this.accountService.identity(user.shortName, false).pipe(
				map(permissions => {
					// if (!authorities || authorities.length === 0) {
					// 	return true;
					// }
					if (permissions) {
						if (permissions.length) {
							const hasAnyAuthority = this.accountService.hasAnyAuthority(authorities);
							if (hasAnyAuthority) {
								return true;
							}
							if (this.checkRoleRouter(permissions, url)) {
								return true;
							}

							let modalRef = this.modalService.open(ModalAskComponent, {
								backdrop: 'static',
								keyboard: false,
								size: 'sm',
								centered: true
							});
							this.store.dispatch(new Logout());
							modalRef.componentInstance.content = 'Tài khoản của bạn chưa được phân quyền truy cập SeATeller.';
							return false;
						} else {
							let modalRef = this.modalService.open(ModalAskComponent, {
								backdrop: 'static',
								keyboard: false,
								size: 'sm',
								centered: true
							});
							this.store.dispatch(new Logout());
							modalRef.componentInstance.content = 'Tài khoản của bạn chưa được phân quyền truy cập SeATeller.';
							return false;
						}
					}
					this.router.navigate(['login']);
					return false;
				}), tap(res => {
				}, err => {
					this.router.navigate(['login']);
				}),
			);
		} else {
			this.router.navigate(['login']);
		}
	}

	checkRoleRouter(roles: string[], url: string): boolean {
		return true;
		for (let i = 0; i < roles.length; i++) {
			if (url.includes(roles[i])) {
				return true;
			}
		}
		return false;
	}
}
