package com.example.proman.KanBan.domain.controller;

import com.example.proman.KanBan.domain.dto.UserStoryTagCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryTagResponseDTO;
import com.example.proman.KanBan.domain.service.UserStoryTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-story-tags")
@RequiredArgsConstructor
public class UserStoryTagController {

    private final UserStoryTagService userStoryTagService;

    @PostMapping
    @PreAuthorize("hasAuthority('STORY_MANAGE')")
    public ResponseEntity<UserStoryTagResponseDTO> createTag(@Valid @RequestBody UserStoryTagCreateRequestDTO request) {
        return ResponseEntity.status(201).body(userStoryTagService.createTag(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('STORY_VIEW')")
    public ResponseEntity<List<UserStoryTagResponseDTO>> getAllTags() {
        return ResponseEntity.ok(userStoryTagService.getAllTags());
    }
}
