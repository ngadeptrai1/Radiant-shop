package com.backend.cosmetic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class WishListDto {
    private long id;
    private long userId;
    private long productId;
    private LocalDateTime likeDate;
    private boolean active;
}
