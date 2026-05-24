// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API-маршруты
app.use('/api', authRoutes);

// --- Главная страница (start-window) ---
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Анапа-Смета – строительные сметы</title>
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
        .feature-icon { font-size: 2.5rem; color: #0d6efd; }
        .feature-card {
          transition: transform 0.2s;
          border: none;
          border-radius: 15px;
          background: rgba(255,255,255,0.7);
          backdrop-filter: blur(4px);
        }
        .feature-card:hover { transform: translateY(-5px); }
        .slogan { font-weight: 300; color: #2c3e50; }
        footer { margin-top: auto; }
      </style>
    </head>
    <body>
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark bg-opacity-75 sticky-top">
        <div class="container">
          <a class="navbar-brand fw-bold" href="/">🏗️ Анапа-Смета</a>
          <div class="d-flex">
            <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">Войти</button>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#registerModal">Зарегистрироваться</button>
          </div>
        </div>
      </nav>

      <main class="container flex-grow-1">
        <div class="hero-section text-center">
          <h1 class="display-4 fw-bold mb-3">Анапа-Смета</h1>
          <p class="lead slogan mb-2">Точные сметы – залог успешного строительства</p>
          <p class="text-muted slogan">Создано специально для компании «Анапа-Строй»</p>
          <hr class="my-4">
          <p class="fs-5">Профессиональная информационная система для составления, расчёта и проверки строительных смет. Надёжный инструмент, объединяющий нормативные базы, ресурсный метод и индексацию.</p>
        </div>

        <div class="row g-4 mt-4 pb-5">
          <div class="col-md-6 col-lg-4"><div class="card feature-card p-4 h-100 text-center"><div class="feature-icon mb-3">📐</div><h5 class="card-title">Локальные и объектные сметы</h5><p class="card-text text-muted">Создание смет по разделам, использование готовых нормативов (ФЕР, ГЭСН, ТЕР), автоматический расчёт прямых затрат, накладных расходов и сметной прибыли.</p></div></div>
          <div class="col-md-6 col-lg-4"><div class="card feature-card p-4 h-100 text-center"><div class="feature-icon mb-3">📋</div><h5 class="card-title">Ресурсный расчёт</h5><p class="card-text text-muted">Учёт материалов, машин и механизмов, трудозатрат. Автоматическое разложение расценок на составляющие с подстановкой текущих цен.</p></div></div>
          <div class="col-md-6 col-lg-4"><div class="card feature-card p-4 h-100 text-center"><div class="feature-icon mb-3">📈</div><h5 class="card-title">Индексация и текущие цены</h5><p class="card-text text-muted">Применение индексов пересчёта по статьям затрат. Обновление цен на ресурсы в реальном времени, формирование ведомостей текущих цен.</p></div></div>
          <div class="col-md-6 col-lg-4"><div class="card feature-card p-4 h-100 text-center"><div class="feature-icon mb-3">📊</div><h5 class="card-title">Аналитика и отчёты</h5><p class="card-text text-muted">Вывод смет в Excel, PDF. Сравнение базовых и текущих стоимостей, построение графиков структуры затрат.</p></div></div>
          <div class="col-md-6 col-lg-4"><div class="card feature-card p-4 h-100 text-center"><div class="feature-icon mb-3">🔐</div><h5 class="card-title">Ролевой доступ</h5><p class="card-text text-muted">Администратор, сметчик, наблюдатель. Гибкие права на просмотр, редактирование и утверждение документов.</p></div></div>
          <div class="col-md-6 col-lg-4"><div class="card feature-card p-4 h-100 text-center"><div class="feature-icon mb-3">☁️</div><h5 class="card-title">Облачная синхронизация</h5><p class="card-text text-muted">Работайте с любого устройства. Все данные хранятся в единой базе MySQL, доступной через веб-интерфейс.</p></div></div>
        </div>
      </main>

      <footer class="bg-dark text-white text-center py-3 mt-auto">
        <div class="container">&copy; 2025 ООО «Анапа-Строй». ИС «Анапа-Смета».</div>
      </footer>

      <!-- Модальное окно "Войти" -->
      <div class="modal fade" id="loginModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Вход в систему</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <form id="loginForm">
                <div class="mb-3"><label class="form-label">Логин</label><input type="text" class="form-control" id="loginUsername" required></div>
                <div class="mb-3"><label class="form-label">Пароль</label><input type="password" class="form-control" id="loginPassword" required></div>
                <button type="submit" class="btn btn-primary w-100">Войти</button>
              </form>
              <div class="mt-2 text-center"><small>Нет аккаунта? <a href="#" data-bs-toggle="modal" data-bs-target="#registerModal" data-bs-dismiss="modal">Зарегистрируйтесь</a></small></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно "Регистрация" -->
      <div class="modal fade" id="registerModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Регистрация</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
            <div class="modal-body">
              <form id="registerForm">
                <div class="mb-3"><label class="form-label">Полное имя</label><input type="text" class="form-control" id="regFullname" required></div>
                <div class="mb-3"><label class="form-label">Логин</label><input type="text" class="form-control" id="regUsername" required></div>
                <div class="mb-3"><label class="form-label">Пароль</label><input type="password" class="form-control" id="regPassword" required minlength="6"></div>
                <div class="mb-3"><label class="form-label">Роль</label><select class="form-select" id="regRole"><option value="estimator">Сметчик</option><option value="viewer">Наблюдатель</option></select></div>
                <button type="submit" class="btn btn-success w-100">Зарегистрироваться</button>
              </form>
              <div class="mt-2 text-center"><small>Уже есть аккаунт? <a href="#" data-bs-toggle="modal" data-bs-target="#loginModal" data-bs-dismiss="modal">Войдите</a></small></div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        // Логин
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('loginUsername').value;
          const password = document.getElementById('loginPassword').value;
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
          });
          const data = await res.json();
          if (data.success) {
            window.location.href = data.redirect;
          } else {
            alert(data.message || 'Ошибка входа');
          }
        });

        // Регистрация
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const fullname = document.getElementById('regFullname').value;
          const username = document.getElementById('regUsername').value;
          const password = document.getElementById('regPassword').value;
          const role = document.getElementById('regRole').value;
          const res = await fetch('/api/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ fullname, username, password, role })
          });
          const data = await res.json();
          if (data.success) {
            window.location.href = data.redirect;
          } else {
            alert(data.message || 'Ошибка регистрации');
          }
        });
      </script>
    </body>
    </html>
  `);
});

// --- Личный кабинет (защищён) ---
app.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Получаем сметы текущего пользователя
    const [estimates] = await pool.query(
      `SELECT id, type, number, name, date, total_base_cost, total_current_cost, status, created_at
       FROM estimates
       WHERE created_by = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Генерация HTML личного кабинета
    const html = generateDashboardHTML(req.user, estimates);
    res.send(html);
  } catch (err) {
    console.error('Ошибка загрузки личного кабинета:', err);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

function generateDashboardHTML(user, estimates) {
  const now = new Date().toLocaleDateString('ru-RU');

  // Строка с таблицей смет
  let estimatesRows = '';
  if (estimates.length === 0) {
    estimatesRows = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">У вас пока нет ни одной сметы. Нажмите «Создать смету», чтобы начать.</td>
      </tr>`;
  } else {
    estimatesRows = estimates.map(est => {
      const date = est.date ? new Date(est.date).toLocaleDateString('ru-RU') : '—';
      const created = new Date(est.created_at).toLocaleString('ru-RU');
      const baseCost = Number(est.total_base_cost).toLocaleString('ru-RU', { minimumFractionDigits: 2 });
      const curCost = Number(est.total_current_cost).toLocaleString('ru-RU', { minimumFractionDigits: 2 });
      const statusBadge = {
        'черновик': 'bg-secondary',
        'утверждена': 'bg-success',
        'архив': 'bg-warning text-dark'
      }[est.status] || 'bg-light text-dark';

      return `
        <tr>
          <td>${est.number || '—'}</td>
          <td>${est.name}</td>
          <td><span class="badge bg-info">${est.type}</span></td>
          <td>${date}</td>
          <td class="text-end">${baseCost} ₽</td>
          <td class="text-end">${curCost} ₽</td>
          <td><span class="badge ${statusBadge}">${est.status}</span></td>
        </tr>`;
    }).join('');
  }

  return `
  <!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Личный кабинет – Анапа-Смета</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
      body { background: #f4f6f9; }
      .navbar { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .card { border: none; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    </style>
  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="/dashboard">🏗️ Анапа-Смета</a>
        <div class="d-flex align-items-center">
          <span class="text-white me-3">👤 ${user.full_name} (${user.role === 'admin' ? 'Администратор' : user.role === 'estimator' ? 'Сметчик' : 'Наблюдатель'})</span>
          <a href="/api/logout" class="btn btn-outline-light btn-sm">Выйти</a>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <!-- Приветствие -->
      <div class="card mb-4">
        <div class="card-body">
          <h4 class="card-title mb-0">Добро пожаловать, ${user.full_name}!</h4>
          <p class="text-muted">Сегодня: ${now}</p>
        </div>
      </div>

      <!-- Сметы -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center bg-white">
          <h5 class="mb-0">📄 Мои сметы</h5>
          <button class="btn btn-success btn-sm" onclick="alert('Создание сметы будет реализовано позже')">+ Новая смета</button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Номер</th>
                  <th>Наименование</th>
                  <th>Тип</th>
                  <th>Дата</th>
                  <th class="text-end">Базовая стоимость</th>
                  <th class="text-end">Текущая стоимость</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                ${estimatesRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </body>
  </html>`;
}

app.listen(PORT, () => {
  console.log(`✅ Сервер «Анапа-Смета» запущен на http://localhost:${PORT}`);
});