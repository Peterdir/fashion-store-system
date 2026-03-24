package org.example.fashionstoresystem.entity.jpa;

import jakarta.persistence.*;
import lombok.*;
import org.example.fashionstoresystem.entity.enums.OrderStatus;

import java.util.Date;

@Entity
@Table(name = "order_histories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_history")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column
    private OrderStatus newStatus;

    @Column
    private Date changeDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;
}
