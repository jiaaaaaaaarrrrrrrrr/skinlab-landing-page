// Skin Lab 皮肤科学实验室 - 完整优化版
document.addEventListener('DOMContentLoaded', function() {
    // ========== Google Analytics 事件追踪 ==========
    function trackEvent(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        console.log(`GA Event: ${category} - ${action} - ${label}`);
    }
    
    // ========== 配置 ==========
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxPLsuGT9dyLsaKKyUt3C-WRwJaCgydSZOM-z95mM91a-uZmI_baZBejNFeZfcPyy8wlQ/exec';
    
    // ========== 日期配置 ==========
    const ACTIVITY_CONFIG = {
        startDate: '2026-01-10',
        endDate: '2026-01-17',
        registrationDeadline: '2026-01-08', // 报名截止日期
        showCountdown: true,
        autoHideAfterDeadline: true
    };
    
    // ========== DOM 元素 ==========
    const logoAnimation = document.getElementById('logoAnimation');
    const formModal = document.getElementById('formModal');
    const closeModal = document.getElementById('closeModal');
    const mainCta = document.getElementById('mainCta');
    const actionCta = document.getElementById('actionCta');
    const reservationForm = document.getElementById('reservationForm');
    const submitForm = document.getElementById('submitForm');
    const tablePopup = document.getElementById('tablePopup');
    const closeTable = document.getElementById('closeTable');
    const tableBody = document.getElementById('tableBody');
    const faqItems = document.querySelectorAll('.faq-item');
    const formWarningEl = document.getElementById('formWarning');
    const warningTextEl = document.getElementById('warningText');
    const countdownDisplay = document.getElementById('countdownDisplay');
    const activityDateElements = document.querySelectorAll('.activity-date');
    const deadlineDateElements = document.querySelectorAll('.deadline-date');
    
    // ========== 状态变量 ==========
    let hasSubmitted = false;
    let scrollDepthTriggered = false;
    let timerTriggered = false;
    let logoAnimationCompleted = false;
    let tableShownCount = 0;
    const MAX_TABLE_SHOW = 3;
    let tableUpdateTimer = null;
    let nameRotationIndex = 0;
    let countdownTimer = null;
    let isRegistrationOpen = true;
    
    // ========== 姓名数据库 ==========
    const nameDatabase = {
        chineseNames: [
            '张伟', '王明', '李娜', '陈静', '刘洋', '黄丽', '周强', '吴芳',
            '郑浩', '孙婷', '马超', '朱敏', '胡伟', '林芳', '郭强', '何静',
            '高翔', '罗敏', '宋伟', '谢芳'
        ],
        englishNames: [
            'Sarah Lim', 'Ahmad Tan', 'Priya Chen', 'Michael Wong',
            'Emily Lee', 'David Ng', 'Jessica Lim', 'Kevin Tan',
            'Amanda Wong', 'Jason Chen', 'Sophia Lee', 'Daniel Ng',
            'Olivia Tan', 'Ethan Lim', 'Emma Wong', 'Lucas Chen',
            'Mia Lee', 'Noah Tan', 'Ava Lim', 'Liam Wong'
        ],
        malayNames: [
            'Siti Aishah', 'Mohammad Ali', 'Nurul Huda', 'Ahmad Faiz',
            'Fatimah Zahra', 'Hassan Ibrahim', 'Aisyah Nur', 'Zainal Abidin',
            'Rohana Binti', 'Kamal Hisham', 'Norhayati Binti', 'Rosli Bin',
            'Maznah Binti', 'Halim Shah', 'Salina Binti', 'Rahim Abdullah'
        ]
    };
    
    // ========== 肤质类型 ==========
    const skinTypes = ['混合肌', '油性肌', '敏感肌', '干性肌', '痘痘肌', '中性肌'];
    
    // ========== 初始化 ==========
    function init() {
        handleLogoAnimation();
        setupEventListeners();
        setupScrollListener();
        setupTimerPopup();
        initFAQ();
        startTablePopupTimer();
        
        // 初始化日期功能
        initDateFeatures();
        
        // 检查设备类型并优化
        optimizeForDevice();
        
        // 检查报名截止状态
        checkRegistrationDeadline();
        
        // 追踪页面浏览
        trackEvent('Page', 'View', 'Landing Page Loaded');
    }
    
    // ========== 初始化日期功能 ==========
    function initDateFeatures() {
        updateDateDisplay();
        setupCountdownTimer();
    }
    
    function updateDateDisplay() {
        // 更新活动日期显示
        activityDateElements.forEach(el => {
            el.textContent = `${formatDate(ACTIVITY_CONFIG.startDate)} → ${formatDate(ACTIVITY_CONFIG.endDate)}`;
        });
        
        // 更新截止日期显示
        deadlineDateElements.forEach(el => {
            el.textContent = `报名截止: ${formatDate(ACTIVITY_CONFIG.registrationDeadline)}`;
        });
    }
    
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    function setupCountdownTimer() {
        const deadline = new Date(ACTIVITY_CONFIG.registrationDeadline);
        const now = new Date();
        
        if (now < deadline) {
            updateCountdown();
            countdownTimer = setInterval(updateCountdown, 1000);
        } else {
            countdownDisplay.innerHTML = '报名已截止';
            isRegistrationOpen = false;
            disableRegistration();
        }
    }
    
    function updateCountdown() {
        const deadline = new Date(ACTIVITY_CONFIG.registrationDeadline);
        const now = new Date();
        const diff = deadline - now;
        
        if (diff <= 0) {
            countdownDisplay.innerHTML = '报名已截止';
            clearInterval(countdownTimer);
            isRegistrationOpen = false;
            disableRegistration();
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownDisplay.innerHTML = `
            <span>${days}</span>天
            <span>${hours.toString().padStart(2, '0')}</span>:
            <span>${minutes.toString().padStart(2, '0')}</span>:
            <span>${seconds.toString().padStart(2, '0')}</span>
        `;
    }
    
    function checkRegistrationDeadline() {
        const deadline = new Date(ACTIVITY_CONFIG.registrationDeadline);
        const now = new Date();
        
        if (now > deadline) {
            isRegistrationOpen = false;
            disableRegistration();
        }
    }
    
    function disableRegistration() {
        // 禁用CTA按钮
        mainCta.disabled = true;
        actionCta.disabled = true;
        mainCta.innerHTML = '<span>报名已截止</span>';
        actionCta.innerHTML = '<span>报名已截止</span>';
        
        // 移除动画效果
        mainCta.classList.remove('pulse-animation');
        actionCta.classList.remove('pulse-animation');
        
        // 添加提示
        const warning = document.createElement('div');
        warning.className = 'registration-closed';
        warning.innerHTML = '<i class="fas fa-exclamation-circle"></i> 报名已截止，感谢您的关注';
        warning.style.cssText = 'background: var(--danger); color: white; padding: 10px 20px; border-radius: 8px; margin-top: 10px; text-align: center;';
        
        mainCta.parentNode.insertBefore(warning, mainCta.nextSibling);
        actionCta.parentNode.insertBefore(warning.cloneNode(true), actionCta.nextSibling);
    }
    
    // ========== 设备优化 ==========
    function optimizeForDevice() {
        const html = document.documentElement;
        
        // 根据设备类型添加优化类
        if (html.classList.contains('mobile-device')) {
            // 移动设备优化
            if (html.classList.contains('ios')) {
                // iOS设备特殊优化
                optimizeForIOS();
            }
            
            if (html.classList.contains('android')) {
                // Android设备特殊优化
                optimizeForAndroid();
            }
            
            if (html.classList.contains('wechat-browser')) {
                // 微信浏览器内优化
                optimizeForWeChat();
            }
        }
        
        // 检测网络类型
        detectNetworkAndOptimize();
        
        // 检测电池状态
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.3) {
                    html.classList.add('low-battery');
                    reduceAnimations();
                }
            });
        }
    }
    
    function optimizeForIOS() {
        // iOS设备优化
        document.body.style.webkitTapHighlightColor = 'transparent';
        
        // 修复iOS滚动问题
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        
        // 添加iOS特有的触摸事件处理
        const touchElements = document.querySelectorAll('button, .data-card, .pain-point');
        touchElements.forEach(el => {
            el.style.webkitTouchCallout = 'none';
            el.style.webkitUserSelect = 'none';
        });
    }
    
    function optimizeForAndroid() {
        // Android设备优化
        document.body.style.touchAction = 'manipulation';
        
        // 防止Android上的双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    function optimizeForWeChat() {
        // 微信浏览器内优化
        document.body.style.fontFamily = "'Noto Sans SC', 'PingFang SC', sans-serif";
        
        // 微信内增加分享提示
        if (typeof WeixinJSBridge !== 'undefined') {
            WeixinJSBridge.on('menu:share:appmessage', function(argv) {
                trackEvent('WeChat', 'Share', 'App Message');
            });
        }
    }
    
    function detectNetworkAndOptimize() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // 低速网络优化
                document.documentElement.classList.add('slow-network');
                reduceImageQuality();
                reduceAnimations();
            }
        }
    }
    
    function reduceImageQuality() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src.includes('hero-person')) {
                // 如果是主图，使用低质量版本
                img.loading = 'lazy';
                img.decoding = 'async';
            }
        });
    }
    
    function reduceAnimations() {
        // 减少动画以节省性能
        document.querySelectorAll('*').forEach(el => {
            el.style.animationDuration = '0s';
            el.style.transitionDuration = '0s';
        });
    }
    
    // ========== Logo动画处理 ==========
    function handleLogoAnimation() {
        const hasSeenLogo = sessionStorage.getItem('skinlab_logo_seen');
        
        if (hasSeenLogo) {
            logoAnimation.style.display = 'none';
            logoAnimationCompleted = true;
        } else {
            logoAnimation.style.display = 'flex';
            
            setTimeout(() => {
                logoAnimation.style.display = 'none';
                logoAnimationCompleted = true;
                sessionStorage.setItem('skinlab_logo_seen', 'true');
                trackEvent('Animation', 'Complete', 'Logo Animation');
            }, 2800);
        }
        
        window.addEventListener('scroll', function() {
            if (!logoAnimationCompleted && window.scrollY > 100) {
                logoAnimation.style.display = 'none';
                logoAnimationCompleted = true;
                sessionStorage.setItem('skinlab_logo_seen', 'true');
                trackEvent('Interaction', 'Skip', 'Logo Animation Skipped');
            }
        });
    }
    
    // ========== 表格弹窗定时器 ==========
    function startTablePopupTimer() {
        // 每30秒显示一次表格
        tableUpdateTimer = setInterval(() => {
            if (tableShownCount < MAX_TABLE_SHOW) {
                showTablePopup();
                tableShownCount++;
                
                // 10秒后自动隐藏
                setTimeout(() => {
                    hideTablePopup();
                }, 10000);
            } else {
                clearInterval(tableUpdateTimer);
            }
        }, 30000); // 30秒间隔
    }
    
    // ========== 显示表格弹窗 ==========
    function showTablePopup() {
        tablePopup.classList.remove('hide');
        tablePopup.classList.add('show');
        generateTableData();
        trackEvent('Popup', 'Show', 'Table Popup');
    }
    
    // ========== 隐藏表格弹窗 ==========
    function hideTablePopup() {
        tablePopup.classList.remove('show');
        tablePopup.classList.add('hide');
        trackEvent('Popup', 'Hide', 'Table Popup');
    }
    
    // ========== 生成表格数据（每次不同） ==========
    function generateTableData() {
        const times = ['09:30', '10:15', '11:00', '14:30', '15:45', '16:20', '17:00', '18:30'];
        const statuses = ['已确认', '待确认'];
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 每次生成8条随机数据
        for (let i = 0; i < 8; i++) {
            const row = document.createElement('tr');
            
            // 随机选择姓名类型
            const nameType = Math.floor(Math.random() * 3);
            let name = '';
            
            switch (nameType) {
                case 0:
                    name = nameDatabase.chineseNames[Math.floor(Math.random() * nameDatabase.chineseNames.length)];
                    break;
                case 1:
                    name = nameDatabase.englishNames[Math.floor(Math.random() * nameDatabase.englishNames.length)];
                    break;
                case 2:
                    name = nameDatabase.malayNames[Math.floor(Math.random() * nameDatabase.malayNames.length)];
                    break;
            }
            
            const skinType = skinTypes[Math.floor(Math.random() * skinTypes.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const timeIndex = (nameRotationIndex + i) % times.length;
            
            // 添加状态颜色
            let statusClass = status === '已确认' ? 'status-confirmed' : 'status-pending';
            
            row.innerHTML = `
                <td>${times[timeIndex]}</td>
                <td class="name-cell">${name}</td>
                <td>${skinType}</td>
                <td class="${statusClass}">${status}</td>
            `;
            
            tableBody.appendChild(row);
        }
        
        // 更新姓名旋转索引
        nameRotationIndex = (nameRotationIndex + 1) % times.length;
        
        // 添加动画效果
        tableBody.classList.add('table-slide-in');
        setTimeout(() => {
            tableBody.classList.remove('table-slide-in');
        }, 500);
    }
    
    // ========== 设置事件监听器 ==========
    function setupEventListeners() {
        // CTA按钮点击
        mainCta.addEventListener('click', () => {
            if (isRegistrationOpen) {
                openModal();
                trackEvent('CTA', 'Click', 'Main CTA Button');
            }
        });
        
        actionCta.addEventListener('click', () => {
            if (isRegistrationOpen) {
                openModal();
                trackEvent('CTA', 'Click', 'Action CTA Button');
            }
        });
        
        // 模态框关闭
        closeModal.addEventListener('click', closeModalFunc);
        formModal.addEventListener('click', function(e) {
            if (e.target === formModal) {
                closeModalFunc();
                trackEvent('Modal', 'Close', 'Click Outside');
            }
        });
        
        // 表格弹窗关闭
        closeTable.addEventListener('click', () => {
            hideTablePopup();
            trackEvent('Table', 'Close', 'Close Button');
        });
        
        // 表单提交
        reservationForm.addEventListener('submit', handleFormSubmit);
        
        // 键盘事件
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && formModal.classList.contains('active')) {
                closeModalFunc();
                trackEvent('Modal', 'Close', 'Escape Key');
            }
        });
        
        // 移动端优化 - 改善触摸反馈
        setupMobileTouchOptimizations();
        
        // 视差效果
        setupParallaxEffect();
    }
    
    // ========== 移动端触摸优化 ==========
    function setupMobileTouchOptimizations() {
        const touchElements = document.querySelectorAll('button, .data-card, .pain-point, .testimonial, .faq-question');
        
        touchElements.forEach(el => {
            el.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            el.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
            
            el.addEventListener('touchcancel', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    // ========== 视差效果 ==========
    function setupParallaxEffect() {
        const personFrame = document.querySelector('.person-frame');
        if (!personFrame) return;
        
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            personFrame.style.transform = `perspective(1500px) rotateY(-12deg) rotateX(5deg) translateY(${rate}px)`;
        });
    }
    
    // ========== 打开模态框 ==========
    function openModal() {
        if (!isRegistrationOpen) {
            showWarning('抱歉，报名已截止');
            return;
        }
        
        formModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            formModal.classList.add('modal-open');
        }, 10);
        
        reservationForm.reset();
        clearWarning();
        trackEvent('Modal', 'Open', 'Form Modal');
    }
    
    // ========== 关闭模态框 ==========
    function closeModalFunc() {
        formModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        formModal.classList.remove('modal-open');
    }
    
    // ========== 滚动监听器 ==========
    function setupScrollListener() {
        let scrollTimeout;
        let sectionsViewed = new Set();
        
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollPosition = window.scrollY + window.innerHeight;
                const pageHeight = document.documentElement.scrollHeight;
                const scrollPercent = (scrollPosition / pageHeight) * 100;
                
                // 深度触发
                if (scrollPercent > 60 && !scrollDepthTriggered && !hasSubmitted && logoAnimationCompleted && isRegistrationOpen) {
                    scrollDepthTriggered = true;
                    trackEvent('Scroll', 'Depth', '60% Scroll Depth');
                    
                    setTimeout(() => {
                        if (!formModal.classList.contains('active')) {
                            openModal();
                        }
                    }, 1500);
                }
                
                // 区块浏览追踪
                const sections = document.querySelectorAll('section');
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
                        const sectionId = section.id || section.className;
                        if (!sectionsViewed.has(sectionId)) {
                            sectionsViewed.add(sectionId);
                            trackEvent('Scroll', 'Section View', sectionId);
                        }
                    }
                });
            }, 150);
        });
    }
    
    // ========== 定时弹窗 ==========
    function setupTimerPopup() {
        setTimeout(() => {
            if (!timerTriggered && !hasSubmitted && !formModal.classList.contains('active') && logoAnimationCompleted && isRegistrationOpen) {
                timerTriggered = true;
                openModal();
                trackEvent('Timer', 'Popup', '25s Timer Popup');
            }
        }, 25000);
    }
    
    // ========== 初始化FAQ ==========
    function initFAQ() {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const wasActive = item.classList.contains('active');
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                if (!wasActive) {
                    item.classList.add('active');
                    const questionText = item.querySelector('h3').textContent;
                    trackEvent('FAQ', 'Open', questionText);
                }
            });
        });
    }
    
    // ========== 处理表单提交 ==========
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!isRegistrationOpen) {
            showWarning('抱歉，报名已截止');
            return;
        }
        
        const submitButton = document.getElementById('submitForm');
        const originalButtonContent = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> 提交中...</span>';
        
        try {
            const formData = new FormData(reservationForm);
            const skinConcerns = Array.from(formData.getAll('skinConcern')).join(', ');
            
            const data = {
                action: 'submitReservation',
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                preferredTime: formData.get('preferredTime'),
                skinConcern: skinConcerns
            };
            
            if (!validateForm(data)) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonContent;
                return;
            }
            
            // 追踪表单提交尝试
            trackEvent('Form', 'Submit Attempt', 'Form Submission');
            
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            hasSubmitted = true;
            
            // 追踪成功提交
            trackEvent('Form', 'Submit Success', 'Form Submitted');
            
            // 显示成功消息
            showSuccessMessage();
            
        } catch (error) {
            console.error('提交失败:', error);
            showWarning('网络连接失败，请稍后重试');
            
            // 追踪提交失败
            trackEvent('Form', 'Submit Error', error.message);
            
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    }
    
    // ========== 验证表单 ==========
    function validateForm(data) {
        if (!data.name || !data.email || !data.phone || !data.preferredTime) {
            showWarning('请填写所有必填字段');
            trackEvent('Form', 'Validation Error', 'Missing Required Fields');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showWarning('请输入有效的电子邮件地址');
            trackEvent('Form', 'Validation Error', 'Invalid Email');
            return false;
        }
        
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(data.phone) || data.phone.replace(/\D/g, '').length < 8) {
            showWarning('请输入有效的电话号码');
            trackEvent('Form', 'Validation Error', 'Invalid Phone');
            return false;
        }
        
        return true;
    }
    
    // ========== 显示成功消息 ==========
    function showSuccessMessage() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message-overlay';
        successMsg.innerHTML = `
            <div class="success-content">
                <div style="background: linear-gradient(135deg, var(--success), var(--accent)); width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; animation: successPulse 2s infinite;">
                    <i class="fas fa-check" style="font-size: 50px; color: white;"></i>
                </div>
                <h3 style="font-size: 32px; margin-bottom: 20px; color: white; font-weight: 800;">预约成功！</h3>
                <p style="font-size: 18px; margin-bottom: 15px; opacity: 0.9; line-height: 1.6;">您已成功预约免费7天皮肤检测体验</p>
                <p style="font-size: 16px; margin-bottom: 30px; opacity: 0.8; line-height: 1.6;">我们将在24小时内通过邮件与您联系确认具体体验时间</p>
                <div class="spinner"></div>
                <p style="font-size: 14px; opacity: 0.7; margin-top: 25px;">
                    <i class="fas fa-gift"></i> 正在跳转到确认页面...
                </p>
            </div>
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 3000);
    }
    
    // ========== 显示警告消息 ==========
    function showWarning(message) {
        if (formWarningEl && warningTextEl) {
            warningTextEl.textContent = message;
            formWarningEl.style.display = 'flex';
            formWarningEl.style.animation = 'shake 0.5s ease';
            
            setTimeout(() => {
                clearWarning();
            }, 5000);
        }
    }
    
    // ========== 清除警告消息 ==========
    function clearWarning() {
        if (formWarningEl) {
            formWarningEl.style.display = 'none';
            formWarningEl.style.animation = '';
        }
    }
    
    // ========== 添加动画样式 ==========
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes successPulse {
            0%, 100% { 
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(255, 107, 139, 0.7);
            }
            50% { 
                transform: scale(1.1);
                box-shadow: 0 0 0 20px rgba(255, 107, 139, 0);
            }
        }
        
        .modal-open .modal-container {
            animation: modalAppear 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        @keyframes modalAppear {
            0% {
                opacity: 0;
                transform: translateY(50px) scale(0.9);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .status-confirmed {
            color: var(--success);
            font-weight: 600;
        }
        
        .status-pending {
            color: var(--warning);
            font-weight: 600;
        }
        
        .spinner {
            margin: 30px auto;
            width: 60px;
            height: 60px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid var(--accent);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 移动端优化 */
        @media (max-width: 768px) {
            .data-card:hover,
            .pain-point:hover,
            .testimonial:hover,
            .faq-item:hover {
                transform: none;
            }
            
            .cta-button:hover,
            .action-button:hover,
            .submit-button:hover {
                transform: translateY(-3px) scale(1.02);
            }
        }
        
        /* 触摸活动状态 */
        .touch-active {
            opacity: 0.7;
            transform: scale(0.98);
        }
        
        /* 慢速网络优化 */
        .slow-network * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
        }
        
        .slow-network img {
            filter: blur(1px);
        }
    `;
    document.head.appendChild(style);
    
    // 窗口大小改变时优化
    window.addEventListener('resize', function() {
        // 移动端优化：简化效果
        if (window.innerWidth <= 768) {
            document.querySelectorAll('.person-frame').forEach(frame => {
                frame.style.transform = 'none';
            });
        }
        
        // 检测横屏模式
        if (window.innerWidth > window.innerHeight) {
            document.documentElement.classList.add('landscape');
        } else {
            document.documentElement.classList.remove('landscape');
        }
    });
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面隐藏时暂停动画
            clearInterval(countdownTimer);
        } else {
            // 页面显示时恢复
            setupCountdownTimer();
        }
    });
    
    // 初始化应用
    init();
});