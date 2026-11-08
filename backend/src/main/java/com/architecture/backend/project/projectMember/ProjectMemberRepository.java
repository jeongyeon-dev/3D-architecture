package com.architecture.backend.project.projectMember;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.architecture.backend.auth.UserEntity;
import com.architecture.backend.project.project.ProjectEntity;

public interface ProjectMemberRepository extends JpaRepository<ProjectMemberEntity, Integer>{


    /* 내림차순 가져오기 */
    @Query("""
        SELECT member
        FROM ProjectMemberEntity member
        JOIN FETCH member.project project
        WHERE member.user = :user
            AND project.deletedAt IS NULL
        ORDER BY project.updatedAt DESC
        """) 
    List<ProjectMemberEntity> findByUser(@Param("user") UserEntity user);
    
    
    List<ProjectMemberEntity> findByProject(ProjectEntity project);
}