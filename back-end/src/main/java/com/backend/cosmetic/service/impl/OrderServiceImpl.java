package com.backend.cosmetic.service.impl;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.backend.cosmetic.dto.OrderCounterDTO;
import com.backend.cosmetic.dto.OrderDTO;
import com.backend.cosmetic.dto.OrderDetailDTO;
import com.backend.cosmetic.exception.DataInvalidException;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.mapper.OrderMapper;
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
import com.backend.cosmetic.response.OrderDetailResponse;
import com.backend.cosmetic.response.OrderResponse;
import com.backend.cosmetic.service.EmailService;
import com.backend.cosmetic.service.OrderService;
import com.backend.cosmetic.service.VoucherService;
import com.backend.cosmetic.specification.OrderSpecification;
import com.cloudinary.utils.StringUtils;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;

    private final UserRepository userRepo;

    private final VoucherService voucherService;

    private final ProductDetailRepository productDetailRepo;

    private final OrderDetailRepository orderDetailRepository;

    @Autowired
    private  OrderMapper orderMapper;

    private final EmailService emailService;


    @Override   
    public List<OrderResponse> findAll() {
        return orderMapper.toResponseDtoList(orderRepository.findAll());
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
        order.setPaymentStatus("UNPAID");
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        // Save final order
        order = orderRepository.save(order);
        
        // TODO: Send confirmation email
        
        emailService.createOrderConfirmationEmailContent(order);
        
        return orderMapper.toResponseDto(order);
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
        order.setPaymentStatus(orderDTO.getPaymentStatus());
        
        if(order.getEmail() != null){
            try {
                emailService.createElectronicInvoiceEmailContent(order, order.getEmail());
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }
        // Save final order
        return orderMapper.toResponseDto( orderRepository.save(order));
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

        return  detailDTOs.stream()
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
        OrderDetail orderDetail = OrderDetail.builder()
                .order(order)
                .quantity(detail.getQuantity())
                .productDetail(productDetail)
                .price(productDetail.getSalePrice())
                .build();
        return orderDetailRepository.save(orderDetail);
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
        return orderMapper.toResponseDto( orderRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Order not found")));
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

        return  orderMapper.toResponseDto(order);
    }

    @Override
    public List<OrderResponse> findByUserId(Long id) {
        return orderMapper.toResponseDtoList(orderRepository.findAllByUserIdOrderByCreatedDateDesc(id));
    }

    @Override
    public OrderResponse changeStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Not found order"));
        order.setStatus(status);

        if(order.getEmail() != null){
            try {
                emailService.sendOrderStatusUpdateEmail(order, status, order.getEmail());
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }
        return orderMapper.toResponseDto(orderRepository.save(order));
    }

    @Override
    public OrderResponse delete(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(()->
                new DataNotFoundException("Not found order"));
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        if(order.getEmail() != null){
            try {
                emailService.sendOrderStatusUpdateEmail(order, OrderStatus.CANCELLED, order.getEmail());
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }
        return orderMapper.toResponseDto(orderRepository.save(order));
    }

    @Override
    public List<OrderResponse> findAllByStatusAndCreatedDateBetween(
            String status, 
            LocalDateTime start, 
            LocalDateTime end) {
        
        if (status != null && !isValidStatus(status)) {
            throw new DataInvalidException("Invalid order status: " + status);
        }
        
        Specification<Order> spec = OrderSpecification.getOrderSpecification(status, start, end);
        return orderMapper.toResponseDtoList(orderRepository.findAll(spec));
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
            status.equalsIgnoreCase(OrderStatus.UNPAID) ||
            status.equalsIgnoreCase(OrderStatus.PAID) ||
            status.equalsIgnoreCase(OrderStatus.PAYMENT_FAILED)
        );
    }

    @Override
    public List<OrderResponse> findOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderMapper.toResponseDtoList(orderRepository.findAllByCreatedDateBetween(startDate, endDate));
    }

    @Override
    public OrderResponse updatePaymentStatus(Long orderId, String paymentStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
        order.setPaymentStatus(paymentStatus);
        return orderMapper.toResponseDto(orderRepository.save(order));
    }

    @Override
    public Map<String, Object> getOrderStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> orders = orderRepository.findAllByCreatedDateBetween(startDate, endDate);
        
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
    public OrderResponse cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
                
        if (order.getStatus().equals(OrderStatus.SUCCESS)) {
            throw new DataInvalidException("Cannot cancel completed order");
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order.setReason(reason);
        orderRepository.save(order);
        
        // Restore product quantities
        for (OrderDetail detail : order.getOrderDetails()) {
            ProductDetail productDetail = detail.getProductDetail();
            productDetail.setQuantity(productDetail.getQuantity() + detail.getQuantity());
            productDetailRepo.save(productDetail);
        }
        //send email
        return orderMapper.toResponseDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        if (!isValidStatus(status)) {
            throw new DataInvalidException("Invalid order status: " + status);
        }

        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new DataNotFoundException("Order not found"));
            
        // Prevent updating completed or cancelled orders
        if (OrderStatus.SUCCESS.equals(order.getStatus()) || 
            OrderStatus.CANCELLED.equals(order.getStatus())) {
            throw new DataInvalidException("Cannot update status of completed or cancelled orders");
        }
        
        // Validate status transition
        validateStatusTransition(order.getStatus(), status);
        
        order.setStatus(status);
        
        // If status is DELIVERED, automatically set order to SUCCESS
        if (OrderStatus.DELIVERED.equals(status)) {
            order.setStatus(OrderStatus.SUCCESS);
        }

        // Check if the order status is SUCCESS and set payment status to PAID
        if (OrderStatus.SUCCESS.equals(order.getStatus())) {
            order.setPaymentStatus(OrderStatus.PAID);
        }

        order = orderRepository.save(order);

        try {
            emailService.sendOrderStatusUpdateEmail(order, order.getStatus(), order.getEmail());
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return orderMapper.toResponseDto(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new DataNotFoundException("Order not found"));
            
        // Only PENDING orders can be confirmed
        if (!OrderStatus.PENDING.equals(order.getStatus())) {
            throw new DataInvalidException("Only pending orders can be confirmed");
        }
        if(order.getPaymentMethod().equalsIgnoreCase("CARD")){
            order.setPaymentStatus(OrderStatus.PAID);
        }
        // Update status to PROCESSING
        order.setStatus(OrderStatus.PROCESSING);
        
        // If this is a counter order, mark it as SUCCESS immediately
        if (OrderStatus.TYPE_COUNTER.equals(order.getType())) {
            order.setStatus(OrderStatus.SUCCESS);
            if (order.getPaymentStatus() == null) {
                order.setPaymentStatus(OrderStatus.PAID);
            }
        }
    
        //minus quantity
        for (OrderDetail detail : order.getOrderDetails()) {
            ProductDetail productDetail = detail.getProductDetail();
            productDetail.setQuantity(productDetail.getQuantity() - detail.getQuantity());
            productDetailRepo.save(productDetail);
        }
        //send email
        if(order.getEmail() != null){
       
        emailService.createOrderConfirmationEmailContent(order);
            
        }
        
        return orderMapper.toResponseDto(orderRepository.save(order));
    }

    // Helper method to validate status transitions
    private void validateStatusTransition(String currentStatus, String newStatus) {
        // Define valid transitions
        if (OrderStatus.PENDING.equals(currentStatus)) {
            if (!OrderStatus.PROCESSING.equals(newStatus)) {
                throw new DataInvalidException("Pending orders can only be moved to processing");
            }
        } else if (OrderStatus.PROCESSING.equals(currentStatus)) {
            if (!OrderStatus.SHIPPED.equals(newStatus)) {
                throw new DataInvalidException("Processing orders can only be moved to shipped");
            }
        } else if (OrderStatus.SHIPPED.equals(currentStatus)) {
            if (!OrderStatus.DELIVERED.equals(newStatus)) {
                throw new DataInvalidException("Shipped orders can only be moved to delivered");
            }
        }
    }

    @Override
    public List<OrderDetailResponse> getOrderDetail(Long orderId) {
        return orderDetailRepository.findAllByOrderId(orderId).stream()
                .map(OrderDetailResponse::fromOrderDetail).toList();
    }   

    @Override
    public Map<String, Long> getOrderStatusStatistics() {
        List<Object[]> statusCounts = orderRepository.countOrdersByStatusAndType(OrderStatus.TYPE_ONLINE);
        
        Map<String, Long> statistics = new LinkedHashMap<>();
        
        // Initialize all possible statuses with 0
        statistics.put(OrderStatus.PENDING, 0L);
        statistics.put(OrderStatus.PROCESSING, 0L);
        statistics.put(OrderStatus.DELIVERED, 0L);
        statistics.put(OrderStatus.SUCCESS, 0L);
        statistics.put(OrderStatus.CANCELLED, 0L);
        
        // Update counts from database
        for (Object[] result : statusCounts) {
            String status = (String) result[0];
            Long count = (Long) result[1];
            statistics.put(status, count);
        }
        
        return statistics;
    }


    @Override
    public List<OrderResponse> getOrderByEmail(String email) {
        return orderMapper.toResponseDtoList(orderRepository.findAllByEmailOrderByCreatedDateDesc(email));
    }
}
