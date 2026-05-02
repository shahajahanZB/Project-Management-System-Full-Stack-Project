package com.example.proman.KanBan.domain.service;

import com.example.proman.KanBan.domain.dto.TaskCreateRequestDTO;
import com.example.proman.KanBan.domain.dto.TaskResponseDTO;
import com.example.proman.KanBan.domain.dto.TaskUpdateRequestDTO;

import java.util.List;

public interface TaskService {

    TaskResponseDTO createTask(TaskCreateRequestDTO request);

    List<TaskResponseDTO> getTasksByProject(Long projectId);

    List<TaskResponseDTO> getTasksByUserStory(Long userStoryId);

    TaskResponseDTO getTaskById(Long taskId);

    TaskResponseDTO updateTask(Long taskId, TaskUpdateRequestDTO request);

    void deleteTask(Long taskId);
}
