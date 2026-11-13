package com.architecture.backend.project.projectMember;

import com.architecture.backend.auth.UserEntity;
import com.architecture.backend.project.project.ProjectEntity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity 
@Table (name = "project_members")
@Getter 
@NoArgsConstructor (access = AccessLevel.PROTECTED)
public class ProjectMemberEntity {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 요 둘은 외래키
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private ProjectEntity project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;

    // 해당 맴버의 역할
    private String role;

    // 생성자
    public ProjectMemberEntity(
        ProjectEntity project,
        UserEntity user,
        String role
    ) {
        this.project = project;
        this.user = user;
        this.role = role;
    }

    // 역할 변경
    public void changeRole(String role){
        this.role = role;
    }
}
