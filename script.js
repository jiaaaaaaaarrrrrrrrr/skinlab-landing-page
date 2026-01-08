// 全局变量
let currentSlide = 0;
let currentCarouselSlide = 0;
let autoSlideInterval;
let carouselAutoSlideInterval;
let modalTimeout;
let isFormSubmitting = false;
let particlesSystem;
let totalCarouselSlides = 5; // 实际图片数量

// SheetDB.io API 配置
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
    
    particlesSystem = new ParticlesSystem();
    initScrollAnimations();
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

// 初始化顾客分享图片轮播器
function initCarousel() {
  const carouselTrack = document.getElementById('carouselTrack');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselIndicators = document.getElementById('carouselIndicators');
  
  if (!carouselTrack || !carouselPrev || !carouselNext) {
    console.error('未找到轮播器元素');
    return;
  }
  
  for (let i = 0; i < totalCarouselSlides; i++) {
    const indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';
    indicator.dataset.index = i;
    indicator.addEventListener('click', () => goToCarouselSlide(i));
    carouselIndicators.appendChild(indicator);
  }
  
  updateCarouselIndicators();
  carouselPrev.addEventListener('click', () => goToCarouselSlide(currentCarouselSlide - 1));
  carouselNext.addEventListener('click', () => goToCarouselSlide(currentCarouselSlide + 1));
  startCarouselAutoSlide();
  
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
        goToCarouselSlide(currentCarouselSlide + 1);
      } else {
        goToCarouselSlide(currentCarouselSlide - 1);
      }
    }
  }
  
  window.addEventListener('resize', () => {
    goToCarouselSlide(currentCarouselSlide);
  });
  
  console.log('顾客分享轮播器初始化完成');
}

// 切换到指定轮播图片
function goToCarouselSlide(index) {
  const carouselTrack = document.getElementById('carouselTrack');
  
  if (index >= totalCarouselSlides) {
    index = 0;
  } else if (index < 0) {
    index = totalCarouselSlides - 1;
  }
  
  currentCarouselSlide = index;
  
  let offset;
  const screenWidth = window.innerWidth;
  
  if (screenWidth >= 1200) {
    offset = -index * 20;
  } else if (screenWidth >= 992) {
    offset = -index * (100 / 3);
  } else if (screenWidth >= 768) {
    offset = -index * 50;
  } else {
    offset = -index * 100;
  }
  
  carouselTrack.style.transform = `translateX(${offset}%)`;
  updateCarouselIndicators();
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
  }, 4000);
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

// 初始化FAQ
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
    }, 300);
  }
}

