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
CONTROLLER_DIR = join(ROOT_DIR, "controller")
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
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.root.geometry('1000x700')  # Increased window size
        
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
        self.build_db()
        self.server_processes : dict[str,subprocess.Popen] = {}
        self.database_process : Optional[subprocess.Popen] = None
        self.controller_process : Optional[subprocess.Popen]= None
        self.tool_box_process: Optional[subprocess.Popen] = None
        self.redis_process : Optional[subprocess.Popen] = None
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
        #self.right_frame.propagate(0)
        # Add the right frame to the paned window
        self.paned_window.add(self.left_frame, weight=1)
        self.paned_window.add(self.right_frame,weight=10)
        self.log_files_modified_times = {}
        self.log_files_last_read_positions = {}

        self.output_text = ScrolledText(self.right_frame, state='disabled', wrap='word')
        self.output_text.pack(fill=tk.BOTH, expand=True)
        self.output_text.tag_config('error', foreground='red') 
        self.output_text.tag_config('warning', foreground='orange')

        #Port to run on 
        parser = argparse.ArgumentParser()
        parser.add_argument('--port')
        args = parser.parse_args()
        if args.port:
            self.app_port = args.port
        else:
            self.app_port = "3010"
        self.populate_tool_buttons()
        self.update_buttons()
        self.start_database()
        self.start_toolbox()
        self.start_controller()
        self.start_redis_server()

        self.update_interval = 100
        self.update_log_text()

        # Add search and filter features
        self.search_frame = ttk.Frame(self.right_frame)
        self.search_frame.pack(fill=tk.X, padx=5, pady=5)

        self.search_entry = ttk.Entry(self.search_frame)
        self.search_entry.pack(side=tk.LEFT, expand=True, fill=tk.X)
        self.search_button = ttk.Button(self.search_frame, text="Search", command=self.search_logs)
        self.search_button.pack(side=tk.LEFT)

        self.filter_var = tk.StringVar(value="ALL")
        self.filter_menu = ttk.OptionMenu(self.search_frame, self.filter_var, "ALL", "ALL", "INFO", "DEBUG", "WARNING", "ERROR", command=self.filter_logs)
        self.filter_menu.pack(side=tk.LEFT)

    def kill_all_processes(self) ->None:
        logging.info("Killing redis")
        try:
            self.stop_redis_server()
        except Exception as e:
            logging.error(f"Failed to kill redis. Error={e}")
        logging.info("Killing all processes")
        for proc_key, process in self.server_processes.items():
            try:
                self.kill_by_process_id(process.pid)
                logging.info(f"Killed process {process.pid}")
                self.log_text(f"Killed process {process.pid}")
                del process
            except ProcessLookupError as e:
                logging.error(f"failed to shut down process. Error={str(e)}")
                self.log_text(f"failed to shut down process. Error={str(e)}")
                pass
        self.server_processes.clear()
        self.force_kill_tool()
        self.force_kill_db()
        self.force_kill_web_app()
    
    
    def build_db(self) -> None:
        if self.config.app_config.data_folder:
            log_root_folder = os.path.join(self.config.app_config.data_folder, "db")
        else:
            log_root_folder = os.path.join(ROOT_DIR, "db")
        if not os.path.exists(log_root_folder):
            try:
                os.makedirs(log_root_folder)
            except Exception as e:
                logging.error(f"Failed to create log folder. Error={e}")
                return None
        if not config.logs_db_exists():
            logging.info("Building inventory database")
            try:
                subprocess.Popen(["python", "-m", "tools.db.models.log_models"]).communicate()
                subprocess.Popen(["python", "-m", "tools.db.log_types_add"]).communicate()
            except Exception as e:
                logging.error(f"Failed to build inventory database. Error={e}")
                return None
            logging.info("Inventory database built")
        if not config.inventory_db_exists():
            logging.info("Building logs database")
            try:
                subprocess.Popen(["python", "-m", "tools.db.models.inventory_models"]).communicate()
                subprocess.Popen(["python", "-m", "tools.db.instantiate_db"]).communicate()
            except Exception as e:
                logging.error(f"Failed to build logs database. Error={e}")
                return None
            logging.info("Logs database built")
    
    def update_buttons(self) -> None:
        for button_key, (button_name, button, frame) in self.tool_buttons.items():
            if button_key in self.server_processes:
                process = self.server_processes[button_key]
                is_alive = process is not None and process.poll() is None
            else:
                is_alive = False
            if is_alive != self.tool_buttons_previous_states[button_key]:
                if is_alive:
                    button["text"] = "Disconnect"
                    frame.configure(bg="light green")
                else:
                    button["text"] = "Connect"
                    frame.configure(bg="light coral")
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
            self.output_text.config(state='normal')
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

            self.output_text.config(state='disabled')
        except FileNotFoundError:
            self.output_text.config(state='disabled')
        except Exception:
            self.output_text.config(state='disabled')
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
        self.output_text.config(state='normal')
        self.output_text.delete(1.0, tk.END)
        for file_name in self.log_files_modified_times.keys():
            with open(file_name, 'r') as file:
                for line in file:
                    if filter_type == "ALL" or f"| {filter_type} |" in line:
                        if "| ERROR |" in line:
                            self.log_text(line.strip(), "error")
                        elif "| WARNING |" in line:
                            self.log_text(line.strip(), "warning")
                        else:
                            self.log_text(line.strip())
        self.output_text.config(state='disabled')

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

    def run_subprocess(self,tool_id:str, tool_type:str, tool_name:str, port:int,confirm_modal:bool=False) -> None:
        if confirm_modal:
            box_result = messagebox.askquestion(title="Confirm Tool Restart", message=f"Are you sure you want to restart {tool_name}-{tool_type}")
            if box_result == 'no':
                return None
        try:
            self.kill_process_by_name(tool_id)
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
                    output_file = join(self.log_folder, tool_id) + ".log"
                    process = subprocess.Popen(cmd, stdout=open(output_file,'w'), stderr=subprocess.STDOUT,  universal_newlines=True)
                else:
                     process = subprocess.Popen(cmd, shell=use_shell,universal_newlines=True)
                self.server_processes[tool_id] = process
                self.log_files_modified_times[output_file] = os.path.getmtime(output_file)
            else:
                logging.warning(f"Port {port} for {tool_id} is already occupied")
        except subprocess.CalledProcessError:
            logging.info("There was an error launching toolbox server.")
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
    
    def log_text(self, text:str, log_type:Optional[str]=None) -> None:
        self.output_text.config(state='normal')
        if log_type == "error":
            self.output_text.insert(tk.END, f"{text}\n",'error')
            self.output_text.tag_config('error', foreground='red')
        elif log_type == "warning":
            self.output_text.insert(tk.END, f"{text}\n", 'warning')
            self.output_text.tag_config('warning', foreground='orange')
        else:
            self.output_text.insert(tk.END, f"{text}\n")
        self.output_text.config(state='disabled')
        self.output_text.see(tk.END)

    def populate_tool_buttons(self) -> None:
        left_width = 300  # Initial width of the left frame
        def create_tool_frame(parent: tk.Widget, tool_name: str, command: Callable, tool_id: str) -> None:
            frame = tk.Frame(parent)
            frame.pack(fill=tk.X, padx=3, pady=2)
            
            label = ttk.Label(frame, text=tool_name, anchor='w')
            label.pack(side=tk.LEFT, padx=(5, 10), pady=5, expand=True, fill=tk.X)
            
            button = tk.Button(frame, text="Connect", command=command, width=10, 
                               relief=tk.FLAT, bg=frame.cget('bg'), activebackground=frame.cget('bg'))
            button.pack(side=tk.RIGHT, padx=(5, 5), pady=5)
            
            self.tool_buttons[tool_id] = (tool_name, button, frame)
            self.tool_buttons_previous_states[tool_id] = False

        # Web App
        create_tool_frame(self.widgets_frame, "Web App", self.start_controller, "controller")

        # Tool Box
        create_tool_frame(self.widgets_frame, "Tool Box", self.start_toolbox, "toolbox")

        # Database
        create_tool_frame(self.widgets_frame, "Database", self.start_database, "database")

        # Workcell tools
        if self.config.workcell_config and self.config.workcell_config_is_valid:
            for t in self.config.workcell_config.tools:
                try:
                    create_tool_frame(
                        self.widgets_frame,
                        t.name,
                        lambda t=t: self.run_subprocess(t.id, t.type, t.name, t.port, True),
                        t.id
                    )
                except Exception as e:
                    logging.error(f"Failed to add button {t.id}. Error is {e}")

        # Restart All button
        restart_frame = ttk.Frame(self.widgets_frame)
        restart_frame.pack(fill=tk.X, padx=3, pady=4)
        restart_all_button = ttk.Button(restart_frame, text="Restart All", command=lambda force_restart=True: self.run_all_tools(force_restart))
        restart_all_button.pack(fill=tk.X)

        # Add this line to ensure the widgets_frame fits its contents
        self.widgets_frame.update_idletasks()
        self.left_canvas.config(width=self.widgets_frame.winfo_reqwidth())

        # Set the initial position of the paned window sash
        self.paned_window.sashpos(0, left_width)

    def start_controller(self) -> None:
        try:  
            os.chdir(CONTROLLER_DIR)
            logging.info(f"Setting api url to  {self.config.app_config.host_ip}:8000")
            git_branch_get = subprocess.Popen(["git", "branch", "--show-current"], stdout=subprocess.PIPE)
            branch_name, branch_error = git_branch_get.communicate()

            os.environ['APP_MODE'] = "PROD" if branch_name.decode().replace("\n","") == "main" else "DEV"
            os.environ['NEXT_PUBLIC_API_URL'] = f"{self.config.app_config.host_ip}:8000" if self.config.app_config.host_ip else "127.0.0.1:8000"
            os.environ['REDIS_URL'] = f"redis://{self.config.app_config.redis_ip}/1" if self.config.app_config.redis_ip else "redis://127.0.0.1:6379/1"
            os.environ['CONTROLLER_CONFIG'] = self.config.workcell_config_file

            cmd = self.get_controller_command()
            use_shell = False
            if os.name == 'nt':
                use_shell = True
            if self.log_folder:
                output_file = join("../",self.log_folder,"controller.log")
                process = subprocess.Popen(cmd, stdout=open(output_file,'w'), stderr=subprocess.STDOUT,shell=use_shell, universal_newlines=True)
            else:
                process = subprocess.Popen(cmd, shell=use_shell,universal_newlines=True)
            self.server_processes["controller"] = process
            self.log_files_modified_times[output_file] = os.path.getmtime(output_file)
        except subprocess.CalledProcessError:
            logging.info("There was an error launching the controller.")
        logging.info("controller launched")
    
    def start_redis_server(self) -> None:
        if os.name == 'nt':
            self.log_text("Starting Redis Server")
            redis_cmd = "C:\Windows\Sysnative\wsl.exe -u root -e sudo service redis-server start"
            conda_cmd = f"conda activate galago-core && {redis_cmd}"
            cmd = ["cmd.exe", "/C", conda_cmd]
            subprocess.Popen(cmd)
        else:
            self.log_text("Starting Redis Server")
            subprocess.Popen(["brew", "services", "start", "redis"])

    def stop_redis_server(self) -> None:
        if os.name == 'nt':
            self.log_text("Stopping Redis Server")
            redis_cmd = "wsl -u root -e sudo service redis-server stop"
            conda_cmd = f"conda activate galago-core && {redis_cmd}"
            cmd = ["cmd.exe", "/C", conda_cmd]
            subprocess.Popen(cmd)
        else:
            self.log_text("Stopping Redis Server")
            subprocess.Popen(["brew", "services", "stop", "redis"])

    def get_controller_command(self) -> list:
        npm_command = ["npm", "run", "dev", "--", "--port", self.app_port]
        if os.name == 'nt':
            conda_cmd = f"conda activate galago-core && {(' ').join(npm_command)}"
            cmd = ["cmd.exe", "/C", conda_cmd]
            return cmd
        
        return npm_command
    
    def force_kill_web_app(self) -> None:
        try:
            if os.name != 'nt':
                subprocess.Popen(f"lsof -t -i tcp:{self.app_port} | xargs kill", shell=True)
        except Exception as e:
            self.log_text(f"Failed to kill web app. Error={e}")

    def force_kill_tool(self) -> None:
        try:
            if os.name != 'nt':
                subprocess.Popen("lsof -t -i tcp:1010 | xargs kill", shell=True)
        except Exception as e:
            self.log_text(f"Failed to kill web app. Error={e}")
    
    def force_kill_db(self) -> None:
        try:
            if os.name != 'nt':
                subprocess.Popen("lsof -t -i tcp:8000 | xargs kill", shell=True)
        except Exception as e:
            self.log_text(f"Failed to kill web app. Error={e}")

    def start_database(self) -> None:
        self.log_text("Launching inventory")
        inventory_cmd = "python -m tools.db.run"
        if os.name == 'nt':
            conda_cmd = f"conda activate galago-core && {inventory_cmd}"
            cmd = ["cmd.exe", "/C", conda_cmd]
        else:
            cmd = inventory_cmd.split()
        try:
            if self.log_folder:
                output_file = join(self.log_folder,"database.log")
                process = subprocess.Popen(cmd, stdout=open(output_file,'w'), stderr=subprocess.STDOUT, universal_newlines=True)
            else:
                process = subprocess.Popen(cmd, universal_newlines=True)
            self.server_processes["database"] = process
            self.log_files_modified_times[output_file] = os.path.getmtime(output_file)
        except subprocess.CalledProcessError:
            logging.info("There was an error launching the inventory service.")
            return None
        self.log_text("Inventory launched on port 8000")

    def start_toolbox(self) -> None:
        logging.info("Launching Toolbox")
        try:
            self.run_subprocess("toolbox", "toolbox", "Tool Box",1010,False, )
        except subprocess.CalledProcessError:
            logging.info("There was an error launching toolbox server.")

    def run_all_tools(self, force_restart:bool=False) -> None:
        self.config.load_app_config()
        self.config.load_workcell_config()
        self.log_text(f"Config file is {self.config.app_config.workcell}")
        if not self.config.workcell_config and not self.config.workcell_config_is_valid:
            self.log_text("Invalid workcell config file. No tools started")
            return
        self.load_tools()
        counter = 0
        if self.config.workcell_config is None:
            return None
        for t in self.config.workcell_config.tools:
            logging.info(f"Launching process for tool {t.name}")
            counter+=1
            if force_restart:
                result = 1
            else:
                #Check if tool is already running. 
                tool_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = tool_socket.connect_ex(('127.0.0.1',t.port))
            if result != 0:
                try:
                    self.run_subprocess(t.id, t.type,t.name,t.port,False, )
                except Exception as e:
                    logging.error(f"Failed to launch tool {t.name}. Error is {e}")
            else:
                logging.warning(f"Port for tool {t.name} is already occupied")
        
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
    

if __name__ == "__main__":
    root = tk.Tk()
    config = Config()
    logging.info("Loading app config")
    config.load_app_config()
    logging.info("Loading workcell config")
    config.load_workcell_config()
    manager = ToolsManager(root, config)
    manager.show_gui()