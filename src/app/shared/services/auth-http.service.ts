import {Injectable} from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

type EntityResponseType<T> = HttpResponse<T>;

@Injectable({
	providedIn: 'root'
})
export class AuthHttpService {
	constructor(private http: HttpClient) {
	}

	callPostApi<R>(bodyRequest: any, url: string): Observable<R> {
		return this.http.post<R>(url, bodyRequest, {observe: 'response'})
			.pipe(map((res: EntityResponseType<R>) => res.body));
	}

	callPostApiAsync<R>(bodyRequest: any, url: string): Promise<HttpResponse<R>> {
		return this.http.post<R>(url, bodyRequest, {observe: 'response'}).toPromise();
	}
}
