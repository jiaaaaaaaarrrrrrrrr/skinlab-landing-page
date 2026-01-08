// 全局变量
let currentSlide = 0;
let currentCarouselSlide = 0;
let autoSlideInterval;
let carouselAutoSlideInterval;
let modalTimeout;
let isFormSubmitting = false;
let particlesSystem;
let totalCarouselSlides = 5; // 实际图片数量

// SheetDB.io API 配置 - 修复数据字段
const SHEETDB_API = 'https://sheetdb.io/api/v1/rm6iajzbhgnlv';

// Google Apps Script URL - 用于发送邮件
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwnioJ-XRunXO89ycXXqGjNGdlBumL6gLA3OwPBxbUMAYSKFJRU14qE5fi3n2v8wTKEjw/exec';

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面加载完成，开始初始化...');
  
  // 显示品牌启动页面
  showBrandLoader();
  
  // 2秒后隐藏启动页面并初始化
  setTimeout(() => {
    hideBrandLoader();
    initAllComponents();
  }, 2000);
});

// 显示品牌启动页面
function showBrandLoader() {
  const brandLoader = document.getElementById('brandLoader');
  if (brandLoader) {
    brandLoader.style.display = 'flex';
    // 确保Logo在上方显示
    const brandContainer = brandLoader.querySelector('.brand-container');
    if (brandContainer) {
      brandContainer.style.display = 'flex';
      brandContainer.style.flexDirection = 'column';
      brandContainer.style.alignItems = 'center';
      brandContainer.style.justifyContent = 'center';
    }
  }
}

// 隐藏品牌启动页面并显示主内容
function hideBrandLoader() {
  const brandLoader = document.getElementById('brandLoader');
  const mainContent = document.getElementById('mainContent');
  
  if (brandLoader) {
    brandLoader.classList.add('fade-out');
  }
  
  setTimeout(() => {
    if (brandLoader) {
      brandLoader.style.display = 'none';
    }
    
    if (mainContent) {
      mainContent.classList.add('loaded');
    }
    
    // 初始化粒子系统
    particlesSystem = new ParticlesSystem();
    
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化光标效果
    initCursorEffect();
    
    console.log('主内容加载完成！');
  }, 800);
}

// 初始化所有组件
function initAllComponents() {
  initCarousel();
  initFAQ();
  initModal();
  initFormSubmission();
  initAutoPopup();
  initSmoothScroll();
  initAnimations();
  
  // 为所有CTA按钮添加事件监听
  const ctaButtons = [
    document.getElementById('heroBtn'),
    document.getElementById('actionBtn'),
    document.getElementById('conclusionBtn'),
    document.getElementById('footerBtn'),
    document.getElementById('floatingBtn')
  ];
  
  ctaButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', showModal);
    }
  });
  
  console.log('所有组件初始化完成！');
}

// 初始化顾客分享图片轮播器 - 优化版
function initCarousel() {
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselIndicators = document.getElementById('carouselIndicators');
  
  if (!carouselTrack || !carouselPrev || !carouselNext) {
    console.error('未找到轮播器元素');
    return;
  }
  
  // 生成指示器
  for (let i = 0; i < totalCarouselSlides; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';
    indicator.dataset.index = i;
    indicator.addEventListener('click', () => goToCarouselSlide(i));
    carouselIndicators.appendChild(indicator);
  }
  
  // 设置初始指示器状态
  updateCarouselIndicators();
  
  // 绑定按钮事件
  carouselPrev.addEventListener('click', () => goToCarouselSlide(currentCarouselSlide - 1));
  carouselNext.addEventListener('click', () => goToCarouselSlide(currentCarouselSlide + 1));
  
  // 启动自动轮播
  startCarouselAutoSlide();
  
  // 鼠标悬停时暂停自动轮播
  carouselTrack.addEventListener('mouseenter', () => {
    clearInterval(carouselAutoSlideInterval);
  });
  
  carouselTrack.addEventListener('mouseleave', () => {
    startCarouselAutoSlide();
  });
  
  // 触摸滑动支持
  let touchStartX = 0;
  let touchEndX = 0;
  
  carouselTrack.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  carouselTrack.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleCarouselSwipe();
  });
  
  function handleCarouselSwipe() {
    const swipeThreshold = 50;
    const difference = touchStartX - touchEndX;
    
    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        // 向左滑动 - 下一张
        goToCarouselSlide(currentCarouselSlide + 1);
      } else {
        // 向右滑动 - 上一张
        goToCarouselSlide(currentCarouselSlide - 1);
      }
    }
  }
  
  // 窗口大小变化时重新调整轮播器
  window.addEventListener('resize', () => {
    goToCarouselSlide(currentCarouselSlide);
  });
  
  console.log('顾客分享轮播器初始化完成');
}

