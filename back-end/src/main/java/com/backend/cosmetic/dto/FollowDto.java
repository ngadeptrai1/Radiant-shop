package com.backend.cosmetic.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class FollowDto {
    private long userId;
    private long brandId;
}
