// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app;
use app::tray;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::command;
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::LogTarget;

#[derive(Serialize, Deserialize)]
struct Timestamp {
    start_date: String,
    end_date: String,
}

#[command]
async fn filter_events(
    url: Option<Vec<String>>,
    title: Option<Vec<String>>,
    timestamp: Option<Timestamp>,
) -> Result<Value, String> {
    let time_period = timestamp.map(|ts| format!("{}/{}", ts.start_date, ts.end_date));

    let mut query_lines = vec![
        "afk_events = query_bucket(find_bucket('aw-watcher-afk_'));".to_string(),
        "window_events = query_bucket(find_bucket('aw-watcher-window_'));".to_string(),
        "chrome_events = query_bucket(find_bucket('aw-watcher-web-chrome'));".to_string(),
        "overlap = union_no_overlap(window_events, chrome_events);".to_string(),
    ];

    let url_regex = url.map_or("".to_string(), |urls| {
        let mut url_regex = String::new();
        for url in urls {
            url_regex.push_str(&format!("{}|", url));
        }
        url_regex.pop();
        url_regex
    });

    // if url_regex is not empty then add the following line to query_lines
    if !url_regex.is_empty() {
        query_lines.push(format!(
            "overlap = filter_keyvals_regex(overlap,'url','{}');",
            url_regex
        ));
    }

    let title_regex = title.map_or("".to_string(), |titles| {
        let mut title_regex = String::new();
        for title in titles {
            title_regex.push_str(&format!("{}|", title));
        }
        title_regex.pop();
        title_regex
    });

    if !title_regex.is_empty() {
        query_lines.push(format!(
            "overlap = filter_keyvals_regex(overlap,'title','{}');",
            title_regex
        ));
    }

    query_lines.push("overlap = filter_period_intersect(overlap, filter_keyvals(afk_events, 'status', ['not-afk']));".to_string());
    query_lines.push("RETURN = overlap;".to_string());

    let body = json!({
        "timeperiods": time_period.map_or(vec![], |tp| vec![tp]),
        "query": query_lines,
    });

    // make a log for body

    // Perform the POST request to the API endpoint
    let client = Client::new();
    let response = client
        .post("http://localhost:5600/api/0/query")
        .json(&body)
        .send()
        .await;

    match response {
        Ok(resp) => {
            // log resp
            if resp.status().is_success() {
                match resp.json::<Value>().await {
                    Ok(json) => Ok(json),
                    Err(e) => Err(format!("Error parsing response JSON: {}", e)),
                }
            } else {
                // make resp to be string
                let resp1 = resp.text().await.unwrap();
                Err(format!("API returned an error: {}", resp1))
            }
        }
        Err(e) => Err(format!("Error sending request: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::default()
                .targets([
                    LogTarget::Folder(app::conf::app_root()),
                    LogTarget::Stdout,
                    LogTarget::Webview,
                ])
                .level(log::LevelFilter::Info)
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .system_tray(tray::init_system_tray())
        .on_system_tray_event(tray::handle_tray_event)
        .invoke_handler(tauri::generate_handler![filter_events])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
