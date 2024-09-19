"""
Universal opentrons script that is designed to execute protocols written
in json format. Since, this script is mean to execute on the opentrons
hardware, it must conform to the software limitations of the opentrons
server. This means that it must be written in python 3.7 and must be
compatible with the opentrons API v2.12.
"""

import typing as t
from pydantic import BaseModel, Field  # type: ignore
from opentrons import protocol_api, types


class ProtocolStepComment(BaseModel):
    process: str = Field("Comment", const=True)
    name: str
    description: str = ""
    waitForUser: bool = False
    pauseMessage: t.Optional[str] = None

    def execute(self, protocol: protocol_api.ProtocolContext) -> None:
        protocol.comment(self.name)
        protocol.comment(self.description)

        if self.waitForUser:
            protocol.pause(self.pauseMessage)


class ProtocolStepDelay(BaseModel):
    process: str = Field("Delay", const=True)
    name: str
    description: str = ""
    delayTime: int

    def execute(self, protocol: protocol_api.ProtocolContext) -> None:
        protocol.comment(self.name)
        protocol.comment(self.description)
        protocol.delay(minutes=self.delayTime)


class PipetteTipInfo(BaseModel):
    pipetteSlot: str  # t.Literal["left", "right"]
    pickUpTipLocation: str
    pickUpTipStart: t.Optional[str] = None
    dropOffTipLocation: str
    singleChannelMode: bool = False  # only for multichannel pipettes


class TransferInfo(BaseModel):
    volume: t.Union[float, t.List[float]]
    source_wells_name: str
    destination_wells_name: str
    new_tip: str = "once"
    trash: bool = True
    touch_tip: bool = False
    blow_out: bool = False
    blowout_location: t.Optional[str] = None
    mix_before: t.Tuple[int, float] = (0, 0)
    mix_after: t.Tuple[int, float] = (0, 0)
    carryover: bool = True
    air_gap: int = 0
    flow_rate: int = 300


class ProtocolStepTransfer(BaseModel):
    process: str = Field("Transfer", const=True)
    name: str
    description: str = ""
    pipetteTipInfo: PipetteTipInfo
    transferInfo: TransferInfo

    def execute(
        self,
        protocol: protocol_api.ProtocolContext,
        pipette: "PipetteEntry",
        pickup_tip_box: "PipetteTipBoxEntry",
        source_wells: "WellsEntry",
        destination_wells: "WellsEntry",
    ) -> None:
        if (
            (pipette.pipette is None)
            or (pickup_tip_box.tip_box is None)
            or (source_wells.labware is None)
            or (source_wells.labware.labware is None)
            or (destination_wells.labware is None)
            or (destination_wells.labware.labware is None)
        ):
            raise ValueError("Need to load opentrons program before executing Distribute step")

        protocol.comment(self.name)
        protocol.comment(self.description)

        pipette.pipette.flow_rate.aspirate = self.transferInfo.flow_rate
        pipette.pipette.flow_rate.dispense = self.transferInfo.flow_rate

        if self.pipetteTipInfo.singleChannelMode:
            pipette.pipette.hw_pipette["channels"] = 1
            new_tip = "never"
        else:
            pipette.pipette.tip_racks = [pickup_tip_box.tip_box]
            if self.pipetteTipInfo.pickUpTipStart:
                pipette.pipette.starting_tip = pickup_tip_box.tip_box[
                    self.pipetteTipInfo.pickUpTipStart
                ]
            new_tip = self.transferInfo.new_tip

        multichannel_mode: bool = (
            pipette.isMultichannel() and not self.pipetteTipInfo.singleChannelMode
        )

        if self.pipetteTipInfo.singleChannelMode and self.pipetteTipInfo.pickUpTipStart is not None:
            pipette.pipette.pick_up_tip(pickup_tip_box.tip_box[self.pipetteTipInfo.pickUpTipStart])

        pipette.pipette.transfer(
            volume=self.transferInfo.volume,
            source=source_wells.labware.labware.wells(
                *source_wells.get_well_names(multichannel=multichannel_mode)
            ),
            dest=destination_wells.labware.labware.wells(
                *destination_wells.get_well_names(multichannel=multichannel_mode)
            ),
            new_tip=new_tip,
            trash=self.transferInfo.trash,
            touch_tip=self.transferInfo.touch_tip,
            blow_out=self.transferInfo.blow_out,
            blowout_location=self.transferInfo.blowout_location,
            mix_before=self.transferInfo.mix_before,
            mix_after=self.transferInfo.mix_after,
            carryover=self.transferInfo.carryover,
            air_gap=self.transferInfo.air_gap,
        )

        if self.pipetteTipInfo.singleChannelMode:
            pipette.pipette.drop_tip()


