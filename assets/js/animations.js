/**
 * SupplyPro | Supply Chain & Procurement Consulting
 * Animations Controller (GSAP + Canvas Network Flow)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCanvasNetwork();
  initGsapAnimations();
  initCustomCursor();
});

/**
 * Custom Canvas Network Visualizer
 * Creates moving connection lines, pulsating hubs, and logistics flow particles.
 */
function initCanvasNetwork() {
  const canvas = document.getElementById('supplyChainCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
    createNodes();
  });

  // Nodes & Hubs (Global Sourcing Hubs, Factories, Ports)
  let nodes = [];
  const nodeCount = 15;
  const particleSpeedMultiplier = 0.8;

  class Node {
    constructor(x, y, label, type) {
      this.x = x;
      this.y = y;
      this.baseRadius = type === 'hub' ? 6 : 3.5;
      this.radius = this.baseRadius;
      this.label = label;
      this.type = type;
      this.pulse = Math.random() * Math.PI;
      this.pulseSpeed = 0.03 + Math.random() * 0.02;
    }

    draw() {
      // Glow effect for hubs
      if (this.type === 'hub') {
        this.pulse += this.pulseSpeed;
        this.radius = this.baseRadius + Math.sin(this.pulse) * 1.5;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = getThemeColor('--accent-blue', 0.08);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.type === 'hub' ? getThemeColor('--accent-teal') : getThemeColor('--text-muted', 0.5);
      ctx.fill();
    }
  }

  // Paths & Flows
  let connections = [];
  class Connection {
    constructor(fromNode, toNode) {
      this.from = fromNode;
      this.to = toNode;
      this.particles = [];
      this.maxParticles = 3;
    }

    draw() {
      // Draw connection line
      ctx.beginPath();
      ctx.moveTo(this.from.x, this.from.y);
      ctx.lineTo(this.to.x, this.to.y);
      ctx.strokeStyle = getThemeColor('--border-color');
      ctx.lineWidth = 1;
      ctx.stroke();

      // Flow logistics particles along connection
      if (Math.random() < 0.005 && this.particles.length < this.maxParticles) {
        this.particles.push(0); // Progress from 0 to 1
      }

      this.particles.forEach((progress, index) => {
        this.particles[index] += 0.003 * particleSpeedMultiplier;
        
        if (this.particles[index] >= 1) {
          this.particles.splice(index, 1);
          return;
        }

        // Interpolate position
        const px = this.from.x + (this.to.x - this.from.x) * this.particles[index];
        const py = this.from.y + (this.to.y - this.from.y) * this.particles[index];

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = getThemeColor('--accent-blue');
        ctx.shadowBlur = 4;
        ctx.shadowColor = getThemeColor('--accent-blue');
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });
    }
  }

  function createNodes() {
    nodes = [];
    connections = [];

    // Hub coordinates mapped across viewport
    const hubPositions = [
      { x: 0.15, y: 0.25, label: 'APAC Sourcing Hub', type: 'hub' },
      { x: 0.45, y: 0.18, label: 'Central Logistics Hub', type: 'hub' },
      { x: 0.8, y: 0.35, label: 'EMEA Distribution Hub', type: 'hub' },
      { x: 0.25, y: 0.75, label: 'Americas Port', type: 'hub' },
      { x: 0.65, y: 0.7, label: 'Global Advisory Hub', type: 'hub' }
    ];

    hubPositions.forEach(pos => {
      nodes.push(new Node(pos.x * width, pos.y * height, pos.label, pos.type));
    });

    // Add smaller operational nodes
    for (let i = 0; i < nodeCount; i++) {
      const rx = (0.05 + Math.random() * 0.9) * width;
      const ry = (0.05 + Math.random() * 0.9) * height;
      nodes.push(new Node(rx, ry, '', 'node'));
    }

    // Connect hubs logically
    for (let i = 0; i < hubPositions.length; i++) {
      for (let j = i + 1; j < hubPositions.length; j++) {
        connections.push(new Connection(nodes[i], nodes[j]));
      }
    }

    // Connect regular nodes to their nearest hub
    for (let i = hubPositions.length; i < nodes.length; i++) {
      let nearestHub = nodes[0];
      let minDist = Infinity;
      for (let j = 0; j < hubPositions.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < minDist) {
          minDist = dist;
          nearestHub = nodes[j];
        }
      }
      connections.push(new Connection(nodes[i], nearestHub));
    }
  }

  function getThemeColor(variable, alpha = 1) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    if (value.startsWith('#')) {
      // Hex to RGBA conversion
      const r = parseInt(value.slice(1, 3), 16);
      const g = parseInt(value.slice(3, 5), 16);
      const b = parseInt(value.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return value;
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw grid background faintly
    ctx.strokeStyle = getThemeColor('--border-color', 0.05);
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    connections.forEach(conn => conn.draw());
    nodes.forEach(node => node.draw());

    requestAnimationFrame(animate);
  }

  createNodes();
  animate();
}

