// VietNam
export const locale = {
	lang: 'vn',
	data: {
		VOUCHER: {
			declare: {
				title: {
					list_types: 'Danh sách hình thức voucher',
					declare_new_type: 'Khai báo hình thức voucher',
					edit_type: 'Sửa thông tin hình thức voucher',
					info: 'Thông tin voucher',
					list_vouchers: 'Danh sách voucher',
					result: 'Kết quả tìm kiếm',
					voucher_detail: 'Chi tiết thông tin đợt phát hành voucher',
					voucher_update: 'Cập nhật đợt phát hành voucher',
					voucher_add: 'Thêm mới đợt phát hành voucher'
				},
				fields: {
					voucher_id: 'Mã E-Voucher',
					voucher_type: 'Loại voucher',
					voucher_value: 'Giá trị',
					voucher_desc: 'Mô tả',
					voucher_status: 'Trạng thái',
					status_in_force: 'Đang hiệu lực',
					status_pending: 'Tạm dừng',
					status_out_force: 'Hết hiệu lực',
					status_allocated: 'Đã cấp phát',
					effective_time_from: 'Thời gian áp dụng từ',
					effective_time_to: 'Thời gian áp dụng đến',
					voucher_force: 'Hiệu lực voucher',
					total: 'Tổng số lượng',
					total_budget: 'Tổng ngân sách'
				}
			},
			error: {
				unhandledError: 'Hệ thống xảy ra lỗi, vui lòng thử lại sau.'
			},
			message: {
				notice: 'Thông báo',
				declare_type_success: 'Khai báo hình thức voucher thành công.',
				update_type_success: 'Cập nhật hình thức voucher thành công.',
				declare_type_error: 'Khai báo hình thức voucher không thành công.',
				update_type_error: 'Cập nhật hình thức voucher không thành công.',
			},
			allocate: {
				title: {
					list: 'Danh sách cấp phát',
					result: 'Kết quả upload lô cấp phát',
					approve_list: 'Danh sách lô cấp phát chờ duyệt',
					approve: 'Cấp phát voucher thủ công',
					detail_upload: 'Chi tiết kết quả upload lô cấp phát',
					approve_cancel_list: 'Danh sách lô chờ duyệt hủy',
				},
				label: {
					batchSuccess: 'Lô thành công',
					batchFail: 'Lô thất bại',
					batchID: 'Mã lô',
					evoucherCode: 'Mã e-voucher',
					accountNo: 'Số tài khoản nhận',
					customerID: 'Mã khách hàng',
					recordStatus: 'Trạng thái bản ghi',
					voucherStatus: 'Trạng thái voucher',
					stt: 'STT',
					status: 'Trạng thái',
					inputDate: 'Ngày nhập',
					inputer: 'Người nhập',
					creditAccount: 'Số tài khoản nhận',
					numberUsage: 'Số lần sử dụng',
					ErrorCode: 'Mã lỗi',
					ErrorDesc: 'Mã lỗi',
					batchStatus: 'Trạng thái upload',
					error_message: 'Chi tiết lỗi',
				}

			}

		}
	}
};
