package com.ofos.service.impl;

import com.ofos.dto.request.MenuItemRequest;
import com.ofos.dto.request.MenuItemUpdateRequest;
import com.ofos.dto.response.MenuItemResponse;
import com.ofos.entity.Category;
import com.ofos.entity.MenuItem;
import com.ofos.entity.Restaurant;
import com.ofos.entity.User;
import com.ofos.entity.UserRole;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.CategoryRepository;
import com.ofos.repository.MenuItemRepository;
import com.ofos.repository.RestaurantRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.MenuItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenuItemServiceImpl implements MenuItemService {
    
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Override
    @Transactional
    public MenuItemResponse addMenuItem(MenuItemRequest request, Long restaurantId, String ownerEmail) {
        log.info("Adding menu item to restaurant: {}", restaurantId);
        
        // Validate restaurant ownership
        Restaurant restaurant = getRestaurantAndValidateOwner(restaurantId, ownerEmail);
        
        // Create menu item
        MenuItem menuItem = new MenuItem();
        menuItem.setName(request.getName());
        menuItem.setDescription(request.getDescription());
        menuItem.setPrice(request.getPrice());
        menuItem.setPreparationTime(request.getPreparationTime());
        menuItem.setImageUrl(request.getImageUrl());
        menuItem.setIsAvailable(request.getIsAvailable());
        menuItem.setIsVegetarian(request.getIsVegetarian());
        menuItem.setIsVegan(request.getIsVegan());
        menuItem.setIsGlutenFree(request.getIsGlutenFree());
        menuItem.setIsSpicy(request.getIsSpicy());
        menuItem.setCalories(request.getCalories());
        menuItem.setDiscountPercentage(request.getDiscountPercentage());
        menuItem.setMaxOrderQuantity(request.getMaxOrderQuantity());
        menuItem.setAvailableAddons(request.getAvailableAddons());
        menuItem.setAdditionalImages(request.getAdditionalImages());
        menuItem.setRestaurant(restaurant);
        
        // Set category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            menuItem.setCategory(category);
        }
        
        MenuItem savedMenuItem = menuItemRepository.save(menuItem);
        log.info("Menu item added successfully with id: {}", savedMenuItem.getId());
        
        return convertToResponse(savedMenuItem);
    }
    
    @Override
    @Transactional
    public MenuItemResponse updateMenuItem(Long menuItemId, MenuItemUpdateRequest request, String ownerEmail) {
        log.info("Updating menu item with id: {}", menuItemId);
        
        MenuItem menuItem = getMenuItemAndValidateOwner(menuItemId, ownerEmail);
        
        if (request.getName() != null) menuItem.setName(request.getName());
        if (request.getDescription() != null) menuItem.setDescription(request.getDescription());
        if (request.getPrice() != null) menuItem.setPrice(request.getPrice());
        if (request.getPreparationTime() != null) menuItem.setPreparationTime(request.getPreparationTime());
        if (request.getImageUrl() != null) menuItem.setImageUrl(request.getImageUrl());
        if (request.getIsAvailable() != null) menuItem.setIsAvailable(request.getIsAvailable());
        if (request.getIsVegetarian() != null) menuItem.setIsVegetarian(request.getIsVegetarian());
        if (request.getIsVegan() != null) menuItem.setIsVegan(request.getIsVegan());
        if (request.getIsGlutenFree() != null) menuItem.setIsGlutenFree(request.getIsGlutenFree());
        if (request.getIsSpicy() != null) menuItem.setIsSpicy(request.getIsSpicy());
        if (request.getCalories() != null) menuItem.setCalories(request.getCalories());
        if (request.getDiscountPercentage() != null) menuItem.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getMaxOrderQuantity() != null) menuItem.setMaxOrderQuantity(request.getMaxOrderQuantity());
        if (request.getAvailableAddons() != null) menuItem.setAvailableAddons(request.getAvailableAddons());
        if (request.getAdditionalImages() != null) menuItem.setAdditionalImages(request.getAdditionalImages());
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            menuItem.setCategory(category);
        }
        
        MenuItem updatedMenuItem = menuItemRepository.save(menuItem);
        log.info("Menu item updated successfully: {}", updatedMenuItem.getId());
        
        return convertToResponse(updatedMenuItem);
    }
    
    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse getMenuItemById(Long id) {
        log.debug("Fetching menu item by id: {}", id);
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with id: " + id));
        return convertToResponse(menuItem);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> getAllMenuItems(Pageable pageable) {
        log.debug("Fetching all menu items for admin");
        return menuItemRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> getMenuItemsByRestaurant(Long restaurantId, int page, int size) {
        log.debug("Fetching menu items for restaurant: {}", restaurantId);
        Pageable pageable = PageRequest.of(page, size);
        return menuItemRepository.findByRestaurantId(restaurantId, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> getAvailableMenuItemsByRestaurant(Long restaurantId, int page, int size) {
        log.debug("Fetching available menu items for restaurant: {}", restaurantId);
        Pageable pageable = PageRequest.of(page, size);
        return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> searchMenuItems(Long restaurantId, String keyword, int page, int size) {
        log.debug("Searching menu items with keyword: {} for restaurant: {}", keyword, restaurantId);
        Pageable pageable = PageRequest.of(page, size);
        return menuItemRepository.searchMenuItems(restaurantId, keyword, pageable)
                .map(this::convertToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItemsByCategory(Long restaurantId, Long categoryId) {
        log.debug("Fetching menu items by category: {} for restaurant: {}", categoryId, restaurantId);
        return menuItemRepository.findByRestaurantIdAndCategoryId(restaurantId, categoryId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getDiscountedMenuItems(Long restaurantId) {
        log.debug("Fetching discounted menu items for restaurant: {}", restaurantId);
        return menuItemRepository.findDiscountedItems(restaurantId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void updateAvailability(Long menuItemId, Boolean isAvailable, String ownerEmail) {
        log.info("Updating availability for menu item: {} to {}", menuItemId, isAvailable);
        getMenuItemAndValidateOwner(menuItemId, ownerEmail);
        menuItemRepository.updateAvailability(menuItemId, isAvailable);
    }
    
    @Override
    @Transactional
    public void updatePrice(Long menuItemId, BigDecimal price, String ownerEmail) {
        log.info("Updating price for menu item: {} to {}", menuItemId, price);
        getMenuItemAndValidateOwner(menuItemId, ownerEmail);
        menuItemRepository.updatePrice(menuItemId, price);
    }
    
    @Override
    @Transactional
    public void updateDiscount(Long menuItemId, Integer discountPercentage, String ownerEmail) {
        log.info("Updating discount for menu item: {} to {}%", menuItemId, discountPercentage);
        getMenuItemAndValidateOwner(menuItemId, ownerEmail);
        menuItemRepository.updateDiscount(menuItemId, discountPercentage);
    }
    
    @Override
    @Transactional
    public void deleteMenuItem(Long menuItemId, String ownerEmail) {
        log.info("Deleting menu item with id: {}", menuItemId);
        MenuItem menuItem = getMenuItemAndValidateOwner(menuItemId, ownerEmail);
        menuItemRepository.delete(menuItem);
        log.info("Menu item deleted successfully");
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getVegetarianMenuItems(Long restaurantId) {
        log.debug("Fetching vegetarian menu items for restaurant: {}", restaurantId);
        return menuItemRepository.findByRestaurantIdAndIsVegetarianTrue(restaurantId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getMenuItemsByPriceRange(Long restaurantId, BigDecimal minPrice, BigDecimal maxPrice) {
        log.debug("Fetching menu items by price range for restaurant: {}", restaurantId);
        return menuItemRepository.findMenuItemsByPriceRange(restaurantId, minPrice, maxPrice)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    private Restaurant getRestaurantAndValidateOwner(Long restaurantId, String ownerEmail) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!restaurant.getOwner().getId().equals(owner.getId()) && owner.getRole() != UserRole.ADMIN) {
            throw new BusinessException("You are not authorized to modify this restaurant's menu");
        }
        
        return restaurant;
    }
    
    private MenuItem getMenuItemAndValidateOwner(Long menuItemId, String ownerEmail) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Long restaurantOwnerId = menuItem.getRestaurant().getOwner().getId();
        if (!restaurantOwnerId.equals(owner.getId()) && owner.getRole() != UserRole.ADMIN) {
            throw new BusinessException("You are not authorized to modify this menu item");
        }
        
        return menuItem;
    }
    
    private MenuItemResponse convertToResponse(MenuItem menuItem) {
        MenuItemResponse response = modelMapper.map(menuItem, MenuItemResponse.class);
        
        response.setRestaurantId(menuItem.getRestaurant().getId());
        response.setRestaurantName(menuItem.getRestaurant().getName());
        
        if (menuItem.getCategory() != null) {
            response.setCategoryId(menuItem.getCategory().getId());
            response.setCategoryName(menuItem.getCategory().getName());
        }
        
        // Calculate discounted price
        if (menuItem.getDiscountPercentage() != null && menuItem.getDiscountPercentage() > 0) {
            BigDecimal discountAmount = menuItem.getPrice()
                    .multiply(BigDecimal.valueOf(menuItem.getDiscountPercentage()))
                    .divide(BigDecimal.valueOf(100));
            response.setDiscountedPrice(menuItem.getPrice().subtract(discountAmount));
        } else {
            response.setDiscountedPrice(menuItem.getPrice());
        }
        
        // Get total orders count
        Integer totalOrders = menuItemRepository.getTotalOrdersCountForMenuItem(menuItem.getId());
        response.setTotalOrders(totalOrders);
        
        return response;
    }
}
