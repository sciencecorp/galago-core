import logging.handlers
import subprocess
from tools.app_config import Config
import threading
import socket 
import logging 
import os
import signal as os_signal
import tkinter as tk
from tkinter import messagebox
from tkinter.scrolledtext import ScrolledText
from tkinter import ttk  # working on windows
import time
from os.path import join, dirname
from typing import Optional, Any, Callable
from tools.conda_utils import get_conda_environments,check_conda_is_path
import argparse 

ROOT_DIR = dirname(dirname(os.path.realpath(__file__)))
LOG_TIME = int(time.time())
TOOLS_32BITS = ["vcode","bravo","hig_centrifuge","plateloc","vspin"]

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s | %(levelname)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S', 
)

class ToolsManager():

    def __init__(self, app_root:tk.Tk, config:Config) -> None:
        self.root = app_root
        self.root.title("Galago Web Client and Tools Server Manager")
        self.set_icon()
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.root.geometry('1000x700')  
        
        self.running_tools = 0
        self.config_file = ""
        logging.info("Starting Galago Manager")
        self.config :Config = config
        working_dir = "" if not config.app_config.data_folder else config.app_config.data_folder
        self.log_folder = os.path.join(working_dir,"data","trace_logs", str(LOG_TIME))
        self.workcell = config.app_config.workcell

        if not os.path.exists(self.log_folder):
            logging.debug("folder does not exist. creating folder")
            os.makedirs(self.log_folder)

        #Build databases if they do not exist
        self.server_processes : dict[str,subprocess.Popen] = {}
        self.tool_box_process: Optional[subprocess.Popen] = None
        self.main_frame = ttk.Frame(root)
        self.main_frame.pack(fill=tk.BOTH, expand=True)
        self.paned_window = ttk.PanedWindow(self.main_frame, orient=tk.HORIZONTAL)
        self.paned_window.pack(fill=tk.BOTH, expand=True)
        self.paned_window.propagate(False)

        left_width = 250  # Increased left frame width
        self.left_frame = tk.Frame(self.paned_window, width=left_width)
        self.left_frame.pack(fill=tk.BOTH, expand=True)
        self.left_frame.pack_propagate(False)

        self.left_scrollbar = ttk.Scrollbar(self.left_frame, orient=tk.VERTICAL)
        self.left_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.left_canvas = tk.Canvas(self.left_frame, yscrollcommand=self.left_scrollbar.set)
        self.left_canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.left_scrollbar.config(command=self.left_canvas.yview)
        self.tool_buttons : dict[str, tuple[str,tk.Button,tk.Frame]] = {}
        self.tool_buttons_previous_states : dict[str, bool] = {}

        # Create a frame inside the canvas to hold the widgets
        self.widgets_frame = ttk.Frame(self.left_canvas)
        self.widgets_frame.bind(
            "<Configure>",
            lambda e: self.left_canvas.configure(
                scrollregion=self.left_canvas.bbox("all")
            )
        )

        # Create a window inside the canvas
        self.left_canvas.create_window((0, 0), window=self.widgets_frame, anchor="nw")
        # Populate the left frame with widgets from a list
        self.alive_flags = []
        self.status_labels = [] 

        # Create the right frame for the scrolled text
        self.right_frame = tk.Frame(self.paned_window, width=(self.root.winfo_width()/5)*4)
        self.right_frame.pack(fill=tk.BOTH, expand=True)
        
        # Add the right frame to the paned window
        self.paned_window.add(self.left_frame, weight=1)
        self.paned_window.add(self.right_frame, weight=10)
        self.log_files_modified_times = {}
        self.log_files_last_read_positions = {}

        # Create a frame to hold the Treeview and scrollbars
        tree_frame = ttk.Frame(self.right_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)

        # Create vertical scrollbar only
        v_scrollbar = ttk.Scrollbar(tree_frame, orient="vertical")
        h_scrollbar = ttk.Scrollbar(tree_frame, orient="horizontal")
        
        # Create Treeview with vertical scrollbar
        self.output_text = ttk.Treeview(tree_frame, 
                                       columns=("Time", "Level", "Message"), 
                                       show="headings",
                                       yscrollcommand=v_scrollbar.set,
                                       xscrollcommand=h_scrollbar.set)
        
        # Configure scrollbars
        v_scrollbar.config(command=self.output_text.yview)
        h_scrollbar.config(command=self.output_text.xview)
        
        # Configure columns with adjusted widths
        self.output_text.heading("Time", text="Time")
        self.output_text.heading("Level", text="Level")
        self.output_text.heading("Message", text="Message")
        
        # Set column widths and make Message column not fixed width
        self.output_text.column("Time", width=150, minwidth=150, stretch=False)
        self.output_text.column("Level", width=70, minwidth=70, stretch=False)
        self.output_text.column("Message", width=500, minwidth=200, stretch=True)

        # Configure row height to accommodate wrapped text
        style = ttk.Style()
        style.configure('Treeview', rowheight=60)  # Adjust this value as needed

        # Pack the Treeview and scrollbars
        self.output_text.pack(side="left", fill="both", expand=True)
        v_scrollbar.pack(side="right", fill="y")
        
        # Create a frame for the horizontal scrollbar to give it more space
        h_scroll_frame = ttk.Frame(tree_frame)
        h_scroll_frame.pack(side="bottom", fill="x", pady=(5,0))
        h_scrollbar.pack(in_=h_scroll_frame, fill="x")

        # Configure tag colors
        self.output_text.tag_configure("error", foreground="red")
        self.output_text.tag_configure("warning", foreground="orange")
        self.output_text.tag_configure("debug", foreground="gray")

        # Bind Shift + MouseWheel for horizontal scrolling
        # Bind drag events for horizontal scrolling
        self._drag_start = None
        self.output_text.bind("<Button-1>", self._start_drag)
        self.output_text.bind("<B1-Motion>", self._do_drag)
        self.output_text.bind("<ButtonRelease-1>", self._stop_drag)

        # Add search and filter features
        self.search_frame = ttk.Frame(self.right_frame)
        self.search_frame.pack(fill=tk.X, padx=0, pady=(5,0))

        self.search_entry = ttk.Entry(self.search_frame)
        self.search_entry.pack(side=tk.LEFT, expand=True, fill=tk.X)
        self.search_button = ttk.Button(self.search_frame, text="Search", command=self.search_logs)
        self.search_button.pack(side=tk.LEFT)

        self.filter_var = tk.StringVar(value="ALL")
        self.filter_menu = ttk.OptionMenu(self.search_frame, self.filter_var, "ALL", "ALL", "INFO", "DEBUG", "WARNING", "ERROR", command=self.filter_logs)
        self.filter_menu.pack(side=tk.LEFT)

        self.update_interval = 100
        self.update_log_text()

    def kill_all_processes(self) ->None:
        logging.info("Killing all processes")
        for proc_key, process in self.server_processes.items():
            try:
                self.kill_by_process_id(process.pid)
                time.sleep(0.5)
                logging.info(f"Killed process {process.pid}")
                self.log_text(f"Killed process {process.pid}")
                del process
            except ProcessLookupError as e:
                logging.error(f"failed to shut down process. Error={str(e)}")
                self.log_text(f"failed to shut down process. Error={str(e)}")
                pass
        self.server_processes.clear()
        self.force_kill_tool()
    
    def set_icon(self) -> None:
        if os.name == "nt":
            self.root.iconbitmap(join(ROOT_DIR,"tools","favicon.ico"))
        elif os.name == "posix":
            icon_file = join(ROOT_DIR,"tools","site_logo.png")
            icon_img = tk.Image("photo", file=icon_file)
            if icon_img:
                self.root.iconphoto(True, str(icon_img))      
    
    def update_buttons(self) -> None:
        for button_key, (button_name, button, status_indicator) in self.tool_buttons.items():
            if button_key in self.server_processes:
                process = self.server_processes[button_key]
                is_alive = process is not None and process.poll() is None
            else:
                is_alive = False
            if is_alive != self.tool_buttons_previous_states[button_key]:
                if is_alive:
                    button["text"] = "Disconnect"
                    status_indicator.itemconfig('status', fill='green')
                else:
                    button["text"] = "Connect"
                    status_indicator.itemconfig('status', fill='red')
                self.tool_buttons_previous_states[button_key] = is_alive

        self.root.after(500, self.update_buttons)
    
    def load_tools(self) -> None:
        self.config.load_workcell_config()
 
    def read_last_lines(self, filename:str, lines:int=100) -> list[str]:
        with open(filename, 'rb') as f:
            f.seek(0, os.SEEK_END)
            end_position = f.tell()
            buffer_size = 1024
            blocks = -1
            data = []
            while end_position > 0 and len(data) < lines:
                if end_position - buffer_size > 0:
                    f.seek(blocks * buffer_size, os.SEEK_END)
                else:
                    f.seek(0, os.SEEK_SET)
                data.extend(f.readlines())
                end_position -= buffer_size
                blocks -= 1
            return [line.decode('utf-8') for line in data[-lines:]]
            
    def update_log_text(self) -> None:
        try:
            current_scroll = self.output_text.yview()
            for file_name, update_time in self.log_files_modified_times.items():
                last_updated = os.path.getmtime(file_name)
                if update_time is None or last_updated != update_time:
                    last_lines = self.read_last_lines(file_name, 100)
                    self.log_files_modified_times[file_name] = last_updated
                    filter_type = self.filter_var.get()
                    for line in last_lines:
                        if filter_type == "ALL" or f"| {filter_type} |" in line:
                            if "| ERROR |" in line:
                                self.log_text(line.strip(), "error")
                            elif "| WARNING |" in line:
                                self.log_text(line.strip(), "warning")
                            else:
                                self.log_text(line.strip())
            
            if current_scroll == (0.0, 1.0):  # Only scroll to the bottom if at the bottom
                self.output_text.see(tk.END)

        except FileNotFoundError:
            pass
        except Exception:
            pass
        self.root.after(self.update_interval, self.update_log_text)

    def search_logs(self) -> None:
        search_term = self.search_entry.get().lower()
        self.output_text.tag_remove("search", "1.0", tk.END)
        if search_term:
            start_pos = "1.0"
            while True:
                start_pos = self.output_text.search(search_term, start_pos, stopindex=tk.END, nocase=True)
                if not start_pos:
                    break
                end_pos = f"{start_pos}+{len(search_term)}c"
                self.output_text.tag_add("search", start_pos, end_pos)
                start_pos = end_pos
            self.output_text.tag_config("search", background="yellow")

    def filter_logs(self, *args: Any) -> None:
        filter_type = self.filter_var.get()
        
        # Clear existing items in Treeview
        for item in self.output_text.get_children():
            self.output_text.delete(item)
        
        for file_name in self.log_files_modified_times.keys():
            try:
                with open(file_name, 'r') as file:
                    for line in file:
                        if filter_type == "ALL" or f"| {filter_type} |" in line:
                            if "| ERROR |" in line:
                                self.log_text(line.strip(), "error")
                            elif "| WARNING |" in line:
                                self.log_text(line.strip(), "warning")
                            else:
                                self.log_text(line.strip())
            except Exception as e:
                # Insert error as a new row in the Treeview
                current_time = time.strftime('%Y-%m-%d %H:%M:%S')
                self.output_text.insert("", 0, values=(current_time, "ERROR", f"Failed to read log file: {str(e)}"), tags=("error",))

    def get_shell_command(self, tool_type:str, port:int) -> list:
        python_cmd : str = f"python -m tools.{tool_type}.server --port={port}"
        if os.name == 'nt':
            if tool_type in TOOLS_32BITS:
                env = "galago-core32"
            else:
                env = "galago-core"
            conda_is_path = check_conda_is_path()
            if conda_is_path:
                envs = get_conda_environments()
                if env not in envs:
                    raise RuntimeWarning(f"{env} not found, this might cause some issues with some tools")
                python_cmd = f"conda activate {env}" + "&&" + python_cmd
            conda_cmd = f"conda activate {env} && {python_cmd}"
            return ["cmd.exe", "/C", conda_cmd]       
        else:
            return python_cmd.split()
    
    def __del__(self) -> None:
        self.kill_all_processes()
    
    def kill_by_process_id(self, process_id:int) -> None:
        try:
            if os.name == 'nt':
                subprocess.call(['taskkill', '/F', '/T', '/PID', str(process_id)])
            else:
                os.kill(process_id, os_signal.SIGINT)
        except ChildProcessError as e:
            self.log_text(f"Failed to kill child process. Error={e}")
        finally:
            return None

    def run_subprocess(self, tool_type:str, tool_name:str, port:int,confirm_modal:bool=False) -> None:
        if confirm_modal:
            box_result = messagebox.askquestion(title="Confirm Tool Restart", message=f"Are you sure you want to restart {tool_name}-{tool_type}")
            if box_result == 'no':
                return None
        try:
            self.kill_process_by_name(str(tool_name))
            tool_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = tool_socket.connect_ex(('127.0.0.1',int(port)))
            if result != 0:
                cmd = self.get_shell_command(tool_type=tool_type, port=port)
                os.chdir(ROOT_DIR)
                use_shell = False
                if os.name == 'nt':
                    use_shell = True
                logging.info(f"log folder is {self.log_folder}")
                if self.log_folder:
                    output_file = join(self.log_folder, str(tool_name)) + ".log"
                    process = subprocess.Popen(cmd, stdout=open(output_file,'w'), stderr=subprocess.STDOUT,  universal_newlines=True)
                else:
                     process = subprocess.Popen(cmd, shell=use_shell,universal_newlines=True)
                self.server_processes[tool_name] = process
                self.log_files_modified_times[output_file] = os.path.getmtime(output_file)
            else:
                logging.warning(f"Port {port} for {tool_name} is already occupied")
        except subprocess.CalledProcessError:
            logging.info("There was an error launching tool server.")
        return None
    
    def kill_process_by_name(self, process_name:str) -> None:
        if process_name not in self.server_processes.keys():
            return None
        else:
            try:
                process_id = self.server_processes[process_name].pid
                self.kill_by_process_id(process_id)
            except Exception as e:
                logging.warning(f"Failed to kill process {process_name}. Reason is={str(e)}.")
        return None 
    
    def log_text(self, text: str, log_type: Optional[str] = None) -> None:
        try:
            # Parse the log line
            parts = text.split(" | ", 2)
            
            if len(parts) == 3:
                time_str, level, message = parts
            else:
                # Handle non-standard format messages (like Python errors)
                time_str = time.strftime('%Y-%m-%d %H:%M:%S')
                level = "ERROR"
                message = text.strip()
            
            # Wrap the message text (about 100 chars per line)
            wrapped_message = '\n'.join(message[i:i+50] for i in range(0, len(message), 50))
            
            # Insert new row at the top of the Treeview
            item = self.output_text.insert("", 0, values=(time_str, level, wrapped_message))
            
            # Apply color based on log level
            if "ERROR" in level or log_type == "error":
                self.output_text.tag_configure("error", foreground="red")
                self.output_text.item(item, tags=("error",))
            elif "WARNING" in level or log_type == "warning":
                self.output_text.tag_configure("warning", foreground="orange")
                self.output_text.item(item, tags=("warning",))
            elif "DEBUG" in level:
                self.output_text.tag_configure("debug", foreground="gray")
                self.output_text.item(item, tags=("debug",))
        except Exception as e:
            current_time = time.strftime('%Y-%m-%d %H:%M:%S')
            item = self.output_text.insert("", 0, values=(current_time, "ERROR", f"Error logging text: {str(e)}"))
            self.output_text.tag_configure("error", foreground="red")
            self.output_text.item(item, tags=("error",))

    def populate_tool_buttons(self) -> None:
        left_width = 300  # Initial width of the left frame

        # Clear existing tool buttons and widgets in the frame
        for widget in self.widgets_frame.winfo_children():
            widget.destroy()

        # Reset tool button state
        self.tool_buttons.clear()
        self.tool_buttons_previous_states.clear()

        def create_tool_frame(parent: tk.Widget, tool_name: str, command: Callable) -> None:
            frame = tk.Frame(parent)
            frame.pack(fill=tk.X, padx=3, pady=2)
            
            label = ttk.Label(frame, text=tool_name, anchor='w')
            label.pack(side=tk.LEFT, padx=(5, 10), pady=5, expand=True, fill=tk.X)
            
            # Add status indicator
            status_indicator = tk.Canvas(frame, width=12, height=12, highlightthickness=0)
            status_indicator.pack(side=tk.LEFT, padx=(0, 10), pady=5)
            status_indicator.create_oval(2, 2, 10, 10, fill='red', tags='status')
            
            button = tk.Button(frame, text="Connect", command=command, width=10, 
                               relief=tk.FLAT, bg=frame.cget('bg'), activebackground=frame.cget('bg'))
            button.pack(side=tk.RIGHT, padx=(5, 5), pady=5)
            
            self.tool_buttons[tool_name] = (tool_name, button, status_indicator)
            self.tool_buttons_previous_states[tool_name] = False

        # Tool Box
        create_tool_frame(self.widgets_frame, "Tool Box", self.start_toolbox)

        # Workcell tools
        if self.config.workcell_config and self.config.workcell_config_is_valid:
            for t in self.config.workcell_config.tools:
                try:
                    create_tool_frame(
                        self.widgets_frame,
                        t.name,
                        lambda t=t: self.run_subprocess(t.type, t.name, t.port, True, )
                    )
                except Exception as e:
                    logging.error(f"Failed to add button {t.id}. Error is {e}")

        # Restart All button
        restart_frame = ttk.Frame(self.widgets_frame)
        restart_frame.pack(fill=tk.X, padx=3, pady=4)
        restart_all_button = ttk.Button(restart_frame, text="Restart All", command=self.run_all_tools)
        restart_all_button.pack(fill=tk.X)

        # Add this line to ensure the widgets_frame fits its contents
        self.widgets_frame.update_idletasks()
        self.left_canvas.config(width=self.widgets_frame.winfo_reqwidth())

        # Set the initial position of the paned window sash
        self.paned_window.sashpos(0, left_width)


    def force_kill_tool(self) -> None:
        try:
            if os.name != 'nt':
                subprocess.Popen("lsof -t -i tcp:1010 | xargs kill", shell=True)
        except Exception as e:
            self.log_text(f"Failed to kill web app. Error={e}")
    

    def start_toolbox(self) -> None:
        logging.info("Launching Toolbox")
        try:
            self.run_subprocess("toolbox", "Tool Box",1010,False)
        except subprocess.CalledProcessError:
            logging.info("There was an error launching toolbox server.")

    def run_all_tools(self) -> None:
        self.kill_all_processes()
        time.sleep(0.5)
        self.config.load_app_config()
        
        self.load_tools()
        self.start_toolbox()

        counter = 0
        self.populate_tool_buttons()

        for t in self.config.workcell_config.tools:
            logging.info(f"Launching process for tool {t.name}")
            counter+=1
            #Check if tool is already running. 
            tool_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = tool_socket.connect_ex(('127.0.0.1',t.port))
            if result != 0:
                try:
                    self.run_subprocess(t.type,t.name,t.port,False )
                except Exception as e:
                    logging.error(f"Failed to launch tool {t.name}. Error is {e}")
            else:
                logging.warning(f"Port for tool {t.name} is already occupied")
        time.sleep(0.5)
        self.update_buttons()

    def on_closing(self) -> None:
        logging.info("Calling on closing function")
        try:
           self.kill_all_processes()
        except Exception as e: 
            self.log_text(f"Failed to kill tool servers, {e}")
        finally:
            self.log_text("Closing Galago Manager")
            time.sleep(2)
            self.root.destroy()

    def show_gui(self) -> None:
        process_thread = threading.Thread(target=self.run_all_tools)
        process_thread.daemon = False
        process_thread.start()
        self.root.mainloop()
    
    def _start_drag(self, event):
        """Start the drag operation."""
        # Only start drag if we click on a row (not headers)
        if self.output_text.identify_region(event.x, event.y) == "cell":
            self._drag_start = event.x
            # Change cursor to indicate dragging is possible
            self.output_text.configure(cursor="fleur")

    def _do_drag(self, event):
        """Perform the drag operation."""
        if self._drag_start is not None:
            # Calculate the distance moved
            diff = (self._drag_start - event.x) / self.output_text.winfo_width()
            # Get current scroll position
            first, last = self.output_text.xview()
            # Move the view (adjust sensitivity)
            new_position = first + (diff * 2)  # Multiply by 2 to increase scroll sensitivity
            self.output_text.xview_moveto(new_position)
            # Update drag start position
            self._drag_start = event.x

    def _stop_drag(self, event):
        """End the drag operation."""
        self._drag_start = None
        # Reset cursor
        self.output_text.configure(cursor="")

if __name__ == "__main__":
    root = tk.Tk()
    config = Config()
    logging.info("Loading app config")
    config.load_app_config()
    logging.info("Loading workcell config")
    config.load_workcell_config()
    manager = ToolsManager(root, config)
    manager.show_gui()