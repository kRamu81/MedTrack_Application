package com.medtrack.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.auth.dto.*;
import com.medtrack.auth.model.User;
import com.medtrack.auth.model.AccountStatus;
import com.medtrack.auth.repository.UserRepository;
import com.medtrack.auth.repository.PasswordResetTokenRepository;
import com.medtrack.auth.service.KafkaEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.cloud.discovery.enabled=false"
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

    @MockBean
    private KafkaEventPublisher kafkaEventPublisher;

    @BeforeEach
    void cleanDatabase() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void testFullAuthFlow() throws Exception {
        // 1. Register a user
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Integration Test User")
                .username("integtest")
                .email("integtest@medtrack.com")
                .password("Password123")
                .role("HOSPITAL")
                .build();

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String regResponseContent = regResult.getResponse().getContentAsString();
        assertNotNull(regResponseContent);
        assertTrue(regResponseContent.contains("token"));

        Optional<User> userOpt = userRepository.findByEmail("integtest@medtrack.com");
        assertTrue(userOpt.isPresent());
        User user = userOpt.get();
        assertEquals("integtest", user.getUsername());
        assertEquals("HOSPITAL", user.getRole());
        assertTrue(passwordEncoder.matches("Password123", user.getPassword()));

        // Verify Kafka event was published on registration
        verify(kafkaEventPublisher, times(1)).publishUserRegistered(any());

        // 2. Login successfully
        LoginRequest loginRequest = new LoginRequest("integtest@medtrack.com", "Password123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String loginResponseContent = loginResult.getResponse().getContentAsString();
        assertNotNull(loginResponseContent);
        assertTrue(loginResponseContent.contains("token"));
        assertTrue(loginResponseContent.contains("refreshToken"));

        // Verify Kafka event was published on login
        verify(kafkaEventPublisher, times(1)).publishUserLogin(any());
    }

    @Test
    void testForgotPasswordAndVerifyOtpAndResetPasswordFlow() throws Exception {
        // Register user first
        User user = User.builder()
                .name("OTP User")
                .username("otpuser")
                .email("otpuser@medtrack.com")
                .password(passwordEncoder.encode("OldPassword123"))
                .role("HOSPITAL")
                .accountStatus(AccountStatus.ACTIVE)
                .build();
        userRepository.save(user);

        // 1. Request OTP (Forgot Password)
        ForgotPasswordRequest forgotPasswordRequest = new ForgotPasswordRequest("otpuser@medtrack.com");
        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotPasswordRequest)))
                .andExpect(status().isOk());

        // Retrieve the OTP from database
        var tokens = passwordResetTokenRepository.findAll();
        assertFalse(tokens.isEmpty());
        String otp = tokens.get(0).getOtp();
        assertNotNull(otp);

        // 2. Verify OTP
        VerifyOtpRequest verifyRequest = new VerifyOtpRequest("otpuser@medtrack.com", otp);
        mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(verifyRequest)))
                .andExpect(status().isOk());

        // 3. Reset Password
        ResetPasswordRequest resetRequest = new ResetPasswordRequest("otpuser@medtrack.com", otp, "NewPassword123");
        mockMvc.perform(post("/api/auth/reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(resetRequest)))
                .andExpect(status().isOk());

        // Verify login works with new password
        LoginRequest loginRequest = new LoginRequest("otpuser@medtrack.com", "NewPassword123");
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }
}
