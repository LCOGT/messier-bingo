Messier Bingo
=============

This application generates the static content for [Messier Bingo](http://messierbingo.lco.global) game, including the bingo cards and JSON files. The code for the game is publicly available as [Messier Bingo web](https://github.com/LCOGT/messier-bingo-web). 

Docker Instructions
===================

Build the image:

    $ docker build --pull -t docker.lco.global/messierbingo:latest

Push to the LCO internal Docker registry:

    $ docker push docker.lco.global/messierbingo:latest

## Build Instructions

If you change any of the DB of Messier objects, regenerate the JSON files with:

    $ python manage.py runserver

In the directory where you want to save the DB files

    $ curl -o "M#1.json" "http://localhost:8000/db/M[1-110]/?format=json"

Authors
-------
Created and maintained by [Edward Gomez](http://lcogt.net/user/egomez), interface designed by [Charlotte Provot](http://www.charlotteprovot.com/), initial code developed by [Stuart Lowe](http://strudel.org.uk) for [Las Cumbres Observatory Global Telescope](http://lcogt.net/). LCOGT is a private operating foundation, building a global network of telescopes for professional research and citizen investigations.
