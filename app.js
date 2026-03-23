const STORAGE_KEY = 'cvcomposer-static-resume';

const templateLabels = {
  minimal: 'Minimal ATS',
  executive: 'Executive',
  sidebar: 'Sidebar moderne',
};

const defaultResume = {
  basics: {
    fullName: 'Alex Martin',
    title: 'Product Designer & Front-end Engineer',
    email: 'alex.martin@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Lyon, France',
    linkedIn: 'https://www.linkedin.com/in/alexmartin',
    website: 'https://alexmartin.dev',
    summary:
      'Profil hybride design + développement avec une forte sensibilité ATS : impact mesurable, mots-clés métier et structure claire pour les recruteurs comme pour les robots de tri.',
  },
  skills: ['React', 'TypeScript', 'Design System', 'ATS Optimization', 'Figma', 'Node.js', 'SEO', 'UX Research'],
  experience: [
    {
      id: uid(),
      title: 'Senior Product Designer',
      subtitle: 'Studio Horizon',
      location: 'Paris',
      startDate: '2022',
      endDate: 'Aujourd’hui',
      description: 'Conception de parcours candidats et d’interfaces SaaS avec priorisation produit, recherche utilisateur et mise en production front-end.',
      highlights: [
        'Refonte complète de l’expérience onboarding, +22% de conversion',
        'Mise en place d’un design system partagé entre produit et marketing',
      ],
    },
  ],
  education: [
    {
      id: uid(),
      title: 'Master UX Design',
      subtitle: 'Université Lumière Lyon 2',
      location: 'Lyon',
      startDate: '2017',
      endDate: '2019',
      description: 'Spécialisation en architecture de l’information, psychologie cognitive et prototypage.',
      highlights: [],
    },
  ],
  projects: [
    {
      id: uid(),
      title: 'ATS Resume Toolkit',
      subtitle: 'Projet personnel',
      location: '',
      startDate: '2024',
      endDate: '2025',
      description: 'Bibliothèque de templates CV, scoring ATS et automatisation de lettres de motivation.',
      highlights: ['3 templates imprimables', 'Export PDF orienté impression A4'],
    },
  ],
  certifications: [
    {
      id: uid(),
      title: 'Google UX Design Certificate',
      subtitle: 'Coursera',
      location: '',
      startDate: '',
      endDate: '2023',
      description: '',
      highlights: [],
    },
  ],
  customSections: [
    {
      id: uid(),
      name: 'Langues',
      items: [
        { id: uid(), title: 'Français', subtitle: 'Natif', description: '', highlights: [] },
        { id: uid(), title: 'Anglais', subtitle: 'Courant (C1)', description: '', highlights: [] },
      ],
    },
  ],
  template: 'minimal',
  accentColor: '#2563eb',
};

let resume = loadResume();

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function loadResume() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : structuredClone(defaultResume);
  } catch (error) {
    return structuredClone(defaultResume);
  }
}

function persistResume() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
}

function itemTemplate() {
  return { id: uid(), title: '', subtitle: '', location: '', startDate: '', endDate: '', description: '', highlights: [] };
}

function computeAtsScore(data) {
  let score = 40;
  const tips = [];

  if (data.basics.summary && data.basics.summary.length > 120) score += 15;
  else tips.push('Ajoute un résumé professionnel de 2 à 4 lignes riche en mots-clés métier.');

  if (data.skills.length >= 6) score += 10;
  else tips.push('Ajoute au moins 6 compétences ciblées pour améliorer le matching ATS.');

  if (data.experience.some((item) => (item.highlights || []).length >= 2)) score += 15;
  else tips.push('Décris tes expériences avec au moins 2 résultats mesurables par poste.');

  if (data.basics.linkedIn) score += 10;
  else tips.push('Ajoute ton URL LinkedIn publique pour renforcer la cohérence du profil.');

  if (data.projects.length || data.certifications.length) score += 10;
  else tips.push('Ajoute un projet ou une certification pour enrichir le CV.');

  return { score: Math.min(score, 100), tips };
}

function renderBasicsForm() {
  const basicsForm = document.getElementById('basics-form');
  basicsForm.innerHTML = '';

  Object.entries(resume.basics).forEach(([key, value]) => {
    const label = document.createElement('label');
    if (key === 'summary') label.classList.add('full-span');

    const span = document.createElement('span');
    span.textContent = key;
    label.appendChild(span);

    const field = key === 'summary' ? document.createElement('textarea') : document.createElement('input');
    if (key === 'summary') field.rows = 4;
    field.value = value;
    field.addEventListener('input', (event) => {
      resume.basics[key] = event.target.value;
      onResumeChange();
    });

    label.appendChild(field);
    basicsForm.appendChild(label);
  });
}

