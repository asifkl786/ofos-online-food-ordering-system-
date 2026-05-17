package com.ofos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "categories")
@Data
public class Category extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String name;
    
    private String description;
    
    private String imageUrl;
    
    private Integer displayOrder;
    
    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    private Category parentCategory;
    
    @OneToMany(mappedBy = "parentCategory", cascade = CascadeType.ALL)
    private List<Category> subCategories = new ArrayList<>();
    
    @OneToMany(mappedBy = "category")
    private List<MenuItem> menuItems = new ArrayList<>();
    
    private Boolean isActive = true;
}
