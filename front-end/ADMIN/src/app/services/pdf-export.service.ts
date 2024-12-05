import { Injectable } from '@angular/core';
import { OrderResponse, OrderDetailResponse } from '../../type';
import html2pdf from 'html2pdf.js';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  
  generateOrderPDF(order: OrderResponse, orderDetails: OrderDetailResponse[]) {
    // Tạo template HTML
    const template = `
      <div style="font-family: 'Times New Roman', Times, serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <!-- Header với logo bên trái -->
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <div style="flex: 0 0 100px;">
            <img src="assets/img/logo.png" alt="Logo" style="width: 80px; height: auto;"/>
          </div>
          <div style="flex: 1; text-align: center;">
            <h2 style="margin: 5px 0; color: #2c3e50;">Cửa Hàng Mỹ Phẩm Radiant</h2>
            <p style="margin: 5px 0; color: #7f8c8d; font-size: 14px;">
              Địa chỉ: Đường Trịnh Văn Bô / Nam Từ Liêm / Hà Nội<br>
              Hotline: 1900 1234 - Email: dnha138@gmail.com
            </p>
          </div>
        </div>

        <h2 style="text-align: center; color: #2c3e50; padding: 15px 0; border-bottom: 2px solid #3498db; margin-bottom: 20px;">
          HÓA ĐƠN BÁN HÀNG
        </h2>
        
        <!-- Thông tin đơn hàng với style mới -->
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
              <p><strong>Ngày tạo:</strong> ${new Date(order.createdDate).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p><strong>Khách hàng:</strong> ${order.fullName}</p>
              <p><strong>Số điện thoại:</strong> ${order.phoneNumber}</p>
            </div>
          </div>
          <p><strong>Địa chỉ:</strong> ${order.address || 'N/A'}</p>
        </div>

        <!-- Bảng sản phẩm với style mới -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="border: 1px solid #dee2e6; padding: 12px;">STT</th>
              <th style="border: 1px solid #dee2e6; padding: 12px;">Sản phẩm</th>
              <th style="border: 1px solid #dee2e6; padding: 12px;">Màu sắc</th>
              <th style="border: 1px solid #dee2e6; padding: 12px;">Số lượng</th>
              <th style="border: 1px solid #dee2e6; padding: 12px;">Đơn giá</th>
              <th style="border: 1px solid #dee2e6; padding: 12px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${orderDetails.map((detail, index) => `
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">${detail.productName}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">${detail.productColor}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: center;">${detail.quantity}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${this.formatCurrency(detail.price)}</td>
                <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${this.formatCurrency(detail.price * detail.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Thông tin thanh toán với style mới -->
        <div style="margin-left: auto; width: 350px; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <p style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Tổng tiền hàng:</span>
            <strong>${this.formatCurrency(order.totalOrderAmount)}</strong>
          </p>
          <p style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>Phí vận chuyển:</span>
            <strong>${this.formatCurrency(order.shippingCost)}</strong>
          </p>
          ${order.voucherAmount > 0 ? `
            <p style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>Giảm giá:</span>
              <strong>-${this.formatCurrency(order.voucherAmount)}</strong>
            </p>
          ` : ''}
          <div style="border-top: 2px solid #3498db; margin-top: 10px; padding-top: 10px;">
            <p style="display: flex; justify-content: space-between; font-size: 1.2em; color: #2c3e50;">
              <span>Tổng thanh toán:</span>
              <strong>${this.formatCurrency(order.finalAmount)}</strong>
            </p>
          </div>
        </div>

        <!-- Footer với style mới -->
        <div style="text-align: center; margin-top: 40px; padding: 20px; border-top: 2px solid #3498db;">
          <p style="color: #7f8c8d; font-style: italic;">Cảm ơn quý khách đã mua hàng!</p>
          <p style="color: #7f8c8d; font-size: 12px; margin-top: 10px;">
            Mọi thắc mắc xin vui lòng liên hệ: Hotline 1900 1234
          </p>
        </div>
      </div>
    `;

    // Cấu hình html2pdf
    const options = {
      margin: 10,
      filename: `Order-${order.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Tạo element từ template
    const element = document.createElement('div');
    element.innerHTML = template;
    document.body.appendChild(element);

    // Tạo PDF
    html2pdf().from(element).set(options).save().then(() => {
      document.body.removeChild(element);
    });
  }
  
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
} 