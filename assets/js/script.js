// Email Template Builder - Vanilla JavaScript Implementation

(function() {
  'use strict';

  // State management
  let components = [];
  let selectedId = null;
  let currentTemplateId = null;
  let currentTemplateName = '';
  let darkMode = false;
  let history = [[]];
  let historyIndex = 0;

  // Default component properties
  const defaultProps = {
    header: {
      logoUrl: '',
      companyName: 'MMIT',
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a'
    },
    hero: {
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=300&fit=crop',
      headline: 'Welcome to Our Newsletter',
      subtext: 'Stay updated with the latest news and exclusive offers.',
      overlayOpacity: 0.5
    },
    text: {
      content: 'Enter your text content here. You can customize this paragraph to share your message with your audience.',
      fontSize: 16,
      textAlign: 'left',
      textColor: '#4a4a4a'
    },
    button: {
      text: 'Click Here',
      url: 'https://example.com',
      backgroundColor: '#ffe65f',
      textColor: '#0f172a',
      align: 'center',
      borderRadius: 6
    },
    image: {
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      alt: 'Image description',
      width: 'full',
      align: 'center'
    },
    divider: {
      color: '#e5e5e5',
      thickness: 1,
      style: 'solid'
    },
    spacer: {
      height: 32
    },
    social: {
      platforms: [
        { name: 'facebook', url: 'https://facebook.com', enabled: true },
        { name: 'twitter', url: 'https://twitter.com', enabled: true },
        { name: 'instagram', url: 'https://instagram.com', enabled: true },
        { name: 'linkedin', url: 'https://linkedin.com', enabled: true }
      ],
      iconSize: 24,
      align: 'center'
    },
    'two-column': {
      leftContent: 'Left column content goes here.',
      rightContent: 'Right column content goes here.',
      gap: 24
    },
    footer: {
      companyName: 'MMIT',
      address: '1020 Stony Hill Rd, Yardley, PA 19067',
      unsubscribeText: 'Unsubscribe from these emails',
      unsubscribeUrl: '#unsubscribe',
      textColor: '#737373',
      backgroundColor: '#f5f5f5'
    }
    ,
    // Components extracted from boilerplate.html sections
    'news-header': {
      logoUrl: 'https://static.mailjet.com/mjml-website/templates/arturia-logo.png',
      newsText: 'NEWS\nMARCH 2016',
      bgColor: '#ffffff'
    },
    cta: {
      text: "Don't click me!",
      bgColor: '#f45e43',
      textColor: '#ffffff'
    },
    'features-two': {
      leftTitle: 'Easy and quick',
      leftText: 'Write less code, save time and code more efficiently with MJML’s semantic syntax.',
      rightTitle: 'Responsive',
      rightText: 'MJML is responsive by design on most-popular email clients, even Outlook.'
    },
    'image-block': {
      src: 'https://static.mailjet.com/mjml-website/documentation/image.png',
      alt: '',
      width: 300
    },
    'data-table': {
      rows: [
        ['1995', 'PHP', 'C, Shell Unix'],
        ['1995', 'JavaScript', 'Scheme, Self']
      ],
      headers: ['Year', 'Language', 'Inspired from']
    },
    'title-paragraph': {
      title: 'Title',
      paragraphs: ['Paragraph', 'Another paragraph']
    },
    'features-three': {
      items: [
        { icon: 'https://static.mailjet.com/mjml-website/templates/onepage-icon1.png', title: 'Best audience', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { icon: 'https://static.mailjet.com/mjml-website/templates/onepage-icon2.png', title: 'Higher rates', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { icon: 'https://static.mailjet.com/mjml-website/templates/onepage-icon3.png', title: '24/7 Support', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }
      ]
    }
  };

  // Generate unique ID
  function generateId() {
    return 'comp_' + Math.random().toString(36).substr(2, 9);
  }

  // Create component
  function createComponent(type) {
    return {
      id: generateId(),
      type: type,
      props: JSON.parse(JSON.stringify(defaultProps[type]))
    };
  }

  // Toast notification
  function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  }

  // Push to history
  function pushHistory(newComponents) {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(newComponents)));
    if (history.length > 50) history.shift();
    historyIndex = history.length - 1;
    updateUndoRedoButtons();
  }

  // Update undo/redo button states
  function updateUndoRedoButtons() {
    document.getElementById('btnUndo').disabled = historyIndex <= 0;
    document.getElementById('btnRedo').disabled = historyIndex >= history.length - 1;
    document.getElementById('btnClear').disabled = components.length === 0;
  }

  // Render component preview HTML
  function renderComponentPreview(component) {
    const { type, props, id } = component;
    const isDark = darkMode;
    
    let content = '';
    
    switch (type) {
      case 'header':
        content = `
          <div style="padding: 24px; background-color: ${props.backgroundColor}; text-align: center;">
            ${props.logoUrl ? `<img src="${props.logoUrl}" alt="Logo" style="max-height: 50px; margin-bottom: 8px;">` : ''}
            <div style="font-size: 20px; font-weight: 600; color: ${isDark ? '#ffffff' : props.textColor};">${props.companyName}</div>
          </div>
        `;
        break;
        case 'news-header':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${props.bgColor};">
              <tr>
                <td width="33%" style="padding:10px 25px; text-align:center; vertical-align:middle;">
                  ${props.logoUrl ? `<img src="${props.logoUrl}" alt="Logo" style="display:block; max-width:144px; width:100%; height:auto;" />` : ''}
                </td>
                <td width="34%" style="padding:10px 25px; vertical-align:middle; text-align:left;"></td>
                <td width="33%" style="padding:10px 25px; vertical-align:middle; text-align:left; font-family:Ubuntu, Helvetica, Arial, sans-serif; font-size:13px; line-height:120%; color:#000000;">
                  ${props.newsText.replace(/\n/g, '<br/>')}
                </td>
              </tr>
            </table>
          `;
          break;
        case 'cta':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:10px 25px;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                    <tr>
                      <td align="center" bgcolor="${props.bgColor}" style="border:none;border-radius:3px;padding:10px 25px;">
                        <span style="color:${props.textColor};font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:120%;">${props.text}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          `;
          break;
        case 'features-two':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:10px 25px; vertical-align:top;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="50%" style="padding:10px; vertical-align:top;">
                        <h2 style="margin:0;font-size:18px;">${props.leftTitle}</h2>
                        <p style="margin:8px 0 0 0; font-size:13px;">${props.leftText}</p>
                      </td>
                      <td width="50%" style="padding:10px; vertical-align:top;">
                        <h2 style="margin:0;font-size:18px;">${props.rightTitle}</h2>
                        <p style="margin:8px 0 0 0; font-size:13px;">${props.rightText}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          `;
          break;
        case 'image-block':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding:10px 25px;">
                  <img src="${props.src}" alt="${props.alt}" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:${props.width}px;" />
                </td>
              </tr>
            </table>
          `;
          break;
        case 'data-table':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:10px 25px;">
              <tr style="border-bottom:1px solid #ecedee;text-align:left;padding:15px 0;">
                ${props.headers.map(h => `<th style="padding: 0 15px 0 0;">${h}</th>`).join('')}
              </tr>
              ${props.rows.map(row => `<tr>${row.map((cell, i) => `<td style="padding: 8px 15px;">${cell}</td>`).join('')}</tr>`).join('')}
            </table>
          `;
          break;
        case 'title-paragraph':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:10px 25px;">
              <tr>
                <td align="left">
                  <h1 style="margin:0 0 8px 0;">${props.title}</h1>
                  ${props.paragraphs.map(p => `<p style="margin:0 0 8px 0;">${p}</p>`).join('')}
                </td>
              </tr>
            </table>
          `;
          break;
        case 'features-three':
          content = `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:10px 25px;">
              <tr>
                ${props.items.map(item => `
                  <td width="33%" style="padding:10px;text-align:center;vertical-align:top;">
                    <img src="${item.icon}" alt="" style="width:50px;height:auto;display:block;margin:0 auto 10px auto;" />
                    <div style="font-size:14px;font-weight:600;margin-bottom:6px;">${item.title}</div>
                    <div style="font-size:13px;color:#9da3a3;">${item.text}</div>
                  </td>
                `).join('')}
              </tr>
            </table>
          `;
          break;
      case 'hero':
        content = `
          <div style="position: relative; min-height: 200px; background: url('${props.imageUrl}') center/cover no-repeat;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,${props.overlayOpacity}); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center;">
              <h2 style="font-size: 28px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">${props.headline}</h2>
              <p style="font-size: 16px; color: rgba(255,255,255,0.9); margin: 0;">${props.subtext}</p>
            </div>
          </div>
        `;
        break;
      case 'text':
        content = `
          <div style="padding: 24px;">
            <p style="font-size: ${props.fontSize}px; text-align: ${props.textAlign}; color: ${isDark ? '#e0e0e0' : props.textColor}; margin: 0; line-height: 1.6;">${props.content}</p>
          </div>
        `;
        break;
      case 'button':
        content = `
          <div style="padding: 24px; text-align: ${props.align};">
            <a href="${props.url}" style="display: inline-block; padding: 12px 28px; background-color: ${props.backgroundColor}; color: ${props.textColor}; text-decoration: none; font-weight: 500; border-radius: ${props.borderRadius}px;">${props.text}</a>
          </div>
        `;
        break;
      case 'image':
        const widthMap = { full: '100%', '75%': '75%', '50%': '50%' };
        content = `
          <div style="padding: 16px; text-align: ${props.align};">
            <img src="${props.url}" alt="${props.alt}" style="max-width: ${widthMap[props.width]}; height: auto; border-radius: 4px;">
          </div>
        `;
        break;
      case 'divider':
        content = `
          <div style="padding: 16px 24px;">
            <hr style="border: none; border-top: ${props.thickness}px ${props.style} ${props.color}; margin: 0;">
          </div>
        `;
        break;
      case 'spacer':
        content = `<div style="height: ${props.height}px;"></div>`;
        break;
      case 'social':
        const socialIcons = {
          facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
          twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
          instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
          linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
        };
        const enabledPlatforms = props.platforms.filter(p => p.enabled);
        content = `
          <div style="padding: 24px; text-align: ${props.align};">
            ${enabledPlatforms.map(p => `
              <a href="${p.url}" style="display: inline-block; margin: 0 8px; color: ${isDark ? '#a0a0a0' : '#666666'}; width: ${props.iconSize}px; height: ${props.iconSize}px;">
                ${socialIcons[p.name] || ''}
              </a>
            `).join('')}
          </div>
        `;
        break;
        case 'news-header':
          html = `
            <div class="property-group">
              <label>Logo URL</label>
              <input type="text" class="input" data-prop="logoUrl" value="${props.logoUrl}" placeholder="https://..." />
            </div>
            <div class="property-group">
              <label>News Column Text</label>
              <textarea class="textarea" data-prop="newsText">${props.newsText}</textarea>
            </div>
            <div class="property-group">
              <label>Background Color</label>
              <div class="color-input-wrapper">
                <input type="color" data-prop="bgColor" value="${props.bgColor}">
                <input type="text" class="input" data-prop="bgColor" value="${props.bgColor}">
              </div>
            </div>
          `;
          break;
        case 'cta':
          html = `
            <div class="property-group">
              <label>CTA Text</label>
              <input type="text" class="input" data-prop="text" value="${props.text}">
            </div>
            <div class="property-group">
              <label>Background Color</label>
              <div class="color-input-wrapper">
                <input type="color" data-prop="bgColor" value="${props.bgColor}">
                <input type="text" class="input" data-prop="bgColor" value="${props.bgColor}">
              </div>
            </div>
            <div class="property-group">
              <label>Text Color</label>
              <div class="color-input-wrapper">
                <input type="color" data-prop="textColor" value="${props.textColor}">
                <input type="text" class="input" data-prop="textColor" value="${props.textColor}">
              </div>
            </div>
          `;
          break;
        case 'features-two':
          html = `
            <div class="property-group">
              <label>Left Title</label>
              <input type="text" class="input" data-prop="leftTitle" value="${props.leftTitle}">
            </div>
            <div class="property-group">
              <label>Left Text</label>
              <textarea class="textarea" data-prop="leftText">${props.leftText}</textarea>
            </div>
            <div class="property-group">
              <label>Right Title</label>
              <input type="text" class="input" data-prop="rightTitle" value="${props.rightTitle}">
            </div>
            <div class="property-group">
              <label>Right Text</label>
              <textarea class="textarea" data-prop="rightText">${props.rightText}</textarea>
            </div>
          `;
          break;
        case 'image-block':
          html = `
            <div class="property-group">
              <label>Image URL</label>
              <input type="text" class="input" data-prop="src" value="${props.src}">
            </div>
            <div class="property-group">
              <label>Alt Text</label>
              <input type="text" class="input" data-prop="alt" value="${props.alt}">
            </div>
            <div class="property-group">
              <label>Width (px)</label>
              <div class="range-wrapper">
                <input type="range" min="50" max="800" data-prop="width" value="${props.width}">
                <span>${props.width}px</span>
              </div>
            </div>
          `;
          break;
        case 'data-table':
          html = `
            <div class="property-group">
              <label>Headers (comma separated)</label>
              <input type="text" class="input" data-prop="headers" value="${props.headers.join(', ')}">
            </div>
            <div class="property-group">
              <label>Rows (one row per line, comma separated)</label>
              <textarea class="textarea" data-prop="rows">${props.rows.map(r => r.join(', ')).join('\n')}</textarea>
            </div>
          `;
          break;
        case 'title-paragraph':
          html = `
            <div class="property-group">
              <label>Title</label>
              <input type="text" class="input" data-prop="title" value="${props.title}">
            </div>
            <div class="property-group">
              <label>Paragraphs (one per line)</label>
              <textarea class="textarea" data-prop="paragraphs">${props.paragraphs.join('\n')}</textarea>
            </div>
          `;
          break;
        case 'features-three':
          html = `
            <div class="property-group">
              <label>Items (JSON array of {icon,title,text})</label>
              <textarea class="textarea" data-prop="items">${JSON.stringify(props.items, null, 2)}</textarea>
              <small>Example: [{"icon":"url","title":"Best audience","text":"..."}]</small>
            </div>
          `;
          break;
      case 'two-column':
        content = `
          <div style="padding: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="48%" style="vertical-align: top; padding-right: ${props.gap / 2}px;">
                  <p style="margin: 0; color: ${isDark ? '#e0e0e0' : '#4a4a4a'};">${props.leftContent}</p>
                </td>
                <td width="48%" style="vertical-align: top; padding-left: ${props.gap / 2}px;">
                  <p style="margin: 0; color: ${isDark ? '#e0e0e0' : '#4a4a4a'};">${props.rightContent}</p>
                </td>
              </tr>
            </table>
          </div>
        `;
        break;
      case 'footer':
        content = `
          <div style="padding: 32px; background-color: ${isDark ? '#2a2a2a' : props.backgroundColor}; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: ${isDark ? '#a0a0a0' : props.textColor};">${props.companyName}</p>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: ${isDark ? '#808080' : props.textColor};">${props.address}</p>
            <a href="${props.unsubscribeUrl}" style="font-size: 12px; color: ${isDark ? '#a0a0a0' : props.textColor};">${props.unsubscribeText}</a>
          </div>
        `;
        break;
    }
    
    return `
      <div class="canvas-component ${selectedId === id ? 'selected' : ''}" data-id="${id}" data-testid="canvas-component-${id}">
        <div class="component-actions">
          <button class="drag-handle" title="Drag to reorder">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </button>
          <button class="delete" title="Delete component" data-testid="button-delete-${id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
        ${content}
      </div>
    `;
  }

  // Render canvas
  function renderCanvas() {
    const preview = document.getElementById('emailPreview');
    const countEl = document.getElementById('canvasCount');
    
    if (components.length === 0) {
      preview.innerHTML = `
        <div class="empty-state" id="emptyState">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <p>Drag components here to start building your email</p>
        </div>
      `;
      countEl.textContent = 'Drop components here to build your email';
    } else {
      preview.innerHTML = components.map(c => renderComponentPreview(c)).join('');
      countEl.textContent = `${components.length} component${components.length !== 1 ? 's' : ''}`;
    }
    
    preview.className = 'email-preview' + (darkMode ? ' dark-mode' : '');
    
    // Attach event listeners to canvas components
    preview.querySelectorAll('.canvas-component').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.closest('.component-actions')) {
          selectComponent(el.dataset.id);
        }
      });
      
      el.querySelector('.delete')?.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteComponent(el.dataset.id);
      });
      
      // Drag handle for reordering
      const handle = el.querySelector('.drag-handle');
      if (handle) {
        handle.addEventListener('mousedown', () => {
          el.draggable = true;
        });
        el.addEventListener('dragend', () => {
          el.draggable = false;
        });
      }
    });
    
    updateUndoRedoButtons();
  }

  // Select component
  function selectComponent(id) {
    selectedId = id;
    renderCanvas();
    renderPropertyEditor();
  }

  // Delete component
  function deleteComponent(id) {
    components = components.filter(c => c.id !== id);
    if (selectedId === id) {
      selectedId = null;
    }
    pushHistory(components);
    renderCanvas();
    renderPropertyEditor();
    showToast('Component deleted', 'Component removed from canvas');
  }

  // Render property editor
  function renderPropertyEditor() {
    const editor = document.getElementById('propertyEditor');
    const title = document.getElementById('propertyTitle');
    const subtitle = document.getElementById('propertySubtitle');
    
    if (!selectedId) {
      title.textContent = 'Properties';
      subtitle.textContent = 'Select a component to edit';
      editor.innerHTML = `
        <div class="empty-property-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          <p>Click on a component in the canvas to edit its properties</p>
        </div>
      `;
      return;
    }
    
    const component = components.find(c => c.id === selectedId);
    if (!component) return;
    
    const typeNames = {
      header: 'Header',
      hero: 'Hero Banner',
      text: 'Text Block',
      button: 'Button',
      image: 'Image',
      divider: 'Divider',
      spacer: 'Spacer',
      social: 'Social Links',
      'two-column': 'Two Columns',
      'news-header': 'News Header',
      cta: 'Call To Action',
      'features-two': 'Two Features',
      'image-block': 'Image Block',
      'data-table': 'Data Table',
      'title-paragraph': 'Title & Paragraphs',
      'features-three': 'Three Features',
      footer: 'Footer'
    };
    
    title.textContent = typeNames[component.type] + ' Settings';
    subtitle.textContent = 'Customize this component';
    
    let html = '';
    const { props } = component;
    
    switch (component.type) {
      case 'header':
        html = `
          <div class="property-group">
            <label>Company Name</label>
            <input type="text" class="input" data-prop="companyName" value="${props.companyName}" data-testid="input-company-name">
          </div>
          <div class="property-group">
            <label>Logo URL</label>
            <input type="text" class="input" data-prop="logoUrl" value="${props.logoUrl || ''}" placeholder="https://..." data-testid="input-logo-url">
          </div>
          <div class="property-group">
            <label>Background Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="backgroundColor" value="${props.backgroundColor}" data-testid="input-bg-color">
              <input type="text" class="input" data-prop="backgroundColor" value="${props.backgroundColor}">
            </div>
          </div>
          <div class="property-group">
            <label>Text Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="textColor" value="${props.textColor}" data-testid="input-text-color">
              <input type="text" class="input" data-prop="textColor" value="${props.textColor}">
            </div>
          </div>
        `;
        break;
      case 'hero':
        html = `
          <div class="property-group">
            <label>Headline</label>
            <input type="text" class="input" data-prop="headline" value="${props.headline}" data-testid="input-headline">
          </div>
          <div class="property-group">
            <label>Subtext</label>
            <textarea class="textarea" data-prop="subtext" data-testid="input-subtext">${props.subtext}</textarea>
          </div>
          <div class="property-group">
            <label>Background Image URL</label>
            <input type="text" class="input" data-prop="imageUrl" value="${props.imageUrl}" data-testid="input-image-url">
          </div>
          <div class="property-group">
            <label>Overlay Opacity</label>
            <div class="range-wrapper">
              <input type="range" min="0" max="1" step="0.1" data-prop="overlayOpacity" value="${props.overlayOpacity}" data-testid="input-overlay">
              <span>${Math.round(props.overlayOpacity * 100)}%</span>
            </div>
          </div>
        `;
        break;
      case 'text':
        html = `
          <div class="property-group">
            <label>Content</label>
            <textarea class="textarea" data-prop="content" data-testid="input-content">${props.content}</textarea>
          </div>
          <div class="property-group">
            <label>Font Size</label>
            <div class="range-wrapper">
              <input type="range" min="12" max="32" data-prop="fontSize" value="${props.fontSize}" data-testid="input-font-size">
              <span>${props.fontSize}px</span>
            </div>
          </div>
          <div class="property-group">
            <label>Text Align</label>
            <select class="select" data-prop="textAlign" data-testid="select-text-align">
              <option value="left" ${props.textAlign === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${props.textAlign === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${props.textAlign === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
          <div class="property-group">
            <label>Text Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="textColor" value="${props.textColor}" data-testid="input-text-color">
              <input type="text" class="input" data-prop="textColor" value="${props.textColor}">
            </div>
          </div>
        `;
        break;
      case 'button':
        html = `
          <div class="property-group">
            <label>Button Text</label>
            <input type="text" class="input" data-prop="text" value="${props.text}" data-testid="input-button-text">
          </div>
          <div class="property-group">
            <label>URL</label>
            <input type="text" class="input" data-prop="url" value="${props.url}" data-testid="input-url">
          </div>
          <div class="property-group">
            <label>Alignment</label>
            <select class="select" data-prop="align" data-testid="select-align">
              <option value="left" ${props.align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${props.align === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${props.align === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
          <div class="property-group">
            <label>Background Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="backgroundColor" value="${props.backgroundColor}" data-testid="input-bg-color">
              <input type="text" class="input" data-prop="backgroundColor" value="${props.backgroundColor}">
            </div>
          </div>
          <div class="property-group">
            <label>Text Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="textColor" value="${props.textColor}" data-testid="input-text-color">
              <input type="text" class="input" data-prop="textColor" value="${props.textColor}">
            </div>
          </div>
          <div class="property-group">
            <label>Border Radius</label>
            <div class="range-wrapper">
              <input type="range" min="0" max="24" data-prop="borderRadius" value="${props.borderRadius}" data-testid="input-radius">
              <span>${props.borderRadius}px</span>
            </div>
          </div>
        `;
        break;
      case 'image':
        html = `
          <div class="property-group">
            <label>Image URL</label>
            <input type="text" class="input" data-prop="url" value="${props.url}" data-testid="input-image-url">
          </div>
          <div class="property-group">
            <label>Alt Text</label>
            <input type="text" class="input" data-prop="alt" value="${props.alt}" data-testid="input-alt">
          </div>
          <div class="property-group">
            <label>Width</label>
            <select class="select" data-prop="width" data-testid="select-width">
              <option value="full" ${props.width === 'full' ? 'selected' : ''}>Full Width</option>
              <option value="75%" ${props.width === '75%' ? 'selected' : ''}>75%</option>
              <option value="50%" ${props.width === '50%' ? 'selected' : ''}>50%</option>
            </select>
          </div>
          <div class="property-group">
            <label>Alignment</label>
            <select class="select" data-prop="align" data-testid="select-align">
              <option value="left" ${props.align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${props.align === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${props.align === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
        `;
        break;
      case 'divider':
        html = `
          <div class="property-group">
            <label>Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="color" value="${props.color}" data-testid="input-color">
              <input type="text" class="input" data-prop="color" value="${props.color}">
            </div>
          </div>
          <div class="property-group">
            <label>Thickness</label>
            <div class="range-wrapper">
              <input type="range" min="1" max="8" data-prop="thickness" value="${props.thickness}" data-testid="input-thickness">
              <span>${props.thickness}px</span>
            </div>
          </div>
          <div class="property-group">
            <label>Style</label>
            <select class="select" data-prop="style" data-testid="select-style">
              <option value="solid" ${props.style === 'solid' ? 'selected' : ''}>Solid</option>
              <option value="dashed" ${props.style === 'dashed' ? 'selected' : ''}>Dashed</option>
              <option value="dotted" ${props.style === 'dotted' ? 'selected' : ''}>Dotted</option>
            </select>
          </div>
        `;
        break;
      case 'spacer':
        html = `
          <div class="property-group">
            <label>Height</label>
            <div class="range-wrapper">
              <input type="range" min="8" max="120" data-prop="height" value="${props.height}" data-testid="input-height">
              <span>${props.height}px</span>
            </div>
          </div>
        `;
        break;
      case 'social':
        html = `
          <div class="property-group">
            <label>Platforms</label>
            <div class="social-toggle">
              ${props.platforms.map((p, i) => `
                <label>
                  <input type="checkbox" data-platform="${i}" ${p.enabled ? 'checked' : ''} data-testid="checkbox-${p.name}">
                  ${p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                </label>
              `).join('')}
            </div>
          </div>
          <div class="property-group">
            <label>Icon Size</label>
            <div class="range-wrapper">
              <input type="range" min="16" max="40" data-prop="iconSize" value="${props.iconSize}" data-testid="input-icon-size">
              <span>${props.iconSize}px</span>
            </div>
          </div>
          <div class="property-group">
            <label>Alignment</label>
            <select class="select" data-prop="align" data-testid="select-align">
              <option value="left" ${props.align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${props.align === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${props.align === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
        `;
        break;
      case 'two-column':
        html = `
          <div class="property-group">
            <label>Left Column Content</label>
            <textarea class="textarea" data-prop="leftContent" data-testid="input-left-content">${props.leftContent}</textarea>
          </div>
          <div class="property-group">
            <label>Right Column Content</label>
            <textarea class="textarea" data-prop="rightContent" data-testid="input-right-content">${props.rightContent}</textarea>
          </div>
          <div class="property-group">
            <label>Gap</label>
            <div class="range-wrapper">
              <input type="range" min="8" max="48" data-prop="gap" value="${props.gap}" data-testid="input-gap">
              <span>${props.gap}px</span>
            </div>
          </div>
        `;
        break;
      case 'footer':
        html = `
          <div class="property-group">
            <label>Company Name</label>
            <input type="text" class="input" data-prop="companyName" value="${props.companyName}" data-testid="input-company-name">
          </div>
          <div class="property-group">
            <label>Address</label>
            <input type="text" class="input" data-prop="address" value="${props.address}" data-testid="input-address">
          </div>
          <div class="property-group">
            <label>Unsubscribe Text</label>
            <input type="text" class="input" data-prop="unsubscribeText" value="${props.unsubscribeText}" data-testid="input-unsub-text">
          </div>
          <div class="property-group">
            <label>Unsubscribe URL</label>
            <input type="text" class="input" data-prop="unsubscribeUrl" value="${props.unsubscribeUrl}" data-testid="input-unsub-url">
          </div>
          <div class="property-group">
            <label>Background Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="backgroundColor" value="${props.backgroundColor}" data-testid="input-bg-color">
              <input type="text" class="input" data-prop="backgroundColor" value="${props.backgroundColor}">
            </div>
          </div>
          <div class="property-group">
            <label>Text Color</label>
            <div class="color-input-wrapper">
              <input type="color" data-prop="textColor" value="${props.textColor}" data-testid="input-text-color">
              <input type="text" class="input" data-prop="textColor" value="${props.textColor}">
            </div>
          </div>
        `;
        break;
    }
    
    editor.innerHTML = html;
    
    // Attach event listeners for property changes
    editor.querySelectorAll('input, textarea, select').forEach(el => {
      const eventType = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(eventType, (e) => {
        const prop = el.dataset.prop;
        const platformIdx = el.dataset.platform;
        
        if (platformIdx !== undefined) {
          // Social platform toggle
          const idx = parseInt(platformIdx);
          components = components.map(c => {
            if (c.id === selectedId) {
              c.props.platforms[idx].enabled = el.checked;
            }
            return c;
          });
        } else if (prop) {
          let value = el.value;

          // Special parsing for structured props
          if (prop === 'rows') {
            // parse textarea rows into array of arrays (CSV per line)
            value = el.value.split('\n').map(r => r.split(',').map(cell => cell.trim()));
          } else if (prop === 'headers') {
            value = el.value.split(',').map(h => h.trim());
          } else if (prop === 'paragraphs') {
            value = el.value.split('\n').map(p => p.trim()).filter(Boolean);
          } else if (prop === 'items') {
            try {
              value = JSON.parse(el.value);
            } catch (err) {
              // keep string until valid JSON provided
              value = props.items;
            }
          } else if (['fontSize', 'borderRadius', 'thickness', 'height', 'iconSize', 'gap', 'width'].includes(prop)) {
            value = parseInt(value);
          } else if (prop === 'overlayOpacity') {
            value = parseFloat(value);
          }

          components = components.map(c => {
            if (c.id === selectedId) {
              c.props[prop] = value;
            }
            return c;
          });
          
          // Sync color inputs
          if (el.type === 'color' || (el.type === 'text' && el.closest('.color-input-wrapper'))) {
            const wrapper = el.closest('.color-input-wrapper');
            if (wrapper) {
              wrapper.querySelectorAll(`[data-prop="${prop}"]`).forEach(input => {
                if (input !== el) input.value = value;
              });
            }
          }
          
          // Update range display
          if (el.type === 'range') {
            const span = el.parentElement.querySelector('span');
            if (span) {
              if (prop === 'overlayOpacity') {
                span.textContent = Math.round(value * 100) + '%';
              } else {
                span.textContent = value + 'px';
              }
            }
          }
        }
        
        pushHistory(components);
        renderCanvas();
      });
    });
  }

  // Generate HTML for export
  function generateHtml() {
    const bgColor = darkMode ? '#1a1a1a' : '#ffffff';
    const textColor = darkMode ? '#ffffff' : '#1a1a1a';
    
    let body = components.map(c => {
      const preview = document.createElement('div');
      preview.innerHTML = renderComponentPreview(c);
      const inner = preview.querySelector('.canvas-component');
      if (inner) {
        inner.querySelector('.component-actions')?.remove();
        inner.classList.remove('canvas-component', 'selected');
      }
      return inner ? inner.innerHTML : '';
    }).join('');
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Template</title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        /* http://meyerweb.com/eric/tools/css/reset/ 
          v2.0 | 20110126
          License: none (public domain)
        */
        html, body, div, span, applet, object, iframe,
        h1, h2, h3, h4, h5, h6, p, blockquote, pre,
        a, abbr, acronym, address, big, cite, code,
        del, dfn, em, img, ins, kbd, q, s, samp,
        small, strike, strong, sub, sup, tt, var,
        b, u, i, center,
        dl, dt, dd, ol, ul, li,
        fieldset, form, label, legend,
        table, caption, tbody, tfoot, thead, tr, th, td,
        article, aside, canvas, details, embed, 
        figure, figcaption, footer, header, hgroup, 
        menu, nav, output, ruby, section, summary,
        time, mark, audio, video {
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 100%;
          font: inherit;
          vertical-align: baseline;
        }
        /* HTML5 display-role reset for older browsers */
        article, aside, details, figcaption, figure, 
        footer, header, hgroup, menu, nav, section {
          display: block;
        }
        body {
          line-height: 1;
        }
        ol, ul {
          list-style: none;
        }
        blockquote, q {
          quotes: none;
        }
        blockquote:before, blockquote:after,
        q:before, q:after {
          content: '';
          content: none;
        }
        table {
          border-collapse: collapse;
          border-spacing: 0;
        }
        img {
          max-width: 100%;
          height: auto;
          vertical-align: middle;
          font-style: italic;
          background-repeat: no-repeat;
          background-size: cover;
          shape-margin: 1rem;
        }
        @media print {
          @page {
            margin: 0;
            size: landscape;
          }
          body {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${bgColor}; color: ${textColor};">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor};">
        <tr>
          <td align="center" style="padding: 24px;">
            <table role="presentation" width="870" cellpadding="0" cellspacing="0" border="0" style="max-width: 870px; background-color: ${bgColor};">
              <tr>
                <td>
                  ${body}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  // API functions
  async function fetchTemplates() {
    try {
      const res = await fetch('/api/templates');
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      return [];
    }
  }

  async function saveTemplate(name, comps) {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, components: comps })
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to save template:', err);
      throw err;
    }
  }

  async function updateTemplate(id, data) {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to update template:', err);
      throw err;
    }
  }

  async function deleteTemplate(id) {
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete template:', err);
      throw err;
    }
  }

  // Initialize drag and drop
  function initDragDrop() {
    const palette = document.getElementById('componentPalette');
    const preview = document.getElementById('emailPreview');
    let draggedType = null;
    let draggedComponentId = null;
    
    // Palette drag
    palette.querySelectorAll('.component-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const type = item.dataset.type;
        draggedType = type;
        draggedComponentId = null;
        e.dataTransfer.setData('text/plain', type);
        e.dataTransfer.setData('application/x-email-component', type);
        e.dataTransfer.effectAllowed = 'copy';
        item.classList.add('dragging');
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });
    
    // Canvas drop zone
    preview.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = draggedType ? 'copy' : 'move';
      preview.classList.add('drag-over');
    });
    
    preview.addEventListener('dragleave', (e) => {
      if (!preview.contains(e.relatedTarget)) {
        preview.classList.remove('drag-over');
      }
    });
    
    preview.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      preview.classList.remove('drag-over');
      
      // Get the component type from dataTransfer or state fallback
      let componentType = e.dataTransfer.getData('application/x-email-component') || 
                          e.dataTransfer.getData('text/plain');
      
      // Use state variable as fallback
      if (!componentType || !defaultProps[componentType]) {
        componentType = draggedType;
      }
      
      if (componentType && defaultProps[componentType]) {
        const newComp = createComponent(componentType);
        
        // Find drop position - check if dropped on existing component
        const dropTarget = e.target.closest('.canvas-component');
        if (dropTarget && dropTarget.dataset && dropTarget.dataset.id) {
          const targetId = dropTarget.dataset.id;
          const targetIdx = components.findIndex(c => c.id === targetId);
          if (targetIdx >= 0) {
            components.splice(targetIdx, 0, newComp);
          } else {
            components.push(newComp);
          }
        } else {
          components.push(newComp);
        }
        
        selectedId = newComp.id;
        pushHistory(components);
        renderCanvas();
        renderPropertyEditor();
        showToast('Component added', `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} added to canvas`);
        draggedType = null;
      } else if (draggedComponentId) {
        // Reorder existing components
        const dropTarget = e.target.closest('.canvas-component');
        if (dropTarget && dropTarget.dataset.id !== draggedComponentId) {
          const fromIdx = components.findIndex(c => c.id === draggedComponentId);
          const toIdx = components.findIndex(c => c.id === dropTarget.dataset.id);
          if (fromIdx > -1 && toIdx > -1) {
            const [moved] = components.splice(fromIdx, 1);
            components.splice(toIdx, 0, moved);
            pushHistory(components);
            renderCanvas();
          }
        }
        draggedComponentId = null;
      }
    });
    
    // Component reordering within canvas
    preview.addEventListener('dragstart', (e) => {
      const comp = e.target.closest('.canvas-component');
      if (comp) {
        draggedComponentId = comp.dataset.id;
        draggedType = null;
        e.dataTransfer.setData('text/plain', 'reorder');
        comp.classList.add('dragging');
      }
    });
    
    preview.addEventListener('dragend', (e) => {
      const comp = e.target.closest('.canvas-component');
      if (comp) {
        comp.classList.remove('dragging');
        comp.draggable = false;
      }
      draggedComponentId = null;
    });
  }

  // Initialize modals
  function initModals() {
    // Export modal
    const exportModal = document.getElementById('exportModal');
    document.getElementById('btnExport').addEventListener('click', () => {
      if (components.length === 0) {
        showToast('No components', 'Add some components to your email first', 'error');
        return;
      }
      document.getElementById('exportCode').textContent = generateHtml();
      exportModal.classList.add('active');
    });
    document.getElementById('closeExportModal').addEventListener('click', () => {
      exportModal.classList.remove('active');
    });
    document.getElementById('copyExportCode').addEventListener('click', () => {
      navigator.clipboard.writeText(generateHtml());
      showToast('Copied!', 'HTML code copied to clipboard');
    });
    document.getElementById('downloadExport').addEventListener('click', () => {
      const blob = new Blob([generateHtml()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template.html';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Downloaded!', 'HTML file has been downloaded');
    });
    
    // Save modal
    const saveModal = document.getElementById('saveModal');
    document.getElementById('btnSave').addEventListener('click', async () => {
      if (components.length === 0) {
        showToast('No components', 'Add some components to your email first', 'error');
        return;
      }
      if (currentTemplateId) {
        try {
          await updateTemplate(currentTemplateId, { components });
          showToast('Template updated', 'Your changes have been saved');
        } catch {
          showToast('Error', 'Failed to update template', 'error');
        }
      } else {
        saveModal.classList.add('active');
      }
    });
    document.getElementById('closeSaveModal').addEventListener('click', () => {
      saveModal.classList.remove('active');
    });
    document.getElementById('cancelSave').addEventListener('click', () => {
      saveModal.classList.remove('active');
    });
    document.getElementById('confirmSave').addEventListener('click', async () => {
      const nameInput = document.getElementById('templateNameInput');
      const name = nameInput.value.trim();
      if (!name) {
        showToast('Name required', 'Please enter a name for your template', 'error');
        return;
      }
      try {
        const saved = await saveTemplate(name, components);
        currentTemplateId = saved.id;
        currentTemplateName = name;
        document.getElementById('templateNameDisplay').textContent = name;
        saveModal.classList.remove('active');
        nameInput.value = '';
        showToast('Template saved', 'Your template has been saved successfully');
      } catch {
        showToast('Error', 'Failed to save template', 'error');
      }
    });
    
    // Load modal
    const loadModal = document.getElementById('loadModal');
    document.getElementById('btnLoad').addEventListener('click', async () => {
      const templates = await fetchTemplates();
      const list = document.getElementById('templateList');
      if (templates.length === 0) {
        list.innerHTML = '<p class="empty-templates" data-testid="text-no-templates">No saved templates yet</p>';
      } else {
        list.innerHTML = templates.map(t => `
          <div class="template-item" data-id="${t.id}" data-testid="template-item-${t.id}">
            <div class="template-item-info">
              <span class="template-item-name" data-testid="text-template-name-${t.id}">${t.name}</span>
              <span class="template-item-count">${t.components.length} components</span>
            </div>
            <button class="btn btn-icon btn-danger delete-template" data-id="${t.id}" data-testid="button-delete-template-${t.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        `).join('');
        
        list.querySelectorAll('.template-item').forEach(item => {
          item.addEventListener('click', (e) => {
            if (e.target.closest('.delete-template')) return;
            const template = templates.find(t => t.id === item.dataset.id);
            if (template) {
              components = template.components;
              currentTemplateId = template.id;
              currentTemplateName = template.name;
              document.getElementById('templateNameDisplay').textContent = template.name;
              selectedId = null;
              history = [JSON.parse(JSON.stringify(components))];
              historyIndex = 0;
              renderCanvas();
              renderPropertyEditor();
              loadModal.classList.remove('active');
              showToast('Template loaded', `"${template.name}" has been loaded`);
            }
          });
          
          item.querySelector('.delete-template').addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = e.currentTarget.dataset.id;
            try {
              await deleteTemplate(id);
              item.remove();
              if (list.children.length === 0) {
                list.innerHTML = '<p class="empty-templates">No saved templates yet</p>';
              }
              showToast('Template deleted', 'The template has been removed');
            } catch {
              showToast('Error', 'Failed to delete template', 'error');
            }
          });
        });
      }
      loadModal.classList.add('active');
    });
    document.getElementById('closeLoadModal').addEventListener('click', () => {
      loadModal.classList.remove('active');
    });
    
    // Close modals on overlay click
    [exportModal, saveModal, loadModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  // Initialize toolbar buttons
  function initToolbar() {
    document.getElementById('btnNew').addEventListener('click', () => {
      components = [];
      selectedId = null;
      currentTemplateId = null;
      currentTemplateName = '';
      document.getElementById('templateNameDisplay').textContent = '';
      history = [[]];
      historyIndex = 0;
      renderCanvas();
      renderPropertyEditor();
    });
    
    document.getElementById('btnUndo').addEventListener('click', () => {
      if (historyIndex > 0) {
        historyIndex--;
        components = JSON.parse(JSON.stringify(history[historyIndex]));
        renderCanvas();
        renderPropertyEditor();
        updateUndoRedoButtons();
      }
    });
    
    document.getElementById('btnRedo').addEventListener('click', () => {
      if (historyIndex < history.length - 1) {
        historyIndex++;
        components = JSON.parse(JSON.stringify(history[historyIndex]));
        renderCanvas();
        renderPropertyEditor();
        updateUndoRedoButtons();
      }
    });
    
    document.getElementById('btnClear').addEventListener('click', () => {
      components = [];
      selectedId = null;
      pushHistory(components);
      renderCanvas();
      renderPropertyEditor();
      showToast('Canvas cleared', 'All components have been removed');
    });
    
    document.getElementById('btnCopy').addEventListener('click', () => {
      if (components.length === 0) {
        showToast('No components', 'Add some components to your email first', 'error');
        return;
      }
      navigator.clipboard.writeText(generateHtml());
      showToast('Copied!', 'HTML code copied to clipboard');
    });
    
    document.getElementById('btnDarkMode').addEventListener('click', () => {
      darkMode = !darkMode;
      document.getElementById('iconMoon').style.display = darkMode ? 'none' : 'block';
      document.getElementById('iconSun').style.display = darkMode ? 'block' : 'none';
      renderCanvas();
    });
  }

  // Initialize
  function init() {
    renderCanvas();
    renderPropertyEditor();
    initDragDrop();
    initModals();
    initToolbar();
    updateUndoRedoButtons();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
