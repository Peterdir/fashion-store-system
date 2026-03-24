4.1.11. Thêm vào mục yêu thích
[11]	Thêm vào mục yêu thích
Actor	Khách hàng
Trigger	Khách hàng chọn chức năng Thêm vào mục yêu thích khi đang xem chi tiết sản phẩm.
Description	Use case này cho phép khách hàng thêm một sản phẩm vào danh sách yêu thích của mình để dễ dàng theo dõi và quản lý sau này.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Khách hàng đang ở trang Xem chi tiết sản phẩm.
Post-Conditions	•	Trạng thái yêu thích của sản phẩm được cập nhật.
•	Dữ liệu sản phẩm trong hệ thống không bị thay đổi.
Main Flow	1.	Khách hàng nhấn biểu tượng trái tim trên trang xem chi tiết sản phẩm.
2.	Hệ thống kiểm tra trạng thái sản phẩm trong danh sách yêu thích.
3.	Nếu sản phẩm chưa có trong mục yêu thích:
      •	Hệ thống thêm sản phẩm vào mục yêu thích.
      •	Hệ thống hiển thị trạng thái đã yêu thích.
4.	Nếu sản phẩm đã có trong mục yêu thích.
      •	Hệ thống loại bỏ sản phẩm khỏi mục yêu thích.
      •	Hệ thống hiển thị trạng thái chưa yêu thích.
5.	Use case kết thúc.
      Alternate Flow	Không có.
      Exception Flow	EL1: Lỗi cập nhật dữ liệu mục yêu thích
      •	Hệ thống gặp lỗi khi cập nhật trạng thái mục yêu thích.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.

4.1.12. Quản lý giỏ hàng
[12]	Quản lý giỏ hàng
Actor	Khách hàng
Trigger	Khách hàng chọn chức năng Giỏ hàng trên giao diện trang chủ.
Description	Use case này cho phép khách hàng xem và quản lý các sản phẩm trong giỏ hàng, bao gồm xem danh sách sản phẩm, cập nhật số lượng hoặc loại bỏ sản phẩm khỏi giỏ hàng.
Pre-Conditions	•	Khách hàng đã đăng nhập hệ thống.
Post-Conditions	•	Giỏ hàng của khách hàng được cập nhật theo các thay đổi.
Main Flow	1.	Khách hàng chọn chức năng Giỏ hàng.
2.	Hệ thống truy suất thông tin giỏ hàng của khách hàng.
3.	Hệ thống hiển thị danh sách sản phẩm trong giỏ hàng.
4.	Khách hàng thực hiện một trong các thao tác:
      •	Thay đổi số lượng sản phẩm.
      •	Xóa sản phẩm khỏi giỏ hàng.
5.	Hệ thống cập nhật lại giỏ hàng theo các thao tác của khách hàng.
6.	Hệ thống hiển thị giỏ hàng đã được cập nhật.
7.	Use case kết thúc.
      Alternate Flow	AF1: Giỏ hàng trống
      •	Tại bước 2, nếu giỏ hàng không có sản phẩm:
      o	Hệ thống hiển thị thông báo giỏ hàng trống.
      o	Use case kết thúc.
      Exception Flow	EL1: Lỗi cập nhật giỏ hàng
      •	Hệ thống gặp lỗi khi cập nhật thông tin giỏ hàng.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.

4.1.13. Thêm vào giỏ hàng
[13]	Thêm vào giỏ hàng
Actor	Khách hàng
Trigger	Khách hàng chọn chức năng Thêm vào giỏ hàng khi đang xem chi tiết sản phẩm.
Description	Use case này cho phép khách hàng thêm một sản phẩm vào giỏ hàng để chuẩn bị cho việc mua hàng.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Khách hàng đang ở trang Xem chi tiết sản phẩm.
Post-Conditions	•	Sản phẩm được thêm vào giỏ hàng của khách hàng hoặc số lượng sản phẩm trong giỏ hàng được cập nhật.
•	Dữ liệu sản phẩm trong hệ thống không bị thay đổi.
Main Flow	1.	Khách hàng chọn chức năng Thêm vào giỏ hàng trên trang xem chi tiết sản phẩm.
2.	Hệ thống kiểm tra thông tin sản phẩm (kích thước, màu sắc, số lượng) đã được khách hàng chọn đầy đủ hay chưa.
3.	Hệ thống kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa.
4.	Nếu sản phẩm chưa có trong giỏ hàng:
      4.1. Hệ thống thêm sản phẩm vào giỏ hàng với số lượng tương ứng.
