(function () {
  const TRANSLATIONS = {
    en: {
      'nav.tools': 'Tools',
      'nav.roadmap': 'Roadmap',
      'nav.about': 'About',
      'nav.home': 'Home',
      'nav.grid': 'Grid Splitter',
      'nav.watermarker': 'Watermark Remover',
      'hero.eyebrow': 'Creator Workflow Utilities',
      'hero.title': 'Build, refine, and share visual tools in one home.',
      'hero.lede':
        'A growing toolkit for YouTube production, thumbnail polish, and AI image finishing. Start with watermark cleanup and grid slicing, then expand as new ideas strike.',
      'hero.ctaPrimary': 'Browse tools',
      'hero.ctaSecondary': 'View roadmap',
      'hero.badgeCopy': '2 tools live<br />More on the way',
      'hero.grid1': 'Watermark',
      'hero.grid2': 'Grid Splitter',
      'hero.grid3': 'Color Prep',
      'hero.grid4': 'Batch Uploads',
      'tools.eyebrow': 'Toolbox',
      'tools.heading': 'Launch a utility',
      'tools.copy':
        'Each tool gets its own folder so it can scale independently while sharing the same brand system and layout.',
      'tools.watermark.title': 'Remove Watermarks',
      'tools.watermark.desc':
        'Upload, brush over distracting marks, and blend them away locally in the browser. Export the cleaned shot instantly.',
      'tools.grid.title': 'Image Grid Splitter',
      'tools.grid.desc':
        'Slice AI generations or thumbnails into even grids (2×2, 2×3, 3×3) for storyboards, carousels, and social sets.',
      'tools.card.cta': 'Open tool',
      'tools.prompt.title': 'Batch Prompt Presets',
      'tools.prompt.desc': 'Centralize go-to prompts and export them for rapid AI experimentation.',
      'tools.prompt.status': 'Coming soon',
      'roadmap.eyebrow': 'Roadmap',
      'roadmap.heading': 'Next up for OnSwitch',
      'roadmap.copy':
        'The site is structured so every tool is isolated in its own subfolder, keeping dependencies tidy while sharing the same global styles.',
      'roadmap.q1.title': 'Color palette harmonizer',
      'roadmap.q1.desc': 'Match channel branding across assets using sampled palettes.',
      'roadmap.q2.title': 'Caption kit',
      'roadmap.q2.desc': 'Auto-generate subtitles, style them, and export SRT/LRC.',
      'roadmap.q3.title': 'Batch exporter',
      'roadmap.q3.desc': 'Queue renders and publish sets directly to storage destinations.',
      'about.eyebrow': 'About',
      'about.heading': 'Built for fast experimentation',
      'about.copy1':
        'OnSwitch is the workbench for quick-hit utilities that speed up creative workflows. Every page relies on a shared CSS/JS foundation so the brand stays consistent even as tools evolve independently.',
      'about.copy2':
        'Have an idea for the next module? Duplicate a tool folder, wire up your script, and plug it into the navigation—no build step required.',
      'footer.made': 'Made by OnSwitch · Creator Ops Toolkit',
      'footer.docs': 'Docs',
      'footer.changelog': 'Changelog',
      'footer.contact': 'Contact',
      'footer.back': 'Back to home',
      'watermark.eyebrow': 'Tool 01',
      'watermark.heading': 'Remove watermarks & blemishes',
      'watermark.copy':
        'Upload an image, paint over the area you want to hide, then blend it away in the browser using a simple sampling-based inpaint pass. Your image never leaves the page.',
      'watermark.dropText': 'Drop an image or',
      'watermark.dropBrowse': 'browse',
      'watermark.brush': 'Brush size',
      'watermark.opacity': 'Overlay opacity',
      'watermark.preview': 'Brush preview',
      'watermark.clear': 'Clear mask',
      'watermark.apply': 'Remove watermark',
      'watermark.download': 'Download result',
      'watermark.footer': 'Need another workflow helper? Add it under <code>tools/</code> and plug it into the nav.',
      'grid.eyebrow': 'Tool 02',
      'grid.heading': 'Split an image into even grids',
      'grid.copy':
        'Slice AI generations or thumbnails into equal parts for carousel posts, mood boards, or upload pipelines. All processing happens in the browser.',
      'grid.dropText': 'Drop an image or',
      'grid.dropBrowse': 'browse',
      'grid.gridLabel': 'Grid size',
      'grid.prefix': 'Naming prefix',
      'grid.split': 'Split image',
      'grid.downloadAll': 'Download all',
      'grid.footer': 'New tools inherit shared CSS & brand from <code>assets/</code>.',
      'grid.tileDownload': 'Download',
    },
    zh: {
      'nav.tools': '工具',
      'nav.roadmap': '路线图',
      'nav.about': '关于',
      'nav.home': '首页',
      'nav.grid': '图片分割',
      'nav.watermarker': '去水印',
      'hero.eyebrow': '创作者工作流工具集',
      'hero.title': '在一个网站中打造、优化并分享可视化工具。',
      'hero.lede':
        '一个不断扩充的工具箱，用于 YouTube 生产、缩略图润色与 AI 图像精修。从去水印和九宫格切图开始，再随着灵感继续扩展。',
      'hero.ctaPrimary': '浏览工具',
      'hero.ctaSecondary': '查看路线图',
      'hero.badgeCopy': '已有 2 个工具<br />更多功能即将到来',
      'hero.grid1': '去水印',
      'hero.grid2': '九宫格切图',
      'hero.grid3': '色彩整理',
      'hero.grid4': '批量上传',
      'tools.eyebrow': '工具箱',
      'tools.heading': '启动一个小工具',
      'tools.copy': '每个工具位于独立文件夹，可独立扩展，并共享同一套品牌与布局。',
      'tools.watermark.title': '去除水印',
      'tools.watermark.desc': '上传图片、用画笔覆盖干扰元素，并在浏览器内完成智能混合，立即导出干净画面。',
      'tools.grid.title': '图像九宫格切割',
      'tools.grid.desc': '将 AI 作品或缩略图切成 2×2、2×3、3×3 等均匀网格，便于故事板与社交发布。',
      'tools.card.cta': '打开工具',
      'tools.prompt.title': '批量提示词预设',
      'tools.prompt.desc': '集中管理常用提示词，导出共享以加速 AI 实验。',
      'tools.prompt.status': '即将上线',
      'roadmap.eyebrow': '路线图',
      'roadmap.heading': 'OnSwitch 下一步',
      'roadmap.copy': '站点结构让每个工具都在独立子目录中运行，保持依赖整洁，同时共用全局样式。',
      'roadmap.q1.title': '色彩调和器',
      'roadmap.q1.desc': '利用取样色板在所有素材中统一频道品牌。',
      'roadmap.q2.title': '字幕工具包',
      'roadmap.q2.desc': '自动生成字幕、设置样式，并导出 SRT/LRC。',
      'roadmap.q3.title': '批量导出器',
      'roadmap.q3.desc': '排队渲染并直接推送到各类存储目的地。',
      'about.eyebrow': '关于',
      'about.heading': '为快速试验而生',
      'about.copy1': 'OnSwitch 是一张快装工作台，用快速小工具提升创意流程。所有页面都依赖共享的 CSS/JS，使品牌即便在工具独立演进时也保持统一。',
      'about.copy2': '有新的灵感？复制一个工具文件夹、接好脚本，再挂到导航中即可，无需构建流程。',
      'footer.made': '由 OnSwitch 打造 · 创作者效率工具包',
      'footer.docs': '文档',
      'footer.changelog': '更新日志',
      'footer.contact': '联系',
      'footer.back': '返回首页',
      'watermark.eyebrow': '工具 01',
      'watermark.heading': '去除水印与瑕疵',
      'watermark.copy': '上传图片、在想要修复的区域上涂抹，再通过浏览器内的采样混合算法将其柔和抹除，文件始终留在本地。',
      'watermark.dropText': '拖放图片或',
      'watermark.dropBrowse': '选择文件',
      'watermark.brush': '画笔大小',
      'watermark.opacity': '遮罩透明度',
      'watermark.preview': '画笔预览',
      'watermark.clear': '清除遮罩',
      'watermark.apply': '去除水印',
      'watermark.download': '下载结果',
      'watermark.footer': '还想要其他工作流助手？把它放进 <code>tools/</code> 并连到导航即可。',
      'grid.eyebrow': '工具 02',
      'grid.heading': '将图像切成均匀网格',
      'grid.copy': '把 AI 生成或缩略图切成等分，用于走马灯、情绪板或上传流程，所有处理都在本地浏览器完成。',
      'grid.dropText': '拖放图片或',
      'grid.dropBrowse': '选择文件',
      'grid.gridLabel': '网格尺寸',
      'grid.prefix': '文件前缀',
      'grid.split': '切割图像',
      'grid.downloadAll': '全部下载',
      'grid.footer': '新工具会自动继承 <code>assets/</code> 中的品牌样式。',
      'grid.tileDownload': '下载',
    },
  };

  const STORAGE_KEY = 'onswitch-lang';
  const FALLBACK_LANG = 'en';
  let currentLang = FALLBACK_LANG;

  function getTranslation(lang, key) {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS[FALLBACK_LANG]?.[key] || '';
  }

  function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const value = getTranslation(lang, key);
      if (value) {
        el.innerHTML = value;
      }
    });
  }

  function updateButtons(lang) {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function persistLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      // ignore storage errors
    }
  }

  function detectInitialLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && TRANSLATIONS[stored]) return stored;
    } catch (error) {
      // ignore
    }
    const browserLang = (navigator.language || '').toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh';
    return FALLBACK_LANG;
  }

  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : 'en');
    applyTranslations(lang);
    updateButtons(lang);
    persistLang(lang);
    document.dispatchEvent(new CustomEvent('onswitch:languagechange', { detail: { lang } }));
  }

  function initLanguage() {
    const initial = detectInitialLang();
    setLanguage(initial);
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  }

  document.addEventListener('DOMContentLoaded', initLanguage);

  window.OnswitchI18n = {
    t(key) {
      return getTranslation(currentLang, key) || key;
    },
    getLang() {
      return currentLang;
    },
  };
})();
