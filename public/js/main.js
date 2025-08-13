// Main JavaScript for Pondok Informatika News

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pondok Informatika News loaded successfully!');

    // Load More Button functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        let currentPage = 1;
        const articlesPerPage = 10;

        loadMoreBtn.addEventListener('click', async () => {
            currentPage++;
            try {
                const response = await fetch(`/api/articles?page=${currentPage}&limit=${articlesPerPage}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                if (data.articles && data.articles.length > 0) {
                    const container = document.querySelector('.main-content .row .col-lg-8 .row');
                    data.articles.forEach(article => {
                        const articleCard = document.createElement('div');
                        articleCard.className = 'col-md-6 mb-4';
                        articleCard.innerHTML = `
                            <div class="card news-card h-100 border-0 shadow-sm">
                                <a href="/article/${article.id}" class="text-decoration-none">
                                    <img src="${article.image_url || 'https://via.placeholder.com/400x250/DC3545/FFFFFF?text=News'}" 
                                         class="card-img-top" alt="${article.title}">
                                    <div class="card-body">
                                        <span class="badge bg-primary mb-2">${article.category || 'Umum'}</span>
                                        <h5 class="card-title text-dark fw-bold">${article.title}</h5>
                                        <p class="card-text text-muted">
                                            ${article.description ? article.description.substring(0, 100) + '...' : 'Baca selengkapnya...'}
                                        </p>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <small class="text-muted">
                                                <i class="far fa-clock"></i> ${article.date || 'Hari ini'}
                                            </small>
                                            <small class="text-muted">
                                                <i class="far fa-eye"></i> ${Math.floor(Math.random() * 1000) + 100} views
                                            </small>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        `;
                        container.appendChild(articleCard);
                    });
                } else {
                    loadMoreBtn.disabled = true;
                    loadMoreBtn.textContent = 'Tidak ada artikel lagi';
                }
            } catch (error) {
                console.error('Error loading more articles:', error);
                loadMoreBtn.disabled = true;
                loadMoreBtn.textContent = 'Gagal memuat artikel';
            }
        });
    }
});
