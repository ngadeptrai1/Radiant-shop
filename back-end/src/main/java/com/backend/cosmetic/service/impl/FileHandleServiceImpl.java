package com.backend.cosmetic.service.impl;

import com.backend.cosmetic.model.ProductImage;
import com.backend.cosmetic.service.FileHandleService;
import com.cloudinary.Cloudinary;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class FileHandleServiceImpl implements FileHandleService {

//    private final Cloudinary cloudinary;
//
//
//    @Override
//    public void uploadCoudary(MultipartFile file , ProductImage image) throws IOException {
//        try {
//            Map data =  cloudinary.uploader().upload(file.getBytes(), Map.of());
//            String newFileName = (String) data.get("url");
//           image.setUrl(newFileName);
//        }catch (Exception ex){
//
//            throw new IOException("Failed to upload file "+ ex.getMessage());
//        }
//
//    }
//
//    @Override
//    public String uploadThumbnail(MultipartFile file) throws IOException {
//        String newFileName;
//        try {
//            Map data =  cloudinary.uploader().upload(file.getBytes(), Map.of());
//             newFileName = (String) data.get("url");
//        }catch (IOException ex){
//            throw new IOException("Failed to upload file");
//        }
//        return newFileName;
//    }
// Đường dẫn thư mục lưu trữ tệp cục bộ
private static final String UPLOAD_DIR = "uploads"; // Thư mục lưu tệp (cùng cấp với thư mục chạy ứng dụng)

    @Override
    public void uploadCoudary(MultipartFile file, ProductImage image) throws IOException {
        try {
            // Xác định đường dẫn lưu tệp
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);

            // Tạo thư mục nếu chưa tồn tại
            Files.createDirectories(filePath.getParent());

            // Lưu tệp vào thư mục cục bộ
            Files.write(filePath, file.getBytes());

            // Gán URL đầy đủ vào image
            String fileUrl = "http://localhost:8080/" + UPLOAD_DIR + "/" + fileName;
            image.setUrl(fileUrl);
        } catch (Exception ex) {
            throw new IOException("Failed to upload file: " + ex.getMessage());
        }
    }


    @Override
    public String uploadThumbnail(MultipartFile file) throws IOException {
        String fileUrl;
        try {
            // Xác định đường dẫn lưu tệp
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);

            // Tạo thư mục nếu chưa tồn tại
            Files.createDirectories(filePath.getParent());

            // Lưu tệp vào thư mục cục bộ
            Files.write(filePath, file.getBytes());

            // Tạo URL đầy đủ trả về
            fileUrl = "http://localhost:8080/" + UPLOAD_DIR + "/" + fileName;
        } catch (IOException ex) {
            throw new IOException("Failed to upload file: " + ex.getMessage());
        }
        return fileUrl;
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if(resource.exists()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException | FileNotFoundException ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}