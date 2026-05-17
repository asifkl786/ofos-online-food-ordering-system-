package com.ofos.service.impl;

import java.math.BigDecimal;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ofos.dto.request.RestaurantRequest;
import com.ofos.dto.request.RestaurantSearchRequest;
import com.ofos.dto.request.RestaurantUpdateRequest;
import com.ofos.dto.response.RestaurantAddressResponse;
import com.ofos.dto.response.RestaurantResponse;
import com.ofos.entity.Restaurant;
import com.ofos.entity.RestaurantAddress;
import com.ofos.entity.User;
import com.ofos.entity.UserRole;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.RestaurantAddressRepository;
import com.ofos.repository.RestaurantRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.RestaurantService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantServiceImpl implements RestaurantService {
    
    private final RestaurantRepository restaurantRepository;
    private final RestaurantAddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Override
    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request, String ownerEmail) {
        log.info("Creating restaurant for owner: {}", ownerEmail);
        
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if user is RESTAURANT_OWNER or ADMIN
        if (owner.getRole() != UserRole.RESTAURANT_OWNER && owner.getRole() != UserRole.ADMIN) {
            throw new BusinessException("User is not authorized to create a restaurant");
        }
        
        // Check if restaurant with same name exists for this owner
        if (restaurantRepository.existsByNameAndOwnerId(request.getName(), owner.getId())) {
            throw new BusinessException("You already have a restaurant with this name");
        }
        
        // Create restaurant
        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setCuisineType(request.getCuisineType());
        restaurant.setMinimumOrderAmount(request.getMinimumOrderAmount());
        restaurant.setDeliveryFee(request.getDeliveryFee());
        restaurant.setOpeningTime(request.getOpeningTime());
        restaurant.setClosingTime(request.getClosingTime());
        restaurant.setContactPhone(request.getContactPhone());
        restaurant.setContactEmail(request.getContactEmail());
        restaurant.setWebsite(request.getWebsite());
        restaurant.setGstNumber(request.getGstNumber());
        restaurant.setFssaiLicenseNumber(request.getFssaiLicenseNumber());
        restaurant.setOwner(owner);
        restaurant.setIsOpen(true);
        
        // For admin, auto-verify; for others, pending verification
        restaurant.setIsVerified(owner.getRole() == UserRole.ADMIN);
        
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created with id: {}", savedRestaurant.getId());
        
        // Create restaurant address
        RestaurantAddress address = new RestaurantAddress();
        address.setStreetAddress(request.getAddress().getStreetAddress());
        address.setLandmark(request.getAddress().getLandmark());
        address.setCity(request.getAddress().getCity());
        address.setState(request.getAddress().getState());
        address.setZipCode(request.getAddress().getZipCode());
        address.setCountry(request.getAddress().getCountry());
        address.setLatitude(request.getAddress().getLatitude());
        address.setLongitude(request.getAddress().getLongitude());
        address.setIsPrimary(true);
        address.setRestaurant(savedRestaurant);
        
        addressRepository.save(address);
        log.info("Restaurant address created for restaurant: {}", savedRestaurant.getId());
        
        return convertToResponse(savedRestaurant);
    }
    
    @Override
    @Transactional
    public RestaurantResponse updateRestaurant(Long restaurantId, RestaurantUpdateRequest request, String ownerEmail) {
        log.info("Updating restaurant with id: {}", restaurantId);
        
        Restaurant restaurant = getRestaurantAndValidateOwner(restaurantId, ownerEmail);
        
        if (request.getName() != null) restaurant.setName(request.getName());
        if (request.getDescription() != null) restaurant.setDescription(request.getDescription());
        if (request.getCuisineType() != null) restaurant.setCuisineType(request.getCuisineType());
        if (request.getLogoUrl() != null) restaurant.setLogoUrl(request.getLogoUrl());
        if (request.getCoverImageUrl() != null) restaurant.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getMinimumOrderAmount() != null) restaurant.setMinimumOrderAmount(request.getMinimumOrderAmount());
        if (request.getDeliveryFee() != null) restaurant.setDeliveryFee(request.getDeliveryFee());
        if (request.getOpeningTime() != null) restaurant.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) restaurant.setClosingTime(request.getClosingTime());
        if (request.getContactPhone() != null) restaurant.setContactPhone(request.getContactPhone());
        if (request.getContactEmail() != null) restaurant.setContactEmail(request.getContactEmail());
        if (request.getWebsite() != null) restaurant.setWebsite(request.getWebsite());
        
        Restaurant updatedRestaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant updated successfully: {}", updatedRestaurant.getId());
        
        return convertToResponse(updatedRestaurant);
    }
    
    @Override
    public RestaurantResponse getRestaurantById(Long id) {
        log.debug("Fetching restaurant by id: {}", id);
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        return convertToResponse(restaurant);
    }
    
    @Override
    public Page<RestaurantResponse> getAllRestaurants(int page, int size, String sortBy, String sortDirection) {
        log.debug("Fetching all restaurants with pagination");
        
        Sort.Direction direction = Sort.Direction.fromString(sortDirection);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        return restaurantRepository.findAll(pageable).map(this::convertToResponse);
    }
    
    @Override
    public Long getOwnerIdByEmail(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return owner.getId();
    }
    
    @Override
    public Page<RestaurantResponse> getRestaurantsByOwner(Long ownerId, int page, int size) {
        log.debug("Fetching restaurants for owner: {}", ownerId);
        // Check if owner exists
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with id: " + ownerId));
        Pageable pageable = PageRequest.of(page, size);
        Page<Restaurant> restaurants = restaurantRepository.findByOwnerId(ownerId, pageable); 
        return restaurants.map(this::convertToResponse);
       // return restaurantRepository.findByOwnerId(ownerId, pageable).map(this::convertToResponse);
    }
    
    @Override
    public Page<RestaurantResponse> searchRestaurants(String keyword, int page, int size) {
        log.debug("Searching restaurants with keyword: {}", keyword);
        Pageable pageable = PageRequest.of(page, size);
        return restaurantRepository.searchRestaurants(keyword, pageable).map(this::convertToResponse);
    }
    
    @Override
    public Page<RestaurantResponse> filterRestaurants(RestaurantSearchRequest request) {
        log.debug("Filtering restaurants with criteria");
        
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), 
                Sort.by(Sort.Direction.fromString(request.getSortDirection()), request.getSortBy()));
        
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            return restaurantRepository.searchRestaurants(request.getKeyword(), pageable)
                    .map(this::convertToResponse);
        } else if (request.getCity() != null && !request.getCity().isEmpty()) {
            return restaurantRepository.findRestaurantsByCity(request.getCity(), pageable)
                    .map(this::convertToResponse);
        } else {
            return restaurantRepository.filterRestaurants(request.getCuisineType(), 
                    request.getIsOpen(), request.getMinRating(), pageable)
                    .map(this::convertToResponse);
        }
    }
    
    @Override
    @Transactional
    public void updateRestaurantStatus(Long restaurantId, Boolean isOpen, String ownerEmail) {
        log.info("Updating restaurant status for id: {} to {}", restaurantId, isOpen);
        
        Restaurant restaurant = getRestaurantAndValidateOwner(restaurantId, ownerEmail);
        restaurant.setIsOpen(isOpen);
        restaurantRepository.save(restaurant);
        log.info("Restaurant status updated successfully");
    }
    
    @Override
    @Transactional
    public void verifyRestaurant(Long restaurantId, Boolean isVerified) {
        log.info("Updating restaurant verification for id: {} to {}", restaurantId, isVerified);
        restaurantRepository.updateVerificationStatus(restaurantId, isVerified);
    }
    
    @Override
    @Transactional
    public void deleteRestaurant(Long restaurantId, String ownerEmail) {
        log.info("Deleting restaurant with id: {}", restaurantId);
        
        Restaurant restaurant = getRestaurantAndValidateOwner(restaurantId, ownerEmail);
        
        // Delete associated addresses first
        addressRepository.deleteByRestaurantId(restaurantId);
        
        // Delete restaurant
        restaurantRepository.delete(restaurant);
        log.info("Restaurant deleted successfully");
    }
    
    @Override
    public Long getTotalOrdersCount(Long restaurantId) {
        return restaurantRepository.countCompletedOrders(restaurantId);
    }
    
    @Override
    public BigDecimal getTotalRevenue(Long restaurantId) {
        return restaurantRepository.calculateTotalRevenue(restaurantId);
    }
    
    @Override
    @Transactional
    public void updateRestaurantRating(Long restaurantId) {
        log.info("Updating restaurant rating for id: {}", restaurantId);
        // This will be called from Review module when a review is added
        // Calculate average rating from reviews table
        // Update using repository method
    }
    
    // Helper Methods
    private Restaurant getRestaurantAndValidateOwner(Long restaurantId, String ownerEmail) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
        
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!restaurant.getOwner().getId().equals(owner.getId()) && owner.getRole() != UserRole.ADMIN) {
            throw new BusinessException("You are not authorized to modify this restaurant");
        }
        
        return restaurant;
    }
    
    private RestaurantResponse convertToResponse(Restaurant restaurant) {
        RestaurantResponse response = modelMapper.map(restaurant, RestaurantResponse.class);
        
        response.setOwnerId(restaurant.getOwner().getId());
        response.setOwnerName(restaurant.getOwner().getFirstName() + " " + restaurant.getOwner().getLastName());
        response.setMenuItemsCount(restaurant.getMenuItems() != null ? restaurant.getMenuItems().size() : 0);
        
        if (restaurant.getAddresses() != null) {
            response.setAddresses(restaurant.getAddresses().stream()
                    .map(addr -> modelMapper.map(addr, RestaurantAddressResponse.class))
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
}
