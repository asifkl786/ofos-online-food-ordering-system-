package com.ofos.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.ofos.entity.Order;
import com.ofos.entity.OrderItem;
import com.ofos.exception.ResourceNotFoundException;
import com.ofos.repository.OrderRepository;
import com.ofos.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final OrderRepository orderRepository;

    @Value("${platform.commission.rate:0.10}")
    private BigDecimal platformCommissionRate;

    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd MMM yyyy");

    @Override
    public byte[] generateOrderInvoicePdf(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        return writePdf(document -> {
            addTitle(document, "Restaurant Invoice", "INV-" + safe(order.getOrderNumber()));
            addOrderParties(document, order);
            addOrderItems(document, order);
            addOrderSummary(document, order);
            addFooter(document, "This is a computer-generated invoice for restaurant-owner accounting.");
        });
    }

    @Override
    public byte[] generateRevenueInvoicePdf(String period) {
        DateRange range = resolveDateRange(period);
        return generateRevenueInvoicePdf(range);
    }

    @Override
    public byte[] generateRevenueInvoicePdf(LocalDate startDate, LocalDate endDate) {
        DateRange range = resolveCustomDateRange(startDate, endDate);
        return generateRevenueInvoicePdf(range);
    }

    private byte[] generateRevenueInvoicePdf(DateRange range) {
        List<Order> orders = orderRepository.findDeliveredOrdersBetween(range.start(), range.end());

        BigDecimal revenue = orders.stream().map(order -> value(order.getTotalAmount())).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal commission = orders.stream().map(this::resolvePlatformCommission).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal payout = orders.stream().map(this::resolveRestaurantPayout).reduce(BigDecimal.ZERO, BigDecimal::add);

        return writePdf(document -> {
            addTitle(document, "Admin Revenue Invoice", range.label());
            addParagraph(document, "Period: " + DATE.format(range.start().toLocalDate()) + " to " + DATE.format(range.end().toLocalDate()));
            addParagraph(document, "Generated for Online Food Ordering System platform revenue tracking.");

            PdfPTable summary = table(4);
            addHeader(summary, "Delivered Orders", "Delivered Revenue", "Platform Commission", "Restaurant Payout");
            addRow(summary, String.valueOf(orders.size()), money(revenue), money(commission), money(payout));
            document.add(summary);
            spacer(document);

            PdfPTable detail = table(5);
            addHeader(detail, "Order", "Restaurant", "Date", "Revenue", "Commission");
            for (Order order : orders) {
                addRow(detail,
                        safe(order.getOrderNumber()),
                        order.getRestaurant() != null ? safe(order.getRestaurant().getName()) : "Restaurant",
                        order.getCreatedAt() != null ? DATE.format(order.getCreatedAt().toLocalDate()) : "-",
                        money(order.getTotalAmount()),
                        money(resolvePlatformCommission(order)));
            }
            document.add(detail);
            addFooter(document, "Use this report for platform revenue reconciliation.");
        });
    }

    private void addOrderParties(Document document, Order order) throws Exception {
        PdfPTable parties = table(2);
        parties.addCell(infoCell("Restaurant",
                (order.getRestaurant() != null ? safe(order.getRestaurant().getName()) : "Restaurant") + "\n"
                        + (order.getRestaurant() != null ? safe(order.getRestaurant().getContactPhone()) : "N/A") + "\n"
                        + "GST: " + (order.getRestaurant() != null ? safe(order.getRestaurant().getGstNumber()) : "N/A") + "\n"
                        + "FSSAI: " + (order.getRestaurant() != null ? safe(order.getRestaurant().getFssaiLicenseNumber()) : "N/A")));
        parties.addCell(infoCell("Customer",
                (order.getUser() != null ? safe(order.getUser().getFirstName()) + " " + safe(order.getUser().getLastName()) : "Customer") + "\n"
                        + (order.getUser() != null ? safe(order.getUser().getEmail()) : "N/A") + "\n"
                        + (order.getDeliveryAddress() != null ? safe(order.getDeliveryAddress().getStreetAddress()) + ", " + safe(order.getDeliveryAddress().getCity()) : "Address not available")));
        document.add(parties);
        spacer(document);

        PdfPTable meta = table(4);
        addHeader(meta, "Order", "Date", "Payment", "Status");
        addRow(meta,
                safe(order.getOrderNumber()),
                order.getCreatedAt() != null ? DATE_TIME.format(order.getCreatedAt()) : "-",
                order.getPaymentMethod() != null ? order.getPaymentMethod().toString() : "N/A",
                order.getStatus() != null ? order.getStatus().toString() : "N/A");
        document.add(meta);
        spacer(document);
    }

    private void addOrderItems(Document document, Order order) throws Exception {
        PdfPTable items = table(4);
        addHeader(items, "Item", "Qty", "Unit Price", "Amount");
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                addRow(items,
                        safe(item.getItemName()),
                        String.valueOf(item.getQuantity()),
                        money(item.getUnitPrice()),
                        money(item.getSubtotal()));
            }
        }
        document.add(items);
        spacer(document);
    }

    private void addOrderSummary(Document document, Order order) throws Exception {
        PdfPTable summary = table(2);
        addRow(summary, "Subtotal", money(order.getSubtotal()));
        addRow(summary, "Tax", money(order.getTax()));
        addRow(summary, "Delivery Fee", money(order.getDeliveryFee()));
        addRow(summary, "Discount", "-" + money(order.getDiscount()));
        addRow(summary, "Customer Paid", money(order.getTotalAmount()));
        addRow(summary, "Platform Commission", money(resolvePlatformCommission(order)));
        addRow(summary, "Restaurant Payout", money(resolveRestaurantPayout(order)));
        document.add(summary);
    }

    private byte[] writePdf(PdfWriterCallback callback) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 28, 28, 24, 24);
            PdfWriter.getInstance(document, output);
            document.open();
            callback.write(document);
            document.close();
            return output.toByteArray();
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate invoice PDF", ex);
        }
    }

    private void addTitle(Document document, String title, String subtitle) throws Exception {
        Paragraph heading = new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(15, 23, 42)));
        heading.setAlignment(Element.ALIGN_CENTER);
        document.add(heading);
        Paragraph sub = new Paragraph(subtitle, FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(71, 85, 105)));
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingAfter(12);
        document.add(sub);
    }

    private void addParagraph(Document document, String text) throws Exception {
        Paragraph paragraph = new Paragraph(text, bodyFont());
        paragraph.setSpacingAfter(8);
        document.add(paragraph);
    }

    private void addFooter(Document document, String text) throws Exception {
        spacer(document);
        Paragraph footer = new Paragraph(text, FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(100, 116, 139)));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private PdfPTable table(int columns) {
        PdfPTable table = new PdfPTable(columns);
        table.setWidthPercentage(100);
        table.setSpacingBefore(4);
        return table;
    }

    private void addHeader(PdfPTable table, String... headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, headerFont()));
            cell.setBackgroundColor(new Color(241, 245, 249));
            cell.setPadding(6);
            cell.setBorderColor(new Color(226, 232, 240));
            table.addCell(cell);
        }
    }

    private void addRow(PdfPTable table, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, bodyFont()));
            cell.setPadding(6);
            cell.setBorderColor(new Color(226, 232, 240));
            table.addCell(cell);
        }
    }

    private PdfPCell infoCell(String title, String body) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.addElement(new Phrase(title + "\n", headerFont()));
        cell.addElement(new Phrase(body, bodyFont()));
        return cell;
    }

    private Font headerFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(30, 41, 59));
    }

    private Font bodyFont() {
        return FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(15, 23, 42));
    }

    private void spacer(Document document) throws Exception {
        Paragraph spacer = new Paragraph(" ");
        spacer.setSpacingAfter(4);
        document.add(spacer);
    }

    private DateRange resolveDateRange(String period) {
        LocalDate today = LocalDate.now();
        String normalized = period == null ? "DAILY" : period.trim().toUpperCase();
        LocalDate start;
        LocalDate end;

        switch (normalized) {
            case "WEEKLY" -> {
                start = today.minusDays(6);
                end = today;
            }
            case "MONTHLY" -> {
                start = today.withDayOfMonth(1);
                end = today;
            }
            case "QUARTERLY" -> {
                int currentQuarterStartMonth = ((today.getMonthValue() - 1) / 3) * 3 + 1;
                start = LocalDate.of(today.getYear(), currentQuarterStartMonth, 1);
                end = today;
            }
            case "YEARLY" -> {
                start = today.with(TemporalAdjusters.firstDayOfYear());
                end = today;
            }
            default -> {
                start = today;
                end = today;
                normalized = "DAILY";
            }
        }

        return new DateRange(start.atStartOfDay(), end.atTime(LocalTime.MAX), normalized);
    }

    private DateRange resolveCustomDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        String label = DATE.format(startDate) + " to " + DATE.format(endDate);
        return new DateRange(startDate.atStartOfDay(), endDate.atTime(LocalTime.MAX), label);
    }

    private BigDecimal resolvePlatformCommission(Order order) {
        if (order.getPlatformCommission() != null) return order.getPlatformCommission();
        BigDecimal base = value(order.getSubtotal()).subtract(value(order.getDiscount())).max(BigDecimal.ZERO);
        return base.multiply(platformCommissionRate).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveRestaurantPayout(Order order) {
        if (order.getRestaurantPayout() != null) return order.getRestaurantPayout();
        return value(order.getTotalAmount()).subtract(resolvePlatformCommission(order)).max(BigDecimal.ZERO);
    }

    private BigDecimal value(BigDecimal amount) {
        return amount != null ? amount : BigDecimal.ZERO;
    }

    private String money(BigDecimal amount) {
        return "Rs. " + value(amount).setScale(2, RoundingMode.HALF_UP);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }

    private record DateRange(LocalDateTime start, LocalDateTime end, String label) {}

    @FunctionalInterface
    private interface PdfWriterCallback {
        void write(Document document) throws Exception;
    }
}
