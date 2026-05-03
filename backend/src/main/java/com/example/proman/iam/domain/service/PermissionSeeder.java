package com.example.proman.iam.domain.service;

import com.example.proman.iam.domain.entity.PermissionEntity;
import com.example.proman.iam.domain.entity.enums.PermissionCategory;
import com.example.proman.iam.domain.repository.PermissionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
public class PermissionSeeder implements ApplicationRunner {

    private static final List<String> PERMISSIONS = List.of(
            "USER_CREATE",
            "USER_UPDATE",
            "USER_DELETE",
            "USER_VIEW_ALL",
            "ROLE_MANAGE",
            "PROJECT_CREATE",
            "PROJECT_VIEW",
            "PROJECT_MANAGE_MEMBERS",
            "PROJECT_DELETE",
            "EPIC_CREATE",
            "EPIC_VIEW",
            "EPIC_ASSIGN_USERS",
            "STORY_CREATE",
            "STORY_VIEW",
            "STORY_MANAGE",
            "STORY_UPDATE_STATUS",
            "STORY_SET_TIMINGS",
            "STORY_COMMENT",
            "STORY_ATTACHMENT",
            "STORY_STATUS_MANAGE",
            "STORY_STATUS_VIEW",
            "ISSUE_CREATE",
            "ISSUE_VIEW",
            "ISSUE_MANAGE",
            "ISSUE_ASSIGN",
            "ISSUE_TAG",
            "ISSUE_WATCHER_MANAGE",
            "ISSUE_COMMENT",
            "ISSUE_ATTACHMENT",
            "ISSUE_DELETE",
            "TASK_CREATE",
            "TASK_VIEW",
            "TASK_MANAGE",
            "TASK_DELETE"
    );

    private final PermissionRepository permissionRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String access : PERMISSIONS) {
            permissionRepository.findByAccess(access)
                    .orElseGet(() -> permissionRepository.save(new PermissionEntity(access, PermissionCategory.MODULE)));
        }
    }
}
