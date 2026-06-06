<?php

// Normalizacion y validacion de ejercicios para frontend y backend.

function capy_normalize_exercise(array $question, array $level, int $orderIndex): array
{
    $rawType = $question['tipo'] ?? $question['type'] ?? 'exercise';
    $type = capy_map_exercise_type((string) $rawType);
    $baseId = $level['id'] . '-' . $orderIndex . '-' . $rawType;
    $context = capy_normalize_exercise_context($question['context'] ?? null);

    if ($type === 'MultipleChoiceExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'code' => capy_array_copy($question['code'] ?? []),
                'options' => capy_array_copy($question['opciones'] ?? $question['options'] ?? []),
                'context' => $context,
            ],
            'answer_data' => [
                'correctOptionIds' => capy_array_copy($question['correct_ids'] ?? $question['correctOptionIds'] ?? []),
            ],
        ];
    }

    if ($type === 'NumericAnswerExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'code' => capy_array_copy($question['code'] ?? []),
                'context' => $context,
            ],
            'answer_data' => [
                'correctValue' => $question['value'] ?? $question['valor'] ?? $question['correctValue'] ?? null,
            ],
        ];
    }

    if ($type === 'LineSelectionExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'lines' => capy_array_copy($question['lineas'] ?? $question['lines'] ?? []),
                'context' => $context,
            ],
            'answer_data' => [
                'correctLineIds' => capy_array_copy($question['correct_ids'] ?? $question['correctLineIds'] ?? []),
            ],
        ];
    }

    if ($type === 'LineOrderingExercise') {
        return [
            'id' => $baseId,
            'level_id' => $level['id'],
            'order_index' => $orderIndex,
            'type' => $type,
            'raw_type' => $rawType,
            'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
            'content_data' => [
                'lines' => capy_array_copy($question['lineas'] ?? $question['lines'] ?? []),
                'context' => $context,
            ],
            'answer_data' => [
                'correctLineOrder' => capy_array_copy($question['orden_correcto'] ?? $question['correctLineOrder'] ?? []),
            ],
        ];
    }

    return [
        'id' => $baseId,
        'level_id' => $level['id'],
        'order_index' => $orderIndex,
        'type' => 'FillBlanksExercise',
        'raw_type' => $rawType,
        'prompt' => $question['prompt'] ?? $question['enunciado'] ?? '',
        'content_data' => [
            'template' => capy_array_copy($question['plantilla'] ?? $question['template'] ?? []),
            'wordBank' => capy_array_copy($question['banco_palabras'] ?? $question['wordBank'] ?? []),
            'context' => $context,
        ],
        'answer_data' => [
            'correctBlanks' => is_array($question['rellenos'] ?? null) ? $question['rellenos'] : (is_array($question['correctBlanks'] ?? null) ? $question['correctBlanks'] : []),
        ],
    ];
}

function capy_normalize_exercise_context($value): ?array
{
    if (!is_array($value)) {
        return null;
    }

    $scene = trim((string) ($value['scene'] ?? ''));
    $task = trim((string) ($value['task'] ?? ''));
    $acceptance = trim((string) ($value['acceptance'] ?? ''));
    $commonPitfall = trim((string) ($value['commonPitfall'] ?? ''));
    $rules = array_values(array_filter(array_map('trim', array_map('strval', capy_array_copy($value['rules'] ?? [])))));
    $canonicalFlow = array_values(array_filter(array_map('trim', array_map('strval', capy_array_copy($value['canonicalFlow'] ?? [])))));

    if ($scene === '' && $task === '' && !$rules && $acceptance === '' && $commonPitfall === '' && !$canonicalFlow) {
        return null;
    }

    return [
        'scene' => $scene,
        'task' => $task,
        'rules' => $rules,
        'acceptance' => $acceptance,
        'commonPitfall' => $commonPitfall,
        'canonicalFlow' => $canonicalFlow,
    ];
}

function capy_map_exercise_type(string $type): string
{
    if ($type === 'opcion_multiple' || $type === 'MultipleChoiceExercise') {
        return 'MultipleChoiceExercise';
    }
    if ($type === 'respuesta_numerica' || $type === 'NumericAnswerExercise') {
        return 'NumericAnswerExercise';
    }
    if ($type === 'seleccionar_lineas' || $type === 'LineSelectionExercise') {
        return 'LineSelectionExercise';
    }
    if ($type === 'ordenar_lineas' || $type === 'LineOrderingExercise') {
        return 'LineOrderingExercise';
    }

    return 'FillBlanksExercise';
}

function capy_validate_exercise_answer(array $exercise, $answer): bool
{
    if (!is_array($answer)) {
        return false;
    }

    if ($exercise['type'] === 'MultipleChoiceExercise') {
        return capy_compare_sets($answer['optionIds'] ?? [], $exercise['answer_data']['correctOptionIds'] ?? []);
    }
    if ($exercise['type'] === 'NumericAnswerExercise') {
        return (float) ($answer['value'] ?? null) === (float) ($exercise['answer_data']['correctValue'] ?? null);
    }
    if ($exercise['type'] === 'LineSelectionExercise') {
        return capy_compare_sets($answer['lineIds'] ?? [], $exercise['answer_data']['correctLineIds'] ?? []);
    }
    if ($exercise['type'] === 'LineOrderingExercise') {
        return capy_compare_arrays($answer['lineIds'] ?? [], $exercise['answer_data']['correctLineOrder'] ?? []);
    }
    if ($exercise['type'] === 'FillBlanksExercise') {
        return capy_compare_assoc($answer['blanks'] ?? [], $exercise['answer_data']['correctBlanks'] ?? []);
    }

    return false;
}

function capy_array_copy($value): array
{
    return is_array($value) ? array_values($value) : [];
}

function capy_compare_arrays($left, $right): bool
{
    if (!is_array($left) || !is_array($right) || count($left) !== count($right)) {
        return false;
    }

    foreach ($left as $index => $value) {
        if ((string) $value !== (string) $right[$index]) {
            return false;
        }
    }

    return true;
}

function capy_compare_sets($left, $right): bool
{
    $leftValues = array_map('strval', is_array($left) ? $left : []);
    $rightValues = array_map('strval', is_array($right) ? $right : []);
    sort($leftValues);
    sort($rightValues);
    return capy_compare_arrays($leftValues, $rightValues);
}

function capy_compare_assoc($left, $right): bool
{
    if (!is_array($left) || !is_array($right)) {
        return false;
    }

    ksort($left);
    ksort($right);

    if (array_keys($left) !== array_keys($right)) {
        return false;
    }

    foreach ($left as $key => $value) {
        if ((string) $value !== (string) $right[$key]) {
            return false;
        }
    }

    return true;
}
