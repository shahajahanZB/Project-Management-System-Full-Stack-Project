package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryCreateRequestDTO {

    @NotNull
    private Long projectId;

    private Long epicId;

    private Long statusId;

    @NotBlank
    private String title;

    @NotBlank
    private String description;
}
