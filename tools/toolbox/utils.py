from google.protobuf.struct_pb2 import Struct
import typing as t
def get_slack_id_from_scientist_name(name:str) -> str:
        slack_id = "unknown"
        scientists_dict = {"Rebecca":"U067D3K8HNE","Seleipiri":"U03G2RGPHFZ", "kev":"U03FBQAR4FQ", "Amanda":"U05JFV4K9SQ", "Mojgan":"U0593QZTL5V","Amy":"U03H3NUT6AK","Kacy":"U05RMNDAPMW","Alberto":"U04P85SJABD","Mo":"U039K2JDUD6","active_culture_status":"C0565B3JGFQ"}
        if(name in scientists_dict):
            slack_id = scientists_dict[name]
        return slack_id

def struct_to_dict(struct: Struct) -> t.Any:
    out = {}
    for key, value in struct.items():
        if isinstance(value, Struct):
            out[key] = struct_to_dict(value)
        else:
            out[key] = value
    return out
