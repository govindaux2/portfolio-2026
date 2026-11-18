/* Shared rules drawer + lightbox for image-styles */
(function () {
  var EMPTY_IMG =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  var LINK_ICO =
    '<svg class="link-ico" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 14a4 4 0 0 1 0-5.7l1.4-1.4a4 4 0 1 1 5.7 5.7L16 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 10a4 4 0 0 1 0 5.7l-1.4 1.4a4 4 0 1 1-5.7-5.7L8 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function block(title, text) {
    return '<h3>' + title + '</h3><pre>' + (text || '') + '</pre>';
  }

  function renderPrompts(data, candidateKey, cutoutKey) {
    var html = '';
    var only = candidateKey ? String(candidateKey).toUpperCase() : '';
    var room = cutoutKey ? String(cutoutKey).toLowerCase() : '';
    if (data.hardRules && data.hardRules.length) {
      html += block('Hard rules', data.hardRules.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'));
    }
    if (data.lessonsLearned && data.lessonsLearned.length && !only && !room) {
      html += block('Lessons learned', data.lessonsLearned.map(function (L, i) {
        return (i + 1) + '. ERROR: ' + L.error + '\n   CAUSE: ' + L.cause + '\n   FIX: ' + L.fix;
      }).join('\n\n'));
    }
    if (data.phase2 && (room || data._showPhase2)) {
      if (data.phase2.method) html += block('Phase 2 · method', data.phase2.method + (data.phase2.forbidden ? '\n' + data.phase2.forbidden : ''));
      html += block('Phase 2 · cutout positive', data.phase2.positive);
      html += block('Phase 2 · cutout negative', data.phase2.negative);
    }
    if (data.phase3 && !room && !only) {
      html += block('Phase 3 · method', data.phase3.method || '');
      html += block('Phase 3 · positive', data.phase3.positive || '');
      html += block('Phase 3 · negative', data.phase3.negative || '');
    }
    if (!only && !room && data.shared) {
      html += block('Shared · positive', data.shared.positive);
      html += block('Shared · negative', data.shared.negative);
    }
    if (!only && !room && data.type) {
      html += block('Type · positive', data.type.positive);
      html += block('Type · negative', data.type.negative);
    }
    if (!only && !room && data.efficiency) {
      html += block('Efficiency', data.efficiency.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'));
    }
    if (!only && !room && data.pipeline) {
      html += block('Pipeline', data.pipeline.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n'));
    }
    if (data.candidates) {
      Object.keys(data.candidates).filter(function (k) {
        if (only) return k.toUpperCase() === only;
        if (room) return data.candidates[k].status === 'active';
        return data.candidates[k].status === 'active';
      }).forEach(function (k) {
        var c = data.candidates[k];
        if (room && c.cutouts && c.cutouts[room]) {
          var piece = c.cutouts[room];
          html += block(
            'Candidate ' + k + ' · cutout ' + room,
            'NOTE: ' + (c.note || '') + '\n\nPOSITIVE:\n' + (piece.positive || '') + '\n\nNEGATIVE:\n' + (piece.negative || '')
          );
        } else if (!room) {
          html += block(
            'Candidate ' + k + ' · ' + (c.title || ''),
            'NOTE: ' + (c.note || '') + '\n\nPOSITIVE:\n' + (c.positive || '') + '\n\nNEGATIVE:\n' + (c.negative || '')
          );
        }
      });
      if ((only || room) && data.shared) {
        html += block('Shared · positive (also applied)', data.shared.positive);
        html += block('Shared · negative (also applied)', data.shared.negative);
      }
      if ((only || room) && data.type) {
        html += block('Type · positive (also applied)', data.type.positive);
        html += block('Type · negative (also applied)', data.type.negative);
      }
    }
    if (data.phaseNote) html += block('Phase note', data.phaseNote);
    return html || '<p style="color:#96968f">No prompts in this file.</p>';
  }

  function ensureDrawer() {
    var drawer = document.querySelector('[data-rules-drawer]');
    var scrim = document.querySelector('[data-rules-scrim]');
    if (drawer && scrim) {
      return { drawer: drawer, scrim: scrim, body: drawer.querySelector('[data-rules-body]') };
    }
    scrim = document.createElement('div');
    scrim.className = 'rules-scrim';
    scrim.setAttribute('data-rules-scrim', '');
    scrim.hidden = true;
    drawer = document.createElement('aside');
    drawer.className = 'rules-drawer';
    drawer.setAttribute('data-rules-drawer', '');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML =
      '<button type="button" class="close" data-close-rules>Close</button>' +
      '<h2 data-rules-title>Rules &amp; prompts</h2>' +
      '<div data-rules-body>Loading…</div>';
    document.body.appendChild(scrim);
    document.body.appendChild(drawer);
    return { drawer: drawer, scrim: scrim, body: drawer.querySelector('[data-rules-body]') };
  }

  function openDrawer(html, title) {
    var parts = ensureDrawer();
    var titleEl = parts.drawer.querySelector('[data-rules-title]');
    if (titleEl && title) titleEl.textContent = title;
    parts.body.innerHTML = html;
    parts.scrim.hidden = false;
    parts.scrim.classList.add('open');
    parts.drawer.classList.add('open');
    parts.drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    var parts = ensureDrawer();
    parts.scrim.classList.remove('open');
    parts.drawer.classList.remove('open');
    parts.drawer.setAttribute('aria-hidden', 'true');
    setTimeout(function () { parts.scrim.hidden = true; }, 200);
  }

  function loadRules(url, title, phaseNote, candidateKey, cutoutKey) {
    openDrawer('Loading…', title || 'Rules & prompts');
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (phaseNote) data.phaseNote = phaseNote;
        openDrawer(renderPrompts(data, candidateKey, cutoutKey), title || 'Rules & prompts');
      })
      .catch(function () {
        openDrawer('<p style="color:#96968f">Could not load prompts.</p>', title || 'Rules & prompts');
      });
  }

  function ensureLightbox() {
    var box = document.querySelector('[data-lightbox]');
    if (box) return box;
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('data-lightbox', '');
    box.innerHTML =
      '<div class="lightbox-panel" role="dialog" aria-modal="true">' +
      '<button type="button" class="lightbox-close" data-lightbox-close aria-label="Close" title="Close" data-tip="Close">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<img data-lightbox-img src="' + EMPTY_IMG + '" alt="" width="1" height="1" />' +
      '<div class="lightbox-cap">' +
      '<div><strong data-lightbox-title></strong><span data-lightbox-note></span></div>' +
      '<button type="button" class="rules-ico" data-lightbox-rules hidden aria-label="Rules and prompts" title="Rules & prompts">' +
      '<svg viewBox="0 0 24 24" fill="none"><path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7"/><path d="M9 9h6M9 13h6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      '</button>' +
      '</div></div>';
    document.body.appendChild(box);
    return box;
  }

  function openLightbox(opts) {
    var box = ensureLightbox();
    var img = box.querySelector('[data-lightbox-img]');
    img.src = opts.src || EMPTY_IMG;
    img.alt = opts.title || '';
    img.removeAttribute('width');
    img.removeAttribute('height');
    box.querySelector('[data-lightbox-title]').textContent = opts.title || '';
    box.querySelector('[data-lightbox-note]').textContent = opts.note || '';
    var rulesBtn = box.querySelector('[data-lightbox-rules]');
    if (opts.rulesSrc) {
      rulesBtn.hidden = false;
      rulesBtn.setAttribute('data-open-rules', '');
      rulesBtn.setAttribute('data-rules-src', opts.rulesSrc);
      rulesBtn.setAttribute('data-rules-title', opts.rulesTitle || 'Rules & prompts');
      if (opts.phaseNote) rulesBtn.setAttribute('data-phase-note', opts.phaseNote);
      if (opts.candidate) rulesBtn.setAttribute('data-candidate', opts.candidate);
      else rulesBtn.removeAttribute('data-candidate');
      if (opts.cutout) rulesBtn.setAttribute('data-cutout', opts.cutout);
      else rulesBtn.removeAttribute('data-cutout');
    } else {
      rulesBtn.hidden = true;
      rulesBtn.removeAttribute('data-open-rules');
    }
    box.classList.add('open');
  }

  function closeLightbox() {
    var box = document.querySelector('[data-lightbox]');
    if (box) box.classList.remove('open');
  }

  document.querySelectorAll('.crumbs a').forEach(function (a) {
    if (!a.querySelector('.link-ico')) a.insertAdjacentHTML('beforeend', LINK_ICO);
  });
  document.querySelectorAll('a.text-link').forEach(function (a) {
    if (!a.querySelector('.link-ico')) a.insertAdjacentHTML('beforeend', LINK_ICO);
  });

  document.addEventListener('click', function (e) {
    var rules = e.target.closest('[data-open-rules]');
    if (rules) {
      e.preventDefault();
      e.stopPropagation();
      loadRules(
        rules.getAttribute('data-rules-src') || 'rules/prompts.json',
        rules.getAttribute('data-rules-title') || 'Rules & prompts',
        rules.getAttribute('data-phase-note') || '',
        rules.getAttribute('data-candidate') || '',
        rules.getAttribute('data-cutout') || ''
      );
      return;
    }

    var thumb = e.target.closest('[data-lightbox-open]');
    if (thumb) {
      e.preventDefault();
      var imgEl = thumb.querySelector('img');
      openLightbox({
        src: thumb.getAttribute('data-full') || (imgEl && imgEl.src) || EMPTY_IMG,
        title: thumb.getAttribute('data-title') || '',
        note: thumb.getAttribute('data-note') || '',
        rulesSrc: thumb.getAttribute('data-rules-src') || '',
        rulesTitle: thumb.getAttribute('data-rules-title') || '',
        phaseNote: thumb.getAttribute('data-phase-note') || '',
        candidate: thumb.getAttribute('data-candidate') || '',
        cutout: thumb.getAttribute('data-cutout') || ''
      });
      return;
    }

    if (e.target.closest('[data-lightbox-close]') || e.target.matches('[data-lightbox]')) {
      closeLightbox();
      return;
    }
    if (e.target.closest('[data-close-rules]') || e.target.matches('[data-rules-scrim]')) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeLightbox();
      closeDrawer();
    }
  });

  /** Every icon control: keep aria-label, title, and data-tip in sync. */
  function tipFor(el) {
    return (
      el.getAttribute('data-tip') ||
      el.getAttribute('title') ||
      el.getAttribute('aria-label') ||
      ''
    ).trim();
  }
  function setTip(el, text) {
    if (!text) return;
    el.setAttribute('aria-label', text);
    el.setAttribute('title', text);
    el.setAttribute('data-tip', text);
  }
  function hydrateTips(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll(
      'a.nav-ico, button.nav-ico, .rules-ico, .lightbox-close, .place-toolbar button, [data-tip], [aria-label].nav-ico'
    );
    Array.prototype.forEach.call(nodes, function (el) {
      var t = tipFor(el);
      if (t) setTip(el, t);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hydrateTips(); });
  } else {
    hydrateTips();
  }

  window.ImageStylesChrome = {
    loadRules: loadRules,
    openLightbox: openLightbox,
    closeLightbox: closeLightbox,
    LINK_ICO: LINK_ICO,
    setTip: setTip,
    hydrateTips: hydrateTips
  };
})();
