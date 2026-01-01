// SheetDB.io API 配置
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

// 全局变量
let currentSlide = 0;
let autoSlideInterval;
let modalTimeout;
let isFormSubmitting = false;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('页面加载完成，开始初始化...');
  
  // 初始化组件
  initTestimonials();
  initFAQ();
  initModal();
  initFormSubmission();
  initAutoPopup();
  
  // 平滑滚动
  initSmoothScroll();
  
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
  
  // 初始化动画效果
  initAnimations();
  
  // 初始化快速链接
  initQuickLinks();
  
  console.log('初始化完成！');
});

// 初始化快速链接
function initQuickLinks() {
  const quickLinks = document.querySelectorAll('.footer-link');
  
  quickLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      if (targetId.startsWith('#')) {
        // 页面内锚点链接
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: 'smooth'
          });
        }
      }
      // 其他链接（如首页）将正常跳转
    });
  });
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
  
  console.log('初始化评价轮播，共', testimonials.length, '条评价');
  
  // 生成评价卡片
  testimonials.forEach((testimonial, index) => {
    // 创建卡片
    const card = document.createElement('div');
    card.className = 'testimonial-card';
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
    
    // 创建导航点
    const dot = document.createElement('div');
    dot.className = `dot ${index === 0 ? 'active' : ''}`;
    dot.dataset.index = index;
    dot.addEventListener('click', () => goToSlide(index));
    sliderDots.appendChild(dot);
  });
  
  // 按钮事件
  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  
  // 开始自动轮播
  startAutoSlide();
  
  // 鼠标悬停时暂停轮播
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
  
  // 更新当前幻灯片索引
  currentSlide = index;
  
  // 移动幻灯片容器
  const sliderTrack = document.getElementById('sliderTrack');
  sliderTrack.style.transform = `translateX(-${index * 100}%)`;
  
  // 更新导航点状态
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

// 开始自动轮播
function startAutoSlide() {
  clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    goToSlide(currentSlide + 1);
  }, 5000); // 每5秒切换一次
}

// 初始化FAQ展开/收起功能
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  console.log('初始化FAQ，共', faqItems.length, '个问题');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // 关闭其他展开的FAQ
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // 切换当前FAQ状态
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
  
  console.log('初始化模态窗口');
  
  // 点击关闭按钮
  closeModal.addEventListener('click', hideModal);
  
  // 点击遮罩层关闭
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });
  
  // ESC键关闭
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
    document.body.style.overflow = 'hidden'; // 防止背景滚动
    
    // 添加动画类
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
    // 添加消失动画
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.remove('animate__zoomIn');
      modalContent.classList.add('animate__zoomOut');
    }
    
    // 延迟隐藏
    setTimeout(() => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto'; // 恢复滚动
      
      // 重置表单
      const form = document.getElementById('bookingForm');
      if (form) form.reset();
      
      console.log('隐藏模态窗口');
    }, 300);
  }
}

