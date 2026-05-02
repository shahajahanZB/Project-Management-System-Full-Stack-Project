package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectMembershipResponseDTO {

    private Long id;
    private Long projectId;
    private Long userId;
    private String username;
    private String email;
}
