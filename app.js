/* ===========================
   KS Môi Trường – App JS (GH Pages → Google Sheets)
   - Gửi dữ liệu thật về Google Apps Script Web App
   - Không phụ thuộc framework, hoạt động với HTML thuần
   - Có cơ chế “tự bắt” form/btn gửi linh hoạt
   =========================== */

// 1) URL Web App của bạn (đã cung cấp)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6H4V9ksGAVS2ZZ6FR0GTC4B-1PTsow6cd5hSqZ5Qh7-bWG1n9cnakAiMinNd8YIxP/exec";

// 2) Cấu hình tên trường mặc định (nếu có)
const FIELD_MAP = {
  // Các key phổ biến bạn đã dùng; nếu HTML của bạn đặt name khác, vẫn được thu thập auto bên dưới
  company: ["company", "company_name", "ten_doanh_nghiep", "tencongty"],
  address: ["address", "dia_chi", "diachi"],
  mainIndustry: ["main_industry", "nganh_chinh", "industry"],
  capital: ["capital", "von_dieu_le", "von"],
  employees: ["employees", "quy_mo_lao_dong", "laodong"],
  factoryArea: ["factory_area", "dien_tich_nha_xuong", "dientich"],
  businessType: ["business_type", "loai_hinh_doanh_nghiep"],
  contactName: ["contact_name", "nguoi_lien_he", "lienhe_ten"],
  contactPhone: ["contact_phone", "so_dien_thoai", "lienhe_sdt"],
};

// 3) Lớp chính
class EnvironmentalSurvey {
  constructor() {
    // Tìm form#surveyForm (nếu có)
    this.formEl = document.querySelector("#surveyForm") || null;

    // Tìm nút Submit (nếu không có form)
    this.submitBtn =
      document.querySelector("#submitBtn") ||
      document.querySelector("[data-submit]") ||
      null;

    // Gắn sự kiện submit theo những gì có sẵn
    if (this.formEl) {
      this.formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    if (this.submitBtn && !this.formEl) {
      this.submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // Một số nút/tiện ích khác (không bắt buộc)
    this.progressFill = document.querySelector("#progressFill");
    this.previewBox = document.querySelector("#previewContent");
  }

  // Thu thập dữ liệu: tự quét tất cả input/textarea/select trong trang
  collectPayload() {
    const payload = {};

    // 3.1: lấy dữ liệu có cấu trúc name="key"
    const inputs = document.querySelectorAll(
      "input[name], textarea[name], select[name]"
    );
    inputs.forEach((el) => {
      const name = (el.getAttribute("name") || "").trim();
      if (!name) return;

      if (el.type === "checkbox") {
        payload[name] = el.checked;
      } else if (el.type === "radio") {
        if (el.checked) payload[name] = el.value;
      } else {
        payload[name] = el.value;
      }
    });

    // 3.2: ánh xạ các key quan trọng (nếu không có name đúng)
    for (const stdKey of Object.keys(FIELD_MAP)) {
      if (payload[stdKey] != null && payload[stdKey] !== "") continue;
      const candidates = FIELD_MAP[stdKey];
      const found = candidates.find((k) => payload[k] != null && payload[k] !== "");
      if (found) payload[stdKey] = payload[found];
    }

    // 3.3: tổng các bảng nếu có data-role
    // Ví dụ: <table data-role="b1"> có các ô input[name="b1_2023"], ...
    payload.b1_total_2023 = this.sumBySelector('input[name^="b1_2023"], [data-b1-2023]');
    payload.b1_total_2024 = this.sumBySelector('input[name^="b1_2024"], [data-b1-2024]');
    payload.b1_total_2025 = this.sumBySelector('input[name^="b1_2025"], [data-b1-2025]');

    // 3.4: thêm meta
    payload._submitted_at = new Date().toISOString();
    payload._page = location.href;

    return payload;
  }

  sumBySelector(selector) {
    let total = 0;
    document.querySelectorAll(selector).forEach((el) => {
      const v =
        el.value != null && el.value !== ""
          ? String(el.value).replace(/[^\d.-]/g, "")
          : el.textContent || el.innerText || "0";
      const n = parseFloat(String(v).replace(/[^\d.-]/g, "")) || 0;
      total += n;
    });
    return total;
  }

  // Gửi lên Google Sheets qua Apps Script
  async submitToGoogleSheets(singleRowData) {
    try {
      console.log("Submitting to Google Sheets:", singleRowData);

      // DÙNG no-cors để tránh CORS; không đọc được JSON trả về nhưng ghi được
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleRowData),
      });

      // Với no-cors, coi như gửi thành công
      return true;
    } catch (error) {
      console.error("Google Sheets submission error:", error);
      return false;
    }
  }

  // Xử lý khi bấm Gửi
  async handleSubmit() {
    try {
      const data = this.collectPayload();

      // Hiển thị preview nếu có khung
      if (this.previewBox) {
        this.previewBox.textContent = JSON.stringify(data, null, 2);
      }

      // Gửi
      const ok = await this.submitToGoogleSheets(data);

      if (ok) {
        alert("Đã gửi lên Google Sheets! Mở sheet để kiểm tra dòng mới.");
        if (this.formEl) this.formEl.reset();
      } else {
        alert("Gửi thất bại. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error(e);
      alert("Có lỗi khi gửi dữ liệu. Vui lòng thử lại.");
    }
  }
}

// 4) Khởi tạo app khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  new EnvironmentalSurvey();
});
