// OpenSTEM Research - Client Controller

let currentTab = 'papers';
let currentTimeFilter = 'all';
let currentFieldFilter = 'all';
let searchDebounceTimeout = null;
let currentPortfolioId = 1;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Check saved theme
    const savedTheme = localStorage.getItem('openstem_theme');
    if (savedTheme === 'dark') {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        document.getElementById('themeIcon').textContent = '☀️';
    }

    // Set today's date in new paper modal
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('newPaperDate');
    if (dateInput) dateInput.value = today;

    // Load initial data
    loadPapers();
    loadPortfolio(currentPortfolioId);
    loadCollaborators();
    loadTeams();
});

// ----------------- TAB SWITCHING -----------------
function switchTab(tabId) {
    currentTab = tabId;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update tab sections
    document.querySelectorAll('.tab-view').forEach(view => {
        view.classList.remove('active');
    });

    const targetView = document.getElementById(`tab-${tabId}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------- THEME TOGGLE -----------------
function toggleTheme() {
    const isDark = document.body.classList.contains('theme-dark');
    if (isDark) {
        document.body.classList.remove('theme-dark');
        document.body.classList.add('theme-light');
        document.getElementById('themeIcon').textContent = '🌙';
        localStorage.setItem('openstem_theme', 'light');
    } else {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
        document.getElementById('themeIcon').textContent = '☀️';
        localStorage.setItem('openstem_theme', 'dark');
    }
}

// ----------------- RESEARCH PAPERS FEED -----------------
function setTimeFilter(time, btn) {
    currentTimeFilter = time;
    document.querySelectorAll('.time-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadPapers();
}

function setFieldFilter(field, btn) {
    currentFieldFilter = field;
    document.querySelectorAll('.field-pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    loadPapers();
}

function handleSearch() {
    clearTimeout(searchDebounceTimeout);
    const query = document.getElementById('paperSearchInput').value.trim();
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) {
        clearBtn.style.display = query ? 'block' : 'none';
    }

    searchDebounceTimeout = setTimeout(() => {
        loadPapers();
    }, 250);
}

function clearSearch() {
    const input = document.getElementById('paperSearchInput');
    input.value = '';
    document.getElementById('clearSearchBtn').style.display = 'none';
    loadPapers();
}

async function loadPapers() {
    const container = document.getElementById('papersContainer');
    const statusText = document.getElementById('resultsCount');
    const query = document.getElementById('paperSearchInput').value.trim();

    container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚙️</div>
            <div>Retrieving peer-reviewed index...</div>
        </div>
    `;

    try {
        const url = `/api/papers?q=${encodeURIComponent(query)}&field=${encodeURIComponent(currentFieldFilter)}&time_range=${encodeURIComponent(currentTimeFilter)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.success || !data.papers.length) {
            container.innerHTML = `
                <div style="text-align:center; padding: 4rem 1rem; background: var(--bg-card); border-radius: 14px; border: 1px dashed var(--border-card);">
                    <div style="font-size: 2.2rem; margin-bottom: 0.8rem;">🔍</div>
                    <h3 style="font-family: var(--font-heading); margin-bottom: 0.4rem;">No matching STEM papers found</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your recency window or field filter, or publish a new paper to the repository.</p>
                </div>
            `;
            statusText.textContent = `0 publications found`;
            return;
        }

        statusText.textContent = `Showing ${data.count} peer-reviewed works`;

        container.innerHTML = data.papers.map(p => {
            const pubDate = new Date(p.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            // Check if published in last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const isRecent = new Date(p.publication_date) >= sixMonthsAgo;

            return `
                <article class="paper-card">
                    <div class="paper-card-header">
                        <h2 class="paper-title">${escapeHtml(p.title)}</h2>
                        <div class="paper-badges">
                            ${isRecent ? '<span class="badge-oa">⚡ Last 6 Mo</span>' : ''}
                            <span class="badge-field">${escapeHtml(p.field)}</span>
                            <span class="badge-citations">Citations: ${p.citations}</span>
                        </div>
                    </div>

                    <div class="paper-authors-line">
                        <strong>Authors:</strong> ${escapeHtml(p.authors)}
                    </div>

                    <div class="paper-affiliation">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11"/></svg>
                        <span>${escapeHtml(p.institution || 'Global Research Collaborative')}</span>
                    </div>

                    <p class="paper-abstract">
                        ${escapeHtml(p.abstract || 'No abstract preview provided for this index entry.')}
                    </p>

                    <div class="paper-footer">
                        <div class="paper-meta-left">
                            <span>📅 Published: ${pubDate}</span>
                            ${p.doi ? `<span>DOI: <a href="https://doi.org/${encodeURIComponent(p.doi)}" target="_blank" style="color:inherit;">${escapeHtml(p.doi)}</a></span>` : ''}
                        </div>
                        <div class="paper-actions-right">
                            ${p.pdf_url ? `
                                <a href="${escapeHtml(p.pdf_url)}" target="_blank" class="btn-paper-action btn-download">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                                    PDF / Preprint
                                </a>
                            ` : ''}
                            <button class="btn-paper-action" onclick="copyCitation('${escapeHtml(p.authors)} (${p.publication_date.split('-')[0]}). ${escapeHtml(p.title)}.')">
                                📑 Cite
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

    } catch (err) {
        console.error("Failed to load papers:", err);
        container.innerHTML = `<div style="text-align: center; color: red; padding: 2rem;">Error connecting to local paper repository.</div>`;
    }
}

// ----------------- PUBLISH NEW PAPER -----------------
function openPublishModal() {
    document.getElementById('publishModal').classList.add('active');
}

async function submitPaper() {
    const title = document.getElementById('newPaperTitle').value.trim();
    const authors = document.getElementById('newPaperAuthors').value.trim();
    const institution = document.getElementById('newPaperUniv').value.trim();
    const field = document.getElementById('newPaperField').value;
    const publication_date = document.getElementById('newPaperDate').value;
    const doi = document.getElementById('newPaperDoi').value.trim();
    const pdf_url = document.getElementById('newPaperPdf').value.trim();
    const abstract = document.getElementById('newPaperAbstract').value.trim();

    if (!title || !authors) {
        showToast("Please provide both Paper Title and Authors");
        return;
    }

    try {
        const response = await fetch('/api/papers/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title, authors, institution, field, publication_date, doi, pdf_url, abstract
            })
        });

        const res = await response.json();
        if (res.success) {
            closeModal('publishModal');
            showToast("Paper successfully published to OpenSTEM repository!");
            // Reset form
            document.getElementById('newPaperTitle').value = '';
            document.getElementById('newPaperAuthors').value = '';
            document.getElementById('newPaperAbstract').value = '';
            // Switch to papers view and reload
            switchTab('papers');
            loadPapers();
        } else {
            showToast(res.error || "Failed to publish paper");
        }
    } catch (e) {
        showToast("Network error submitting paper");
    }
}

