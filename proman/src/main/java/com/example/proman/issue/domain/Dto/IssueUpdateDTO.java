package com.example.proman.issue.domain.Dto;

import lombok.*;
import java.util.Set;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueUpdateDTO {
    private Long assigneeId;
    private String title;
    private String description;
    private Boolean isBlocked;
    private String status;
    private String type;
    private String severity;
    private String priority;
    private Set<Long> tagIds;
}
