<?php

// Validaciones de entrada compartidas por auth y perfil.

function capy_username_min_length(): int
{
    return 3;
}

function capy_username_max_length(): int
{
    return 20;
}

function capy_password_min_length(): int
{
    return 8;
}

function capy_password_max_length(): int
{
    return 64;
}

function capy_string_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function capy_validate_username_or_fail(string $username): string
{
    $cleanUsername = trim($username);
    $length = capy_string_length($cleanUsername);

    if ($cleanUsername === '') {
        throw new CapyHttpException(422, 'Escribe un nombre de usuario.');
    }

    if ($length < capy_username_min_length() || $length > capy_username_max_length()) {
        throw new CapyHttpException(422, 'El usuario debe tener entre ' . capy_username_min_length() . ' y ' . capy_username_max_length() . ' caracteres.');
    }

    return $cleanUsername;
}

function capy_validate_password_or_fail(string $password): string
{
    $length = capy_string_length($password);

    if ($password === '') {
        throw new CapyHttpException(422, 'Escribe una contraseña.');
    }

    if ($length < capy_password_min_length() || $length > capy_password_max_length()) {
        throw new CapyHttpException(422, 'La contraseña debe tener entre ' . capy_password_min_length() . ' y ' . capy_password_max_length() . ' caracteres.');
    }

    return $password;
}
