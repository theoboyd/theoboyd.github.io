<?php include 'header.php';

// Create connection
$con=mysqli_connect("localhost","root","","data");

// Check connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$result = mysqli_query($con,"SELECT * FROM responses");
while($row = mysqli_fetch_array($result)) {
  echo '<span class="info">' . $row['user'] . " " . $row['registration_time'] . "</span> C:" . $row['correct'] . " I:" . $row['incorrect'];
  echo "<br>";
}

mysqli_close($con);

include 'footer.php'; ?>
