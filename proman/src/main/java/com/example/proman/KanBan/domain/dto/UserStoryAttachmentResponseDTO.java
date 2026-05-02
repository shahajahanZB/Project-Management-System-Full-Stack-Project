package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserStoryAttachmentResponseDTO {

    private Long id;
    private Long userStoryId;
    private Long userId;
    private String filePath;
    private Instant createdAt;
}
