package org.example.fashionstoresystem.repository;

import org.example.fashionstoresystem.entity.enums.Role;
import org.example.fashionstoresystem.entity.jpa.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Kiểm tra trùng lặp email/SĐT khi đăng ký
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // Xác thực tài khoản qua link gửi về email
    Optional<User> findByVerificationToken(String verificationToken);

    // Tìm user để đăng nhập hoặc khôi phục mật khẩu
    Optional<User> findByEmail(String email);

    // Chặn trùng lặp data của user khác khi cập nhật thông tin cá nhân
    Boolean existsByEmailAndIdNot(String email, Long id);
    Boolean existsByPhoneAndIdNot(String phone, Long id);

    // Admin
    List<User> findByRole(Role role);
}
