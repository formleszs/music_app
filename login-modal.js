        // Инициализация модального окна при загрузке страницы
class LoginModal {
    constructor() {
        // Инициализируем элементы
        this.modal = document.getElementById('auth-modal');
        this.closeBtn = this.modal.querySelector('.close');
        this.loginBtn = document.getElementById('login-btn');
        this.loginForm = this.modal.querySelector('#login-form');
        this.registerForm = this.modal.querySelector('#register-form');
        this.showRegisterBtn = this.modal.querySelector('#show-register-link');
        this.showLoginBtn = this.modal.querySelector('#show-login-link');
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

        // Инициализируем обработчики событий
        this.initEventListeners();
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
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
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

    handleLogin() {
        const phone = this.loginForm.querySelector('#login-phone-field').value;
        const password = this.loginForm.querySelector('#login-password-field').value;
        
        // Проверяем введенные данные
        if (!phone || !password) {
            this.showError('Пожалуйста, заполните все поля');
            return;
        }

        // Валидация номера телефона
        const phoneRegex = /^\+?[78]\d{10}$/;
        if (!phoneRegex.test(phone)) {
            this.showError('Неверный формат номера телефона');
            return;
        }

        // Здесь можно добавить логику аутентификации
        console.log('Login attempt:', { phone, password });
        
        // После успешного входа
        this.hide();
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

    initEventListeners() {
        // Обработчик закрытия модального окна
        this.closeBtn.addEventListener('click', () => this.hide());
        
        // Обработчик клика по модальному окну
        this.modal.addEventListener('click', (e) => {
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
        
        this.registerFormContent.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

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
            if (
                this.modal.classList.contains('active') &&
                !this.modal.contains(e.target) &&
                !this.loginBtn.contains(e.target)
            ) {
                this.hide();
            }
        });
    }

    handleRegister() {
        const phone = this.registerForm.querySelector('#register-phone-field').value;
        const password = this.registerForm.querySelector('#register-password-field').value;
        const confirmPassword = this.registerForm.querySelector('#register-confirm-field').value;
        
        // Проверяем введенные данные
        if (!phone || !password || !confirmPassword) {
            this.showError('Пожалуйста, заполните все поля');
            return;
        }

        // Валидация номера телефона
        const phoneRegex = /^\+?[78]\d{10}$/;
        if (!phoneRegex.test(phone)) {
            this.showError('Неверный формат номера телефона');
            return;
        }

        // Проверка совпадения паролей
        if (password !== confirmPassword) {
            this.showError('Пароли не совпадают');
            return;
        }

        // Здесь можно добавить логику регистрации
        console.log('Registration attempt:', { phone, password });
        
        // После успешной регистрации
        this.hide();
    }

    showError(message) {
        const errorElement = this.modal.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Скрываем сообщение об ошибки через 3 секунды
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
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