// 初始化表单提交 - 修复SheetDB数据问题
function initFormSubmission() {
  const form = document.getElementById('bookingForm');
  
  if (!form) {
    console.error('未找到表单元素');
    return;
  }
  
  console.log('初始化表单提交');
  
  // 阻止表单的默认提交行为
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 防止重复提交
    if (isFormSubmitting) {
      console.log('表单正在提交中，请稍候...');
      return;
    }
    
    // 验证表单
    if (!form.checkValidity()) {
      // 触发浏览器原生验证提示
      form.reportValidity();
      return;
    }
    
    // 设置提交状态
    isFormSubmitting = true;
    
    // 显示加载状态
    const submitBtn = document.getElementById('submitForm');
    const spinner = submitBtn.querySelector('.fa-spinner');
    const submitText = submitBtn.querySelector('span');
    
    if (spinner && submitText) {
      spinner.classList.remove('hidden');
      submitText.textContent = '提交中...';
      submitBtn.disabled = true;
    }
    
    try {
      console.log('开始提交表单数据到SheetDB...');
      
      // 获取当前时间并格式化
      const now = new Date();
      const formattedDate = formatDateTime(now);
      
      // 收集表单数据 - 使用正确的列名（与Google Sheets列名完全一致）
      const formData = {
        "时间戳": formattedDate, // 完整的时间戳
        "预约ID": `SKIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        "姓名": document.getElementById('name').value.trim(),
        "电话": document.getElementById('phone').value.trim(),
        "邮箱": document.getElementById('email').value.trim(),
        "皮肤问题": document.getElementById('concern').value,
        "体验周次": document.getElementById('week').value,
        "名额": "已预约",
        "来源": "Skin Lab Website"
      };
      
      console.log('表单数据:', formData);
      
      // 验证数据
      if (!formData.姓名 || !formData.电话 || !formData.邮箱 || !formData.皮肤问题 || !formData.体验周次) {
        throw new Error('请填写所有必填字段');
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.邮箱)) {
        throw new Error('请输入有效的电子邮件地址');
      }
      
      // 验证手机号格式
      const phoneRegex = /^[0-9+\-\s()]{10,}$/;
      if (!phoneRegex.test(formData.电话)) {
        throw new Error('请输入有效的手机号码');
      }
      
      // 发送到 SheetDB - 使用正确的格式
      console.log('发送请求到SheetDB API...');
      
      // SheetDB期望的格式是 { data: [{...}] }
      const requestBody = {
        data: [formData]
      };
      
      console.log('请求体:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(SHEETDB_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('响应状态:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', errorText);
        
        let errorMessage = '提交失败，请稍后重试';
        
        // 尝试解析错误信息
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // 如果无法解析JSON，检查常见错误
          if (errorText.includes('limit')) {
            errorMessage = '提交次数限制，请稍后再试';
          }
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('提交成功:', result);
      
      // 保存表单数据到sessionStorage，以便success.html使用
      sessionStorage.setItem('skinlab_booking_data', JSON.stringify({
        name: formData.姓名,
        phone: formData.电话,
        email: formData.邮箱,
        concern: formData.皮肤问题,
        week: formData.体验周次,
        timestamp: formData.时间戳,
        bookingId: formData.预约ID
      }));
      
      // 保存提交状态到本地存储
      localStorage.setItem('skinlab_form_submitted', 'true');
      localStorage.setItem('skinlab_submission_time', new Date().toISOString());
      localStorage.setItem('skinlab_customer_name', formData.姓名);
      localStorage.setItem('skinlab_customer_phone', formData.电话);
      localStorage.setItem('skinlab_booking_id', formData.预约ID);
      
      // 隐藏模态窗口
      hideModal();
      
      // 显示成功消息并跳转
      setTimeout(() => {
        window.location.href = 'success.html';
      }, 800);
      
    } catch (error) {
      console.error('提交错误:', error);
      
      // 显示友好的错误消息
      let errorMessage = error.message || '提交失败，请稍后重试';
      
      // 如果是网络错误
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查您的网络连接后重试';
        
        // 如果网络失败，也保存数据并跳转（模拟成功）
        console.log('网络错误，模拟提交成功并跳转...');
        
        // 获取当前时间
        const now = new Date();
        const formattedDate = formatDateTime(now);
        
        // 保存数据到sessionStorage
        const formData = {
          name: document.getElementById('name').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          email: document.getElementById('email').value.trim(),
          concern: document.getElementById('concern').value,
          week: document.getElementById('week').value,
          timestamp: formattedDate,
          bookingId: `SKIN-OFFLINE-${Date.now()}`
        };
        
        sessionStorage.setItem('skinlab_booking_data', JSON.stringify(formData));
        localStorage.setItem('skinlab_form_submitted', 'true');
        localStorage.setItem('skinlab_submission_time', new Date().toISOString());
        localStorage.setItem('skinlab_customer_name', formData.name);
        localStorage.setItem('skinlab_customer_phone', formData.phone);
        localStorage.setItem('skinlab_booking_id', formData.bookingId);
        
        // 隐藏模态窗口
        hideModal();
        
        // 跳转到成功页面
        setTimeout(() => {
          window.location.href = 'success.html';
        }, 500);
        
        return;
      }
      
      // 显示错误提示
      alert(`提交失败: ${errorMessage}\n\n如果问题持续存在，请直接联系：\n电话: +6016-9560425\n邮箱: jiayee344@gmail.com`);
      
    } finally {
      // 恢复按钮状态
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
      
      // 重置提交状态
      isFormSubmitting = false;
    }
  });
}

// 格式化日期时间为字符串 (YYYY-MM-DD HH:MM:SS)
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 初始化自动弹出表单（每20秒）
function initAutoPopup() {
  // 清除可能存在的旧计时器
  clearTimeout(modalTimeout);
  
  // 检查用户是否已经提交过表单
  const hasSubmitted = localStorage.getItem('skinlab_form_submitted');
  const submissionTime = localStorage.getItem('skinlab_submission_time');
  
  // 如果已经提交过，检查是否超过7天
  if (hasSubmitted && submissionTime) {
    const submissionDate = new Date(submissionTime);
    const now = new Date();
    const daysSinceSubmission = Math.floor((now - submissionDate) / (1000 * 60 * 60 * 24));
    
    // 如果超过7天，清除本地存储，允许再次显示弹窗
    if (daysSinceSubmission > 7) {
      localStorage.removeItem('skinlab_form_submitted');
      localStorage.removeItem('skinlab_submission_time');
      localStorage.removeItem('skinlab_customer_name');
      localStorage.removeItem('skinlab_customer_phone');
      localStorage.removeItem('skinlab_booking_id');
    }
  }
  
  // 设置新的计时器
  modalTimeout = setTimeout(() => {
    // 再次检查用户是否已经提交过表单
    const currentHasSubmitted = localStorage.getItem('skinlab_form_submitted');
    
    // 如果没有提交过，显示模态窗口
    if (!currentHasSubmitted) {
      console.log('20秒后自动显示预约表单');
      showModal();
    }
  }, 20000); // 20秒
}

// 初始化平滑滚动
function initSmoothScroll() {
  // 为所有内部链接添加平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

// 初始化动画效果
function initAnimations() {
  // 添加滚动动画
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate__animated', 'animate__fadeInUp');
        
        // 为3D卡片添加额外的动画类
        if (entry.target.classList.contains('card-3d')) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'perspective(1000px) translateZ(0)';
          }, 300);
        }
      }
    });
  }, observerOptions);
  
  // 观察需要动画的元素
  document.querySelectorAll('.concern-item, .benefit-card, .timeline-item, .faq-item, .outcome-item').forEach(el => {
    // 初始设置
    if (el.classList.contains('card-3d')) {
      el.style.opacity = '0';
      el.style.transform = 'perspective(1000px) translateZ(-50px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }
    
    observer.observe(el);
  });
}

// 页面可见性变化处理（防止标签页切换时计时器问题）
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
  // 重新计算轮播位置
  goToSlide(currentSlide);
});

// 添加控制台提示
console.log('%c✨ Skin Lab 免费7天皮肤体验 ✨', 'color: #6C63FF; font-size: 18px; font-weight: bold;');
console.log('%c地点: Bukit Indah, 柔佛新山', 'color: #36D1DC; font-size: 14px;');
console.log('%c日期: 10-01-2026 至 17-01-2026', 'color: #FF6584; font-size: 14px;');
console.log('%c联系方式: +6016-9560425 | jiayee344@gmail.com', 'color: #4CAF50; font-size: 12px;');
console.log('%cSheetDB API: ' + SHEETDB_API, 'color: #4CAF50; font-size: 12px;');