// ----------------- RESEARCHER PORTFOLIO BUILDER -----------------
async function loadPortfolio(id = 1) {
    try {
        const response = await fetch(`/api/portfolio/${id}`);
        const data = await response.json();
        if (!data.success) return;

        const p = data.portfolio;
        currentPortfolioId = p.id;

        // Populate View
        document.getElementById('profileName').textContent = p.full_name;
        document.getElementById('profileRole').textContent = p.title_role;
        document.getElementById('profileUniv').textContent = p.university;
        document.getElementById('profileDept').textContent = p.department || 'Academic Faculty';
        document.getElementById('profileBio').textContent = p.bio || 'No bio provided.';
        document.getElementById('profileOrcid').textContent = p.orcid || 'N/A';
        document.getElementById('profileFieldBadge').textContent = p.field_of_study;
        document.getElementById('profilePaperCount').textContent = (p.papers || []).length;
        document.getElementById('profileCitations').textContent = Number(p.citations).toLocaleString();
        document.getElementById('profileHIndex').textContent = p.h_index || 1;

        // Initials Avatar
        const initials = p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        const avatarEl = document.getElementById('profileAvatar');
        avatarEl.textContent = initials;
        if (p.avatar_color) avatarEl.style.background = p.avatar_color;

        // Render Publications
        const list = document.getElementById('portfolioPapersList');
        if (!p.papers || p.papers.length === 0) {
            list.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No publications linked to this portfolio yet. Click "+ Add Paper" to add.</div>`;
        } else {
            list.innerHTML = p.papers.map(paper => `
                <div class="port-paper-item">
                    <div>
                        <div class="port-paper-title">${escapeHtml(paper.title)}</div>
                        <div class="port-paper-meta">
                            <span>🏛️ ${escapeHtml(paper.journal || 'STEM Proceeding')}</span> &bull; 
                            <span>📅 ${paper.year}</span> &bull; 
                            ${paper.doi ? `<span>DOI: ${escapeHtml(paper.doi)}</span> &bull; ` : ''}
                            <span>Citations: ${paper.citations}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }

    } catch (e) {
        console.error("Error loading portfolio:", e);
    }
}

