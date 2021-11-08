import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {CONFIG_TABLE_DECLARE_SIMILAR_AI} from "../../../../shared/model/constants/constant-table";
import fakeData from "./fakeDataAI.json"

@Component({
  selector: 'kt-declare-system-parameters',
  templateUrl: './declare-system-parameters.component.html',
  styleUrls: ['./declare-system-parameters.component.scss']
})
export class DeclareSystemParametersComponent implements OnInit {
	fakeData: any = fakeData
	isLoading$: BehaviorSubject<any> = new BehaviorSubject<any>(false);
	configTableAnnouncement = CONFIG_TABLE_DECLARE_SIMILAR_AI;
	action: string =  'AI';
  constructor() { }

  ngOnInit() {
  }

}