// 切换到指定轮播图片 - 优化版
function goToCarouselSlide(index) {
  const carouselTrack = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  
  // 处理边界情况
  if (index >= totalCarouselSlides) {
    index = 0;
  } else if (index < 0) {
    index = totalCarouselSlides - 1;
  }
  
  currentCarouselSlide = index;
  
  // 根据屏幕宽度计算每屏显示的图片数量和偏移量
  let slidesPerView, offset;
  const screenWidth = window.innerWidth;
  
  if (screenWidth >= 1200) {
    slidesPerView = 5; // 大屏幕显示5张
    offset = -index * 20; // 每张占20%
  } else if (screenWidth >= 992) {
    slidesPerView = 3; // 中等屏幕显示3张
    offset = -index * (100 / 3); // 每张占33.333%
  } else if (screenWidth >= 768) {
    slidesPerView = 2; // 平板显示2张
    offset = -index * 50; // 每张占50%
  } else {
    slidesPerView = 1; // 手机显示1张
    offset = -index * 100; // 每张占100%
  }
  
  carouselTrack.style.transform = `translateX(${offset}%)`;
  
  // 更新指示器
  updateCarouselIndicators();
  
  console.log(`切换到轮播图片 ${index + 1}/${totalCarouselSlides}, 每屏显示 ${slidesPerView} 张`);
}

// 更新轮播指示器
function updateCarouselIndicators() {
  const indicators = document.querySelectorAll('.carousel-indicator');
  indicators.forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentCarouselSlide);
  });
}

// 开始自动轮播
function startCarouselAutoSlide() {
  clearInterval(carouselAutoSlideInterval);
  carouselAutoSlideInterval = setInterval(() => {
    goToCarouselSlide(currentCarouselSlide + 1);
  }, 4000); // 每4秒自动切换
}

// 粒子系统
class ParticlesSystem {
  constructor(containerId = 'particlesContainer') {
    this.container = document.getElementById(containerId);
    this.particles = [];
    this.particleCount = 50;
    this.colors = [
      'rgba(108, 99, 255, 0.7)',
      'rgba(54, 209, 220, 0.7)',
      'rgba(255, 101, 132, 0.7)',
      'rgba(142, 68, 173, 0.5)',
      'rgba(46, 204, 113, 0.5)'
    ];
    

    if (this.container) {
      this.init();
    }
  }

  init() {
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle();
    }
    
    this.animate();
    window.addEventListener('resize', () => this.handleResize());
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 10 + 5;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.backgroundColor = color;
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    particle.speedX = (Math.random() - 0.5) * 0.5;
    particle.speedY = (Math.random() - 0.5) * 0.5;
    particle.rotation = Math.random() * 360;
    particle.rotationSpeed = (Math.random() - 0.5) * 2;
    
    this.container.appendChild(particle);
    this.particles.push(particle);
  }

  animate() {
    const animateFrame = () => {
      this.particles.forEach(particle => {
        let x = parseFloat(particle.style.left);
        let y = parseFloat(particle.style.top);
        
        x += particle.speedX;
        y += particle.speedY;
        
        if (x > window.innerWidth) x = 0;
        if (x < 0) x = window.innerWidth;
        if (y > window.innerHeight) y = 0;
        if (y < 0) y = window.innerHeight;
        
        particle.rotation += particle.rotationSpeed;
        
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.transform = `rotate(${particle.rotation}deg)`;
        
        document.addEventListener('mousemove', (e) => {
          const mouseX = e.clientX;
          const mouseY = e.clientY;
          const dx = x - mouseX;
          const dy = y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            particle.speedX += dx * 0.0001;
            particle.speedY += dy * 0.0001;
            particle.style.opacity = Math.min(parseFloat(particle.style.opacity) + 0.1, 0.8);
          }
        });
      });
      
      requestAnimationFrame(animateFrame);
    };
    
    animateFrame();
  }

  handleResize() {
    this.particles.forEach(particle => {
      if (parseFloat(particle.style.left) > window.innerWidth) {
        particle.style.left = `${Math.random() * window.innerWidth}px`;
      }
      if (parseFloat(particle.style.top) > window.innerHeight) {
        particle.style.top = `${Math.random() * window.innerHeight}px`;
      }
    });
  }
}