5.	Nếu sản phẩm đã có trong giỏ hàng:
      5.1. Hệ thống cập nhật lại số lượng sản phẩm trong giỏ hàng.
6.	Hệ thống hiển thị thông báo thêm sản phẩm vào giỏ hàng thành công.
7.	Use case kết thúc.
      Alternate Flow	AF1: Khách hàng chưa chọn đầy đủ thuộc tính sản phẩm
      •	Tại bước 2, nếu khách hàng chưa chọn đầy đủ thông tin (kích thước, màu sắc,…):
      o	Hệ thống hiển thị thông báo yêu cầu khách hàng chọn đầy đủ thông tin sản phẩm.
      o	Use case kết thúc.
      Exception Flow	EL1: Lỗi cập nhật giỏ hàng
      •	Hệ thống gặp lỗi khi thêm hoặc cập nhật sản phẩm trong giỏ hàng.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.

4.1.14. Thu thập mã giảm giá
[14]	Thu thập mã giảm giá
Actor	Khách hàng
Trigger	Khách hàng chọn chức năng Thu thập mã giảm giá khi xem danh sách mã khuyến mãi hoặc khi xem chi tiết sản phẩm / trang khuyến mãi.
Description	Use case này cho phép khách hàng lưu (thu thập) một mã giảm giá vào tài khoản của mình để sử dụng trong quá trình đặt hàng và thanh toán.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Hệ thống đang có mã giảm giá hợp lệ.
Post-Conditions	•	Mã giảm giá được lưu vào danh sách mã giảm giá của khách hàng.
•	Mã giảm giá chưa được sử dụng và sẵn sàng áp dụng khi thanh toán.
Main Flow	1.	Khách hàng truy cập vào trang danh sách mã giảm giá hoặc trang có hiển thị mã khuyến mãi.
2.	Hệ thống hiển thị danh sách các mã giảm giá đang có.
3.	Khách hàng chọn chức năng Thu thập tại một mã giảm giá.
4.	Hệ thống kiểm tra tính hợp lệ của mã giảm giá.
5.	Hệ thống lưu mã giảm giá vào tài khoản của khách hàng.
6.	Hệ thống hiển thị thông báo thu thập mã giảm giá thành công.
7.	Use case kết thúc.
      Alternate Flow	AF1: Khách hàng hủy thao tác
      •	Tại bước 3, khách hàng không tiếp tục thu thập mã giảm giá.
      •	Use case kết thúc.
      Exception Flow	EL1: Mã giảm giá đã được thu thập trước đó
      Tại bước 4, nếu mã giảm giá đã tồn tại trong danh sách của khách hàng:
      •	Hệ thống hiển thị thông báo mã giảm giá đã được thu thập.
      •	Use case kết thúc.
      EL2: Mã giảm giá không hợp lệ hoặc đã hết hạn
      •	Tại bước 4, nếu mã giảm giá đã hết hạn hoặc không còn hiệu lực:
      o	Hệ thống hiển thị thông báo mã giảm giá không hợp lệ.
      o	Use case kết thúc.
      EL3: Lỗi lưu dữ liệu mã giảm giá
      •	Hệ thống gặp lỗi khi lưu mã giảm giá vào tài khoản khách hàng.
      •	Hệ thống hiển thị thông báo lỗi.
      •	Use case kết thúc.

