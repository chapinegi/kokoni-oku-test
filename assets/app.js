(() => {
  const textarea = document.querySelector('[data-listen-text]');
  if (!textarea) return;

  const count = document.querySelector('[data-char-count]');
  const notice = document.querySelector('[data-preparing-notice]');
  const crisis = document.querySelector('[data-crisis-notice]');
  const buttons = document.querySelectorAll('[data-interest]');
  let startedTracked = false;

  // 初期実証では本文を送信しない。計測を追加しても、送るのはイベント名だけ。
  const track = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };

  const crisisTerms = ['死にたい','自殺','消えたい','生きたくない','死んでしまいたい','自分を傷つけ'];

  const update = () => {
    const value = textarea.value;
    if (count) count.textContent = `${value.length}文字`;
    if (!startedTracked && value.trim().length >= 10) {
      startedTracked = true;
      track('started_writing', { page_path: location.pathname });
    }
    if (crisis) {
      const shouldShow = crisisTerms.some(term => value.includes(term));
      crisis.classList.toggle('show', shouldShow);
    }
  };

  textarea.addEventListener('input', update);
  update();

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.interest;
      track(kind === 'voice' ? 'interest_voice_ai' : 'interest_text_ai', { page_path: location.pathname });
      if (notice) {
        notice.classList.add('show');
        notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });
})();