// 数据处理器 - 修复Google Sheets字段
class DataHandler {
  constructor() {
    this.isSubmitting = false;
  }

  // 格式化数据以匹配Google Sheets列名（正确的列名）
  formatFormData(formData) {
    const now = new Date();
    const timestamp = this.getCurrentDateTime();
    
    return {
      "时间戳": timestamp,
      "预约ID": this.generateBookingId(),
      "姓名": formData.name || '',
      "手机号码": formData.phone || '',
      "邮箱": formData.email || '',
      "皮肤问题": formData.concern || '',
      "体验周次": formData.week || '',
      "提交时间": timestamp,
      "客户电话": formData.phone || '',
      "名额": "已预约",
      "来源": "Skin Lab landing page",
      "提交状态": "待确认",
      "跟进状态": "未跟进"
    };
  }

  generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `SKIN-${timestamp}-${random}`;
  }

  getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  validateFormData(data) {
    const errors = [];
    
    if (!data.姓名 || data.姓名.trim().length < 2) {
      errors.push('姓名至少需要2个字符');
    }
    
    if (!data.手机号码 || !/^[0-9+\-\s()]{10,}$/.test(data.手机号码)) {
      errors.push('请输入有效的手机号码');
    }
    
    if (!data.邮箱 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.邮箱)) {
      errors.push('请输入有效的电子邮件地址');
    }
    
    if (!data.皮肤问题) {
      errors.push('请选择皮肤问题');
    }
    
    if (!data.体验周次) {
      errors.push('请选择体验周次');
    }
    
    return errors;
  }

  async submitToGoogleSheets(formData) {
    if (this.isSubmitting) {
      throw new Error('正在提交中，请稍候...');
    }
    
    this.isSubmitting = true;
    
    try {
      const formattedData = this.formatFormData(formData);
      const validationErrors = this.validateFormData(formattedData);
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }
      
      console.log('提交数据到Google Sheets:', formattedData);
      
      const response = await fetch(SHEETDB_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [formattedData]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('SheetDB响应:', errorText);
        throw new Error(`提交失败: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('提交成功:', result);
      
      return {
        success: true,
        bookingId: formattedData.预约ID,
        timestamp: formattedData.时间戳,
        data: result
      };
      
    } catch (error) {
      console.error('DataHandler提交错误:', error);
      throw error;
      
    } finally {
      this.isSubmitting = false;
    }
  }
}

// 提交到Google Apps Script发送邮件
async function submitToAppsScript(formData) {
  try {
    // 准备提交数据
    const submissionData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      concern: formData.concern,
      week: formData.week,
      bookingId: generateBookingId(),
      timestamp: new Date().toISOString(),
      source: 'Skin Lab Landing Page'
    };
    
    console.log('提交数据到Apps Script:', submissionData);
    
    // 发送到Apps Script - 使用no-cors模式
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // 重要：绕过CORS限制
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });
    
    // 由于no-cors模式，我们无法读取响应，但可以假设成功
    console.log('Apps Script请求已发送');
    
    return {
      success: true,
      bookingId: submissionData.bookingId,
      timestamp: submissionData.timestamp,
      message: '邮件发送请求已处理'
    };
    
  } catch (error) {
    console.error('Apps Script提交错误:', error);
    throw new Error('邮件发送失败，但预约已记录');
  }
}

// 初始化FAQ展开/收起功能
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      item.classList.toggle('active');
    });
  });
}

// 初始化模态窗口
function initModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModal = document.getElementById('closeModal');
  
  if (!modalOverlay || !closeModal) {
    console.error('未找到模态窗口元素');
    return;
  }
  
  closeModal.addEventListener('click', hideModal);
  
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      hideModal();
    }
  });
}

// 显示模态窗口
function showModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.add('animate__zoomIn');
      modalContent.classList.remove('animate__zoomOut');
    }
    
    console.log('显示模态窗口');
  }
}

// 隐藏模态窗口
function hideModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.remove('animate__zoomIn');
      modalContent.classList.add('animate__zoomOut');
    }
    
    setTimeout(() => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
      
      const form = document.getElementById('bookingForm');
      if (form) form.reset();
      
      console.log('隐藏模态窗口');
    }, 300);
  }
}

// 生成预约ID
function generateBookingId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SKIN-${timestamp}-${random}`;
}

// 显示提交成功消息
function showSubmissionSuccessMessage() {
  const message = document.createElement('div');
  message.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4CAF50, #8BC34A);
    color: white;
    padding: 15px 25px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;
  
  message.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-check-circle" style="font-size: 20px;"></i>
      <div>
        <strong style="display: block; margin-bottom: 5px;">提交成功！</strong>
        <div style="font-size: 13px; opacity: 0.9;">
          确认邮件已发送到您的邮箱<br>
          即将跳转到确认页面
        </div>
      </div>
    </div>
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(message);
    }, 300);
  }, 2000);
}

