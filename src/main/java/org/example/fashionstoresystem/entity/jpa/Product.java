package org.example.fashionstoresystem.entity.jpa;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    @Column(name = "product_id")
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private int size;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private Long stockQuantity;

}