function renderSectionEditors(sectionKey, targetId, allowTitle = true) {
  const container = document.getElementById(targetId);
  container.innerHTML = '';

  resume[sectionKey].forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-editor';

    ['title', 'subtitle', 'location', 'startDate', 'endDate', 'description', 'highlights'].forEach((field) => {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = field;
      label.appendChild(span);

      const input = field === 'description' || field === 'highlights' ? document.createElement('textarea') : document.createElement('input');
      if (field === 'highlights') input.value = (item.highlights || []).join('\n');
      else input.value = item[field] || '';
      input.addEventListener('input', (event) => {
        item[field] = field === 'highlights'
          ? event.target.value.split('\n').map((entry) => entry.trim()).filter(Boolean)
          : event.target.value;
        onResumeChange(false);
      });
      label.appendChild(input);
      wrapper.appendChild(label);
    });

    if (allowTitle) {
      const remove = document.createElement('button');
      remove.className = 'secondary-button';
      remove.textContent = 'Supprimer';
      remove.addEventListener('click', () => {
        resume[sectionKey] = resume[sectionKey].filter((entry) => entry.id !== item.id);
        onResumeChange();
      });
      wrapper.appendChild(remove);
    }

    container.appendChild(wrapper);
  });
}

function renderCustomSections() {
  const root = document.getElementById('custom-sections');
  root.innerHTML = '';

  resume.customSections.forEach((section) => {
    const card = document.createElement('div');
    card.className = 'custom-section-editor';

    const titleLabel = document.createElement('label');
    titleLabel.innerHTML = '<span>Nom de section</span>';
    const titleInput = document.createElement('input');
    titleInput.value = section.name;
    titleInput.addEventListener('input', (event) => {
      section.name = event.target.value;
      onResumeChange(false);
    });
    titleLabel.appendChild(titleInput);
    card.appendChild(titleLabel);

    section.items.forEach((item) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'item-editor';
      ['title', 'subtitle', 'description', 'highlights'].forEach((field) => {
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.textContent = field;
        label.appendChild(span);
        const input = field === 'description' || field === 'highlights' ? document.createElement('textarea') : document.createElement('input');
        input.value = field === 'highlights' ? (item.highlights || []).join('\n') : item[field] || '';
        input.addEventListener('input', (event) => {
          item[field] = field === 'highlights'
            ? event.target.value.split('\n').map((entry) => entry.trim()).filter(Boolean)
            : event.target.value;
          onResumeChange(false);
        });
        label.appendChild(input);
        wrapper.appendChild(label);
      });
      card.appendChild(wrapper);
    });

    const actions = document.createElement('div');
    actions.className = 'action-row compact-actions';

    const addItem = document.createElement('button');
    addItem.className = 'secondary-button';
    addItem.textContent = '+ Ajouter un item';
    addItem.addEventListener('click', () => {
      section.items.push(itemTemplate());
      onResumeChange();
    });

    const removeSection = document.createElement('button');
    removeSection.className = 'secondary-button';
    removeSection.textContent = 'Supprimer la section';
    removeSection.addEventListener('click', () => {
      resume.customSections = resume.customSections.filter((entry) => entry.id !== section.id);
      onResumeChange();
    });

    actions.append(addItem, removeSection);
    card.appendChild(actions);
    root.appendChild(card);
  });
}