// 初始化表单提交 - 整合版本（同时提交到Sheets和发送邮件）
function initFormSubmission() {
  const form = document.getElementById('bookingForm');
  
  if (!form) {
    console.error('未找到表单元素');
    return;
  }
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (isFormSubmitting) {
      console.log('表单正在提交中，请稍候...');
      return;
    }
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    isFormSubmitting = true;
    
    const submitBtn = document.getElementById('submitForm');
    const spinner = submitBtn.querySelector('.fa-spinner');
    const submitText = submitBtn.querySelector('span');
    
    if (spinner && submitText) {
      spinner.classList.remove('hidden');
      submitText.textContent = '提交中...';
      submitBtn.disabled = true;
    }
    
    try {
      console.log('开始提交表单数据...');
      
      const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        concern: document.getElementById('concern').value,
        week: document.getElementById('week').value
      };
      
      console.log('表单数据:', formData);
      
      // 创建DataHandler实例
      const dataHandler = new DataHandler();
      
      // 同时提交到两个地方
      const [sheetResult, emailResult] = await Promise.allSettled([
        // 1. 提交到Google Sheets
        dataHandler.submitToGoogleSheets(formData),
        
        // 2. 发送邮件
        submitToAppsScript(formData)
      ]);
      
      console.log('Sheets结果:', sheetResult);
      console.log('邮件结果:', emailResult);
      
      // 保存数据到sessionStorage
      const bookingId = sheetResult.status === 'fulfilled' 
        ? sheetResult.value.bookingId 
        : generateBookingId();
      
      const timestamp = new Date().toISOString();
      
      sessionStorage.setItem('skinlab_booking_data', JSON.stringify({
        ...formData,
        timestamp: timestamp,
        bookingId: bookingId,
        submitTime: timestamp,
        customerPhone: formData.phone
      }));
      
      // 保存到本地存储
      localStorage.setItem('skinlab_form_submitted', 'true');
      localStorage.setItem('skinlab_submission_time', timestamp);
      localStorage.setItem('skinlab_customer_name', formData.name);
      localStorage.setItem('skinlab_customer_phone', formData.phone);
      localStorage.setItem('skinlab_customer_email', formData.email);
      localStorage.setItem('skinlab_booking_id', bookingId);
      
      // 显示成功消息
      showSubmissionSuccessMessage();
      
      hideModal();
      
      // 延迟跳转到成功页面
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 1500);
      
    } catch (error) {
      console.error('提交错误:', error);
      
      // 优雅的错误处理
      let errorMessage = error.message || '提交失败，请稍后重试';
      
      // 网络错误处理
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '网络连接失败，已保存您的预约信息，稍后我们会联系您确认。';
        
        // 保存数据到本地
        const bookingId = `SKIN-OFFLINE-${Date.now()}`;
        const timestamp = new Date().toISOString();
        
        sessionStorage.setItem('skinlab_booking_data', JSON.stringify({
          name: document.getElementById('name').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          email: document.getElementById('email').value.trim(),
          concern: document.getElementById('concern').value,
          week: document.getElementById('week').value,
          timestamp: timestamp,
          bookingId: bookingId,
          submitTime: timestamp,
          customerPhone: document.getElementById('phone').value.trim()
        }));
        
        localStorage.setItem('skinlab_form_submitted', 'true');
        localStorage.setItem('skinlab_submission_time', timestamp);
        localStorage.setItem('skinlab_customer_name', document.getElementById('name').value.trim());
        localStorage.setItem('skinlab_customer_phone', document.getElementById('phone').value.trim());
        localStorage.setItem('skinlab_customer_email', document.getElementById('email').value.trim());
        localStorage.setItem('skinlab_booking_id', bookingId);
        
        // 显示成功消息
        showSubmissionSuccessMessage();
        
        hideModal();
        
        setTimeout(() => {
          window.location.href = 'success.html';
        }, 500);
        
        return;
      }
      
      alert(`提交失败: ${errorMessage}\n\n如果问题持续存在，请直接联系：\n电话: +6016-9560425\n邮箱: jiayee344@gmail.com`);
      
    } finally {
      const submitBtn = document.getElementById('submitForm');
      if (submitBtn) {
        const spinner = submitBtn.querySelector('.fa-spinner');
        const submitText = submitBtn.querySelector('span');
        
        if (spinner && submitText) {
          spinner.classList.add('hidden');
          submitText.textContent = '确认预约';
          submitBtn.disabled = false;
        }
      }
      
      isFormSubmitting = false;
    }
  });
}

