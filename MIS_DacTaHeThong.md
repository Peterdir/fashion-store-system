
4.1.2. Đăng nhập
[2]	Đăng nhập
Actor	Khách hàng, chủ cửa hàng
Trigger	Actor chọn chức năng đăng nhập ở giao diện hệ thống.
Description	Use Case này cho phép người dùng đăng nhập vào hệ thống bằng tài khoản đã đăng ký để sử dụng các chức năng tương ứng với vai trò của mình.
Pre-Conditions	•	Người dùng đã có tài khoản trong hệ thống.
•	Trang đăng nhập đã được hiển thị.
Post-Conditions	•	Người dùng đăng nhập thành công vào hệ thống.
•	Hệ thống xác định vai trò của người dùng và chuyển đến giao diện tương ứng.
Main Flow	1.	Người dùng chọn chức năng Đăng nhập.
2.	Hệ thống hiển thị giao diện đăng nhập.
3.	Người dùng nhập thông tin đăng nhập (tên đăng nhập và mật khẩu).
4.	Người dùng nhấn nút Đăng nhập.
5.	Hệ thống kiểm tra thông tin đăng nhập.
6.	Hệ thống xác thực thành công và chuyển người dùng đến giao diện phù hợp với vai trò.
7.	Use case kết thúc.
      Alternate Flow	Không có.
      Exception Flow	EF1: Thiếu thông tin đăng nhập
      •	Tại bước 5, nếu người dùng không nhập tên đăng nhập hoặc mật khẩu:
      o	Hệ thống hiển thị thông báo “Vui lòng nhập đầy đủ thông tin”.
      o	Use case kết thúc.
      EF2: Tên đăng nhập không tồn tại
      •	Tại bước 5, nếu tên đăng nhập/email không tồn tại trong hệ thống:
      o	Hệ thống hiển thị thông báo “Tên đăng nhập không tồn tại”.
      o	Use case kết thúc.
      EF3: Mật khẩu không chính xác
      •	Tại bước 5, nếu mật khẩu không đúng:
      o	Hệ thống hiển thị thông báo “Mật khẩu không chính xác”.
      o	Use case kết thúc.

4.1.3. Quên mật khẩu
[3]	Quên mật khẩu
Actor	Khách hàng, chủ cửa hàng
Trigger	Actor chọn chức năng “Quên mật khẩu” trên giao diện đăng nhập.
Description	Usecase này cho phép người dùng khôi phục mật khẩu để đăng nhập vào hệ thống trong trường hợp đã quên mật khẩu.
Pre-Conditions	•	Người dùng đã có tài khoản trong hệ thống.
•	Trang đăng nhập đã được hiển thị.
Post-Conditions	•	Mật khẩu của tài khoản được cập nhật thành công.
•	Người dùng có thể đăng nhập vào hệ thống bằng mật khẩu mới.
Main Flow	1.	Người dùng chọn chức năng Quên mật khẩu trên giao diện đăng nhập.
2.	Hệ thống hiển thị giao diện quên mật khẩu.
3.	Người dùng nhập địa chỉ Email đã đăng ký tài khoản.
4.	Người dùng nhấn nút xác nhận.
5.	Hệ thống kiểm tra sự tồn tại của email trong hệ thống.
6.	Hệ thống gửi liên kết khôi phục mật khẩu đến email của khách hàng.
7.	Khách hàng truy cập email và nhấn vào liên kết khôi phục mật khẩu.
8.	Hệ thống hiển thị giao diện đặt lại mật khẩu.
9.	Khách hàng nhập mật khẩu mới và xác nhận mật khẩu.
10.	Khách hàng nhấn nút Hoàn tất.
11.	Hệ thống kiểm tra dữ liệu (Trùng khớp, đủ mạnh)
12.	Hệ thống cập nhật mật khẩu mới và hiển thị thông báo đổi mật khẩu thành công.
13.	Use case kết thúc.
       Alternate Flow	AF1: Gửi lại email khôi phục mật khẩu
       •	Tại bước 6, nếu khách hàng yêu cầu gửi lại email khôi phục mật khẩu:
       o	Hệ thống gửi lại liên kết khôi phục mật khẩu đến email đã đăng ký.
       o	Use case tiếp tục tại bước 7.
       Exception Flow	EF1: Email không tồn tại trong hệ thống
       •	Tại bước 5, nếu email không tồn tại trong hệ thống:
       o	Hệ thống hiển thị thông báo “Email không tồn tại”.
       o	Use case kết thúc.
       EF2: Liên kết khôi phục không hợp lệ hoặc đã hết hạn
       •	Tại bước 7, nếu liên kết khôi phục không hợp lệ hoặc đã hết hạn:
       o	Hệ thống hiển thị thông báo lỗi.
       o	Use case kết thúc.
       EF3: Mật khẩu mới không hợp lệ
       •	Tại bước 9, nếu mật khẩu mới không đáp ứng yêu cầu bảo mật hoặc mật khẩu xác nhận không trùng khớp:
       o	Hệ thống hiển thị thông báo lỗi tương ứng.
       o	Use case kết thúc.