class CustomTransferInfo(TransferInfo):
    volume: t.Union[float, t.List[float]]
    source_wells_name: str
    destination_wells_name: str
    aspirate_well_bottom_clearance: float = 1.0
    dispense_well_bottom_clearance: float = 1.0
    touch_tip: bool = False
    blow_out: bool = False
    blowout_location: t.Optional[str] = None
    mix_before: t.Tuple[int, float] = (0, 0)
    mix_after: t.Tuple[int, float] = (0, 0)
    carryover: bool = True
    air_gap: int = 0
    flow_rate: int = 300


class ProtocolStepCustomTransfer(BaseModel):
    process: str = Field("CustomTransfer", const=True)
    name: str
    description: str = ""
    pipetteTipInfo: PipetteTipInfo
    customTransferInfo: CustomTransferInfo

    def execute(
        self,
        protocol: protocol_api.ProtocolContext,
        pipette: "PipetteEntry",
        pickup_tip_box: "PipetteTipBoxEntry",
        dropoff_tip_box: t.Union["PipetteTipBoxEntry", str],
        source_wells: "WellsEntry",
        destination_wells: "WellsEntry",
    ) -> None:
        if (
            (pipette.pipette is None)
            or (pickup_tip_box.tip_box is None)
            or (source_wells.labware is None)
            or (source_wells.labware.labware is None)
            or (destination_wells.labware is None)
            or (destination_wells.labware.labware is None)
        ):
            raise ValueError("Need to load opentrons program before executing Distribute step")
        if self.pipetteTipInfo.pickUpTipStart is None:
            raise ValueError("Need to specify pickUpTipStart for custom transfer")
        # if isinstance(self.customTransferInfo.volume, list):
        #     raise ValueError("Custom transfer does not support multiple volumes")

        protocol.comment(self.name)
        protocol.comment(self.description)

        pipette.pipette.flow_rate.aspirate = self.customTransferInfo.flow_rate
        pipette.pipette.flow_rate.dispense = self.customTransferInfo.flow_rate
        pipette.pipette.well_bottom_clearance.aspirate = (
            self.customTransferInfo.aspirate_well_bottom_clearance
        )
        pipette.pipette.well_bottom_clearance.dispense = (
            self.customTransferInfo.dispense_well_bottom_clearance
        )

        pipette_type = types.Mount.RIGHT if pipette.mount == "right" else types.Mount.LEFT

        multichannel_mode: bool = (
            pipette.isMultichannel() and not self.pipetteTipInfo.singleChannelMode
        )
        if self.pipetteTipInfo.singleChannelMode:
            pipette.pipette.hw_pipette["channels"] = 1
            protocol._hw_manager.hardware._attached_instruments[pipette_type].update_config_item(  # type: ignore
                "pick_up_current", 0.1
            )

        source_well_names = source_wells.get_well_names(multichannel=multichannel_mode)
        destination_well_names = destination_wells.get_well_names(multichannel=multichannel_mode)

        if len(source_well_names) == 1 and len(destination_well_names) == 1:
            if isinstance(self.customTransferInfo.volume, list):
                raise ValueError("Cannot have multiple volumes for single transfers")
            source_well = source_wells.labware.labware.wells(
                source_wells.get_well_names(multichannel=multichannel_mode)[0]
            )[0]
            destination_well = destination_wells.labware.labware.wells(
                destination_wells.get_well_names(multichannel=multichannel_mode)[0]
            )[0]

            pipette.pipette.pick_up_tip(pickup_tip_box.tip_box[self.pipetteTipInfo.pickUpTipStart])

            if self.customTransferInfo.mix_before[0] > 0:
                pipette.pipette.mix(
                    repetitions=self.customTransferInfo.mix_before[0],
                    volume=self.customTransferInfo.mix_before[1],
                    location=source_well,
                )

            total_volume = self.customTransferInfo.volume
            volume_per_step = min(total_volume, pickup_tip_box.max_volume)
            steps = int(total_volume / volume_per_step) + (total_volume % volume_per_step > 0)

            for step in range(steps):
                if step == steps - 1:
                    volume_per_step = total_volume - volume_per_step * step
                pipette.pipette.aspirate(volume=volume_per_step, location=source_well)

                if self.customTransferInfo.air_gap:
                    pipette.pipette.air_gap(self.customTransferInfo.air_gap)

                destination_location: t.Union[types.Location, protocol_api.labware.Well]
                if step == steps - 1:
                    destination_location = destination_well
                else:
                    destination_location = destination_well.top()
                pipette.pipette.dispense(
                    volume=volume_per_step + self.customTransferInfo.air_gap,
                    location=destination_location,
                )

            if self.customTransferInfo.mix_after[0] > 0:
                pipette.pipette.mix(
                    repetitions=self.customTransferInfo.mix_after[0],
                    volume=self.customTransferInfo.mix_after[1],
                    location=destination_well,
                )

            if self.customTransferInfo.blow_out:
                if self.customTransferInfo.blowout_location == "trash":
                    pipette.pipette.blow_out()
                else:
                    pipette.pipette.blow_out(destination_well.top())

            if self.customTransferInfo.touch_tip:
                pipette.pipette.touch_tip(destination_well)

            if isinstance(dropoff_tip_box, str) and dropoff_tip_box == "trash":
                pipette.pipette.drop_tip()
            else:
                pipette.pipette.return_tip()
        else:
            if len(source_well_names) != len(destination_well_names):
                raise ValueError(
                    f"Number of source wells and destination wells must be equal: {str(source_well_names)} {str(destination_well_names)}"
                )
            if isinstance(self.customTransferInfo.volume, float):
                raise ValueError("Cannot have single volume for custom transfer")

            pipette.pipette.pick_up_tip(pickup_tip_box.tip_box[self.pipetteTipInfo.pickUpTipStart])
            for source_well_name, destination_well_name, total_volume in list(
                zip(
                    source_well_names,
                    destination_well_names,
                    self.customTransferInfo.volume,
                )
            ):
                if total_volume < 1:
                    continue
                source_well = source_wells.labware.labware.wells(source_well_name)[0]
                destination_well = destination_wells.labware.labware.wells(destination_well_name)[0]

                if self.customTransferInfo.mix_before[0] > 0:
                    pipette.pipette.mix(
                        repetitions=self.customTransferInfo.mix_before[0],
                        volume=self.customTransferInfo.mix_before[1],
                        location=source_well,
                    )

                volume_per_step = min(total_volume, pickup_tip_box.max_volume)
                steps = int(total_volume / volume_per_step) + (total_volume % volume_per_step > 0)

                for step in range(steps):
                    if step == steps - 1:
                        volume_per_step = total_volume - volume_per_step * step
                    pipette.pipette.aspirate(volume=volume_per_step, location=source_well)

                    if self.customTransferInfo.air_gap:
                        pipette.pipette.air_gap(self.customTransferInfo.air_gap)

                    if step == steps - 1:
                        destination_location = destination_well
                    else:
                        destination_location = destination_well.top()
                    pipette.pipette.dispense(
                        volume=volume_per_step + self.customTransferInfo.air_gap,
                        location=destination_location,
                    )

                if self.customTransferInfo.mix_after[0] > 0:
                    pipette.pipette.mix(
                        repetitions=self.customTransferInfo.mix_after[0],
                        volume=self.customTransferInfo.mix_after[1],
                        location=destination_well,
                    )

                if self.customTransferInfo.blow_out:
                    if self.customTransferInfo.blowout_location == "trash":
                        pipette.pipette.blow_out()
                    else:
                        pipette.pipette.blow_out(destination_well.top())

                if self.customTransferInfo.touch_tip:
                    pipette.pipette.touch_tip(destination_well)

            if isinstance(dropoff_tip_box, str) and dropoff_tip_box == "trash":
                pipette.pipette.drop_tip()
            else:
                pipette.pipette.return_tip()


