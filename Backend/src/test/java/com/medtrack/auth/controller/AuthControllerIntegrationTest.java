package com.medtrack.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.dto.ForgotPasswordRequest;
import com.medtrack.auth.dto.LoginRequest;
import com.medtrack.auth.dto.RegisterRequest;
import com.medtrack.auth.dto.ResetPasswordRequest;
import com.medtrack.auth.dto.VerifyOtpRequest;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.model.User;
import com.medtrack.auth.repository.PasswordResetTokenRepository;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.service.KafkaEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
})
@AutoConfigureMockMvc
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private KafkaEventPublisher kafkaEventPublisher;

    @BeforeEach
    void cleanDatabase() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testFullAuthFlow() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Integration Test User")
                .organization("Integration Test Hospital")
                .email("integtest@medtrack.com")
                .phone("9876543210")
                .password("Password123")
                .confirmPassword("Password123")
                .role("HOSPITAL")
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String regResponseContent = regResult.getResponse().getContentAsString();
        assertNotNull(regResponseContent);
        assertTrue(regResponseContent.contains("token"));

        Optional<User> userOpt =
                userRepository.findByEmail("integtest@medtrack.com");

        assertTrue(userOpt.isPresent());

        User user = userOpt.get();

        assertEquals("integtest", user.getUsername());
        assertEquals("Integration Test User", user.getName());
        assertEquals("Integration Test Hospital", user.getOrganization());
        assertEquals("9876543210", user.getPhone());
        assertEquals("HOSPITAL", user.getRole());
        assertTrue(passwordEncoder.matches("Password123", user.getPassword()));

        verify(kafkaEventPublisher, times(1))
                .publishUserRegistered(any());

        LoginRequest loginRequest = new LoginRequest(
                "integtest@medtrack.com",
                "Password123",
                "HOSPITAL"
        );

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponseContent =
                loginResult.getResponse().getContentAsString();

        assertNotNull(loginResponseContent);
        assertTrue(loginResponseContent.contains("token"));
        assertTrue(loginResponseContent.contains("refreshToken"));

        verify(kafkaEventPublisher, times(1))
                .publishUserLogin(any());
    }

    @Test
    void testForgotPasswordAndVerifyOtpAndResetPasswordFlow()
            throws Exception {

        User user = User.builder()
                .name("OTP User")
                .username("otpuser")
                .email("otpuser@medtrack.com")
                .phone("9876543211")
                .organization("OTP Test Hospital")
                .password(passwordEncoder.encode("OldPassword123"))
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        userRepository.save(user);

        ForgotPasswordRequest forgotPasswordRequest =
                new ForgotPasswordRequest("otpuser@medtrack.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(forgotPasswordRequest)))
                .andExpect(status().isOk());

        var tokens = passwordResetTokenRepository.findAll();

        assertFalse(tokens.isEmpty());

        String otp = tokens.get(0).getOtp();

        assertNotNull(otp);

        VerifyOtpRequest verifyRequest =
                new VerifyOtpRequest("otpuser@medtrack.com", otp);

        mockMvc.perform(post("/api/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk());

        ResetPasswordRequest resetRequest =
                new ResetPasswordRequest(
                        "otpuser@medtrack.com",
                        otp,
                        "NewPassword123"
                );

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isOk());

        LoginRequest loginRequest = new LoginRequest(
                "otpuser@medtrack.com",
                "NewPassword123",
                "HOSPITAL"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testActuatorHealth_IsPublicAndReturnsUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void testActuatorInfo_IsPublicAndReturnsData() throws Exception {
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());
    }

    @Test
    void testActuatorEnv_IsProtectedAndReturnsUnauthorized()
            throws Exception {

        mockMvc.perform(get("/actuator/env"))
                .andExpect(status().isUnauthorized());
    }
}