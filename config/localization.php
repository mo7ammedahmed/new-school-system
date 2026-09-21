<?php

return [
    'supported' => [
        'en' => [
            'label' => 'English',
            'direction' => 'ltr',
        ],
        'ar' => [
            'label' => 'العربية',
            'direction' => 'rtl',
        ],
    ],

    'default' => env('APP_LOCALE', 'en'),
    'fallback' => env('APP_FALLBACK_LOCALE', 'en'),
];
