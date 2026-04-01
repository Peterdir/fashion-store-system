package org.example.fashionstoresystem.dto.response;

import lombok.*;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String type;
    private boolean isRead;
    private Long relatedId;
    private Date createdAt;
}