4.1.15. Đặt hàng
[15]	Đặt hàng
Actor	Khách hàng
Trigger	Khách hàng truy cập vào giao diện xác nhận đơn hàng từ giỏ hàng hoặc thông qua chức năng “Mua ngay”.
Description	Use case này cho phép khách hàng xác nhận đơn hàng dựa trên các thông tin hiện có trong giỏ hàng, cung cấp hoặc xác nhận thông tin giao hàng, lựa chọn phương thức thanh toán và tạo đơn hàng trong hệ thống nếu các thông tin hợp lệ.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Giỏ hàng của khách hàng có ít nhất một sản phẩm.
Post-Conditions	Thành công:
•	Đơn hàng được tạo trong hệ thống.
•	Trạng thái đơn hàng được thiết lập tùy theo phương thức thanh toán.
Thất bại:
•	Đơn hàng không được tạo.
•	Hệ thống thông báo lỗi tương ứng.
Main Flow	1.	Khách hàng truy cập vào giỏ hàng hoặc chọn “Mua ngay” tại trang chi tiết sản phẩm.
2.	Hệ thống hiển thị giao diện xác nhận đơn hàng với đầy đủ thông tin.
3.	Khách hàng kiểm tra và xác nhận thông tin giao hàng.
4.	Khách hàng chọn áp dụng mã giá (nếu có).
5.	Hệ thống thực hiện use case “Áp dụng mã giảm giá”.
6.	Khách hàng lựa chọn phương thức thanh toán.
7.	Khách hàng nhấn nút “Đặt hàng”.
8.	Hệ thống kiểm tra tính hợp lệ của thông tin đơn hàng.
9.	Hệ thống tạo đơn hàng chính thức.
10.	Hệ thống cập nhật trạng thái đơn hàng tương ứng.
11.	Use case kết thúc.
       Alternate Flow	AF1: Khách hàng chọn phương thức thanh toán online
       •	Tại bước 6, khách hàng chọn phương thức thanh toán online.
       •	Sau bước 9, hệ thống tạo đơn hàng ở trạng thái Chờ thanh toán.
       •	Tiếp tục bước 10.
       AF2: Khách hàng thay đổi thông tin đơn hàng
       •	Tại bước 3 hoặc 6, khách hàng chỉnh sửa thông tin đơn hàng hoặc phương thức thanh toán.
       •	Hệ thống cập nhật thông tin và quay lại bước 3.
       Exception Flow	EL1: Thông tin giao hàng không hợp lệ
       •	Tại bước 2 hoặc bước 8:
       o	Hệ thống phát hiện sản phẩm không còn tồn tại hoặc hết hàng.
       o	Hệ thống hiển thị thông báo lỗi.
       o	Use case kết thúc.
       EL2: Giỏ hàng trống hoặc sản phẩm không hợp lệ
       •	Tại bước 8, nếu giỏ hàng trống hoặc sản phẩm không còn tồn tại/hết hàng:
       o	Hệ thống từ chối đặt hàng.
       o	Hệ thống hiển thị thông báo lỗi phù hợp.
       o	Use case kết thúc.
       EL3: Lỗi hệ thống khi tạo đơn hàng
       •	Hệ thống gặp lỗi trong quá trình tạo đơn hàng:
       o	Hệ thống hiển thị thông báo lỗi.
       o	Use case kết thúc.

4.1.16. Áp dụng mã giảm giá
[16]	Áp dụng mã giảm giá
Actor	Khách hàng
Trigger	Khách hàng nhập hoặc chọn mã giảm giá tại giao diện xác nhận đơn hàng.
Description	Use case này cho phép khách hàng áp dụng một mã giảm giá hợp lệ cho đơn hàng nhằm giảm giá trị thanh toán, nếu mã thỏa mãn các điều kiện sử dụng do hệ thống quy định.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Khách hàng đang ở giao diện xác nhận đơn hàng
•	Mã giảm giá tồn tại trong hệ thống và chưa hết hạn.
Post-Conditions	Thành công:
•	Mã giảm giá được áp dụng cho đơn hàng.
•	Tổng giá trị đơn hàng được cập nhật sau khi giảm giá.
Thất bại:
•	Mã giảm giá không được áp dụng.
•	Tổng giá trị đơn hàng giữ nguyên.
Main Flow	1.	Hệ thống hiển thị giao diện xác nhận đơn hàng.
2.	Hệ thống hiển thị khu vực nhập/chọn mã giảm giá.
3.	Khách hàng nhập hoặc chọn mã.
4.	Hệ thống kiểm tra tính hợp lệ.
5.	Nếu hợp lệ → cập nhật tổng tiền.
6.	Quay lại giao diện xác nhận đơn hàng.
      Alternate Flow	AF1: Khách hàng không sử dụng mã giảm giá
      •	Tại bước 3, khách hàng bỏ qua việc nhập/chọn mã.
      •	Hệ thống giữ nguyên tổng giá trị đơn hàng và tiếp tục quá trình thanh toán.
      Exception Flow	EF1. Mã giảm giá không hợp lệ
      •	Mã không tồn tại hoặc nhập sai.
      •	Hệ thống hiển thị thông báo “Mã giảm giá không hợp lệ”.
      EF2. Mã giảm giá hết hạn
      •	Hệ thống thông báo mã đã hết hạn và không cho áp dụng.
      EF3. Mã giảm giá không thỏa điều kiện sử dụng
      •	Không đủ giá trị đơn hàng tối thiểu / sai đối tượng áp dụng.
      •	Hệ thống thông báo lý do không thể sử dụng mã.
      EF4. Mã giảm giá đã được sử dụng hoặc vượt quá số lượt cho phép
      •	Hệ thống từ chối áp dụng mã và hiển thị thông báo tương ứng.

