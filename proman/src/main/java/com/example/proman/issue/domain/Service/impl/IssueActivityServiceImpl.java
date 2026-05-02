package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.IssueActivityDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.IssueActivityService;

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
        activity.setActivity(action);
        activity.setUserId(userId);
        activity.setCreatedAt(Instant.now());

        activityRepository.save(activity);
    }

    @Override
    public List<IssueActivityDTO> getActivities(Long issueId) {

        return activityRepository.findByIssueId(issueId)
                .stream()
                .map(a -> IssueActivityDTO.builder()
                        .id(a.getId())
                        .action(a.getActivity())
                        .performedBy(a.getUserId())
                        .createdAt(a.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
