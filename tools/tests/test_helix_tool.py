def test_biology_tools_import() -> None:
    from biology_tools.records.base import DataObjectRecord  # type: ignore

    print(DataObjectRecord)
