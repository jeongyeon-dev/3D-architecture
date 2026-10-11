package com.architecture.backend.project;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Integer> {

    List<ProjectEntity> findAllByUserIdOrderByUpdatedAtDesc(Integer userId);

    Optional<ProjectEntity> findByIdAndUserId(Integer id, Integer userId);

    /* 해당 유저 id 기반 deletedAt 처리가 되지 않은 projects 수정 순으로 가져오기 */
    @Query("""
            SELECT p
            FROM ProjectEntity p
            WHERE p.userId = :userId
              AND p.deletedAt IS NULL
            ORDER BY p.updatedAt DESC
            """)
    List<ProjectEntity> findActiveProjects(@Param("userId") Integer userId);
}
