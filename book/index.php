<?php
	session_start();
	$_SESSION['user_id'] = '1';
	//  if (isset($_SESSION['user_id']) === false) {
	//      header('Location: https://babcocklearningsolutions.com/jlr/powertrain3/index.php');
	//      exit("You must log in to access this resource");
	//  }
?>
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<!-- Davendra - 04/2/19
    <meta name="viewport" content="width=device-width, maximum-scale=1.0">
		-->
    <title>JLR -Powertrain Way</title>
    <meta property="og:title" content="JLR Powertrain Way| Digital Book ">
    <meta property="og:description" content="Jaguar Land Rover Engine Manufacturing Centre.">

		<link rel="apple-touch-icon" sizes="152x152" href="../apple-touch-icon.png">
		<link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon-180x180.png">
		<link rel="icon" type="image/png" href="../android-chrome-192x192.png" sizes="192x192">
		<link rel="icon" type="image/png" sizes="32x32" href="../favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="16x16" href="../favicon-16x16.png">
		<link rel="mask-icon" href="../safari-pinned-tab.svg" color="#5bbad5">
    <link rel="icon" type="image/png" href="favicon.png">

		<meta name="msapplication-TileColor" content="#da532c">
		<meta name="theme-color" content="#ffffff">

    <meta name="apple-mobile-web-app-title" content="JLR-Powertrain Way">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" >
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black"

    <!--  Davendra - 28/01/2019 Google Analytics Script -->
		<script>
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-132064322-1', 'auto');
        ga('UserID', '<?php echo $_SESSION['user_id'] ?>');
        ga('send', 'pageview');
		</script>
	</head>
	<body>
		<div data-bind="foreach: $root.uiViewModel.modules">
			<div data-bind="attr: { id : id }, css: className, component: { name: name, params: { id: id, config: config, settings: settings, mBook: mBookInstance, elem: $element } }"></div>
		</div>

		<script src="assets/core/js/vendor/soundmanager2.js" ></script>
		<script>
			soundManager.setup({
				preferFlash: false,
				useHighPerformance: true,
				debugMode: false, // disable debug mode
				onready: function() {
				}
			});
		</script>
		<script data-main="assets/core/js/main.js" type="text/javascript" src="assets/core/js/vendor/requirejs/require.js"></script>
	<?php/*
*/?>
	</body>
</html>
