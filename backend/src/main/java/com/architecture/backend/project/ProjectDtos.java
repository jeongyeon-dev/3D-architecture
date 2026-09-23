package com.architecture.backend.project;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ProjectDtos {

    private ProjectDtos() {
    }

    public record ProjectCreateRequest(
        @NotBlank(message = "프로젝트 제목을 입력해 주세요.") String title
    ) {
    }

    public record ProjectSaveRequest(
        @NotNull(message = "프로젝트 오브젝트가 필요합니다.") List<Map<String, Object>> objects
    ) {
    }
}