4.1.4. Đăng xuất
[4]	Đăng xuất
Actor	Khách hàng, chủ cửa hàng
Trigger	Người dùng chọn chức năng “Đăng xuất” trên giao diện hệ thống.
Description	Use case này cho phép người dùng đăng xuất khỏi hệ thống, kết thúc phiên làm việc hiện tại và quay về giao diện trang chủ.
Pre-Conditions	•	Người dùng đã đăng nhập vào hệ thống.
Post-Conditions	•	Phiên làm việc của actor được kết thúc và không còn hiệu lực.
•	Người dùng được điều hướng về giao diện trang chủ của hệ thống.
Main Flow	1.	Người dùng chọn chức năng Đăng xuất trên giao diện hệ thống.
2.	Hệ thống hiển thị thông báo yêu cầu xác nhận đăng xuất.
3.	Người dùng xác nhận đăng xuất.
4.	Hệ thống kết thúc phiên làm việc của người dùng.
5.	Hệ thống điều hướng người dùng về giao diện trang chủ.
6.	Use case kết thúc.
      Alternate Flow	AF1: Người dùng đăng xuất
      •	Tại bước 3, nếu người dùng chọn Hủy:
      o	Hệ thống giữ nguyên phiên đăng nhập của người dùng.
      o	Hệ thống quay lại giao diện trước đó.
      o	Use case kết thúc.
      Exception Flow	Không có.

4.1.5. Quản lý thông tin cá nhân
[5]	Quản lý thông tin cá nhân
Actor	Khách hàng, chủ cửa hàng
Trigger	Người dùng chọn mục Profile trên giao diện chính.
Description	Use case này cho phép người dùng xem và cập nhật thông tin cá nhân của mình trong hệ thống.
Pre-Conditions	Người dùng đã đăng nhập vào hệ thống.
Post-Conditions	Thông tin cá nhân được cập nhật (nếu có).
Dữ liệu mới được lưu vào hệ thống.
Main Flow	1.	Người dùng chọn mục Profile trên giao diện chính.
2.	Hệ thống hiển thị trang thông tin cá nhân của người dùng.
3.	Người dùng chỉnh sửa thông tin cá nhân.
4.	Người dùng chọn Lưu thay đổi.
5.	Hệ thống kiểm tra dữ liệu hợp lệ.
6.	Hệ thống cập nhật thông tin và hiển thị thông báo thành công.
      Alternate Flow	AF1: Người dùng chỉ xem thông tin
      •	Tại bước 3, actor không thực hiện chỉnh sửa.
      •	Hệ thống giữ nguyên thông tin cá nhân.
      •	Use case kết thúc.
      AF2: Người dùng hủy thao tác cập nhật
      •	Tại bước 4, actor chọn Hủy.
      •	Hệ thống không lưu thay đổi.
      •	Hệ thống quay lại trang thông tin cá nhân.
      •	Use case kết thúc.
      Exception Flow	EL1: Dữ liệu không hợp lệ
      •	Người dùng nhập thông tin cá nhân không hợp lệ (email sai định dạng, số điện thoại không đúng).
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc, thông tin không được cập nhật.
      EL2: Phiên đăng nhập hết hạn
      •	Phiên đăng nhập của actor đã hết hạn.
      •	Hệ thống yêu cầu actor đăng nhập lại.
      •	Use case kết thúc.

