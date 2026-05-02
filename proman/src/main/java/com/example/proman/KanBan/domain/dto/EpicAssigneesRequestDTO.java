package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class EpicAssigneesRequestDTO {

    @NotNull
    private List<Long> userIds;
}
