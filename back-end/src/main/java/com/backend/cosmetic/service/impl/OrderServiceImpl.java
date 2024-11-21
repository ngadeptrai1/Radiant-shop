package com.backend.cosmetic.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.dto.OrderDetailDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.model.OrderDetail;
import com.backend.cosmetic.model.OrderStatus;
import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.model.User;
import com.backend.cosmetic.model.Voucher;
import com.backend.cosmetic.repository.OrderDetailRepository;
import com.backend.cosmetic.repository.OrderRepository;
import com.backend.cosmetic.repository.ProductDetailRepository;
import com.backend.cosmetic.repository.UserRepository;
import com.backend.cosmetic.response.OrderResponse;
import com.backend.cosmetic.service.OrderService;
import com.backend.cosmetic.service.VoucherService;
import com.cloudinary.utils.StringUtils;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    private final UserRepository userRepo;

    private final VoucherService voucherService;

    private final ProductDetailRepository productDetailRepo;

    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<OrderResponse> findAll(Pageable request) {
       return   orderRepository.findAll(request).getContent().stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class, Exception.class})
    public OrderResponse createInWebsite(OrderDTO orderDTO) {
        // Validate input
        validateOrderInput(orderDTO);
        
        // Build order
        Order order = buildInitialOrder(orderDTO);
        
        // Set user if provided
        setOrderUser(order, orderDTO.getUserId());
        
        // Save initial order
        order = orderRepository.save(order);
        
        // Process order details
        List<OrderDetail> orderDetails = processOrderDetails(order, orderDTO.getOrderDetails());
        order.setOrderDetails(orderDetails);
        
        // Calculate totals
        calculateOrderTotals(order);
        
        // Apply voucher if provided
        applyVoucherIfPresent(order, orderDTO.getVoucherCode());
        
        // Set additional fields
        order.setType(OrderStatus.TYPE_ONLINE);
        order.setPaymentStatus(OrderStatus.PAYMENT_PENDING);
        
        // Save final order
        order = orderRepository.save(order);
        
        // TODO: Send confirmation email
        
        return OrderResponse.fromOrder(order);
    }

    @Override
    @Transactional(rollbackFor = {DataNotFoundException.class, Exception.class})
    public OrderResponse createOrderInCounter(OrderCounterDTO orderDTO) {
        // Validate input
        validateCounterOrderInput(orderDTO);
        
        // Build order
        Order order = buildInitialCounterOrder(orderDTO);
        
        // Set user if provided
        setOrderUser(order, orderDTO.getUserId());
        
        // Save initial order
        order = orderRepository.save(order);
        
        // Process order details
        List<OrderDetail> orderDetails = processOrderDetails(order, orderDTO.getOrderDetails());
        order.setOrderDetails(orderDetails);
        
        // Calculate totals
        calculateOrderTotals(order);
        
        // Apply voucher if present
        applyVoucherIfPresent(order, orderDTO.getVoucherCode());
        
        // Set counter specific fields
        order.setType(OrderStatus.TYPE_COUNTER);
        order.setStatus(OrderStatus.SUCCESS);
        order.setPaymentStatus(OrderStatus.PAYMENT_SUCCESS);
        
        // Save final order
        return OrderResponse.fromOrder(orderRepository.save(order));
    }

    // Helper methods
    private void validateOrderInput(OrderDTO orderDTO) {
        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            throw new DataInvalidException("Order must have at least one product");
        }
        
        if (StringUtils.isBlank(orderDTO.getFullName())) {
            throw new DataInvalidException("Full name is required");
        }
        
        if (StringUtils.isBlank(orderDTO.getPhoneNumber())) {
            throw new DataInvalidException("Phone number is required");
        }
        
        if (StringUtils.isBlank(orderDTO.getAddress())) {
            throw new DataInvalidException("Address is required");
        }
    }

    private void validateCounterOrderInput(OrderCounterDTO orderDTO) {
        if (orderDTO.getOrderDetails() == null || orderDTO.getOrderDetails().isEmpty()) {
            throw new DataInvalidException("Order must have at least one product");
        }
        
        if (StringUtils.isBlank(orderDTO.getFullName())) {
            throw new DataInvalidException("Full name is required");
        }
        
        if (StringUtils.isBlank(orderDTO.getPhoneNumber())) {
            throw new DataInvalidException("Phone number is required");
        }
    }

    private Order buildInitialOrder(OrderDTO orderDTO) {
        return Order.builder()
                .email(orderDTO.getEmail())
                .address(orderDTO.getAddress())
                .fullName(orderDTO.getFullName())
                .paymentMethod(orderDTO.getPaymentMethod())
                .note(orderDTO.getNote())
                .status(OrderStatus.PENDING)
                .phoneNumber(orderDTO.getPhoneNumber())
                .shippingCost(orderDTO.getShippingCost())
                .build();
    }

    private Order buildInitialCounterOrder(OrderCounterDTO orderDTO) {
        return Order.builder()
                .fullName(orderDTO.getFullName())
                .phoneNumber(orderDTO.getPhoneNumber())
                .paymentMethod(orderDTO.getPaymentMethod())
                .note(orderDTO.getNote())
                .status(OrderStatus.PENDING)
                .build();
    }

    private void setOrderUser(Order order, Long userId) {
        if (userId != null && userId > 0) {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new DataNotFoundException("User not found"));
            order.setUser(user);
        }
    }

    private List<OrderDetail> processOrderDetails(Order order, List<OrderDetailDTO> detailDTOs) {
        return detailDTOs.stream()
                .map(detail -> createOrderDetail(order, detail))
                .collect(Collectors.toList());
    }

    private OrderDetail createOrderDetail(Order order, OrderDetailDTO detail) {
        ProductDetail productDetail = productDetailRepo.findById(detail.getProductDetailId())
                .orElseThrow(() -> new DataNotFoundException("Product detail not found"));
                
        // Validate stock
        if (productDetail.getQuantity() < detail.getQuantity()) {
            throw new DataInvalidException("Insufficient stock for product: " + productDetail.getId());
        }
        
        // Update stock
        productDetail.setQuantity(productDetail.getQuantity() - detail.getQuantity());
        productDetailRepo.save(productDetail);
        
        return OrderDetail.builder()
                .order(order)
                .quantity(detail.getQuantity())
                .productDetail(productDetail)
                .price(productDetail.getSalePrice())
                .build();
    }

    private void calculateOrderTotals(Order order) {
        long totalAmount = order.getOrderDetails().stream()
                .mapToLong(detail -> detail.getPrice() * detail.getQuantity())
                .sum();
                
        order.setTotalOrderAmount(totalAmount);
        order.setTotalItems(order.getOrderDetails().size());
        order.setFinalAmount(totalAmount + order.getShippingCost());
    }

    private void applyVoucherIfPresent(Order order, String voucherCode) {
        if (StringUtils.isNotBlank(voucherCode)) {
            Voucher voucher = voucherService.getByCode(voucherCode);
            order.setVoucher(voucher);
            long voucherAmount = voucherService.approveVoucher(voucherCode, order.getTotalOrderAmount());
            order.setVoucherAmount(voucherAmount);
            order.setFinalAmount(order.getFinalAmount() - voucherAmount);
        }
    }

    @Override
    public OrderResponse findById(Long id) {
        return OrderResponse.fromOrder(orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order ")));
    }

    @Override
    public OrderResponse update(OrderDTO orderdto, long id) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(orderdto.getStatus());
        order.setEmail(orderdto.getEmail());
        order.setAddress(orderdto.getAddress());
        order.setFullName(orderdto.getFullName());
        order.setNote(orderdto.getNote());
        order.setPhoneNumber(orderdto.getPhoneNumber());
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);
    }

    @Override
    public List<OrderResponse> findByUserId(Long id, Pageable request) {
        return   orderRepository.findAllByUserId(id,request).getContent().stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    @Override
    public OrderResponse changeStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(status);
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);    }

    @Override
    public OrderResponse delete(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        return OrderResponse.fromOrder(order);
    }

    @Override
    public List<OrderResponse> findOrdersByStatus(String status, Pageable pageable) {
        // Validate status
        if (!isValidStatus(status)) {
            throw new DataInvalidException("Invalid order status: " + status);
        }
        
        return orderRepository.findAllByStatus(status, pageable).getContent().stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    // Thêm helper method để validate status
    private boolean isValidStatus(String status) {
        return status != null && (
            status.equalsIgnoreCase(OrderStatus.PENDING) ||
            status.equalsIgnoreCase(OrderStatus.PROCESSING) ||
            status.equalsIgnoreCase(OrderStatus.SHIPPED) ||
            status.equalsIgnoreCase(OrderStatus.DELIVERED) ||
            status.equalsIgnoreCase(OrderStatus.CANCELLED) ||
            status.equalsIgnoreCase(OrderStatus.SUCCESS) ||
            status.equalsIgnoreCase(OrderStatus.PAYMENT_PENDING) ||
            status.equalsIgnoreCase(OrderStatus.PAYMENT_SUCCESS) ||
            status.equalsIgnoreCase(OrderStatus.PAYMENT_FAILED)
        );
    }

    @Override
    public List<OrderResponse> findOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return orderRepository.findByCreatedDateBetween(startDate, endDate,pageable).stream()
                .map(OrderResponse::fromOrder)
                .toList();
    }

    @Override
    public OrderResponse updatePaymentStatus(Long orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
        order.setPaymentStatus(paymentStatus);
        return OrderResponse.fromOrder(orderRepository.save(order));
    }

    @Override
    public Map<String, Object> getOrderStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findByCreatedDateBetween(startDate, endDate);
        
        long totalOrders = orders.size();
        long totalRevenue = orders.stream()
                .filter(o -> o.getStatus().equals(OrderStatus.SUCCESS))
                .mapToLong(Order::getFinalAmount)
                .sum();
        long successfulOrders = orders.stream()
                .filter(o -> o.getStatus().equals(OrderStatus.SUCCESS))
                .count();
        
        return Map.of(
            "totalOrders", totalOrders,
            "totalRevenue", totalRevenue,
            "successfulOrders", successfulOrders
        );
    }

    @Override
    @Transactional
    public boolean cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
                
        if (order.getStatus().equals(OrderStatus.SUCCESS)) {
            throw new DataInvalidException("Cannot cancel completed order");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setNote(reason);
        orderRepository.save(order);
        
        // Restore product quantities
        for (OrderDetail detail : order.getOrderDetails()) {
            ProductDetail productDetail = detail.getProductDetail();
            productDetail.setQuantity(productDetail.getQuantity() + detail.getQuantity());
            productDetailRepo.save(productDetail);
        }
        
        return true;
    }




}
