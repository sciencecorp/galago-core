import markdown
import pdfkit  # type: ignore
from datetime import datetime
import os


def markdown_to_pdf(md_file_path: str, pdf_file_path: str) -> None:
    with open(md_file_path, "r", encoding="utf-8") as md_file:
        md_content = md_file.read()

    html_content = markdown.markdown(md_content)
    pdfkit.from_string(html_content, pdf_file_path)
    print(f"Successfully converted {md_file_path} to {pdf_file_path}")


if __name__ == "__main__":
    new_file_name = f"ChangeLog_{datetime.today().strftime('%Y-%m-%d')}.pdf"
    markdown_to_pdf("ChangeLog.md", new_file_name)
    os.popen(f"cp {new_file_name} controller/public/ChangeLog.pdf")
