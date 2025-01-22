<?php
session_start();

$colors = ["rosso", "giallo", "verde", "blu"];

if (!isset($_SESSION["target"])) {
    $_SESSION["target"] = array_map(fn() => $colors[rand(0, 3)], range(1, 4));
    $_SESSION["attempts"] = 0;
    $_SESSION["max_attempts"] = 10;
    $_SESSION["history"] = [];
}

$data = json_decode(file_get_contents("php://input"), true);
$guess = $data["guess"] ?? [];
$response = ["feedback" => [], "finished" => false, "message" => "", "history" => []];

if (count($guess) !== 4 || in_array(null, $guess, true)) {
    http_response_code(400);
    $response["message"] = "Invalid guess.";
    echo json_encode($response);
    exit;
}

$target = $_SESSION["target"];
$black = 0;
$white = 0;
$remaining_target = [];
$remaining_guess = [];

foreach ($target as $i => $color) {
    if ($color === $guess[$i]) {
        $black++;
    } else {
        $remaining_target[] = $color;
        $remaining_guess[] = $guess[$i];
    }
}

foreach ($remaining_guess as $color) {
    if (($key = array_search($color, $remaining_target)) !== false) {
        $white++;
        unset($remaining_target[$key]);
    }
}

// Store attempt in history
$attemptNumber = $_SESSION["attempts"] + 1;
array_push($_SESSION["history"], [
    "attempt" => $attemptNumber,
    "guess" => $guess,
    "black" => $black,
    "white" => $white
]);

$_SESSION["attempts"]++;

$response["feedback"] = ["black" => $black, "white" => $white];
$response["history"] = $_SESSION["history"];

if ($black === 4) {
    $response["finished"] = true;
    $response["message"] = "Congratulations! You guessed the correct sequence.";
    session_destroy();
} elseif ($_SESSION["attempts"] >= $_SESSION["max_attempts"]) {
    $response["finished"] = true;
    $response["message"] = "Game over! You have used all attempts.";
    session_destroy();
}

echo json_encode($response);
?>