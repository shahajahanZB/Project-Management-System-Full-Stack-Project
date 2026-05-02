package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryStatusUpdateRequestDTO {

    @NotNull
    private Long statusId;
}
