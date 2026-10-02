package com.architecture.backend.project;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_objects")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectObjectEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "project_id", nullable = false, unique = true)
    private Integer projectId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<Map<String, Object>> objects;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ProjectObjectEntity(Integer projectId, List<Map<String, Object>> objects, LocalDateTime updatedAt) {
        this.projectId = projectId;
        this.objects = objects;
        this.updatedAt = updatedAt;
    }

    public void update(List<Map<String, Object>> objects, LocalDateTime updatedAt) {
        this.objects = objects;
        this.updatedAt = updatedAt;
    }
}
