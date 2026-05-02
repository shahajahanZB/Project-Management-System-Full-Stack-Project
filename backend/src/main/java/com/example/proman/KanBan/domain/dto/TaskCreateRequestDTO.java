package com.example.proman.KanBan.domain.dto;

import com.example.proman.KanBan.domain.Entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskCreateRequestDTO {

    @NotNull
    private Long projectId;

    @NotNull
    private Long userStoryId;

    @NotBlank
    private String subject;

    private TaskStatus status;

    private Long assignedToUserId;
}
