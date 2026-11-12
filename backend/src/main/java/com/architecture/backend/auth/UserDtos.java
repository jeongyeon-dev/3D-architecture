package com.architecture.backend.auth;

public final class UserDtos {

    private UserDtos() {
    }

    public record UserResponse(
        Integer userId,
        String nickname,
        String role
    ) {
    }

    public record UserInviteRequest(
        Integer userId,
        Integer projectId,
        String role
    ){
        
    }
}
