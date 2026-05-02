package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryCommentCreateRequestDTO {

    @NotBlank
    private String comment;
}