4.1.17. Thanh toán
[17]	Thanh toán
Actor	Khách hàng
Trigger	Khách hàng truy cập vào chức năng thanh toán của đơn hàng ở trạng thái Chờ thanh toán hoặc Thanh toán thất bại.
Description	Use case này cho phép khách hàng thực hiện thanh toán cho đơn hàng đã được tạo thành công thông qua các phương thức thanh toán mà hệ thống hỗ trợ. Hệ thống xử lý giao dịch và cập nhật trạng thái đơn hàng tương ứng với kết quả thanh toán.
Pre-Conditions	•	Khách hàng đã đăng nhập vào hệ thống.
•	Đơn hàng đã được tạo thành công.
•	Đơn hàng đang ở trạng thái Chờ thanh toán hoặc Thanh toán thất bại.
Post-Conditions	Thành công:
•	Giao dịch thanh toán được thực hiện thành công.
•	Trạng thái đơn hàng được cập nhật thành Đã thanh toán.
•	Hệ thống hiển thị thông báo thanh toán thành công.
Thất bại:
•	Giao dịch thanh toán không thành công hoặc bị hủy.
•	Trạng thái đơn hàng được cập nhật tương ứng (Thanh toán thất bại / Hết hạn thanh toán / Giữ nguyên Chờ thanh toán).
•	Hệ thống hiển thị thông báo lỗi tương ứng.
Main Flow	1.	Hệ thống hiển thị giao diện thanh toán của đơn hàng.
2.	Hệ thống hiển thị:
      •	Thông tin đơn hàng
      •	Tổng số tiền cần thanh toán
      •	Phương thức thanh toán hiện tại
3.	Khách hàng xác nhận phương thức thanh toán và chọn “Thanh toán”.
4.	Hệ thống kiểm tra thời gian thanh toán của đơn hàng.
5.	Nếu còn trong thời gian cho phép, hệ thống gửi yêu cầu thanh toán đến cổng thanh toán tương ứng.
6.	Cổng thanh toán xử lý giao dịch và trả kết quả thành công.
7.	Hệ thống cập nhật trạng thái đơn hàng thành Đã thanh toán.
8.	Hệ thống hiển thị thông báo thanh toán thành công.
9.	Use case kết thúc.
      Alternate Flow	AF1: Khách hàng hủy thao tác thanh toán
      •	Tại bước 3, khách hàng hủy thanh toán.
      •	Hệ thống giữ nguyên trạng thái đơn hàng là Chờ thanh toán.
      •	Use case kết thúc.
      AF2: Khách hàng thay đổi phương thức thanh toán
      •	Tại bước 2, khách hàng chọn thay đổi phương thức thanh toán.
      •	Hệ thống cập nhật phương thức thanh toán mới.
      •	Quay lại bước 3.
      Exception Flow	EL1: Thanh toán thất bại
      •	Tại bước 5 hoặc 6, nếu giao dịch bị từ chối hoặc thất bại:
      o	Hệ thống cập nhật trạng thái đơn hàng thành Thanh toán thất bại.
      o	Hệ thống hiển thị thông báo lỗi.
      o	Use case kết thúc.
      EL2: Phương thức thanh toán không hợp lệ hoặc không khả dụng
      •	Tại bước 5, nếu phương thức thanh toán không hợp lệ hoặc tạm thời không khả dụng:
      o	Hệ thống hiển thị thông báo lỗi.
      o	Hệ thống yêu cầu khách hàng chọn phương thức khác.
      o	Quay lại bước 2.
      EL3: Lỗi hệ thống trong quá trình thanh toán
      •	Hệ thống gặp lỗi khi xử lý thanh toán:
      o	Hệ thống hiển thị thông báo lỗi.
      o	Đơn hàng giữ nguyên trạng thái Chờ thanh toán.
      o	Use case kết thúc.
      EL4: Đơn hàng quá thời gian thanh toán (Timeout 10 phút)
      •	Trước hoặc tại bước 4, nếu thời gian chờ thanh toán vượt quá 10 phút:
      o	Hệ thống từ chối thanh toán.
      o	Hệ thống cập nhật trạng thái đơn hàng là Hết hạn thanh toán.
      o	Hệ thống hiển thị thông báo đơn hàng đã hết thời gian thanh toán.
      o	Use case kết thúc.
