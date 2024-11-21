import tkinter as tk
from tkinter import ttk

class LogTable(ttk.Treeview):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, **kwargs)
        
        # Configure columns
        self['columns'] = ('level', 'action', 'details', 'timestamp')
        self['show'] = 'headings'
        
        # Column headings
        self.heading('level', text='Level')
        self.heading('action', text='Action')
        self.heading('details', text='Details') 
        self.heading('timestamp', text='Time')
        
        # Column widths
        self.column('level', width=70)
        self.column('action', width=100)
        self.column('details', width=400)
        self.column('timestamp', width=150)
        
        # Styling
        style = ttk.Style()
        style.configure("Treeview", 
            background="white",
            fieldbackground="white",
            rowheight=25
        )
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(parent, orient="vertical", command=self.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.configure(yscrollcommand=scrollbar.set)