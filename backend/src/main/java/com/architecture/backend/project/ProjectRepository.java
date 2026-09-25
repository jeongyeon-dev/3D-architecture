package com.architecture.backend.project;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Integer> {

    List<ProjectEntity> findAllByUserIdOrderByUpdatedAtDesc(Integer userId);

    Optional<ProjectEntity> findByIdAndUserId(Integer id, Integer userId);
}
