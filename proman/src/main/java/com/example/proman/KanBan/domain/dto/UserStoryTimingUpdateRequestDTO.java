package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UserStoryTimingUpdateRequestDTO {

    @NotNull
    private Instant endDate;
}
