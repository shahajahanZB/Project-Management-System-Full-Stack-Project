package com.example.proman.KanBan.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectCreateRequestDTO {

    @NotBlank
    @Size(max = 250)
    private String name;

    @NotBlank
    private String description;
}
