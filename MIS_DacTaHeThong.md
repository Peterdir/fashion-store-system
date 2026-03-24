4.1.27. Ghi nhận bán hàng trực tiếp
[27]	Ghi nhận bán hàng trực tiếp
Actor	Chủ cửa hàng
Trigger	Chủ cửa hàng chọn chức năng Ghi nhận bán hàng trực tiếp tại trang quản trị hệ thống.
Description	Use case này cho phép chủ cửa hàng nhập thông tin giao dịch bán hàng trực tiếp tại cửa hàng (offline).
Thông tin giao dịch bao gồm sản phẩm, số lượng, giá bán và phương thức thanh toán.
Doanh thu từ bán hàng trực tiếp được hệ thống ghi nhận và tổng hợp chung vào báo cáo doanh thu tổng của cửa hàng.
Pre-Conditions	•	Chủ cửa hàng đã đăng nhập vào hệ thống.
•	Sản phẩm tồn tại trong hệ thống.
Post-Conditions	Thành công
•	Giao dịch bán hàng trực tiếp được lưu vào hệ thống.
•	Số lượng tồn kho được cập nhật (nếu có quản lý tồn kho).
•	Doanh thu được cộng vào báo cáo tổng doanh thu.
Thất bại
•	Giao dịch không được lưu.
•	Hệ thống hiển thị thông báo lỗi phù hợp.
Main Flow	1.	Chủ cửa hàng chọn chức năng Ghi nhận bán hàng trực tiếp.
2.	Hệ thống hiển thị form nhập thông tin giao dịch.
3.	Chủ cửa hàng chọn sản phẩm.
4.	Hệ thống hiển thị thông tin sản phẩm (giá, tồn kho).
5.	Chủ cửa hàng nhập số lượng và phương thức thanh toán.
6.	Chủ cửa hàng xác nhận lưu giao dịch.
7.	Hệ thống kiểm tra tính hợp lệ của dữ liệu.
8.	Hệ thống lưu giao dịch vào cơ sở dữ liệu.
9.	Hệ thống cập nhật tồn kho.
10.	Hệ thống cập nhật báo cáo doanh thu.
11.	Hệ thống hiển thị thông báo thành công.
12.	Use case kết thúc.
       Alternate Flow	AF1: Bán nhiều sản phẩm trong một giao dịch
       •	Tại bước 3, chủ cửa hàng có thể thêm nhiều sản phẩm.
       •	Hệ thống tính tổng tiền tự động.
       •	Quay lại bước 6.
       Exception Flow	EL1: Số lượng vượt quá tồn kho
       •	Tại bước 7, nếu số lượng > tồn kho:
       o	Hệ thống hiển thị thông báo “Số lượng không đủ trong kho”.
       o	Quay lại bước 5.
       EL2: Thiếu thông tin bắt buộc
       •	Tại bước 7, nếu thiếu dữ liệu:
       o	Hệ thống hiển thị thông báo yêu cầu nhập đầy đủ thông tin.
       o	Quay lại bước 2.

4.1.28. Thống kê doanh thu
[28]	Thống kê doanh thu
Actor	Chủ cửa hàng
Trigger	Chủ cửa hàng chọn chức năng Thống kê doanh thu tại trang quản trị hệ thống.
Description	Use case này cho phép chủ cửa hàng tổng hợp và theo dõi doanh thu của cửa hàng theo các khoảng thời gian khác nhau (ngày, tháng, năm hoặc tùy chọn).
Hệ thống hiển thị doanh thu từ bán hàng trực tuyến và bán hàng trực tiếp một cách rõ ràng và trực quan nhằm hỗ trợ đánh giá hiệu quả kinh doanh.
Pre-Conditions	•	Chủ cửa hàng đã đăng nhập vào hệ thống.
•	Tồn tại dữ liệu giao dịch bán hàng trong hệ thống.
Post-Conditions	Thành công
•	Hệ thống hiển thị dữ liệu doanh thu theo điều kiện đã chọn.
•	Dữ liệu bao gồm doanh thu online và offline.
Thất bại
•	Hệ thống không thể truy xuất dữ liệu.
•	Thông báo lỗi được hiển thị.
Main Flow	1.	Chủ cửa hàng chọn chức năng Thống kê doanh thu.
2.	Hệ thống hiển thị giao diện chọn khoảng thời gian.
3.	Chủ cửa hàng chọn khoảng thời gian cần thống kê.
4.	Chủ cửa hàng xác nhận xem thống kê.
5.	Hệ thống tổng hợp dữ liệu doanh thu từ:
      Bán hàng trực tuyến
      Bán hàng trực tiếp
