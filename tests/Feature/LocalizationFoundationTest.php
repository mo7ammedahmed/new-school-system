<?php

namespace Tests\Feature;

use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class LocalizationFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_arabic_locale_resolves_to_rtl_and_restores_after_request(): void
    {
        $request = Request::create('/?locale=ar', 'GET');

        $response = (new SetLocale)->handle($request, function (): Response {
            return response()->json([
                'locale' => app()->getLocale(),
                'direction' => config('localization.supported.'.app()->getLocale().'.direction'),
            ]);
        });

        $this->assertSame('ar', $response->getData(true)['locale']);
        $this->assertSame('rtl', $response->getData(true)['direction']);
        $this->assertSame(config('app.locale'), app()->getLocale());
    }

    public function test_unsupported_locale_falls_back_to_english(): void
    {
        $request = Request::create('/?locale=fr', 'GET');

        $response = (new SetLocale)->handle($request, function (): Response {
            return response()->json(['locale' => app()->getLocale()]);
        });

        $this->assertSame('en', $response->getData(true)['locale']);
    }
}
