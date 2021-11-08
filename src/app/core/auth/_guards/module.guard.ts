// Angular
import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
// RxJS
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
// NGRX
import {select, Store} from '@ngrx/store';
// Module reducers and selectors
import {AppState} from '../../../core/reducers/';
import {find} from 'lodash';
import {ToastrService} from 'ngx-toastr';

@Injectable()
export class ModuleGuard implements CanActivate {
	constructor(private store: Store<AppState>, private router: Router, private toastr: ToastrService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {

		const roles: string[] = route.data.roles;
		if (roles == null || roles.length <= 0) {
			return of(true)
		}

		// return this.store
		// 	.pipe(
		// 		select(currentUserPermissions),
		// 		map((permissions: Permission[]) => {
		// 			const _perm = find(permissions, (elem: Permission) => {
		// 				const _role = find(roles, (role: string) => {
		// 					return elem.title.toLocaleLowerCase() == role.toLocaleLowerCase();
		// 				});
		// 				return _role ? true : false;
		// 			});
		// 			return _perm ? true : false;
		// 		}),
		// 		tap(hasAccess => {
		// 			if (!hasAccess) {
		// 				// this.router.navigateByUrl('/error/403');
		// 				// this.layoutUtilsService.showActionNotification("Access forbidden", MessageType.Read);
		// 				this.toastr.warning("Access forbidden", 'Warning');
		// 			}
		// 		})
		// 	);


	}
}
