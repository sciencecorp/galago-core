import requests 
from typing import Union, Optional
import urllib3
import logging 

API_URL = "http://localhost:8000/api"

logging.getLogger("urllib3").setLevel(logging.WARNING)

class Db:
    @staticmethod
    def check_connection():
        try:
            response = requests.get(API_URL)
            if response.status_code == 200:
                return True
        except requests.exceptions.ConnectionError:
            return False
        
    @staticmethod
    def get_data(model:str):
        response = requests.get(f"{API_URL}/{model}")
        return response.json()

    @staticmethod
    def get_by_id_or_name(id:Union[int,str], model:str):
        response = requests.get(f"{API_URL}/{model}/{id}")
        return response.json()
    
    @staticmethod
    def post_data(data:dict, model:str):
        response = requests.post(f"{API_URL}/{model}", json=data)
        return response.json()

    @staticmethod
    def delete_data(id, model:str):
        response = requests.delete(f"{API_URL}/{model}/{id}")
        return response.json()
    
    @staticmethod
    def update_data(id:int, data:dict, model:str):
        response = requests.put(f"{API_URL}/{model}/{id}", json=data)
        return response.json()
    
    @staticmethod
    def ping(times:int):
        for i in range(times):
            try:
                logging.info(f"Pinging {API_URL} ... Attempt {i+1}")
                response = requests.get(f"{API_URL}/health")
                print(response.status_code)
                logging.info(f"Response status code: {response.status_code}")
                if response.status_code == 200:
                    return True
            except requests.exceptions.ConnectionError:
                continue
        logging.error("Could not establish connection to database...")
        return False
        

if __name__ == "__main__":  
    print(Db.check_connection())
    print(Db.get_data("workcells"))
    print(Db.get_by_id_or_name(1, "workcells"))
    print(Db.post_data({"name":"workcell_3"}, "workcells"))
    print(Db.delete_data(3, "workcells"))
    print(Db.update_data(2, {"name":"workcell_2"}, "workcells"))
    print(Db.ping(3))
    print(Db.ping(5))