class DistributeInfo(TransferInfo):
    disposal_volume: float = 0.0


class ProtocolStepDistribute(BaseModel):
    process: str = Field("Distribute", const=True)
    name: str
    description: str = ""
    pipetteTipInfo: PipetteTipInfo
    distributeInfo: DistributeInfo

    def execute(
        self,
        protocol: protocol_api.ProtocolContext,
        pipette: "PipetteEntry",
        pickup_tip_box: "PipetteTipBoxEntry",
        source_wells: "WellsEntry",
        destination_wells: "WellsEntry",
    ) -> None:
        if (
            (pipette.pipette is None)
            or (pickup_tip_box.tip_box is None)
            or (source_wells.labware is None)
            or (source_wells.labware.labware is None)
            or (destination_wells.labware is None)
            or (destination_wells.labware.labware is None)
        ):
            raise ValueError("Need to load opentrons program before executing Distribute step")

        protocol.comment(self.name)
        protocol.comment(self.description)

        pipette.pipette.flow_rate.aspirate = self.distributeInfo.flow_rate
        pipette.pipette.flow_rate.dispense = self.distributeInfo.flow_rate
        pipette.pipette.tip_racks = [pickup_tip_box.tip_box]
        if self.pipetteTipInfo.pickUpTipStart:
            pipette.pipette.starting_tip = pickup_tip_box.tip_box[
                self.pipetteTipInfo.pickUpTipStart
            ]
        multichannel_mode: bool = (
            pipette.isMultichannel() and not self.pipetteTipInfo.singleChannelMode
        )
        if self.pipetteTipInfo.singleChannelMode:
            pipette.pipette.hw_pipette["channels"] = 1
        source_well = source_wells.labware.labware.wells(
            source_wells.get_well_names(multichannel=multichannel_mode)[0]
        )[0]

        pipette.pipette.distribute(
            volume=self.distributeInfo.volume,
            source=source_well,
            dest=destination_wells.labware.labware.wells(
                *destination_wells.get_well_names(multichannel=multichannel_mode)
            ),
            new_tip=self.distributeInfo.new_tip,
            trash=self.distributeInfo.trash,
            touch_tip=self.distributeInfo.touch_tip,
            blow_out=self.distributeInfo.blow_out,
            blowout_location=self.distributeInfo.blowout_location,
            mix_before=self.distributeInfo.mix_before,
            mix_after=self.distributeInfo.mix_after,
            carryover=self.distributeInfo.carryover,
            air_gap=self.distributeInfo.air_gap,
            disposal_volume=self.distributeInfo.disposal_volume,
        )


