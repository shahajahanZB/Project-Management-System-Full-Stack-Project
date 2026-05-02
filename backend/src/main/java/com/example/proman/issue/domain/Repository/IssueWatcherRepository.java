package com.example.proman.issue.domain.Repository;

import com.example.proman.issue.domain.Entity.IssueWatcherEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface IssueWatcherRepository extends JpaRepository<IssueWatcherEntity, Long> {

    List<IssueWatcherEntity> findAllByIssue_IdOrderByCreatedAtDesc(Long issueId);

    List<IssueWatcherEntity> findAllByIssue_IdAndWatcher_IdIn(Long issueId, Collection<Long> userIds);

    boolean existsByIssue_IdAndWatcher_Id(Long issueId, Long userId);

    void deleteByIssue_IdAndWatcher_IdIn(Long issueId, Collection<Long> userIds);

    long countByIssue_Id(Long issueId);
}
