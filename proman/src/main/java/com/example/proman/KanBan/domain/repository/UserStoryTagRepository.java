package com.example.proman.KanBan.domain.repository;

import com.example.proman.KanBan.domain.Entity.UserStoryTagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserStoryTagRepository extends JpaRepository<UserStoryTagEntity, Long> {
    Optional<UserStoryTagEntity> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    java.util.List<UserStoryTagEntity> findAllByOrderByNameAsc();
}
