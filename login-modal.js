        // Инициализация модального окна при загрузке страницы
// Утилиты для работы с куками
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/';
}

class LoginModal {
    constructor() {
        // Инициализируем элементы
        this.modal = document.querySelector('#auth-modal');
        this.closeBtn = this.modal.querySelector('.close');
        this.loginBtn = document.querySelector('#login-btn');
        this.logoutBtn = document.querySelector('#logout-btn');
        this.loginForm = this.modal.querySelector('#login-form');
        this.registerForm = this.modal.querySelector('#register-form');
        this.showLoginBtn = this.modal.querySelector('#show-login-link');
        this.showRegisterBtn = this.modal.querySelector('#show-register-link');
        this.loginFormContent = this.modal.querySelector('#login-form-content');
        this.registerFormContent = this.modal.querySelector('#register-form-content');
        
        // Проверяем наличие всех элементов
        if (!this.modal || !this.closeBtn || !this.loginBtn || !this.loginForm || !this.registerForm || 
            !this.showRegisterBtn || !this.showLoginBtn || !this.loginFormContent || !this.registerFormContent) {
            console.error('LoginModal: Missing required elements');
            console.log('Elements:', {
                modal: !!this.modal,
                closeBtn: !!this.closeBtn,
                loginBtn: !!this.loginBtn,
                loginForm: !!this.loginForm,
                registerForm: !!this.registerForm,
                showRegisterBtn: !!this.showRegisterBtn,
                showLoginBtn: !!this.showLoginBtn,
                loginFormContent: !!this.loginFormContent,
                registerFormContent: !!this.registerFormContent
            });
            return;
        }
        
        // Инициализируем элементы ошибок
        this.loginError = this.modal.querySelector('.error-message');
        this.registerError = this.modal.querySelector('.error-message');
        
        // Инициализируем элементы ошибок
        this.loginError = this.modal.querySelector('#login-error');
        this.registerError = this.modal.querySelector('#register-error');

        // Флаг для предотвращения двойной отправки
        this.isSubmitting = false;

        // Инициализируем обработчики событий
        this.initEventListeners();

        // Проверяем авторизацию при загрузке
        this.checkAuth();
    }

