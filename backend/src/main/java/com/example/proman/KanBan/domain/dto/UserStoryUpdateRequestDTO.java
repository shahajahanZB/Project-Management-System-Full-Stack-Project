package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryUpdateRequestDTO {

    private String title;
    private String description;
    private Long epicId;
}
