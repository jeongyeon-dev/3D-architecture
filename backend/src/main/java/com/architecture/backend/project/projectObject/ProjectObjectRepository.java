package com.architecture.backend.project.projectObject;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectObjectRepository extends JpaRepository<ProjectObjectEntity, Integer> {

    
    /* 해당 프로젝트 ID의 모든 json 오브젝트 데이터 불러오기 */
    @Query("""
        SELECT object
        FROM ProjectObjectEntity object
        WHERE object.projectId = :projectId
        ORDER BY object.objectId ASC
    """)
    List<ProjectObjectEntity> findAllObjectsInProject(@Param("projectId") Integer projectId);

    Optional<ProjectObjectEntity> findByProjectIdAndObjectId(Integer projectId, Integer objectId);

    void deleteByProjectId(Integer projectId);
}