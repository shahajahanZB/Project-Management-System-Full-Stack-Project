package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueActivityRepository extends JpaRepository<IssueActivityEntity, Long> {

    // get activity history of an issue
    List<IssueActivityEntity> findByIssueId(Long issueId);
}