// 生成预约ID
function generateBookingId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SKIN-${timestamp}-${random}`;
}

// 保存预约数据到本地存储
function saveBookingDataLocally(formData, bookingId, timestamp) {
  const bookingData = {
    ...formData,
    timestamp: timestamp,
    bookingId: bookingId,
    submitTime: timestamp,
    customerPhone: formData.phone
  };
  
  sessionStorage.setItem('skinlab_booking_data', JSON.stringify(bookingData));
  localStorage.setItem('skinlab_form_submitted', 'true');
  localStorage.setItem('skinlab_submission_time', timestamp);
  localStorage.setItem('skinlab_customer_name', formData.name);
  localStorage.setItem('skinlab_customer_phone', formData.phone);
  localStorage.setItem('skinlab_customer_email', formData.email);
  localStorage.setItem('skinlab_booking_id', bookingId);
  
  console.log('预约数据已保存到本地:', bookingData);
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
          确认邮件正在发送中<br>
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

// 异步提交到Google Sheets
async function submitToGoogleSheetsAsync(formData, bookingId, timestamp) {
  try {
    const data = {
      "时间戳": new Date(timestamp).toLocaleString('zh-CN'),
      "预约ID": bookingId,
      "姓名": formData.name || '',
      "手机号码": formData.phone || '',
      "邮箱": formData.email || '',
      "皮肤问题": formData.concern || '',
      "体验周次": formData.week || '',
      "提交时间": new Date(timestamp).toLocaleString('zh-CN'),
      "客户电话": formData.phone || '',
      "名额": "已预约",
      "来源": "Skin Lab landing page",
      "提交状态": "待确认",
      "跟进状态": "未跟进"
    };
    
    console.log('异步提交到Google Sheets:', data);
    
    const response = await fetch(SHEETDB_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [data]
      })
    });
    
    if (!response.ok) {
      console.warn('Google Sheets提交失败:', response.status);
      return false;
    }
    
    console.log('Google Sheets提交成功');
    return true;
    
  } catch (error) {
    console.error('Google Sheets提交错误:', error);
    return false;
  }
}

// 异步提交到Google Apps Script发送邮件
async function submitToAppsScriptAsync(formData, bookingId, timestamp) {
  try {
    const submissionData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      concern: formData.concern,
      week: formData.week,
      bookingId: bookingId,
      timestamp: timestamp,
      source: 'Skin Lab Landing Page'
    };
    
    console.log('异步发送邮件数据:', submissionData);
    
    // 使用no-cors模式，不等待响应
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData)
    });
    
    console.log('邮件发送请求已发送');
    return true;
    
  } catch (error) {
    console.error('邮件发送请求失败:', error);
    return false;
  }
}

// 主表单提交函数 - 优化版（立即响应）
function initFormSubmission() {
  const form = document.getElementById('bookingForm');
  
  if (!form) {
    console.error('未找到表单元素');
    return;
  }
  
  form.addEventListener('submit', function(e) {
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
    
    // 收集表单数据
    const formData = {
      name: document.getElementById('name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      concern: document.getElementById('concern').value,
      week: document.getElementById('week').value
    };
    
    console.log('表单数据:', formData);
    
    // 立即生成预约ID和时间戳
    const bookingId = generateBookingId();
    const timestamp = new Date().toISOString();
    
    // 立即保存到本地存储（零延迟）
    saveBookingDataLocally(formData, bookingId, timestamp);
    
    // 更新按钮状态
    const submitBtn = document.getElementById('submitForm');
    const spinner = submitBtn.querySelector('.fa-spinner');
    const submitText = submitBtn.querySelector('span');
    
    if (spinner && submitText) {
      spinner.classList.remove('hidden');
      submitText.textContent = '提交中...';
      submitBtn.disabled = true;
    }
    
    // 步骤1：立即显示成功消息
    showSubmissionSuccessMessage();
    
    // 步骤2：立即关闭模态窗口（用户立即看到效果）
    hideModal();
    
    // 步骤3：异步提交到后端（不阻塞用户界面）
    setTimeout(async () => {
      try {
        // 并行提交到两个服务
        await Promise.allSettled([
          submitToGoogleSheetsAsync(formData, bookingId, timestamp),
          submitToAppsScriptAsync(formData, bookingId, timestamp)
        ]);
        
        console.log('后台提交完成');
        
      } catch (error) {
        console.error('后台提交错误:', error);
        // 即使后台提交失败，用户已经看到成功，数据已保存到本地
      }
      
      // 恢复按钮状态
      if (spinner && submitText) {
        spinner.classList.add('hidden');
        submitText.textContent = '确认预约';
        submitBtn.disabled = false;
      }
      
      isFormSubmitting = false;
      
      // 延迟跳转到成功页面（让用户看到成功消息）
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 800);
      
    }, 100); // 轻微延迟确保UI更新完成
  });
}

// 初始化自动弹出表单
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
  
  // 移动端优化
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    if (particlesSystem) {
      particlesSystem.particleCount = 20;
    }
    
    document.querySelectorAll('.bg-3d-elements').forEach(el => {
      el.style.display = 'none';
    });
    
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

// 窗口大小变化处理
window.addEventListener('resize', function() {
  goToCarouselSlide(currentCarouselSlide);
  
  if (window.innerWidth <= 768) {
    adjustMobileFontSizes();
  }
});

// 移动端字体大小调整
function adjustMobileFontSizes() {
  const viewportWidth = window.innerWidth;
  
  if (viewportWidth <= 480) {
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

// 页面加载完成
window.addEventListener('load', function() {
  if (window.innerWidth <= 768) {
    adjustMobileFontSizes();
  }
  
  preloadImages();
});

// 预加载图片
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

// 控制台提示
console.log('%c✨ Skin Lab 免费7天皮肤体验 ✨', 'color: #6C63FF; font-size: 18px; font-weight: bold;');
console.log('%c地点: Bukit Indah, 柔佛新山', 'color: #36D1DC; font-size: 14px;');
console.log('%c日期: 10-01-2026 至 17-01-2026', 'color: #FF6584; font-size: 14px;');
console.log('%c联系方式: +6016-9560425 | jiayee344@gmail.com', 'color: #4CAF50; font-size: 12px;');
console.log('%c表单提交优化: 即时响应 + 后台异步提交', 'color: #FF9800; font-size: 12px;');