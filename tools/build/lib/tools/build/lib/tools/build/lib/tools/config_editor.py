import tkinter as tk
from tkinter import messagebox
from typing import Dict, Any, Optional
import json
import os

class ConfigEditor:

    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("Config Editor")
        self.root.geometry("400x300")
        self.root.config(bg='white')  # Set background color to white

        # Load the config
        self.config_file = 'config.json'
        self.config_data = self.load_config()

        # Create the form fields
        self.entries = {}
        self.create_form()

        # Add Save and Load buttons
        button_frame = tk.Frame(self.root, bg='white')
        button_frame.pack(pady=10, fill=tk.X)

        self.save_button = tk.Button(button_frame, text="Save", command=self.save_config)
        self.save_button.pack(side=tk.LEFT, padx=10)

        self.load_button = tk.Button(button_frame, text="Load", command=self.load_config_to_form)
        self.load_button.pack(side=tk.LEFT, padx=10)

    def create_form(self) -> None:  # Changed 'self: str' to 'self'
        # Create input fields dynamically based on config keys
        form_frame = tk.Frame(self.root, bg='white')
        form_frame.pack(pady=10, fill=tk.X)

        for key, value in self.config_data.items():
            # Create a label and entry for each config field
            label = tk.Label(form_frame, text=key, bg='white')
            label.pack(anchor='w', padx=10)

            entry = tk.Entry(form_frame)
            entry.pack(fill=tk.X, padx=10, pady=5)
            entry.insert(0, str(value))

            # Store entry widget for later use
            self.entries[key] = entry

    def load_config(self) -> Dict[str, Any]:
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                config_data: Dict[str, Any] = json.load(f)
                return config_data
        else:
            # Create a default config if file doesn't exist
            default_config: Dict[str, Any] = {
                "host_ip": "127.0.0.1",
                "port": 8000,
                "redis_ip": "127.0.0.1"
            }
            with open(self.config_file, 'w') as f:
                json.dump(default_config, f, indent=4)
            return default_config
        
    @staticmethod
    def get_config_value(config: Dict[str, Any], key: str) -> Optional[Any]:
        keys = key.split('.')
        current = config
        for k in keys:
            if k not in current:
                return None
            current = current[k]
        return current

    def load_config_to_form(self) -> None:  # Changed 'self: str' to 'self'
        # Load current config values into the form
        self.config_data = self.load_config()
        for key, entry in self.entries.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(self.config_data[key]))

    def save_config(self) -> None:  # Changed 'self: str' to 'self'
        # Save form values back to the config file
        for key, entry in self.entries.items():
            self.config_data[key] = entry.get()

        with open(self.config_file, 'w') as f:
            json.dump(self.config_data, f, indent=4)

        messagebox.showinfo("Success", "Config saved successfully")


if __name__ == "__main__":
    root = tk.Tk()
    app = ConfigEditor(root)
    root.mainloop()
