(() => {
  // Google Analytics 4: 自由記述本文は送信しない。
  const GA_MEASUREMENT_ID = 'G-P8D3ME4ZJ1';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  if (!document.querySelector(`script[data-kokoro-ga="${GA_MEASUREMENT_ID}"]`)) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    gaScript.dataset.kokoroGa = GA_MEASUREMENT_ID;
    document.head.appendChild(gaScript);
  }

  const textarea = document.querySelector('[data-listen-text]');
  if (!textarea) return;

  const writeBox = textarea.closest('.write-box');
  const count = document.querySelector('[data-char-count]');
  const notice = document.querySelector('[data-preparing-notice]');
  const crisis = document.querySelector('[data-crisis-notice]');
  const buttons = document.querySelectorAll('[data-interest]');
  const sessionGoalKey = 'kokoro_listen_goal';
  let startedTracked = false;

  const goals = [
    { value: 'listen', label: 'ただ聞いてほしい' },
    { value: 'empathy', label: '共感してほしい' },
    { value: 'organize', label: '気持ちを整理したい' },
    { value: 'advice', label: 'アドバイスもほしい' },
    { value: 'unsure', label: '自分でもまだ分からない' }
  ];

  // 本文そのものはアクセス解析へ送らない。
  const track = (eventName, params = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  };

  const safeSessionGet = (key) => {
    try {
      return sessionStorage.getItem(key) || '';
    } catch (_) {
      return '';
    }
  };

  const safeSessionSet = (key, value) => {
    try {
      sessionStorage.setItem(key, value);
    } catch (_) {
      // sessionStorage が使えない環境では、そのページ内だけで扱う。
    }
  };

  const getGoal = () => {
    const checked = document.querySelector('input[name="listen-goal"]:checked');
    return checked ? checked.value : safeSessionGet(sessionGoalKey);
  };

  const goalLabel = (value) => goals.find((goal) => goal.value === value)?.label || '';

  const buildGoalSelector = () => {
    if (!writeBox || writeBox.querySelector('[data-goal-selector]')) return;

    const fieldset = document.createElement('fieldset');
    fieldset.className = 'goal-selector';
    fieldset.dataset.goalSelector = '';

    const legend = document.createElement('legend');
    legend.textContent = '今は、どうしてほしい？';
    fieldset.appendChild(legend);

    const help = document.createElement('p');
    help.className = 'smallprint goal-help';
    help.textContent = '今の気持ちに一番近いものを1つ選んでください。';
    fieldset.appendChild(help);

    const options = document.createElement('div');
    options.className = 'goal-options';
    const saved = safeSessionGet(sessionGoalKey);

    goals.forEach((goal) => {
      const label = document.createElement('label');
      label.className = 'goal-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'listen-goal';
      input.value = goal.value;
      input.checked = saved === goal.value;

      const text = document.createElement('span');
      text.textContent = goal.label;

      input.addEventListener('change', () => {
        safeSessionSet(sessionGoalKey, goal.value);
        fieldset.classList.remove('needs-choice');
        const hint = fieldset.querySelector('[data-goal-required]');
        if (hint) hint.classList.remove('show');
        track('listen_goal_selected', {
          page_path: location.pathname,
          listen_goal: goal.value
        });
      });

      label.append(input, text);
      options.appendChild(label);
    });

    fieldset.appendChild(options);

    const required = document.createElement('div');
    required.className = 'goal-required';
    required.dataset.goalRequired = '';
    required.textContent = '先に、今してほしいことを1つ選んでください。';
    fieldset.appendChild(required);

    const storyLabel = writeBox.querySelector(`label[for="${textarea.id}"]`);
    writeBox.insertBefore(fieldset, storyLabel || textarea);
  };

  buildGoalSelector();

  const crisisTerms = ['死にたい', '自殺', '消えたい', '生きたくない', '死んでしまいたい', '自分を傷つけ'];

  const update = () => {
    const value = textarea.value;
    if (count) count.textContent = `${value.length}文字`;
    if (!startedTracked && value.trim().length >= 10) {
      startedTracked = true;
      track('started_writing', {
        page_path: location.pathname,
        listen_goal: getGoal() || 'unset'
      });
    }
    if (crisis) {
      const shouldShow = crisisTerms.some((term) => value.includes(term));
      crisis.classList.toggle('show', shouldShow);
    }
  };

  textarea.addEventListener('input', update);
  update();

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const goal = getGoal();
      if (!goal) {
        const selector = writeBox?.querySelector('[data-goal-selector]');
        const hint = selector?.querySelector('[data-goal-required]');
        selector?.classList.add('needs-choice');
        hint?.classList.add('show');
        selector?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const kind = button.dataset.interest;
      track(kind === 'voice' ? 'interest_voice_ai' : 'interest_text_ai', {
        page_path: location.pathname,
        listen_goal: goal
      });
      if (notice) {
        notice.classList.add('show');
        notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  const buildEndPanel = (tone = 'polite') => {
    if (!writeBox) return null;
    let panel = writeBox.querySelector('[data-end-panel]');
    if (panel) return panel;

    const casual = tone === 'casual';
    panel = document.createElement('section');
    panel.className = 'end-panel';
    panel.dataset.endPanel = '';
    panel.innerHTML = `
      <div class="divider"></div>
      <h3>${casual ? '最後にひとつだけ。今日の会話、どうだった？' : '最後にひとつだけ。今日の会話はいかがでしたか？'}</h3>
      <div class="rating-group" data-rating-group>
        <button type="button" class="rating-button" data-rating="1" aria-label="1 とても不満">1</button>
        <button type="button" class="rating-button" data-rating="2" aria-label="2 不満">2</button>
        <button type="button" class="rating-button" data-rating="3" aria-label="3 ふつう">3</button>
        <button type="button" class="rating-button" data-rating="4" aria-label="4 満足">4</button>
        <button type="button" class="rating-button" data-rating="5" aria-label="5 とても満足">5</button>
      </div>
      <p class="smallprint rating-caption"><span>合わなかった</span><span>とても良かった</span></p>
      <h3>${casual ? '最初に選んだ「してほしいこと」に合ってた？' : '最初に選んだ「してほしいこと」に合っていましたか？'}</h3>
      <div class="match-options">
        <button type="button" class="choice-button" data-goal-match="yes">合っていた</button>
        <button type="button" class="choice-button" data-goal-match="partial">少し違った</button>
        <button type="button" class="choice-button" data-goal-match="no">かなり違った</button>
      </div>
      <div class="consent-box" data-consent-box>
        <h3>サービス改善にご協力いただけますか？</h3>
        <p>今回の会話内容と上の回答を、サービス改善のため匿名のデータとして提供できます。運営者が内容を確認する場合があります。</p>
        <p><strong>個人を特定できる情報や、提供したくない内容が含まれている場合は、提供していただかなくて大丈夫です。</strong></p>
        <div class="actions compact-actions">
          <button class="button primary" type="button" data-consent="yes">匿名で提供する</button>
          <button class="button secondary" type="button" data-consent="no">提供しない</button>
        </div>
        <div class="notice" data-feedback-status></div>
      </div>
    `;

    writeBox.appendChild(panel);

    let rating = '';
    let goalMatch = '';

    panel.querySelectorAll('[data-rating]').forEach((button) => {
      button.addEventListener('click', () => {
        rating = button.dataset.rating;
        panel.querySelectorAll('[data-rating]').forEach((item) => item.classList.toggle('selected', item === button));
        track('conversation_rating_selected', { rating, page_path: location.pathname });
      });
    });

    panel.querySelectorAll('[data-goal-match]').forEach((button) => {
      button.addEventListener('click', () => {
        goalMatch = button.dataset.goalMatch;
        panel.querySelectorAll('[data-goal-match]').forEach((item) => item.classList.toggle('selected', item === button));
        track('goal_match_selected', { goal_match: goalMatch, page_path: location.pathname });
      });
    });

    panel.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', async () => {
        const consent = button.dataset.consent;
        const status = panel.querySelector('[data-feedback-status]');

        if (consent === 'no') {
          track('anonymous_data_consent', { consent: 'no', page_path: location.pathname });
          if (status) {
            status.textContent = '提供しないを選択しました。会話内容は改善用データとして送信されません。';
            status.classList.add('show');
          }
          return;
        }

        // 本文の送信先はまだ未設定。安全な保存先を用意するまで実データは送らない。
        const endpoint = window.KOKORO_FEEDBACK_ENDPOINT;
        if (!endpoint) {
          if (status) {
            status.textContent = '現在、匿名提供機能は準備中です。会話内容は送信されていません。';
            status.classList.add('show');
          }
          return;
        }

        const payload = {
          listen_goal: getGoal() || '',
          listen_goal_label: goalLabel(getGoal()),
          rating,
          goal_match: goalMatch,
          conversation_text: textarea.value,
          page_path: location.pathname,
          submitted_at: new Date().toISOString()
        };

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error('submit failed');
          track('anonymous_data_consent', { consent: 'yes', page_path: location.pathname });
          if (status) {
            status.textContent = 'ご協力ありがとうございます。匿名の改善用データとして送信しました。';
            status.classList.add('show');
          }
        } catch (_) {
          if (status) {
            status.textContent = '送信できませんでした。会話内容は改善用データとして保存されていません。';
            status.classList.add('show');
          }
        }
      });
    });

    return panel;
  };

  // 将来AI会話を接続したとき、会話終了時に呼ぶための公開インターフェース。
  window.KokoroListening = {
    getGoal,
    getGoalLabel: () => goalLabel(getGoal()),
    getConversationText: () => textarea.value,
    completeConversation: ({ tone = 'polite' } = {}) => {
      const panel = buildEndPanel(tone);
      if (panel) {
        panel.classList.add('show');
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
})();