4.1.6. Xác thực hai bước
[6]	Xác thực hai bước
Actor	Khách hàng
Trigger	Khách hàng chọn chức năng Xác thực 2 bước trong mục Quản lý thông tin cá nhân.
Description	Use case này cho phép khách hàng bật hoặc tắt xác thực hai bước để tăng cường bảo mật cho tài khoản.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Khách hàng đang ở trang Quản lý thông tin cá nhân.
Post-Conditions	•	Trạng thái xác thực 2 bước được cập nhật (bật hoặc tắt).
•	Thông tin xác thực được lưu vào hệ thống.
Main Flow	1.	Khách hàng chọn chức năng Xác thực 2 bước.
2.	Hệ thống hiển thị thông tin và trạng thái xác thực 2 bước hiện tại.
3.	Khách hàng chọn Bật xác thực 2 bước.
4.	Hệ thống gửi mã xác thực (OTP) đến phương thức đã đăng ký (email).
5.	Khách hàng nhập mã xác thực.
6.	Hệ thống kiểm tra mã xác thực.
7.	Hệ thống kích hoạt xác thực 2 bước và hiển thị thông báo thành công.
      Alternate Flow	AF1: Khách hàng tắt xác thực 2 bước
      •	Tại bước 3, Khách hàng chọn Tắt xác thực 2 bước.
      •	Hệ thống yêu cầu xác nhận.
      •	Khách hàng xác nhận.
      •	Hệ thống cập nhật trạng thái xác thực 2 bước.
      •	Use case kết thúc.
      AF2: Khách hàng hủy thao tác
      •	Tại bước 5, khách hàng hủy.
      •	Hệ thống không thay đổi trạng thái xác thực.
      •	Use case kết thúc.
      Exception Flow	EL1: Mã xác thực không hợp lệ
      •	Khách hàng nhập sai hoặc mã xác thực đã hết hạn.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.
      EL2: Không gửi được mã xác thực
      •	Hệ thống không thể gửi mã xác thực.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.

4.1.7. Đổi mật khẩu
[7]	Đổi mật khẩu
Actor	Khách hàng, chủ cửa hàng
Trigger	Người dùng chọn chức năng “Đổi mật khẩu” trong mục Quản lý thông tin cá nhân.
Description	Use case này cho phép người dùng thay đổi mật khẩu đăng nhập của tài khoản nhằm tăng cường bảo mật.
Pre-Conditions	•	Người dùng đã đăng nhập vào hệ thống.
•	Người dùng đang ở trang Quản lý thông tin cá nhân.
Post-Conditions	•	Mật khẩu mới được cập nhật và lưu vào hệ thống.
•	Mật khẩu cũ không còn hiệu lực.
Main Flow	1.	Người dùng chọn chức năng Đổi mật khẩu.
2.	Hệ thống hiển thị form đổi mật khẩu.
3.	Người dùng nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.
4.	Người dùng chọn Xác nhận.
5.	Hệ thống kiểm tra tính hợp lệ của mật khẩu.
6.	Hệ thống cập nhật mật khẩu mới.
7.	Hệ thống hiển thị thông báo đổi mật khẩu thành công.
      Alternate Flow	AF1: Người dùng hủy thao tác
      •	Tại bước 4, khách hàng chọn Hủy.
      •	Hệ thống không thay đổi mật khẩu.
      •	Hệ thống quay lại trang Quản lý thông tin cá nhân.
      •	Use case kết thúc.
      Exception Flow	EL1: Mật khẩu hiện tại không đúng
      •	Người dùng nhập sai mật khẩu hiện tại.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.
      EL2: Mật khẩu mới không hợp lệ
      •	Mật khẩu mới không đáp ứng yêu cầu bảo mật (quá ngắn, thiếu ký tự đặc biệt…).
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.

4.1.10. Quản lý mục yêu thích
[10]	Quản lý mục yêu thích
Actor	Khách hàng
Trigger	Khách hàng truy cập vào chức năng Mục yêu thích.
Description	Use case này cho phép khách hàng xem và quản lý danh sách các sản phẩm yêu thích, bao gồm xem danh sách và loại bỏ sản phẩm khỏi mục yêu thích.
Pre-Conditions	Khách hàng đã đăng nhập vào hệ thống.
Post-Conditions	•	Danh sách sản phẩm yêu thích của khách hàng được hiển thị hoặc cập nhật.
•	Không có dữ liệu sản phẩm trong hệ thống bị thay đổi.
Main Flow	1.	Khách hàng truy cập vào chức năng Quản lý mục yêu thích.
2.	Hệ thống truy xuất danh sách các sản phẩm yêu thích của khách hàng.
3.	Hệ thống hiển thị danh sách sản phẩm yêu thích.
4.	Khách hàng chọn một sản phẩm trong danh sách yêu thích để xóa.
5.	Hệ thống cập nhật lại danh sách sản phẩm yêu thích.
6.	Use case kết thúc.
      Alternate Flow	AF1: Danh sách mục yêu thích trống
      •	Tại bước 2, nếu khách hàng chưa có sản phẩm nào trong mục yêu thích:
-	Hệ thống hiển thị thông báo danh sách mục yêu thích trống.
-	Use case kết thúc.
     Exception Flow	EL1: Lỗi tải dữ liệu mục yêu thích
     •	Hệ thống gặp lỗi khi truy xuất danh sách sản phẩm yêu thích.
     •	Hệ thống hiển thị thông báo lỗi.
     •	Use case kết thúc.