6.	Hệ thống hiển thị kết quả thống kê dưới dạng:
      •	Tổng doanh thu trong khoảng thời gian được chọn
      •	Tổng Số lượng đơn hàng
      •	Danh sách các đơn hàng, bao gồm:
      o	Mã đơn hàng
      o	Danh sách sản phẩm trong đơn hàng
      o	Tổng tiền của từng đơn hàng
      •	Biểu đồ minh họa doanh thu
7.	Use case kết thúc.
      Alternate Flow	AF1: Không có dữ liệu trong khoảng thời gian đã chọn
      •	Tại bước 5, nếu không có dữ liệu:
      o	Hệ thống hiển thị thông báo “Không có dữ liệu trong khoảng thời gian này”.
      o	Use case kết thúc.
      Exception Flow	EL1: Lỗi truy xuất dữ liệu
      •	Hệ thống gặp lỗi khi tổng hợp dữ liệu:
      o	Hệ thống hiển thị thông báo lỗi.
      o	Use case kết thúc.

4.1.29. Xuất báo cáo doanh thu
[29]	Xuất báo cáo doanh thu
Actor	Chủ cửa hàng
Trigger	Chủ cửa hàng chọn chức năng Xuất báo cáo tại giao diện thống kê doanh thu.
Description	Use case này cho phép chủ cửa hàng xuất báo cáo doanh thu theo khoảng thời gian đã chọn ra file (PDF, Excel hoặc định dạng khác).
Báo cáo phục vụ cho việc lưu trữ, tổng hợp và quản lý kinh doanh.
Pre-Conditions	•	Chủ cửa hàng đã đăng nhập vào hệ thống.
•	Đã thực hiện thống kê doanh thu.
Post-Conditions	Thành công
•	Báo cáo được tạo thành công.
•	File báo cáo được tải xuống hoặc lưu trữ trong hệ thống.
Thất bại
•	Báo cáo không được tạo.
•	Thông báo lỗi được hiển thị.
Main Flow	1.	Chủ cửa hàng đang xem kết quả thống kê doanh thu.
2.	Chủ cửa hàng chọn chức năng Xuất báo cáo.
3.	Hệ thống yêu cầu chọn định dạng file (PDF, Excel…).
4.	Chủ cửa hàng chọn định dạng mong muốn.
5.	Hệ thống tạo báo cáo dựa trên dữ liệu đã thống kê.
6.	Hệ thống cung cấp file để tải xuống.
7.	Use case kết thúc.
      Alternate Flow	Không có.
      Exception Flow	EL1: Lỗi tạo file báo cáo
      •	Tại bước 5, nếu hệ thống gặp lỗi:
      o	Hệ thống hiển thị thông báo lỗi.
      o	Use case kết thúc.

