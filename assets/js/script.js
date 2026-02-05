'use strict';



// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });











// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }


  });
}


// neural network canvas background
const canvas = document.getElementById('nn-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const neurons = [];
const NEURON_COUNT = 60;
const CONNECTION_DIST = 140;

for (let i = 0; i < NEURON_COUNT; i++) {
  neurons.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.8
  });
}

function animateNN() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < neurons.length; i++) {
    for (let j = i + 1; j < neurons.length; j++) {
      const dx = neurons[i].x - neurons[j].x;
      const dy = neurons[i].y - neurons[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECTION_DIST) {
        ctx.beginPath();
        ctx.moveTo(neurons[i].x, neurons[i].y);
        ctx.lineTo(neurons[j].x, neurons[j].y);
        ctx.strokeStyle = `rgba(204, 157, 69, ${(1 - dist / CONNECTION_DIST) * 0.12})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  neurons.forEach(n => {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(204, 157, 69, 0.25)';
    ctx.fill();
  });

  requestAnimationFrame(animateNN);
}
animateNN();


// randomize confidence value (99.x range)
const confValue = document.querySelector('.conf-value');
const confBadge = document.querySelector('.confidence-badge');
if (confValue && confBadge) {
  const randomConf = (99 + Math.random() * 0.9).toFixed(1);
  confValue.textContent = randomConf + '%';
  confBadge.dataset.tooltip = `This description was generated using a model. Confidence: ${randomConf}%`;
}

// ml thinking text cycle (starts after typing animation)
const thinkTexts = [
  'training model...',
  'forward pass...',
  'computing loss...',
  'backpropagating...',
  'updating weights...',
  'optimizing gradients...',
  'reducing entropy...',
  'sampling tokens...',
  'attention layers...',
  'embedding vectors...'
];
let thinkIdx = 0;
const thinkEl = document.querySelector('.think-text');
const mlThinking = document.querySelector('.ml-thinking');

function startThinkingAnimation() {
  if (mlThinking) {
    setTimeout(() => {
      mlThinking.classList.add('visible');
    }, 300);
  }
  if (thinkEl) {
    setInterval(() => {
      thinkEl.style.opacity = '0';
      setTimeout(() => {
        thinkIdx = (thinkIdx + 1) % thinkTexts.length;
        thinkEl.textContent = thinkTexts[thinkIdx];
        thinkEl.style.opacity = '1';
      }, 150);
    }, 1500);
  }
}


// LLM-style typing animation for about section
(function () {
  const aboutSection = document.querySelector('.about-text');
  if (!aboutSection) return;

  const paras = aboutSection.querySelectorAll('p');
  const badge = document.querySelector('.confidence-badge');
  if (badge) badge.remove();

  // store original HTML content
  const contents = Array.from(paras).map(p => p.innerHTML);

  // hide all paragraphs initially
  paras.forEach((p, i) => {
    p.innerHTML = '';
    if (i > 0) p.classList.add('hidden');
  });

  // tokenize HTML preserving tags
  function tokenize(html) {
    const tokens = [];
    let i = 0;
    while (i < html.length) {
      if (html[i] === '<') {
        const end = html.indexOf('>', i);
        if (end !== -1) {
          tokens.push(html.slice(i, end + 1));
          i = end + 1;
          continue;
        }
      }
      // grab word chunks (2-4 chars) like LLM tokens
      let chunk = '';
      const chunkSize = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < chunkSize && i < html.length && html[i] !== '<'; j++) {
        chunk += html[i++];
      }
      if (chunk) tokens.push(chunk);
    }
    return tokens;
  }

  // type one paragraph token by token
  function typeParagraph(idx, onDone) {
    const para = paras[idx];
    const tokens = tokenize(contents[idx]);
    para.classList.remove('hidden');

    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    para.appendChild(cursor);

    let i = 0;
    let html = '';

    function step() {
      if (i >= tokens.length) {
        cursor.remove();
        onDone();
        return;
      }

      html += tokens[i];
      para.innerHTML = html;
      para.appendChild(cursor);
      i++;

      // variable speed: faster for tags, slight variance for text
      const token = tokens[i - 1];
      const isTag = token.startsWith('<');
      const delay = isTag ? 0 : (15 + Math.random() * 25);

      setTimeout(step, delay);
    }

    step();
  }

  // orchestrate paragraphs
  function startTyping(idx) {
    if (idx >= contents.length) {
      // re-attach confidence badge
      if (badge && paras[2]) {
        paras[2].appendChild(badge);
      }
      // start the thinking animation after typing completes
      startThinkingAnimation();
      return;
    }

    // small pause between paragraphs
    const delay = idx === 0 ? 400 : 300;
    setTimeout(() => {
      typeParagraph(idx, () => startTyping(idx + 1));
    }, delay);
  }

  startTyping(0);
})();