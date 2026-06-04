<?php

function get_db() {
  $db = new PDO(
    'mysql:host=' . conf('db_host') . ';dbname=' . conf('db_name') . ';charset=utf8',
    conf('db_user'),
    conf('db_psw'),
    array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
  );
  return $db;
}

function api_post($request) {
  $db = get_db();
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  $errors = validate_user_data($data);
  if (!empty($errors)) {
    return json_response(array('errors' => $errors), 400);
  }

  $login = 'user_' . time();
  $password = bin2hex(random_bytes(4));
  $password_hash = password_hash($password, PASSWORD_DEFAULT);

  $stmt = $db->prepare('INSERT INTO users (login, password, name, email, phone, company, message, birth_date, gender, limbs, biography, checkbox) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([
    $login, $password_hash,
    $data['name'], $data['email'],
    $data['phone'] ?? '',
    $data['company'] ?? '',
    $data['message'] ?? '',
    $data['birth_date'] ?? null,
    $data['gender'] ?? '',
    $data['limbs'] ?? 4,
    $data['biography'] ?? '',
    isset($data['checkbox']) ? ($data['checkbox'] ? 1 : 0) : 0
  ]);
  $user_id = $db->lastInsertId();

  if (!empty($data['superpowers']) && is_array($data['superpowers'])) {
    $stmt2 = $db->prepare('INSERT INTO user_superpowers (user_id, superpower) VALUES (?, ?)');
    foreach ($data['superpowers'] as $sp) {
      $stmt2->execute([$user_id, $sp]);
    }
  }

  return json_response(array(
    'login' => $login,
    'password' => $password,
    'profile_url' => '/project/backend/index.php?q=api/user/' . $user_id
  ), 201);
}

function api_put($request, $user_id) {
  $db = get_db();
  $json = file_get_contents('php://input');
  $data = json_decode($json, true);

  $errors = validate_user_data($data);
  if (!empty($errors)) {
    return json_response(array('errors' => $errors), 400);
  }

  $stmt = $db->prepare('UPDATE users SET name=?, email=?, phone=?, company=?, message=?, birth_date=?, gender=?, limbs=?, biography=?, checkbox=? WHERE id=?');
  $stmt->execute([
    $data['name'], $data['email'],
    $data['phone'] ?? '',
    $data['company'] ?? '',
    $data['message'] ?? '',
    $data['birth_date'] ?? null,
    $data['gender'] ?? '',
    $data['limbs'] ?? 4,
    $data['biography'] ?? '',
    $data['checkbox'] ? 1 : 0,
    $user_id
  ]);

  $db->prepare('DELETE FROM user_superpowers WHERE user_id=?')->execute([$user_id]);
  if (!empty($data['superpowers']) && is_array($data['superpowers'])) {
    $stmt2 = $db->prepare('INSERT INTO user_superpowers (user_id, superpower) VALUES (?, ?)');
    foreach ($data['superpowers'] as $sp) {
      $stmt2->execute([$user_id, $sp]);
    }
  }

  return json_response(array('success' => true, 'message' => 'User updated'), 200);
}

function api_get($request, $user_id = null) {
  $db = get_db();

  if ($user_id) {
    $stmt = $db->prepare('SELECT * FROM users WHERE id=?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
      return json_response(array('error' => 'User not found'), 404);
    }

    $stmt2 = $db->prepare('SELECT superpower FROM user_superpowers WHERE user_id=?');
    $stmt2->execute([$user_id]);
    $user['superpowers'] = $stmt2->fetchAll(PDO::FETCH_COLUMN);

    unset($user['password']);
    return json_response($user, 200);
  }

  return json_response(array('error' => 'User ID required'), 400);
}

function validate_user_data($data) {
  $errors = array();
  if (empty($data['name'])) $errors['name'] = 'Name is required';
  if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Valid email is required';
  return $errors;
}

function json_response($data, $status = 200) {
  $messages = array(200 => 'OK', 201 => 'Created', 400 => 'Bad Request', 404 => 'Not Found');
  return array(
    'headers' => array(
      'HTTP/1.1 ' . $status . ' ' . $messages[$status],
      'Content-Type' => 'application/json',
      'Access-Control-Allow-Origin' => '*'
    ),
    'entity' => json_encode($data)
  );
}
