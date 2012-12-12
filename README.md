
Busão S3: Ônibus Hacker Static Website Generator
================================================

A series of node.js scripts that can be used to replicate the data(only photo
albums at the moment) from any public Facebook Page into a static website hosted
on Amazon.com Cloud.

For an example of static files website generated based on http://www.facebook.com/onibushacker see http://onibus.fabricio.org


Why?
====

Facebook is a cancer and people nowadays prefer to update a group or company
page hosted on a centralized silo not owned by them instead of hosting and
publishing their own content on their own servers and their own domain names.

I am a member of a brazilian activism group / artists collective called "Onibus Hacker"
(hacker bus) and the current website (onibushacker.org) is less updated than the
fucking Facebook page, people are posting photos and albums in the centralized social
network shit for convenience reasons (and the lack of better CMS on our own website).

Since I don't like to tell people how or were to upload their content, and since
that lame/ads-filled website is the currently chosen one and winner of the choice
of people documenting our travels, I decided that it would be easier to simply
mirror everything from there into a domain I own.

And add usefull features like zipped photo albums downloads and a lighter website / interface while there.

That is the reason for this collection of scripts / hacks. I can easily backup
the content of a facebook page into a more open and web-friendly address and I have
total control over the layout of that content (the pages are generated based on mustache html templates).

How to use
==========

Step 1: Configuration
---------------------

See the README.md file on the /conf folder


Step 2: Get the photo albums information from the API and save locally
----------------------------------------------------------------------

    node bin/get_facebook_data.js


Step 3: Download all photos and save them locally
-------------------------------------------------

    node bin/get_facebook_photos.js

Step 4: Build the website based on your html mustache templates
---------------------------------------------------------------

    node bin/build_website.js


Step 5: Upload the website to your host (only Amazon S3 at the moment)
----------------------------------------------------------------------

    node bin/upload_site.js


Notes
=====

- we are using [onkis fork of node-native-zip](https://github.com/onkis/node-native-zip)
to generate the .zip archives because that fork has a fix for the
[bug that prevents Mac OS X Archive Utility from unziping the generated files](https://github.com/janjongboom/node-native-zip/issues/9) presented on the node-native-zip 1.1.0 from npm