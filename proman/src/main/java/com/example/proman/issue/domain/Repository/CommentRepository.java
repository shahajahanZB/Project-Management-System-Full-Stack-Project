package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    // get all comments of an issue
    List<CommentEntity> findByIssueId(Long issueId);
}