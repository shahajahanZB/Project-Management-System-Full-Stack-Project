package com.example.proman.config;

import com.example.proman.iam.domain.service.MyUserDetailsService;
import com.example.proman.iam.domain.service.JWTService;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableMethodSecurity(prePostEnabled = true)
@Configuration
public class SecurityConfig {

    private final MyUserDetailsService userDetailsService;
    private final AuthEntryPointJwt authEntryPointJwt;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    public SecurityConfig(MyUserDetailsService userDetailsService,
                          AuthEntryPointJwt authEntryPointJwt,
                          CustomAccessDeniedHandler customAccessDeniedHandler) {
        this.userDetailsService = userDetailsService;
        this.authEntryPointJwt = authEntryPointJwt;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JWTService jwtService,
                                                   MyUserDetailsService userDetailsService) throws Exception {
        JwtFilter jwtFilter = new JwtFilter(jwtService, userDetailsService);

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())

            // Stateless session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authEntryPointJwt)
                .accessDeniedHandler(customAccessDeniedHandler)
            )

            // Public endpoints
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/iam/register",
                    "/api/v1/iam/login",
                    "/api/v1/iam/forgot-password/request-otp",
                    "/api/v1/iam/forgot-password/reset",
                    "/actuator/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )

            .authenticationProvider(authenticationProvider())

            // Basic auth (optional)
            .httpBasic(Customizer.withDefaults())

            // JWT filter
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {

        // Spring Security 6 constructor
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of(
                "https://alas.exploremira.com",
                "https://aladev.exploremira.com",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "https://aviators-dev-1095282091.ap-south-1.elb.amazonaws.com",
                "https://aviators-staging-2087006782.ap-south-1.elb.amazonaws.com",
                "https://alast.exploremira.com",
                "https://p3bww3t3-5174.inc1.devtunnels.ms/"
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
