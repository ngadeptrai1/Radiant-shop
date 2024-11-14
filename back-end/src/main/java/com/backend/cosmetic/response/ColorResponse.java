package com.backend.cosmetic.response;

import com.backend.cosmetic.model.Color;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ColorResponse {
    private Integer id;
    private String hexCode;
    private String name;
    private boolean active;

    public static ColorResponse fromColor(Color color) {
        return ColorResponse.builder()
                .id(color.getId())
                .name(color.getName())
                .active(color.isActive())
                .hexCode(color.getHexCode())
                .build();
    }
}
