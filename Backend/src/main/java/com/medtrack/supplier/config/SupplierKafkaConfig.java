package com.medtrack.supplier.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class SupplierKafkaConfig {

    @Value("${app.kafka.topics.order-events:order-events}")
    private String orderEventsTopic;

    @Value("${app.kafka.topics.delay-events:delay-events}")
    private String delayEventsTopic;

    @Bean
    public NewTopic orderEventsTopic() {
        return TopicBuilder.name(orderEventsTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic delayEventsTopic() {
        return TopicBuilder.name(delayEventsTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
