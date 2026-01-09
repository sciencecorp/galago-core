import json
import os
import typing as t
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

router = APIRouter()


HubItemType = t.Literal[
    "workcells",
    "protocols",
    "variables",
    "scripts",
    "labware",
    "forms",
    "inventory",
]


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hub_base_dir() -> Path:
    # Default to db/data/hub, overridable by env var.
    env_dir = os.getenv("GALAGO_HUB_DIR")
    if env_dir:
        return Path(env_dir).expanduser().resolve()
    return (Path(__file__).resolve().parents[1] / "data" / "hub").resolve()


def _type_dir(item_type: HubItemType) -> Path:
    base = _hub_base_dir()
    return base / item_type


def _ensure_dirs() -> None:
    base = _hub_base_dir()
    base.mkdir(parents=True, exist_ok=True)
    for tdir in [
        "workcells",
        "protocols",
        "variables",
        "scripts",
        "labware",
        "forms",
        "inventory",
    ]:
        (base / tdir).mkdir(parents=True, exist_ok=True)


def _item_path(item_type: HubItemType, item_id: str) -> Path:
    return _type_dir(item_type) / f"{item_id}.json"


def _safe_type(value: str) -> HubItemType:
    allowed = {
        "workcells",
        "protocols",
        "variables",
        "scripts",
        "labware",
        "forms",
        "inventory",
    }
    if value not in allowed:
        raise HTTPException(
            status_code=400, detail=f"Unsupported hub item type: {value}"
        )
    return t.cast(HubItemType, value)


def _read_json_file(path: Path) -> dict:
    try:
        with path.open("r", encoding="utf-8") as f:
            return t.cast(dict, json.load(f))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Hub item not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Corrupt hub item JSON")


def _write_json_file(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".json.tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    tmp.replace(path)


class HubItemSummary(BaseModel):
    id: str
    type: str
    name: str
    description: str = ""
    tags: list[str] = Field(default_factory=list)
    created_at: str
    updated_at: str


class HubItem(HubItemSummary):
    payload: t.Any


class HubItemCreate(BaseModel):
    type: str
    name: str
    description: str = ""
    tags: list[str] = Field(default_factory=list)
    payload: t.Any
    id: Optional[str] = None


@router.get("/items", response_model=list[HubItemSummary])
def list_hub_items(item_type: Optional[str] = None, q: Optional[str] = None) -> t.Any:
    _ensure_dirs()
    summaries: list[HubItemSummary] = []

    types: list[HubItemType]
    if item_type:
        types = [_safe_type(item_type)]
    else:
        types = t.cast(
            list[HubItemType],
            [
                "workcells",
                "protocols",
                "variables",
                "scripts",
                "labware",
                "forms",
                "inventory",
            ],
        )

    needle = (q or "").strip().lower()

    for it in types:
        tdir = _type_dir(it)
        for p in sorted(tdir.glob("*.json")):
            data = _read_json_file(p)
            tags_raw = data.get("tags") or []
            tags_list: list[str] = (
                [str(x) for x in tags_raw] if isinstance(tags_raw, list) else []
            )

            summary = HubItemSummary(
                id=str(data.get("id") or p.stem),
                type=str(data.get("type") or it),
                name=str(data.get("name") or p.stem),
                description=str(data.get("description") or ""),
                tags=tags_list,
                created_at=str(data.get("created_at") or ""),
                updated_at=str(data.get("updated_at") or ""),
            )
            if needle:
                hay = f"{summary.name} {summary.description} {' '.join(summary.tags)}".lower()
                if needle not in hay:
                    continue
            summaries.append(summary)

    # Sort newest first when possible (fallback to name).
    def _sort_key(s: HubItemSummary) -> tuple:
        return (s.updated_at or s.created_at or "", s.name.lower())

    summaries.sort(key=_sort_key, reverse=True)
    return summaries


@router.get("/items/{item_id}", response_model=HubItem)
def get_hub_item(item_id: str, item_type: Optional[str] = None) -> t.Any:
    _ensure_dirs()

    if item_type:
        it = _safe_type(item_type)
        data = _read_json_file(_item_path(it, item_id))
        return HubItem(**data)

    # Fallback: scan all type dirs.
    for it in t.cast(
        list[HubItemType],
        [
            "workcells",
            "protocols",
            "variables",
            "scripts",
            "labware",
            "forms",
            "inventory",
        ],
    ):
        p = _item_path(it, item_id)
        if p.exists():
            data = _read_json_file(p)
            return HubItem(**data)

    raise HTTPException(status_code=404, detail="Hub item not found")


@router.get("/items/{item_id}/download")
def download_hub_item(item_id: str, item_type: str) -> t.Any:
    _ensure_dirs()
    it = _safe_type(item_type)
    p = _item_path(it, item_id)
    if not p.exists():
        raise HTTPException(status_code=404, detail="Hub item not found")
    return FileResponse(
        path=str(p), filename=f"{item_id}.json", media_type="application/json"
    )


@router.post("/items", response_model=HubItemSummary)
def create_hub_item(item: HubItemCreate) -> t.Any:
    _ensure_dirs()
    it = _safe_type(item.type)
    item_id = item.id or uuid.uuid4().hex

    now = _utc_now_iso()
    path = _item_path(it, item_id)
    created_at = now
    if path.exists():
        existing = _read_json_file(path)
        created_at = str(existing.get("created_at") or now)

    data = {
        "id": item_id,
        "type": it,
        "name": item.name,
        "description": item.description or "",
        "tags": item.tags or [],
        "created_at": created_at,
        "updated_at": now,
        "payload": item.payload,
    }

    _write_json_file(path, data)
    return HubItemSummary(**data)


@router.post("/items/upload", response_model=HubItemSummary)
async def upload_hub_item(
    file: UploadFile = File(...),
    item_type: str = Form(...),
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
) -> t.Any:
    """
    Upload a JSON file and store it as a Hub item.
    - tags: comma-separated list
    """
    _ensure_dirs()
    it = _safe_type(item_type)

    try:
        raw = await file.read()
        payload = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in uploaded file")

    inferred_name = (name or "").strip()
    if not inferred_name:
        if isinstance(payload, dict) and payload.get("name"):
            inferred_name = str(payload.get("name"))
        else:
            inferred_name = (file.filename or "Untitled").replace(".json", "")

    tag_list: list[str] = []
    if tags:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]

    item_id = uuid.uuid4().hex
    now = _utc_now_iso()
    data = {
        "id": item_id,
        "type": it,
        "name": inferred_name,
        "description": description or "",
        "tags": tag_list,
        "created_at": now,
        "updated_at": now,
        "payload": payload,
    }
    _write_json_file(_item_path(it, item_id), data)
    return HubItemSummary(**data)


@router.delete("/items/{item_id}")
def delete_hub_item(item_id: str, item_type: str) -> t.Any:
    _ensure_dirs()
    it = _safe_type(item_type)
    p = _item_path(it, item_id)
    if not p.exists():
        raise HTTPException(status_code=404, detail="Hub item not found")
    p.unlink()
    return {"message": "Hub item deleted"}