function renderPreviewItems(items) {
  return items
    .map((item) => `
      <article class="resume-item">
        <div class="resume-item__header">
          <div>
            <h4>${escapeHtml(item.title || '')}</h4>
            ${item.subtitle ? `<p class="resume-item__subtitle">${escapeHtml(item.subtitle)}</p>` : ''}
          </div>
          <div class="resume-item__meta">
            ${item.location ? `<span>${escapeHtml(item.location)}</span>` : ''}
            ${(item.startDate || item.endDate) ? `<span>${escapeHtml(item.startDate || '')} ${(item.startDate || item.endDate) ? '—' : ''} ${escapeHtml(item.endDate || '')}</span>` : ''}
          </div>
        </div>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
        ${(item.highlights || []).length ? `<ul>${item.highlights.map((highlight) => `<li>${escapeHtml(highlight)}</li>`).join('')}</ul>` : ''}
      </article>
    `)
    .join('');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderPreview() {
  document.getElementById('resume-preview').className = `resume-sheet template-${resume.template}`;
  document.getElementById('resume-preview').style.setProperty('--accent', resume.accentColor);
  document.getElementById('preview-name').textContent = resume.basics.fullName;
  document.getElementById('preview-title').textContent = resume.basics.title;
  document.getElementById('preview-summary').textContent = resume.basics.summary;

  document.getElementById('preview-contact').innerHTML = [resume.basics.email, resume.basics.phone, resume.basics.location, resume.basics.website, resume.basics.linkedIn]
    .filter(Boolean)
    .map((entry) => `<span class="contact-pill">${escapeHtml(entry)}</span>`)
    .join('');

  document.getElementById('preview-skills').innerHTML = resume.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('');
  document.getElementById('preview-experience').innerHTML = renderPreviewItems(resume.experience);
  document.getElementById('preview-education').innerHTML = renderPreviewItems(resume.education);
  document.getElementById('preview-projects').innerHTML = renderPreviewItems(resume.projects);
  document.getElementById('preview-certifications').innerHTML = renderPreviewItems(resume.certifications);

  document.getElementById('preview-custom-sections').innerHTML = resume.customSections
    .map((section) => `
      <section class="resume-section">
        <h3>${escapeHtml(section.name)}</h3>
        ${renderPreviewItems(section.items)}
      </section>
    `)
    .join('');

  const ats = computeAtsScore(resume);
  document.getElementById('ats-score').textContent = `${ats.score}/100`;
  document.getElementById('ats-tips').innerHTML = ats.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('');
}

function onResumeChange(shouldPersist = true) {
  renderBasicsForm();
  renderSectionEditors('experience', 'experience-list');
  renderSectionEditors('education', 'education-list');
  renderSectionEditors('projects', 'projects-list');
  renderSectionEditors('certifications', 'certifications-list');
  renderCustomSections();
  renderPreview();
  syncStaticControls();
  if (shouldPersist) persistResume();
}

function syncStaticControls() {
  document.getElementById('template-select').value = resume.template;
  document.getElementById('accent-color').value = resume.accentColor;
  document.getElementById('skills-input').value = resume.skills.join('\n');
}

function mergeResume(partial) {
  resume = {
    ...resume,
    ...partial,
    basics: { ...resume.basics, ...(partial.basics || {}) },
    skills: partial.skills && partial.skills.length ? partial.skills : resume.skills,
    experience: partial.experience && partial.experience.length ? partial.experience : resume.experience,
    education: partial.education && partial.education.length ? partial.education : resume.education,
    projects: partial.projects && partial.projects.length ? partial.projects : resume.projects,
    certifications: partial.certifications && partial.certifications.length ? partial.certifications : resume.certifications,
  };
  onResumeChange();
}

function asArray(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
}

function normalizeBullets(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/\n|•|-/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function mapItem(entry) {
  return {
    id: uid(),
    title: String(entry.title || entry.role || entry.name || entry.schoolName || entry.companyName || 'Élément'),
    subtitle: String(entry.subtitle || entry.company || entry.organization || entry.degreeName || entry.fieldOfStudy || ''),
    location: String(entry.location || entry.geoLocationName || ''),
    startDate: String(entry.startDate || entry.startedOn || ''),
    endDate: String(entry.endDate || entry.finishedOn || ''),
    description: String(entry.description || entry.summary || entry.about || ''),
    highlights: normalizeBullets(entry.highlights || entry.achievements || entry.points || entry.skills),
  };
}


function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function parseCsvLine(line) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}

function parseCsv(text) {
  const lines = text.replace(/^\ufeff/, '').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]).map((header, index) => ({
    raw: header,
    key: normalizeKey(header) || `column${index}`,
  }));

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((entry, header, index) => {
      entry[header.key] = values[index] || '';
      return entry;
    }, {});
  }).filter((entry) => Object.values(entry).some(Boolean));
}

function getField(entry, candidates) {
  const keys = Object.keys(entry || {});
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeKey(candidate);
    const exact = keys.find((key) => key === normalizedCandidate);
    if (exact && entry[exact]) return String(entry[exact]).trim();

    const partial = keys.find((key) => key.includes(normalizedCandidate) || normalizedCandidate.includes(key));
    if (partial && entry[partial]) return String(entry[partial]).trim();
  }

  return '';
}

