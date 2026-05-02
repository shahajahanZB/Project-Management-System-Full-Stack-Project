package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryStatusCreateRequestDTO {

    @NotNull
    private Long projectId;

    @NotBlank
    private String name;

    private Integer sortOrder;
}
