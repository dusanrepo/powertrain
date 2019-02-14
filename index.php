
<!DOCTYPE html>
<html lang="en">

  <head>
    <meta charset="utf-8">
    <!-- Davendra - 04/2/19
    <meta name="viewport" content="width=device-width, maximum-scale=1.0">
		-->
    <title>JLR Powertrain Way</title>
    <meta property="og:title" content="JLR Powertrain Way| Digital Book ">
    <meta property="og:description" content="Jaguar Land Rover Engine Manufacturing Centre.">

    <link rel="apple-touch-icon" sizes="152x152" href="apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="android-chrome-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5">
    <link rel="icon" type="image/png" href="favicon.png">

    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">

    <meta name="apple-mobile-web-app-title" content="JLR-Powertrain Way">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" >
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">

    <link href="login.css" rel="stylesheet" />

    <!-- Davendra - 18/01/2019  Google Analytics Snippet -->
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
			ga('create', 'UA-132064322-1', 'auto');
			ga('send', 'pageview');
		</script>
  </head>

  <body>
    <div class="bg-overlay"></div>
    <section class="login-wrapper">
      <img class="login-logo" src="images/jlrlogo.png" alt="Jaguar Land Rover mBook" />
      <h1 class="welcome-text">Welcome</h1>
      <form id="loginForm" autocomplete="off">
        <div>
          <input id="username" placeholder="User ID" type="text" />
        </div>
        <div>
          <input id="password" placeholder="Password" type="password" />
        </div>
        <div id="submit" class="submit-wrapper">
          <button class="button hover">Sign In</button>
        </div>
      </form>
    </section>
    <script>
      var submit = document.getElementById("submit");
      var username = document.getElementById("username");
      var password = document.getElementById("password");
      submit.addEventListener("click", login);

      function login(event) {
        event.preventDefault();
        window.location.href = "http://localhost:8080/powertrain3/book/index.php";

      //   var endpoint = "https://babcocklearningsolutions.com/jlr/powertrain3/mbookservice/login";
      //   var ajax;
      //   var post;
      //   if (username.value.length < 1) {
      //     alert("Please enter a username")
      //     return false;
      //   }
      //   if (password.value.length < 1) {
      //     alert("Please enter a password")
      //     return false;
      //   }
      //   ajax = new XMLHttpRequest();
      //   post = "username=" + username.value + "&password=" + password.value;
      //   ajax.onreadystatechange = function() {
      //     if (this.readyState == 4 && this.status == 200) {
      //       checkLogin(this);
      //     }
      //   }
      //   ajax.open("POST", endpoint, true);
      //   ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      //   ajax.send(post);
      // }

      // function checkLogin(reply) {
      //   if (reply.responseText === "true") {
      //     window.location.href = "https://babcocklearningsolutions.com/jlr/powertrain3/book/index.php";
      //     return true;
      //   } else {
      //     alert("Invalid login. Please check your entered details and try again.");
      //     return false;
      //   }
      }
    </script>
  </body>

</html>
