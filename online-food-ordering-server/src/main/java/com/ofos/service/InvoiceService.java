package com.ofos.service;

import java.time.LocalDate;

public interface InvoiceService {

    byte[] generateOrderInvoicePdf(Long orderId);

    byte[] generateRevenueInvoicePdf(String period);

    byte[] generateRevenueInvoicePdf(LocalDate startDate, LocalDate endDate);
}
