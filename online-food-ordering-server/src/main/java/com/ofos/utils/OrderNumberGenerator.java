package com.ofos.utils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderNumberGenerator {
    
    private final JdbcTemplate jdbcTemplate;
    
    private static final String ORDER_NUMBER_PREFIX = "ORD";
    private static final String DATE_FORMAT = "yyyyMMdd";
    
    public String generateOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern(DATE_FORMAT));
        
        try {
            createSequenceTableIfNotExists();
            Long sequence = getNextSequenceValue();
            String orderNumber = ORDER_NUMBER_PREFIX + date + String.format("%06d", sequence);
            
            log.debug("Generated order number: {}", orderNumber);
            return orderNumber;
            
        } catch (Exception e) {
            log.error("Error generating order number: {}", e.getMessage());
            String timestamp = String.valueOf(System.currentTimeMillis()).substring(8);
            return ORDER_NUMBER_PREFIX + date + timestamp;
        }
    }
    
    private void createSequenceTableIfNotExists() {
        String createTableSQL = """
            CREATE TABLE IF NOT EXISTS order_sequence (
                id INT PRIMARY KEY DEFAULT 1,
                next_val BIGINT DEFAULT 1
            )
            """;
        try {
            jdbcTemplate.execute(createTableSQL);
        } catch (Exception e) {
            log.debug("Table already exists");
        }
    }
    
    private Long getNextSequenceValue() {
        String updateSQL = """
            UPDATE order_sequence 
            SET next_val = next_val + 1 
            WHERE id = 1
            """;
        
        String selectSQL = "SELECT next_val FROM order_sequence WHERE id = 1";
        
        String insertSQL = """
            INSERT INTO order_sequence (id, next_val) 
            SELECT 1, 1 
            WHERE NOT EXISTS (SELECT 1 FROM order_sequence WHERE id = 1)
            """;
        
        try {
            jdbcTemplate.execute(insertSQL);
            jdbcTemplate.update(updateSQL);
            return jdbcTemplate.queryForObject(selectSQL, Long.class);
        } catch (Exception e) {
            log.error("Error getting sequence value: {}", e.getMessage());
            return System.currentTimeMillis() % 1000000;
        }
    }
}