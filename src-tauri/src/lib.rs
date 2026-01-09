use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "Create Bookmarks table",
            sql: "CREATE TABLE bookmarks (
                bookCode TEXT,
                chapterNo INTEGER,
                verseNo INTEGER,
                PRIMARY KEY (bookCode, chapterNo, verseNo) ON CONFLICT IGNORE
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "Create languages table",
            sql: "CREATE TABLE languages (
                code TEXT PRIMARY KEY,
                engname TEXT NOT NULL,
                selfname TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "Create translations table",
            sql: "CREATE TABLE translations (
                transCode TEXT PRIMARY KEY,
                sourceUrl TEXT,
                copyright TEXT,
                rtl BOOLEAN
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "Create translationLanguages table",
            sql: "CREATE TABLE translationLanguages (
                transCode VARCHAR,
                langCode VARCHAR,
                name VARCHAR,
                PRIMARY KEY (transCode, langCode)
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "Create bookInfo and chapterSize tables",
            sql: "
            CREATE TABLE booksInfo (
                transCode VARCHAR,
                langCode VARCHAR,
                bookNumber INTEGER,
                bookCode VARCHAR,
                bookName VARCHAR,
                chaptersCount INTEGER,
                PRIMARY KEY (transCode, langCode, bookNumber),
                UNIQUE (transCode, langCode, bookCode)
            );
            CREATE TABLE chapterSize (
                transCode VARCHAR,
                langCode VARCHAR,
                bookCode VARCHAR,
                chapterNo INTEGER,
                versesCount INTEGER,
                PRIMARY KEY (transCode, langCode, bookCode, chapterNo)
            );
            ",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "Create htmlCache table",
            sql: "CREATE TABLE htmlCache (
                transCode VARCHAR,
                langCode VARCHAR,
                bookCode VARCHAR,
                chapterNo INTEGER,
                html TEXT,
                PRIMARY KEY (transCode, langCode, bookCode, chapterNo) ON CONFLICT REPLACE
            );",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().add_migrations("sqlite:meebible.db", migrations).build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
