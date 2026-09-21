<?php

namespace App\Console\Commands;

use App\Jobs\DeliverInAppNotification;
use App\Models\Installment;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendInstallmentReminders extends Command
{
    protected $signature = 'finance:send-installment-reminders';

    protected $description = 'Queue tenant-scoped due and overdue installment reminders';

    public function handle(): int
    {
        $today = Carbon::today();
        $tomorrow = $today->copy()->addDay();
        $count = 0;
        Installment::query()->withoutGlobalScopes()->with(['invoice.student.guardians.user'])->whereColumn('paid_minor', '<', 'amount_minor')->where(function ($query) use ($today, $tomorrow): void {
            $query->whereDate('due_on', $tomorrow)->orWhereDate('due_on', '<', $today);
        })->chunkById(100, function ($installments) use (&$count, $today): void {
            foreach ($installments as $installment) {
                $overdue = $installment->due_on->isBefore($today);
                $type = $overdue ? 'installment.overdue' : 'installment.due_soon';
                $title = $overdue ? 'Overdue payment reminder' : 'Payment due tomorrow';
                $body = $overdue ? "Installment {$installment->sequence} for invoice {$installment->invoice->number} is overdue." : "Installment {$installment->sequence} for invoice {$installment->invoice->number} is due tomorrow.";
                foreach ($installment->invoice->student->guardians as $guardian) {
                    if (! $guardian->user) {
                        continue;
                    }
                    DeliverInAppNotification::dispatch($installment->organization_id, $guardian->user_id, $type, $title, $body, ['installment_id' => $installment->id, 'invoice_id' => $installment->invoice_id, 'due_on' => $installment->due_on->toDateString(), 'outstanding_minor' => $installment->amount_minor - $installment->paid_minor], 'installment:'.$installment->id.':'.($overdue ? 'overdue' : 'due-soon').':'.$today->toDateString(), ['en' => ['title' => $title, 'body' => $body], 'ar' => ['title' => $overdue ? 'تذكير بدفعة متأخرة' : 'تذكير بدفعة مستحقة غدًا', 'body' => $overdue ? "الدفعة رقم {$installment->sequence} للفاتورة {$installment->invoice->number} متأخرة عن السداد." : "تستحق الدفعة رقم {$installment->sequence} للفاتورة {$installment->invoice->number} غدًا."]]);
                    $count++;
                }
            }
        });
        $this->info("Queued {$count} installment reminder(s).");

        return self::SUCCESS;
    }
}
