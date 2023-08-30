from __future__ import annotations

from datetime import datetime
import json
from typing import TYPE_CHECKING
import uuid

from optuna.storages import BaseStorage

from .preferential._system_attrs import report_preferences


_SYSTEM_ATTR_PREFIX_HISTORY = "preference:history"

if TYPE_CHECKING:
    from typing import TypedDict

    Choice = TypedDict(
        "Choice",
        {
            "uuid": str,
            "candidate_trials": list[int],
            "preference_uuid": str,
            "timestamp": str,
        },
    )


def report_choice(
    study_id: int,
    storage: BaseStorage,
    candidate_trials: list[int],
    preferences: list[tuple[int, int]],
    timestamp: datetime,
) -> None:
    choice: Choice = {
        "uuid": str(uuid.uuid4()),
        "candidate_trials": candidate_trials,
        "preference_uuid": report_preferences(study_id, storage, preferences),
        "timestamp": timestamp.isoformat(),
    }
    key = _SYSTEM_ATTR_PREFIX_HISTORY + choice["uuid"]
    storage.set_study_system_attr(
        study_id=study_id,
        key=key,
        value=json.dumps(choice),
    )
