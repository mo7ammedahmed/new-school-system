<?php

return [
    'working_days' => [0, 1, 2, 3, 4],

    'coordinators_can_publish' => env('SCHEDULE_COORDINATORS_CAN_PUBLISH', false),

    'max_exams_per_day_per_section' => env('SCHEDULE_MAX_EXAMS_PER_DAY_PER_SECTION', 1),

    'teacher_max_periods_per_day' => env('SCHEDULE_TEACHER_MAX_PERIODS_PER_DAY', null),

    'teacher_max_periods_per_week' => env('SCHEDULE_TEACHER_MAX_PERIODS_PER_WEEK', null),
];
