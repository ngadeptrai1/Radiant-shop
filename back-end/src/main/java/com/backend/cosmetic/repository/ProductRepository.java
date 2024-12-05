package com.backend.cosmetic.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.dto.ProductProjection;
import com.backend.cosmetic.model.Product;
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
    List<Product> findByNameContainingIgnoreCase(String name);
//
@Query("SELECT p FROM Product p WHERE p.category.id = :categoryId OR p.category.parentCategory.id = :categoryId")
Page<Product> findProductsByCategoryAndSubcategories(@Param("categoryId") Integer categoryId,
                                                     Pageable pageable);
//  Long getId();
//     String getName();
//     String getDescription();
//     boolean isActivate();
//     String getThumbnail();
//     String getCategory();
//     String getBrand();
    //qiantity
   @Query(nativeQuery = true, value = "select p.id, p.name ,\n" +
           "       p.description, p.active as  activate , p.thumbnail, c.name as Category, b.name as Brand , sum(pd.quantity) as quantity from Products p\n" +
           "join Categories c on c.id = p.category_id\n" +
           "join Brands b on b.id = p.brand_id   join Product_Details pd on pd.product_id = p.id\n" +
           "group by p.id, p.name, p.description, p.active, p.thumbnail, c.name, b.name ")
   List<ProductProjection> findAllProjected();

@Query("SELECT c.name as categoryName, " +
       "COUNT(p) as productCount, " +
       "COUNT(p) * 100.0 / (SELECT COUNT(p2) FROM Product p2) as percentage " +
       "FROM Product p " +
       "JOIN p.category c " +
       "GROUP BY c.name")
List<Object[]> getProductDistribution();

@Query("SELECT p.id, p.name, p.thumbnail, " +
       "SUM(od.quantity) as soldQuantity, " +
       "SUM(od.quantity * od.price) as revenue, " +
       "c.name as category, " +
       "CASE WHEN SUM(pd.quantity) > 0 THEN true ELSE false END as inStock " +
       "FROM Product p " +
       "JOIN p.category c " +
       "JOIN ProductDetail pd ON pd.product = p " +
       "JOIN OrderDetail od ON od.productDetail = pd " +
       "JOIN Order o ON od.order = o " +
       "WHERE o.status = 'SUCCESS' " +
       "GROUP BY p.id, p.name, p.thumbnail, c.name " +
       "ORDER BY soldQuantity DESC")
List<Object[]> getTopSellingProducts(Pageable pageable);

}
