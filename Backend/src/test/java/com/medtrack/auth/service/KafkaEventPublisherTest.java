package com.medtrack.auth.service;

import com.medtrack.auth.event.UserLoginEvent;
import com.medtrack.auth.event.UserRegisteredEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class KafkaEventPublisherTest {

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private KafkaEventPublisher kafkaEventPublisher;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(kafkaEventPublisher, "userEventsTopic", "user-events");
    }

    @Test
    void publishUserRegistered_Success() {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .role("HOSPITAL")
                .timestamp("2026-07-10T06:56:56Z")
                .build();

        when(kafkaTemplate.send(eq("user-events"), eq("1"), eq(event)))
                .thenReturn(mock(CompletableFuture.class));

        assertDoesNotThrow(() -> kafkaEventPublisher.publishUserRegistered(event));

        verify(kafkaTemplate, times(1)).send("user-events", "1", event);
    }

    @Test
    void publishUserRegistered_Failure_SwallowsException() {
        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .role("HOSPITAL")
                .timestamp("2026-07-10T06:56:56Z")
                .build();

        when(kafkaTemplate.send(any(), any(), any())).thenThrow(new RuntimeException("Kafka is down"));

        assertDoesNotThrow(() -> kafkaEventPublisher.publishUserRegistered(event));

        verify(kafkaTemplate, times(1)).send("user-events", "1", event);
    }

    @Test
    void publishUserLogin_Success() {
        UserLoginEvent event = UserLoginEvent.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .role("HOSPITAL")
                .loginTime("2026-07-10T06:56:56Z")
                .build();

        when(kafkaTemplate.send(eq("user-events"), eq("1"), eq(event)))
                .thenReturn(mock(CompletableFuture.class));

        assertDoesNotThrow(() -> kafkaEventPublisher.publishUserLogin(event));

        verify(kafkaTemplate, times(1)).send("user-events", "1", event);
    }

    @Test
    void publishUserLogin_Failure_SwallowsException() {
        UserLoginEvent event = UserLoginEvent.builder()
                .userId(1L)
                .username("testuser")
                .email("test@example.com")
                .role("HOSPITAL")
                .loginTime("2026-07-10T06:56:56Z")
                .build();

        when(kafkaTemplate.send(any(), any(), any())).thenThrow(new RuntimeException("Kafka is down"));

        assertDoesNotThrow(() -> kafkaEventPublisher.publishUserLogin(event));

        verify(kafkaTemplate, times(1)).send("user-events", "1", event);
    }
}
