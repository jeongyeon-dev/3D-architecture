package com.architecture.backend.project.projectObject;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectObjectRepository extends JpaRepository<ProjectObjectEntity, Integer> {

    Optional<ProjectObjectEntity> findByProjectId(Integer projectId);
}


