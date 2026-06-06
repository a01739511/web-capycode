<?php

// Utilidades de tiempo usadas para racha y persistencia temporal.

function capy_now_iso(): string
{
    return (new DateTimeImmutable('now'))->format(DateTimeInterface::ATOM);
}

function capy_date_key(string $isoValue, string $timezone): string
{
    $date = new DateTimeImmutable($isoValue);
    $zoned = $date->setTimezone(new DateTimeZone($timezone));
    return $zoned->format('Y-m-d');
}

function capy_days_between_date_keys(string $leftKey, string $rightKey): int
{
    $left = DateTimeImmutable::createFromFormat('Y-m-d', $leftKey) ?: new DateTimeImmutable('1970-01-01');
    $right = DateTimeImmutable::createFromFormat('Y-m-d', $rightKey) ?: new DateTimeImmutable('1970-01-01');
    return (int) $left->diff($right)->format('%r%a');
}
