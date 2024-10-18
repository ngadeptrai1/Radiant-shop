package com.backend.cosmetic.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudaryConfig {
    private final String API_KEY = "984239338132695";
    private final String CLOUD_NAME = "dvyx6ldqz";
    private final String API_SECRET = "A6hbb_nG5RiHq4_vJptIhpoIKk8";
    @Bean
    public Cloudinary cloudinary(){
        Map map = new HashMap<>();
        map.put("cloud_name", CLOUD_NAME);
        map.put("api_key", API_KEY);
        map.put("api_secret", API_SECRET);
        map.put("secure", true);
        return new Cloudinary(map);
    }
}
