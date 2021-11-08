import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'kt-add-announcement',
  templateUrl: './add-announcement.component.html',
  styleUrls: ['./add-announcement.component.scss']
})
export class AddAnnouncementComponent implements OnInit {
	inputForm: any;
	data: any;
	isLoading:any ;

  constructor() { }

  ngOnInit() {
  }

}
