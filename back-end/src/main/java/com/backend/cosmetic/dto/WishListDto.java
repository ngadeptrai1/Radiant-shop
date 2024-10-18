package com.backend.cosmetic.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class WishListDto {
    private long userId;
    private long productId;
}
