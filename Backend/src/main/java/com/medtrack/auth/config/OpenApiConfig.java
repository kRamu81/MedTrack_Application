package com.medtrack.auth.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenApiConfig configures the Swagger/OpenAPI documentation for the Authentication Service.
 * It sets the meta-information (Title, Description, Version, Contact, License)
 * and defines the security requirements so that protected endpoints can be tested
 * directly from the Swagger UI using a JWT Bearer token.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Configures the Swagger OpenAPI metadata and registers the Bearer authentication scheme.
     *
     * @return the configured OpenAPI object
     */
    @Bean
    public OpenAPI customOpenApi() {
        final String securitySchemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token (excluding the 'Bearer ' prefix) to authorize requests.")
                        )
                )
                .info(new Info()
                        .title("MedTrack Authentication Service API")
                        .description("REST API documentation for the MedTrack Authentication Service, providing identity management, user registration, authentication, token rotation, and password reset functionalities.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("MedTrack Support Team")
                                .email("support@medtrack.com")
                                .url("https://medtrack.com")
                        )
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")
                        )
                );
    }
}