class ConsolidateInfo(TransferInfo):
    pass


class ProtocolStepConsolidate(BaseModel):
    process: str = Field("Consolidate", const=True)
    name: str
    description: str = ""
    pipetteTipInfo: PipetteTipInfo
    consolidateInfo: ConsolidateInfo

    def execute(
        self,
        protocol: protocol_api.ProtocolContext,
        pipette: "PipetteEntry",
        pickup_tip_box: "PipetteTipBoxEntry",
        source_wells: "WellsEntry",
        destination_wells: "WellsEntry",
    ) -> None:
        if (
            (pipette.pipette is None)
            or (pickup_tip_box.tip_box is None)
            or (source_wells.labware is None)
            or (source_wells.labware.labware is None)
            or (destination_wells.labware is None)
            or (destination_wells.labware.labware is None)
        ):
            raise ValueError("Need to load opentrons program before executing Distribute step")

        protocol.comment(self.name)
        protocol.comment(self.description)

        pipette.pipette.flow_rate.aspirate = self.consolidateInfo.flow_rate
        pipette.pipette.flow_rate.dispense = self.consolidateInfo.flow_rate
        pipette.pipette.tip_racks = [pickup_tip_box.tip_box]
        if self.pipetteTipInfo.pickUpTipStart:
            pipette.pipette.starting_tip = pickup_tip_box.tip_box[
                self.pipetteTipInfo.pickUpTipStart
            ]
        multichannel_mode: bool = (
            pipette.isMultichannel() and not self.pipetteTipInfo.singleChannelMode
        )
        if self.pipetteTipInfo.singleChannelMode:
            pipette.pipette.hw_pipette["channels"] = 1
        destination_well = destination_wells.labware.labware.wells(
            destination_wells.get_well_names(multichannel=multichannel_mode)[0]
        )[0]

        pipette.pipette.consolidate(
            volume=self.consolidateInfo.volume,
            source=source_wells.labware.labware.wells(
                *source_wells.get_well_names(multichannel=multichannel_mode)
            ),
            dest=destination_well,
            new_tip=self.consolidateInfo.new_tip,
            trash=self.consolidateInfo.trash,
            touch_tip=self.consolidateInfo.touch_tip,
            blow_out=self.consolidateInfo.blow_out,
            blowout_location=self.consolidateInfo.blowout_location,
            mix_before=self.consolidateInfo.mix_before,
            mix_after=self.consolidateInfo.mix_after,
            carryover=self.consolidateInfo.carryover,
            air_gap=self.consolidateInfo.air_gap,
        )