function inferCsvSection(filename, rows) {
  const normalizedName = normalizeKey(filename);
  const sample = rows[0] || {};
  const keys = Object.keys(sample);

  if (/(skill|competenc)/.test(normalizedName)) return 'skills';
  if (/(position|experience|emploi|job)/.test(normalizedName)) return 'experience';
  if (/(education|formation|school|stud)/.test(normalizedName)) return 'education';
  if (/(project|projet)/.test(normalizedName)) return 'projects';
  if (/(cert|license|licen)/.test(normalizedName)) return 'certifications';
  if (/(profile|profil|basic|contact|personal|person)/.test(normalizedName)) return 'basics';

  if (keys.some((key) => /headline|firstname|lastname|publicprofile|email/.test(key))) return 'basics';
  if (keys.some((key) => /skill/.test(key))) return 'skills';
  if (keys.some((key) => /company|position|employment|startedon|endedon/.test(key))) return 'experience';
  if (keys.some((key) => /school|degree|fieldofstudy/.test(key))) return 'education';
  if (keys.some((key) => /cert|license/.test(key))) return 'certifications';
  if (keys.some((key) => /project/.test(key))) return 'projects';

  return '';
}

function mapCsvItem(entry, section) {
  if (section === 'education') {
    return {
      id: uid(),
      title: getField(entry, ['schoolName', 'school', 'institution', 'title']) || 'Formation',
      subtitle: getField(entry, ['degreeName', 'degree', 'fieldOfStudy', 'subtitle']),
      location: getField(entry, ['location', 'geoLocationName']),
      startDate: getField(entry, ['startDate', 'startedOn', 'from']),
      endDate: getField(entry, ['endDate', 'finishedOn', 'to']),
      description: getField(entry, ['notes', 'description', 'activities']),
      highlights: normalizeBullets(getField(entry, ['activities', 'description'])),
    };
  }

  if (section === 'projects') {
    return {
      id: uid(),
      title: getField(entry, ['name', 'title', 'projectName']) || 'Projet',
      subtitle: getField(entry, ['occupation', 'role', 'organization', 'subtitle']),
      location: getField(entry, ['location']),
      startDate: getField(entry, ['startDate', 'startedOn', 'from']),
      endDate: getField(entry, ['endDate', 'finishedOn', 'to']),
      description: getField(entry, ['description', 'summary']),
      highlights: normalizeBullets(getField(entry, ['skills', 'highlights', 'description'])),
    };
  }

  if (section === 'certifications') {
    return {
      id: uid(),
      title: getField(entry, ['name', 'title', 'certificationName']) || 'Certification',
      subtitle: getField(entry, ['authority', 'issuer', 'organization']),
      location: '',
      startDate: getField(entry, ['startDate', 'issueDate']),
      endDate: getField(entry, ['endDate', 'expirationDate']),
      description: getField(entry, ['credentialUrl', 'licenseNumber', 'description']),
      highlights: normalizeBullets(getField(entry, ['skills'])),
    };
  }

  return {
    id: uid(),
    title: getField(entry, ['title', 'position', 'role', 'employmentTitle']) || 'Expérience',
    subtitle: getField(entry, ['companyName', 'company', 'organization', 'subtitle']),
    location: getField(entry, ['location', 'geoLocationName']),
    startDate: getField(entry, ['startDate', 'startedOn', 'from']),
    endDate: getField(entry, ['endDate', 'finishedOn', 'to']),
    description: getField(entry, ['description', 'summary']),
    highlights: normalizeBullets(getField(entry, ['highlights', 'achievements', 'description', 'skills'])),
  };
}

