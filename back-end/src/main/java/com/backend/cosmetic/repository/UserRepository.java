package com.backend.cosmetic.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.backend.cosmetic.dto.UserProjection;
import com.backend.cosmetic.model.RoleType;
import com.backend.cosmetic.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhoneNum(String phoneNum);
    boolean existsByUsername(String userName);
    Optional<User> findByProviderId(String providerId) ;

    @Query("SELECT u FROM User u WHERE " +
           "(:phone IS NULL OR u.phoneNum LIKE %:phone%) AND " +
           "(:name IS NULL OR LOWER(u.fullName) LIKE LOWER(concat('%', :name, '%'))) AND " +
           "u.provider = 'WALK_IN'")
    Page<User> searchCustomers(
        @Param("phone") String phone,
        @Param("name") String name,
        Pageable pageable
    );
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
    List<User> findByRole(@Param("roleName") RoleType roleName);

    List<User> findByPhoneNumContaining(String phone);

    List<User> findByFullNameContainingIgnoreCase(String name);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name IN :roleNames")
    List<User> findByRoles(@Param("roleNames") List<RoleType> roleNames);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'STAFF' or r.name='ADMIN' AND " +
           "(:username IS NULL OR u.username LIKE %:username%) AND " +
           "(:email IS NULL OR u.email LIKE %:email%) AND " +
           "(:phone IS NULL OR u.phoneNum LIKE %:phone%)")
    List<User> searchStaff(
        @Param("username") String username,
        @Param("email") String email, 
        @Param("phone") String phone
    );

        @Query(nativeQuery = true, value = "SELECT u.id, u.username as userName, u.email, u.full_name as fullName,\n" +
                "       u.phone_num as phoneNumber,  u.blocked, u.enabled , r.role_name as roles,\n" +
                "       u.created_date, u.created_date FROM users u\n" +
                "           JOIN User_roles ur ON u.id = ur.user_id\n" +
                "           join Roles r on ur.role_id = r.id\n" +
                "WHERE r.role_name = 'CUSTOMER' AND u.active = true and u.enabled = true and u.blocked = false")
    List<UserProjection> findAllCustomers();

    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByPhoneNumAndIdNot(String phoneNumber, Long id);
    boolean existsByUsernameAndIdNot(String userName, Long id);
}
