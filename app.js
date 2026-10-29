/**
 * Lógica Principal do Portal de Cartilhas Digitais
 */

// Estado da Aplicação
const state = {
  currentCartilha: null,
  activeCategory: 'todas',
  searchQuery: '',
  sidebarCollapsed: false,
  isMobile: window.innerWidth <= 900
};

// Elementos DOM
const elements = {
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  toggleSidebarBtn: document.getElementById('toggleSidebarBtn'),
  closeSidebarBtn: document.getElementById('closeSidebarBtn'),
  cartilhasList: document.getElementById('cartilhasList'),
  itemsCount: document.getElementById('itemsCount'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  categoryFilters: document.getElementById('categoryFilters'),
  
  // Viewer Elements
  currentCategory: document.getElementById('currentCategory'),
  currentPages: document.getElementById('currentPages'),
  currentTitle: document.getElementById('currentTitle'),
  currentDesc: document.getElementById('currentDesc'),
  downloadBtn: document.getElementById('downloadBtn'),
  openTabBtn: document.getElementById('openTabBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  viewerContainer: document.getElementById('viewerContainer'),
  viewerLoader: document.getElementById('viewerLoader'),
  pdfFrame: document.getElementById('pdfFrame'),
  
  // Fallback
  pdfFallback: document.getElementById('pdfFallback'),
  fallbackTitle: document.getElementById('fallbackTitle'),
  fallbackOpenBtn: document.getElementById('fallbackOpenBtn'),
  fallbackDownloadBtn: document.getElementById('fallbackDownloadBtn'),

  // Modal
  helpBtn: document.getElementById('helpBtn'),
  helpModal: document.getElementById('helpModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalBackdrop: document.getElementById('modalBackdrop'),
  modalConfirmBtn: document.getElementById('modalConfirmBtn')
};

/**
 * Inicialização
 */
function init() {
  setupEventListeners();
  renderCategoryFilters();
  renderCartilhas();
  
  // Selecionar cartilha pela URL (#hash) ou primeira da lista
  const hash = window.location.hash.replace('#', '');
  const initial = CARTILHAS.find(c => c.id === hash) || CARTILHAS[0];
  
  if (initial) {
    selectCartilha(initial.id);
  }

  // Monitorar redimensionamento
  window.addEventListener('resize', handleResize);
}

/**
 * Configuração de Event Listeners
 */
function setupEventListeners() {
  // Alternar Sidebar (Desktop e Mobile)
  elements.toggleSidebarBtn.addEventListener('click', toggleSidebar);
  elements.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // Busca
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    elements.clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    renderCartilhas();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    elements.searchInput.focus();
    renderCartilhas();
  });

  // Filtros de Categoria
  elements.categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;

    elements.categoryFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    state.activeCategory = chip.dataset.category;
    renderCartilhas();
  });

  // Evento de carregamento do Iframe
  elements.pdfFrame.addEventListener('load', () => {
    elements.viewerLoader.style.opacity = '0';
    setTimeout(() => {
      elements.viewerLoader.style.display = 'none';
    }, 300);
  });

  // Tela Cheia
  elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenIcon);

  // Modal de Ajuda
  elements.helpBtn.addEventListener('click', () => openModal(elements.helpModal));
  elements.closeModalBtn.addEventListener('click', () => closeModal(elements.helpModal));
  elements.modalBackdrop.addEventListener('click', () => closeModal(elements.helpModal));
  elements.modalConfirmBtn.addEventListener('click', () => closeModal(elements.helpModal));

  // Fechar modal com tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(elements.helpModal);
      if (state.isMobile) closeMobileSidebar();
    }
  });

  // Ouvir mudança de Hash para navegação direta
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && (!state.currentCartilha || state.currentCartilha.id !== hash)) {
      selectCartilha(hash);
    }
  });
}

/**
 * Renderiza os itens na barra lateral
 */
