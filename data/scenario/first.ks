
@image storage ="room.jpg" page=fore layer=base
@wait time = 200

*start 
[title name="TyranoScript Explanation"]

Click to Start[l]
[cm]

@layopt layer=message0 visible=false
[backlay]

[image storage=logo3.png  layer=1 page=back visible=true top=200 left=180 ]
[trans time=3000]
[wt]
[wait time=1000]
[backlay]
[freeimage layer=1 page=back]
[trans time=3000]
[wt]


@layopt layer=message0 visible=true
@layopt layer=message1 visible=false

Thank you for trying out TyranoScript.[l][r]
Through playing this Sample Game, you can learn[r]
about the features of TyranoScript.[l][r]
By all means、stick with it till the end.[l][cm]

First off, this is created in [font color="red"] 「HTML5」 [resetfont]
.[l][r]


[image layer=1 page=fore visible=true top=200 left=200  storage = html5.png]

Using Tyranoscript, your creations can be used on...[r][l][cm]
Desktop（Both Windows and MacOSX）[l][r]
iPhone, iPad[l][r]
Android[l][r]
Game devices with browsers（PSVITA, NINTENDO　DS）etc. [l][r]
You can deploy your work in many places.[l][cm]

Furthermore, it is simple to make applications, [r]
and get them on the AppStore or Android[r]
Marketplace.[l][cm]

[freeimage page=fore layer=1 ]


TyranoScript has one more important feature.[l][r]
It uses the scripting engine of[r]
「KAG3/吉里吉里(kirikiri)」.[l][r]

[image layer=1 page=fore visible=true top=200 left=250  storage = kirikiri.png]

「KAG3/吉里吉里」 is a game engine for writing[r]
interactive fiction on Windows.[l][r]
It has a long history of achievements, [r] 
and many games have been created with it.[l][r]
There are many books, tutorials, and websites[r]
dedicated to it.[l][cm]

[freeimage layer=1 ]

TyranoScript has high compatibility with[r]
KAG3/吉里吉里.[l][r]
That means that you can port KAG3/吉里吉里 games[r] 
to the web (and smartphones).[l][r]
Of course, creating in TyranoScript also means[r]
you can easily port to KAG３/吉里吉里.[l][r]
TyranoScript allows people [r]
to play your game anywhere.[l][cm]

So let's take a look at some of[r] 
TyranoScript's functionality.[l][r]
TyranoScript is highly compatible[r] 
with KAG3/吉里吉里. [l][r]
This provides a great deal of control.[l][r]
For example, you can change the character[r]
[font size=40]font size or [l][resetfont]
[font color="pink"]color![resetfont][l][r]

[ruby text=る]ル[ruby text=び]ビを[ruby text=ふ]振ることだって[ruby text=かん]簡[ruby text=たん]単にできます[l][r]
("ruby" text is for showing hint characters[r]
in Japanese. It is also known as "furigana".)[l][cm]

[position vertical=true]

Like this, you can use vertical writing.[r][l]
As with horizontal writing, you have access[r]
to the same functionality.[l]

[position vertical=false]

You can use whichever system is appropriate[r]
for your scene. [r][l][cm]

[position height=160 top=300]
[l]
In this way, you can create adventure style games![l][r]
Let's have characters appear on the screen[l][cm]
Yukosan[l][r]

@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=50  storage = normal.png]
[trans time=2000]
@wt
@layopt layer=message0 visible=true

Harukosan[l][r]

@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=300  storage = haruko.png]
[trans time=2000]
@wt
@layopt layer=message0 visible=true

This method is simple.[l][r]

Anyways, let's change the scene.[l][cm]

@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
@layopt layer=message0 visible=true
[l][cm]
How about that?[l][cm]
We're in the Hallway now![l][cm]

In TyranoScript, controlling transitions and layers is easy.[l][cm]

【Yuko】[r]
So... Should we go back?[l][cm]

Yeah sure. Thanks.[l][cm]

@backlay
[freeimage layer=0 page=back]
@trans time=2000
[wt]

[l][cm]
Of course, you can also play music![l][cm]
How about we listen now?[l][cm]

[link target=*playmusic]【１】Yeah.  Let's hear it![endlink][r]
[link target=*noplay]【２】No.  I don't want to hear it！[endlink]
[s]

*playmusic

[l][cm]
Now there's music![l]
@fadeinbgm time="3000" storage=music.mp3 loop=true
You can also gradually fade in the playback.[l][cm]

@jump target="*common"

*noplay
[l][cm]
Ok.  Music's not your thing, huh?[l][cm]
Try it out some other time![l][cm]

*common

So you can see that[r]
story branches are also easy to create.[l][cm]

Let's return to full screen.[l][cm][l][cm]

[position layer="message0" left=10 top=10 height=450 page=fore visible=true]

Thank you very much for getting all the way here.[r][l]
How was it?[l][cm]

Other features[r][l]
「Variable Management」[r][l]
「JS execution」[r][l]
「Conditional Branches」[r][l]
「Flag Control」[r][l]
「Mathematical Processing」[r][l]
「JQuery Integration」[r][l]
「Macros and Subroutines」[r][l]
「Graphical Buttons」[r][l]
And much more![l][cm]

There is a lot to play around with,[r]
so please try it out![l][cm]

This is an experimental project,[r]
so there are probably errors.[l][cm]
By all means, get in touch![l][cm]
I am looking for contributors of[r]
KAG3/吉里吉里 created projects.[r][l]
Files are KAG3/吉里吉里 compatible.[l][cm]
Thank you very much for trying out TyranoScript![l]

[l][cm]
Returning to the beginning.[l]
[l][cm]
@jump target="*start"

[l]

[l][r]
