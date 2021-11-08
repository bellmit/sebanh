import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ChargeInfoService {

	//Component thu phí sử dụng biến này để lấy cusId truy vấn danh sách TK của KH
  customerIdOfAccounts: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  constructor() { }
}
