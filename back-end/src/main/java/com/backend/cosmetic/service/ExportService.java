package com.backend.cosmetic.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.FileWriter;
import java.io.IOException;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.Date;
import java.util.stream.Collectors;

@Service
public class ExportService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void exportToSQLInsert(String tableName, String outputPath) throws IOException {
        try (FileWriter writer = new FileWriter(outputPath)) {
            // Lấy thông tin về các cột
            List<ColumnMetadata> columnMetadatas = getColumnMetadata(tableName);

            // Viết comment header
            writer.write("-- Script generated for table: " + tableName + "\n");
            writer.write("-- Generated on: " + new Date() + "\n\n");

            // Tạo câu query để lấy dữ liệu
            String query = "SELECT * FROM " + tableName + " order by id";

            // Sử dụng RowMapper để xử lý từng dòng
            List<Map<String, Object>> results = jdbcTemplate.queryForList(query);

            for (Map<String, Object> row : results) {
                StringBuilder insert = new StringBuilder();
                insert.append("INSERT INTO ")
                        .append(tableName)
                        .append(" (")
                        .append(columnMetadatas.stream()
                                .map(ColumnMetadata::getName)
                                .collect(Collectors.joining(", ")))
                        .append(") VALUES (");

                // Xử lý từng cột
                for (int i = 0; i < columnMetadatas.size(); i++) {
                    if (i > 0) {
                        insert.append(", ");
                    }

                    ColumnMetadata columnMetadata = columnMetadatas.get(i);
                    Object value = row.get(columnMetadata.getName());

                    insert.append(formatValue(value, columnMetadata.getType()));
                }

                insert.append(");\n");
                writer.write(insert.toString());
            }

            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Error exporting data: " + e.getMessage(), e);
        }
    }

    private List<ColumnMetadata> getColumnMetadata(String tableName) throws SQLException {
        List<ColumnMetadata> columns = new ArrayList<>();

        try (Connection conn = jdbcTemplate.getDataSource().getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet columnSet = metaData.getColumns(null, null, tableName, null);

            while (columnSet.next()) {
                columns.add(new ColumnMetadata(
                        columnSet.getString("COLUMN_NAME"),
                        columnSet.getInt("DATA_TYPE")
                ));
            }
        }

        return columns;
    }

    private String formatValue(Object value, int columnType) {
        if (value == null) {
            return "NULL";
        }

        switch (columnType) {
            case Types.VARCHAR:
            case Types.CHAR:
            case Types.LONGVARCHAR:
            case Types.NVARCHAR:
            case Types.NCHAR:
            case Types.CLOB:
                return "'" + value.toString().replace("'", "''") + "'";

            case Types.DATE:
                return "'" + new SimpleDateFormat("yyyy-MM-dd").format(value) + "'";

            case Types.TIMESTAMP:
                return "'" + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(value) + "'";

            case Types.BOOLEAN:
                return value.toString();

            case Types.INTEGER:
            case Types.BIGINT:
            case Types.DECIMAL:
            case Types.DOUBLE:
            case Types.FLOAT:
            case Types.NUMERIC:
                return value.toString();

            case Types.OTHER:
                // Xử lý JSON
                return "'" + value.toString().replace("'", "''") + "'::jsonb";

            default:
                return "'" + value.toString().replace("'", "''") + "'";
        }
    }

    // Inner class để lưu metadata của cột
    private static class ColumnMetadata {
        private final String name;
        private final int type;

        public ColumnMetadata(String name, int type) {
            this.name = name;
            this.type = type;
        }

        public String getName() {
            return name;
        }

        public int getType() {
            return type;
        }
    }
}