function openEditPortfolioModal() {
    document.getElementById('editPortfolioModal').classList.add('active');
}

async function savePortfolioProfile() {
    const full_name = document.getElementById('editPortName').value.trim();
    const title_role = document.getElementById('editPortRole').value.trim();
    const university = document.getElementById('editPortUniv').value.trim();
    const department = document.getElementById('editPortDept').value.trim();
    const field_of_study = document.getElementById('editPortField').value.trim();
    const orcid = document.getElementById('editPortOrcid').value.trim();
    const bio = document.getElementById('editPortBio').value.trim();
    const email = document.getElementById('editPortEmail').value.trim();

    if (!full_name || !university) {
        showToast("Full Name and University are required.");
        return;
    }

    try {
        const response = await fetch('/api/portfolio/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: currentPortfolioId,
                full_name, title_role, university, department, field_of_study, orcid, bio, email
            })
        });

        const res = await response.json();
        if (res.success) {
            closeModal('editPortfolioModal');
            showToast("Researcher portfolio updated!");
            loadPortfolio(currentPortfolioId);
            loadCollaborators(); // Refresh community list
        } else {
            showToast(res.error || "Failed to save portfolio.");
        }
    } catch (e) {
        showToast("Network error saving portfolio.");
    }
}

function openAddPaperModal() {
    document.getElementById('addPaperModal').classList.add('active');
}

async function submitPortfolioPaper() {
    const title = document.getElementById('portPaperTitle').value.trim();
    const journal = document.getElementById('portPaperJournal').value.trim();
    const year = document.getElementById('portPaperYear').value;
    const citations = document.getElementById('portPaperCitations').value;
    const doi = document.getElementById('portPaperDoi').value.trim();

    if (!title) {
        showToast("Paper title is required.");
        return;
    }

    try {
        const response = await fetch(`/api/portfolio/${currentPortfolioId}/add-paper`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, journal, year, citations, doi })
        });

        const res = await response.json();
        if (res.success) {
            closeModal('addPaperModal');
            showToast("Publication added to your portfolio!");
            // Reset
            document.getElementById('portPaperTitle').value = '';
            loadPortfolio(currentPortfolioId);
        } else {
            showToast(res.error || "Could not add paper");
        }
    } catch (e) {
        showToast("Error adding publication");
    }
}

