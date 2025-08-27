document.addEventListener('DOMContentLoaded', function() {
    let currentPage = 1;
    const limit = 6;
    let isLoading = false;
    let hasMore = true;

    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadingSpinner = document.getElementById('loading-spinner');
    const articlesContainer = document.getElementById('articles-container');

    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', loadMoreArticles);

    async function loadMoreArticles() {
        if (isLoading || !hasMore) return;

        isLoading = true;
        loadMoreBtn.classList.add('d-none');
        loadingSpinner.classList.remove('d-none');

        try {
            currentPage++;
            const response = await fetch(`/api/old-articles?page=${currentPage}&limit=${limit}`);
            const data = await response.json();

            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    const articleElement = createArticleElement(article);
                    articlesContainer.appendChild(articleElement);
                });

                hasMore = data.hasMore;
                
                if (!hasMore) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.classList.remove('d-none');
                }
            } else {
                hasMore = false;
                loadMoreBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading more articles:', error);
            alert('Gagal memuat artikel. Silakan coba lagi.');
            loadMoreBtn.classList.remove('d-none');
        } finally {
            isLoading = false;
            loadingSpinner.classList.add('d-none');
        }
    }

    function createArticleElement(article) {
        const div = document.createElement('div');
        div.className = 'col-md-4 mb-4 article-item';
        
        div.innerHTML = `
            <div class="card h-100">
                <img src="${article.image_url || 'https://via.placeholder.com/400x250/0056b3/FFFFFF?text=Artikel+Lama'}" 
                     class="card-img-top" alt="${article.title}">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-primary mb-2" style="width: fit-content;">${article.kategori || 'Umum'}</span>
                    <h5 class="card-title">${article.title}</h5>
                    <p class="card-text flex-grow-1">
                        ${article.description ? article.description.substring(0, 100) + '...' : 'Baca selengkapnya...'}
                    </p>
                    <div class="mt-auto">
                                        <small class="text-muted">
                                            <i class="far fa-clock"></i> ${article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : (article.date ? new Date(article.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal tidak tersedia')}
                                        </small>
                        <br>
                        <a href="/article/${article.id}" class="btn btn-primary mt-2" style="background-color: #0056b3;">
                            Baca Selengkapnya
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        return div;
    }

    // Hide load more button if no articles initially
    if (document.querySelectorAll('.article-item').length === 0) {
        loadMoreBtn.style.display = 'none';
    }
});
