package com.example.proman.issue.domain.Controllers;

import com.example.proman.issue.domain.Dto.*;
import com.example.proman.issue.domain.Service.IssueService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/issues")
@RequiredArgsConstructor
public class IssueController {

    private final IssueService issueService;

    // CREATE ISSUE
    @PostMapping
    public ResponseEntity<IssueResponseDTO> createIssue(
            @Valid @RequestBody IssueRequestDTO requestDTO) {

        IssueResponseDTO response = issueService.createIssue(requestDTO);
        return ResponseEntity.ok(response);
    }

    // GET ISSUE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<IssueResponseDTO> getIssueById(
            @PathVariable Long id) {

        IssueResponseDTO response = issueService.getIssueById(id);
        return ResponseEntity.ok(response);
    }

    //  GET ALL ISSUES
    @GetMapping
    public ResponseEntity<List<IssueResponseDTO>> getAllIssues() {

        List<IssueResponseDTO> response = issueService.getAllIssues();
        return ResponseEntity.ok(response);
    }

    //  UPDATE ISSUE
    @PutMapping("/{id}")
    public ResponseEntity<IssueResponseDTO> updateIssue(
            @PathVariable Long id,
            @Valid @RequestBody IssueUpdateDTO updateDTO) {
        IssueResponseDTO response = issueService.updateIssue(id, updateDTO);
        return ResponseEntity.ok(response);
    }

    //  DELETE ISSUE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteIssue(
            @PathVariable Long id) {

        issueService.deleteIssue(id);
        return ResponseEntity.ok("Issue deleted successfully");
    }
}