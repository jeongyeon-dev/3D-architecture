package com.architecture.backend.project;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectObjectRepository extends JpaRepository<ProjectObject, Integer> {

    Optional<ProjectObject> findByProjectId(Integer projectId);
}
