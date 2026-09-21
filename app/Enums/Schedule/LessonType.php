<?php

namespace App\Enums\Schedule;

enum LessonType: string
{
    case Lesson = 'lesson';
    case Exam = 'exam';
    case Lab = 'lab';
    case Homeroom = 'homeroom';
}
