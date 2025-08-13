  const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS sebagai template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Configuration
const API_BASE_URL = 'https://santri.pondokinformatika.id/api/get/news';

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(API_BASE_URL);
        let articles = response.data.data || [];

        // Sort articles by id descending (assuming id 1 is oldest)
        articles.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        // Paginate articles for initial page load
        const page = 1;
        const limit = 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        res.render('index', { 
            title: 'Pondok Informatika News',
            articles: paginatedArticles,
            description: 'Berita terkini dari Pondok Informatika'
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.render('error', { 
            title: 'Error',
            message: 'Gagal memuat artikel'
        });
    }
});

// API endpoint for loading more articles
app.get('/api/articles', async (req, res) => {
    try {
        const response = await axios.get(API_BASE_URL);
        let articles = response.data.data || [];

        // Sort articles by id descending
        articles.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedArticles = articles.slice(startIndex, endIndex);

        res.json({ articles: paginatedArticles });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Gagal memuat artikel' });
    }
});

app.get('/article/:id', async (req, res) => {
    try {
        const response = await axios.get(API_BASE_URL);
        const articles = response.data.data || [];
        const article = articles.find(a => a.id == req.params.id);
        
        if (!article) {
            return res.status(404).render('error', {
                title: 'Artikel Tidak Ditemukan',
                message: 'Artikel yang Anda cari tidak ditemukan'
            });
        }
        
        res.render('article', { 
            title: article.title,
            article: article
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.render('error', { 
            title: 'Error',
            message: 'Gagal memuat artikel'
        });
    }
});

// Error handling
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Halaman Tidak Ditemukan',
        message: 'Halaman yang Anda cari tidak ditemukan'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
