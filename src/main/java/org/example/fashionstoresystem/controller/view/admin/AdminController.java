package org.example.fashionstoresystem.controller.view.admin;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * View Controller cho hệ thống Admin H&Y.
 * Chỉ phục vụ trả về Thymeleaf template, không chứa business logic.
 */
@Controller
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/login")
    public String showLogin() {
        return "admin/pages/login";
    }

    @GetMapping({"", "/", "/dashboard"})
    public String showDashboard() {
        return "admin/pages/dashboard";
    }

    @GetMapping("/orders")
    public String showOrders() {
        return "admin/pages/orders";
    }

    @GetMapping("/products")
    public String showProducts() {
        return "admin/pages/products";
    }

    @GetMapping("/customers")
    public String showCustomers() {
        return "admin/pages/dashboard"; // TODO: tạo customers.html riêng
    }

    @GetMapping("/coupons")
    public String showCoupons() {
        return "admin/pages/dashboard"; // TODO: tạo coupons.html riêng
    }

    @GetMapping("/returns")
    public String showReturns() {
        return "admin/pages/dashboard"; // TODO: tạo returns.html riêng
    }

    @GetMapping("/reports")
    public String showReports() {
        return "admin/pages/dashboard"; // TODO: tạo reports.html riêng
    }
}
