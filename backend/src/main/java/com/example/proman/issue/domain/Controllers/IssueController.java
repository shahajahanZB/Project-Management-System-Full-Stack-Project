package com.example.proman.issue.domain.Controllers;

import com.example.proman.issue.domain.Dto.IssueActivityDTO;
import com.example.proman.issue.domain.Dto.IssueAssigneeRequestDTO;
import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;
import com.example.proman.issue.domain.Dto.IssueCommentDTO;
import com.example.proman.issue.domain.Dto.IssueRequestDTO;
import com.example.proman.issue.domain.Dto.IssueResponseDTO;
import com.example.proman.issue.domain.Dto.IssueTagDTO;
import com.example.proman.issue.domain.Dto.IssueTagIdsRequestDTO;
import com.example.proman.issue.domain.Dto.IssueUpdateDTO;
import com.example.proman.issue.domain.Dto.IssueUsersRequestDTO;
import com.example.proman.issue.domain.Service.IssueActivityService;
import com.example.proman.issue.domain.Service.IssueAttachmentService;
import com.example.proman.issue.domain.Service.IssueCommentService;
import com.example.proman.issue.domain.Service.IssueService;
import com.example.proman.issue.domain.Service.IssueTagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final IssueCommentService issueCommentService;
    private final IssueAttachmentService issueAttachmentService;
    private final IssueActivityService issueActivityService;
    private final IssueTagService issueTagService;

    @PostMapping
    @PreAuthorize("hasAuthority('ISSUE_CREATE')")
    public ResponseEntity<IssueResponseDTO> createIssue(@Valid @RequestBody IssueRequestDTO requestDTO) {
        return ResponseEntity.ok(issueService.createIssue(requestDTO));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<IssueResponseDTO> getIssueById(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueResponseDTO>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueResponseDTO>> getIssuesByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ISSUE_MANAGE')")
    public ResponseEntity<IssueResponseDTO> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueUpdateDTO updateDTO
    ) {
        return ResponseEntity.ok(issueService.updateIssue(id, updateDTO));
    }

    @PatchMapping("/{id}/assignee")
    @PreAuthorize("hasAuthority('ISSUE_ASSIGN')")
    public ResponseEntity<IssueResponseDTO> assignIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueAssigneeRequestDTO request
    ) {
        return ResponseEntity.ok(issueService.assignIssue(id, request.getAssigneeId()));
    }

    @DeleteMapping("/{id}/assignee")
    @PreAuthorize("hasAuthority('ISSUE_ASSIGN')")
    public ResponseEntity<IssueResponseDTO> removeAssignee(@PathVariable Long id) {
        return ResponseEntity.ok(issueService.removeAssignee(id));
    }

    @PostMapping("/{id}/tags")
    @PreAuthorize("hasAuthority('ISSUE_TAG')")
    public ResponseEntity<IssueResponseDTO> addTags(
            @PathVariable Long id,
            @Valid @RequestBody IssueTagIdsRequestDTO request
    ) {
        return ResponseEntity.ok(issueService.addTags(id, request.getTagIds()));
    }

    @DeleteMapping("/{id}/tags")
    @PreAuthorize("hasAuthority('ISSUE_TAG')")
    public ResponseEntity<IssueResponseDTO> removeTags(
            @PathVariable Long id,
            @Valid @RequestBody IssueTagIdsRequestDTO request
    ) {
        return ResponseEntity.ok(issueService.removeTags(id, request.getTagIds()));
    }

    @PostMapping("/{id}/watchers")
    @PreAuthorize("hasAuthority('ISSUE_WATCHER_MANAGE')")
    public ResponseEntity<IssueResponseDTO> addWatchers(
            @PathVariable Long id,
            @Valid @RequestBody IssueUsersRequestDTO request
    ) {
        return ResponseEntity.ok(issueService.addWatchers(id, request.getUserIds()));
    }

    @DeleteMapping("/{id}/watchers")
    @PreAuthorize("hasAuthority('ISSUE_WATCHER_MANAGE')")
    public ResponseEntity<IssueResponseDTO> removeWatchers(
            @PathVariable Long id,
            @Valid @RequestBody IssueUsersRequestDTO request
    ) {
        return ResponseEntity.ok(issueService.removeWatchers(id, request.getUserIds()));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('ISSUE_COMMENT')")
    public ResponseEntity<IssueCommentDTO> addComment(
            @PathVariable Long id,
            @Valid @RequestBody IssueCommentDTO request
    ) {
        return ResponseEntity.ok(issueCommentService.addComment(id, request));
    }

    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueCommentDTO>> getComments(@PathVariable Long id) {
        return ResponseEntity.ok(issueCommentService.getCommentsByIssue(id));
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ISSUE_COMMENT')")
    public ResponseEntity<IssueCommentDTO> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody IssueCommentDTO request
    ) {
        return ResponseEntity.ok(issueCommentService.updateComment(commentId, request));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ISSUE_COMMENT')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        issueCommentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasAuthority('ISSUE_ATTACHMENT')")
    public ResponseEntity<IssueAttachmentDTO> addAttachment(
            @PathVariable Long id,
            @Valid @RequestBody IssueAttachmentDTO request
    ) {
        return ResponseEntity.ok(issueAttachmentService.addAttachment(id, request));
    }

    @GetMapping("/{id}/attachments")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueAttachmentDTO>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(issueAttachmentService.getAttachments(id));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    @PreAuthorize("hasAuthority('ISSUE_ATTACHMENT')")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        issueAttachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueActivityDTO>> getActivities(@PathVariable Long id) {
        return ResponseEntity.ok(issueActivityService.getActivities(id));
    }

    @GetMapping("/tags")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueTagDTO>> getTags() {
        return ResponseEntity.ok(issueTagService.getAllTags());
    }

    @PostMapping("/tags")
    @PreAuthorize("hasAuthority('ISSUE_TAG')")
    public ResponseEntity<IssueTagDTO> createTag(@Valid @RequestBody IssueTagDTO request) {
        return ResponseEntity.ok(issueTagService.createTag(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ISSUE_DELETE')")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
