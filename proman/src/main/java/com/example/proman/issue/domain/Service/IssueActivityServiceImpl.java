package com.example.proman.issue.domain.Service;

import com.example.proman.issue.domain.Dto.IssueActivityDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueActivityServiceImpl implements IssueActivityService {

    private final IssueActivityRepository activityRepository;
    private final IssueRepository issueRepository;

    @Override
    public void logActivity(Long issueId, String action, Long userId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        IssueActivityEntity activity = new IssueActivityEntity();
        activity.setIssue(issue);
        activity.setAction(action);
        activity.setPerformedBy(userId);
        activity.setCreatedAt(Instant.now());

        activityRepository.save(activity);
    }

    @Override
    public List<IssueActivityDTO> getActivities(Long issueId) {

        return activityRepository.findByIssueId(issueId)
                .stream()
                .map(a -> IssueActivityDTO.builder()
                        .id(a.getId())
                        .action(a.getAction())
                        .performedBy(a.getPerformedBy())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}