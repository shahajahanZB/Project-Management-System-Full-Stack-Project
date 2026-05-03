package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserStoryActivityResponseDTO {

    private Long id;
    private Long userStoryId;
    private Long userId;
    private String username;
    private String activity;
    private Instant createdAt;
}
