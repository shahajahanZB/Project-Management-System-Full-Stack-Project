package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<TagEntity, Long> {
}