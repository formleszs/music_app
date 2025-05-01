class MusicApp {
    constructor() {
        this.favoriteTracks = new Set();
        this.tracks = this.generateMockData();
        this.filteredTracks = [...this.tracks];
        this.currentTrack = null;
        this.isPaused = true;
        this.audio = new Audio();
        
        // Настройка заголовков для всех запросов
        if ('fetch' in window) {
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const [resource, config] = args;
                const headers = new Headers(config?.headers);
                headers.set('ngrok-skip-browser-warning', 'true');
                headers.set('User-Agent', 'MusicApp/1.0');
                return originalFetch(resource, { ...config, headers });
            };
        }

        this.initUI();
        this.setupEventListeners();
    }

    generateMockData() {
        return [
            {
                id: 1,
                title: "Тепло летнего вечера",
                artist: "Мелодия",
                genre: "pop",
                mood: "chill",
                albumArt: "https://picsum.photos/300/300?random=1",
                duration: "3:45"
            },
            {
                id: 2,
                title: "Энергия утра",
                artist: "Энергия",
                genre: "rock",
                mood: "energetic",
                albumArt: "https://picsum.photos/300/300?random=2",
                duration: "4:12"
            },
            {
                id: 3,
                title: "Веселый танец",
                artist: "Ритм",
                genre: "electronic",
                mood: "happy",
                albumArt: "https://picsum.photos/300/300?random=3",
                duration: "3:20"
            },
            // Добавьте больше треков по аналогии
        ];
    }

    initUI() {
        this.renderTracks();
        this.updatePlayer();
    }

    setupEventListeners() {
        // Фильтры
        document.getElementById('genre').addEventListener('change', () => this.filterTracks());
        document.getElementById('mood').addEventListener('change', () => this.filterTracks());

        // Поиск
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('input', () => this.searchTracks(searchInput.value));

        // Плеер
        document.querySelector('.play-btn').addEventListener('click', () => this.togglePlay());
        document.querySelector('.btn:first-child').addEventListener('click', () => this.playPrevious());
        document.querySelector('.btn:last-child').addEventListener('click', () => this.playNext());

        // Добавление в избранное
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                this.toggleFavorite(e.target.closest('.track-card'));
            }
        });
    }

    filterTracks() {
        const genre = document.getElementById('genre').value;
        const mood = document.getElementById('mood').value;

        this.filteredTracks = this.tracks.filter(track => {
            const genreMatch = !genre || track.genre === genre;
            const moodMatch = !mood || track.mood === mood;
            return genreMatch && moodMatch;
        });

        this.renderTracks();
    }

    searchTracks(query) {
        const searchQuery = query.toLowerCase();
        this.filteredTracks = this.tracks.filter(track => {
            return track.title.toLowerCase().includes(searchQuery) ||
                   track.artist.toLowerCase().includes(searchQuery);
        });
        this.renderTracks();
    }

    renderTracks() {
        const trackGrid = document.getElementById('trackGrid');
        trackGrid.innerHTML = this.filteredTracks.map(track => `
            <div class="track-card">
                <img src="${track.albumArt}" alt="${track.title}">
                <div class="track-info">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                    <div class="track-meta">
                        <span>${track.genre}</span>
                        <span>${track.duration}</span>
                    </div>
                </div>
                <button class="favorite-btn" data-track-id="${track.id}">
                    <i class="fas fa-heart${this.favoriteTracks.has(track.id) ? '-o' : ''}"></i>
                </button>
            </div>
        `).join('');
    }

    toggleFavorite(trackCard) {
        const trackId = parseInt(trackCard.dataset.trackId);
        const isFavorite = this.favoriteTracks.has(trackId);

        if (isFavorite) {
            this.favoriteTracks.delete(trackId);
        } else {
            this.favoriteTracks.add(trackId);
        }

        // Обновляем иконку
        const heartIcon = trackCard.querySelector('.favorite-btn i');
        heartIcon.classList.toggle('fa-heart-o');
        heartIcon.classList.toggle('fa-heart');
    }

    togglePlay() {
        this.isPaused = !this.isPaused;
        const playBtn = document.querySelector('.play-btn');
        playBtn.innerHTML = this.isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }

    playPrevious() {
        // Реализация логики переключения треков
    }

    playNext() {
        // Реализация логики переключения треков
    }

    updatePlayer() {
        // Обновление информации о текущем треке
    }
}

// Инициализация приложения
window.addEventListener('DOMContentLoaded', () => {
    new MusicApp();
});
