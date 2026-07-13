package com.cleanreport.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cleanReportOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CleanReport API")
                        .version("1.0.0")
                        .description("Community Waste & Sanitation Issue Reporting Platform API. " +
                                "Report sanitation issues with photo + GPS, track resolution status, earn credits.")
                        .contact(new Contact()
                                .name("Axion Circle")
                                .url("https://github.com/circorangeintern/axion-circle")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Auth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your JWT access token (from /auth/login or /auth/register)")));
    }
}
