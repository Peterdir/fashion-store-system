package org.example.fashionstoresystem.entity.jpa;

import jakarta.persistence.*;
import lombok.*;

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

    @Column
    private String previousStatus;

    @Column
    private String newStatus;

    @Column
    private Date changeDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
}
