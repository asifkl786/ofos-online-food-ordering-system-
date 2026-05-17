package com.ofos.controller;

import com.ofos.dto.request.CategoryRequest;
import com.ofos.dto.response.ApiResponse;
import com.ofos.dto.response.CategoryResponse;
import com.ofos.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Category Management", description = "APIs for managing menu categories")
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RESTAURANT_OWNER')")
    @Operation(summary = "Create category (Admin or restaurant owner)")
    // Owners can add a missing category while creating menu items so new items are not saved as Uncategorized.
    public ResponseEntity<ApiResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        log.info("REST request to create category: {}", request.getName());
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update category (Admin only)")
    public ResponseEntity<ApiResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        log.info("REST request to update category: {}", id);
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse> getCategoryById(@PathVariable Long id) {
        log.info("REST request to get category: {}", id);
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category found", response));
    }
    
    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse> getAllCategories() {
        log.info("REST request to get all categories");
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories found", categories));
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get active categories")
    public ResponseEntity<ApiResponse> getActiveCategories() {
        log.info("REST request to get active categories");
        List<CategoryResponse> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(ApiResponse.success("Active categories found", categories));
    }
    
    @GetMapping("/parent")
    @Operation(summary = "Get parent categories")
    public ResponseEntity<ApiResponse> getParentCategories() {
        log.info("REST request to get parent categories");
        List<CategoryResponse> categories = categoryService.getParentCategories();
        return ResponseEntity.ok(ApiResponse.success("Parent categories found", categories));
    }
    
    @GetMapping("/{parentId}/subcategories")
    @Operation(summary = "Get subcategories by parent ID")
    public ResponseEntity<ApiResponse> getSubCategories(@PathVariable Long parentId) {
        log.info("REST request to get subcategories for parent: {}", parentId);
        List<CategoryResponse> categories = categoryService.getSubCategories(parentId);
        return ResponseEntity.ok(ApiResponse.success("Subcategories found", categories));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete category (Admin only)")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        log.info("REST request to delete category: {}", id);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
    
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate category (Admin only)")
    public ResponseEntity<ApiResponse> activateCategory(@PathVariable Long id) {
        log.info("REST request to activate category: {}", id);
        categoryService.activateCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category activated successfully", null));
    }
    
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate category (Admin only)")
    public ResponseEntity<ApiResponse> deactivateCategory(@PathVariable Long id) {
        log.info("REST request to deactivate category: {}", id);
        categoryService.deactivateCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deactivated successfully", null));
    }
}
