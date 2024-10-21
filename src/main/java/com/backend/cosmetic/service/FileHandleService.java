package com.backend.cosmetic.service;

import com.backend.cosmetic.model.ProductImage;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public interface FileHandleService {
    void uploadCoudary(MultipartFile file, ProductImage image) throws IOException;
    String uploadThumbnail(MultipartFile file) throws IOException;
}
