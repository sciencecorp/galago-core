# import redis
# import json
# from threading import Lock
# from pydantic import BaseModel
# import logging 
# from typing import Any , Tuple, Dict

# class UserMessage(BaseModel):
#     id:int
#     content:str
#     status:str 

# class ErrorMessage(BaseModel):
#     id:int
#     content:str
#     statuts:str

# class MessageQueue:
#     _instance = None
#     _lock = Lock()  

#     #return the same class instance
#     def __new__(cls, *args:Tuple[Any], **kwargs:Dict[str,Any]) -> Any:
#         if not cls._instance:
#             with cls._lock:
#                 if not cls._instance:
#                     cls._instance = super().__new__(cls)
#         return cls._instance

#     #only initialize class once. 
#     def __init__(self, host:str='localhost', port:int=6379, db:int=10)->None:
#         if db != 10:
#             logging.warning("You are using a redis instance other than 10. Make sure no other applications are using db 10.")
#         if not hasattr(self, 'initialized'): 
#             print("Connecting to redis")
#             self.r = redis.Redis(host=host, port=port, db=db)
#             self.initialized = True


#     def add_message(self, content:dict)-> dict[str,Any]:
#         message_id = self.r.incr('message_id')  # Incremental message ID
#         message = {
#             'id': message_id,
#             'content': content,
#             'status': 'active'
#         }
#         self.r.rpush('messages', json.dumps(message))
#         return message

#     def get_active_messages(self) -> list[Any]:
#         messages = self.r.lrange('messages', 0, -1)
#         active_messages = [json.loads(msg) for msg in messages if json.loads(msg)['status'] == 'active']
#         return active_messages

#     def dismiss_message(self, message_id:int) -> None:
#         messages  = self.r.lrange('messages', 0, -1)
#         for i, msg in messages:
#             message = json.loads(msg)
#             if message['id'] == message_id:
#                 message['status'] = 'dismissed'
#                 self.r.lset('messages', i, json.dumps(message))
#                 break
    
#     async def get_dismissed_messages(self) -> list[Any]:
#         messages = await self.r.lrange('messages', 0, -1)
#         dismissed_messages = [json.loads(msg) for msg in messages if json.loads(msg)['status'] == 'dismissed']
#         return dismissed_messages
