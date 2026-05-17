package com.ofos.controller;

import com.ofos.dto.response.ApiResponse;
import com.ofos.entity.OrderStatus;
import com.ofos.entity.PaymentStatus;
import com.ofos.entity.UserRole;
import com.ofos.repository.OrderRepository;
import com.ofos.repository.RestaurantRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.AuditLogService;
import com.ofos.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Dashboard", description = "APIs for admin overview and controls")
public class AdminController {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;
    private final AuditLogService auditLogService;
    private final InvoiceService invoiceService;

    @Value("${platform.commission.rate:0.10}")
    private BigDecimal platformCommissionRate;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard summary")
    public ResponseEntity<ApiResponse> getDashboardSummary() {
        log.info("REST request to get admin dashboard summary");

        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY_FOR_PICKUP,
                OrderStatus.OUT_FOR_DELIVERY
        );

        Map<String, Object> summary = Map.ofEntries(
                Map.entry("totalUsers", userRepository.count()),
                Map.entry("customers", userRepository.findByRole(UserRole.CUSTOMER, org.springframework.data.domain.Pageable.unpaged()).getTotalElements()),
                Map.entry("restaurantOwners", userRepository.findByRole(UserRole.RESTAURANT_OWNER, org.springframework.data.domain.Pageable.unpaged()).getTotalElements()),
                Map.entry("deliveryPartners", userRepository.findByRole(UserRole.DELIVERY_PARTNER, org.springframework.data.domain.Pageable.unpaged()).getTotalElements()),
                Map.entry("admins", userRepository.findByRole(UserRole.ADMIN, org.springframework.data.domain.Pageable.unpaged()).getTotalElements()),
                Map.entry("totalRestaurants", restaurantRepository.count()),
                Map.entry("openRestaurants", restaurantRepository.findByIsOpenTrue(org.springframework.data.domain.Pageable.unpaged()).getTotalElements()),
                Map.entry("totalOrders", orderRepository.count()),
                Map.entry("activeOrders", orderRepository.countByStatusIn(activeStatuses)),
                Map.entry("paidOrders", orderRepository.countByPaymentStatus(PaymentStatus.SUCCESS)),
                Map.entry("deliveredRevenue", orderRepository.calculateDeliveredRevenue()),
                // Platform earnings are the commission retained from delivered restaurant orders.
                Map.entry("platformCommission", orderRepository.calculateDeliveredPlatformCommission(platformCommissionRate)),
                Map.entry("restaurantPayout", orderRepository.calculateDeliveredRestaurantPayout(platformCommissionRate))
        );

        return ResponseEntity.ok(ApiResponse.success("Admin dashboard summary found", summary));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin audit logs")
    public ResponseEntity<ApiResponse> getAuditLogs(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "ALL") String method,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("REST request to get admin audit logs");
        Page<com.ofos.dto.response.AuditLogResponse> auditLogs = auditLogService.getAuditLogs(search, status, method, pageable);
        return ResponseEntity.ok(ApiResponse.success("Audit logs found", auditLogs));
    }

    @GetMapping(value = "/revenue-invoice", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download admin revenue invoice PDF")
    public ResponseEntity<byte[]> downloadRevenueInvoice(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "DAILY") String period) {
        log.info("REST request to download admin revenue invoice for range: {} to {}, period: {}", startDate, endDate, period);
        boolean customRange = startDate != null || endDate != null;
        if (customRange && (startDate == null || endDate == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date and end date are required");
        }
        byte[] pdf = customRange
                ? invoiceService.generateRevenueInvoicePdf(startDate, endDate)
                : invoiceService.generateRevenueInvoicePdf(period);
        String fileSuffix = customRange
                ? startDate + "-to-" + endDate
                : (period == null ? "DAILY" : period.trim().toUpperCase());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ofos-revenue-" + fileSuffix + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
