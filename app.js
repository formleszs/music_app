import { setCookie, getCookie, deleteCookie } from './cookie-utils.js';

class MusicApp {
    constructor() {
        this.favoriteTracks = new Set();
        this.tracks = [];
        this.filteredTracks = [];
        this.currentTrackIndex = 0;
        this.isPaused = true;
        this.audio = new Audio();
        this.currentTrack = null;
        this.progressInterval = null;
        this.currentUser = null;
        this.users = new Map(); // Хранилище пользователей

        // Проверяем наличие токена в cookie при инициализации
        const token = this.getCookie('token');
        if (token) {
            this.currentUser = { token };
            this.updateAuthUI();
        }
        
        // Инициализируем элементы
        this.elements = {
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            authModal: document.getElementById('auth-modal'),
            closeAuth: document.getElementById('close-auth'),
            showRegister: document.getElementById('show-register'),
            showLogin: document.getElementById('show-login'),
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),
            authTitle: document.getElementById('auth-title'),
            authError: document.getElementById('auth-error'),
            authErrorReg: document.getElementById('register-error'),
            likeBtn: document.getElementById('like-btn'),
            dislikeBtn: document.getElementById('dislike-btn')
        };

        // Инициализируем UI
        this.initUI();
        this.loadTracks();
    }

    async loadTracks() {
        try {
            const response = await fetch('fake_tracks.csv');
            const text = await response.text();
            const rows = text.split('\n').slice(1);
            
            // Удаляем пустые строки
            const validRows = rows.filter(row => row.trim());
            
            this.tracks = validRows.map((row, index) => {
                const values = row.split(',');
                
                // Проверяем, что строка не пустая и имеет правильное количество значений
                if (values.length < 5) {
                    console.log('Skipping invalid row:', row);
                    return null;
                }

                const track = {
                    id: index + 1,
                    title: values[0],
                    artist: values[1],
                    album_art: values[2],
                    duration: parseFloat(values[3]),
                    audio: values[4],
                    isLiked: false,
                    isDisliked: false
                };

                return track;
            }).filter(track => track !== null);

            this.filteredTracks = [...this.tracks];
            if (this.filteredTracks.length > 0) {
                this.loadTrack(this.filteredTracks[0]);
            }
        } catch (error) {
            console.error('Error loading tracks:', error);
        }
    }

    initUI() {
        // Инициализация поиска
        const searchBtn = document.getElementById('search-btn');
        const searchContainer = document.querySelector('.search-container');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.querySelector('.search-results');

        searchBtn.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchInput.focus();
            }
        });

        // Закрытие поиска при клике вне
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target) && !searchBtn.contains(e.target)) {
                searchContainer.classList.remove('active');
            }
        });

        // Обработка поиска
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) {
                searchResults.innerHTML = '';
                return;
            }

            const results = this.tracks.filter(track => 
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query) ||
                track.genre.toLowerCase().includes(query)
            );

            searchResults.innerHTML = results.map(track => `
                <div class="search-result" data-track-id="${track.id}">
                    <img src="${track.album_art}" alt="${track.title}" class="search-result-image">
                    <div class="search-result-info">
                        <div class="search-result-title">${track.title}</div>
                        <div class="search-result-artist">${track.artist}</div>
                    </div>
                </div>
            `).join('');

            // Добавляем обработчики для результатов
            searchResults.querySelectorAll('.search-result').forEach(result => {
                result.addEventListener('click', () => {
                    const trackId = result.dataset.trackId;
                    const track = this.tracks.find(t => t.id === parseInt(trackId));
                    if (track) {
                        this.loadTrack(track);
                        this.togglePlay();
                        searchContainer.classList.remove('active');
                    }
                });
            });
        });

        // Инициализация плеера
        const playPauseBtn = document.getElementById('play-pause-btn');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const progress = document.querySelector('.progress-bar');
        const favoriteBtn = document.getElementById('favorite-btn');
        const dislikeBtn = document.getElementById('dislike-btn');
        const genreSelect = document.getElementById('genre-select');
        const moodSelect = document.getElementById('mood-select');

        // Установка обработчиков событий
        playPauseBtn.addEventListener('click', () => this.togglePlay());
        nextBtn.addEventListener('click', () => this.playNext());
        prevBtn.addEventListener('click', () => this.playPrev());
        progress.addEventListener('click', (e) => this.seek(e));
        
        // Установка обработчиков для кнопок оценки
        favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        dislikeBtn.addEventListener('click', () => this.toggleDislike());

        // Заполняем жанры
        const genres = new Set(this.tracks.map(track => track.genre));
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });

        // Заполняем настроения
        const moods = new Set(this.tracks.map(track => track.mood));
        moods.forEach(mood => {
            const option = document.createElement('option');
            option.value = mood;
            option.textContent = mood;
            moodSelect.appendChild(option);
        });

        // Инициализация табов
        document.getElementById('tab-rec').addEventListener('click', () => this.showRecommendations());
        document.getElementById('tab-fav').addEventListener('click', () => this.showFavorites());
    }

    // Методы плеера
    togglePlay() {
        if (this.isPaused) {
            this.audio.play();
            this.isPaused = false;
        } else {
            this.audio.pause();
            this.isPaused = true;
        }
    }

    playNext() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.filteredTracks.length;
        this.loadTrack(this.filteredTracks[this.currentTrackIndex]);
    }

    playPrev() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.filteredTracks.length) % this.filteredTracks.length;
        this.loadTrack(this.filteredTracks[this.currentTrackIndex]);
    }

    toggleFavorite() {
        if (this.currentUser) {
            const trackId = this.currentTrack.id;
            if (this.favoriteTracks.has(trackId)) {
                this.favoriteTracks.delete(trackId);
            } else {
                this.favoriteTracks.add(trackId);
            }
        } else {
            alert('Для оценки треков необходимо авторизоваться');
        }
    }

    toggleDislike() {
        if (this.currentUser) {
            const trackId = this.currentTrack.id;
            // Удаляем из избранного, если трек там есть
            if (this.favoriteTracks.has(trackId)) {
                this.favoriteTracks.delete(trackId);
            }
            // Добавляем в дизлайк
            this.currentTrack.isDisliked = !this.currentTrack.isDisliked;
            this.currentTrack.isLiked = false;
        } else {
            alert('Для оценки треков необходимо авторизоваться');
        }
    }

    seek(e) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const progress = x / width;
        this.audio.currentTime = progress * this.audio.duration;
    }

    loadTrack(track) {
        this.audio.src = track.audio;
        this.audio.currentTime = 0;
        this.audio.play();
        this.isPaused = false;
        this.currentTrack = track;
    }

    filterTracks() {
        const genre = document.getElementById('genre-select').value;
        const mood = document.getElementById('mood-select').value;
        
        this.filteredTracks = this.tracks.filter(track => {
            const matchesGenre = genre === 'all' || track.genre === genre;
            const matchesMood = mood === 'all' || track.mood === mood;
            return matchesGenre && matchesMood;
        });

        this.currentTrackIndex = 0;
        if (this.filteredTracks.length > 0) {
            this.loadTrack(this.filteredTracks[0]);
        }
    }

    showRecommendations() {
        const recommendations = document.querySelector('[data-page="recommendations"]');
        const favorites = document.querySelector('[data-page="favorites"]');
        
        recommendations.classList.add('active');
        favorites.classList.remove('active');
    }

    showFavorites() {
        const favorites = document.querySelector('[data-page="favorites"]');
        const recommendations = document.querySelector('[data-page="recommendations"]');
        
        favorites.classList.add('active');
        recommendations.classList.remove('active');
    }

    // Методы аутентификации
    initAuth() {
        // Обработчики входа/выхода
        this.elements.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('login');
        });

        this.elements.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Обработчики модального окна
        this.elements.closeAuth.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideAuthModal();
        });

        this.elements.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('register');
        });

        this.elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('login');
        });

        // Обработчики форм
        this.elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.elements.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    showAuthModal(mode = 'login') {
        if (!this.elements.authModal || !this.elements.loginForm || !this.elements.registerForm || !this.elements.authTitle) {
            console.error('Не найдены элементы модального окна аутентификации');
            return;
        }

        // Скрываем обе формы
        this.elements.loginForm.style.display = 'none';
        this.elements.registerForm.style.display = 'none';

        // Показываем нужную форму
        if (mode === 'login') {
            this.elements.loginForm.style.display = 'block';
            this.elements.authTitle.textContent = 'Вход';
        } else if (mode === 'register') {
            this.elements.registerForm.style.display = 'block';
            this.elements.authTitle.textContent = 'Регистрация';
        }

        // Показываем модальное окно
        this.elements.authModal.style.display = 'flex';
    }

    hideAuthModal() {
        if (this.elements.authModal) {
            this.elements.authModal.style.display = 'none';
        }
    }

    handleLogin() {
        const phone = this.elements.loginForm.querySelector('input[name="phone"]').value;
        const password = this.elements.loginForm.querySelector('input[name="password"]').value;

        // Валидация номера телефона
        if (!this.validatePhone(phone)) {
            this.showError('auth-error', 'Неверный формат номера телефона');
            return;
        }

        // Проверяем пользователя
        const user = this.users.get(phone);
        if (!user || user.password !== password) {
            this.showError('auth-error', 'Неверный номер телефона или пароль');
            return;
        }

        // Успешный вход
        this.currentUser = user;
        this.updateAuthUI();
        this.hideAuthModal();
    }

    handleRegister() {
        const phone = this.elements.registerForm.querySelector('input[name="phone"]').value;
        const password = this.elements.registerForm.querySelector('input[name="password"]').value;
        const confirmPassword = this.elements.registerForm.querySelector('input[name="confirm"]').value;

        // Валидация номера телефона
        if (!this.validatePhone(phone)) {
            this.showError('register-error', 'Неверный формат номера телефона');
            return;
        }

        // Проверка паролей
        if (password !== confirmPassword) {
            this.showError('register-error', 'Пароли не совпадают');
            return;
        }

        // Проверка наличия пользователя
        if (this.users.has(phone)) {
            this.showError('register-error', 'Пользователь с этим номером уже существует');
            return;
        }

        // Создаем нового пользователя
        const userId = this.generateUserId();
        const user = {
            id: userId,
            phone: phone,
            password: password,
            createdAt: new Date().toISOString()
        };

        // Сохраняем пользователя
        this.users.set(phone, user);
        this.currentUser = user;
        this.updateAuthUI();
        this.hideAuthModal();
    }

    logout() {
        this.currentUser = null;
        this.updateAuthUI();
    }

    updateAuthUI() {
        if (this.currentUser) {
            // Пользователь авторизован
            this.elements.loginBtn.style.display = 'none';
            this.elements.logoutBtn.style.display = 'block';
            
            // Активируем функции оценки
            this.elements.likeBtn.disabled = false;
            this.elements.dislikeBtn.disabled = false;
        } else {
            // Пользователь не авторизован
            this.elements.loginBtn.style.display = 'block';
            this.elements.logoutBtn.style.display = 'none';
            
            // Деактивируем функции оценки
            this.elements.likeBtn.disabled = true;
            this.elements.dislikeBtn.disabled = true;
        }
    }

    validatePhone(phone) {
        // Проверка формата номера телефона
        const phoneRegex = /^\+?[78]\d{10}$/;
        return phoneRegex.test(phone);
    }

    generateUserId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    initAuth() {
        // Обработчики входа/выхода
        this.elements.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('login');
        });

        this.elements.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Обработчики модального окна
        this.elements.closeAuth.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideAuthModal();
        });

        this.elements.showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('register');
        });

        this.elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAuthModal('login');
        });

        // Обработчики форм
        this.elements.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        this.elements.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }

    showAuthModal(mode = 'login') {
        if (!this.elements.authModal || !this.elements.loginForm || !this.elements.registerForm || !this.elements.authTitle) {
            console.error('Не найдены элементы модального окна аутентификации');
            return;
        }

        // Скрываем обе формы
        this.elements.loginForm.style.display = 'none';
        this.elements.registerForm.style.display = 'none';

        // Показываем нужную форму
        if (mode === 'login') {
            this.elements.loginForm.style.display = 'block';
            this.elements.authTitle.textContent = 'Вход';
        } else if (mode === 'register') {
            this.elements.registerForm.style.display = 'block';
            this.elements.authTitle.textContent = 'Регистрация';
        }

        // Показываем модальное окно
        this.elements.authModal.style.display = 'flex';
    }

    hideAuthModal() {
        if (this.elements.authModal) {
            this.elements.authModal.style.display = 'none';
        }
    }

    handleLogin() {
        const phone = this.elements.loginForm.querySelector('input[name="phone"]').value;
        const password = this.elements.loginForm.querySelector('input[name="password"]').value;

        // Валидация номера телефона
        if (!this.validatePhone(phone)) {
            this.showError('auth-error', 'Неверный формат номера телефона');
            return;
        }

        // Проверяем пользователя
        const user = this.users.get(phone);
        if (!user || user.password !== password) {
            this.showError('auth-error', 'Неверный номер телефона или пароль');
            return;
        }

        // Успешный вход
        this.currentUser = user;
        this.updateAuthUI();
        this.hideAuthModal();
    }

    handleRegister() {
        const phone = this.elements.registerForm.querySelector('input[name="phone"]').value;
        const password = this.elements.registerForm.querySelector('input[name="password"]').value;
        const confirmPassword = this.elements.registerForm.querySelector('input[name="confirm"]').value;

        // Валидация номера телефона
        if (!this.validatePhone(phone)) {
            this.showError('register-error', 'Неверный формат номера телефона');
            return;
        }

        // Проверка паролей
        if (password !== confirmPassword) {
            this.showError('register-error', 'Пароли не совпадают');
            return;
        }

        // Проверка наличия пользователя
        if (this.users.has(phone)) {
            this.showError('register-error', 'Пользователь с этим номером уже существует');
            return;
        }

        // Создаем нового пользователя
        const userId = this.generateUserId();
        const user = {
            id: userId,
            phone: phone,
            password: password,
            createdAt: new Date().toISOString()
        };

        // Сохраняем пользователя
        this.users.set(phone, user);
        this.currentUser = user;
        this.updateAuthUI();
        this.hideAuthModal();
    }

    logout() {
        this.currentUser = null;
        this.updateAuthUI();
    }

    updateAuthUI() {
        if (this.currentUser) {
            // Пользователь авторизован
            this.elements.loginBtn.style.display = 'none';
            this.elements.logoutBtn.style.display = 'block';
            
            // Активируем функции оценки
            this.elements.likeBtn.disabled = false;
            this.elements.dislikeBtn.disabled = false;
        } else {
            // Пользователь не авторизован
            this.elements.loginBtn.style.display = 'block';
            this.elements.logoutBtn.style.display = 'none';
            
            // Деактивируем функции оценки
            this.elements.likeBtn.disabled = true;
            this.elements.dislikeBtn.disabled = true;
        }
    }

    validatePhone(phone) {
        // Проверка формата номера телефона
        const phoneRegex = /^\+?[78]\d{10}$/;
        return phoneRegex.test(phone);
    }

    generateUserId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
}

// Создаем экземпляр приложения
const musicApp = new MusicApp();
