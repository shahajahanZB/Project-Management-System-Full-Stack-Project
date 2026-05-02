package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserStoryStatusResponseDTO {

    private Long id;
    private Long projectId;
    private String name;
    private boolean closed;
    private Integer sortOrder;
}
