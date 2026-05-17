package com.ofos.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;


/**
 * OpenAPI configuration for Document Management System
 * Swagger UI will be available at: http://localhost:8080/api/v1/swagger-ui.html
 */

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Online Food Ordering System API")
                        .version("1.0.0")
                        .description("Complete API documentation for Online Food Ordering System")
                        .contact(new Contact()
                                .name("Development Team")
                                .email("support@ofos.com")
                                .url("https://www.ofos.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("http://springdoc.org")))
                        .servers(List.of(
                        new Server()
                                .url("http://localhost:8080/api/v1")
                                .description("Local Development Server"),
                        new Server()
                                .url("https://api.ofos.com/api/v1")
                                .description("Production Server")))
                        
                        // ✅ ADD THIS FOR AUTHORIZE BUTTON
                        .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                        .schemaRequirement("Bearer Authentication", new SecurityScheme()
                                .name("Bearer Authentication")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token. Example: Bearer eyJhbGciOiJIUzI1NiJ9..."));
                        
                        
    }
}