// 初始化自动弹出表单（每20秒）
function initAutoPopup() {
  clearTimeout(modalTimeout);
  
  const hasSubmitted = localStorage.getItem('skinlab_form_submitted');
  const submissionTime = localStorage.getItem('skinlab_submission_time');
  
  if (hasSubmitted && submissionTime) {
    const submissionDate = new Date(submissionTime);
    const now = new Date();
    const daysSinceSubmission = Math.floor((now - submissionDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSubmission > 7) {
      localStorage.removeItem('skinlab_form_submitted');
      localStorage.removeItem('skinlab_submission_time');
      localStorage.removeItem('skinlab_customer_name');
      localStorage.removeItem('skinlab_customer_phone');
      localStorage.removeItem('skinlab_customer_email');
      localStorage.removeItem('skinlab_booking_id');
    }
  }
  
  modalTimeout = setTimeout(() => {
    const currentHasSubmitted = localStorage.getItem('skinlab_form_submitted');
    
    if (!currentHasSubmitted) {
      console.log('20秒后自动显示预约表单');
      showModal();
    }
  }, 20000);
}

// 初始化平滑滚动
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

// 初始化滚动动画
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  revealElements.forEach(el => {
    observer.observe(el);
  });
}

// 初始化光标效果
function initCursorEffect() {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-effect';
  document.body.appendChild(cursor);
  
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
  
  document.addEventListener('mousedown', () => {
    cursor.classList.add('active');
  });
  
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('active');
  });
  
  document.querySelectorAll('button, a, .btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '30px';
      cursor.style.height = '30px';
    });
    
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
    });
  });
}

// 初始化动画效果
function initAnimations() {
  const importantElements = document.querySelectorAll('.badge, .cta-btn, .hero-btn');
  importantElements.forEach(el => {
    el.classList.add('pulse-important');
  });
  
  const heroTitle = document.querySelector('.hero-title-2');
  if (heroTitle) {
    setTimeout(() => {
      heroTitle.classList.add('typewriter');
    }, 500);
  }
  
  // 移动端优化：防止动画卡顿
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // 在移动设备上减少粒子数量
    if (particlesSystem) {
      particlesSystem.particleCount = 20;
    }
    
    // 禁用部分复杂动画
    document.querySelectorAll('.bg-3d-elements').forEach(el => {
      el.style.display = 'none';
    });
    
    // 简化3D效果
    document.querySelectorAll('.card-3d, .btn-3d, .icon-3d').forEach(el => {
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
  }
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    clearInterval(carouselAutoSlideInterval);
    clearTimeout(modalTimeout);
  } else {
    startCarouselAutoSlide();
    initAutoPopup();
  }
});

