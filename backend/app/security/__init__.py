import re
import logging

logger = logging.getLogger(__name__)

MAX_SOURCE_CODE_LENGTH = 100_000
MAX_FILENAME_LENGTH = 255
ALLOWED_EXTENSIONS = {".sol"}

DANGEROUS_PATTERNS = [
    (re.compile(r"assembly\s*\{", re.IGNORECASE), "Contains inline assembly"),
    (re.compile(r"selfdestruct\s*\(", re.IGNORECASE), "Contains selfdestruct call"),
    (re.compile(r"delegatecall\s*\(", re.IGNORECASE), "Contains delegatecall"),
]


def validate_solidity_code(source_code: str) -> list[str]:
    warnings = []

    if len(source_code) > MAX_SOURCE_CODE_LENGTH:
        raise ValueError(
            f"Source code exceeds maximum length of {MAX_SOURCE_CODE_LENGTH} characters"
        )

    for pattern, message in DANGEROUS_PATTERNS:
        if pattern.search(source_code):
            warnings.append(message)

    return warnings


def validate_filename(filename: str) -> str:
    if not filename or len(filename) > MAX_FILENAME_LENGTH:
        raise ValueError(f"Invalid filename: must be 1-{MAX_FILENAME_LENGTH} characters")

    if ".." in filename or "/" in filename or "\\" in filename:
        raise ValueError("Filename must not contain path separators or relative references")

    if filename.startswith("."):
        raise ValueError("Filename must not start with a dot")

    ext = "." + filename.rsplit(".", 1)[-1] if "." in filename else ""
    if ext and ext.lower() not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Invalid file extension '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    filename = re.sub(r"[^\w.\-]", "_", filename)
    return filename


def sanitize_output(text: str) -> str:
    return text.strip()[:10_000]
