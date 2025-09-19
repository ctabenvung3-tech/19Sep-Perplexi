/* ===========================
   KS Môi Trường – App JS (Stepper + Google Sheets)
   =========================== */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6H4V9ksGAVS2ZZ6FR0GTC4B-1PTsow6cd5hSqZ5Qh7-bWG1n9cnakAiMinNd8YIxP/exec";

const FIELD_MAP = {
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

class EnvironmentalSurvey {
  constructor() {
    // ==== STEP UI ====
    this.steps = Array.from(document.querySelectorAll(".step"));
    this.currentStep = 0;
    this.nextBtn = document.getElementById("nextBtn");
    this.prevBtn = document.getElementById("prevBtn");

    // Khởi tạo hiển thị bước
    this.updateStepUI();

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.goStep(1);
      });
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.goStep(-1);
      });
    }

    // ==== SUBMIT ====
    this.formEl = document.getElementById("surveyForm") || null;
    this.submitBtn =
      document.getElementById("submitBtn") ||
      document.querySelector("[data-submit]") ||
      null;

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

    this.previewBox = document.getElementById("previewContent");
    this.progressFill = document.getElementById("progressFill");
  }

  goStep(delta) {
    if (!this.steps.length) return;
    this.currentStep += delta;
    if (this.currentStep < 0) this.currentStep = 0;
    if (this.currentStep > this.steps.length - 1)
      this.currentStep = this.steps.length - 1;
    this.updateStepUI();
  }

  updateStepUI() {
    if (!this.steps.length) return;
    this.steps.forEach((el, idx) => {
      el.style.display = idx === this.currentStep ? "block" : "none";
    });
    if (this.prevBtn) this.prevBtn.disabled = this.currentStep === 0;
    if (this.nextBtn) this.nextBtn.style.display =
      this.currentStep < this.steps.length - 1 ? "inline-block" : "none";
    if (this.submitBtn) this.submitBtn.style.display =
      this.currentStep === this.steps.length - 1 ? "inline-block" : "none";

    // progress (nếu có)
    if (this.progressFill) {
      const pct = ((this.currentStep + 1) / this.steps.length) * 100;
      this.progressFill.style.width = `${pct}%`;
    }
  }

  collectPayload() {
    const payload = {};
    const inputs = document.querySelectorAll("input[name], textarea[name], select[name]");
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

    for (const stdKey of Object.keys(FIELD_MAP)) {
      if (payload[stdKey] != null && payload[stdKey] !== "") continue;
      const cands = FIELD_MAP[stdKey];
      const found = cands.find((k) => payload[k] != null && payload[k] !== "");
      if (found) payload[stdKey] = payload[found];
    }

    // Ví dụ tính tổng nếu bạn đặt name theo mẫu
    payload.b1_total_2023 = this.sumBySelector('input[name^="b1_2023"], [data-b1-2023]');
    payload.b1_total_2024 = this.sumBySelector('input[name^="b1_2024"], [data-b1-2024]');
    payload.b1_total_2025 = this.sumBySelector('input[name^="b1_2025"], [data-b1-2025]');

    payload._submitted_at = new Date().toISOString();
    payload._page = location.href;
    return payload;
  }

  sumBySelector(selector) {
    let total = 0;
    document.querySelectorAll(selector).forEach((el) => {
      const raw = el.value ?? el.textContent ?? "0";
      const n = parseFloat(String(raw).replace(/[^\d.-]/g, "")) || 0;
      total += n;
    });
    return total;
  }

  async submitToGoogleSheets(data) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // gửi được từ GitHub Pages → Apps Script
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return true; // no-cors: coi như ok
    } catch (err) {
      console.error("Submit error:", err);
      return false;
    }
  }

  async handleSubmit() {
    const payload = this.collectPayload();
    if (this.previewBox) this.previewBox.textContent = JSON.stringify(payload, null, 2);

    const ok = await this.submitToGoogleSheets(payload);
    alert(ok ? "Đã gửi lên Google Sheets! Vui lòng kiểm tra Sheet." : "Gửi thất bại, thử lại sau.");

    if (ok && this.formEl) this.formEl.reset();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new EnvironmentalSurvey();
});
