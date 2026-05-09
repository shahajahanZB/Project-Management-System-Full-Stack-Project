package com.example.proman.KanBan.domain.dto;

import com.example.proman.KanBan.domain.Entity.enums.EpicStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class EpicResponseDTO {

    private Long id;
    private Long projectId;
    private String name;
    private EpicStatus status;
    private Integer progress;
    private Set<Long> assignedUserIds;
    private List<EpicUserStoryResponseDTO> userStories;
}
