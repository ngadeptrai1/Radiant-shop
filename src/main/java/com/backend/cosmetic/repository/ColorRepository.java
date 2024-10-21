package com.backend.cosmetic.repository;
import com.backend.cosmetic.model.Color;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ColorRepository extends JpaRepository<Color,Integer> {

}
