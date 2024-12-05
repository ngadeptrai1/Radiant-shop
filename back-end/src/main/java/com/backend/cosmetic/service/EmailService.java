package com.backend.cosmetic.service;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.backend.cosmetic.model.Order;
import com.backend.cosmetic.model.OrderDetail;
import com.backend.cosmetic.model.OrderStatus;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;


    @Async
    public void createOrderConfirmationEmailContent(Order order) {
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        StringBuilder content = new StringBuilder();
        content.append("<html><body>");
        content.append("<h2>Xác nhận đơn hàng #").append(order.getId()).append("</h2>");
        content.append("<p>Cảm ơn bạn đã đặt hàng tại cửa hàng chúng tôi!</p>");
        content.append("<h3>Chi tiết đơn hàng:</h3>");
        content.append("<table border='1' style='border-collapse: collapse;'>");
        content.append("<tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th></tr>");
        
        for (OrderDetail item : order.getOrderDetails()) {
            content.append("<tr>");
            content.append("<td>").append(item.getProductDetail().getProduct().getName()).append("</td>");
            content.append("<td>").append(item.getQuantity()).append("</td>");
            content.append("<td>").append(item.getPrice()).append("đ</td>");
            content.append("<td>").append(item.getPrice() * item.getQuantity()).append("đ</td>");
            content.append("</tr>");
        }

        content.append("</table>");
        content.append("<p><strong>Tổng tiền: </strong>").append(order.getFinalAmount()).append("đ</p>");
        content.append("<p><strong>Địa chỉ giao hàng: </strong>").append(order.getAddress()).append("</p>");
        
        if (order.getPaymentMethod().equalsIgnoreCase("CARD")) {
            content.append("<p><strong>Thông tin chuyển khoản:</strong></p>");
            content.append("<p>Để xác nhận đơn hàng, vui lòng chuyển khoản vào tài khoản của chúng tôi.</p>");
            content.append("<p>Số tài khoản: 123456789</p>");
            content.append("<p>Ngân hàng: TPBANK</p>");
            content.append("<p>Số tiền: ").append(order.getFinalAmount()).append("đ</p>");
            content.append("<p>Chúng tôi sẽ xác nhận đơn hàng sau khi nhận được tiền.</p>");
        }
        
        content.append("</body></html>");
        
        try {
            sendMail(order.getEmail(), "Xác nhận đơn hàng #" + order.getId(), content.toString());
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

   
    public String createOrderStatusUpdateEmailContent(Order order, String newStatus) {
         StringBuilder content = new StringBuilder();
        if(newStatus.equals(OrderStatus.CANCELLED)){
            content.append("<html><body>");
            content.append("<h2>Đơn hàng #").append(order.getId()).append(" đã bị hủy</h2>");
            content.append("<p>Lý do: ").append(order.getReason()).append("</p>");
            content.append("</body></html>");
        }else{
            content.append("<html><body>");
            content.append("<h2>Cập nhật trạng thái đơn hàng #").append(order.getId()).append("</h2>");
            content.append("<p>Đơn hàng của bạn đã được cập nhật trạng thái mới:</p>");
            content.append("<p><strong>Trạng thái mới: </strong>").append(newStatus).append("</p>");
            content.append("</body></html>"); 
        }
        
        return content.toString();
    }
    @Async
    public void sendOrderStatusUpdateEmail(Order order, String newStatus, String recipientEmail) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("ngadxph30395@fpt.edu.vn");
        helper.setTo(recipientEmail);
        switch (newStatus) {
            case OrderStatus.PROCESSING -> helper.setSubject("Đơn hàng #" + order.getId() + " đã được xác nhận");
            case OrderStatus.SUCCESS -> helper.setSubject("Đơn hàng #" + order.getId() + " đã giao thành công");
            case OrderStatus.CANCELLED -> helper.setSubject("Đơn hàng #" + order.getId() + " đã bị hủy");
            default -> {
            }
        }

        String emailContent = createOrderStatusUpdateEmailContent(order, newStatus);
        helper.setText(emailContent, true);

        mailSender.send(message);
    }


    @Async
    public void  createElectronicInvoiceEmailContent(Order order, String recipientEmail) throws MessagingException {
       sendMail(recipientEmail, "Hóa đơn điện tử cho đơn hàng #" + order.getId(), generateInvoiceHtml(order));
    }

    private void sendMail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom("ngadxph30395@fpt.edu.vn");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        mailSender.send(message);
    }

    private static String generateInvoiceHtml(Order order) {
        return "<!DOCTYPE html>" +
               "<html lang='vi'>" +
               "<head>" +
               "    <meta charset='UTF-8'>" +
               "    <title>Hóa Đơn Điện Tử</title>" +
               "    <style>" +
               "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
               "        .invoice { max-width: 800px; margin: 0 auto; padding: 20px; }" +
               "        .invoice-header { background-color: #f4f4f4; padding: 10px; text-align: center; }" +
               "        .invoice-details { margin: 20px 0; }" +
               "        table { width: 100%; border-collapse: collapse; }" +
               "        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }" +
               "        .total { text-align: right; font-weight: bold; }" +
               "    </style>" +
               "</head>" +
               "<body>" +
               "    <div class='invoice'>" +
               "        <div class='invoice-header'>" +
               "            <h1>HÓA ĐƠN ĐIỆN TỬ</h1>" +
               "            <p>Số hóa đơn: " + order.getId() + "</p>" +
               "            <p>Ngày: " + order.getCreatedDate() + "</p>" +
               "        </div>" +
               "        <div class='invoice-details'>" +
               "            <h2>Thông Tin Khách Hàng</h2>" +
               "            <p>Tên: " + order.getUser().getFullName() + "</p>" +
               "            <p>Email: " + order.getUser().getEmail() + "</p>" +
               "            <p>Địa chỉ: " + order.getAddress() + "</p>" +
               "        </div>" +
               "        <div class='invoice-items'>" +
               "            <h2>Chi Tiết Sản Phẩm</h2>" +
               "            <table>" +
               "                <thead>" +
               "                    <tr>" +
               "                        <th>Sản Phẩm</th>" +
               "                        <th>Số Lượng</th>" +
               "                        <th>Đơn Giá</th>" +
               "                        <th>Thành Tiền</th>" +
               "                    </tr>" +
               "                </thead>" +
               "                <tbody>" +
               generateOrderItemsHtml(order.getOrderDetails()) +
               "                </tbody>" +
               "            </table>" +
               "        </div>" +
               "        <div class='invoice-summary'>" +
               "            <p class='total'>Tổng Cộng: " + order.getFinalAmount() + " VND</p>" +
               "            <p class='total'>Giảm giá: " + order.getVoucherAmount()+ " VND</p>" +
               "            <p class='total'>Tổng Thanh Toán: " + order.getFinalAmount() + " VND</p>" +
               "        </div>" +
               "        <div class='invoice-footer'>" +
               "            <p>Cảm ơn quý khách đã mua hàng!</p>" +
               "        </div>" +
               "    </div>" +
               "</body>" +
               "</html>";
    }

    private static String generateOrderItemsHtml(List<OrderDetail> items) {
        StringBuilder itemsHtml = new StringBuilder();
        for (OrderDetail item : items) {
            itemsHtml.append("<tr>")
                     .append("<td>").append(item.getProductDetail().getProduct().getName()).append("</td>")
                     .append("<td>").append(item.getQuantity()).append("</td>")
                     .append("<td>").append(item.getPrice()).append(" VND</td>")
                     .append("<td>").append(item.getPrice() * item.getQuantity()).append(" VND</td>")
                     .append("</tr>");
        }
        return itemsHtml.toString();
    }
    
    
    @Async
    public void sendCancelOrderEmail(Order order, String recipientEmail) throws MessagingException {
        sendMail(recipientEmail, "Đơn hàng #" + order.getId()
         + " đã bị hủy", createOrderStatusUpdateEmailContent(order, OrderStatus.CANCELLED));
    }
    
    @Async
    public void sendPasswordResetEmail(String email, String token) throws MessagingException {
        String resetLink = "http://localhost:4200/reset-password?token=" + token;
        
        String content = "<html><body>" +
            "<h2>Đặt lại mật khẩu của bạn</h2>" +
            "<p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>" +
            "<a href='" + resetLink + "'>Đặt lại mật khẩu</a>" +
            "<p>Liên kết này sẽ hết hạn sau 24 giờ.</p>" +
            "<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>" +
            "</body></html>";
        
        sendMail(email, "Yêu cầu đặt lại mật khẩu", content);
    }









}
