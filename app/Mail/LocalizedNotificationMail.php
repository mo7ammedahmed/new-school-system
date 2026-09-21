<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LocalizedNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    protected string $notificationLocale;

    public function __construct(public readonly string $title, public readonly string $body, string $locale)
    {
        $this->notificationLocale = $locale;
        $this->locale($locale);
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->title);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.notification', with: ['title' => $this->title, 'body' => $this->body, 'locale' => $this->notificationLocale]);
    }
}
