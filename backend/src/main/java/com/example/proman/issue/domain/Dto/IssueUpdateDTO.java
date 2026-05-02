package com.example.proman.issue.domain.Dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IssueUpdateDTO {
    @JsonAlias("assigneeID")
    private Long assigneeId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private Boolean isBlocked;
    private String status;
    private String type;
    private String severity;
    private String priority;
    private Set<Long> tagIds;
    private Set<Long> watcherIds;
}
