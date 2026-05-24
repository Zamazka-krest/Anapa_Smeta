// init-db.js
// Инициализация базы данных MySQL для ИС «Анапа-Смета»
// Требуется: Node.js, установленный пакет mysql2 (npm install mysql2)

const mysql = require('mysql2/promise');

// Параметры подключения к серверу MySQL
const DB_CONFIG = {
  host: 'localhost',
  user: 'root',          
  password: '',  
  multipleStatements: true, // разрешить выполнение нескольких запросов за раз
};

const DB_NAME = 'anapa_smeta';

async function initDatabase() {
  // 1. Подключаемся к MySQL без указания БД
  const connection = await mysql.createConnection(DB_CONFIG);
  console.log('Подключение к MySQL установлено.');

  try {
    // 2. Создаём базу данных, если её нет
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`База данных "${DB_NAME}" готова.`);

    // 3. Переключаемся на созданную БД
    await connection.query(`USE \`${DB_NAME}\`;`);

    // 4. Создание таблиц (если не существуют)
    // Порядок важен из-за внешних ключей

    // Единицы измерения
    await connection.query(`
      CREATE TABLE IF NOT EXISTS units (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Пользователи системы
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        role ENUM('admin', 'estimator', 'viewer') NOT NULL DEFAULT 'estimator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Виды работ (для привязки норм накладных расходов и сметной прибыли)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS work_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        overhead_percent DECIMAL(5,2) DEFAULT 0 COMMENT 'Норма НР по умолчанию, %',
        profit_percent DECIMAL(5,2) DEFAULT 0 COMMENT 'Норма СП по умолчанию, %'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Сборники нормативов (ФЕР, ГЭСН, ТЕР и т.п.)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS norm_collections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Шифр сборника, например ФЕР08',
        name VARCHAR(255) NOT NULL,
        year INT COMMENT 'Год издания базовых цен'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Расценки (нормативы)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS norms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        collection_id INT NOT NULL,
        code VARCHAR(30) NOT NULL COMMENT 'Полный шифр нормы, например ФЕР08-01-001-01',
        name VARCHAR(500) NOT NULL,
        unit_id INT NOT NULL,
        work_type_id INT COMMENT 'Привязка к виду работ (для НР/СП)',
        base_salary DECIMAL(15,2) DEFAULT 0 COMMENT 'Оплата труда рабочих в базовых ценах',
        base_machinery DECIMAL(15,2) DEFAULT 0 COMMENT 'Эксплуатация машин в базовых ценах',
        base_materials DECIMAL(15,2) DEFAULT 0 COMMENT 'Материалы в базовых ценах',
        total_base DECIMAL(15,2) DEFAULT 0 COMMENT 'Всего прямые затраты в базовых ценах',
        labor_hours DECIMAL(10,4) DEFAULT 0 COMMENT 'Затраты труда рабочих, чел.-ч',
        UNIQUE KEY (collection_id, code),
        FOREIGN KEY (collection_id) REFERENCES norm_collections(id) ON DELETE RESTRICT,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
        FOREIGN KEY (work_type_id) REFERENCES work_types(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Справочник ресурсов (материалы, машины, механизмы, трудовые ресурсы)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(300) NOT NULL,
        unit_id INT NOT NULL,
        resource_type ENUM('материал','машина','механизм','рабочий') NOT NULL DEFAULT 'материал',
        base_price DECIMAL(15,2) DEFAULT 0 COMMENT 'Цена в базовом уровне',
        price_date DATE COMMENT 'Дата, на которую актуальна base_price',
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Состав ресурсов нормы (привязка ресурсов к расценке)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS norm_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        norm_id INT NOT NULL,
        resource_id INT NOT NULL,
        quantity DECIMAL(15,6) NOT NULL DEFAULT 0 COMMENT 'Расход ресурса на единицу нормы',
        unit_id INT NOT NULL COMMENT 'Единица измерения в составе (может отличаться от справочной)',
        FOREIGN KEY (norm_id) REFERENCES norms(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Объекты строительства (проекты)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(300) NOT NULL,
        address VARCHAR(500),
        customer VARCHAR(300),
        start_date DATE,
        end_date DATE,
        status ENUM('проект','активный','завершён','архив') DEFAULT 'проект',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Сметы
    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        type ENUM('локальная','объектная','сводный сметный расчёт') NOT NULL DEFAULT 'локальная',
        number VARCHAR(30) COMMENT 'Номер сметы',
        name VARCHAR(300) NOT NULL,
        date DATE,
        base_price_level YEAR COMMENT 'Базовый уровень цен, например 2001',
        current_price_level DATE COMMENT 'Дата текущих цен',
        total_base_cost DECIMAL(15,2) DEFAULT 0,
        total_current_cost DECIMAL(15,2) DEFAULT 0,
        status ENUM('черновик','утверждена','архив') DEFAULT 'черновик',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Разделы сметы
    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimate_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estimate_id INT NOT NULL,
        parent_section_id INT DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_section_id) REFERENCES estimate_sections(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Позиции сметы (строки)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimate_positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        section_id INT NOT NULL,
        norm_id INT DEFAULT NULL COMMENT 'Ссылка на норму, если позиция взята из сборника',
        position_type ENUM('расценка','материал','оборудование','услуга','прочее') DEFAULT 'расценка',
        code VARCHAR(50) COMMENT 'Шифр позиции (может быть унаследован от нормы или задан вручную)',
        name VARCHAR(500) NOT NULL,
        unit_id INT NOT NULL,
        quantity DECIMAL(15,6) NOT NULL DEFAULT 1,
        base_price_per_unit DECIMAL(15,2) DEFAULT 0 COMMENT 'Базовая цена за единицу',
        base_labor DECIMAL(15,2) DEFAULT 0,
        base_machinery DECIMAL(15,2) DEFAULT 0,
        base_materials DECIMAL(15,2) DEFAULT 0,
        base_total DECIMAL(15,2) DEFAULT 0 COMMENT 'Прямые затраты в базовых ценах, сумма',
        -- накладные расходы и сметная прибыль
        overhead_percent DECIMAL(5,2) DEFAULT NULL COMMENT 'Индивидуальный % НР, если отличается от вида работ',
        profit_percent DECIMAL(5,2) DEFAULT NULL,
        overhead_amount DECIMAL(15,2) DEFAULT 0,
        profit_amount DECIMAL(15,2) DEFAULT 0,
        -- текущие цены (после индексации)
        current_total DECIMAL(15,2) DEFAULT 0,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (section_id) REFERENCES estimate_sections(id) ON DELETE CASCADE,
        FOREIGN KEY (norm_id) REFERENCES norms(id) ON DELETE SET NULL,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ресурсы позиции (рассчитанные на объём)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS position_resources (
        id INT AUTO_INCREMENT PRIMARY KEY,
        position_id INT NOT NULL,
        resource_id INT NOT NULL,
        quantity DECIMAL(15,6) NOT NULL DEFAULT 0,
        unit_id INT NOT NULL,
        price DECIMAL(15,2) DEFAULT 0 COMMENT 'Цена ресурса (текущая)',
        cost DECIMAL(15,2) DEFAULT 0 COMMENT 'Стоимость = quantity * price',
        FOREIGN KEY (position_id) REFERENCES estimate_positions(id) ON DELETE CASCADE,
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
        FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Коэффициенты (справочник)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coefficients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        value DECIMAL(10,4) NOT NULL DEFAULT 1 COMMENT 'Значение коэффициента',
        type ENUM('к позиции','к разделу','к смете') DEFAULT 'к позиции',
        description VARCHAR(500)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Применение коэффициентов к элементам сметы
    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimate_coefficients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estimate_id INT DEFAULT NULL,
        section_id INT DEFAULT NULL,
        position_id INT DEFAULT NULL,
        coeff_id INT NOT NULL,
        FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES estimate_sections(id) ON DELETE CASCADE,
        FOREIGN KEY (position_id) REFERENCES estimate_positions(id) ON DELETE CASCADE,
        FOREIGN KEY (coeff_id) REFERENCES coefficients(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Индексы пересчета в текущие цены
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cost_indices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('СМР','оплата труда','материалы','механизмы','прочие') DEFAULT 'СМР',
        period DATE NOT NULL COMMENT 'Период действия индекса',
        value DECIMAL(10,4) NOT NULL,
        UNIQUE KEY (name, period)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    // Таблица привязки индексов к смете
    await connection.query(`
      CREATE TABLE IF NOT EXISTS estimate_cost_indices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estimate_id INT NOT NULL,
        index_id INT NOT NULL,
        FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE,
        FOREIGN KEY (index_id) REFERENCES cost_indices(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Текущие цены на ресурсы (отслеживание изменений)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS resource_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resource_id INT NOT NULL,
        price DECIMAL(15,2) NOT NULL,
        date DATE NOT NULL,
        source VARCHAR(100) COMMENT 'Источник цены (прайс-лист, поставщик)',
        FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Все таблицы успешно созданы (или уже существуют).');

    // 5. Начальное заполнение справочников (минимальный набор)
    await seedData(connection);

    console.log('Инициализация базы данных завершена.');
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('Соединение с MySQL закрыто.');
  }
}

// Функция для заполнения справочных данных
async function seedData(connection) {
  // Единицы измерения
  const units = [
    ['шт', 'штука'],
    ['м', 'метр'],
    ['м2', 'квадратный метр'],
    ['м3', 'кубический метр'],
    ['т', 'тонна'],
    ['кг', 'килограмм'],
    ['100м2', '100 квадратных метров'],
    ['100м3', '100 кубических метров'],
    ['компл', 'комплект'],
    ['чел.-ч', 'человеко-час'],
    ['маш.-ч', 'машино-час'],
  ];
  for (const [code, name] of units) {
    await connection.query(
      'INSERT IGNORE INTO units (code, name) VALUES (?, ?)',
      [code, name]
    );
  }

  // Виды работ (типовые для строительства, с условными нормами НР и СП)
  const workTypes = [
    ['1', 'Земляные работы', 80, 45],
    ['2', 'Фундаменты', 100, 60],
    ['3', 'Стены и перегородки', 110, 65],
    ['4', 'Перекрытия и покрытия', 105, 55],
    ['5', 'Кровли', 120, 65],
    ['6', 'Отделочные работы', 90, 45],
    ['7', 'Санитарно-технические работы', 105, 50],
    ['8', 'Электромонтажные работы', 85, 40],
  ];
  for (const [code, name, overhead, profit] of workTypes) {
    await connection.query(
      'INSERT IGNORE INTO work_types (code, name, overhead_percent, profit_percent) VALUES (?, ?, ?, ?)',
      [code, name, overhead, profit]
    );
  }

  // Один базовый сборник для примера
  await connection.query(
    "INSERT IGNORE INTO norm_collections (code, name, year) VALUES ('ФЕР08', 'Федеральные единичные расценки на строительные работы. Сборник 8. Конструкции из кирпича и блоков', 2001)"
  );

  // Администратор по умолчанию (пароль: admin, хэш для bcrypt; здесь заглушка, реальный пароль нужно хэшировать)
  // Для простоты используем уже готовый хэш (пароль "admin123" -> bcrypt)
  // В реальном проекте замените на настоящий хэш или создайте пользователя через приложение.
  await connection.query(
    "INSERT IGNORE INTO users (username, password_hash, full_name, role) VALUES ('admin', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Администратор', 'admin')"
  );

  console.log('Справочные данные загружены.');
}

// Запуск
initDatabase()
  .then(() => {
    console.log('Скрипт init-db.js выполнен успешно.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Критическая ошибка:', err);
    process.exit(1);
  });