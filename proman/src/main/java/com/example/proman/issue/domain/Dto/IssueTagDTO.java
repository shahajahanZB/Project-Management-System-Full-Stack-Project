package com.example.proman.issue.domain.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueTagDTO {

    private Long id;

    @NotBlank(message = "Tag name is required")
    private String name;
}
