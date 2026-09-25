<?php

namespace App\Concerns;

use App\Models\School;

/**
 * Single owner for "which school is this admin route acting on".
 *
 * This only resolves the record. Authorization stays with the caller, which
 * applies its own ability to the returned model — the ability needed differs
 * per module (manage-finance, manage-users, record-attendance, ...).
 */
trait ResolvesSchool
{
    protected function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}
