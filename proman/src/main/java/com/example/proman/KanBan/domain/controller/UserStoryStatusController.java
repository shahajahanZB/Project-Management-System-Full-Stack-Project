package com.example.proman.KanBan.domain.controller;

import com.example.proman.KanBan.domain.dto.UserStoryStatusCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.UserStoryStatusResponseDTO;
import com.example.proman.KanBan.domain.service.UserStoryStatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-story-statuses")
@RequiredArgsConstructor
public class UserStoryStatusController {

    private final UserStoryStatusService userStoryStatusService;

    @PostMapping
    @PreAuthorize("hasAuthority('USER_STORY_STATUS_MANAGE')")
    public ResponseEntity<UserStoryStatusResponseDTO> createStatus(@Valid @RequestBody UserStoryStatusCreateRequestDTO request) {
        return ResponseEntity.ok(userStoryStatusService.createStatus(request));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAuthority('USER_STORY_STATUS_VIEW')")
    public ResponseEntity<List<UserStoryStatusResponseDTO>> getStatusesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(userStoryStatusService.getStatusesByProject(projectId));
    }

    @DeleteMapping("/{statusId}")
    @PreAuthorize("hasAuthority('USER_STORY_STATUS_MANAGE')")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long statusId) {
        userStoryStatusService.deleteStatus(statusId);
        return ResponseEntity.noContent().build();
    }
}
