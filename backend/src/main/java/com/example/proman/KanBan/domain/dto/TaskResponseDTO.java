package com.example.proman.KanBan.domain.dto;

import com.example.proman.KanBan.domain.Entity.enums.TaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class TaskResponseDTO {

    private Long id;
    private Long projectId;
    private Long userStoryId;
    private String subject;
    private TaskStatus status;
    private Long assignedToUserId;
    private String assignedToUsername;
    private String assignedToEmail;
    private Instant createdAt;
    private Instant updatedAt;
}
