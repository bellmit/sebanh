//时间格式化显示
function formatDate(time) {
	var date = new Date(time);
	var year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate(),
		hour = date.getHours(),
		min = date.getMinutes(),
		sec = date.getSeconds();
	var newTime =
		year +
		(month < 10 ? "0" + month : month) +
		(day < 10 ? "0" + day : day) +
		(hour < 10 ? "0" + hour : hour) +
		(min < 10 ? "0" + min : min) +
		(sec < 10 ? "0" + sec : sec);
	return newTime;
}

function sleep(milliSeconds) {
	var startTime = new Date().getTime();
	while (new Date().getTime() < startTime + milliSeconds) ;
}

function ShowInfo(op) {
	// var obj = document.getElementById("TextInfo");
	// obj.value = obj.value + "\r\n" + op;
	console.log(op);
}

/*----------------------------------------------------
---（Hàm này phải được viết lại) để trả về số lượng thiết bị đã mua và tên thiết bị  ---
-----------------------------------------------------*/
function GetDevCountAndNameResultCB(devCount, devNameArr) {
	if (devCount > 0) {
		var obj = document.getElementById("DevName");
		obj.options.length = 0;
		for (var i = 0; i < devCount; i++) {
			var objOption = document.createElement("option");
			objOption.text = devNameArr[i];
			objOption.value = i;
			obj.options.add(objOption);
		}
		obj.selectedIndex = 0;
		var CamID = obj.selectedIndex;

		//Nhận giải quyết
		Cam_GetDevResolution(CamID);
	} else {
		ShowInfo("Không có thiết bị phù hợp được tìm thấy!");
	}
}

/*---------------------------------------------------
---  (Chức năng này phải được viết lại) Trả về thông tin phân giải thiết bị đã thu được  ---
----------------------------------------------------*/
function GetResolutionResultCB(resCount, resArr) {
	if (resCount > 0) {
		var selectIndex = 0;
		var obj = document.getElementById("DevResolution");
		obj.options.length = 0;
		for (var i = 0; i < resCount; i++) {
			var objOption = document.createElement("option");
			objOption.text = resArr[i];
			objOption.value = i;
			obj.options.add(objOption);
			//Độ phân giải 5 triệu mặc định được bật
			if (resArr[i] == "2592*1944") {
				selectIndex = i;
			}
		}
		obj.selectedIndex = selectIndex;

		//Mở máy quay
		Cam_Close();
		var restr = obj[obj.selectedIndex].text;
		var pos = restr.lastIndexOf("*");
		var width = parseInt(restr.substring(0, pos));
		var height = parseInt(restr.substring(pos + 1, restr.length));
		var CamID = document.getElementById("DevName").selectedIndex;
		Cam_Open(CamID, width, height);
	} else {
		ShowInfo("Không lấy được thông tin giải quyết!");
	}
}

/*---------------------------------------------------
---     (Chức năng này phải được viết lại) Đưa máy ảnh về trạng thái     ---
----------------------------------------------------*/
function GetCameraOnOffStatus(status) {
	if (status == 0) {
		ShowInfo("Thiết bị được bật thành công");
	} else {
		ShowInfo("Không bật được thiết bị!");
	}
}

//    /*---------------------------------------------------
//    --------     （Chức năng này phải được viết lại) Tình trạng ảnh hiện tại ---------
//    ----------------------------------------------------*/
//    function GetCaptrueStatusResultCB(status) {
//        if (status == 0) {
//            ShowInfo("拍照完成");
//        }
//        else {
//            ShowInfo("正在拍摄...");
//        }

//    }

/*---------------------------------------------------
--------     （Hàm phải được viết lại) Chụp ảnh kết quả     ---------
----------------------------------------------------*/
function GetCaptrueImgResultCB(flag, path, base64Str) {
	if (flag == 0) {
		//console.log(base64Str);
		var obj = document.getElementById("CameraPhoto");
		obj.src = "data:;base64," + base64Str;
		ShowInfo("Hình ảnh được chụp thành công, hình ảnh được lưu：" + path);
	} else {
		ShowInfo("Không chụp được ảnh!");
	}
}

/*---------------------------------------------------
------  （必须重写该函数）身份证信息返回结果   ------
----------------------------------------------------*/
function GetIdCardInfoResultCB(
	flag,
	Name,
	Sex,
	Nation,
	Born,
	Address,
	CardNum,
	IssuedAt,
	EffectedDate,
	CardImgPath,
	CardImgBase64
) {
	if (flag == 0) {
		document.getElementById("CardName").value = Name;
		document.getElementById("CardSex").value = Sex;
		document.getElementById("CardNation").value = Nation;
		document.getElementById("CardBorn").value = Born;
		document.getElementById("CardAddress").value = Address;
		document.getElementById("CardNum").value = CardNum;
		document.getElementById("CardIssuedAt").value = IssuedAt;
		document.getElementById("CardEffectDate").value = EffectedDate;
		var obj = document.getElementById("IdCardPhoto");
		obj.src = "data:;base64," + CardImgBase64;
		ShowInfo("Thẻ đã đọc thành công");
	} else {
		ShowInfo("Không đọc được thẻ!");
	}
}

/*---------------------------------------------------
------  （Hàm này phải được viết lại) Kết quả trả về nhận dạng mã vạch và mã QR------
----------------------------------------------------*/
function QrBarCodeRecogResultCB(flag, codeStr) {
	if (flag == 0) ShowInfo("Kết quả nhận dạng mã vạch / mã QR:" + codeStr);
	else ShowInfo("Nội dung không được công nhận!");
}

