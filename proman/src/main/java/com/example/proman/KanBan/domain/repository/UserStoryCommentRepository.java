package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStoryCommentRepository extends JpaRepository<UserStoryCommentEntity, Long> {
    List<UserStoryCommentEntity> findAllByUserStory_IdOrderByCreatedAtDesc(Long userStoryId);

    List<UserStoryCommentEntity> findAllByUserStory_IdAndUserIdOrderByCreatedAtDesc(Long userStoryId, Long userId);

    java.util.Optional<UserStoryCommentEntity> findByIdAndUserStory_Id(Long id, Long userStoryId);

    long countByUserStory_Id(Long userStoryId);
}
