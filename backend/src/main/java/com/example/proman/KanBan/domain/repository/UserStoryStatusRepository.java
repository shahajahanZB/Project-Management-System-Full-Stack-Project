package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserStoryStatusRepository extends JpaRepository<UserStoryStatusEntity, Long> {

    List<UserStoryStatusEntity> findAllByProject_IdOrderBySortOrderAscIdAsc(Long projectId);

    Optional<UserStoryStatusEntity> findFirstByProject_IdOrderBySortOrderAscIdAsc(Long projectId);

    Optional<UserStoryStatusEntity> findByIdAndProject_Id(Long id, Long projectId);

    Optional<UserStoryStatusEntity> findByProject_IdAndNameIgnoreCase(Long projectId, String name);

    boolean existsByProject_IdAndNameIgnoreCase(Long projectId, String name);

    Optional<UserStoryStatusEntity> findFirstByProject_IdOrderBySortOrderDescIdDesc(Long projectId);

    long countByIdAndProject_Id(Long id, Long projectId);
}
