package com.architecture.backend.project;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.architecture.backend.auth.UserEntity;
import com.architecture.backend.auth.UserRepository;
import com.architecture.backend.config.ResourceNotFoundException;
import com.architecture.backend.project.ProjectDtos.ProjectDetailResponse;
import com.architecture.backend.project.projectObject.ProjectObjectEntity;
import com.architecture.backend.project.projectObject.ProjectObjectRepository;
import com.architecture.backend.project.project.ProjectEntity;
import com.architecture.backend.project.project.ProjectRepository;
import com.architecture.backend.project.projectMember.ProjectMemberEntity;
import com.architecture.backend.project.projectMember.ProjectMemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final UserRepository userRepository;
    
    private final ProjectRepository projectRepository;
    private final ProjectObjectRepository projectObjectRepository;
    private final ProjectMemberRepository projectMemberRepository;


    @Transactional(readOnly = true)
    public List<ProjectEntity> getProjects(Integer userId) {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if(user == null) return null;

        List<ProjectMemberEntity> middle = projectMemberRepository.findByUser(user);
        
        // 여기서 본인이 join한 프로젝트 찾기: 역할 상관 없음 + 삭제 처리 안된 것만
        List<ProjectEntity> projects = middle.stream()
                .map(ProjectMemberEntity::getProject)
                .filter(project -> project.getDeletedAt() == null)
                .toList();

        // 이제 각 프로젝트에 속하는 멤버를 가져와야 한다
        projects.forEach(project ->
            project.setMembers(
                projectMemberRepository.findByProject(project)
            )
        );
        
        return projects;
    }


    /* 프로젝트 생성하기 */
    @Transactional
    public ProjectEntity createProject(Integer userId, String title) {
        LocalDateTime now = LocalDateTime.now();
        
        // 먼저 프로젝트를 만든다
        ProjectEntity project = projectRepository.save(new ProjectEntity(userId, title, now));
        projectObjectRepository.save(new ProjectObjectEntity(project.getId(), List.of(), now));
        
        // 유저 정보를 불러온다
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // userEntity와 projectEntity 기반 memberEntity를 만든다 => 저장
        ProjectMemberEntity middle = new ProjectMemberEntity(project, user, "OWNER");
        projectMemberRepository.save(middle);
        
        return project;
    }

    @Transactional(readOnly = true)
    public ProjectDetailResponse getProject(Integer userId, Integer projectId) {
        ProjectEntity project = requireOwnedProject(userId, projectId);
        ProjectObjectEntity projectData = projectObjectRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
    
        return new ProjectDetailResponse(
            project.getId(), 
            project.getTitle(), 
            project.getUpdatedAt(), 
            projectData.getObjects()
        );
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

    @Transactional 
    public Boolean deleteProject(Integer userId, Integer projectId){
        ProjectEntity project = projectRepository
                .findByIdAndUserId(projectId, userId)
                .orElse(null);

        if (project == null) {
            return false;
        }

        project.moveToTrash();
    
        /* 이제 deletedAt 속성에 날짜가 추가된 것을 db에 반영한다 */
        projectRepository.save(project);
        return true;
    }

    /* 특정 ID 기반으로 프로젝트 찾기 */
    private ProjectEntity requireOwnedProject(Integer userId, Integer projectId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
    }
}



