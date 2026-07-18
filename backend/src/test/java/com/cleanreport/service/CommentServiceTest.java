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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    private static final UUID TEST_REPORT_ID = UUID.randomUUID();
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_ADMIN_ID = UUID.randomUUID();
    private static final UUID TEST_COMMENT_ID = UUID.randomUUID();
    private static final String TEST_USER_EMAIL = "user@test.com";
    private static final String TEST_ADMIN_EMAIL = "admin@test.com";

    @Mock private CommentRepository commentRepository;
    @Mock private ReportRepository reportRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private CommentService commentService;

    private User testUser;
    private User testAdmin;
    private Report testReport;
    private Comment testComment;

    @BeforeEach
    void setUp() {
        testUser = User.builder().id(TEST_USER_ID).email(TEST_USER_EMAIL)
                .displayName("Test User").role(UserRole.REPORTER).build();
        testAdmin = User.builder().id(TEST_ADMIN_ID).email(TEST_ADMIN_EMAIL)
                .displayName("Admin").role(UserRole.ADMIN).build();
        testReport = Report.builder().id(TEST_REPORT_ID).referenceNumber("CR-00001").build();
        testComment = Comment.builder().id(TEST_COMMENT_ID).report(testReport)
                .author(testUser).content("Test comment").isModerator(false)
                .createdAt(Instant.now()).build();
    }

    @Test
    @DisplayName("createComment - reporter user - isModerator is false")
    void createComment_reporter_isNotModerator() {
        CreateCommentRequest request = new CreateCommentRequest("Nice fix!");
        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(Optional.of(testUser));
        when(commentRepository.save(any(Comment.class))).thenReturn(testComment);

        CommentResponse response = commentService.createComment(TEST_REPORT_ID, request, TEST_USER_EMAIL);

        assertThat(response.getIsModerator()).isFalse();
        assertThat(response.getAuthorName()).isEqualTo("Test User");
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("createComment - admin user - isModerator is true")
    void createComment_admin_isModerator() {
        Comment adminComment = Comment.builder().id(UUID.randomUUID()).report(testReport)
                .author(testAdmin).content("Dispatch sent").isModerator(true)
                .createdAt(Instant.now()).build();
        CreateCommentRequest request = new CreateCommentRequest("Dispatch sent");
        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.of(testReport));
        when(userRepository.findByEmail(TEST_ADMIN_EMAIL)).thenReturn(Optional.of(testAdmin));
        when(commentRepository.save(any(Comment.class))).thenReturn(adminComment);

        CommentResponse response = commentService.createComment(TEST_REPORT_ID, request, TEST_ADMIN_EMAIL);

        assertThat(response.getIsModerator()).isTrue();
    }

    @Test
    @DisplayName("createComment - report not found - throws")
    void createComment_reportNotFound_throws() {
        when(reportRepository.findById(TEST_REPORT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.createComment(TEST_REPORT_ID, new CreateCommentRequest("hi"), TEST_USER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Report not found");
    }

    @Test
    @DisplayName("getComments - returns chronological list")
    void getComments_returnsList() {
        when(reportRepository.existsById(TEST_REPORT_ID)).thenReturn(true);
        when(commentRepository.findByReportIdOrderByCreatedAtAsc(TEST_REPORT_ID)).thenReturn(List.of(testComment));

        List<CommentResponse> result = commentService.getComments(TEST_REPORT_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("Test comment");
    }

    @Test
    @DisplayName("getComments - report not found - throws")
    void getComments_reportNotFound_throws() {
        when(reportRepository.existsById(TEST_REPORT_ID)).thenReturn(false);

        assertThatThrownBy(() -> commentService.getComments(TEST_REPORT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("deleteComment - author can delete own comment")
    void deleteComment_authorCanDelete() {
        when(commentRepository.findById(TEST_COMMENT_ID)).thenReturn(Optional.of(testComment));
        when(userRepository.findByEmail(TEST_USER_EMAIL)).thenReturn(Optional.of(testUser));

        commentService.deleteComment(TEST_COMMENT_ID, TEST_USER_EMAIL);

        verify(commentRepository).delete(testComment);
    }

    @Test
    @DisplayName("deleteComment - admin can delete any comment")
    void deleteComment_adminCanDeleteAny() {
        when(commentRepository.findById(TEST_COMMENT_ID)).thenReturn(Optional.of(testComment));
        when(userRepository.findByEmail(TEST_ADMIN_EMAIL)).thenReturn(Optional.of(testAdmin));

        commentService.deleteComment(TEST_COMMENT_ID, TEST_ADMIN_EMAIL);

        verify(commentRepository).delete(testComment);
    }

    @Test
    @DisplayName("deleteComment - non-author non-admin - throws Unauthorized")
    void deleteComment_otherUser_throws() {
        User otherUser = User.builder().id(UUID.randomUUID()).email("other@test.com")
                .displayName("Other").role(UserRole.REPORTER).build();
        when(commentRepository.findById(TEST_COMMENT_ID)).thenReturn(Optional.of(testComment));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> commentService.deleteComment(TEST_COMMENT_ID, "other@test.com"))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("only delete your own");

        verify(commentRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteComment - comment not found - throws")
    void deleteComment_notFound_throws() {
        when(commentRepository.findById(TEST_COMMENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.deleteComment(TEST_COMMENT_ID, TEST_USER_EMAIL))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
