from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def _dependencies(path: Path) -> list[str]:
    return [
        line.strip()
        for line in path.read_text().splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]


def test_vercel_requirements_match_backend_dependencies() -> None:
    root_requirements = _dependencies(REPO_ROOT / "requirements.txt")
    backend_requirements = _dependencies(
        REPO_ROOT / "backend" / "requirements.txt"
    )

    assert root_requirements == backend_requirements
    assert not any(
        dependency.startswith(("-r", "--requirement"))
        for dependency in root_requirements
    )
