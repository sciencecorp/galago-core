import logging
import os
# from dotenv import load_dotenv

from tools.base_server import ToolServer, serve
from tools.grpc_interfaces.helix_tool_pb2 import Command, Config
from .driver import HelixClientDriver
from tools.grpc_interfaces.tool_base_pb2 import ExecuteCommandReply

import typing as t
from google.protobuf.struct_pb2 import Struct

import argparse

def struct_to_dict(
    struct: Struct, out: t.Optional[t.Dict[t.Any, t.Any]] = None
) -> t.Dict[t.Any, t.Any]:
    if not out:
        out = {}
    for key, value in struct.items():
        if isinstance(value, Struct):
            out[key] = struct_to_dict(value)
        else:
            out[key] = value
    return out


class HelixToolServer(ToolServer):
    toolType = "helix_tool"
    driver: HelixClientDriver
    config: Config

    def __init__(self) -> None:
        super().__init__()

    def _configure(self, config: Config) -> None:
        self.config = config
        self.driver = HelixClientDriver(
            base_path=self.config.helix_url,
            inventory_base_path=self.config.inventory_url,
            cytation_raw_data_directory=self.config.cytation_data_directory,
            synology_directory=self.config.synology_directory
        )

    def CompleteTodo(self, params: Command.CompleteTodo) -> None:
        self.driver.post_todo(params.todo_id)

    # def SlackMessage(self, params: Command.SlackMessage) -> None:
    #     self.driver.slack_message(params.message)

    def PassageCulture(self, params: Command.PassageCulture) -> None:
        self.driver.passage_culture(
            culture_id=params.culture_id,
            well_plate_id=params.well_plate_id,
            mark_dead=params.mark_dead,
            plate_type=params.plate_type,
        )

    def PostNote(self, params: Command.PostNote) -> None:
        self.driver.post_note_to_helix(culture_id = params.culture_id, 
                                       well = params.well,
                                       note = params.note)

    def SlackConfluencyMessage(self, params:Command.SlackConfluencyMessage) -> None:
        self.driver.send_confluency_slack(params.data_file, params.culture_id, params.threshold)
    
    def PostMeasurement(self, params: Command.PostMeasurement) -> None:
        self.driver.post_measurement(params.measurement_data)

    def UploadDataToSynology(self, params: Command.UploadDataToSynology) -> None:
        self.driver.upload_data_to_synology(
            params.local_directory, params.synology_directory
        )

    def UpdateConsumables(self, params: Command.UpdateConsumables) -> None:
        self.driver.update_consumables(reagent_ids=params.reagent_ids)

    def UploadCytationImagesToSynology(
        self, params: Command.UploadCytationImagesToSynology
    ) -> None:
        self.driver.upload_cytation_images_to_synology(
            culture_id=params.culture_id,
        )
    def EstimateSlackConfluencyMessage(self, params: Command.SlackConfluencyMessage) -> int:
        return 1

    def EstimateUploadDataToSynology(self, params: Command.UploadDataToSynology) -> int:
        return 1

    def EstimateCompleteTodo(self, params: Command.CompleteTodo) -> int:
        return 1

    def EstimatePostMeasurement(self, params: Command.PostMeasurement) -> int:
        return 1

    def EstimateUpdateConsumables(self, params: Command.UpdateConsumables) -> int:
        return 1

    def EstimateSlackMessage(self, params: Command.SlackMessage) -> int:
        return 1
    
    def EstimatePostNote(self, params: Command.PostNote) -> int:
        return 1

    def EstimateUploadCytationImagesToSynology(self, params: Command.UploadCytationImagesToSynology) -> int:
        return 1
    
    def EstimatePassageCulture(self, params: Command.PassageCulture) -> int:
        return 1
    
        



    def PostDataObject(self, params: Command.PostDataObject) -> ExecuteCommandReply:
        response_dict = self.driver.post_data_object(
            data_type=params.data_type,
            object_data=struct_to_dict(params.object_data),
            files=[f for f in params.files],
            val_only=params.val_only,
        )

        response = ExecuteCommandReply()
        response.return_reply = response_dict["return_reply"]
        response.response = response_dict["response"]
        response.error_message = response_dict["error_message"]

        return response

    def PostDataObjectFromLocalDirectory(
        self, params: Command.PostDataObjectFromLocalDirectory
    ) -> ExecuteCommandReply:
        response_dict = self.driver.post_data_object_from_local_directory(
            dirpath=params.dirpath,
            data_type=params.data_type,
            object_data=struct_to_dict(params.object_data),
            val_only=params.val_only,
        )

        response = ExecuteCommandReply()
        response.return_reply = response_dict["return_reply"]
        response.response = response_dict["response"]
        response.error_message = response_dict["error_message"]



        return response

  
    def EstimatePostDataObject(self, params: Command.PostDataObject) -> int:
        return 1

    def EstimatePostDataObjectFromLocalDirectory(
        self, params: Command.PostDataObjectFromLocalDirectory
    ) -> int:
        return 1

    def HandleTodoCompletion(self, params: Command.HandleTodoCompletion) -> None:
        # TODO: Replace with do_pipeline_run or something
        # Requiremnts:
        # 1 - identify what kind of todo it is
        # 2 - Check if side effects have been completed yet
        # 3 - perform the appropriate "side effects"
        # 4 - Send some alert about whether action was successful or not
        logging.info("Handling Todo Completion")

    def EstimateHandleTodoCompletion(self, params: Command.HandleTodoCompletion) -> int:
        return 1
    
    


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    parser = argparse.ArgumentParser()
    parser.add_argument('--port')
    args = parser.parse_args()
    if not args.port:
         raise RuntimeWarning("Port must be provided...")
    serve(HelixToolServer(), os.environ.get("PORT", str(args.port)))
