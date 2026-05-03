package com.example.proman.issue.domain.Controllers;

import com.example.proman.issue.domain.Dto.IssueActivityDTO;
import com.example.proman.issue.domain.Dto.IssueAttachmentDTO;
import com.example.proman.issue.domain.Dto.IssueCommentDTO;
import com.example.proman.issue.domain.Dto.IssueRequestDTO;
import com.example.proman.issue.domain.Dto.IssueResponseDTO;
import com.example.proman.issue.domain.Dto.IssueTagDTO;
import com.example.proman.issue.domain.Service.IssueActivityService;
import com.example.proman.issue.domain.Service.IssueAttachmentService;
import com.example.proman.issue.domain.Service.IssueCommentService;
import com.example.proman.issue.domain.Service.IssueService;
import com.example.proman.issue.domain.Service.IssueTagService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class IssueControllerTest {

    @Mock
    private IssueService issueService;

    @Mock
    private IssueCommentService issueCommentService;

    @Mock
    private IssueAttachmentService issueAttachmentService;

    @Mock
    private IssueActivityService issueActivityService;

    @Mock
    private IssueTagService issueTagService;

    private MockMvc mockMvc;
    @BeforeEach
    void setUp() {
        IssueController controller = new IssueController(
                issueService,
                issueCommentService,
                issueAttachmentService,
                issueActivityService,
                issueTagService
        );
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void issueCrudEndpointsUseExpectedPaths() throws Exception {
        when(issueService.createIssue(any(IssueRequestDTO.class))).thenReturn(issue());
        when(issueService.getIssueById(5L)).thenReturn(issue());
        when(issueService.getIssuesByProject(7L)).thenReturn(List.of(issue()));
        when(issueService.updateIssue(eq(5L), any())).thenReturn(issue());

        mockMvc.perform(post("/api/v1/issues/project/{projectId}", 7)
                        .contentType(APPLICATION_JSON)
                        .content(createIssueJson()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.projectId").value(7));

        ArgumentCaptor<IssueRequestDTO> requestCaptor = ArgumentCaptor.forClass(IssueRequestDTO.class);
        verify(issueService).createIssue(requestCaptor.capture());
        assertThat(requestCaptor.getValue().getProjectId()).isEqualTo(7L);

        mockMvc.perform(get("/api/v1/issues/{id}", 5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));

        mockMvc.perform(get("/api/v1/issues/project/{projectId}", 7))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].projectId").value(7));

        mockMvc.perform(put("/api/v1/issues/{id}", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"status\":\"CLOSED\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/issues/{id}", 5))
                .andExpect(status().isNoContent());

        verify(issueService).deleteIssue(5L);
    }

    @Test
    void assigneeTagAndWatcherEndpointsUseExpectedPaths() throws Exception {
        when(issueService.assignIssue(5L, 9L)).thenReturn(issue());
        when(issueService.removeAssignee(5L)).thenReturn(issue());
        when(issueService.addTags(eq(5L), eq(Set.of(1L, 2L)))).thenReturn(issue());
        when(issueService.removeTags(eq(5L), eq(Set.of(1L)))).thenReturn(issue());
        when(issueService.addWatchers(eq(5L), eq(Set.of(3L)))).thenReturn(issue());
        when(issueService.removeWatchers(eq(5L), eq(Set.of(3L)))).thenReturn(issue());

        mockMvc.perform(patch("/api/v1/issues/{id}/assignee", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"assigneeId\":9}"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/issues/{id}/assignee", 5))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/issues/{id}/tags", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"tagIds\":[1,2]}"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/issues/{id}/tags", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"tagIds\":[1]}"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/issues/{id}/watchers", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"userIds\":[3]}"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/issues/{id}/watchers", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"userIds\":[3]}"))
                .andExpect(status().isOk());
    }

    @Test
    void commentEndpointsUseExpectedPaths() throws Exception {
        IssueCommentDTO comment = IssueCommentDTO.builder()
                .id(11L)
                .userId(3L)
                .content("Looks good")
                .createdAt(Instant.parse("2026-05-03T00:00:00Z"))
                .updatedAt(Instant.parse("2026-05-03T00:00:00Z"))
                .build();

        when(issueCommentService.addComment(eq(5L), any())).thenReturn(comment);
        when(issueCommentService.getCommentsByIssue(5L)).thenReturn(List.of(comment));
        when(issueCommentService.updateComment(eq(11L), any())).thenReturn(comment);

        mockMvc.perform(post("/api/v1/issues/{id}/comments", 5)
                        .contentType(APPLICATION_JSON)
                        .content("{\"content\":\"Looks good\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(11));

        mockMvc.perform(get("/api/v1/issues/{id}/comments", 5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Looks good"));

        mockMvc.perform(put("/api/v1/issues/comments/{commentId}", 11)
                        .contentType(APPLICATION_JSON)
                        .content("{\"content\":\"Looks good\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/v1/issues/comments/{commentId}", 11))
                .andExpect(status().isNoContent());

        verify(issueCommentService).deleteComment(11L);
    }

    @Test
    void attachmentEndpointsUseExpectedPaths() throws Exception {
        IssueAttachmentDTO attachment = IssueAttachmentDTO.builder()
                .id(21L)
                .fileName("screen.png")
                .fileUrl("https://example.test/screen.png")
                .contentType("image/png")
                .fileSizeBytes(12L)
                .userId(3L)
                .createdAt(Instant.parse("2026-05-03T00:00:00Z"))
                .build();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "screen.png",
                "image/png",
                new byte[]{1, 2, 3}
        );

        when(issueAttachmentService.addAttachment(eq(5L), any())).thenReturn(attachment);
        when(issueAttachmentService.getAttachments(5L)).thenReturn(List.of(attachment));

        mockMvc.perform(multipart("/api/v1/issues/{id}/attachments", 5).file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("screen.png"));

        mockMvc.perform(get("/api/v1/issues/{id}/attachments", 5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(21));

        mockMvc.perform(delete("/api/v1/issues/attachments/{attachmentId}", 21))
                .andExpect(status().isNoContent());

        verify(issueAttachmentService).deleteAttachment(21L);
    }

    @Test
    void activityAndTagEndpointsUseExpectedPaths() throws Exception {
        IssueActivityDTO activity = IssueActivityDTO.builder()
                .id(31L)
                .action("Issue created")
                .performedBy(3L)
                .createdAt(Instant.parse("2026-05-03T00:00:00Z"))
                .build();
        IssueTagDTO tag = IssueTagDTO.builder().id(41L).name("frontend").build();

        when(issueActivityService.getActivities(5L)).thenReturn(List.of(activity));
        when(issueTagService.getAllTags()).thenReturn(List.of(tag));
        when(issueTagService.createTag(any())).thenReturn(tag);

        mockMvc.perform(get("/api/v1/issues/{id}/activities", 5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("Issue created"));

        mockMvc.perform(get("/api/v1/issues/tags"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("frontend"));

        mockMvc.perform(post("/api/v1/issues/tags")
                        .contentType(APPLICATION_JSON)
                        .content("{\"name\":\"frontend\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(41));
    }

    private IssueResponseDTO issue() {
        return IssueResponseDTO.builder()
                .id(5L)
                .projectId(7L)
                .assigneeId(9L)
                .createdById(3L)
                .title("Login button fails")
                .description("The submit action returns an error")
                .dueDate(LocalDate.parse("2026-05-10"))
                .isBlocked(false)
                .status("NEW")
                .type("BUG")
                .severity("NORMAL")
                .priority("MEDIUM")
                .comments(List.of())
                .attachments(List.of())
                .activities(List.of())
                .tags(Set.of())
                .watchers(Set.of())
                .build();
    }

    private String createIssueJson() {
        return """
                {
                  "assigneeId": 9,
                  "title": "Login button fails",
                  "description": "The submit action returns an error",
                  "dueDate": "2026-05-10",
                  "isBlocked": false,
                  "status": "NEW",
                  "type": "BUG",
                  "severity": "NORMAL",
                  "priority": "MEDIUM",
                  "tagIds": [],
                  "watcherIds": []
                }
                """;
    }
}
