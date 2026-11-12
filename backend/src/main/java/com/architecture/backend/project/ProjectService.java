package com.architecture.backend.project;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.architecture.backend.auth.UserEntity;
import com.architecture.backend.auth.UserRepository;
import com.architecture.backend.auth.UserDtos.UserResponse;
import com.architecture.backend.config.ResourceNotFoundException;
import com.architecture.backend.project.ProjectDtos.ProjectDetailResponse;
import com.architecture.backend.project.ProjectDtos.ProjectMemberResponse;
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

    @Transactional
    public List<ProjectMemberResponse> getProjectMembers(Integer userId, Integer projectId){   
        // memberEntity => memberResponse로 변환
        return projectMemberRepository.findByProject_id(projectId)
                        .stream()
                        .map(member -> new ProjectMemberResponse(
                            member.getUser().getId(),
                            member.getUser().getNickname(),
                            member.getRole()
                        ))
                        .toList();             
    }


    /** 유저 초대, 권한 위임, 퇴출 로직들 **/
    /* keyword로 유저 검색: 잠재적으로 유저 편입 */
    @Transactional 
    public List<UserResponse> searchMembers(
        Integer userId, 
        String keyword, 
        Integer projectId
    ){
        if(keyword == null || keyword.length() < 2) return List.of();
    
        List<UserEntity> users 
                = userRepository.searchByNickname(keyword, PageRequest.of(0, 10));
        
        return users.stream()
                .map(user -> new UserResponse(
                    user.getId(), 
                    user.getNickname(),
                    getRole(userId, projectId)
                ))
                .toList(); 
    }

    /* 유저 초대하기 */
    @Transactional 
    public boolean inviteUser(
        Integer requestedUserId, 
        Integer invitedUserId,
        Integer projectId, 
        String role
    ){
        /* 권한 확인 */
        if(!"OWNER".equals(getRole(requestedUserId, projectId))){
            throw new AccessDeniedException("소유자만 실행할 수 있습니다.");
        }

        ProjectEntity project = projectRepository.getReferenceById(projectId);
        UserEntity user = userRepository.getReferenceById(invitedUserId);

        /* 초대됨 데이터 생성하기 */
        projectMemberRepository.save(
            new ProjectMemberEntity(project, user, role)
        );

        return true;
    }


    /* 특정 ID 기반으로 프로젝트 찾기 */
    private ProjectEntity requireOwnedProject(Integer userId, Integer projectId) {
        return projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다."));
    }

    /* 특정 projectId + userId 기반으로 해당 유저 권한 찾기 */
    private String getRole(Integer userId, Integer projectId){   
        return projectMemberRepository.findByProject_IdAndUser_Id(projectId, userId)
                .map(ProjectMemberEntity::getRole)
                .orElse("NONE");
    }
}