4.1.30. Lịch sử đơn hàng
[30]	Lịch sử đơn hàng
Actor	Khách hàng
Trigger	Khách hàng chọn chức năng “Lịch sử đơn hàng” trên giao diện tài khoản cá nhân.
Description	Use case này cho phép khách hàng xem danh sách các đơn hàng đã mua trong quá khứ.
Mỗi đơn hàng hiển thị các thông tin cơ bản bao gồm: mã đơn hàng, ngày đặt hàng, trạng thái đơn hàng và tổng giá trị đơn hàng.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Khách hàng đã từng đặt thành công ít nhất một đơn hàng.
Post-Conditions	Thành công
•	Danh sách đơn hàng được hiển thị.
•	Thông tin mỗi đơn hàng được hiển thị đầy đủ và chính xác.
Thất bại
•	Hệ thống không thể truy xuất dữ liệu.
•	Thông báo lỗi được hiển thị.
Main Flow	1.	Khách hàng chọn chức năng Lịch sử đơn hàng.
2.	Hệ thống truy xuất danh sách đơn hàng của khách hàng.
3.	Hệ thống hiển thị danh sách đơn hàng, bao gồm:
      •	Mã đơn hàng
      •	Ngày đặt hàng
      •	Trạng thái đơn hàng
      •	Tổng giá trị đơn hàng
4.	Use case kết thúc.
      Alternate Flow	AF1: Không có đơn hàng
      •	Tại bước 2, nếu khách hàng chưa có đơn hàng nào:
      o	Hệ thống hiển thị thông báo “Bạn chưa có đơn hàng nào”.
      o	Use case kết thúc.
      Exception Flow	EL1: Lỗi truy xuất dữ liệu
      •	Hệ thống gặp lỗi khi truy xuất danh sách đơn hàng:
      o	Hệ thống hiển thị thông báo lỗi.
      o	Use case kết thúc.

4.1.31. Xác thực tài khoản
[31]	Xác thực tài khoản
Actor	Khách hàng
Trigger	Khách hàng nhấn vào liên kết xác thực được gửi đến email sau khi đăng ký tài khoản.
Description	Use case này cho phép khách hàng xác thực địa chỉ email của mình để kích hoạt tài khoản.
Hệ thống gửi một email chứa liên kết đến địa chỉ email đã đăng ký.
Khách hàng thực hiện xác thực để hoàn tất quá trình đăng ký và sử dụng hệ thống.
Pre-Conditions	•	Khách hàng đã đăng ký tài khoản với email hợp lệ.
•	Hệ thống đã gửi email xác thực đến địa chỉ email của khách hàng.
Post-Conditions	Thành công
•	Email của khách hàng được xác thực.
•	Tài khoản của khách hàng được kích hoạt.
•	Khách hàng có thể đăng nhập và sử dụng các chức năng của hệ thống.
Thất bại
•	Email không được xác thực.
•	Tài khoản vẫn ở trạng thái chưa kích hoạt.
•	Hệ thống hiển thị thông báo lỗi hoặc yêu cầu xác thực lại.
Main Flow	1.	Hệ thống gửi email đến địa chỉ email của khách hàng sau khi đăng ký.
2.	Khách hàng mở email xác thực.
3.	Khách hàng nhấn vào liên kết xác thực.
4.	Hệ thống kiểm tra tính hợp lệ của liên kết xác thực.
5.	Nếu hợp lệ, hệ thống xác nhận email đã được xác thực.
6.	Hệ thống kích hoạt tài khoản khách hàng.
7.	Use case kết thúc
      Alternate Flow	AF1: Gửi lại email xác thực
      •	Tại bước 2, nếu khách hàng không nhận được email xác thực:
      o	Khách hàng chọn chức năng “Gửi lại email xác thực”.
      o	Hệ thống gửi lại email xác thực mới.
      o	Khách hàng tiếp tục thực hiện bước 2.
      Exception Flow	EL1: Mã xác thực không hợp lệ hoặc đã hết hạn
      •	Tại bước 4, nếu mã xác thực không hợp lệ hoặc đã hết hạn:
      o	Hệ thống hiển thị thông báo lỗi.
      o	Hệ thống cung cấp tùy chọn “Gửi lại email xác thực”.
      o	Khách hàng chọn chức năng “Gửi lại email xác thực”.
      o	Hệ thống gửi email xác thực mới.
      o	Use case kết thúc.
