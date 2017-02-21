Messier Bingo
=============

[Charles Messier](https://en.wikipedia.org/wiki/Charles_Messier) lived in Paris in the 18th century. He wanted to become famous by discovering comets. When he looked through his telescope he often re-discovered objects which were already known and were not comets. So he didn't waste time, each time he found an object that did not move in the sky he catalogued it.

This project creates a bingo game based around the 110 objects in the Messier catalogue displaying images of each object taken with the LCOGT network.

How to play
-----------
 1. Download as many [bingo cards](http://lcogt.net/education/messierbingo) as you have players. There are 10 cards in total but more than one person could have the same card in a large group.
 1. Launch the Messier Bingo random image tombola (this).
 1. When you want to start click the arrow button in the bottom right
 1. Mark your card each time one of your objects appears
 1. When you have marked all the objects on your card shout 'Bingo', 'House' or even 'Messier' to win.

Authors
-------
Created and maintained by [Edward Gomez](http://lcogt.net/user/egomez), interface designed by [Charlotte Provot](http://www.charlotteprovot.com/), initial code developed by [Stuart Lowe](http://strudel.org.uk) for [Las Cumbres Observatory Global Telescope](http://lcogt.net/). LCOGT is a private operating foundation, building a global network of telescopes for professional research and citizen investigations.

Docker Instructions
===================

Build the image:

    $ docker build --pull -t docker.lco.global/messierbingo:latest

Push to the LCO internal Docker registry:

    $ docker push docker.lco.global/messierbingo:latest