class ProtocolStepTemperatureModule(BaseModel):
    process: str = Field("TemperatureModule", const=True)
    name: str
    description: str = ""
    setPoint: t.Optional[float] = None

    def execute(self, protocol: protocol_api.ProtocolContext, module: "ModuleEntry") -> None:
        protocol.comment(self.name)
        protocol.comment(self.description)

        if isinstance(module.module, protocol_api.TemperatureModuleContext):
            if self.setPoint:
                module.module.set_temperature(celsius=self.setPoint)
            else:
                module.module.deactivate()
        else:
            raise ValueError(f"Cannot set temperature for module {module.module}")


class ProtocolStep(BaseModel):
    __root__: t.Union[
        ProtocolStepTransfer,
        ProtocolStepDistribute,
        ProtocolStepConsolidate,
        ProtocolStepDelay,
        ProtocolStepComment,
        ProtocolStepTemperatureModule,
        ProtocolStepCustomTransfer,
    ]


class Slot(int):
    @classmethod
    def __get_validators__(cls) -> t.Generator[t.Callable[..., t.Any], None, None]:
        yield cls.validate

    @classmethod
    def validate(cls, v: t.Any) -> int:
        if not isinstance(v, int):
            raise ValueError(f"Slot must be an integer, got {v}")
        if v < 1 or v > 11:
            raise ValueError(f"Slot must be between 1 and 11, got {v}")
        return v


class PipetteEntry(BaseModel):
    type: str
    mount: str  # t.Literal["left", "right"]
    volume_used: int = 0
    pipette: t.Optional[protocol_api.InstrumentContext] = None

    def load(self, protocol: protocol_api.ProtocolContext) -> None:
        self.pipette = protocol.load_instrument(self.type, self.mount)

    def isMultichannel(self) -> bool:
        if self.type.find("multi"):
            return True
        return False

    class Config:
        arbitrary_types_allowed = True


class LabwareEntry(BaseModel):
    name: str
    type: str
    size: int
    slot: Slot
    offset: t.Optional[t.Tuple[float, float, float]] = None
    labware: t.Optional[protocol_api.Labware] = None

    def load(
        self,
        protocol: protocol_api.ProtocolContext,
    ) -> None:
        self.labware = protocol.load_labware(self.type, self.slot)
        if self.offset is not None:
            x, y, z = self.offset
            self.labware.set_offset(x=x, y=y, z=z)

    class Config:
        arbitrary_types_allowed = True


class WellInfo(BaseModel):
    name: str
    initial_volume: int

    def isOddOrEven(self) -> str:  # t.Literal["Even", "Odd"]:
        if int(list(self.name)[len(list(self.name)) - 1]) % 2 == 0:
            return "Even"
        else:
            return "Odd"

    def __add__(self, additionVolume: int) -> None:
        self.initial_volume += additionVolume

    def __sub__(self, subtractionVolume: int) -> None:
        self.initial_volume -= subtractionVolume


