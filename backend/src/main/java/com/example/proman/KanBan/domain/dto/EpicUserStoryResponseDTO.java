package com.example.proman.KanBan.domain.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class EpicUserStoryResponseDTO {

    private Long id;
    private String name;
    private String status;
    private Instant endDate;
}
