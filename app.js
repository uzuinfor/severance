document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Tabs
    const tabs = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // DOM Elements - Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    // DOM Elements - Calculator Form
    const joinDateInput = document.getElementById('joinDate');
    const retireDateInput = document.getElementById('retireDate');
    const workingDaysAlert = document.getElementById('workingDaysAlert');
    const totalWorkingDaysText = document.getElementById('totalWorkingDaysText');
    const underOneYearWarning = document.getElementById('underOneYearWarning');
    const monthlySalaryInput = document.getElementById('monthlySalary');
    const annualBonusInput = document.getElementById('annualBonus');
    const annualLeaveAllowanceInput = document.getElementById('annualLeaveAllowance');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');

    // DOM Elements - Calculator Results
    const resultsColumn = document.getElementById('resultsColumn');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const finalSeverancePay = document.getElementById('finalSeverancePay');
    const printBtn = document.getElementById('printBtn');
    const sendToTaxBtn = document.getElementById('sendToTaxBtn');
    
    // DOM Elements - Breakdown
    const bdWorkingDays = document.getElementById('bdWorkingDays');
    const bd3MonthWages = document.getElementById('bd3MonthWages');
    const bdBonusAdded = document.getElementById('bdBonusAdded');
    const bdLeaveAdded = document.getElementById('bdLeaveAdded');
    const bdDailyAverageWage = document.getElementById('bdDailyAverageWage');

    // DOM Elements - Tax Estimator
    const taxSeveranceAmount = document.getElementById('taxSeveranceAmount');
    const taxServiceYears = document.getElementById('taxServiceYears');
    const irpTransferSelect = document.getElementById('irpTransferSelect');
    const taxCalculateBtn = document.getElementById('taxCalculateBtn');
    const taxResultsColumn = document.getElementById('taxResultsColumn');
    const taxResultsPlaceholder = document.getElementById('taxResultsPlaceholder');
    const taxNetReceived = document.getElementById('taxNetReceived');
    const taxTotalTaxText = document.getElementById('taxTotalTaxText');
    const taxPercentBar = document.getElementById('taxPercentBar');
    
    const taxBdSeverance = document.getElementById('taxBdSeverance');
    const taxBdServiceDeduct = document.getElementById('taxBdServiceDeduct');
    const taxBdConvertedWage = document.getElementById('taxBdConvertedWage');
    const taxBdConvertedDeduct = document.getElementById('taxBdConvertedDeduct');
    const taxBdBase = document.getElementById('taxBdBase');
    const taxBdRawTax = document.getElementById('taxBdRawTax');
    const irpDeductRow = document.getElementById('irpDeductRow');
    const taxBdIrpDeduct = document.getElementById('taxBdIrpDeduct');
    const taxBdLocalTax = document.getElementById('taxBdLocalTax');
    const taxBdTotalTax = document.getElementById('taxBdTotalTax');
    const taxEffectiveRate = document.getElementById('taxEffectiveRate');

    // DOM Elements - History
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    // Global variables
    let computedSeverancePay = 0;
    let computedServiceYears = 1;

    // --- Core Formatting Helpers ---
    function formatNumber(num) {
        if (isNaN(num)) return '0';
        return Math.round(num).toLocaleString('ko-KR');
    }

    function parseFormattedNumber(str) {
        if (!str) return 0;
        return parseFloat(str.replace(/,/g, '')) || 0;
    }

    // Format inputs as typing (adds commas)
    function setupNumericFormatting(inputElement) {
        inputElement.addEventListener('input', (e) => {
            const rawVal = e.target.value.replace(/[^0-9]/g, '');
            if (rawVal) {
                e.target.value = parseInt(rawVal, 10).toLocaleString('ko-KR');
            } else {
                e.target.value = '';
            }
        });
    }

    document.querySelectorAll('.numeric-input').forEach(setupNumericFormatting);

    // --- Date Calculation Helpers ---
    function formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}.${m}.${d}`;
    }

    function calculateTotalDays(start, end) {
        return Math.round((end - start) / (1000 * 60 * 60 * 24));
    }

    // Generate preceding 3-month calendar sub-periods
    function getCalculationPeriods(retireDate) {
        const end = new Date(retireDate);
        end.setDate(end.getDate() - 1); // Last working day
        
        const start = new Date(retireDate);
        start.setMonth(start.getMonth() - 3);
        
        const periods = [];
        let current = new Date(start);
        
        while (current <= end) {
            let periodStart = new Date(current);
            let periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
            if (periodEnd > end) {
                periodEnd = new Date(end);
            }
            
            const days = calculateTotalDays(periodStart, periodEnd) + 1;
            periods.push({
                start: periodStart,
                end: periodEnd,
                days: days,
                startStr: formatDate(periodStart),
                endStr: formatDate(periodEnd)
            });
            
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }
        return periods;
    }

    // --- Interactive Period Update ---
    function handleDatesChange() {
        const joinDateStr = joinDateInput.value;
        const retireDateStr = retireDateInput.value;

        if (!joinDateStr || !retireDateStr) {
            return;
        }

        const joinDate = new Date(joinDateStr);
        const retireDate = new Date(retireDateStr);

        if (retireDate <= joinDate) {
            alert('퇴직일은 입사일 이후여야 합니다.');
            retireDateInput.value = '';
            return;
        }

        const workingDays = calculateTotalDays(joinDate, retireDate);
        totalWorkingDaysText.textContent = workingDays;
        workingDaysAlert.classList.remove('hidden');

        if (workingDays < 365) {
            underOneYearWarning.classList.remove('hidden');
        } else {
            underOneYearWarning.classList.add('hidden');
        }
    }

    joinDateInput.addEventListener('change', handleDatesChange);
    retireDateInput.addEventListener('change', handleDatesChange);

    // --- Main calculation Logic ---
    function runSeveranceCalculation() {
        const joinDateStr = joinDateInput.value;
        const retireDateStr = retireDateInput.value;

        if (!joinDateStr || !retireDateStr) {
            alert('입사일과 퇴직일을 입력해주세요.');
            return;
        }

        const joinDate = new Date(joinDateStr);
        const retireDate = new Date(retireDateStr);
        const workingDays = calculateTotalDays(joinDate, retireDate);

        const monthlySalary = parseFormattedNumber(monthlySalaryInput.value);
        if (monthlySalary <= 0) {
            alert('월급을 입력해주세요.');
            return;
        }

        const annualBonus = parseFormattedNumber(annualBonusInput.value);
        const annualLeaveAllowance = parseFormattedNumber(annualLeaveAllowanceInput.value);

        const periods = getCalculationPeriods(retireDate);
        let sum3MonthDays = 0;
        periods.forEach(p => sum3MonthDays += p.days);

        if (sum3MonthDays === 0) {
            alert('날짜 기간을 확인해주세요.');
            return;
        }

        const bonusFraction = annualBonus * 3 / 12;
        const leaveFraction = annualLeaveAllowance * 3 / 12;

        const totalWagesSum = monthlySalary * 3;
        const totalAverageBaseSum = totalWagesSum + bonusFraction + leaveFraction;

        const dailyAverageWage = totalAverageBaseSum / sum3MonthDays;
        const severancePay = dailyAverageWage * 30 * (workingDays / 365);

        computedSeverancePay = Math.floor(severancePay);
        computedServiceYears = Math.max(1, Math.ceil(workingDays / 365));

        finalSeverancePay.textContent = formatNumber(computedSeverancePay);
        bdWorkingDays.textContent = workingDays;
        bd3MonthWages.textContent = formatNumber(totalWagesSum);
        bdBonusAdded.textContent = formatNumber(bonusFraction);
        bdLeaveAdded.textContent = formatNumber(leaveFraction);
        bdDailyAverageWage.textContent = formatNumber(dailyAverageWage);

        resultsColumn.classList.remove('hidden');

        saveHistoryItem(joinDateStr, retireDateStr, workingDays, computedSeverancePay, monthlySalary, annualBonus, annualLeaveAllowance);
    }

    calculateBtn.addEventListener('click', runSeveranceCalculation);

    // --- Reset Form Helper ---
    function resetCalculator() {
        joinDateInput.value = '';
        retireDateInput.value = '';
        monthlySalaryInput.value = '';
        annualBonusInput.value = '';
        annualLeaveAllowanceInput.value = '';
        
        totalWorkingDaysText.textContent = '0';
        workingDaysAlert.classList.add('hidden');
        underOneYearWarning.classList.add('hidden');

        resultsColumn.classList.add('hidden');
        if (resultsPlaceholder) {
            resultsPlaceholder.classList.remove('hidden');
        }
    }

    resetBtn.addEventListener('click', resetCalculator);

    // --- Tax Calculations (2025/2026 Tax Code) ---
    function calculateSeveranceTax() {
        const rawAmount = parseFormattedNumber(taxSeveranceAmount.value);
        const years = parseInt(taxServiceYears.value, 10) || 1;
        const irpMode = irpTransferSelect.value;

        if (rawAmount <= 0) {
            alert('퇴직급여액을 바르게 입력해주세요.');
            return;
        }

        // 1. Service Years Deduction (근속연수공제)
        let serviceDeduction = 0;
        if (years <= 5) {
            serviceDeduction = 1000000 * years;
        } else if (years <= 10) {
            serviceDeduction = 5000000 + 2000000 * (years - 5);
        } else if (years <= 20) {
            serviceDeduction = 15000000 + 2500000 * (years - 10);
        } else {
            serviceDeduction = 40000000 + 3000000 * (years - 20);
        }

        // 2. Converted Wage (환산급여)
        // Converted wage = (Severance - Service Deduction) / years * 12
        const amountAfterServiceDeduct = Math.max(0, rawAmount - serviceDeduction);
        const convertedWage = (amountAfterServiceDeduct / years) * 12;

        // 3. Converted Wage Deduction (환산급여공제)
        let convertedDeduction = 0;
        if (convertedWage <= 8000000) {
            convertedDeduction = convertedWage;
        } else if (convertedWage <= 70000000) {
            convertedDeduction = 8000000 + (convertedWage - 8000000) * 0.60;
        } else if (convertedWage <= 100000000) {
            convertedDeduction = 45200000 + (convertedWage - 70000000) * 0.55;
        } else if (convertedWage <= 300000000) {
            convertedDeduction = 61700000 + (convertedWage - 100000000) * 0.45;
        } else {
            convertedDeduction = 151700000 + (convertedWage - 300000000) * 0.35;
        }

        // 4. Taxable Converted Base (과세표준)
        const taxableBase = Math.max(0, convertedWage - convertedDeduction);

        // 5. Basic progressive tax rates
        let baseTax = 0;
        if (taxableBase <= 14000000) {
            baseTax = taxableBase * 0.06;
        } else if (taxableBase <= 50000000) {
            baseTax = taxableBase * 0.15 - 1260000;
        } else if (taxableBase <= 88000000) {
            baseTax = taxableBase * 0.24 - 5760000;
        } else if (taxableBase <= 150000000) {
            baseTax = taxableBase * 0.35 - 15440000;
        } else if (taxableBase <= 300000000) {
            baseTax = taxableBase * 0.38 - 19940000;
        } else if (taxableBase <= 500000000) {
            baseTax = taxableBase * 0.40 - 25940000;
        } else if (taxableBase <= 1000000000) {
            baseTax = taxableBase * 0.42 - 35940000;
        } else {
            baseTax = taxableBase * 0.45 - 65940000;
        }

        // 6. Calculated Tax (산출세액 = 기본 세액 / 12 * years)
        let calculatedTax = (baseTax / 12) * years;
        calculatedTax = Math.floor(calculatedTax / 10) * 10; // Round to nearest 10 won

        // 7. IRP (Pension) Transfer Tax Cut
        let irpCut = 0;
        if (irpMode === 'yes-10') {
            irpCut = calculatedTax * 0.30;
        } else if (irpMode === 'yes-over10') {
            irpCut = calculatedTax * 0.40;
        }
        const netIncomeTax = Math.floor((calculatedTax - irpCut) / 10) * 10;

        // 8. Local Income Tax (지방소득세: 10% of Income Tax)
        const localTax = Math.floor((netIncomeTax * 0.1) / 10) * 10;

        const totalTaxSum = netIncomeTax + localTax;
        const netReceivedAmount = Math.max(0, rawAmount - totalTaxSum);
        const effectiveRate = rawAmount > 0 ? ((totalTaxSum / rawAmount) * 100).toFixed(2) : 0;

        // Render tax outcomes
        taxNetReceived.textContent = formatNumber(netReceivedAmount);
        taxTotalTaxText.textContent = `${formatNumber(totalTaxSum)}원`;
        
        const taxPercentage = Math.min(100, Math.round((totalTaxSum / rawAmount) * 100) || 0);
        taxPercentBar.style.width = `${taxPercentage}%`;

        // Detailed panel
        taxBdSeverance.textContent = formatNumber(rawAmount);
        taxBdServiceDeduct.textContent = formatNumber(serviceDeduction);
        taxBdConvertedWage.textContent = formatNumber(convertedWage);
        taxBdConvertedDeduct.textContent = formatNumber(convertedDeduction);
        taxBdBase.textContent = formatNumber(taxableBase);
        taxBdRawTax.textContent = formatNumber(calculatedTax);
        
        if (irpCut > 0) {
            irpDeductRow.classList.remove('hidden');
            taxBdIrpDeduct.textContent = formatNumber(irpCut);
        } else {
            irpDeductRow.classList.add('hidden');
        }
        
        taxBdLocalTax.textContent = formatNumber(localTax);
        taxBdTotalTax.textContent = formatNumber(totalTaxSum);
        taxEffectiveRate.textContent = effectiveRate;

        // Show Tax Outcomes Box
        taxResultsPlaceholder.classList.add('hidden');
        taxResultsColumn.classList.remove('hidden');
    }

    taxCalculateBtn.addEventListener('click', calculateSeveranceTax);

    // --- Tab Switching System ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.id === 'tabBtnCalc' ? 'tabContentCalc' : 
                             tab.id === 'tabBtnTax' ? 'tabContentTax' : 'tabContentGuide';
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Send Calculated Severance directly to Tax Tab
    sendToTaxBtn.addEventListener('click', () => {
        taxSeveranceAmount.value = computedSeverancePay.toLocaleString('ko-KR');
        taxServiceYears.value = computedServiceYears;
        
        // Trigger tab click
        document.getElementById('tabBtnTax').click();
        
        // Trigger tax calculation immediately
        calculateSeveranceTax();
    });

    // --- Print functionality ---
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // --- Theme Toggle System ---
    function toggleTheme() {
        const isDark = document.body.classList.contains('theme-dark');
        if (isDark) {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('theme-light');
            document.body.classList.add('theme-dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    // Load initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
    }
    
    themeToggleBtn.addEventListener('click', toggleTheme);

    // --- Calculation History System ---
    function saveHistoryItem(joinDate, retireDate, days, amount, salary, bonus, leave) {
        let history = JSON.parse(localStorage.getItem('severance_history')) || [];
        
        // Keep unique entries
        history = history.filter(item => !(item.join === joinDate && item.retire === retireDate));
        
        history.unshift({
            join: joinDate,
            retire: retireDate,
            days: days,
            amount: amount,
            salary: salary,
            bonus: bonus,
            leave: leave,
            timestamp: Date.now()
        });

        // Cap history at 5 items
        if (history.length > 5) {
            history.pop();
        }

        localStorage.setItem('severance_history', JSON.stringify(history));
        loadHistoryList();
    }

    function loadHistoryList() {
        const history = JSON.parse(localStorage.getItem('severance_history')) || [];
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="empty-history">기록이 없습니다.</div>';
            return;
        }

        historyList.innerHTML = '';
        history.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="date-range">${item.join} ~ ${item.retire}</div>
                <div class="summary">
                    <span>재직 ${item.days}일</span>
                    <strong>${formatNumber(item.amount)}원</strong>
                </div>
            `;
            div.addEventListener('click', () => {
                joinDateInput.value = item.join;
                retireDateInput.value = item.retire;
                monthlySalaryInput.value = item.salary ? formatNumber(item.salary) : '';
                annualBonusInput.value = item.bonus ? formatNumber(item.bonus) : '';
                annualLeaveAllowanceInput.value = item.leave ? formatNumber(item.leave) : '';
                handleDatesChange();
                runSeveranceCalculation();
            });
            historyList.appendChild(div);
        });
    }

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('severance_history');
        loadHistoryList();
    });

    // Load history on start
    loadHistoryList();

    // Dynamic Visitor Counter Engine (Today & Total)
    function initVisitorCounter(siteKey, baseToday, baseTotal) {
        const todayElem = document.getElementById('visitorToday');
        const totalElem = document.getElementById('visitorTotal');
        if (!todayElem || !totalElem) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const savedDate = localStorage.getItem(`${siteKey}_visit_date`);
        let todayCount = parseInt(localStorage.getItem(`${siteKey}_today_count`) || '0', 10);
        let totalCount = parseInt(localStorage.getItem(`${siteKey}_total_count`) || '0', 10);

        if (savedDate !== todayStr) {
            todayCount = baseToday + Math.floor(Math.random() * 12);
            if (totalCount < baseTotal) totalCount = baseTotal;
            localStorage.setItem(`${siteKey}_visit_date`, todayStr);
        } else {
            if (todayCount < baseToday) todayCount = baseToday;
            if (totalCount < baseTotal) totalCount = baseTotal;
        }

        todayCount += 1;
        totalCount += 1;

        localStorage.setItem(`${siteKey}_today_count`, todayCount.toString());
        localStorage.setItem(`${siteKey}_total_count`, totalCount.toString());

        todayElem.textContent = todayCount.toLocaleString();
        totalElem.textContent = totalCount.toLocaleString();
    }

    initVisitorCounter('severance', 3, 10);

    // Privacy Policy Modal Handler
    const btnPrivacyPolicy = document.getElementById('btnPrivacyPolicy');
    const privacyModalOverlay = document.getElementById('privacyModalOverlay');
    const privacyModalCloseBtn = document.getElementById('privacyModalCloseBtn');

    if (btnPrivacyPolicy && privacyModalOverlay) {
        btnPrivacyPolicy.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    if (privacyModalCloseBtn && privacyModalOverlay) {
        privacyModalCloseBtn.addEventListener('click', () => {
            privacyModalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    if (privacyModalOverlay) {
        privacyModalOverlay.addEventListener('click', (e) => {
            if (e.target === privacyModalOverlay) {
                privacyModalOverlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});
