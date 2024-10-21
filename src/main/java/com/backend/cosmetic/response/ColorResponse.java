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


    public static ColorResponse fromColor(Color color) {
        return ColorResponse.builder()
                .id(color.getId())
                .hexCode(color.getHexCode())
                .build();
    }
}
