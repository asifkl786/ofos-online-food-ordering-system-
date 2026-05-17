package com.ofos.service;

import com.ofos.dto.request.CategoryRequest;
import com.ofos.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    
    CategoryResponse createCategory(CategoryRequest request);
    
    CategoryResponse updateCategory(Long id, CategoryRequest request);
    
    CategoryResponse getCategoryById(Long id);
    
    List<CategoryResponse> getAllCategories();
    
    List<CategoryResponse> getActiveCategories();
    
    List<CategoryResponse> getParentCategories();
    
    List<CategoryResponse> getSubCategories(Long parentId);
    
    void deleteCategory(Long id);
    
    void activateCategory(Long id);
    
    void deactivateCategory(Long id);
}