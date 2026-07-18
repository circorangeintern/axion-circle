package com.cleanreport.controller;

import com.cleanreport.dto.request.CreateCommentRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.CommentResponse;
import com.cleanreport.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports/{reportId}/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Add, view, and delete comments on reports")
public class CommentController {

    private final CommentService commentService;

    @Operation(
            summary = "Add a comment to a report",
            description = """
                    Adds a comment to a report. Requires authentication.
                    Admin comments are automatically flagged with is_moderator = true.
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Parameter(description = "Report UUID") @PathVariable UUID reportId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {
        CommentResponse response = commentService.createComment(reportId, request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Comment added successfully"));
    }

    @Operation(
            summary = "Get all comments for a report",
            description = "Returns all comments on a report in chronological order (oldest first). **Public endpoint.**")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @Parameter(description = "Report UUID") @PathVariable UUID reportId) {
        List<CommentResponse> comments = commentService.getComments(reportId);
        return ResponseEntity.ok(ApiResponse.ok(comments));
    }

    @Operation(
            summary = "Delete a comment",
            description = "Delete a comment. Only the author or an admin can delete a comment.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @Parameter(description = "Report UUID") @PathVariable UUID reportId,
            @Parameter(description = "Comment UUID") @PathVariable UUID commentId,
            Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "Comment deleted successfully"));
    }
}
