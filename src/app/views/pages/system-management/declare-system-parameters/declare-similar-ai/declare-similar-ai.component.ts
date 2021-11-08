import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import fakeData from "../fakeDataAI.json"

@Component({
  selector: 'kt-declare-similar-ai',
  templateUrl: './declare-similar-ai.component.html',
  styleUrls: ['./declare-similar-ai.component.scss']
})
export class DeclareSimilarAIComponent implements OnInit {

	AiTypes: any;
	isLoadingAiType: BehaviorSubject<any> = new BehaviorSubject<any>(false) ;
	inputForm: any;
	statusUsing: any;

  constructor() { }

  ngOnInit() {
  }

}