// 窗口大小变化时调整布局
window.addEventListener('resize', function() {
  // 重新定位轮播器
  goToCarouselSlide(currentCarouselSlide);
  
  // 移动端优化：重新调整字体大小
  if (window.innerWidth <= 768) {
    adjustMobileFontSizes();
  }
});

// 移动端字体大小调整函数
function adjustMobileFontSizes() {
  const viewportWidth = window.innerWidth;
  
  // 根据屏幕宽度动态调整字体大小
  if (viewportWidth <= 480) {
    // 小手机屏幕
    document.querySelectorAll('.hero-title, .hero-title-2').forEach(el => {
      el.style.fontSize = '24px';
    });
    
    document.querySelectorAll('.section-header h2').forEach(el => {
      el.style.fontSize = '20px';
    });
    
    document.querySelectorAll('.benefit-card h3, .concern-item h3, .timeline-content h3').forEach(el => {
      el.style.fontSize = '16px';
    });
    
    document.querySelectorAll('.benefit-card p, .concern-item p, .timeline-content p').forEach(el => {
      el.style.fontSize = '12px';
    });
  } else if (viewportWidth <= 768) {
    // 大手机/小平板屏幕
    document.querySelectorAll('.hero-title, .hero-title-2').forEach(el => {
      el.style.fontSize = '28px';
    });
    
    document.querySelectorAll('.section-header h2').forEach(el => {
      el.style.fontSize = '24px';
    });
    
    document.querySelectorAll('.benefit-card h3, .concern-item h3, .timeline-content h3').forEach(el => {
      el.style.fontSize = '18px';
    });
    
    document.querySelectorAll('.benefit-card p, .concern-item p, .timeline-content p').forEach(el => {
      el.style.fontSize = '14px';
    });
  }
}

// 页面加载完成后执行移动端优化
window.addEventListener('load', function() {
  if (window.innerWidth <= 768) {
    adjustMobileFontSizes();
  }
  
  // 预加载图片
  preloadImages();
});

// 预加载重要图片
function preloadImages() {
  const imagesToPreload = [
    'hero-person.png',
    'concern-1.jpg',
    'concern-2.jpg',
    'concern-3.jpg',
    'concern-4.jpg',
    'customer-1.jpg',
    'customer-2.jpg',
    'customer-3.jpg',
    'customer-4.jpg',
    'customer-5.jpg'
  ];
  
  imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// 添加控制台提示
console.log('%c✨ Skin Lab 免费7天皮肤体验 ✨', 'color: #6C63FF; font-size: 18px; font-weight: bold;');
console.log('%c地点: Bukit Indah, 柔佛新山', 'color: #36D1DC; font-size: 14px;');
console.log('%c日期: 10-01-2026 至 17-01-2026', 'color: #FF6584; font-size: 14px;');
console.log('%c联系方式: +6016-9560425 | jiayee344@gmail.com', 'color: #4CAF50; font-size: 12px;');
console.log('%cSheetDB API: ' + SHEETDB_API, 'color: #4CAF50; font-size: 12px;');
console.log('%cApps Script URL: ' + APPS_SCRIPT_URL, 'color: #FF9800; font-size: 12px;');
console.log('%c移动端优化已启用', 'color: #FF9800; font-size: 12px;');

// 在success.html页面发送邮件的函数
// 这个函数应该在success.html中被调用
function sendSuccessEmailFromPage(customerData) {
  return new Promise((resolve) => {
    // 异步发送邮件请求
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...customerData,
        source: 'Success Page',
        timestamp: new Date().toISOString()
      })
    }).then(() => {
      console.log('成功页面邮件发送请求已发送');
      resolve(true);
    }).catch(error => {
      console.error('成功页面邮件发送失败:', error);
      resolve(false); // 即使失败也不影响主要流程
    });
  });
}