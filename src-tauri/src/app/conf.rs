use log::error;
use serde::Deserialize;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub theme: String,
    pub language: String,
    pub allow_pet_above_taskbar: bool,
    pub allow_pet_interaction: bool,
}

impl AppConfig {
    pub fn new() -> AppConfig {
        let setting_path: String = combine_config_path("settings.json").unwrap();
        match std::fs::read_to_string(setting_path) {
            Ok(value) => {
                let json: serde_json::Value = serde_json::from_str(&value).unwrap();
                AppConfig {
                    theme: json["app"]["theme"].as_str().unwrap().to_string(),
                    language: json["app"]["language"].as_str().unwrap().to_string(),
                    allow_pet_above_taskbar: json["app"]["allowPetAboveTaskbar"].as_bool().unwrap(),
                    allow_pet_interaction: json["app"]["allowPetInteraction"].as_bool().unwrap(),
                }
            }
            Err(err) => {
                error!("Error reading settings.json: {}", err);
                AppConfig {
                    theme: "dark".to_string(),
                    language: "en".to_string(),
                    allow_pet_above_taskbar: false,
                    allow_pet_interaction: true,
                }
            }
        }
    }

    pub fn get_theme(&self) -> &str {
        self.theme.as_str()
    }
}

#[tauri::command(rename_all = "snake_case")]
pub fn convert_path(path_str: &str) -> Option<String> {
    if cfg!(target_os = "windows") {
        Some(path_str.replace('/', "\\"))
    } else {
        Some(path_str.replace('\\', "/"))
    }
}

pub fn app_root() -> PathBuf {
    tauri::api::path::config_dir().unwrap().join("WindowPet")
}

#[tauri::command(rename_all = "snake_case")]
pub fn combine_config_path(config_name: &str) -> Option<String> {
    convert_path(app_root().join(config_name).to_str().unwrap())
}
