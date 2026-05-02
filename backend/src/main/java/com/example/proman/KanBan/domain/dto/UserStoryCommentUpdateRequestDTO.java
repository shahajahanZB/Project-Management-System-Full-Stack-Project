package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryCommentUpdateRequestDTO {

    @NotBlank
    private String comment;
}