// ----------------- AI IDEA STUDIO -----------------
async function handleGenerateIdea() {
    const field = document.getElementById('ideaFieldSelect').value;
    const topic = document.getElementById('ideaTopicInput').value.trim();
    const background = document.getElementById('ideaBackgroundInput').value.trim();
    const btn = document.getElementById('btnGenerateIdea');

    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> Synthesizing Literature Gaps...`;

    try {
        const response = await fetch('/api/generate-idea', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field, topic, background })
        });

        const data = await response.json();
        if (data.success && data.idea) {
            const idea = data.idea;

            document.getElementById('outputPlaceholder').style.display = 'none';
            const content = document.getElementById('generatedIdeaContent');
            content.style.display = 'block';

            document.getElementById('resField').textContent = idea.stem_field;
            document.getElementById('resTitle').textContent = idea.title;
            document.getElementById('resGap').textContent = idea.unresolved_gap;
            document.getElementById('resHypothesis').textContent = idea.testable_hypothesis;

            const methList = document.getElementById('resMethodology');
            methList.innerHTML = (idea.recommended_methodology || []).map(m => `<li>${escapeHtml(m)}</li>`).join('');

            document.getElementById('resDatasets').textContent = (idea.benchmark_datasets || []).join(', ');
            document.getElementById('resVenues').textContent = (idea.target_venues || []).join(', ');

            showToast("Novel research proposal synthesized!");
        }
    } catch (e) {
        showToast("Error generating idea.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<span class="btn-icon">✨</span> Generate Novel Research Proposal`;
    }
}

function copyIdeaToClipboard() {
    const title = document.getElementById('resTitle').textContent;
    const gap = document.getElementById('resGap').textContent;
    const hyp = document.getElementById('resHypothesis').textContent;
    const text = `PROPOSED STEM HYPOTHESIS:\n${title}\n\nUNRESOLVED GAP:\n${gap}\n\nFALSIFIABLE HYPOTHESIS:\n${hyp}`;

    navigator.clipboard.writeText(text).then(() => {
        showToast("Proposal copied to clipboard!");
    });
}

function saveIdeaToDrafts() {
    showToast("Idea saved to your OpenSTEM Research Notebook!");
}

// ----------------- RESEARCH MATE / COLLABORATORS -----------------
let collabDebounce = null;
function handleCollabSearch() {
    clearTimeout(collabDebounce);
    collabDebounce = setTimeout(() => {
        const niche = document.getElementById('collabNicheInput').value.trim();
        loadCollaborators(niche);
    }, 250);
}

