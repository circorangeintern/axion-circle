package com.cleanreport.service;

import com.cleanreport.dto.request.CreateCommentRequest;
import com.cleanreport.dto.response.CommentResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.exception.UnauthorizedException;
import com.cleanreport.model.entity.Comment;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.CommentRepository;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Add a comment to a report. is_moderator flag auto-set based on user role.
     */
    @Transactional
    public CommentResponse createComment(UUID reportId, CreateCommentRequest request, String userEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        boolean isModerator = author.getRole() == UserRole.ADMIN;

        Comment comment = Comment.builder()
                .report(report)
                .author(author)
                .content(request.getContent().trim())
                .isModerator(isModerator)
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("Comment added to report {} by {} (moderator: {})", reportId, userEmail, isModerator);

        // Notify report owner (if commenter is not the owner)
        if (!report.getReporter().getId().equals(author.getId())) {
            String title = "New comment on " + report.getReferenceNumber();
            String message = author.getDisplayName() + " commented: " + 
                    request.getContent().substring(0, Math.min(50, request.getContent().length())) +
                    (request.getContent().length() > 50 ? "..." : "");
            notificationService.createNotification(report.getReporter(), report, "COMMENT_ADDED", title, message);
        }

        return mapToResponse(saved);
    }

    /**
     * Get all comments for a report, oldest first (chronological).
     */
    public List<CommentResponse> getComments(UUID reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new ResourceNotFoundException("Report not found: " + reportId);
        }
        return commentRepository.findByReportIdOrderByCreatedAtAsc(reportId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Delete a comment. Only the author or an admin can delete.
     */
    @Transactional
    public void deleteComment(UUID commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == UserRole.ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted by {}", commentId, userEmail);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .reportId(comment.getReport().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getDisplayName())
                .authorAvatarUrl(comment.getAuthor().getAvatarUrl())
                .content(comment.getContent())
                .isModerator(comment.getIsModerator())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
