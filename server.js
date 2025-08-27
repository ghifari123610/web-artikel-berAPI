const express = require('express');
const axios = require('axios');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS sebagai template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

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

        // Include category in articles
        articles.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        // Paginate articles for initial page load
        const page = 1;
        const limit = 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedArticles = articles.slice(startIndex, endIndex);
        
        res.render('index', { 
            title: 'Pondok Informatika News',
                articles: paginatedArticles.map(article => ({
                    ...article,
                    category: article.kategori // Directly use the category from the API
                })),
            description: 'Berita terkini dari Pondok Informatika'
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.render('error', { 
            title: 'Error',
            message: 'Gagal memuat artikel',
            description: 'Terjadi kesalahan saat memuat artikel'
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
                message: 'Artikel yang Anda cari tidak ditemukan',
                description: 'Artikel yang Anda cari tidak dapat ditemukan di database kami'
            });
        }

        // Clean HTML tags from content
        let cleanContent = article.content || article.description || 'Konten artikel tidak tersedia.';
        cleanContent = cleanContent
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&lsquo;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&mdash;/g, '-')
            .replace(/&ndash;/g, '-')
            .replace(/\s+/g, ' ')
            .trim();

        // Create new article object with cleaned content
        const cleanArticle = {
            category: article.kategori, // Set the category from the API
            ...article,
            content: cleanContent,
            description: cleanContent.substring(0, 200) + '...'
        };
        
        // Shuffle articles for random display
        const shuffledArticles = [...articles]
            .filter(a => a.id != req.params.id) // Exclude current article
            .sort(() => Math.random() - 0.5); // Random shuffle
        
        res.render('article', {
            articles: shuffledArticles,
            title: article.title,
            article: cleanArticle,
            description: cleanArticle.description || article.title
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        res.render('error', { 
            title: 'Error',
            message: 'Gagal memuat artikel',
            description: 'Terjadi kesalahan saat memuat artikel'
        });
    }
});

// Old articles page
app.get('/old-articles', async (req, res) => {
    try {
        const response = await axios.get(API_BASE_URL);
        let articles = response.data.data || [];

        // Sort articles by date (oldest first based on actual date) - artikel lama di bawah
        articles.sort((a, b) => {
            const dateA = new Date(a.created_at || a.date || '2000-01-01');
            const dateB = new Date(b.created_at || b.date || '2000-01-01');
            return dateA - dateB; // Urutan ascending: lama di bawah, baru di atas
        });

        // Filter articles that are older than 2 days
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const oldArticles = articles.filter(article => {
            const articleDate = new Date(article.created_at || article.date || '2000-01-01');
            return articleDate < twoDaysAgo;
        });

        res.render('old-articles', { 
            title: 'Artikel Lama - Pondok Informatika',
            articles: oldArticles.slice(0, 6), // Show first 6 oldest articles initially
            description: 'Koleksi artikel-artikel sebelumnya dari Pondok Informatika',
            totalArticles: oldArticles.length
        });
    } catch (error) {
        console.error('Error fetching old articles:', error);
        res.render('error', { 
            title: 'Error',
            message: 'Gagal memuat artikel lama',
            description: 'Terjadi kesalahan saat memuat artikel lama'
        });
    }
});

// API endpoint for loading more old articles
app.get('/api/old-articles', async (req, res) => {
    try {
        const response = await axios.get(API_BASE_URL);
        let articles = response.data.data || [];

        // Sort articles by date (oldest first based on actual date)
        articles.sort((a, b) => {
            const dateA = new Date(a.created_at || a.date || '2000-01-01');
            const dateB = new Date(b.created_at || b.date || '2000-01-01');
            return dateA - dateB;
        });

        // Filter articles that are older than 2 days
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        
        const oldArticles = articles.filter(article => {
            const articleDate = new Date(article.created_at || article.date || '2000-01-01');
            return articleDate < twoDaysAgo;
        });

        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedArticles = oldArticles.slice(startIndex, endIndex);

        res.json({ 
            articles: paginatedArticles,
            hasMore: endIndex < oldArticles.length,
            total: oldArticles.length
        });
    } catch (error) {
        console.error('Error fetching old articles:', error);
        res.status(500).json({ error: 'Gagal memuat artikel lama' });
    }
});

// Error handling
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Halaman Tidak Ditemukan',
        message: 'Halaman yang Anda cari tidak ditemukan',
        description: 'Halaman yang Anda cari tidak tersedia di website ini'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server aktif di port ${PORT}`);
});

    