async function loadCollaborators(niche = '') {
    const container = document.getElementById('collaboratorsContainer');
    try {
        const response = await fetch(`/api/collaborators?niche=${encodeURIComponent(niche)}`);
        const data = await response.json();
        if (!data.success || !data.collaborators.length) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">No researchers found matching this niche.</div>`;
            return;
        }

        container.innerHTML = data.collaborators.map(c => {
            const initials = c.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return `
                <div class="collab-card">
                    <div>
                        <div class="collab-top">
                            <div class="collab-avatar" style="background: ${c.avatar_color || '#2563eb'}">${initials}</div>
                            <div>
                                <div class="collab-name">${escapeHtml(c.full_name)}</div>
                                <div class="collab-univ">${escapeHtml(c.university)}</div>
                                <div class="collab-field">${escapeHtml(c.field_of_study)}</div>
                            </div>
                        </div>
                        <p class="collab-bio">${escapeHtml(c.bio || 'Active researcher exploring next-generation scientific frontiers.')}</p>
                    </div>

                    <div>
                        <div class="collab-stats-row">
                            <span>h-Index: <strong>${c.h_index}</strong></span>
                            <span>Citations: <strong>${Number(c.citations).toLocaleString()}</strong></span>
                            <span>Status: <strong style="color: #10b981;">Open to Collab</strong></span>
                        </div>
                        <button class="btn-connect-mate" onclick="openConnectModal(${c.id}, '${escapeHtml(c.full_name)}')">
                            🤝 Connect & Propose Project
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error("Error loading collaborators:", e);
    }
}

function openConnectModal(targetId, targetName) {
    document.getElementById('collabTargetId').value = targetId;
    document.getElementById('collabTargetName').textContent = targetName;
    document.getElementById('connectModal').classList.add('active');
}

async function sendCollabRequest() {
    const to_researcher_id = document.getElementById('collabTargetId').value;
    const sender_name = document.getElementById('collabSenderName').value.trim();
    const sender_email = document.getElementById('collabSenderEmail').value.trim();
    const sender_university = document.getElementById('collabSenderUniv').value.trim();
    const project_title = document.getElementById('collabProjectTitle').value.trim();
    const message = document.getElementById('collabMessage').value.trim();

    if (!sender_name || !sender_email || !message) {
        showToast("Please fill in your name, email, and message.");
        return;
    }

    try {
        const response = await fetch('/api/collaborators/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to_researcher_id, sender_name, sender_email, sender_university, project_title, message
            })
        });

        const res = await response.json();
        if (res.success) {
            closeModal('connectModal');
            showToast("Collaboration invitation successfully sent!");
            document.getElementById('collabMessage').value = '';
            document.getElementById('collabProjectTitle').value = '';
        } else {
            showToast(res.error || "Failed to send invitation.");
        }
    } catch (e) {
        showToast("Network error sending inquiry.");
    }
}

// ----------------- GLOBAL RESEARCH TEAMS & LABS -----------------
async function loadTeams(field = 'all') {
    const container = document.getElementById('teamsContainer');
    try {
        const response = await fetch(`/api/teams?field=${encodeURIComponent(field)}`);
        const data = await response.json();
        if (!data.success || !data.teams.length) {
            container.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 3rem;">No research teams found for this discipline.</div>`;
            return;
        }

        container.innerHTML = data.teams.map(t => `
            <div class="team-card">
                <div class="team-card-header">
                    <div>
                        <h3 class="team-title">${escapeHtml(t.name)}</h3>
                        <div class="team-org">${escapeHtml(t.organization)}</div>
                        <div class="team-loc">📍 ${escapeHtml(t.location)} &bull; <span class="badge-field">${escapeHtml(t.field)}</span></div>
                    </div>
                    <div>
                        ${t.website_url ? `<a href="${escapeHtml(t.website_url)}" target="_blank" class="btn-paper-action">Official Lab Site ↗</a>` : ''}
                    </div>
                </div>

                <div class="team-details-grid">
                    <div class="team-box">
                        <div class="team-box-title">🔬 What They Actually Do</div>
                        <div class="team-box-text">${escapeHtml(t.what_they_do)}</div>
                    </div>
                    <div class="team-box">
                        <div class="team-box-title">🎯 Active 2026 Focus</div>
                        <div class="team-box-text">${escapeHtml(t.current_focus)}</div>
                    </div>
                </div>

                <div class="team-join-container">
                    <div class="team-join-header">🚀 How to Join Their Team & Apply</div>
                    <div class="team-join-steps">${escapeHtml(t.how_to_join)}</div>
                    <div style="margin-top: 0.8rem;">
                        <span style="font-size: 0.775rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Active Vacancies:</span><br>
                        <span class="team-roles-badge">${escapeHtml(t.open_roles)}</span>
                    </div>
                </div>

                <div class="team-footer">
                    ${t.contact_email ? `
                        <a href="mailto:${escapeHtml(t.contact_email)}?subject=Research Ingestion / Inquiry" class="btn-paper-action">
                            ✉️ Contact Lab Admissions (${escapeHtml(t.contact_email)})
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error("Error loading teams:", e);
    }
}

function handleTeamFilter(val) {
    loadTeams(val);
}

// ----------------- MODAL HELPERS -----------------
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

// Close modals when clicking backdrop
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

// Toast Helper
function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function copyCitation(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Citation copied in APA format!");
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
