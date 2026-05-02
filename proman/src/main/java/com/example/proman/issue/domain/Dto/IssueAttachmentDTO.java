package com.example.proman.issue.domain.Dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IssueAttachmentDTO {

    private Long id;

    private String fileName;

    private String fileUrl;
}