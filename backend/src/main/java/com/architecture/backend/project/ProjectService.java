package com.architecture.backend.project;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.architecture.backend.config.ResourceNotFoundException;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectObjectRepository projectObjectRepository;

    public ProjectService(
        ProjectRepository projectRepository,
        ProjectObjectRepository projectObjectRepository
    ) {
        this.projectRepository = projectRepository;
        this.projectObjectRepository = projectObjectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectEntity> getProjects(Integer userId) {
        return projectRepository.findAllByUserIdOrderByUpdatedAtDesc(userId);
    }

    @Transactional
    public ProjectEntity createProject(Integer userId, String title) {
        LocalDateTime now = LocalDateTime.now();
        ProjectEntity project = projectRepository.save(new ProjectEntity(userId, title, now));
        projectObjectRepository.save(new ProjectObjectEntity(project.getId(), List.of(), now));
        return project;
    }

    @Transactional(readOnly = true)
    public ProjectObjectEntity getProject(Integer userId, Integer projectId) {
        requireOwnedProject(userId, projectId);
        return projectObjectRepository.findByProjectId(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
    }

    @Transactional
    public ProjectObjectEntity saveProject(Integer userId, Integer projectId, List<Map<String, Object>> objects) {
        ProjectEntity project = requireOwnedProject(userId, projectId);
        ProjectObjectEntity projectObject = projectObjectRepository.findByProjectId(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));

        LocalDateTime now = LocalDateTime.now();
        projectObject.update(objects, now);
        project.touch(now);
        return projectObject;
    }

    private ProjectEntity requireOwnedProject(Integer userId, Integer projectId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
    }
}
