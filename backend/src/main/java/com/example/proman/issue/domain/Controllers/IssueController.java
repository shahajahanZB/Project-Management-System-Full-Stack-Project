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

import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;
    private final IssueCommentService issueCommentService;
    private final IssueAttachmentService issueAttachmentService;
    private final IssueActivityService issueActivityService;
    private final IssueTagService issueTagService;

    /*
    |--------------------------------------------------------------------------
    | CREATE ISSUE INSIDE SELECTED PROJECT
    |--------------------------------------------------------------------------
    |
    | Example:
    | POST /api/v1/projects/3/issues
    |
    | This creates issue only inside project with ID = 3
    |
    */

    @PostMapping
    @PreAuthorize("hasAuthority('ISSUE_CREATE')")
    public ResponseEntity<IssueResponseDTO> createIssue(
            @PathVariable Long projectId,
            @Valid @RequestBody IssueRequestDTO requestDTO
    ) {

        return ResponseEntity.ok(
                issueService.createIssue(projectId, requestDTO)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET SINGLE ISSUE
    |--------------------------------------------------------------------------
    |
    | Example:
    | GET /api/v1/projects/3/issues/15
    |
    */

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<IssueResponseDTO> getIssueById(
            @PathVariable Long projectId,
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                issueService.getIssueById(id)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET ALL ISSUES OF SELECTED PROJECT
    |--------------------------------------------------------------------------
    |
    | Example:
    | GET /api/v1/projects/3/issues
    |
    */

    @GetMapping
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueResponseDTO>> getAllIssues(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                issueService.getIssuesByProject(projectId)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE ISSUE
    |--------------------------------------------------------------------------
    |
    | Example:
    | PUT /api/v1/projects/3/issues/15
    |
    */

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ISSUE_MANAGE')")
    public ResponseEntity<IssueResponseDTO> updateIssue(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueUpdateDTO updateDTO
    ) {

        return ResponseEntity.ok(
                issueService.updateIssue(id, updateDTO)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ASSIGN USER TO ISSUE
    |--------------------------------------------------------------------------
    */

    @PatchMapping("/{id}/assignee")
    @PreAuthorize("hasAuthority('ISSUE_ASSIGN')")
    public ResponseEntity<IssueResponseDTO> assignIssue(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueAssigneeRequestDTO request
    ) {

        return ResponseEntity.ok(
                issueService.assignIssue(id, request.getAssigneeId())
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE ASSIGNEE
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/{id}/assignee")
    @PreAuthorize("hasAuthority('ISSUE_ASSIGN')")
    public ResponseEntity<IssueResponseDTO> removeAssignee(
            @PathVariable Long projectId,
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                issueService.removeAssignee(id)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ADD TAGS
    |--------------------------------------------------------------------------
    */

    @PostMapping("/{id}/tags")
    @PreAuthorize("hasAuthority('ISSUE_TAG')")
    public ResponseEntity<IssueResponseDTO> addTags(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueTagIdsRequestDTO request
    ) {

        return ResponseEntity.ok(
                issueService.addTags(id, request.getTagIds())
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE TAGS
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/{id}/tags")
    @PreAuthorize("hasAuthority('ISSUE_TAG')")
    public ResponseEntity<IssueResponseDTO> removeTags(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueTagIdsRequestDTO request
    ) {

        return ResponseEntity.ok(
                issueService.removeTags(id, request.getTagIds())
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ADD WATCHERS
    |--------------------------------------------------------------------------
    */

    @PostMapping("/{id}/watchers")
    @PreAuthorize("hasAuthority('ISSUE_WATCHER_MANAGE')")
    public ResponseEntity<IssueResponseDTO> addWatchers(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueUsersRequestDTO request
    ) {

        return ResponseEntity.ok(
                issueService.addWatchers(id, request.getUserIds())
        );
    }

    /*
    |--------------------------------------------------------------------------
    | REMOVE WATCHERS
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/{id}/watchers")
    @PreAuthorize("hasAuthority('ISSUE_WATCHER_MANAGE')")
    public ResponseEntity<IssueResponseDTO> removeWatchers(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueUsersRequestDTO request
    ) {

        return ResponseEntity.ok(
                issueService.removeWatchers(id, request.getUserIds())
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ADD COMMENT
    |--------------------------------------------------------------------------
    */

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('ISSUE_COMMENT')")
    public ResponseEntity<IssueCommentDTO> addComment(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody IssueCommentDTO request
    ) {

        return ResponseEntity.ok(
                issueCommentService.addComment(id, request)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET COMMENTS
    |--------------------------------------------------------------------------
    */

    @GetMapping("/{id}/comments")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueCommentDTO>> getComments(
            @PathVariable Long projectId,
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                issueCommentService.getCommentsByIssue(id)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE COMMENT
    |--------------------------------------------------------------------------
    */

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ISSUE_COMMENT')")
    public ResponseEntity<IssueCommentDTO> updateComment(
            @PathVariable Long projectId,
            @PathVariable Long commentId,
            @Valid @RequestBody IssueCommentDTO request
    ) {

        return ResponseEntity.ok(
                issueCommentService.updateComment(commentId, request)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE COMMENT
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('ISSUE_COMMENT')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long projectId,
            @PathVariable Long commentId
    ) {

        issueCommentService.deleteComment(commentId);

        return ResponseEntity.noContent().build();
    }

    /*
    |--------------------------------------------------------------------------
    | ADD ATTACHMENT
    |--------------------------------------------------------------------------
    */

    @PostMapping(
            value = "/{id}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasAuthority('ISSUE_ATTACHMENT')")
    public ResponseEntity<IssueAttachmentDTO> addAttachment(
            @PathVariable Long projectId,
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file
    ) {

        return ResponseEntity.ok(
                issueAttachmentService.addAttachment(id, file)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET ATTACHMENTS
    |--------------------------------------------------------------------------
    */

    @GetMapping("/{id}/attachments")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueAttachmentDTO>> getAttachments(
            @PathVariable Long projectId,
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                issueAttachmentService.getAttachments(id)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE ATTACHMENT
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/attachments/{attachmentId}")
    @PreAuthorize("hasAuthority('ISSUE_ATTACHMENT')")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long projectId,
            @PathVariable Long attachmentId
    ) {

        issueAttachmentService.deleteAttachment(attachmentId);

        return ResponseEntity.noContent().build();
    }

    /*
    |--------------------------------------------------------------------------
    | GET ISSUE ACTIVITIES
    |--------------------------------------------------------------------------
    */

    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueActivityDTO>> getActivities(
            @PathVariable Long projectId,
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                issueActivityService.getActivities(id)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | GET ALL TAGS
    |--------------------------------------------------------------------------
    */

    @GetMapping("/tags")
    @PreAuthorize("hasAuthority('ISSUE_VIEW')")
    public ResponseEntity<List<IssueTagDTO>> getTags(
            @PathVariable Long projectId
    ) {

        return ResponseEntity.ok(
                issueTagService.getAllTags()
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE TAG
    |--------------------------------------------------------------------------
    */

    @PostMapping("/tags")
    @PreAuthorize("hasAuthority('ISSUE_TAG')")
    public ResponseEntity<IssueTagDTO> createTag(
            @PathVariable Long projectId,
            @Valid @RequestBody IssueTagDTO request
    ) {

        return ResponseEntity.ok(
                issueTagService.createTag(request)
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE ISSUE
    |--------------------------------------------------------------------------
    */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ISSUE_DELETE')")
    public ResponseEntity<Void> deleteIssue(
            @PathVariable Long projectId,
            @PathVariable Long id
    ) {

        issueService.deleteIssue(id);

        return ResponseEntity.noContent().build();
    }
}