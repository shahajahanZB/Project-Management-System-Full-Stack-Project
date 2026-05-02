package com.example.proman.issue.domain.Service.impl;

import com.example.proman.issue.domain.Dto.IssueActivityDTO;
import com.example.proman.issue.domain.Entity.*;
import com.example.proman.issue.domain.Repository.*;
import com.example.proman.issue.domain.Service.IssueActivityService;

import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IssueActivityServiceImpl implements IssueActivityService {

    private final IssueActivityRepository activityRepository;
    private final IssueRepository issueRepository;

    @Override
    @Transactional
    public void logActivity(Long issueId, String action, Long userId) {

        IssueEntity issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new EntityNotFoundException("Issue not found"));

        IssueActivityEntity activity = new IssueActivityEntity();
        activity.setIssue(issue);
        activity.setActivity(action);
        activity.setUserId(userId);
        activity.setCreatedAt(Instant.now());

        activityRepository.save(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueActivityDTO> getActivities(Long issueId) {

        return activityRepository.findByIssueIdOrderByCreatedAtDesc(issueId)
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
