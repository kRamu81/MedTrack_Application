package com.medtrack.supplier.consumer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
        "eureka.client.enabled=false",
        "spring.cloud.discovery.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
})
public class SupplierKafkaConfigurationTest {

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    private Environment environment;

    @Test
    void testKafkaConsumerConfigurationProperties() {
        assertEquals("supplier-order-sync", environment.getProperty("spring.kafka.consumer.group-id"));
        assertEquals("earliest", environment.getProperty("spring.kafka.consumer.auto-offset-reset"));
        assertEquals("org.apache.kafka.common.serialization.StringDeserializer",
                environment.getProperty("spring.kafka.consumer.key-deserializer"));
        assertEquals("org.springframework.kafka.support.serializer.JsonDeserializer",
                environment.getProperty("spring.kafka.consumer.value-deserializer"));
        assertEquals("com.medtrack.*",
                environment.getProperty("spring.kafka.consumer.properties.spring.json.trusted.packages"));
        assertEquals("order-events", environment.getProperty("app.kafka.topics.order-events"));
    }
}
