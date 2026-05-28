<?php

// La tienda separa desbloqueo y equipamiento, pero ambas acciones responden con
// el mismo formato de usuario publico que consume el frontend.
function capy_handle_outfits_request(PDO $pdo, array $config, string $path, string $method): bool
{
    if ($path === '/outfits' && $method === 'GET') {
        capy_json_response([
            'ok' => true,
            'outfits' => capy_get_outfits($pdo),
        ]);
    }

    if (preg_match('#^/outfits/([^/]+)/unlock$#', $path, $matches) && $method === 'POST') {
        $user = capy_require_current_user($pdo);
        $outfit = capy_get_outfit($pdo, $matches[1]);

        if (!$outfit) {
            throw new CapyHttpException(404, 'Vestuario no encontrado.');
        }

        $updated = capy_unlock_outfit($pdo, $user, $outfit, $config);

        capy_json_response([
            'ok' => true,
            'outfit' => $outfit,
            'alreadyUnlocked' => $updated['alreadyUnlocked'],
            'user' => capy_get_public_user($pdo, $updated['user'], $config),
        ]);
    }

    if (preg_match('#^/outfits/([^/]+)/equip$#', $path, $matches) && $method === 'POST') {
        $user = capy_require_current_user($pdo);
        $outfit = capy_get_outfit($pdo, $matches[1]);

        if (!$outfit) {
            throw new CapyHttpException(404, 'Vestuario no encontrado.');
        }

        $updatedUser = capy_equip_outfit($pdo, $user, $outfit);

        capy_json_response([
            'ok' => true,
            'outfit' => $outfit,
            'user' => capy_get_public_user($pdo, $updatedUser, $config),
        ]);
    }

    return false;
}
