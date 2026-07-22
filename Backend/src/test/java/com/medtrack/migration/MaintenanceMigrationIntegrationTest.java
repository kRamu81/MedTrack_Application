package com.medtrack.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MaintenanceMigrationIntegrationTest {

    @Test
    void migrationBackfillsStatusEquipmentAndHospitalOwnership() throws Exception {
        String url = createLegacyDatabase(true);

        migrate(url);

        try (Connection connection = DriverManager.getConnection(url, "sa", "");
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("""
                     SELECT status, equipment_record_id, hospital_id, completed_at
                     FROM maintenance_tasks
                     WHERE id = 100
                     """)) {
            result.next();
            assertEquals("IN_PROGRESS", result.getString("status"));
            assertEquals(10L, result.getLong("equipment_record_id"));
            assertEquals(7L, result.getLong("hospital_id"));
            assertNull(result.getTimestamp("completed_at"));
        }
    }

    @Test
    void migrationFailsWhenLegacyTaskCannotBeMatchedToEquipment() throws Exception {
        String url = createLegacyDatabase(false);

        assertThrows(Exception.class, () -> migrate(url));
    }

    @Test
    void migrationPreventsDeletingEquipmentReferencedByMaintenanceHistory() throws Exception {
        String url = createLegacyDatabase(true);
        migrate(url);

        try (Connection connection = DriverManager.getConnection(url, "sa", "");
             Statement statement = connection.createStatement()) {
            assertThrows(SQLException.class,
                    () -> statement.executeUpdate("DELETE FROM equipment WHERE id = 10"));
        }
    }

    @Test
    void migrationFailsWhenMaintenanceOwnershipCannotBeRestored() throws Exception {
        String url = createLegacyDatabase(true);
        try (Connection connection = DriverManager.getConnection(url, "sa", "");
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("UPDATE equipment SET hospital_id = NULL WHERE id = 10");
        }

        assertThrows(Exception.class, () -> migrate(url));
    }

    private String createLegacyDatabase(boolean matchingEquipment) throws Exception {
        String url = "jdbc:h2:mem:maintenance-migration-" + UUID.randomUUID()
                + ";MODE=MySQL;DB_CLOSE_DELAY=-1";
        try (Connection connection = DriverManager.getConnection(url, "sa", "");
             Statement statement = connection.createStatement()) {
            statement.execute("""
                    CREATE TABLE equipment (
                        id BIGINT PRIMARY KEY,
                        equipment_code VARCHAR(255) UNIQUE,
                        hospital_id BIGINT
                    )
                    """);
            statement.execute("""
                    CREATE TABLE maintenance_tasks (
                        id BIGINT PRIMARY KEY,
                        equipment_id VARCHAR(255),
                        hospital_id BIGINT,
                        status VARCHAR(255)
                    )
                    """);
            statement.execute("""
                    INSERT INTO equipment (id, equipment_code, hospital_id)
                    VALUES (10, 'EQ-1001', 7)
                    """);
            statement.execute("""
                    INSERT INTO maintenance_tasks (id, equipment_id, hospital_id, status)
                    VALUES (100, '%s', NULL, 'In Progress')
                    """.formatted(matchingEquipment ? "EQ-1001" : "EQ-MISSING"));
        }
        return url;
    }

    private void migrate(String url) {
        Flyway.configure()
                .dataSource(url, "sa", "")
                .locations("classpath:db/migration/h2")
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load()
                .migrate();
    }
}
