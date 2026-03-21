package org.example.fashionstoresystem.entity.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "orders")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long id;

    @Column(nullable = false)
    private Date orderDate;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String shippingAddress;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String type;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderHistory> orderHistories = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

}
