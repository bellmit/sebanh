import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ExportService {

	constructor() {
	}

	downloadWordFile(data: string, fileName: string) {
		// console.log(data);
		var a = document.createElement('a');
		document.body.appendChild(a);
		var json = atob(data),
			blob = this.base64toBlob(json),
			url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	downloadPdfFile(base64: string, fileName): void {
		var a = document.createElement('a');
		document.body.appendChild(a);
		const url = `data:application/pdf;base64,${base64}`;
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
		}


	base64toBlob(byteString) {
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ia], {type: 'octet/stream'});
	}

	openPdfFile(base64: string, fileName): void {
		const json = atob(base64);
		const blob = this.base64toBlobPDF(json);
		const url = window.URL.createObjectURL(blob);
		window.open(url, '_blank');
	}

	base64toBlobPDF(byteString) {
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ia], {type: 'application/pdf'});
	}
}
