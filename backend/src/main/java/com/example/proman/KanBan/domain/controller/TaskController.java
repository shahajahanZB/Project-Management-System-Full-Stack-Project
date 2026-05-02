package com.example.proman.KanBan.domain.controller;

import com.example.proman.KanBan.domain.dto.TaskCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.TaskResponseDTO;
import com.example.proman.KanBan.domain.dto.TaskUpdateRequestDTO;
import com.example.proman.KanBan.domain.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAuthority('TASK_CREATE')")
    public ResponseEntity<TaskResponseDTO> createTask(@Valid @RequestBody TaskCreateRequestDTO request) {
        return ResponseEntity.status(201).body(taskService.createTask(request));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAuthority('TASK_VIEW')")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/story/{userStoryId}")
    @PreAuthorize("hasAuthority('TASK_VIEW')")
    public ResponseEntity<List<TaskResponseDTO>> getTasksByUserStory(@PathVariable Long userStoryId) {
        return ResponseEntity.ok(taskService.getTasksByUserStory(userStoryId));
    }

    @GetMapping("/{taskId}")
    @PreAuthorize("hasAuthority('TASK_VIEW')")
    public ResponseEntity<TaskResponseDTO> getTaskById(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }

    @PatchMapping("/{taskId}")
    @PreAuthorize("hasAuthority('TASK_MANAGE')")
    public ResponseEntity<TaskResponseDTO> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(taskService.updateTask(taskId, request));
    }

    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasAuthority('TASK_DELETE')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
