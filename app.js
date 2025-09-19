/* ========== CẤU HÌNH URL GOOGLE SCRIPT ========== */
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6H4V9ksGAVS2ZZ6FR0GTC4B-1PTsow6cd5hSqZ5Qh7-bWG1n9cnakAiMinNd8YIxP/exec";

/* ========== QUẢN LÝ STEP FORM ========== */
let currentStep = 0;

function showStep(n) {
  const steps = document.querySelectorAll(".step");
  steps.forEach((s, i) => s.style.display = (i === n ? "block" : "none"));

  document.getElementById("prevBtn").style.display = (n === 0) ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display = (n === steps.length - 1) ? "none" : "inline-block";
  document.getElementById("submitBtn").style.display = (n === steps.length - 1) ? "inline-block" : "none";

  // cập nhật tiến độ
  const progressFill = document.getElementById("progressFill");
  if (progressFill) {
    const pct = ((n + 1) / steps.length) * 100;
    progressFill.style.width = pct + "%";
  }
}

function nextPrev(n) {
  const steps = document.querySelectorAll(".step");
  currentStep = currentStep + n;
  if (currentStep < 0) currentStep = 0;
  if (currentStep >= steps.length) currentStep = steps.length - 1;
  showStep(currentStep);
}

/* ========== GỬI FORM VỀ GOOGLE SHEETS ========== */
async function submitForm(e) {
  e.preventDefault();
  const form = document.getElementById("surveyForm");
  const formData = new FormData(form);
  const data = {};

  formData.forEach((value, key) => {
    if (!data[key]) {
      data[key] = value;
    } else {
      if (!Array.isArray(data[key])) data[key] = [data[key]];
      data[key].push(value);
    }
  });

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    alert("✅ Đã gửi khảo sát thành công!");
    form.reset();
    currentStep = 0;
    showStep(currentStep);
  } catch (err) {
    alert("❌ Gửi thất bại, vui lòng thử lại.");
    console.error(err);
  }
}

/* ========== TỰ ĐỘNG THÊM DÒNG ========== */
function enableAddRowButtons() {
  document.querySelectorAll(".addRowBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const tbody = document.getElementById(targetId);
      if (!tbody) return;

      const firstRow = tbody.querySelector("tr");
      if (!firstRow) return;

      const newRow = firstRow.cloneNode(true);
      newRow.querySelectorAll("input").forEach(inp => inp.value = "");
      tbody.appendChild(newRow);
    });
  });
}

/* ========== KHỞI TẠO SAU KHI LOAD ========== */
document.addEventListener("DOMContentLoaded", () => {
  showStep(currentStep);

  document.getElementById("prevBtn").addEventListener("click", () => nextPrev(-1));
  document.getElementById("nextBtn").addEventListener("click", () => nextPrev(1));
  document.getElementById("surveyForm").addEventListener("submit", submitForm);

  enableAddRowButtons();
});
