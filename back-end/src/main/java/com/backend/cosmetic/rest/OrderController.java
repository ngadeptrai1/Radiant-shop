package com.backend.cosmetic.rest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.backend.cosmetic.dto.OrderDetailDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.repository.OrderDetailRepository;
import com.backend.cosmetic.response.OrderResponse;
import com.backend.cosmetic.service.OrderDetailService;
import com.backend.cosmetic.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/orders")
public class OrderController {
    private final OrderService orderService;
    private final OrderDetailService orderDetailService;
    private final OrderDetailRepository orderDetailRepository;
    @Autowired
    ObjectMapper objectMapper;

    @GetMapping({"","/"})
    public ResponseEntity<?> getAll(){

        try {
            return ResponseEntity.status(HttpStatus.OK).body(orderService.findAll());
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
    public ResponseEntity<?> findOrdersByUser(@PathVariable("id") Long id){
        try {
            return  ResponseEntity.status(HttpStatus.OK).body(orderService.findByUserId(id));
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findOrderById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(orderService.findById(id));
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
            @PathVariable String status, @RequestParam("startDate") Optional<LocalDateTime> startDate, @RequestParam("endDate") Optional<LocalDateTime> endDate) {
        try {
            System.out.println(startDate);
            System.out.println(endDate);
            return ResponseEntity.ok(orderService.findAllByStatusAndCreatedDateBetween(status, startDate.orElse(null), endDate.orElse(null)));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<?> getOrdersByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {

            return ResponseEntity.ok(orderService.findOrdersByDateRange(startDate, endDate));
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
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable("id") Long orderId, @RequestParam String status){
        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }

    @GetMapping("/order-details/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable("id") Long orderId){
        return ResponseEntity.ok(orderDetailRepository.findByOrderId(orderId));
    }
    

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmOrder(@PathVariable("id") Long orderId){
        return ResponseEntity.ok(orderService.confirmOrder(orderId));
    }
    @GetMapping("/status-statistics")
    public ResponseEntity<Map<String, Long>> getOrderStatusStatistics() {
        Map<String, Long> statistics = orderService.getOrderStatusStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/get-order-by-email")
    public ResponseEntity<?> getOrderByEmail(@RequestParam String email) {
        return ResponseEntity.ok(orderService.getOrderByEmail(email));
    }

    @PostMapping("/{id}/order-details")
    public ResponseEntity<?> addOrderDetail(@PathVariable("id") Long orderId, @RequestBody OrderDetailDTO orderDetailDTO) {
        return ResponseEntity.ok(orderDetailService.addOrderDetail(orderId, orderDetailDTO));
    }

    @PutMapping("/details/{id}")
    public ResponseEntity<?> updateOrderDetail(@PathVariable("id") Long orderDetailId, @RequestParam("quantity") int quantity) {
        return ResponseEntity.ok(orderDetailService.updateOrderDetail(orderDetailId, quantity));
    }

    @DeleteMapping("/details/{id}")
    public ResponseEntity<?> deleteOrderDetail(@PathVariable("id") Long orderDetailId) {
        orderDetailService.deleteOrderDetail(orderDetailId);
        return ResponseEntity.noContent().build();
    }
}
