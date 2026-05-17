package com.ofos.repository;

import com.ofos.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    Optional<Category> findByName(String name);
    
    List<Category> findByIsActiveTrue();
    
    List<Category> findByParentCategoryIsNull();
    
    List<Category> findByParentCategoryId(Long parentId);
    
    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Category> searchCategories(@Param("keyword") String keyword);
    
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.isActive = :isActive WHERE c.id = :categoryId")
    void updateCategoryStatus(@Param("categoryId") Long categoryId, @Param("isActive") Boolean isActive);
    
    boolean existsByName(String name);
}