package com.architecture.backend.project;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Integer> {

    List<Project> findAllByUserIdOrderByUpdatedAtDesc(Integer userId);

    Optional<Project> findByIdAndUserId(Integer id, Integer userId);
}
