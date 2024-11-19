import tkinter as tk
from tkinter import ttk

class StyledCard(tk.Frame):
    def __init__(self, parent, tool_name, description="", **kwargs):
        super().__init__(parent, **kwargs)
        
        # Card styling
        self.configure(
            relief="solid",
            borderwidth=1,
            padx=10,
            pady=10,
            bg="white"
        )
        
        # Header
        header_frame = tk.Frame(self, bg="white")
        header_frame.pack(fill=tk.X, expand=True)
        
        # Tool name (heading)
        name_label = ttk.Label(
            header_frame, 
            text=tool_name,
            font=("Helvetica", 12, "bold"),
            background="white"
        )
        name_label.pack(side=tk.LEFT, anchor="w")
        
        # Description
        if description:
            desc_label = ttk.Label(
                self,
                text=description,
                font=("Helvetica", 9),
                background="white",
                wraplength=200
            )
            desc_label.pack(anchor="w", pady=(5,0))