package com.ofos.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Integer displayOrder;
    private Long parentCategoryId;
    private String parentCategoryName;
    private List<CategoryResponse> subCategories;
    private Integer menuItemsCount;
    private Boolean isActive;
}