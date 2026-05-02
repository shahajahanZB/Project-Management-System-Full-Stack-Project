package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserStoryRepository extends JpaRepository<UserStoryEntity, Long> {

    List<UserStoryEntity> findAllByProject_IdOrderByCreatedDateDesc(Long projectId);

    List<UserStoryEntity> findAllByEpic_IdOrderByCreatedDateDesc(Long epicId);

    Optional<UserStoryEntity> findByIdAndProject_Id(Long id, Long projectId);

    long countByStatus_Id(Long statusId);

    long countByEpic_Id(Long epicId);

    long countByEpic_IdAndStatus_ClosedTrue(Long epicId);
}
