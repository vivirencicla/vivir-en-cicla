(() => {
  const categoryNames = { todos: 'Todos', camisetas: 'Camisetas', carteles: 'Carteles', 'tote-bags': 'Tote bags', cuadros: 'Cuadros', linoleo: 'Linóleo', serigrafias: 'Serigrafía' };
  const contact = 'https://wa.me/573053795061?text=';
  const deliveryDetails = ' nuestras piezas se realizan de manera artesanal. El tiempo y las opciones deTodas envío se confirman al hacer el pedido.';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formatPrice = value => '$' + Number(value).toLocaleString('es-CO');
  function imageMarkup(product, image, index = 0) {
    if (!image) return '<div class="objeto-image-pendiente">Añade aquí la fotografía del proceso</div>';
    return '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.name) + (index ? ' · fotografía ' + (index + 1) : '') + '" loading="lazy">';
  }
  function renderRichText(value) {
    const source = String(value || 'Descripción pendiente de completar.').replace(/&#x20;/gi, ' ').replace(/\r/g, '');
    const text = escapeHtml(source);
    return text.split(/\n\s*\n/).filter(paragraph => paragraph.trim() && !/^[-–—]+$/.test(paragraph.trim())).map(paragraph => {
      const quote = paragraph.match(/^&gt;\s*\*(.*?)\*$/);
      if (quote) return '<blockquote><em>' + quote[1] + '</em></blockquote>';
      return '<p>' + paragraph.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>').replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }
  async function loadProducts() {
    const localData = document.getElementById('vic-product-data');
    if (localData) return JSON.parse(localData.textContent);
    const response = await fetch('comunidad.html');
    if (!response.ok) throw new Error('No se pudo cargar el catálogo de Comunidad.');
    const documentSource = new DOMParser().parseFromString(await response.text(), 'text/html');
    const data = documentSource.getElementById('vic-product-data');
    if (!data) throw new Error('No se encontró el catálogo dentro de Comunidad.');
    return JSON.parse(data.textContent);
  }
  function start(products) {
    document.querySelectorAll('.objetos-section').forEach(section => {
      const grid = section.querySelector('#objetos-grid');
      const listing = section.querySelector('#objetos-listado');
      const detail = section.querySelector('#objeto-detail');
      if (!grid || !listing || !detail) return;
      function renderGrid(category = 'todos') {
        const entries = products.filter(product => !product.isEditorial && (category === 'todos' || product.category === category));
        if (!entries.length) { grid.innerHTML = '<p class="objetos-empty">Aún no hay productos en esta categoría.</p>'; return; }
        grid.innerHTML = entries.map(product => '<a class="objeto-card" href="#objeto/' + encodeURIComponent(product.id) + '" aria-label="Ver detalle: ' + escapeHtml(product.name) + '"><div class="objeto-image">' + imageMarkup(product, product.image) + '</div><span class="objeto-card-copy"><span><span class="objeto-meta">' + escapeHtml(product.categoryLabel) + (product.technique ? ' · ' + escapeHtml(product.technique) : '') + '</span><h3>' + escapeHtml(product.name) + '</h3></span><span class="objeto-price">' + (product.isEditorial ? 'Ver proceso' : product.price != null ? (product.presentationOptions ? 'Desde ' + formatPrice(product.price.sinMarco) : formatPrice(product.price)) : 'Precio por confirmar') + '</span></span></a>').join('');
      }
      function renderProcessGrid() {
        const processGrid = section.querySelector('#objetos-processes-grid');
        if (!processGrid) return;
        const processes = products.filter(product => product.isEditorial);
        processGrid.innerHTML = processes.map(product => '<a class="objeto-card" href="#objeto/' + encodeURIComponent(product.id) + '" aria-label="Ver proceso: ' + escapeHtml(product.name) + '"><div class="objeto-image">' + imageMarkup(product, product.image) + '</div><span class="objeto-card-copy"><span><span class="objeto-meta">' + escapeHtml(product.categoryLabel) + (product.technique ? ' · ' + escapeHtml(product.technique) : '') + '</span><h3>' + escapeHtml(product.name) + '</h3></span><span class="objeto-price">Ver proceso</span></span></a>').join('');
      }
      function showDetail(id) {
        const product = products.find(item => item.id === id);
        if (!product) { location.hash = 'objetos'; return; }
        listing.hidden = true; detail.hidden = false;
        const gallery = '<div class="objeto-detail-gallery"><div class="objeto-image objeto-detail-main">' + imageMarkup(product, product.image) + '</div>' + (product.extraImages || []).map((image, index) => '<div class="objeto-image objeto-detail-extra">' + imageMarkup(product, image, index + 1) + '</div>').join('') + '</div>';
        const details = product.isEditorial ? '' : '<ul class="objeto-detail-list"><li><span>Materiales</span><span>' + escapeHtml(product.materials || 'Por confirmar') + '</span></li><li><span>Dimensiones</span><span>' + escapeHtml(product.dimensions || 'Por confirmar') + '</span></li><li><span>Precio</span><span data-product-price>' + (product.presentationOptions ? 'Selecciona una presentación' : product.price != null ? formatPrice(product.price) : 'Por confirmar') + '</span></li><li><span>Disponibilidad</span><span>' + escapeHtml(product.availability || 'Por confirmar') + '</span></li>' + (product.category === 'camisetas' || product.category === 'carteles' ? '<li><span>Colores</span><span>' + escapeHtml(product.colors || 'Por confirmar') + '</span></li>' : '') + (product.category === 'camisetas' ? '<li><span>Tallas</span><span>' + escapeHtml(product.sizes || 'Por confirmar') + '</span></li>' : '') + '</ul>';
        const related = products.filter(item => item.id !== product.id && !item.isEditorial).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 3);
        const recommendationBlock = '<section class="objeto-recomendados"><h4>También te puede interesar</h4><div class="objeto-recomendados-grid">' + related.map(item => '<a class="objeto-card" href="#objeto/' + encodeURIComponent(item.id) + '"><div class="objeto-image">' + imageMarkup(item, item.image) + '</div><span class="objeto-card-copy"><span><span class="objeto-meta">' + escapeHtml(item.categoryLabel) + '</span><h3>' + escapeHtml(item.name) + '</h3></span><span class="objeto-price">' + (item.price != null ? formatPrice(item.price) : item.isEditorial ? 'Ver proceso' : 'Por confirmar') + '</span></span></a>').join('') + '</div></section>';
        const presentation = product.presentationOptions && product.price ? '<div class="objeto-presentacion"><p class="objeto-presentacion-label">Presentación</p><div class="objeto-presentacion-options"><button class="objeto-presentacion-option" type="button" aria-pressed="false" data-price="' + product.price.sinMarco + '">Sin marco · ' + formatPrice(product.price.sinMarco) + '</button><button class="objeto-presentacion-option" type="button" aria-pressed="false" data-price="' + product.price.conMarco + '">Con marco · ' + formatPrice(product.price.conMarco) + '</button></div></div>' : '';
        detail.innerHTML = gallery + '<div class="objeto-detail-copy"><button class="objeto-back" type="button">← Volver a los productos</button><p class="objeto-detail-meta">' + escapeHtml(product.categoryLabel) + (product.technique ? ' · ' + escapeHtml(product.technique) : '') + '</p><h3>' + escapeHtml(product.name) + '</h3>' + renderRichText(product.description) + presentation + details + (product.isEditorial ? '' : '<div class="objeto-delivery"><span class="objeto-delivery-title">Entrega y envío</span><div class="objeto-delivery-copy">' + renderRichText(product.delivery || deliveryDetails) + '</div></div><a class="objeto-contact" href="' + contact + encodeURIComponent('Consulta sobre ' + product.name) + '" target="_blank" rel="noopener noreferrer">Me interesa</a>') + '</div>' + recommendationBlock;
        detail.querySelector('.objeto-back').addEventListener('click', () => { location.hash = 'objetos'; });
        detail.querySelectorAll('[data-price]').forEach(button => button.addEventListener('click', () => { detail.querySelectorAll('[data-price]').forEach(option => option.setAttribute('aria-pressed', String(option === button))); const price = detail.querySelector('[data-product-price]'); if (price) price.textContent = formatPrice(Number(button.dataset.price)); }));
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      section.querySelectorAll('.objetos-filter').forEach(button => button.addEventListener('click', () => { section.querySelectorAll('.objetos-filter').forEach(item => item.setAttribute('aria-pressed', String(item === button))); renderGrid(button.dataset.filter); }));
      function route() { const match = location.hash.match(/^#objeto\/(.+)$/); if (match) showDetail(decodeURIComponent(match[1])); else { detail.hidden = true; listing.hidden = false; } }
      renderGrid(); renderProcessGrid(); route(); window.addEventListener('hashchange', route);
    });
  }
  loadProducts().then(start).catch(error => { document.querySelectorAll('.objetos-grid').forEach(grid => { grid.innerHTML = '<p class="objetos-empty">No se pudo cargar la gráfica para llevar. Actualiza la página o revisa la conexión con Comunidad.</p>'; }); console.error(error); });
})();
