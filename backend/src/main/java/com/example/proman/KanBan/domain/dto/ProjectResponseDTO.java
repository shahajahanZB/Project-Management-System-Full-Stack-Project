package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ProjectResponseDTO {

    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerUsername;
    private Instant createdDate;
    private Instant modifiedDate;
}
