<?php

use App\Providers\AppServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\ScheduleAuthServiceProvider;

return [
    AppServiceProvider::class,
    FortifyServiceProvider::class,
    ScheduleAuthServiceProvider::class,
];
