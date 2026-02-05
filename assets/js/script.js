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


// Hover tokenize for about section (inline)
(function () {
  const aboutText = document.querySelector('.about-text');
  if (!aboutText) return;

  let isReady = false;

  // Token colors
  const hues = [340, 262, 199, 160, 45, 14, 291, 180];

  function getHueForToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash = hash & hash;
    }
    return hues[Math.abs(hash) % hues.length];
  }

  // BPE-style tokenization (simulated subword units)
  // Common tokens that stay whole (like in real tokenizers)
  const wholeTokens = new Set(['the', 'and', 'for', 'that', 'with', 'are', 'this', 'from', 'have', 'was', 'will', 'your', 'can', 'all', 'been', 'has', 'more', 'when', 'who', 'they', 'its', 'into', 'only', 'other', 'new', 'some', 'could', 'time', 'very', 'what', 'about', 'which', 'their', 'would', 'make', 'like', 'just', 'over', 'such', 'our', 'most', 'also', 'made', 'after', 'being', 'where', 'work', 'code', 'data', 'model']);

  function tokenizeBPE(word) {
    const lower = word.toLowerCase();

    // Very short words or common tokens stay whole
    if (word.length <= 2 || wholeTokens.has(lower)) return [word];

    // Simulate BPE: split into subword chunks of 2-4 chars
    const tokens = [];
    let i = 0;

    while (i < word.length) {
      // Determine chunk size (2-4 chars, biased toward 3)
      let chunkSize;
      const remaining = word.length - i;

      if (remaining <= 4) {
        chunkSize = remaining; // Take rest if short
      } else {
        // Vary chunk size based on position hash for consistency
        const posHash = (word.charCodeAt(i) * 31 + i) % 10;
        chunkSize = posHash < 3 ? 2 : (posHash < 7 ? 3 : 4);
        // Don't leave tiny remainder
        if (remaining - chunkSize < 2 && remaining > chunkSize) {
          chunkSize = Math.ceil(remaining / 2);
        }
      }

      tokens.push(word.slice(i, i + chunkSize));
      i += chunkSize;
    }

    return tokens;
  }

  // Wrap text as tokens inline (preserving HTML structure)
  function wrapTokensInElement(element) {
    let tokenCount = 0;

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return;

        const fragment = document.createDocumentFragment();
        // Split by word boundaries but keep punctuation attached
        const parts = text.split(/(\s+)/);

        parts.forEach(part => {
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
          } else if (part) {
            // Separate leading/trailing punctuation, handle contractions (I'm, don't)
            const match = part.match(/^([^\w]*)([\w']+)([^\w]*)$/);
            if (match) {
              const [, leadPunct, word, trailPunct] = match;
              if (leadPunct) fragment.appendChild(document.createTextNode(leadPunct));

              // Handle contractions as single token
              const tokens = word.includes("'") ? [word] : tokenizeBPE(word);
              tokens.forEach(token => {
                const span = document.createElement('span');
                span.className = 'token-word';
                span.style.setProperty('--hue', getHueForToken(token));
                span.textContent = token;
                fragment.appendChild(span);
                tokenCount++;
              });

              if (trailPunct) fragment.appendChild(document.createTextNode(trailPunct));
            } else {
              // Fallback: wrap entire part as token
              const span = document.createElement('span');
              span.className = 'token-word';
              span.style.setProperty('--hue', getHueForToken(part));
              span.textContent = part;
              fragment.appendChild(span);
              tokenCount++;
            }
          }
        });

        node.parentNode.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Skip badges
        if (node.classList.contains('confidence-badge') ||
            node.classList.contains('token-count-badge')) {
          return;
        }
        // Process children (copy to avoid live collection issues)
        Array.from(node.childNodes).forEach(processNode);
      }
    }

    processNode(element);
    return tokenCount;
  }

  function setup() {
    const paras = aboutText.querySelectorAll('p');
    let totalTokens = 0;

    paras.forEach(p => {
      totalTokens += wrapTokensInElement(p);
    });

    // Update token count (re-query in case DOM changed)
    const countEl = document.querySelector('.token-count');
    if (countEl) {
      countEl.textContent = totalTokens;
    }

    isReady = true;
  }

  // Wait for typing animation to complete
  const observer = new MutationObserver(() => {
    const mlThinking = document.querySelector('.ml-thinking.visible');
    if (mlThinking && !isReady) {
      setTimeout(setup, 500);
      observer.disconnect();
    }
  });

  observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

  // Hover events
  aboutText.addEventListener('mouseenter', () => {
    if (isReady) aboutText.classList.add('show-tokens');
  });

  aboutText.addEventListener('mouseleave', () => {
    aboutText.classList.remove('show-tokens');
  });
})();