class WellsEntry(BaseModel):
    name: str
    labware_name: str
    wells: t.List[str]
    initial_volume: int
    single_wells: t.List[WellInfo] = []
    labware: t.Optional[LabwareEntry] = None

    def load(self, labware: LabwareEntry) -> None:
        self.labware = labware

        for well in self.wells:
            self.single_wells.append(WellInfo(name=well, initial_volume=self.initial_volume))

    def get_multi_wells(self) -> t.List[WellInfo]:
        return [well for well in self.single_wells if well.name.find("A") != -1]

    def get_well_names(self, multichannel: bool = False) -> t.List[str]:
        wells: t.List[WellInfo] = self.get_multi_wells() if multichannel else self.single_wells
        return [well.name for well in wells]


class PipetteTipBoxEntry(BaseModel):
    name: str
    type: str
    max_volume: int
    slot: Slot
    offset: t.Optional[t.Tuple[float, float, float]] = None
    tip_box: t.Optional[protocol_api.Labware] = None

    def load(self, protocol: protocol_api.ProtocolContext) -> None:
        self.tip_box = protocol.load_labware(self.type, self.slot)
        if self.offset is not None:
            x, y, z = self.offset
            self.tip_box.set_offset(x=x, y=y, z=z)

    class Config:
        arbitrary_types_allowed = True


class ModuleEntry(BaseModel):
    type: str
    slot: Slot
    module: t.Optional[
        t.Union[protocol_api.TemperatureModuleContext, protocol_api.ThermocyclerContext]
    ] = None

    def load(self, protocol: protocol_api.ProtocolContext) -> None:
        tmp_module = protocol.load_module(self.type, self.slot)
        if isinstance(tmp_module, protocol_api.TemperatureModuleContext):
            self.module = tmp_module
        elif isinstance(tmp_module, protocol_api.ThermocyclerContext):
            self.module = tmp_module
            self.module.open_lid()
        else:
            raise ValueError(f"Module type {self.type} not supported")

    class Config:
        arbitrary_types_allowed = True


