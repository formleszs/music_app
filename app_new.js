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
        this.initUI();
        this.loadTracks();
    }

    async loadTracks() {
        const response = await fetch('fake_tracks.csv');
        const text = await response.text();
        const rows = text.split('\n').slice(1);
        this.tracks = rows.map(row => {
            const [id, title, artist, genre, mood, album_art] = row.split(',');
            return {
                id: parseInt(id),
                title,
                artist,
                genre,
                mood,
                album_art,
                duration: Math.floor(Math.random() * 180) + 60,
                isLiked: false,
                isDisliked: false
            };
        });
        this.filteredTracks = [...this.tracks];
    }

    initUI() {
        // Инициализация кнопок плеера
        const playBtn = document.getElementById('play-btn');
        const filterBtn = document.getElementById('filter-btn');
        const modal = document.getElementById('filter-modal');
        const closeBtn = document.getElementById('close-modal');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const genreSelect = document.getElementById('genre-select');
        const moodSelect = document.getElementById('mood-select');

        // Добавляем обработчики событий для модального окна
        filterBtn.addEventListener('click', () => modal.classList.add('active'));
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        applyFiltersBtn.addEventListener('click', () => {
            this.filterTracks();
            modal.classList.remove('active');
        });

        // Инициализация плеера
        const playerTitle = document.getElementById('player-title');
        const playerArtist = document.getElementById('player-artist');
        const playerCover = document.getElementById('player-cover');
        const playPauseBtn = document.getElementById('play-pause-btn');
        const nextBtn = document.getElementById('next-btn');
        const progress = document.querySelector('.progress input');
        const favoriteBtn = document.getElementById('favorite-btn');
        const dislikeBtn = document.getElementById('dislike-btn');

        // Установка обработчиков событий
        playBtn.addEventListener('click', () => this.playTrack());
        playPauseBtn.addEventListener('click', () => this.togglePlay());
        nextBtn.addEventListener('click', () => this.playNextTrack());
        progress.addEventListener('input', (e) => this.seek(e.target.value));
        favoriteBtn.addEventListener('click', () => this.toggleLike(this.currentTrack));
        dislikeBtn.addEventListener('click', () => this.toggleDislike(this.currentTrack));

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

    playTrack(track = null) {
        if (!track) {
            track = this.filteredTracks[this.currentTrackIndex];
        }

        this.currentTrack = track;
        this.audio.src = `tracks/${track.id}.mp3`;
        
        // Имитация воспроизведения
        this.audio.currentTime = 0;
        this.audio.duration = track.duration;
        this.audio.play();
        this.isPaused = false;

        // Обновляем UI плеера
        document.getElementById('player-title').textContent = track.title;
        document.getElementById('player-artist').textContent = track.artist;
        document.getElementById('player-cover').src = track.album_art;
        document.getElementById('play-pause-btn').textContent = '⏸';

        // Обновляем прогресс каждую секунду
        this.progressInterval = setInterval(() => {
            if (!this.isPaused && !this.audio.ended) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                document.querySelector('.progress input').value = progress;
            } else if (this.audio.ended) {
                this.playNextTrack();
            }
        }, 1000);
    }

    togglePlay() {
        this.isPaused = !this.isPaused;
        const playPauseBtn = document.getElementById('play-pause-btn');
        playPauseBtn.textContent = this.isPaused ? '▶' : '⏸';
        
        if (!this.isPaused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    playNextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.filteredTracks.length;
        this.playTrack(this.filteredTracks[this.currentTrackIndex]);
    }

    playPrevious() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.filteredTracks.length) % this.filteredTracks.length;
        this.playTrack(this.filteredTracks[this.currentTrackIndex]);
    }

    updatePlayer() {
        if (this.currentTrack) {
            document.getElementById('player-title').textContent = this.currentTrack.title;
            document.getElementById('player-artist').textContent = this.currentTrack.artist;
            document.getElementById('player-cover').src = this.currentTrack.album_art;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    seek(value) {
        if (this.currentTrack) {
            this.audio.currentTime = (value / 100) * this.audio.duration;
        }
    }

    toggleLike(track) {
        if (track) {
            track.isLiked = !track.isLiked;
            track.isDisliked = false;
            this.updatePlayer();
        }
    }

    toggleDislike(track) {
        if (track) {
            track.isDisliked = !track.isDisliked;
            track.isLiked = false;
            this.updatePlayer();
        }
    }

    filterTracks() {
        const genreSelect = document.getElementById('genre-select');
        const moodSelect = document.getElementById('mood-select');
        const selectedGenre = genreSelect.value;
        const selectedMood = moodSelect.value;

        this.filteredTracks = this.tracks.filter(track => {
            const genreMatch = selectedGenre === '' || track.genre === selectedGenre;
            const moodMatch = selectedMood === '' || track.mood === selectedMood;
            return genreMatch && moodMatch;
        });

        this.currentTrackIndex = 0;
        this.playTrack();
    }

    showRecommendations() {
        const tracksToShow = document.querySelector('[data-page="recommendations"]');
        const favorites = document.querySelector('[data-page="favorites"]');
        
        tracksToShow.classList.add('active');
        favorites.classList.remove('active');
    }

    showFavorites() {
        const tracksToShow = document.querySelector('[data-page="favorites"]');
        const recommendations = document.querySelector('[data-page="recommendations"]');
        
        tracksToShow.classList.add('active');
        recommendations.classList.remove('active');
    }
}

// Инициализация приложения
const musicApp = new MusicApp();
