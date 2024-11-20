package com.backend.cosmetic.rest;

import com.backend.cosmetic.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {
    @Autowired
    private ExportService exportService;

    @GetMapping("/sql/{tableName}")
    public ResponseEntity<String> exportToSQL(@PathVariable String tableName) {
        try {
            String outputPath = "export_" + tableName + ".sql";
            exportService.exportToSQLInsert(tableName, outputPath);
            return ResponseEntity.ok("SQL Insert script exported successfully to " + outputPath);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error exporting data: " + e.getMessage());
        }
    }
}