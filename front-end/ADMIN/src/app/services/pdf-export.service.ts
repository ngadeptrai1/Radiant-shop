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
      <div style="font-family: 'Times New Roman', Times, serif; padding: 20px;">
        <h1 style="text-align: center; color: #333;">HÓA ĐƠN BÁN HÀNG</h1>
        
        <div style="margin: 20px 0;">
          <p><strong>Mã đơn hàng:</strong> #${order.id}</p>
          <p><strong>Ngày tạo:</strong> ${new Date(order.createdDate).toLocaleDateString('vi-VN')}</p>
          <p><strong>Khách hàng:</strong> ${order.fullName}</p>
          <p><strong>Số điện thoại:</strong> ${order.phoneNumber}</p>
          <p><strong>Địa chỉ:</strong> ${order.address || 'N/A'}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
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

        <div style="margin-left: auto; width: 300px;">
          <p style="display: flex; justify-content: space-between;">
            <span>Tổng tiền hàng:</span>
            <strong>${this.formatCurrency(order.totalOrderAmount)}</strong>
          </p>
          <p style="display: flex; justify-content: space-between;">
            <span>Phí vận chuyển:</span>
            <strong>${this.formatCurrency(order.shippingCost)}</strong>
          </p>
          ${order.voucherAmount > 0 ? `
            <p style="display: flex; justify-content: space-between;">
              <span>Giảm giá:</span>
              <strong>${this.formatCurrency(order.voucherAmount)}</strong>
            </p>
          ` : ''}
          <p style="display: flex; justify-content: space-between; font-size: 1.2em;">
            <span>Tổng thanh toán:</span>
            <strong>${this.formatCurrency(order.finalAmount)}</strong>
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #666;">
          <p>Cảm ơn quý khách đã mua hàng!</p>
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