package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.ProjectMembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMembershipRepository extends JpaRepository<ProjectMembershipEntity, Long> {

    Optional<ProjectMembershipEntity> findByProject_IdAndUser_Id(Long projectId, Long userId);

    boolean existsByProject_IdAndUser_Id(Long projectId, Long userId);

    List<ProjectMembershipEntity> findAllByProject_Id(Long projectId);

    List<ProjectMembershipEntity> findAllByUser_Id(Long userId);

    void deleteAllByProject_Id(Long projectId);

    void deleteAllByProject_IdAndUser_IdIn(Long projectId, List<Long> userIds);

    void deleteByProject_IdAndUser_Id(Long projectId, Long userId);

    List<ProjectMembershipEntity> findAllByProject_IdAndUser_IdIn(Long projectId, List<Long> userIds);
}