    initEventListeners() {
        // Обработчик закрытия модального окна
        this.closeBtn.addEventListener('click', () => this.hide());
        
        // Обработчик клика по модальному окну
        this.modal.addEventListener('click', (e) => {
            // Проверяем, что клик был именно на фоне модального окна
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
        // Обработчики переключения между формами
        this.showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginForm.classList.remove('active');
            this.registerForm.classList.add('active');
        });
        
        this.showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginForm.classList.add('active');
            this.registerForm.classList.remove('active');
        });
        
        // Обработчики форм
        this.loginFormContent.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Обработчик формы регистрации
        if (this.registerFormContent) {
            this.registerFormContent.onsubmit = async (e) => {
            e.preventDefault();
                e.stopPropagation();
            
            if (this.isSubmitting) {
                return;
            }

                this.isSubmitting = true;
                const submitBtn = this.registerForm.querySelector('.auth-submit');
            
                try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Регистрация...';
            }
            
                await this.handleRegister();
                } catch (error) {
                    console.error('Ошибка при регистрации:', error);
            } finally {
                this.isSubmitting = false;
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Зарегистрироваться';
                    }
            }
            };
        }
        
        // Обработчики ввода номера телефона
        const phoneInputs = [this.loginForm.querySelector('#login-phone-field'),
                            this.registerForm.querySelector('#register-phone-field')];

        phoneInputs.forEach(input => {
            if (input) {
                // Обработчик ввода
                input.addEventListener('input', (e) => {
                    this.formatPhoneInput(e.target);
                });

                // Обработчик нажатия Backspace
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace') {
                        // Получаем текущее значение и позицию курсора
                        const value = input.value;
                        const cursorPos = input.selectionStart;
                        
                        // Если удаляем последний символ и поле содержит только +7
                        if (value === '+7') {
                            e.preventDefault();
                            input.value = '';
                            input.setSelectionRange(0, 0);
                            return;
                        }
                        
                        // Если курсор находится на символе разделителя
                        const separators = ['(', ')', ' ', '-'];
                        if (separators.includes(value[cursorPos - 1])) {
                            e.preventDefault();
                            // Перемещаем курсор на один символ назад
                            input.setSelectionRange(cursorPos - 1, cursorPos - 1);
                        }
                    }
                });
            }
        });

        // Обработчик клика по документу для закрытия модального окна
        document.addEventListener('click', (e) => {
            // Проверяем, что клик был вне модального окна
            if (
                this.modal.classList.contains('active') &&
                !this.modal.contains(e.target) &&
                !this.loginBtn.contains(e.target)
            ) {
                this.hide();
            }
        });

        // Обработчик для кнопки входа
        if (this.loginBtn) {
            this.loginBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.show();
                return false;
            };
        }

        // Обработчик для кнопки выхода
        if (this.logoutBtn) {
            this.logoutBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
                return false;
            };
        }
    }

    show() {
        if (!this.modal) return;

        // Запрещаем прокрутку страницы
        document.body.style.overflow = 'hidden';
        
        // Показываем модальное окно
        this.modal.style.display = 'block';
        
        // Добавляем класс active после установки стилей
        requestAnimationFrame(() => {
            this.modal.classList.add('active');
        });
    }

    hide() {
        if (!this.modal) return;

        // Разрешаем прокрутку страницы
        document.body.style.overflow = '';
        
        // Сначала убираем класс active
        this.modal.classList.remove('active');
        
        // Затем скрываем через requestAnimationFrame
        requestAnimationFrame(() => {
            const modalContent = this.modal.querySelector('.auth-modal-content');
            modalContent.style.transform = 'scale(0.95)';
            
            requestAnimationFrame(() => {
                this.modal.style.display = 'none';
                modalContent.style.transform = '';
            });
        });
    }

    async handleLogin() {
        const phone = this.loginForm.querySelector('#login-phone-field').value.trim();
        const password = this.loginForm.querySelector('#login-password-field').value.trim();
        
        // Проверяем введенные данные
        if (!phone || !password) {
            this.showError('Пожалуйста, заполните все поля');
            return;
        }

        // Форматируем номер телефона
        const formattedPhone = phone.replace(/[\D]/g, '');
        
        // Проверяем формат номера
        if (formattedPhone.length !== 11) {
            this.showError('Номер телефона должен содержать 11 цифр');
            return;
        }
        
        try {
            console.log('Отправка запроса на вход:', { phone: formattedPhone });
            
            const response = await fetch('http://localhost:8001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: formattedPhone,
                    password: password
                })
            });

            console.log('Получен ответ от сервера:', response.status);
            const data = await response.json();
            console.log('Данные ответа:', data);

            if (response.ok) {
                // Сохраняем токен в куки на 30 дней
                setCookie('auth_token', data.access_token, 30);
                this.hide();
                this.updateUIAfterLogin();
                this.showSuccess('Вход выполнен успешно');
            } else {
                // Проверяем тип ошибки
                if (data.detail === 'User not found') {
                    this.showError('Пользователь с таким номером не зарегистрирован');
                } else if (data.detail === 'Incorrect password') {
                    this.showError('Неверный пароль');
                    } else {
                    console.log('Неизвестная ошибка:', data);
                    this.showError(data.detail || 'Ошибка входа');
                }
            }
        } catch (error) {
            console.error('Ошибка при входе:', error);
            this.showError('Ошибка при попытке входа');
        }
    }

    // Форматирование номера телефона
    formatPhoneInput(input) {
        // Получаем текущее значение и удаляем все, кроме цифр
        const rawValue = input.value.replace(/\D/g, '');
        
        // Получаем текущую позицию курсора
        const cursorPos = input.selectionStart;
        
        // Если удаляем последний символ, проверяем, не пустое ли поле
        if (input.value.length === 1 && rawValue.length === 0) {
            input.value = '+7';
            return;
        }

        // Если удаляем символы в начале, оставляем только +7
        if (input.value.length === 4 && rawValue.length === 0) {
            input.value = '+7';
            return;
        }

        // Если поле пустое, устанавливаем +7
        if (rawValue.length === 0) {
            input.value = '+7';
            return;
        }

        // Форматируем номер
        let formatted = '+7 (' + rawValue.slice(1, 4) + ') ';
        if (rawValue.length > 4) formatted += rawValue.slice(4, 7) + '-';
        if (rawValue.length > 7) formatted += rawValue.slice(7, 9) + '-';
        if (rawValue.length > 9) formatted += rawValue.slice(9, 11);
        
        input.value = formatted;

        // Проверяем длину номера и показываем/скрываем подсказку
        const helpText = input.nextElementSibling;
        if (helpText && rawValue.length >= 10) {
            helpText.style.display = 'none';
        } else if (helpText) {
            helpText.style.display = 'block';
        }

        // Устанавливаем курсор в конец поля
        const pos = input.value.length;
        input.setSelectionRange(pos, pos);
    }

    async handleRegister() {
            // Получаем значения полей
            const phoneField = document.getElementById('register-phone-field');
            const passwordField = document.getElementById('register-password-field');
            const confirmPasswordField = document.getElementById('register-confirm-field');

        if (!phoneField || !passwordField || !confirmPasswordField) {
                throw new Error('Form elements not found');
            }

            const phone = phoneField.value.trim();
            const password = passwordField.value.trim();
            const confirmPassword = confirmPasswordField.value.trim();

        // Проверяем, что все поля заполнены
        if (!phone || !password || !confirmPassword) {
            this.showError('Пожалуйста, заполните все поля');
            return;
        }

            // Форматируем номер телефона
            const formattedPhone = phone.replace(/[^\d]/g, '');
            
            // Проверяем формат номера
            if (formattedPhone.length !== 11) {
                this.showError('Номер телефона должен содержать 11 цифр');
            return;
            }

            // Проверяем, начинается ли номер с 7
            if (formattedPhone[0] !== '7') {
                this.showError('Номер телефона должен начинаться с 7');
            return;
            }

            // Проверка совпадения паролей
            if (password !== confirmPassword) {
                this.showError('Пароли не совпадают');
                return;
            }

            try {
            console.log('Отправка запроса на регистрацию:', { phone: formattedPhone });
            
                const response = await fetch('http://127.0.0.1:8001/register', {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        phone: formattedPhone,
                        password: password
                    })
                });

            console.log('Получен ответ от сервера:', response.status);
                const data = await response.json();
            console.log('Данные ответа:', data);
                
                if (!response.ok) {
                // Проверяем тип ошибки
                if (data.detail && data.detail.includes('already registered')) {
                    this.showError('Пользователь с таким номером уже зарегистрирован');
                } else {
                    this.showError(data.detail || 'Ошибка регистрации');
                }
                return;
            }

                // Сохраняем токен
            setCookie('auth_token', data.access_token, 7);

                // Показываем сообщение успеха
                this.showSuccess('Успешная регистрация!');

                // Закрываем модальное окно
                this.hide();

                // Обновляем UI
                this.updateUIAfterLogin();

        } catch (error) {
            console.error('Ошибка при регистрации:', error);
            this.showError('Произошла ошибка при регистрации. Попробуйте позже.');
        }
    }

    // Добавляем метод для обновления UI после входа
    updateUIAfterLogin() {
        // Обновляем UI после успешного входа
        if (this.loginBtn) {
            this.loginBtn.style.display = 'none';
        }
        if (this.logoutBtn) {
            this.logoutBtn.style.display = 'block';
        }

        // Показываем фильтры и вкладку избранного
        const filterBtn = document.getElementById('filter-btn');
        const tabFav = document.getElementById('tab-fav');
        
        if (filterBtn) {
            filterBtn.style.display = 'block';
            // Добавляем обработчик для кнопки фильтров
            filterBtn.addEventListener('click', () => {
                const filterSidebar = document.getElementById('filter-sidebar');
                const filterSidebarOverlay = document.getElementById('filter-sidebar-overlay');
                if (filterSidebar && filterSidebarOverlay) {
                    filterSidebar.style.display = 'block';
                    filterSidebarOverlay.style.display = 'block';
                    setTimeout(() => {
                        filterSidebar.style.transform = 'translateX(0)';
                        filterSidebarOverlay.style.background = 'rgba(16,18,20,0.18)';
                    }, 10);
                }
            });
        }
        if (tabFav) {
            tabFav.style.display = 'block';
        }
    }

    handleLogout() {
        // Удаляем токен из куки
        deleteCookie('auth_token');
        // Обновляем UI
        this.updateUIAfterLogout();
    }

    // Добавляем метод для обновления UI после выхода
    updateUIAfterLogout() {
        if (this.loginBtn) {
            this.loginBtn.style.display = 'block';
        }
        if (this.logoutBtn) {
            this.logoutBtn.style.display = 'none';
        }

        // Скрываем фильтры и вкладку избранного
        const filterBtn = document.getElementById('filter-btn');
        const tabFav = document.getElementById('tab-fav');
        
        if (filterBtn) {
            filterBtn.style.display = 'none';
        }
        if (tabFav) {
            tabFav.style.display = 'none';
        }

        // Если активна вкладка избранного, переключаемся на главную
        if (tabFav && tabFav.classList.contains('active')) {
            const tabRec = document.getElementById('tab-rec');
            if (tabRec) {
                tabRec.click();
            }
        }
    }

    // Добавляем метод для проверки авторизации при загрузке
    checkAuth() {
        const token = getCookie('auth_token');
        if (token) {
            this.updateUIAfterLogin();
        } else {
            this.updateUIAfterLogout();
        }
    }

    showError(message) {
        console.log('Показываем ошибку:', message);
        // Находим активную форму (login или register)
        const activeForm = this.modal.querySelector('.auth-form.active');
        if (!activeForm) {
            console.error('Активная форма не найдена');
            return;
        }
        
        // Ищем элемент сообщения в активной форме
        const messageElement = activeForm.querySelector('.message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.remove('success-message');
            messageElement.classList.add('error-message');
            messageElement.style.display = 'block';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        } else {
            console.error('Элемент для сообщения об ошибке не найден в активной форме');
        }
    }

    showSuccess(message) {
        // Находим активную форму (login или register)
        const activeForm = this.modal.querySelector('.auth-form.active');
        if (!activeForm) {
            console.error('Активная форма не найдена');
            return;
            }
        
        // Ищем элемент сообщения в активной форме
        const messageElement = activeForm.querySelector('.message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.remove('error-message');
            messageElement.classList.add('success-message');
            messageElement.style.display = 'block';
            
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        } else {
            console.error('Элемент для сообщения об успехе не найден в активной форме');
        }
    }

    destroy() {
        // Удаляем все обработчики событий
        this.closeBtn.removeEventListener('click', () => {});
        this.modal.removeEventListener('click', () => {});
        this.showRegisterBtn.removeEventListener('click', () => {});
        this.showLoginBtn.removeEventListener('click', () => {});
        
        // Скрываем модальное окно
        this.hide();
    }
}

// Инициализация модального окна при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.loginModal = new LoginModal();
});