class OpentronsProgram(BaseModel):
    pipettes: t.List[PipetteEntry]
    labwares: t.List[LabwareEntry]
    wells: t.List[WellsEntry]
    tip_boxes: t.List[PipetteTipBoxEntry]
    modules: t.List[ModuleEntry]
    steps: t.List[ProtocolStep]
    protocol: t.Optional[protocol_api.ProtocolContext] = None

    # @validator("labwares", "tip_boxes")
    # def slots_unique(cls, v: t.List[LabwareEntry | PipetteTipBoxEntry]) -> t.List[LabwareEntry | PipetteTipBoxEntry]:
    #     slots: t.List[Slot] = [stuff.slot for stuff in v]
    #     if len(slots) != len(set(slots)):
    #         raise ValueError("Labware slots must be unique")
    #     return v

    def load(self, protocol: protocol_api.ProtocolContext) -> None:
        self.protocol = protocol
        for pipette in self.pipettes:
            pipette.load(protocol)
        for labware in self.labwares:
            labware.load(protocol)
        for well_group in self.wells:
            well_group_labware: t.Optional[LabwareEntry] = next(
                (labware for labware in self.labwares if labware.name == well_group.labware_name),
                None,
            )
            if well_group_labware is None:
                raise ValueError(f"Labware {well_group.labware_name} not found")
            well_group.load(well_group_labware)
        for tip_box in self.tip_boxes:
            tip_box.load(protocol)
        for module in self.modules:
            module.load(protocol)

    def run(self) -> None:
        if self.protocol is None:
            raise ValueError("Need to load protocol first")
        for step in self.steps:
            if isinstance(step.__root__, ProtocolStepTransfer):
                source_wells = self.get_wells(name=step.__root__.transferInfo.source_wells_name)
                destination_wells = self.get_wells(
                    name=step.__root__.transferInfo.destination_wells_name
                )

                step.__root__.execute(
                    protocol=self.protocol,
                    pipette=self.get_pipette(mount=step.__root__.pipetteTipInfo.pipetteSlot),
                    pickup_tip_box=self.get_tipbox(
                        name=step.__root__.pipetteTipInfo.pickUpTipLocation
                    ),
                    source_wells=source_wells,
                    destination_wells=destination_wells,
                )
            elif isinstance(step.__root__, ProtocolStepDistribute):
                source_wells = self.get_wells(name=step.__root__.distributeInfo.source_wells_name)
                destination_wells = self.get_wells(
                    name=step.__root__.distributeInfo.destination_wells_name
                )

                step.__root__.execute(
                    protocol=self.protocol,
                    pipette=self.get_pipette(mount=step.__root__.pipetteTipInfo.pipetteSlot),
                    pickup_tip_box=self.get_tipbox(
                        name=step.__root__.pipetteTipInfo.pickUpTipLocation
                    ),
                    source_wells=source_wells,
                    destination_wells=destination_wells,
                )
            elif isinstance(step.__root__, ProtocolStepConsolidate):
                source_wells = self.get_wells(name=step.__root__.consolidateInfo.source_wells_name)
                destination_wells = self.get_wells(
                    name=step.__root__.consolidateInfo.destination_wells_name
                )

                step.__root__.execute(
                    protocol=self.protocol,
                    pipette=self.get_pipette(mount=step.__root__.pipetteTipInfo.pipetteSlot),
                    pickup_tip_box=self.get_tipbox(
                        name=step.__root__.pipetteTipInfo.pickUpTipLocation
                    ),
                    source_wells=source_wells,
                    destination_wells=destination_wells,
                )
            elif isinstance(step.__root__, ProtocolStepTemperatureModule):
                module = self.get_module(type="temperature module gen2")
                step.__root__.execute(protocol=self.protocol, module=module)
            elif isinstance(step.__root__, ProtocolStepCustomTransfer):
                source_wells = self.get_wells(
                    name=step.__root__.customTransferInfo.source_wells_name
                )
                destination_wells = self.get_wells(
                    name=step.__root__.customTransferInfo.destination_wells_name
                )

                step.__root__.execute(
                    protocol=self.protocol,
                    pipette=self.get_pipette(mount=step.__root__.pipetteTipInfo.pipetteSlot),
                    pickup_tip_box=self.get_tipbox(
                        name=step.__root__.pipetteTipInfo.pickUpTipLocation
                    ),
                    dropoff_tip_box=self.get_tipbox(
                        name=step.__root__.pipetteTipInfo.dropOffTipLocation
                    )
                    if step.__root__.pipetteTipInfo.dropOffTipLocation != "trash"
                    else "trash",
                    source_wells=source_wells,
                    destination_wells=destination_wells,
                )
            elif isinstance(step.__root__, ProtocolStepDelay):
                step.__root__.execute(protocol=self.protocol)
            else:
                step.__root__.execute(protocol=self.protocol)

    def get_pipette(self, mount: str) -> PipetteEntry:
        for pipette in self.pipettes:
            if pipette.mount == mount:
                return pipette
        raise ValueError(f"Pipette {mount} not found")

    def get_labware(self, name: str) -> LabwareEntry:
        for labware in self.labwares:
            if labware.name == name:
                return labware
        raise ValueError(f"Labware {name} not found")

    def get_wells(self, name: str) -> WellsEntry:
        for well_group in self.wells:
            if well_group.name == name:
                return well_group
        raise ValueError(f"Well group {name} not found")

    def get_tipbox(self, name: str) -> PipetteTipBoxEntry:
        for tip_box in self.tip_boxes:
            if tip_box.name == name:
                return tip_box
        raise ValueError(f"Tip box {name} not found")

    def get_module(self, type: str) -> ModuleEntry:
        for module in self.modules:
            if module.type == type:
                return module
        raise ValueError(f"Module {type} not found")

    class Config:
        arbitrary_types_allowed = True


metadata = {
    "apiLevel": "2.12",
    "protocolName": "Universal Opentrons Protocol",
    "author": "alberton@science.xyz",
    "description": "Opentron program for executing a protocol defined in JSON",
}

params: t.Dict[str, t.Any] = {}
# PARAMS_START

# PARAMS_END


def run(protocol_context: protocol_api.ProtocolContext) -> None:
    # import json
    # protocol_json = ("/Users/albertonava/Documents/Projects/230323_magbead_purification_opentrons/opentrons_refactor/protocol.json")
    # with open(protocol_json, "r") as f:
    #     params = json.load(f)
    opentrons_program = OpentronsProgram(**params)
    opentrons_program.load(protocol_context)
    opentrons_program.run()
