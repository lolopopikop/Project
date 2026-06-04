<?php
function auth(&$request, $r) {
  if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
    return send_auth_header();
  }
  $login = $_SERVER['PHP_AUTH_USER'];
  $password = $_SERVER['PHP_AUTH_PW'];

  $db = new PDO(
    'mysql:host=' . conf('db_host') . ';dbname=' . conf('db_name') . ';charset=utf8',
    conf('db_user'),
    conf('db_psw'),
    array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
  );

  $stmt = $db->prepare('SELECT * FROM users WHERE login = ?');
  $stmt->execute([$login]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$user || !password_verify($password, $user['password'])) {
    return send_auth_header();
  }

  $request['user'] = array(
    'id' => $user['id'],
    'login' => $user['login'],
    'name' => $user['name'],
    'email' => $user['email']
  );
  return NULL;
}

function send_auth_header() {
  return array(
    'headers' => array(
      sprintf('WWW-Authenticate: Basic realm="%s"', conf('sitename')),
      'HTTP/1.0 401 Unauthorized'
    ),
    'entity' => '<h1>401 Требуется авторизация</h1>',
  );
}
