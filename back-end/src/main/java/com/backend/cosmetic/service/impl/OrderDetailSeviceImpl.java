package com.backend.cosmetic.service.impl;

import java.util.List;

import org.springframework.stereotype.Component;

import com.backend.cosmetic.dto.OrderDetailDTO;
import com.backend.cosmetic.exception.DataNotFoundException;
import com.backend.cosmetic.mapper.OrderDetailMapper;
import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.model.OrderDetail;
import com.backend.cosmetic.model.ProductDetail;
import com.backend.cosmetic.model.Voucher;
import com.backend.cosmetic.repository.OrderDetailRepository;
import com.backend.cosmetic.repository.OrderRepository;
import com.backend.cosmetic.repository.ProductDetailRepository;
import com.backend.cosmetic.response.OrderDetailResponse;
import com.backend.cosmetic.service.OrderDetailService;

import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
@Component
public class OrderDetailSeviceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final OrderDetailMapper orderDetailMapper;
    private final ProductDetailRepository productDetailRepository;

    private void updateOrderInformation(Order order) {
        List<OrderDetail> orderDetails = order.getOrderDetails();
        long totalOrderAmount = 0;
        int totalItems = 0;

        for (OrderDetail detail : orderDetails) {
            totalOrderAmount += detail.getPrice() * detail.getQuantity();
            totalItems += detail.getQuantity();
        }

        order.setTotalOrderAmount(totalOrderAmount);
        order.setTotalItems(totalItems);
        
        // Kiểm tra và cập nhật voucher
        Voucher voucher = order.getVoucher();
        if (voucher != null) {
            // Kiểm tra điều kiện áp dụng voucher
            if (totalOrderAmount < voucher.getMinOrderAmount()) {
                // Nếu không đủ điều kiện, xóa voucher
                order.setVoucher(null);
                order.setVoucherAmount(0);
                order.setFinalAmount(totalOrderAmount + order.getShippingCost());
            } else {
                // Tính lại số tiền giảm giá
                long voucherAmount;
                if ("PERCENT".equals(voucher.getType())) {
                    voucherAmount = (totalOrderAmount * voucher.getValue()) / 100;
                    if (voucher.getMaxDiscountAmount() != null) {
                        voucherAmount = Math.min(voucherAmount, voucher.getMaxDiscountAmount());
                    }
                } else {
                    voucherAmount = voucher.getValue();
                }
                order.setVoucherAmount(voucherAmount);
                order.setFinalAmount(totalOrderAmount + order.getShippingCost() - voucherAmount);
            }
        } else {
            order.setFinalAmount(totalOrderAmount + order.getShippingCost());
        }
        
        orderRepository.save(order);
    }

    @Override
    public OrderDetailResponse addOrderDetail(Long orderId, OrderDetailDTO orderDetailRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new DataNotFoundException("Order not found"));
        ProductDetail productDetail = productDetailRepository.findById(orderDetailRequest.getProductDetailId())
                .orElseThrow(() -> new DataNotFoundException("Product detail not found"));

        OrderDetail existingOrderDetail = orderDetailRepository.findByOrderAndProductDetail(order, productDetail).orElse(null);

        if (existingOrderDetail != null) {
            existingOrderDetail.setQuantity(existingOrderDetail.getQuantity() + orderDetailRequest.getQuantity());
            OrderDetailResponse response = orderDetailMapper.toResponseDto(orderDetailRepository.save(existingOrderDetail));
            updateOrderInformation(order);
            return response;
        } else {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            Long price = productDetail.getSalePrice() - (productDetail.getSalePrice() * productDetail.getDiscount() / 100);
            orderDetail.setPrice(price);
            orderDetail.setProductDetail(productDetail);
            orderDetail.setQuantity(orderDetailRequest.getQuantity());

            OrderDetailResponse response = orderDetailMapper.toResponseDto(orderDetailRepository.save(orderDetail));
            updateOrderInformation(order);
            return response;
        }
    }

    @Override
    public OrderDetailResponse updateOrderDetail(Long orderDetailId, int quantity) {
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new DataNotFoundException("Order detail not found"));
        orderDetail.setQuantity(quantity);
        OrderDetailResponse response = orderDetailMapper.toResponseDto(orderDetailRepository.save(orderDetail));
        updateOrderInformation(orderDetail.getOrder());
        return response;
    }

    @Override
    public void deleteOrderDetail(Long orderDetailId) {
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new DataNotFoundException("Order detail not found"));
        Order order = orderDetail.getOrder();
        orderDetailRepository.deleteById(orderDetailId);
        updateOrderInformation(order);
    }   

   
}