function parseLinkedInCsvBundle(files) {
  const partial = {
    basics: {},
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  files.forEach(({ name, rows }) => {
    if (!rows.length) return;
    const section = inferCsvSection(name, rows);
    if (!section) return;

    if (section === 'basics') {
      const profile = rows[0];
      const firstName = getField(profile, ['firstName', 'prenom']);
      const lastName = getField(profile, ['lastName', 'nom']);
      partial.basics = {
        fullName: [firstName, lastName].filter(Boolean).join(' ') || getField(profile, ['fullName', 'name']),
        title: getField(profile, ['headline', 'title', 'jobTitle']),
        email: getField(profile, ['email', 'emailAddress']),
        phone: getField(profile, ['phone', 'phoneNumber', 'mobile']),
        location: getField(profile, ['location', 'locationName']),
        linkedIn: getField(profile, ['publicProfileUrl', 'linkedin', 'profileUrl']),
        website: getField(profile, ['website', 'personalWebsite']),
        summary: getField(profile, ['summary', 'about', 'description']),
      };
      return;
    }

    if (section === 'skills') {
      partial.skills = rows
        .map((entry) => getField(entry, ['name', 'skill', 'skills']))
        .flatMap((value) => value.split(/[,;\n]/))
        .map((value) => value.trim())
        .filter(Boolean);
      return;
    }

    partial[section] = rows.map((entry) => mapCsvItem(entry, section)).filter((entry) => {
      return entry.title || entry.subtitle || entry.description;
    });
  });

  return partial;
}

async function parseLinkedInFiles(fileList) {
  const files = Array.from(fileList || []);
  const jsonFile = files.find((file) => file.name.toLowerCase().endsWith('.json'));

  if (jsonFile) {
    const raw = await jsonFile.text();
    return {
      partial: parseLinkedInJson(JSON.parse(raw)),
      mode: 'json',
      source: jsonFile.name,
    };
  }

  const csvFiles = await Promise.all(files
    .filter((file) => file.name.toLowerCase().endsWith('.csv'))
    .map(async (file) => ({
      name: file.name,
      rows: parseCsv(await file.text()),
    })));

  if (csvFiles.length) {
    return {
      partial: parseLinkedInCsvBundle(csvFiles),
      mode: 'csv',
      source: csvFiles.map((file) => file.name).join(', '),
    };
  }

  throw new Error('unsupported-file-type');
}

function parseLinkedInJson(payload) {
  const profile = payload.profile || payload;
  const firstName = String(profile.firstName || '').trim();
  const lastName = String(profile.lastName || '').trim();
  const skills = Array.isArray(payload.skills || profile.skills)
    ? (payload.skills || profile.skills).map((entry) => String(typeof entry === 'string' ? entry : entry.name || '')).filter(Boolean)
    : [];

  return {
    basics: {
      fullName: [firstName, lastName].filter(Boolean).join(' ') || String(profile.fullName || profile.name || ''),
      title: String(profile.headline || profile.title || ''),
      email: String(profile.emailAddress || profile.email || ''),
      phone: String(profile.phoneNumbers || profile.phone || ''),
      location: String(profile.locationName || profile.location || ''),
      linkedIn: String(profile.publicProfileUrl || profile.linkedIn || ''),
      website: String(profile.website || ''),
      summary: String(profile.summary || profile.about || ''),
    },
    experience: asArray(payload.positions || profile.positions || payload.experience).map(mapItem),
    education: asArray(payload.educations || profile.educations || payload.education).map(mapItem),
    projects: asArray(payload.projects || profile.projects).map(mapItem),
    certifications: asArray(payload.certifications || profile.certifications || payload.licenses).map(mapItem),
    skills,
  };
}

function parseLinkedInPaste(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const [fullName = '', title = '', location = ''] = lines;
  const summary = lines.slice(3, 8).join(' ');
  const skillLine = lines.find((line) => /skills|compétences/i.test(line));

  return {
    basics: { fullName, title, location, summary },
    skills: skillLine
      ? skillLine.replace(/skills|compétences/gi, '').split(',').map((item) => item.trim()).filter(Boolean)
      : [],
  };
}

function bindEvents() {
  document.querySelectorAll('[data-add-section]').forEach((button) => {
    button.addEventListener('click', () => {
      const section = button.dataset.addSection;
      resume[section].push(itemTemplate());
      onResumeChange();
    });
  });

  document.getElementById('add-custom-section').addEventListener('click', () => {
    resume.customSections.push({ id: uid(), name: 'Nouvelle section', items: [itemTemplate()] });
    onResumeChange();
  });

  document.getElementById('template-select').addEventListener('change', (event) => {
    resume.template = event.target.value;
    onResumeChange();
  });

  document.getElementById('accent-color').addEventListener('input', (event) => {
    resume.accentColor = event.target.value;
    onResumeChange();
  });

  document.getElementById('skills-input').addEventListener('input', (event) => {
    resume.skills = event.target.value.split('\n').map((item) => item.trim()).filter(Boolean);
    onResumeChange(false);
  });

  document.getElementById('save-btn').addEventListener('click', () => {
    persistResume();
    document.getElementById('import-status').textContent = 'CV sauvegardé en local.';
  });

  document.getElementById('export-pdf-btn').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('linkedin-paste-btn').addEventListener('click', () => {
    const text = document.getElementById('linkedin-paste').value.trim();
    if (!text) return;
    mergeResume(parseLinkedInPaste(text));
    document.getElementById('import-status').textContent = 'Extrait LinkedIn importé avec succès.';
  });

  document.getElementById('linkedin-file').addEventListener('change', async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      const { partial, mode, source } = await parseLinkedInFiles(files);
      mergeResume(partial);
      document.getElementById('import-status').textContent = mode === 'csv'
        ? `Import LinkedIn CSV réussi depuis ${source}.`
        : `Import JSON LinkedIn réussi depuis ${source}.`;
    } catch (error) {
      document.getElementById('import-status').textContent = 'Impossible de lire ces fichiers LinkedIn. Utilise un JSON valide, ou des CSV extraits de l’archive LinkedIn.';
    } finally {
      event.target.value = '';
    }
  });
}

bindEvents();
onResumeChange();
