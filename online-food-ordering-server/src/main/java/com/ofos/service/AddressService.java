package com.ofos.service;

import com.ofos.dto.request.AddressRequest;
import com.ofos.dto.request.AddressUpdateRequest;
import com.ofos.dto.response.AddressResponse;

import java.util.List;

public interface AddressService {
    
    AddressResponse addAddress(AddressRequest request, String userEmail);
    
    AddressResponse updateAddress(Long addressId, AddressUpdateRequest request, String userEmail);
    
    AddressResponse getAddressById(Long addressId, String userEmail);
    
    List<AddressResponse> getAllAddresses(String userEmail);
    
    List<AddressResponse> getActiveAddresses(String userEmail);
    
    List<AddressResponse> getAddressesByType(String addressType, String userEmail);
    
    AddressResponse getDefaultAddress(String userEmail);
    
    void setDefaultAddress(Long addressId, String userEmail);
    
    void deleteAddress(Long addressId, String userEmail);
    
    void softDeleteAddress(Long addressId, String userEmail);
}
