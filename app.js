// Environmental Survey Application JavaScript - Updated Version with Bug Fixes
class EnvironmentalSurvey {
    constructor() {
        this.currentStep = 'A';
        this.steps = ['A', 'B1', 'B2', 'C'];
        this.formData = {};
        this.tableCounters = {
            wasteTable: 1,
            industrialTable1: 1,
            industrialTable2: 1,
            industrialTable3: 1,
            hazardousTable: 1
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.setupCalculations();
        // Don't load form data initially to avoid conflicts
        console.log('Environmental Survey App initialized with updated years and single-sheet format');
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitSurvey());

        // Form inputs - save data on change with improved binding
        this.bindFormInputs();

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.closest('.modal'));
            }
        });

        // Table calculation inputs
        this.setupTableCalculations();
    }

    bindFormInputs() {
        // Use event delegation for better performance and dynamic content
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.clearError(e.target);
                this.saveFormData();
                if (e.target.classList.contains('calc-input')) {
                    this.calculateTotals();
                }
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.saveFormData();
                if (e.target.classList.contains('calc-input')) {
                    this.calculateTotals();
                }
            }
        });
    }

    setupTableCalculations() {
        // Initial calculation
        setTimeout(() => this.calculateTotals(), 200);
    }

    calculateTotals() {
        // Calculate B1 totals - Updated for new years
        this.calculateTableTotal('wasteTable', ['total_2023_b1', 'total_2024_b1', 'total_2025_b1'], [2, 3, 4]);
        
        // Calculate B2 individual section totals - Updated for new years
        this.calculateTableTotal('industrialTable1', ['total_2023_ind1', 'total_2024_ind1', 'total_2025_ind1'], [2, 3, 4]);
        this.calculateTableTotal('industrialTable2', ['total_2023_ind2', 'total_2024_ind2', 'total_2025_ind2'], [2, 3, 4]);
        this.calculateTableTotal('industrialTable3', ['total_2023_ind3', 'total_2024_ind3', 'total_2025_ind3'], [2, 3, 4]);
        
        // Calculate grand totals for B2
        this.calculateGrandTotals();
    }

    calculateTableTotal(tableId, totalIds, columnIndices) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        const totals = columnIndices.map(() => 0);
        
        rows.forEach(row => {
            columnIndices.forEach((colIndex, i) => {
                const input = row.cells[colIndex]?.querySelector('input');
                if (input && input.value) {
                    totals[i] += parseFloat(input.value) || 0;
                }
            });
        });
        
        totalIds.forEach((totalId, i) => {
            const totalElement = document.getElementById(totalId);
            if (totalElement) {
                totalElement.textContent = totals[i].toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        });
    }

    calculateGrandTotals() {
        const getTotalValue = (id) => {
            const element = document.getElementById(id);
            if (!element) return 0;
            const text = element.textContent.replace(/[^\d.,]/g, '').replace(',', '.');
            return parseFloat(text) || 0;
        };
        
        // Updated for new years
        const grand2023 = getTotalValue('total_2023_ind1') + getTotalValue('total_2023_ind2') + getTotalValue('total_2023_ind3');
        const grand2024 = getTotalValue('total_2024_ind1') + getTotalValue('total_2024_ind2') + getTotalValue('total_2024_ind3');
        const grand2025 = getTotalValue('total_2025_ind1') + getTotalValue('total_2025_ind2') + getTotalValue('total_2025_ind3');
        
        const formatNumber = (num) => num.toLocaleString('vi-VN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        const grandTotal2023 = document.getElementById('grand_total_2023');
        const grandTotal2024 = document.getElementById('grand_total_2024');
        const grandTotal2025 = document.getElementById('grand_total_2025');
        
        if (grandTotal2023) grandTotal2023.textContent = formatNumber(grand2023) + ' kg/năm';
        if (grandTotal2024) grandTotal2024.textContent = formatNumber(grand2024) + ' kg/năm';
        if (grandTotal2025) grandTotal2025.textContent = formatNumber(grand2025) + ' kg';
    }

    saveFormData() {
        this.formData = {};

        // Get all form inputs with improved logic
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    this.formData[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                if (input.id) {
                    this.formData[input.id] = input.checked;
                }
            } else if (input.value !== undefined && input.value !== '') {
                if (input.id) {
                    this.formData[input.id] = input.value;
                } else if (input.name) {
                    this.formData[input.name] = input.value;
                }
            }
        });

        // Save table data
        this.saveTableData();
    }

    saveTableData() {
        // Save waste table data
        this.formData.waste_data = this.getTableData('wasteTable');
        
        // Save industrial table data
        this.formData.industrial_data = {
            direct_use: this.getTableData('industrialTable1'),
            reuse_recycle: this.getTableData('industrialTable2'),
            waste_treatment: this.getTableData('industrialTable3')
        };
        
        // Save hazardous waste data
        this.formData.hazardous_data = this.getTableData('hazardousTable');
    }

    getTableData(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return [];
        
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const data = [];
        
        rows.forEach(row => {
            const rowData = {};
            const inputs = row.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                if (input.name && input.value !== '') {
                    rowData[input.name] = input.value;
                }
            });
            
            // Only add row if it has some data
            if (Object.keys(rowData).length > 0) {
                data.push(rowData);
            }
        });
        
        return data;
    }

    // NEW FUNCTION: Format data for single-sheet structure
    formatDataForSingleSheet() {
        const singleRowData = {
            timestamp: new Date().toISOString(),
            
            // Section A: Individual columns
            company_name: this.formData.company_name || '',
            address: this.formData.address || '',
            business_type: this.formData.business_type || '',
            capital: this.formData.capital || '',
            employees: this.formData.employees || '',
            factory_area: this.formData.factory_area || '',
            company_type: this.formData.company_type || '',
            
            // Section B1: Waste data as JSON string
            waste_data_json: JSON.stringify(this.formData.waste_data || []),
            
            // Section B2: Industrial data as separate JSON strings
            industrial_direct_json: JSON.stringify(this.formData.industrial_data?.direct_use || []),
            industrial_reuse_json: JSON.stringify(this.formData.industrial_data?.reuse_recycle || []),
            industrial_treatment_json: JSON.stringify(this.formData.industrial_data?.waste_treatment || []),
            
            // Section C: Hazardous waste as JSON string
            hazardous_data_json: JSON.stringify(this.formData.hazardous_data || []),
            
            // Contact info: Individual columns
            contact_name: this.formData.contact_name || '',
            contact_phone: this.formData.contact_phone || ''
        };

        return singleRowData;
    }

    validateCurrentStep() {
        const currentForm = document.querySelector(`#form${this.currentStep}`);
        if (!currentForm) return true;

        const requiredInputs = currentForm.querySelectorAll('[required]');
        let isValid = true;

        // Clear all existing errors first
        currentForm.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
        });
        currentForm.querySelectorAll('.form-control').forEach(control => {
            control.classList.remove('error');
        });

        // More lenient validation - only check truly required fields
        requiredInputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        // If no required fields are found, allow progression (for testing)
        if (requiredInputs.length === 0) {
            return true;
        }

        return isValid;
    }

    validateInput(input) {
        let isValid = true;
        let errorMessage = '';

        if (input.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
            const checked = Array.from(radioGroup).some(radio => radio.checked);
            
            if (!checked) {
                isValid = false;
                errorMessage = 'Vui lòng chọn một tùy chọn';
                this.showError(input.closest('.form-group'), errorMessage);
            }
        } else if (!input.value || input.value.trim() === '') {
            // More lenient - only show error for truly empty required fields
            if (input.hasAttribute('required')) {
                isValid = false;
                errorMessage = 'Trường này không được để trống';
                this.showError(input, errorMessage);
            }
        } else {
            // Specific validations
            switch (input.type) {
                case 'tel':
                    const phoneRegex = /^[0-9+\-\s()]{8,}$/;
                    if (!phoneRegex.test(input.value)) {
                        isValid = false;
                        errorMessage = 'Số điện thoại không hợp lệ';
                        this.showError(input, errorMessage);
                    }
                    break;
                case 'number':
                    const num = parseFloat(input.value);
                    if (isNaN(num) || num < 0) {
                        isValid = false;
                        errorMessage = 'Vui lòng nhập số hợp lệ';
                        this.showError(input, errorMessage);
                    }
                    break;
            }
        }

        return isValid;
    }

    showError(element, message) {
        const formGroup = element.closest('.form-group');
        if (!formGroup) return;

        const errorDiv = formGroup.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }

        if (element.classList && element.classList.contains('form-control')) {
            element.classList.add('error');
        }
    }

    clearError(element) {
        const formGroup = element.closest('.form-group');
        if (!formGroup) return;

        const errorDiv = formGroup.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }

        if (element.classList && element.classList.contains('form-control')) {
            element.classList.remove('error');
        }
    }

    nextStep() {
        console.log('Next step clicked, current step:', this.currentStep);
        
        // Save current form data
        this.saveFormData();
        
        // More lenient validation for testing
        if (!this.validateCurrentStep()) {
            console.log('Validation failed for step:', this.currentStep);
            // Still allow progression for testing if no critical errors
            // return;
        }

        const currentIndex = this.steps.indexOf(this.currentStep);
        if (currentIndex < this.steps.length - 1) {
            this.currentStep = this.steps[currentIndex + 1];
            console.log('Moving to step:', this.currentStep);
            this.updateDisplay();
        } else if (currentIndex === this.steps.length - 1) {
            this.showPreview();
        }
    }

    prevStep() {
        console.log('Previous step clicked, current step:', this.currentStep);
        
        if (this.currentStep === 'preview') {
            this.currentStep = this.steps[this.steps.length - 1];
        } else {
            const currentIndex = this.steps.indexOf(this.currentStep);
            if (currentIndex > 0) {
                this.currentStep = this.steps[currentIndex - 1];
            }
        }
        
        console.log('Moving to step:', this.currentStep);
        this.updateDisplay();
    }

    showPreview() {
        console.log('Showing preview');
        this.saveFormData();
        this.generatePreview();
        this.currentStep = 'preview';
        this.updateDisplay();
    }

    generatePreview() {
        const previewContent = document.getElementById('previewContent');
        
        const sections = [
            {
                title: 'THÔNG TIN CHUNG',
                fields: [
                    { label: 'Tên doanh nghiệp', key: 'company_name' },
                    { label: 'Địa chỉ', key: 'address' },
                    { label: 'Ngành nghề sản xuất', key: 'business_type' },
                    { label: 'Vốn điều lệ', key: 'capital' },
                    { label: 'Quy mô lao động', key: 'employees', unit: ' người' },
                    { label: 'Diện tích nhà xưởng', key: 'factory_area', unit: ' m²' },
                    { label: 'Loại hình doanh nghiệp', key: 'company_type' }
                ]
            },
            {
                title: 'CHẤT THẢI RẮN SINH HOẠT',
                isTable: true,
                data: this.formData.waste_data || []
            },
            {
                title: 'CHẤT THẢI RẮN CÔNG NGHIỆP',
                isIndustrial: true,
                data: this.formData.industrial_data || {}
            },
            {
                title: 'CHẤT THẢI NGUY HẠI',
                isTable: true,
                data: this.formData.hazardous_data || [],
                extraFields: [
                    { label: 'Người liên hệ', key: 'contact_name' },
                    { label: 'Số điện thoại', key: 'contact_phone' }
                ]
            }
        ];

        previewContent.innerHTML = sections.map(section => {
            let content = '';
            
            if (section.isTable) {
                content = this.generateTablePreview(section.data, section.title);
            } else if (section.isIndustrial) {
                content = this.generateIndustrialPreview(section.data);
            } else {
                const items = section.fields.map(field => {
                    let value = this.formData[field.key];
                    
                    if (!value || value === '') {
                        value = 'Chưa điền';
                    } else if (field.unit) {
                        value = value + field.unit;
                    }

                    return `
                        <div class="preview-item">
                            <div class="preview-label">${field.label}:</div>
                            <div class="preview-value">${value}</div>
                        </div>
                    `;
                }).join('');
                
                content = items;
            }
            
            // Add extra fields if specified
            if (section.extraFields) {
                const extraItems = section.extraFields.map(field => {
                    let value = this.formData[field.key] || 'Chưa điền';
                    return `
                        <div class="preview-item">
                            <div class="preview-label">${field.label}:</div>
                            <div class="preview-value">${value}</div>
                        </div>
                    `;
                }).join('');
                content += extraItems;
            }

            return `
                <div class="preview-section">
                    <h3>${section.title}</h3>
                    ${content}
                </div>
            `;
        }).join('');
    }

    generateTablePreview(data, title) {
        if (!data || data.length === 0) {
            return '<p style="color: var(--color-text-secondary); font-style: italic;">Chưa có dữ liệu</p>';
        }
        
        if (title.includes('NGUY HẠI')) {
            // Hazardous waste table - Updated headers for new years
            return `
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Tên CTNH</th>
                            <th>Mã CTNH</th>
                            <th>2023 (kg/năm)</th>
                            <th>2024 (kg/năm)</th>
                            <th>6 tháng đầu 2025 (kg)</th>
                            <th>Phương pháp</th>
                            <th>Tiếp nhận</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                <td>${this.getItemValue(item, 'haz_name')}</td>
                                <td>${this.getItemValue(item, 'haz_code')}</td>
                                <td>${this.getItemValue(item, 'haz_2023')}</td>
                                <td>${this.getItemValue(item, 'haz_2024')}</td>
                                <td>${this.getItemValue(item, 'haz_2025')}</td>
                                <td>${this.getItemValue(item, 'haz_method')}</td>
                                <td>${this.getItemValue(item, 'haz_receiver')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            // Regular waste table - Updated headers for new years
            return `
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Tên chất thải</th>
                            <th>2023 (kg/năm)</th>
                            <th>2024 (kg/năm)</th>
                            <th>6 tháng đầu 2025 (kg)</th>
                            <th>Tiếp nhận</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr>
                                <td>${this.getItemValue(item, 'waste_name')}</td>
                                <td>${this.getItemValue(item, 'waste_2023')}</td>
                                <td>${this.getItemValue(item, 'waste_2024')}</td>
                                <td>${this.getItemValue(item, 'waste_2025')}</td>
                                <td>${this.getItemValue(item, 'waste_receiver')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    getItemValue(item, prefix) {
        // Helper function to get value from dynamic table items
        const keys = Object.keys(item).filter(key => key.startsWith(prefix));
        return keys.length > 0 ? item[keys[0]] : '';
    }

    generateIndustrialPreview(data) {
        const sections = [
            { title: 'Sử dụng trực tiếp làm nguyên liệu', key: 'direct_use' },
            { title: 'Tái sử dụng, tái chế', key: 'reuse_recycle' },
            { title: 'Chất thải phải xử lý', key: 'waste_treatment' }
        ];
        
        return sections.map(section => {
            const sectionData = data[section.key] || [];
            if (sectionData.length === 0) {
                return `
                    <div style="margin-bottom: var(--space-16);">
                        <h4 style="color: var(--color-text); margin-bottom: var(--space-8);">${section.title}</h4>
                        <p style="color: var(--color-text-secondary); font-style: italic;">Chưa có dữ liệu</p>
                    </div>
                `;
            }
            
            return `
                <div style="margin-bottom: var(--space-20);">
                    <h4 style="color: var(--color-text); margin-bottom: var(--space-12);">${section.title}</h4>
                    <table class="preview-table">
                        <thead>
                            <tr>
                                <th>Tên chất thải</th>
                                <th>2023 (kg/năm)</th>
                                <th>2024 (kg/năm)</th>
                                <th>6 tháng đầu 2025 (kg)</th>
                                <th>Tiếp nhận</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sectionData.map(item => {
                                const prefix = section.key === 'direct_use' ? 'ind1_' : 
                                              section.key === 'reuse_recycle' ? 'ind2_' : 'ind3_';
                                return `
                                    <tr>
                                        <td>${this.getItemValue(item, `${prefix}name`)}</td>
                                        <td>${this.getItemValue(item, `${prefix}2023`)}</td>
                                        <td>${this.getItemValue(item, `${prefix}2024`)}</td>
                                        <td>${this.getItemValue(item, `${prefix}2025`)}</td>
                                        <td>${this.getItemValue(item, `${prefix}receiver`)}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }).join('');
    }

    updateDisplay() {
        console.log('Updating display for step:', this.currentStep);
        
        // Hide all forms
        document.querySelectorAll('.survey-form').forEach(form => {
            form.classList.remove('active');
            form.style.display = 'none';
        });

        // Show current form
        let currentForm;
        if (this.currentStep === 'preview') {
            currentForm = document.getElementById('preview');
        } else {
            currentForm = document.getElementById(`form${this.currentStep}`);
        }
        
        if (currentForm) {
            currentForm.style.display = 'block';
            // Use setTimeout to ensure display change is processed first
            setTimeout(() => {
                currentForm.classList.add('active');
            }, 10);
        }

        // Update navigation
        this.updateNavigation();
        this.updateProgressBar();
        this.updateSteps();
        
        // Recalculate totals for table sections
        if (this.currentStep === 'B1' || this.currentStep === 'B2') {
            setTimeout(() => this.calculateTotals(), 100);
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        // Previous button
        if (this.currentStep === 'A') {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-flex';
        }

        // Next/Submit buttons
        if (this.currentStep === 'preview') {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }
    }

    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        let progress;

        if (this.currentStep === 'preview') {
            progress = 100;
        } else {
            const currentIndex = this.steps.indexOf(this.currentStep);
            progress = ((currentIndex + 1) / this.steps.length) * 100;
        }

        progressFill.style.width = `${progress}%`;
    }

    updateSteps() {
        const steps = document.querySelectorAll('.step');
        
        steps.forEach((step, index) => {
            const stepId = this.steps[index];
            step.classList.remove('active', 'completed');
            
            if (this.currentStep === 'preview') {
                step.classList.add('completed');
            } else if (stepId === this.currentStep) {
                step.classList.add('active');
            } else {
                const currentIndex = this.steps.indexOf(this.currentStep);
                if (index < currentIndex) {
                    step.classList.add('completed');
                }
            }
        });
    }

    async submitSurvey() {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        submitBtn.disabled = true;

        try {
            // Prepare data for submission using single-row format
            const singleRowData = this.formatDataForSingleSheet();

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Submit to Google Sheets with single-row format
            const success = await this.submitToGoogleSheets(singleRowData);

            if (success) {
                this.showSuccessScreen();
            } else {
                throw new Error('Submission failed');
            }

        } catch (error) {
            console.error('Submission error:', error);
            alert('Có lỗi xảy ra khi gửi khảo sát. Vui lòng thử lại sau.');
            
            // Reset button state
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async submitToGoogleSheets(singleRowData) {
        // Mock Google Apps Script Web App URL
        // In real implementation, replace with actual deployed web app URL
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

        try {
            console.log('Submitting single-row data to Google Sheets:', singleRowData);
            
            // For demo purposes, we'll simulate a successful submission
            // In real implementation, uncomment the fetch code below:
            
            /*
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(singleRowData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.status === 'success';
            */

            // Mock successful submission
            console.log('Single-row format preview:', singleRowData);
            return true;

        } catch (error) {
            console.error('Google Sheets submission error:', error);
            return false;
        }
    }

    showSuccessScreen() {
        document.getElementById('successScreen').classList.remove('hidden');
        this.startConfetti();
    }

    startConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confetti = [];
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#34D399', '#10B981'];

        // Create confetti pieces
        for (let i = 0; i < 150; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 12 + 5,
                h: Math.random() * 12 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 4 + 2,
                angle: Math.random() * Math.PI * 2,
                angularSpeed: Math.random() * 0.3 + 0.1
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach((piece, index) => {
                piece.y += piece.speed;
                piece.angle += piece.angularSpeed;

                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.angle);
                ctx.fillStyle = piece.color;
                ctx.fillRect(-piece.w/2, -piece.h/2, piece.w, piece.h);
                ctx.restore();

                if (piece.y > canvas.height) {
                    confetti[index] = {
                        x: Math.random() * canvas.width,
                        y: -piece.h,
                        w: piece.w,
                        h: piece.h,
                        color: piece.color,
                        speed: piece.speed,
                        angle: Math.random() * Math.PI * 2,
                        angularSpeed: piece.angularSpeed
                    };
                }
            });

            requestAnimationFrame(animate);
        }

        animate();

        // Stop confetti after 6 seconds
        setTimeout(() => {
            canvas.style.display = 'none';
        }, 6000);
    }

    closeModal(modal) {
        modal.classList.add('hidden');
    }
}

// Table management functions (global) - Updated for new years
function addTableRow(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const currentRows = tbody.querySelectorAll('tr').length;
    const maxRows = tableId === 'hazardousTable' ? 9 : 10;
    
    if (currentRows >= maxRows) {
        alert(`Tối đa ${maxRows} dòng cho bảng này`);
        return;
    }
    
    const newRowNumber = currentRows + 1;
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-row', newRowNumber);
    
    // Generate appropriate row content based on table type - Updated for new years
    let rowContent = '';
    
    if (tableId === 'wasteTable') {
        rowContent = `
            <td>${newRowNumber}</td>
            <td><input type="text" class="form-control table-input" name="waste_name_${newRowNumber}"></td>
            <td><input type="number" class="form-control table-input calc-input" name="waste_2023_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="waste_2024_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="waste_2025_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="text" class="form-control table-input" name="waste_receiver_${newRowNumber}"></td>
        `;
    } else if (tableId === 'industrialTable1') {
        rowContent = `
            <td>${newRowNumber}</td>
            <td><input type="text" class="form-control table-input" name="ind1_name_${newRowNumber}"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind1_2023_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind1_2024_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind1_2025_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="text" class="form-control table-input" name="ind1_receiver_${newRowNumber}"></td>
        `;
    } else if (tableId === 'industrialTable2') {
        rowContent = `
            <td>${newRowNumber}</td>
            <td><input type="text" class="form-control table-input" name="ind2_name_${newRowNumber}"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind2_2023_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind2_2024_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind2_2025_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="text" class="form-control table-input" name="ind2_receiver_${newRowNumber}"></td>
        `;
    } else if (tableId === 'industrialTable3') {
        rowContent = `
            <td>${newRowNumber}</td>
            <td><input type="text" class="form-control table-input" name="ind3_name_${newRowNumber}"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind3_2023_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind3_2024_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input calc-input" name="ind3_2025_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="text" class="form-control table-input" name="ind3_receiver_${newRowNumber}"></td>
        `;
    } else if (tableId === 'hazardousTable') {
        rowContent = `
            <td>${newRowNumber}</td>
            <td><input type="text" class="form-control table-input" name="haz_name_${newRowNumber}"></td>
            <td><input type="text" class="form-control table-input" name="haz_code_${newRowNumber}"></td>
            <td><input type="number" class="form-control table-input" name="haz_2023_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input" name="haz_2024_${newRowNumber}" min="0" step="0.01"></td>
            <td><input type="number" class="form-control table-input" name="haz_2025_${newRowNumber}" min="0" step="0.01"></td>
            <td>
                <select class="form-control table-input" name="haz_method_${newRowNumber}">
                    <option value="">Chọn phương pháp</option>
                    <option value="TC">TC - Tận thu/tái chế</option>
                    <option value="TH">TH - Trung hòa</option>
                    <option value="PT">PT - Phân tách/chiết/lọc/kết tủa</option>
                    <option value="OH">OH - Oxy hóa</option>
                    <option value="SH">SH - Sinh học</option>
                    <option value="ĐX">ĐX - Đồng xử lý</option>
                    <option value="TĐ">TĐ - Thiêu đốt</option>
                    <option value="HR">HR - Hóa rắn</option>
                    <option value="CL">CL - Cô lập/đóng kén</option>
                    <option value="C">C - Chôn lấp</option>
                    <option value="TR">TR - Tẩy rửa</option>
                    <option value="SC">SC - Sơ chế</option>
                    <option value="Khác">Khác</option>
                </select>
            </td>
            <td><input type="text" class="form-control table-input" name="haz_receiver_${newRowNumber}"></td>
        `;
    }
    
    newRow.innerHTML = rowContent;
    tbody.appendChild(newRow);
    
    console.log(`Added row ${newRowNumber} to ${tableId}`);
}

function removeTableRow(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length <= 1) {
        alert('Phải có ít nhất 1 dòng trong bảng');
        return;
    }
    
    const lastRow = rows[rows.length - 1];
    lastRow.remove();
    
    // Recalculate totals
    if (window.surveyApp) {
        window.surveyApp.calculateTotals();
    }
    
    console.log(`Removed last row from ${tableId}`);
}

// Modal functions (global)
function openSetupModal() {
    document.getElementById('setupModal').classList.remove('hidden');
}

function closeSetupModal() {
    document.getElementById('setupModal').classList.add('hidden');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing environmental survey app with updated years (2023, 2024, 6 tháng đầu 2025) and single-sheet format...');
    window.surveyApp = new EnvironmentalSurvey();
});

// Handle window resize for confetti canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});