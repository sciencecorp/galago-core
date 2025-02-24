from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import schemas
import db.models.inventory_models as models
import db.models.log_models as log_model
import typing as t
from datetime import datetime

ModelType = TypeVar("ModelType", bound=models.Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]) -> None:
        """
        CRUD object with default methods to Create, Read, Update, Delete
        (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    def paginate(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 50,
        order_by: Optional[str] = None,
        descending: bool = False,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        query = db.query(self.model)
        if filters:
            query = query.filter_by(**filters)
        if descending:
            query = query.order_by(self.model.id.desc())
        else:
            query = query.order_by(self.model.id)
        return query.offset(skip).limit(limit).all()

    def get(self, db: Session, id: t.Union[int, str]) -> Optional[ModelType]:
        if isinstance(id, int):
            return db.query(self.model).filter(self.model.id == id).one_or_none()
        elif isinstance(id, str) and id.isdigit():
            return db.query(self.model).filter(self.model.id == int(id)).one_or_none()
        elif isinstance(id, str):
            return db.query(self.model).filter(self.model.name == id).one_or_none()
        else:
            return db.query(self.model).filter(self.model.name == id).one_or_none()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def get_all(self, db: Session) -> List[ModelType]:
        return db.query(self.model).all()

    def get_by(
        self,
        db: Session,
        *,
        obj_in: Dict[str, Any],
    ) -> Optional[ModelType]:
        obj_in_data = self._exclude_unset(jsonable_encoder(obj_in))
        db_objs = db.query(self.model).filter_by(**obj_in_data)
        return db_objs.one_or_none()

    def get_all_by(
        self,
        db: Session,
        *,
        obj_in: Dict[str, Any],
    ) -> List[ModelType]:
        obj_in_data = self._exclude_unset(jsonable_encoder(obj_in))
        db_objs = db.query(self.model).filter_by(**obj_in_data)
        return db_objs.all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        # If the object has a date field, set it to datetime object
        for key in obj_in_data:
            if "date" in key:
                obj_in_data[key] = getattr(obj_in, key)
        db_obj = self.model(**obj_in_data)  # type: ignore
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        created_obj = self.get(db=db, id=db_obj.id)
        if created_obj is None:
            raise ValueError(f"Object with id {db_obj.id} does not exist")
        return created_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        obj = self.get(db=db, id=id)
        if obj is None:
            raise ValueError(f"Object with id {id} does not exist")
        db.delete(obj)
        db.commit()
        return obj

    def remove_all(self, db: Session) -> List[ModelType]:
        objs = self.get_all(db=db)
        for obj in objs:
            db.delete(obj)
        db.commit()
        return objs

    def _exclude_unset(self, d: dict[Any, Any]) -> dict[Any, Any]:
        """Remove entries in dict with value None

        From: https://medium.com/better-programming/how-to-remove-
        null-none-values-from-a-dictionary-in-python-1bedf1aab5e4
        """
        clean = {}
        for key, value in d.items():
            if isinstance(value, dict):
                nested = self._exclude_unset(value)
                if len(nested.keys()) > 0:
                    clean[key] = nested
            elif value is not None:
                clean[key] = value
        return clean

    def get_all_by_workcell_id(
        self, db: Session, workcell_id: int, obj_in: Dict[str, Any] = {}
    ) -> List[ModelType]:
        obj_in_data = self._exclude_unset(jsonable_encoder(obj_in))
        query = db.query(self.model)

        if self.model == models.Workcell:
            return (
                query.filter(models.Workcell.id == workcell_id)
                .filter_by(**obj_in_data)
                .all()
            )
        elif self.model == models.Tool:
            query = query.join(models.Workcell).filter(
                models.Workcell.id == workcell_id
            )
        elif self.model == models.Nest:
            query = (
                query.join(models.Tool)
                .join(models.Workcell)
                .filter(models.Workcell.id == workcell_id)
            )
        elif self.model == models.Plate:
            query = (
                query.join(models.Nest)
                .join(models.Tool)
                .join(models.Workcell)
                .filter(models.Workcell.id == workcell_id)
            )
        elif self.model == models.Well:
            query = (
                query.join(models.Plate)
                .join(models.Nest)
                .join(models.Tool)
                .join(models.Workcell)
                .filter(models.Workcell.id == workcell_id)
            )
        elif self.model == models.Reagent:
            query = (
                query.join(models.Well)
                .join(models.Plate)
                .join(models.Nest)
                .join(models.Tool)
                .join(models.Workcell)
                .filter(models.Workcell.id == workcell_id)
            )
        else:
            raise ValueError("Failed to get all by workcell id.")

        return query.filter_by(**obj_in_data).all()


class CRUDNest(CRUDBase[models.Nest, schemas.NestCreate, schemas.NestUpdate]):
    def __init__(self):
        super().__init__(models.Nest)

    def get_available_nests(self, db: Session, tool_id: Optional[int] = None) -> List[models.Nest]:
        """Get all available (empty) nests, optionally filtered by tool_id"""
        query = db.query(models.Nest).filter(models.Nest.status == models.NestStatus.empty)
        if tool_id:
            query = query.filter(models.Nest.tool_id == tool_id)
        return query.all()

    def check_in_plate(
        self, 
        db: Session, 
        nest_id: int, 
        plate_data: schemas.PlateCreate
    ) -> models.Plate:
        """Check in a plate to a nest"""
        # Verify nest is available
        nest = db.query(models.Nest).filter(
            models.Nest.id == nest_id,
            models.Nest.status == models.NestStatus.empty
        ).first()
        if not nest:
            raise ValueError("Nest is not available")

        # Create plate
        plate = models.Plate(
            **plate_data.dict(),
            nest_id=nest_id,
            status=models.PlateStatus.stored
        )
        db.add(plate)

        # Update nest status
        nest.status = models.NestStatus.occupied

        # Record history
        history = models.PlateNestHistory(
            plate_id=plate.id,
            nest_id=nest_id,
            action=models.PlateNestAction.check_in
        )
        db.add(history)
        
        db.commit()
        db.refresh(plate)
        return plate

    def check_out_plate(
        self, 
        db: Session, 
        plate_id: int
    ) -> models.Plate:
        """Check out a plate from its nest"""
        plate = db.query(models.Plate).filter(models.Plate.id == plate_id).first()
        if not plate or not plate.nest_id:
            raise ValueError("Plate not found or not in a nest")

        nest = db.query(models.Nest).filter(models.Nest.id == plate.nest_id).first()
        if not nest:
            raise ValueError("Associated nest not found")

        # Record history
        history = models.PlateNestHistory(
            plate_id=plate.id,
            nest_id=nest.id,
            action=models.PlateNestAction.check_out
        )
        db.add(history)

        # Update nest and plate
        nest.status = models.NestStatus.empty
        plate.nest_id = None
        plate.status = models.PlateStatus.in_use

        db.commit()
        db.refresh(plate)
        return plate

    def transfer_plate(
        self, 
        db: Session, 
        plate_id: int, 
        new_nest_id: int
    ) -> models.Plate:
        """Transfer a plate from one nest to another"""
        plate = db.query(models.Plate).filter(models.Plate.id == plate_id).first()
        if not plate:
            raise ValueError("Plate not found")

        new_nest = db.query(models.Nest).filter(
            models.Nest.id == new_nest_id,
            models.Nest.status == models.NestStatus.empty
        ).first()
        if not new_nest:
            raise ValueError("New nest is not available")

        old_nest_id = plate.nest_id
        if old_nest_id:
            old_nest = db.query(models.Nest).filter(models.Nest.id == old_nest_id).first()
            if old_nest:
                old_nest.status = models.NestStatus.empty

        # Record history
        history = models.PlateNestHistory(
            plate_id=plate.id,
            nest_id=new_nest_id,
            action=models.PlateNestAction.transfer
        )
        db.add(history)

        # Update new nest and plate
        new_nest.status = models.NestStatus.occupied
        plate.nest_id = new_nest_id

        db.commit()
        db.refresh(plate)
        return plate


workcell = CRUDBase[models.Workcell, schemas.WorkcellCreate, schemas.WorkcellUpdate](
    models.Workcell
)

nest = CRUDNest()
plate = CRUDBase[models.Plate, schemas.PlateCreate, schemas.PlateUpdate](models.Plate)
well = CRUDBase[models.Well, schemas.WellCreate, schemas.WellUpdate](models.Well)
reagent = CRUDBase[models.Reagent, schemas.ReagentCreate, schemas.ReagentUpdate](
    models.Reagent
)
tool = CRUDBase[models.Tool, schemas.ToolCreate, schemas.ToolUpdate](models.Tool)
logs = CRUDBase[log_model.Log, schemas.LogCreate, schemas.LogUpdate](log_model.Log)
variables = CRUDBase[models.Variable, schemas.VariableCreate, schemas.VariableUpdate](
    models.Variable
)
labware = CRUDBase[models.Labware, schemas.LabwareCreate, schemas.LabwareUpdate](
    models.Labware
)
settings = CRUDBase[
    models.AppSettings, schemas.AppSettingsCreate, schemas.AppSettingsUpdate
](models.AppSettings)
scripts = CRUDBase[models.Script, schemas.ScriptCreate, schemas.ScriptUpdate](
    models.Script
)
robot_arm_location = CRUDBase[
    models.RobotArmLocation,
    schemas.RobotArmLocationCreate,
    schemas.RobotArmLocationUpdate,
](models.RobotArmLocation)
robot_arm_nest = CRUDBase[
    models.RobotArmNest, schemas.RobotArmNestCreate, schemas.RobotArmNestUpdate
](models.RobotArmNest)
robot_arm_sequence = CRUDBase[
    models.RobotArmSequence,
    schemas.RobotArmSequenceCreate,
    schemas.RobotArmSequenceUpdate,
](models.RobotArmSequence)
robot_arm_motion_profile = CRUDBase[
    models.RobotArmMotionProfile,
    schemas.RobotArmMotionProfileCreate,
    schemas.RobotArmMotionProfileUpdate,
](models.RobotArmMotionProfile)
robot_arm_grip_params = CRUDBase[
    models.RobotArmGripParams,
    schemas.RobotArmGripParamsCreate,
    schemas.RobotArmGripParamsUpdate,
](models.RobotArmGripParams)
