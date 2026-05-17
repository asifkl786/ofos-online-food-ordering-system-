package com.ofos.service.impl;

import com.ofos.dto.request.CategoryRequest;
import com.ofos.dto.response.CategoryResponse;
import com.ofos.entity.Category;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.CategoryRepository;
import com.ofos.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;
    
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Creating category: {}", request.getName());
        
        if (categoryRepository.existsByName(request.getName())) {
            throw new BusinessException("Category already exists: " + request.getName());
        }
        
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        
        if (request.getParentCategoryId() != null) {
            Category parent = categoryRepository.findById(request.getParentCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found"));
            category.setParentCategory(parent);
        }
        
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created with id: {}", savedCategory.getId());
        
        return convertToResponse(savedCategory);
    }
    
    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        log.info("Updating category with id: {}", id);
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new BusinessException("Category name already exists: " + request.getName());
            }
            category.setName(request.getName());
        }
        
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToResponse(updatedCategory);
    }
    
    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return convertToResponse(category);
    }
    
    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryResponse> getParentCategories() {
        return categoryRepository.findByParentCategoryIsNull().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryResponse> getSubCategories(Long parentId) {
        return categoryRepository.findByParentCategoryId(parentId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        log.info("Deleting category with id: {}", id);
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        // Check if category has menu items
        if (category.getMenuItems() != null && !category.getMenuItems().isEmpty()) {
            throw new BusinessException("Cannot delete category with associated menu items");
        }
        
        categoryRepository.delete(category);
    }
    
    @Override
    @Transactional
    public void activateCategory(Long id) {
        categoryRepository.updateCategoryStatus(id, true);
    }
    
    @Override
    @Transactional
    public void deactivateCategory(Long id) {
        categoryRepository.updateCategoryStatus(id, false);
    }
    
    private CategoryResponse convertToResponse(Category category) {
        CategoryResponse response = modelMapper.map(category, CategoryResponse.class);
        
        if (category.getParentCategory() != null) {
            response.setParentCategoryId(category.getParentCategory().getId());
            response.setParentCategoryName(category.getParentCategory().getName());
        }
        
        response.setMenuItemsCount(category.getMenuItems() != null ? category.getMenuItems().size() : 0);
        
        if (category.getSubCategories() != null && !category.getSubCategories().isEmpty()) {
            response.setSubCategories(category.getSubCategories().stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
}
