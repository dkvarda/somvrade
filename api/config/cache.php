<?php

use Illuminate\Support\Str;

return [
    'default' => env('CACHE_DRIVER', 'memcached'),
    'stores' => [
        'memcached' => [
            'driver' => 'memcached',
            'persistent_id' => env('MEMCACHED_PERSISTENT_ID'),
            'sasl' => [
                env('MEMCACHED_USERNAME'),
                env('MEMCACHED_PASSWORD'),
            ],
            'options' => [
                // Memcached::OPT_CONNECT_TIMEOUT => 2000,
            ],
            'servers' => [
                [
                    'host' => env('MEMCACHED_HOST', 'memcached.internal.dev.demo.lablabs.io'),
                    'port' => env('MEMCACHED_PORT', 11211),
                    'weight' => 100,
                ],
            ],
        ],
    ],
    'prefix' => env(
        'CACHE_PREFIX',
        Str::slug(env('APP_NAME', 'lumen'), '_').'_cache'
    ),
];
