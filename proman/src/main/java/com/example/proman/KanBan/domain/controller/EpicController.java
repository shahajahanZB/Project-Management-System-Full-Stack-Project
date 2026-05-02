package com.example.proman.KanBan.domain.controller;

import com.example.proman.KanBan.domain.dto.EpicAssigneesRequestDTO;
import com.example.proman.KanBan.domain.dto.EpicCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.EpicResponseDTO;
import com.example.proman.KanBan.domain.service.EpicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/epics")
public class EpicController {

    private final EpicService epicService;

    public EpicController(EpicService epicService) {
        this.epicService = epicService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EPIC_CREATE')")
    public ResponseEntity<EpicResponseDTO> createEpic(@Valid @RequestBody EpicCreateRequestDTO request) {
        return ResponseEntity.status(201).body(epicService.createEpic(request));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAuthority('EPIC_VIEW')")
    public ResponseEntity<List<EpicResponseDTO>> getEpicsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(epicService.getEpicsByProject(projectId));
    }

    @GetMapping("/{epicId}")
    @PreAuthorize("hasAuthority('EPIC_VIEW')")
    public ResponseEntity<EpicResponseDTO> getEpicById(@PathVariable Long epicId) {
        return ResponseEntity.ok(epicService.getEpicById(epicId));
    }

    @PostMapping("/{epicId}/assignees")
    @PreAuthorize("hasAuthority('EPIC_ASSIGN_USERS')")
    public ResponseEntity<List<EpicResponseDTO>> assignUsers(
            @PathVariable Long epicId,
            @Valid @RequestBody EpicAssigneesRequestDTO request
    ) {
        return ResponseEntity.ok(epicService.assignUsers(epicId, request));
    }

    @DeleteMapping("/{epicId}/assignees")
    @PreAuthorize("hasAuthority('EPIC_ASSIGN_USERS')")
    public ResponseEntity<List<EpicResponseDTO>> removeUsers(
            @PathVariable Long epicId,
            @Valid @RequestBody EpicAssigneesRequestDTO request
    ) {
        return ResponseEntity.ok(epicService.removeUsers(epicId, request));
    }
}
