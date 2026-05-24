// start-window.js
// Главный интерфейс и точка входа в ИС «Анапа-Смета»

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Отдача статических файлов (если понадобятся локальные CSS/JS/изображения)
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница – витрина системы
app.get('/', (req, res) => {
  // HTML-код главного окна
  const startWindowHTML = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Анапа-Смета – программа для строительных смет</title>
      <!-- Bootstrap 5 для быстрой стилизации -->
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero-section {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(5px);
          border-radius: 20px;
          padding: 3rem 2rem;
          margin-top: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .feature-icon {
          font-size: 2.5rem;
          color: #0d6efd;
        }
        .feature-card {
          transition: transform 0.2s;
          border: none;
          border-radius: 15px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(4px);
        }
        .feature-card:hover {
          transform: translateY(-5px);
        }
        .slogan {
          font-weight: 300;
          color: #2c3e50;
        }
        footer {
          margin-top: auto;
        }
      </style>
    </head>
    <body>
      <!-- Навигационная панель -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-75 sticky-top">
        <div class="container">
          <a class="navbar-brand fw-bold" href="/">
            🏗️ Анапа-Смета
          </a>
          <div class="d-flex">
            <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
              Войти
            </button>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">
              Зарегистрироваться
            </button>
          </div>
        </div>
      </nav>

      <!-- Основной контент -->
      <main class="container flex-grow-1">
        <div class="hero-section text-center">
          <h1 class="display-4 fw-bold mb-3">Анапа-Смета</h1>
          <p class="lead slogan mb-2">Точные сметы – залог успешного строительства</p>
          <p class="text-muted slogan">Создано специально для компании «Анапа-Строй»</p>
          <hr class="my-4">
          <p class="fs-5">
            Профессиональная информационная система для составления, расчёта и проверки строительных смет.
            Надёжный инструмент, объединяющий нормативные базы, ресурсный метод и индексацию.
          </p>
        </div>

        <!-- Возможности системы -->
        <div class="row g-4 mt-4 pb-5">
          <div class="col-md-6 col-lg-4">
            <div class="card feature-card p-4 h-100 text-center">
              <div class="feature-icon mb-3">📐</div>
              <h5 class="card-title">Локальные и объектные сметы</h5>
              <p class="card-text text-muted">Создание смет по разделам, использование готовых нормативов (ФЕР, ГЭСН, ТЕР), автоматический расчёт прямых затрат, накладных расходов и сметной прибыли.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card feature-card p-4 h-100 text-center">
              <div class="feature-icon mb-3">📋</div>
              <h5 class="card-title">Ресурсный расчёт</h5>
              <p class="card-text text-muted">Учёт материалов, машин и механизмов, трудозатрат. Автоматическое разложение расценок на составляющие с подстановкой текущих цен.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card feature-card p-4 h-100 text-center">
              <div class="feature-icon mb-3">📈</div>
              <h5 class="card-title">Индексация и текущие цены</h5>
              <p class="card-text text-muted">Применение индексов пересчёта по статьям затрат. Обновление цен на ресурсы в реальном времени, формирование ведомостей текущих цен.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card feature-card p-4 h-100 text-center">
              <div class="feature-icon mb-3">📊</div>
              <h5 class="card-title">Аналитика и отчёты</h5>
              <p class="card-text text-muted">Вывод смет в Excel, PDF. Сравнение базовых и текущих стоимостей, построение графиков структуры затрат.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card feature-card p-4 h-100 text-center">
              <div class="feature-icon mb-3">🔐</div>
              <h5 class="card-title">Ролевой доступ</h5>
              <p class="card-text text-muted">Администратор, сметчик, наблюдатель. Гибкие права на просмотр, редактирование и утверждение документов.</p>
            </div>
          </div>
          <div class="col-md-6 col-lg-4">
            <div class="card feature-card p-4 h-100 text-center">
              <div class="feature-icon mb-3">☁️</div>
              <h5 class="card-title">Облачная синхронизация</h5>
              <p class="card-text text-muted">Работайте с любого устройства. Все данные хранятся в единой базе MySQL, доступной через веб-интерфейс.</p>
            </div>
          </div>
        </div>
      </main>

      <!-- Футер -->
      <footer class="bg-dark text-white text-center py-3 mt-auto">
        <div class="container">
          &copy; 2025 ООО «Анапа-Строй». Информационная система «Анапа-Смета». Все права защищены.
        </div>
      </footer>

      <!-- Модальное окно "Войти" -->
      <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="loginModalLabel">Вход в систему</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
              <form id="loginForm">
                <div class="mb-3">
                  <label for="loginUsername" class="form-label">Имя пользователя</label>
                  <input type="text" class="form-control" id="loginUsername" required>
                </div>
                <div class="mb-3">
                  <label for="loginPassword" class="form-label">Пароль</label>
                  <input type="password" class="form-control" id="loginPassword" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Войти</button>
              </form>
              <div class="mt-2 text-center">
                <small>Нет аккаунта? <a href="#" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">Зарегистрируйтесь</a></small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно "Регистрация" -->
      <div class="modal fade" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="registerModalLabel">Регистрация</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
            </div>
            <div class="modal-body">
              <form id="registerForm">
                <div class="mb-3">
                  <label for="regFullname" class="form-label">Полное имя</label>
                  <input type="text" class="form-control" id="regFullname" required>
                </div>
                <div class="mb-3">
                  <label for="regUsername" class="form-label">Логин</label>
                  <input type="text" class="form-control" id="regUsername" required>
                </div>
                <div class="mb-3">
                  <label for="regPassword" class="form-label">Пароль</label>
                  <input type="password" class="form-control" id="regPassword" required minlength="6">
                </div>
                <div class="mb-3">
                  <label for="regRole" class="form-label">Роль</label>
                  <select class="form-select" id="regRole">
                    <option value="estimator">Сметчик</option>
                    <option value="viewer">Наблюдатель</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-success w-100">Зарегистрироваться</button>
              </form>
              <div class="mt-2 text-center">
                <small>Уже есть аккаунт? <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Войдите</a></small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bootstrap JS + Popper (для модальных окон) -->
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        // Обработчики форм (пока только заглушки, в будущем – отправка на сервер)
        document.getElementById('loginForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;
          alert('Вход в систему будет реализован позже.\\nЛогин: ' + username);
          // Здесь будет fetch('/api/login', ...)
        });
        document.getElementById('registerForm').addEventListener('submit', function(e) {
          e.preventDefault();
          const fullname = document.getElementById('regFullname').value;
          const username = document.getElementById('regUsername').value;
          const password = document.getElementById('regPassword').value;
          const role = document.getElementById('regRole').value;
          alert('Регистрация будет реализована позже.\\nПользователь: ' + username + ', роль: ' + role);
          // Здесь будет fetch('/api/register', ...)
        });
      </script>
    </body>
    </html>
  `;
  res.send(startWindowHTML);
});

// Здесь позже будут подключаться маршруты API:
// const authRoutes = require('./routes/auth');
// app.use('/api', authRoutes);
// const estimatesRoutes = require('./routes/estimates');
// app.use('/api/estimates', estimatesRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Сервер «Анапа-Смета» запущен на http://localhost:${PORT}`);
  console.log('Откройте браузер и перейдите по указанному адресу.');
});