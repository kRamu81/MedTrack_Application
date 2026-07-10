package com.medtrack;

import com.medtrack.auth.service.KafkaEventPublisher;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest(properties = {
    "eureka.client.enabled=false",
    "spring.cloud.discovery.enabled=false",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
})
class MedTrackApplicationTests {

    @MockBean
    private KafkaEventPublisher kafkaEventPublisher;

    @Test
    void contextLoads() {
    }
}
