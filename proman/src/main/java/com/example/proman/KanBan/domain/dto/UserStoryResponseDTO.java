package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
public class UserStoryResponseDTO {

    private Long id;
    private Long projectId;
    private Long epicId;
    private Long statusId;
    private String statusName;
    private Boolean statusClosed;
    private String title;
    private String description;
    private Set<Long> assignedUserIds;
    private Set<Long> watcherIds;
    private Set<String> tagNames;
    private Integer attachmentCount;
    private Integer commentCount;
    private Integer activityCount;
}