/**
 * GSAP ScrollTrigger reveals and counter tickers
 */
function initGsapAnimations() {
  if (typeof gsap === 'undefined') {
    // If GSAP is not available, fallback to Intersection Observer for basic counter ticker
    initFallbackCounters();
    return;
  }

  // Register ScrollTrigger plugin if available
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Fade up animations for sections & headers
  gsap.utils.toArray('.reveal-up').forEach(element => {
    gsap.from(element, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Stagger reveal for card layouts
  gsap.utils.toArray('.stagger-cards').forEach(container => {
    const cards = container.querySelectorAll('.card-premium, .case-study-card, .case-story-card');
    gsap.from(cards, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Animated analytics progress bars
  gsap.utils.toArray('.analytics-bar-fill').forEach(bar => {
    const targetWidth = bar.getAttribute('data-width') || '100%';
    gsap.to(bar, {
      width: targetWidth,
      duration: 1.8,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: bar,
        start: 'top 90%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Timeline progression animation
  const timelineProgress = document.querySelector('.timeline-progress');
  if (timelineProgress) {
    gsap.to(timelineProgress, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.timeline-wrapper',
        start: 'top 30%',
        end: 'bottom 60%',
        scrub: true
      }
    });
  }

  // Timeline steps staggered entry
  gsap.utils.toArray('.timeline-item').forEach(item => {
    gsap.from(item.querySelector('.timeline-content'), {
      x: item.classList.contains('timeline-left') ? -50 : 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 75%',
        toggleActions: 'play none none none'
      }
    });
  });

  // Stat Counters Animation
  gsap.utils.toArray('.stat-number').forEach(stat => {
    const target = parseFloat(stat.getAttribute('data-target'));
    const isPercentage = stat.innerText.includes('%');
    const isPlus = stat.innerText.includes('+');

    gsap.fromTo(stat, 
      { textContent: 0 }, 
      {
        textContent: target,
        duration: 2.5,
        ease: 'power1.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 90%'
        },
        onUpdate: function() {
          let currentVal = Math.floor(this.targets()[0].textContent);
          stat.innerHTML = currentVal + (isPercentage ? '%' : '') + (isPlus ? '+' : '');
        }
      }
    );
  });
}

/**
 * Fallback statistic ticker counters when GSAP is offline
 */
function initFallbackCounters() {
  const stats = document.querySelectorAll('.stat-number');
  const observerOptions = { threshold: 0.5 };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stat = entry.target;
        const target = parseFloat(stat.getAttribute('data-target'));
        const isPercentage = stat.innerText.includes('%');
        const isPlus = stat.innerText.includes('+');
        let count = 0;
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // ~60fps

        const updateCount = () => {
          count += increment;
          if (count < target) {
            stat.innerText = Math.floor(count) + (isPercentage ? '%' : '') + (isPlus ? '+' : '');
            requestAnimationFrame(updateCount);
          } else {
            stat.innerText = target + (isPercentage ? '%' : '') + (isPlus ? '+' : '');
          }
        };

        updateCount();
        observer.unobserve(stat);
      }
    });
  }, observerOptions);

  stats.forEach(stat => observer.observe(stat));

  // Fallback for analytics progress bars
  const fills = document.querySelectorAll('.analytics-bar-fill');
  const fillsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const targetWidth = bar.getAttribute('data-width') || '100%';
        bar.style.width = targetWidth;
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.2 });
  fills.forEach(fill => fillsObserver.observe(fill));
}

/**
 * Custom cursor micro-interaction mapping
 */
function initCustomCursor() {
  const cursor = document.querySelector('.custom-cursor');
  const cursorDot = document.querySelector('.custom-cursor-dot');
  if (!cursor || !cursorDot) return;

  // Do not initialize on touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  cursor.style.opacity = 1;
  cursorDot.style.opacity = 1;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });

  // Expand cursor on hovering link elements
  const hoverables = document.querySelectorAll('a, button, .clickable, .calendar-cell.available, input, textarea, select');
  hoverables.forEach(elem => {
    elem.addEventListener('mouseenter', () => {
      cursor.style.width = '40px';
      cursor.style.height = '40px';
      cursor.style.backgroundColor = 'rgba(20, 184, 166, 0.1)';
      cursor.style.borderColor = 'var(--accent-teal)';
    });

    elem.addEventListener('mouseleave', () => {
      cursor.style.width = '20px';
      cursor.style.height = '20px';
      cursor.style.backgroundColor = 'transparent';
      cursor.style.borderColor = 'var(--accent-blue)';
    });
  });
}
