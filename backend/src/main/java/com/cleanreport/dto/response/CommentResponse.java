package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Comment response")
public class CommentResponse {

    private UUID id;
    private UUID reportId;
    private UUID authorId;
    private String authorName;
    private String authorAvatarUrl;
    private String content;

    @Schema(description = "True if the comment was made by an admin/moderator")
    private Boolean isModerator;

    private Instant createdAt;
}