function renderCartilhas() {
  const filtered = CARTILHAS.filter(item => {
    const matchesCategory = state.activeCategory === 'todas' || 
      item.category.toLowerCase() === state.activeCategory.toLowerCase();
    
    const matchesQuery = !state.searchQuery || 
      item.title.toLowerCase().includes(state.searchQuery) ||
      item.description.toLowerCase().includes(state.searchQuery) ||
      item.category.toLowerCase().includes(state.searchQuery);

    return matchesCategory && matchesQuery;
  });

  elements.itemsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'cartilha encontrada' : 'cartilhas disponíveis'}`;

  if (filtered.length === 0) {
    elements.cartilhasList.innerHTML = `
      <div class="empty-results">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>Nenhuma cartilha encontrada com esse termo.</p>
      </div>
    `;
    return;
  }

  elements.cartilhasList.innerHTML = filtered.map(item => {
    const isActive = state.currentCartilha && state.currentCartilha.id === item.id;
    const badgeClass = item.badge ? item.badge.toLowerCase() : '';
    
    return `
      <div 
        class="cartilha-card ${isActive ? 'active' : ''}" 
        data-id="${item.id}"
        role="button"
        tabindex="0"
        aria-selected="${isActive}">
        
        <div class="card-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>

        <div class="card-content">
          <div class="card-meta-line">
            <span class="card-category">${escapeHTML(item.category)}</span>
            ${item.badge ? `<span class="card-badge ${badgeClass}">${escapeHTML(item.badge)}</span>` : ''}
          </div>
          <h3 class="card-title">${escapeHTML(item.title)}</h3>
          <p class="card-desc">${escapeHTML(item.description)}</p>
        </div>

      </div>
    `;
  }).join('');

  // Adicionar eventos de clique em cada card
  elements.cartilhasList.querySelectorAll('.cartilha-card').forEach(card => {
    card.addEventListener('click', () => {
      selectCartilha(card.dataset.id);
      if (state.isMobile) {
        closeMobileSidebar();
      }
    });

    // Acessibilidade: permitir seleção com tecla Enter ou Espaço
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectCartilha(card.dataset.id);
        if (state.isMobile) closeMobileSidebar();
      }
    });
  });
}

/**
 * Renderiza dinamicamente as categorias encontradas nas cartilhas
 */
function renderCategoryFilters() {
  const categories = ['todas', ...new Set(CARTILHAS.map(c => c.category))];
  elements.categoryFilters.innerHTML = categories.map(cat => {
    const isTodas = cat.toLowerCase() === 'todas';
    const label = isTodas ? 'Todas' : cat;
    const isActive = state.activeCategory.toLowerCase() === cat.toLowerCase();
    return `<button class="filter-chip ${isActive ? 'active' : ''}" data-category="${escapeHTML(cat)}">${escapeHTML(label)}</button>`;
  }).join('');
}

/**
 * Seleciona e exibe uma cartilha
 */
function selectCartilha(id) {
  const cartilha = CARTILHAS.find(c => c.id === id);
  if (!cartilha) return;

  state.currentCartilha = cartilha;

  // Atualizar hash da URL sem causar reload
  window.history.replaceState(null, '', `#${cartilha.id}`);

  // Atualizar informações da barra superior
  elements.currentTitle.textContent = cartilha.title;
  elements.currentDesc.textContent = cartilha.description;
  elements.currentCategory.textContent = cartilha.category;
  elements.currentPages.textContent = cartilha.pages ? `${cartilha.pages} • ${cartilha.date || 'PDF'}` : 'PDF';

  // Configurar URLs seguras
  const safeFileUrl = encodeURI(cartilha.file);
  const downloadFileName = cartilha.file.split('/').pop();

  // Configurar botões de ação
  elements.downloadBtn.href = safeFileUrl;
  elements.downloadBtn.setAttribute('download', downloadFileName);
  elements.openTabBtn.href = safeFileUrl;

  // Configurar Fallback
  elements.fallbackTitle.textContent = cartilha.title;
  elements.fallbackOpenBtn.href = safeFileUrl;
  elements.fallbackDownloadBtn.href = safeFileUrl;

  // Exibir Loader e carregar no Iframe
  elements.viewerLoader.style.display = 'flex';
  elements.viewerLoader.style.opacity = '1';

  // Forçar recarga limpa do iframe
  elements.pdfFrame.src = `${safeFileUrl}#toolbar=1&navpanes=0`;

  // Atualizar classes ativas na lista
  elements.cartilhasList.querySelectorAll('.cartilha-card').forEach(card => {
    const isThis = card.dataset.id === cartilha.id;
    card.classList.toggle('active', isThis);
    card.setAttribute('aria-selected', isThis ? 'true' : 'false');
  });
}

/**
 * Alternar visibilidade da Sidebar
 */
function toggleSidebar() {
  if (state.isMobile) {
    const isOpen = elements.sidebar.classList.contains('mobile-open');
    if (isOpen) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  } else {
    // Desktop: collapse/expand
    state.sidebarCollapsed = !state.sidebarCollapsed;
    elements.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
  }
}

function openMobileSidebar() {
  elements.sidebar.classList.add('mobile-open');
  elements.sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  elements.sidebar.classList.remove('mobile-open');
  elements.sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Modo Tela Cheia
 */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    elements.viewerContainer.requestFullscreen().catch(err => {
      console.warn('Erro ao solicitar tela cheia:', err.message);
    });
  } else {
    document.exitFullscreen();
  }
}

function updateFullscreenIcon() {
  const isFs = !!document.fullscreenElement;
  const enterIcon = elements.fullscreenBtn.querySelector('.fullscreen-icon-enter');
  const exitIcon = elements.fullscreenBtn.querySelector('.fullscreen-icon-exit');
  
  if (isFs) {
    enterIcon.style.display = 'none';
    exitIcon.style.display = 'block';
  } else {
    enterIcon.style.display = 'block';
    exitIcon.style.display = 'none';
  }
}

/**
 * Modais
 */
function openModal(modal) {
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

/**
 * Redimensionamento
 */
function handleResize() {
  const nowMobile = window.innerWidth <= 900;
  if (state.isMobile !== nowMobile) {
    state.isMobile = nowMobile;
    if (!state.isMobile) {
      closeMobileSidebar();
    }
  }
}

/**
 * Utilitário de escape HTML simples para segurança contra XSS
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Iniciar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
