package com.example.proman.KanBan.domain.service.impl;

import com.example.proman.KanBan.domain.Entity.UserStoryTagEntity;
import com.example.proman.KanBan.domain.dto.UserStoryTagCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryTagResponseDTO;
import com.example.proman.KanBan.domain.repository.UserStoryTagRepository;
import com.example.proman.KanBan.domain.service.UserStoryTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("userStoryTagService")
@RequiredArgsConstructor
public class UserStoryTagServiceImpl implements UserStoryTagService {

    private final UserStoryTagRepository userStoryTagRepository;

    @Override
    @Transactional
    public UserStoryTagResponseDTO createTag(UserStoryTagCreateRequestDTO request) {
        String name = normalize(request.getName());
        if (userStoryTagRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalStateException("Tag already exists");
        }

        UserStoryTagEntity tag = new UserStoryTagEntity();
        tag.setName(name);
        return map(userStoryTagRepository.save(tag));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserStoryTagResponseDTO> getAllTags() {
        return userStoryTagRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::map)
                .toList();
    }

    private String normalize(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tag name cannot be empty");
        }
        return name.trim();
    }

    private UserStoryTagResponseDTO map(UserStoryTagEntity tag) {
        UserStoryTagResponseDTO dto = new UserStoryTagResponseDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        return dto;
    }
}
