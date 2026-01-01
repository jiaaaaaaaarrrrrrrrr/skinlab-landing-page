// 全局变量
let currentSlide = 0;
let autoSlideInterval;
let modalTimeout;
let isFormSubmitting = false;
let particlesSystem;

// SheetDB.io API 配置 - 修复数据字段
const SHEETDB_API = 'https://sheetdb.io/api/v1/rm6iajzbhgnlv';

// 测试数据 - 顾客评价
const testimonials = [
  {
    name: "林美玲",
    age: "28岁",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    rating: 5,
    text: "终于知道为什么我的皮肤总是敏感了！7天体验帮我找到了根源，现在护肤不再盲目跟风。顾问非常专业，仪器检测数据很详细。",
    date: "2025-11-15"
  },
  {
    name: "陈晓雯",
    age: "32岁",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "原本以为又是推销，但真的完全没有！顾问很专业，分析得很详细，让我真正了解自己的皮肤。现在知道该买什么产品了。",
    date: "2025-11-22"
  },
  {
    name: "张婷婷",
    age: "25岁",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 4,
    text: "痘痘问题困扰多年，这里帮我找到了适合的护理方式。7天后皮肤明显稳定多了！非常感谢专业的指导。",
    date: "2025-12-03"
  },
  {
    name: "王佳欣",
    age: "35岁",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
    text: "作为护肤新手，这次体验太有价值了！知道自己该买什么，不该买什么，省了不少冤枉钱。非常推荐给大家！",
    date: "2025-12-10"
  },
  {
    name: "刘思雅",
    age: "30岁",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    rating: 5,
    text: "仪器检测很专业，数据直观。顾问根据报告给出个性化建议，非常实用！现在皮肤状态好了很多。",
    date: "2025-12-18"
  }
];

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
      "手机号码": formData.phone || '',  // 修复：使用正确的列名
      "邮箱": formData.email || '',
      "皮肤问题": formData.concern || '',
      "体验周次": formData.week || '',
      "提交时间": timestamp,  // 新增提交时间字段
      "客户电话": formData.phone || '',  // 新增客户电话字段
      "名额": "已预约",
      "来源": "Skin Lab Website",
      "提交状态": "待确认",
      "备注": "",
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
  initTestimonials();
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

// 初始化顾客评价轮播
function initTestimonials() {
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderDots = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (!sliderTrack) {
    console.error('未找到评价轮播容器');
    return;
  }
  
  // 生成评价卡片
  testimonials.forEach((testimonial, index) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card scroll-reveal';
    card.innerHTML = `
      <div class="testimonial-header">
        <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar" loading="lazy">
        <div class="testimonial-info">
          <h4>${testimonial.name}</h4>
          <p>${testimonial.age} | Bukit Indah分店</p>
          <div class="stars">
            ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
          </div>
        </div>
      </div>
      <p class="testimonial-text">"${testimonial.text}"</p>
      <p class="testimonial-date">${testimonial.date}</p>
    `;
    sliderTrack.appendChild(card);
    
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.dataset.index = index;
    dot.addEventListener('click', () => goToSlide(index));
    sliderDots.appendChild(dot);
  });
  
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  
  startAutoSlide();
  
  sliderTrack.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
  });
  
  sliderTrack.addEventListener('mouseleave', () => {
    startAutoSlide();
  });
}

// 切换到指定幻灯片
function goToSlide(index) {
  const slides = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const totalSlides = slides.length;
  
  if (index >= totalSlides) index = 0;
  if (index < 0) index = totalSlides - 1;
  
  currentSlide = index;
  
  const sliderTrack = document.getElementById('sliderTrack');
  sliderTrack.style.transform = `translateX(-${index * 100}%)`;
  
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// 开始自动轮播
function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5000);
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

// 初始化表单提交
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
      
      const dataHandler = new DataHandler();
      const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        concern: document.getElementById('concern').value,
        week: document.getElementById('week').value
      };
      
      console.log('表单数据:', formData);
      
      const result = await dataHandler.submitToGoogleSheets(formData);
      console.log('提交成功:', result);
      
      // 保存所有数据到sessionStorage，包括电话和提交时间
      sessionStorage.setItem('skinlab_booking_data', JSON.stringify({
        ...formData,
        timestamp: result.timestamp,
        bookingId: result.bookingId,
        submitTime: result.timestamp,
        customerPhone: formData.phone
      }));
      
      // 保存到本地存储
      localStorage.setItem('skinlab_form_submitted', 'true');
      localStorage.setItem('skinlab_submission_time', new Date().toISOString());
      localStorage.setItem('skinlab_customer_name', formData.name);
      localStorage.setItem('skinlab_customer_phone', formData.phone);
      localStorage.setItem('skinlab_customer_email', formData.email);
      localStorage.setItem('skinlab_booking_id', result.bookingId);
      
      hideModal();
      
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 800);
      
    } catch (error) {
      console.error('提交错误:', error);
      
      let errorMessage = error.message || '提交失败，请稍后重试';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '网络连接失败，已保存您的预约信息，稍后我们会联系您确认。';
        
        const dataHandler = new DataHandler();
        const bookingId = `SKIN-OFFLINE-${Date.now()}`;
        const timestamp = dataHandler.getCurrentDateTime();
        
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
        localStorage.setItem('skinlab_submission_time', new Date().toISOString());
        localStorage.setItem('skinlab_customer_name', document.getElementById('name').value.trim());
        localStorage.setItem('skinlab_customer_phone', document.getElementById('phone').value.trim());
        localStorage.setItem('skinlab_customer_email', document.getElementById('email').value.trim());
        localStorage.setItem('skinlab_booking_id', bookingId);
        
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
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    clearInterval(autoSlideInterval);
    clearTimeout(modalTimeout);
  } else {
    startAutoSlide();
    initAutoPopup();
  }
});

// 窗口大小变化时调整布局
window.addEventListener('resize', function() {
  goToSlide(currentSlide);
});

// 添加控制台提示
console.log('%c✨ Skin Lab 免费7天皮肤体验 ✨', 'color: #6C63FF; font-size: 18px; font-weight: bold;');
console.log('%c地点: Bukit Indah, 柔佛新山', 'color: #36D1DC; font-size: 14px;');
console.log('%c日期: 10-01-2026 至 17-01-2026', 'color: #FF6584; font-size: 14px;');
console.log('%c联系方式: +6016-9560425 | jiayee344@gmail.com', 'color: #4CAF50; font-size: 12px;');
console.log('%cSheetDB API: ' + SHEETDB_API, 'color: #4CAF50; font-size: 12px;');