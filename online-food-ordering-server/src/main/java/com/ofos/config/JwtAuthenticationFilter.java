package com.ofos.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ofos.service.TokenBlacklistService;
import com.ofos.utils.JwtUtil;

import io.jsonwebtoken.JwtException;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    private static final String[] PUBLIC_AUTH_PATHS = {
            "/auth/register",
            "/auth/admin/register",
            "/auth/login",
            "/auth/refresh",
            "/auth/logout",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/validate"
    };

    private static final String[] PUBLIC_GET_PREFIXES = {
            "/restaurants",
            "/categories",
            "/menu",
            "/reviews/restaurant",
            "/reviews/delivery-partner"
    };
    
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // ✅ STEP 4 FIX: OPTIONS request ko bypass karo (CORS preflight ke liye)
        // Browser pehle OPTIONS request bhejta hai, agar yaha block hua to CORS error aayega
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response); // request ko aage pass kar do
            return; // yahi pe stop
        }

        if (isPublicRequest(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        // Agar Authorization header nahi hai → skip karo
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        if (tokenBlacklistService.isInvalidated(jwt)) {
            // Enforce logout globally: a blacklisted token must not authenticate any protected request.
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        try {
            userEmail = jwtUtil.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("Ignoring invalid JWT for {} {}", request.getMethod(), request.getRequestURI());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    private boolean isPublicRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isBlank() && path.startsWith(contextPath)) {
            path = path.substring(contextPath.length());
        }

        for (String publicPath : PUBLIC_AUTH_PATHS) {
            if (path.equals(publicPath)) {
                return true;
            }
        }

        if ("GET".equalsIgnoreCase(request.getMethod())) {
            for (String publicPrefix : PUBLIC_GET_PREFIXES) {
                if (path.equals(publicPrefix) || path.startsWith(publicPrefix + "/")) {
                    return true;
                }
            }
        }
        return false;
    }
}
