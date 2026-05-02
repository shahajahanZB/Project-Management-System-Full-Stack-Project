package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStoryActivityRepository extends JpaRepository<UserStoryActivityEntity, Long> {
    List<UserStoryActivityEntity> findAllByUserStory_IdOrderByCreatedAtDesc(Long userStoryId);

    long countByUserStory_Id(Long userStoryId);
}
