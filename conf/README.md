How to setup the config files:
==============================

1. create a new facebook app on: https://developers.facebook.com/apps
2. make a copy of the example.facebook_app_info.php renaming it to facebook_app_info.php
2.1. edit facebook_app_info.php and replace YOUR_APP_ID and YOUR_APP_SECRET with the values from step 1
3. run the bin/get_facebook_access_token.php script
4. make a copy of example.facebook_token.js renaming it to facebook_token.js
4.1. replace YOUR_OAUTH_TOKEN with the value returned on step 3
