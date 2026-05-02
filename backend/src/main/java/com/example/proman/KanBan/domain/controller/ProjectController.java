package com.example.proman.KanBan.domain.controller;

import com.example.proman.KanBan.domain.dto.ProjectCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipRemoveRequestDTO;
import com.example.proman.KanBan.domain.dto.ProjectMembershipResponseDTO;
import com.example.proman.KanBan.domain.dto.ProjectResponseDTO;
import com.example.proman.KanBan.domain.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PROJECT_CREATE')")
    public ResponseEntity<ProjectResponseDTO> createProject(@Valid @RequestBody ProjectCreateRequestDTO request) {
        return ResponseEntity.status(201).body(projectService.createProject(request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROJECT_VIEW')")
    public ResponseEntity<List<ProjectResponseDTO>> getVisibleProjects() {
        return ResponseEntity.ok(projectService.getVisibleProjects());
    }

    @GetMapping("/{projectId}")
    @PreAuthorize("hasAuthority('PROJECT_VIEW')")
    public ResponseEntity<ProjectResponseDTO> getProjectById(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectById(projectId));
    }

    @PostMapping("/{projectId}/members")
    @PreAuthorize("hasAuthority('PROJECT_MANAGE_MEMBERS')")
    public ResponseEntity<List<ProjectMembershipResponseDTO>> addMembers(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMembershipCreateRequestDTO request
    ) {
        return ResponseEntity.status(201).body(projectService.addMembers(projectId, request));
    }

    @DeleteMapping("/{projectId}/members")
    @PreAuthorize("hasAuthority('PROJECT_MANAGE_MEMBERS')")
    public ResponseEntity<List<ProjectMembershipResponseDTO>> removeMembers(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMembershipRemoveRequestDTO request
    ) {
        return ResponseEntity.ok(projectService.removeMembers(projectId, request));
    }

    @GetMapping("/{projectId}/members")
    @PreAuthorize("hasAuthority('PROJECT_VIEW')")
    public ResponseEntity<List<ProjectMembershipResponseDTO>> getMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }

    @DeleteMapping("/{projectId}")
    @PreAuthorize("hasAuthority('PROJECT_DELETE')")
    public ResponseEntity<String> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.ok("Project deleted successfully");
    }
}
