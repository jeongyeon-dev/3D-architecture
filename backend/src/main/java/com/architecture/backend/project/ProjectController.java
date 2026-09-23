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

import com.architecture.backend.project.ProjectDtos.ProjectCreateRequest;
import com.architecture.backend.project.ProjectDtos.ProjectSaveRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    List<Project> getProjects(@AuthenticationPrincipal Jwt jwt) {
        return projectService.getProjects(userId(jwt));
    }

    @PostMapping("/create")
    Project createProject(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody ProjectCreateRequest request
    ) {
        return projectService.createProject(userId(jwt), request.title());
    }

    @GetMapping("/{id}")
    ProjectObject getProject(@AuthenticationPrincipal Jwt jwt, @PathVariable Integer id) {
        return projectService.getProject(userId(jwt), id);
    }

    @PutMapping("/save/{id}")
    ProjectObject saveProject(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable Integer id,
        @Valid @RequestBody ProjectSaveRequest request
    ) {
        return projectService.saveProject(userId(jwt), id, request.objects());
    }

    private Integer userId(Jwt jwt) {
        return Integer.parseInt(jwt.getSubject());
    }
}
