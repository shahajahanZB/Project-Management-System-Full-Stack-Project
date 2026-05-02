package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryAttachmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStoryAttachmentRepository extends JpaRepository<UserStoryAttachmentEntity, Long> {
    List<UserStoryAttachmentEntity> findAllByUserStory_IdOrderByCreatedAtDesc(Long userStoryId);

    long countByUserStory_Id(Long userStoryId);
}
