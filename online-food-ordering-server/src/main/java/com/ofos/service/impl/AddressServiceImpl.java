package com.ofos.service.impl;

import com.ofos.dto.request.AddressRequest;
import com.ofos.dto.request.AddressUpdateRequest;
import com.ofos.dto.response.AddressResponse;
import com.ofos.entity.Address;
import com.ofos.entity.User;
import com.ofos.exception.BusinessException;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.AddressRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.AddressService;
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
public class AddressServiceImpl implements AddressService {
    
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    
    @Override
    @Transactional
    public AddressResponse addAddress(AddressRequest request, String userEmail) {
        log.info("Adding new address for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        
        // If this is the first address, make it default
        long addressCount = addressRepository.countActiveAddressesByUserId(user.getId());
        boolean isFirstAddress = addressCount == 0;
        
        Address address = new Address();
        address.setStreetAddress(request.getStreetAddress());
        address.setApartmentNumber(request.getApartmentNumber());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setZipCode(request.getZipCode());
        address.setCountry(request.getCountry());
        address.setLandmark(request.getLandmark());
        address.setAddressType(request.getAddressType());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setPhoneNumber(request.getPhoneNumber());
        address.setReceiverName(request.getReceiverName());
        address.setUser(user);
        address.setIsActive(true);
        
        // Handle default address logic
        if (request.getIsDefault() || isFirstAddress) {
            // Reset any existing default address
            addressRepository.resetDefaultAddress(user.getId());
            address.setIsDefault(true);
        } else {
            address.setIsDefault(false);
        }
        
        Address savedAddress = addressRepository.save(address);
        log.info("Address added successfully with id: {}", savedAddress.getId());
        
        return convertToResponse(savedAddress);
    }
    
    @Override
    @Transactional
    public AddressResponse updateAddress(Long addressId, AddressUpdateRequest request, String userEmail) {
        log.info("Updating address with id: {} for user: {}", addressId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Address address = getAddressAndValidateUser(addressId, user);
        
        if (request.getStreetAddress() != null) address.setStreetAddress(request.getStreetAddress());
        if (request.getApartmentNumber() != null) address.setApartmentNumber(request.getApartmentNumber());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getState() != null) address.setState(request.getState());
        if (request.getZipCode() != null) address.setZipCode(request.getZipCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getLandmark() != null) address.setLandmark(request.getLandmark());
        if (request.getAddressType() != null) address.setAddressType(request.getAddressType());
        if (request.getLatitude() != null) address.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) address.setLongitude(request.getLongitude());
        if (request.getPhoneNumber() != null) address.setPhoneNumber(request.getPhoneNumber());
        if (request.getReceiverName() != null) address.setReceiverName(request.getReceiverName());
        
        // Handle default address update
        if (request.getIsDefault() != null && request.getIsDefault() && !address.getIsDefault()) {
            addressRepository.resetDefaultAddress(user.getId());
            address.setIsDefault(true);
        }
        
        Address updatedAddress = addressRepository.save(address);
        log.info("Address updated successfully: {}", updatedAddress.getId());
        
        return convertToResponse(updatedAddress);
    }
    
    @Override
    public AddressResponse getAddressById(Long addressId, String userEmail) {
        log.debug("Fetching address by id: {} for user: {}", addressId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Address address = getAddressAndValidateUser(addressId, user);
        
        return convertToResponse(address);
    }
    
    @Override
    public List<AddressResponse> getAllAddresses(String userEmail) {
        log.debug("Fetching all addresses for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        List<Address> addresses = addressRepository.findByUser(user);
        
        return addresses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AddressResponse> getActiveAddresses(String userEmail) {
        log.debug("Fetching active addresses for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        List<Address> addresses = addressRepository.findActiveAddressesByUserId(user.getId());
        
        return addresses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AddressResponse> getAddressesByType(String addressType, String userEmail) {
        log.debug("Fetching addresses by type: {} for user: {}", addressType, userEmail);
        
        User user = getUserByEmail(userEmail);
        List<Address> addresses = addressRepository.findAddressesByType(user.getId(), addressType);
        
        return addresses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public AddressResponse getDefaultAddress(String userEmail) {
        log.debug("Fetching default address for user: {}", userEmail);
        
        User user = getUserByEmail(userEmail);
        Address defaultAddress = addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No default address found"));
        
        return convertToResponse(defaultAddress);
    }
    
    @Override
    @Transactional
    public void setDefaultAddress(Long addressId, String userEmail) {
        log.info("Setting default address: {} for user: {}", addressId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Address address = getAddressAndValidateUser(addressId, user);
        
        // Reset all addresses to non-default
        addressRepository.resetDefaultAddress(user.getId());
        
        // Set this address as default
        address.setIsDefault(true);
        addressRepository.save(address);
        
        log.info("Default address set successfully");
    }
    
    @Override
    @Transactional
    public void deleteAddress(Long addressId, String userEmail) {
        log.info("Deleting address with id: {} for user: {}", addressId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Address address = getAddressAndValidateUser(addressId, user);
        
        // Check if this is the only address
        long addressCount = addressRepository.countActiveAddressesByUserId(user.getId());
        
        if (addressCount == 1) {
            throw new BusinessException("Cannot delete the only address. Please add another address first.");
        }
        
        // If deleting default address, set another address as default
        if (address.getIsDefault()) {
            List<Address> otherAddresses = addressRepository.findActiveAddressesByUserId(user.getId())
                    .stream()
                    .filter(a -> !a.getId().equals(addressId))
                    .collect(Collectors.toList());
            
            if (!otherAddresses.isEmpty()) {
                Address newDefault = otherAddresses.get(0);
                newDefault.setIsDefault(true);
                addressRepository.save(newDefault);
            }
        }
        
        addressRepository.delete(address);
        log.info("Address deleted successfully");
    }
    
    @Override
    @Transactional
    public void softDeleteAddress(Long addressId, String userEmail) {
        log.info("Soft deleting address with id: {} for user: {}", addressId, userEmail);
        
        User user = getUserByEmail(userEmail);
        Address address = getAddressAndValidateUser(addressId, user);
        
        address.setIsActive(false);
        addressRepository.save(address);
        
        log.info("Address soft deleted successfully");
    }
    
    // Private Helper Methods
    
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
    
    private Address getAddressAndValidateUser(Long addressId, User user) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        
        if (!address.getUser().getId().equals(user.getId())) {
            throw new BusinessException("You are not authorized to access this address");
        }
        
        return address;
    }
    
    private AddressResponse convertToResponse(Address address) {
        AddressResponse response = modelMapper.map(address, AddressResponse.class);
        response.setUserId(address.getUser().getId());
        return response;
    }
}