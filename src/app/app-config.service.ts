import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {

    private appConfig = {};

    showVar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor(
        private http: HttpClient
    ) {
    }

	public loadAppConfig(): any {
		return this.http.get('/config/seateller-config.json').toPromise().then(
			data => {
				this.appConfig = data;
				// console.log(this.appConfig);
			}
		);
	}

    public getConfigByKey(key: string) {
        return this.appConfig[key];
    }
}
