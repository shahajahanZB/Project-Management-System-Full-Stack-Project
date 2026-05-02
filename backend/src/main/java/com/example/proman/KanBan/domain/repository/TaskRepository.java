package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<TaskEntity, Long> {

    List<TaskEntity> findAllByProject_IdOrderByCreatedAtDesc(Long projectId);

    List<TaskEntity> findAllByUserStory_IdOrderByCreatedAtDesc(Long userStoryId);

    Optional<TaskEntity> findByIdAndProject_Id(Long id, Long projectId);

    Optional<TaskEntity> findByIdAndUserStory_Id(Long id, Long userStoryId);
}
