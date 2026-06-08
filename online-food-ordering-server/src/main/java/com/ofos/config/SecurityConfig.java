package com.ofos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ofos.service.impl.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable()) 
            .authorizeHttpRequests(auth -> auth
                // Browser preflight requests do not carry JWT tokens, so security must allow them before CORS responds.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // âœ… PUBLIC Swagger URLs
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/swagger-resources/**",
                    "/webjars/**",
                    "/api-docs/**"
                ).permitAll()
                
                // âœ… PUBLIC Auth endpoints
                .requestMatchers("/auth/**").permitAll()
                // EventSource cannot attach Authorization headers; the stream endpoint validates its JWT query token itself.
                .requestMatchers(HttpMethod.GET, "/notifications/stream").permitAll()
                
                // âœ… PUBLIC Restaurant endpoints (GET requests only)
                .requestMatchers(HttpMethod.GET, "/restaurants/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/restaurants").permitAll()
                .requestMatchers("/restaurants/top-rated").permitAll()
                .requestMatchers("/restaurants/search").permitAll()
                .requestMatchers("/restaurants/filter").permitAll()
                .requestMatchers("/restaurants/{id}/stats").permitAll()
                .requestMatchers("/restaurants/{id}").permitAll()

                // Public category reads are used by customer menu filters and owner menu forms.
                .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()

                // Public review reads are shown on restaurant detail and full review pages.
                .requestMatchers(HttpMethod.GET, "/reviews/restaurant/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/reviews/delivery-partner/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/reviews/{reviewId}").permitAll()
                .requestMatchers(HttpMethod.GET, "/reviews/{reviewId}/replies").permitAll()
                
               // âœ… PUBLIC Menu endpoints (GET requests only)
                .requestMatchers("/menu/**").permitAll()
                .requestMatchers("/cart").permitAll()
                .requestMatchers(HttpMethod.GET, "/menu/restaurants/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/cart/*").permitAll()
                
                // âŒ All other endpoints need authentication
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
