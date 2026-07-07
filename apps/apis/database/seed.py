"""Run database seeders from the CLI (``python -m database.seed``)."""

from __future__ import annotations

import asyncio

from database.seeders import seed


def main() -> None:
    asyncio.run(seed())


if __name__ == "__main__":
    main()
