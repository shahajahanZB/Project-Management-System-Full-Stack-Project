package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.UserStoryTagCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryTagResponseDTO;

import java.util.List;

public interface UserStoryTagService {

    UserStoryTagResponseDTO createTag(UserStoryTagCreateRequestDTO request);

    List<UserStoryTagResponseDTO> getAllTags();
}
