package com.example.proman.KanBan.domain.dto;

import com.example.proman.KanBan.domain.Entity.enums.TaskStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskUpdateRequestDTO {

    private Long projectId;

    private Long userStoryId;

    private String subject;

    private TaskStatus status;

    private Long assignedToUserId;
}
