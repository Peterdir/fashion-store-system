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

    @GetMapping("/categories")
    public String showCategories() {
        return "admin/pages/categories";
    }

    @GetMapping("/customers")
    public String showCustomers() {
        return "admin/pages/customers";
    }

    @GetMapping("/coupons")
    public String showCoupons() {
        return "admin/pages/coupons";
    }

    @GetMapping("/returns")
    public String showReturns() {
        return "admin/pages/returns";
    }

    @GetMapping("/reports")
    public String showReports() {
        return "admin/pages/reports";
    }

    @GetMapping("/offline-sale")
    public String showOfflineSale() {
        return "admin/pages/offline-sale";
    }
}
