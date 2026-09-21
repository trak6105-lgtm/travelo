/**
 * Travelo Viet Nam - Client Application Script
 * Ultra-fast, lightweight, modern interaction
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchForm = document.getElementById('searchForm');
  const langSelector = document.getElementById('langSelector');
  const currencySelector = document.getElementById('currencySelector');

  let debounceTimer;

  // Xử lý tìm kiếm với debounce 250ms
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      clearTimeout(debounceTimer);

      if (query.length < 2) {
        searchResults.innerHTML = '';
        searchResults.classList.remove('active');
        return;
      }

      debounceTimer = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Search failed');
          const resData = await response.json();

          if (resData.success && resData.data.length > 0) {
            searchResults.innerHTML = resData.data.map(item => `
              <div class="result-item" data-id="${item.id}">
                <div>
                  <div class="result-title">${escapeHtml(item.name)}</div>
                  <small style="color:#64748b;">${escapeHtml(item.duration || '')} ${item.price ? '• $' + item.price : ''}</small>
                </div>
                <span class="result-badge">${escapeHtml(item.category)}</span>
              </div>
            `).join('');
            searchResults.classList.add('active');

            // Click vào từng kết quả
            document.querySelectorAll('.result-item').forEach(el => {
              el.addEventListener('click', () => {
                const title = el.querySelector('.result-title').textContent;
                searchInput.value = title;
                searchResults.classList.remove('active');
              });
            });
          } else {
            searchResults.innerHTML = `
              <div style="padding:12px 14px; font-size:13px; color:#64748b;">
                No matches found for "<strong>${escapeHtml(query)}</strong>". Try "Ninh Binh", "Halong", or "Tour".
              </div>
            `;
            searchResults.classList.add('active');
          }
        } catch (err) {
          console.error('Search error:', err);
        }
      }, 250);
    });

    // Ẩn kết quả tìm kiếm khi bấm ra ngoài
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });

    // Submit form search
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) {
          alert(`Searching private Vietnam journeys for: "${q}"`);
        }
      });
    }
  }

  // Tương tác đơn giản chọn Language / Currency
  if (langSelector) {
    langSelector.addEventListener('click', () => {
      const current = langSelector.querySelector('span').textContent;
      const nextLang = current === 'EN' ? 'VI' : 'EN';
      langSelector.querySelector('span').textContent = nextLang;
    });
  }

  if (currencySelector) {
    currencySelector.addEventListener('click', () => {
      const current = currencySelector.querySelector('span').textContent;
      const nextCurr = current === 'USD' ? 'VND' : 'USD';
      currencySelector.querySelector('span').textContent = nextCurr;
    });
  }

  // Tiện ích escape HTML chống XSS
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
