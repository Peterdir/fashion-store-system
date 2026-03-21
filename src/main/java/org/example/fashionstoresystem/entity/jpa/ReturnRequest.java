package org.example.fashionstoresystem.entity.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "return_requests")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "return_request_id")
    private Long id;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Date requestDate;

    @Column
    private Date processedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    // Linking to the original order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Linking to the user who requested
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // List of items returned. No orphanRemoval=true because deleting a return request should NOT delete the actual order items!
    @Builder.Default
    @OneToMany(mappedBy = "returnRequest", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<OrderItem> returnItems = new ArrayList<>();
}