/*********************
 ***    初始化操作  ***
 **********************/

function LoadCameraDocument() {
	if (!window.WebSocket) {
		alert(
			"Trình duyệt không hỗ trợ HTML5, vui lòng cập nhật trình duyệt của bạn hoặc sử dụng trình duyệt khác"
		);
	}
	//console.log("LoadCameraDocument");
	var obj = document.getElementById("CameraCtl");
	Cam_ControlInit(obj, 0, 0, 600, 400);
}

window.onload = function () {
	console.log("window.onload");
};

/*********************
 ***    打开摄像头  ***
 **********************/
function toOpenCamera() {
	var CamID = document.getElementById("DevName").selectedIndex;
	var obj = document.getElementById("DevResolution");
	var restr = obj[obj.selectedIndex].text;
	var pos = restr.lastIndexOf("*");
	var width = parseInt(restr.substring(0, pos));
	var height = parseInt(restr.substring(pos + 1, restr.length));
	Cam_Open(CamID, width, height);
}

/*********************
 ***    关闭摄像头  ***
 **********************/
function toCloseCamera() {
	Cam_Close();
}

/*********************
 ***    切换摄像头  ***
 **********************/
function SelectDevice() {
	var CamID = document.getElementById("DevName").selectedIndex;
	//获取分辨率
	Cam_GetDevResolution(CamID);
}

/*********************
 ***    Chuyển đổi độ phân giải  ***
 **********************/
function SelectResolution() {
	var obj = document.getElementById("DevResolution");
	var restr = obj[obj.selectedIndex].text;
	var pos = restr.lastIndexOf("*");
	var width = parseInt(restr.substring(0, pos));
	var height = parseInt(restr.substring(pos + 1, restr.length));
	var CamID = document.getElementById("DevName").selectedIndex;
	Cam_Open(CamID, width, height);
}

/*********************
 ***       Chụp ảnh     ***
 **********************/
function TakePhoto() {
	var name = formatDate(new Date().getTime());

	var obj = document.getElementById("FileType");
	var path = "D:\\" + name + ".jpg";
	if (obj.selectedIndex == 1) path = "D:\\" + name + ".pdf";

	//var path = "D:\\测试.jpg";
	Cam_Photo(path); //Máy ảnh chính để chụp ảnh
}

function SetCameraCutMode() {
	if (document.getElementById("Radio1").checked) {
		Cam_SetCutMode(0);
	}
	if (document.getElementById("Radio3").checked) {
		Cam_SetCutMode(1);
	}
}

/*********************
 ***    Đọc thẻ ID  ***
 **********************/
function GetIdCardInfo() {
	var path = "D:\\IdCard.jpg";
	Cam_ReadIdCard(path);
}

/*********************
 ***    Đặt định dạng tệp  ***
 **********************/
function toSetFileType() {
	var obj = document.getElementById("FileType");
	Cam_SetFileType(obj.selectedIndex);
}

/*********************
 ***    Đặt chế độ màu  ***
 **********************/
function toSetColorModel() {
	var obj = document.getElementById("ColorMode");
	Cam_SetColorMode(obj.selectedIndex);
}

/*********************
 ***    Đặt để chuyển sang viền đen  ***
 **********************/
function toSetDeleteBlackEdge() {
	var obj = document.getElementById("Checkbox1");
	if (obj.checked) {
		Cam_SetDeleteBlackEdge(1);
	} else {
		Cam_SetDeleteBlackEdge(0);
	}
}

/*********************
 ***   Đặt màu nền ***
 **********************/
function toSetDeleteBgColor() {
	var obj = document.getElementById("Checkbox2");
	if (obj.checked) {
		Cam_SetDeleteBgColor(1);
	} else {
		Cam_SetDeleteBgColor(0);
	}
}

/*---------------------------------------------------
--------     (Hàm phải được viết lại) Tải lên kết quả    ---------
----------------------------------------------------*/
function HttpResultCB(flag, ResultStr) {
	if (flag == 0) {
		alert("Tải lên thành công :" + ResultStr);
	} else {
		alert("Tải lên thất bại!");
	}
}

/*********************
 ******    上传  ******
 **********************/
function HttpUploadFile() {
	var filePath = "C:\\test.jpg";
	//var url = "http://localhost:9005/MyServletTest/upload";
	//var url = "http://localhost:4523/UploadFile.ashx";
	var url = "http://localhost:9005/MyServletTest/upload";
	UploadFile(url, filePath);
}

//Nhận dạng mã QR từ máy ảnh
function RecogQrCodeFromCamera(type) {
	Cam_RecogQrBarCodeFromCamera(type);
}

//Xác định mã QR từ tệp hình ảnh
function RecogBarCodeFromFile(type) {
	var imgpath = "D:\\123.jpg";
	Cam_RecogQrBarCodeFromFile(type, imgpath);
}

/*---------------------------------------------------
--------     (Hàm phải được viết lại) Kết hợp các kết quả PDF    ---------
----------------------------------------------------*/
function PdfCombineResultCB(flag) {
	if (flag == 0) {
		ShowInfo("Hợp nhất PDF đã hoàn thành");
	} else {
		ShowInfo("Không hợp nhất được PDF!");
	}
}

//Kiểm tra hợp nhất PDF
function ToCombinePDF() {
	Cam_AddImgFileToPDF("D:\\1.jpg");
	sleep(100);
	Cam_AddImgFileToPDF("D:\\2.jpg");
	sleep(100);
	Cam_AddImgFileToPDF("D:\\3.jpg");
	sleep(100);
	Cam_CombinePDF("D:\\test.pdf");
}
