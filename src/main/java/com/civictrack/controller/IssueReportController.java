package com.civictrack.controller;

import com.civictrack.model.IssueComment;
import com.civictrack.model.IssueReport;
import com.civictrack.service.IssueReportService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class IssueReportController {
    private final IssueReportService service;

    public IssueReportController(IssueReportService service) {
        this.service = service;
    }

    @GetMapping
    public List<IssueReport> all(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String district) {
        return service.all(status, category, district);
    }

    @GetMapping("/analytics")
    public Map<String, Object> analytics() {
        return service.getAnalytics();
    }

    @GetMapping("/{id}")
    public IssueReport one(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IssueReport create(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String citizenName,
            @RequestParam(required = false) String citizenPhone,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) MultipartFile photo) throws IOException {
        return service.create(title, description, category, latitude, longitude, district, citizenName, citizenPhone, priority, photo);
    }

    public record StatusUpdateRequest(String status, String adminNote, String department, String priority, Integer estimatedDays) {}

    @PatchMapping("/{id}/status")
    public IssueReport status(@PathVariable Long id, @RequestBody StatusUpdateRequest body) {
        return service.updateStatus(id, body.status(), body.adminNote(), body.department(), body.priority(), body.estimatedDays());
    }

    @PostMapping("/{id}/upvote")
    public IssueReport upvote(@PathVariable Long id) {
        return service.upvote(id);
    }

    @GetMapping("/{id}/comments")
    public List<IssueComment> getComments(@PathVariable Long id) {
        return service.getComments(id);
    }

    public record CommentRequest(String authorName, String content, Boolean isOfficial) {}

    @PostMapping("/{id}/comments")
    public IssueComment addComment(@PathVariable Long id, @RequestBody CommentRequest body) {
        return service.addComment(id, body.authorName(), body.content(), Boolean.TRUE.equals(body.isOfficial()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(Map.of("message", "Report deleted successfully"));
    }
}
