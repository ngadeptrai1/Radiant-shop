package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.model.ProductImage;
import com.backend.cosmetic.service.FileHandleService;
import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class FileHandleServiceImpl implements FileHandleService {

    private final Cloudinary cloudinary;


    @Override
    public void uploadCoudary(MultipartFile file , ProductImage image) throws IOException {
        try {
            Map data =  cloudinary.uploader().upload(file.getBytes(), Map.of());
            String newFileName = (String) data.get("url");
           image.setUrl(newFileName);
        }catch (Exception ex){

            throw new IOException("Failed to upload file "+ ex.getMessage());
        }

    }

    @Override
    public String uploadThumbnail(MultipartFile file) throws IOException {
        String newFileName;
        try {
            Map data =  cloudinary.uploader().upload(file.getBytes(), Map.of());
             newFileName = (String) data.get("url");
        }catch (IOException ex){
            throw new IOException("Failed to upload file");
        }
        return newFileName;
    }

}