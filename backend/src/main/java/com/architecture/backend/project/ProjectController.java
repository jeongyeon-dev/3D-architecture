package com.architecture.backend.project;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.architecture.backend.auth.UserDtos.UserInviteRequest;
import com.architecture.backend.auth.UserDtos.UserResponse;
import com.architecture.backend.project.ProjectDtos.ProjectCreateRequest;
import com.architecture.backend.project.ProjectDtos.ProjectDetailResponse;
import com.architecture.backend.project.ProjectDtos.ProjectMemberResponse;
import com.architecture.backend.project.ProjectDtos.ProjectSaveRequest;
import com.architecture.backend.project.projectObject.ProjectObjectEntity;
import com.architecture.backend.project.project.ProjectEntity;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    List<ProjectEntity> getProjects(@AuthenticationPrincipal Jwt jwt) {
        return projectService.getProjects(userId(jwt));
    }

    @PostMapping("/create")
    ProjectEntity createProject(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody ProjectCreateRequest request
    ) {
        return projectService.createProject(userId(jwt), request.title());
    }

    /* id 기반 프로젝트 불러오기: JSON 데이터, 접속자 닉네임, 프로젝트 명 */
    @GetMapping("/{id}")
    ProjectDetailResponse getProject(
        @AuthenticationPrincipal Jwt jwt, 
        @PathVariable Integer id
    ) {
        return projectService.getProject(userId(jwt), id);
    }

    /* 프로젝트 저장 로직 */
    @PutMapping("/save/{id}")
    ProjectObjectEntity saveProject(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Integer id,
        @Valid @RequestBody ProjectSaveRequest request
    ) {
        return projectService.saveProject(userId(jwt), id, request.objects());
    }

    /* 해당 프로젝트 휴지통에 이동 */
    @PutMapping("/delete/{id}")
    Boolean deleteProject(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Integer id
    ){
        return projectService.deleteProject(userId(jwt), id);
    }

    /* 해당 프로젝트 회원 불러오기 */
    @GetMapping("/members/{id}")
    List<ProjectMemberResponse> getMembers(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Integer id
    ){
        return projectService.getProjectMembers(userId(jwt), id);
    } 

    @GetMapping("/members/search/{projectId}-{keyword}")
    List<UserResponse> searchMembers(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable String keyword,
        @PathVariable Integer projectId
    ){
        return projectService.searchMembers(userId(jwt), keyword, projectId);
    }

    /* 해당 유저 프로젝트에 초대하기: 권한 설정 포함 */
    @PostMapping("/members/invite")
    Boolean inviteUser(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody UserInviteRequest dto
    ){
        return projectService.inviteUser(userId(jwt), dto.userId(), dto.projectId(), dto.role());
    }

    private Integer userId(Jwt jwt) {
        return Integer.parseInt(jwt.getSubject());
    }
}




