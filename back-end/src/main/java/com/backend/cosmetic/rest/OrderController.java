package com.backend.cosmetic.rest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/orders")
public class OrderController {
    private final OrderService orderService;

    @GetMapping({"","/"})
    public ResponseEntity<?> getAll(@RequestParam("page") Optional<Integer> pageNum,
                                    @RequestParam("size") Optional<Integer> size,
                                    @RequestParam("sort")Optional<String> sort){
        Pageable page = PageRequest.of(pageNum.orElse(0),size.orElse(5), Sort.by(sort.orElse("id")).descending());
        try {
            return ResponseEntity.status(HttpStatus.OK).body(orderService.findAll(page));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/website")
    public ResponseEntity<?> createOrderInWeb(
            @RequestBody @Valid OrderDTO orderDTO ,
            BindingResult result ){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException(errs.isEmpty() ? "" : errs.get(0));
        }
        try {
//
            return ResponseEntity.status(HttpStatus.CREATED).body( orderService.createInWebsite(orderDTO));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PostMapping("/counter")
    public ResponseEntity<?> createOrderInCounter(
            @RequestBody @Valid OrderCounterDTO orderDTO ,
            BindingResult result ){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException(errs.isEmpty() ? "" : errs.get(0));
        }
        try {
//
            System.out.println(orderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrderInCounter(orderDTO));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable("id") Long id,
                                         @Valid @RequestBody OrderDTO orderDTO,
                                         BindingResult result){
        if(result.hasErrors()){
            List<String> errs = result.getFieldErrors().stream().map(FieldError:: getDefaultMessage).toList();
            throw new DataInvalidException(errs.isEmpty() ? "" : errs.get(0));
        }
        try {
            return ResponseEntity.status(HttpStatus.OK).body(orderService.update(orderDTO,id));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }
    @GetMapping("user/{id}")
    public ResponseEntity<?> findOrdersByUser(@PathVariable("id") Long id,
                                              @RequestParam("page") Optional<Integer> pageNum,
                                              @RequestParam("size") Optional<Integer> size,
                                              @RequestParam("sort")Optional<String> sort) {
        try {
            Pageable page = PageRequest.of(pageNum.orElse(0),size.orElse(5),Sort.by(sort.orElse("id")).descending());
            return  ResponseEntity.status(HttpStatus.OK).body(orderService.findByUserId(id,page));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> findOrdersById(@PathVariable("id") Long id) {
        try {
            return  ResponseEntity.status(HttpStatus.OK).body(orderService.findById(id));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable("id") Long id){
        try {
            return  ResponseEntity.status(HttpStatus.OK).body(orderService.delete(id));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(
            @PathVariable String status,
            @RequestParam("page") Optional<Integer> pageNum,
            @RequestParam("size") Optional<Integer> size) {
        try {
            Pageable page = PageRequest.of(pageNum.orElse(0), size.orElse(5));
            return ResponseEntity.ok(orderService.findOrdersByStatus(status, page));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<?> getOrdersByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate,
            @RequestParam("page") Optional<Integer> pageNum,
            @RequestParam("size") Optional<Integer> size) {
        try {
            Pageable page = PageRequest.of(pageNum.orElse(0), size.orElse(5));
            return ResponseEntity.ok(orderService.findOrdersByDateRange(startDate, endDate, page));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable("id") Long orderId,
            @RequestParam String paymentStatus) {
        try {
            return ResponseEntity.ok(orderService.updatePaymentStatus(orderId, paymentStatus));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getOrderStatistics(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {
            return ResponseEntity.ok(orderService.getOrderStatistics(startDate, endDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable("id") Long orderId,
            @RequestParam String reason) {
        try {
            return ResponseEntity.ok(orderService.cancelOrder(orderId, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
