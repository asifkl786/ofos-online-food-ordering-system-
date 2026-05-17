package com.ofos.config;

import java.nio.file.Paths;
import java.time.Instant;
import java.time.format.DateTimeFormatter;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


// To serve files directly via URL (like localhost:8080/uploads/image.jpg), add:


@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + Paths.get("uploads").toAbsolutePath().toUri());
    }
    
    
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, Instant.class, source -> 
            Instant.from(DateTimeFormatter.ISO_INSTANT.parse(source))
        );
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173","http://localhost:5174")
            // PATCH is required for authenticated dashboard actions such as accepting restaurant orders.
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Content-Disposition") // for file download headers
            .allowCredentials(true);
    }
}

