<?php include 'header.php';

$con=mysqli_connect('localhost', 'root', '', 'data');
// Check connection
if (mysqli_connect_errno()) {
  echo 'Failed to connect to MySQL: ' . mysqli_connect_error();
}

if (empty($_POST['user'])) {
  echo 'You are not logged in. Please <a class="link" href="register.php">register here</a>.';
  die();
}

// Escape variables for security
$user = mysqli_real_escape_string($con, $_POST['user']);

if (!ctype_alnum($user)) {
  echo 'Name needs to be alphanumeric. Please <a class="link" href="register.php">try again</a>.';
  die();
}

$sql="INSERT INTO responses (user) VALUES ('$user')";

if (!mysqli_query($con,$sql)) {
  echo 'Error: ' . mysqli_error($con) . '. Please <a class="link" href="register.php">register here</a>.';
  die();
}

echo '<h3>Registered successfully</h3>';
echo '<form action="experiments.php" method="post">';
echo '<input type="hidden" name="user" value="' . $user . '">';
echo '<input type="submit" value="Continue">';
echo '</form>';

mysqli_close($con);

include 'footer.php'; ?>