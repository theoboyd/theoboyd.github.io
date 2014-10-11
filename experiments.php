<?php include 'header.php';

// Create connection
$con=mysqli_connect("localhost","root","","data");

// Check connection
if (mysqli_connect_errno()) {
  echo 'Failed to connect to MySQL: ' . mysqli_connect_error();
  die();
}

if (empty($_POST['user'])) {
  echo 'You are not logged in. Please <a class="link" href="register.php">register here</a>.';
  die();
}

$user = mysqli_real_escape_string($con, $_POST['user']);

if (!empty($_POST['1'])) {
  mysqli_query($con, "UPDATE responses SET incorrect=incorrect+1 WHERE user='" . $user . "'");
}

if (!empty($_POST['2'])) {
  mysqli_query($con, "UPDATE responses SET correct=correct+1 WHERE user='" . $user . "'");
}

echo '<h3>Hello ' . $user . '</h3>';
echo '<p>Please select the bag of words that best labels this image</p>';
echo '<p></p>';

$originals_dir = 'originals';
$labels_dir = 'labels';

$image_files = array_diff(scandir($originals_dir), array('..', '.'));
$text_files =array_diff(scandir($labels_dir), array('..', '.'));

// Sadly array_rand() is heavily cached by my systems so we use mt_rand instead:
$image_name = $image_files[mt_rand(0, count($image_files))];
$correct_image = $originals_dir . '/' . $image_name;
$correct_label = $labels_dir . '/' . str_replace('gif', 'jpg', $image_name) . '.desc';
$incorrect_label = $labels_dir . '/' . $text_files[mt_rand(0, count($text_files))];

echo '<div style="height:500px;"><img style="max-height:500px;" class="tag" src=' . $correct_image . '></div><br />';
echo '<form action="experiments.php" method="post">';
echo '<input type="hidden" name="user" value="' . $user . '">';

$display_correct_first = mt_rand(0, 1);

if ($display_correct_first == 1) {
  echo '<input style="min-width:100px;" type="submit" name="2" value="' . file_get_contents($correct_label) . '">';
  echo '<input style="min-width:100px;" type="submit" name="1" value="' . file_get_contents($incorrect_label) . '">';
}
else {
  echo '<input style="min-width:100px;" type="submit" name="1" value="' . file_get_contents($incorrect_label) . '">';
  echo '<input style="min-width:100px;" type="submit" name="2" value="' . file_get_contents($correct_label) . '">';
}

echo '</form>';

mysqli_close($con);

include 'footer.php'; ?>