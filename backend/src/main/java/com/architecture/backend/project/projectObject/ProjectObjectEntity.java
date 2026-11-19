package com.architecture.backend.project.projectObject;

import java.time.LocalDateTime;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "project_objects",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_project_objects_project_object",
        columnNames = { "project_id", "object_id" }
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectObjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "project_id", nullable = false)
    private Integer projectId;

    @Column(name = "object_id", nullable = false)
    private Integer objectId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "object_data", columnDefinition = "json", nullable = false)
    private Map<String, Object> objectData;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ProjectObjectEntity(
        Integer projectId,
        Integer objectId,
        Map<String, Object> objectData,
        LocalDateTime updatedAt
    ) {
        this.projectId = projectId;
        this.objectId = objectId;
        this.objectData = objectData;
        this.updatedAt = updatedAt;
    }

    public void update(Map<String, Object> objectData, LocalDateTime updatedAt) {
        this.objectData = objectData;
        this.updatedAt = updatedAt;
    }
}