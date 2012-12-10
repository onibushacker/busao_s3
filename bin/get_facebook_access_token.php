<?php
    include(dirname ( __FILE__ ) . '/../conf/facebook_app_info.php');
    $app_id = $APP_ID;
    $app_secret = $APP_SECRET;
    $app_token_url = "https://graph.facebook.com/oauth/access_token?"
        . "client_id=" . $app_id
        . "&client_secret=" . $app_secret
        . "&grant_type=client_credentials";

        $response = file_get_contents($app_token_url);
        $params = null;
    parse_str($response, $params);

    echo("This app's access token is: " . $params['access_token'] . "\n");

 ?>