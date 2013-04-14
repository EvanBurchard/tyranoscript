//スクリプトの評価

/*
#[loadjs]
:group
Macros, Variables, JavaScript Interface
:title
Load JavaScript File
:exp
Read in external JavaScript File
There are no restrictions on how the js will work.
The JS file should be in data/others folder 
:sample
[loadjs storage="sample.js"  ]
:param
storage=the name of the JavaScript file to load.
#[end]
*/
tyrano.plugin.kag.tag.loadjs={
    
    vital:["storage"],
    
    pm:{
        storage:""
    },
    
    start:function(pm){
        
        var that = this;
        
        $.getScript("./data/others/"+pm.storage, function(){
            that.kag.ftag.nextOrder();
        });
    }
};


/*
#[movie]
:group
Other
:title
play movie
:exp
play an mp4 video
:sample
[movie storage="" skip=false ]
:param
storage=the file where an mp4 is stored,
skip=set whether or not this is skipable.
#[end]
*/

//グラフィックボタン表示位置調整、テキストはできない
tyrano.plugin.kag.tag.movie ={
    
    vital:["storage"],
    
    pm:{
        storage:"",
        skip:false
    },
    
    start:function(pm){
        
        var that = this;
        
        if($.userenv() !="pc"){
            this.kag.layer.showEventLayer();
             //クリックしないと始まらないようにする
            $('.tyrano_base').bind('click.movie', function(e){
                that.playVideo(pm);
                $(".tyrano_base").unbind("click.movie");
            
            });
            
        }else{
            
            //firefoxの場合は再生できない旨、警告
            if($.getBrowser()=="firefox"){
                alert("ご利用のブラウザでは、ムービーを再生できません。飛ばします。");
                that.kag.ftag.nextOrder();
                return;
            }
            
            that.playVideo(pm);
        }
        
    },
    
    playVideo:function(pm){
    
        var that = this;
        
            var url = "./data/video/"+pm.storage;
            
            var video = document.createElement('video');
            video.setAttribute('myvideo');
            video.src = url;
            
            //top:0px;left:0px;width:100%;height:100%;'";
            
            video.style.backgroundColor = "black";
            video.style.zIndex=199999;
            video.style.position="absolute";
            video.style.top="0px";
            video.style.left="0px";
            video.style.width="100%";
            video.style.height="100%";
            video.autoplay = true;
            video.autobuffer = true;
            
            video.addEventListener("ended",function(e){
                $(".tyrano_base").find("video").remove();
                that.kag.ftag.nextOrder();
        
            });
            
            //スキップ可能なら、クリックで削除
            
            if(pm.skip == "true"){
                
                video.addEventListener("click",function(e){
                    $(".tyrano_base").find("video").remove();
                    that.kag.ftag.nextOrder();
        
                });
           
           }
            
            document.getElementById("tyrano_base").appendChild(video);
            video.load();
            video.play();
    
    }
    
};


/*
#[showsave]
:group
System Settings
:title
Show save screen
:exp
Show save screen
:sample
[showsave]
:param
#[end]
*/

tyrano.plugin.kag.tag.showsave ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.displaySave();
        
    }
    
};


/*
#[showload]
:group
System Settings
:title
Show load screen
:exp
Show load screen
:sample
[showload]
:param
#[end]
*/

tyrano.plugin.kag.tag.showload ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.displayLoad();
        
    }
};


/*
#[showmenu]
:group
System Settings
:title
Show menu
:exp
Show menu
:sample
[showmenu]
:param
#[end]
*/

tyrano.plugin.kag.tag.showmenu ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.menu.showMenu();
        
    }
};



/*
#[showmenubutton]
:group
System Settings
:title
Show menu button
:exp
Show menu button
:sample
[showmenubutton]
:param
#[end]
*/

tyrano.plugin.kag.tag.showmenubutton ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        $(".button_menu").show();
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[hidemenubutton]
:group
System Settings
:title
Hide menu Button
:exp
Hide menu Button
:sample
[hidemenubutton]
:param
#[end]
*/

tyrano.plugin.kag.tag.hidemenubutton ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        $(".button_menu").hide();
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[skipstart]
:group
System Settings
:title
Skip Start
:exp
start "skip mode" where the characters move faster
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.skipstart ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.stat.is_skip = true;
        this.kag.ftag.nextOrder();
            
    }
};


/*
#[skipstop]
:group
System Settings
:title
Skip stop
:exp
stop "skip mode" where the characters move faster
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.skipstop ={
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.stat.is_skip = false;
        this.kag.ftag.nextOrder();
            
    }
};



/*
#[anim]
:group
Animation
:title
Animation
:exp
With this you can animate a picture, button or even the contents of a layer.
You should call the element that you want to animate by using the name you gave it when it was created with the [image] [ptext] or [button] tags.
When you set a layer, the animation will affect all elements in the layer.
This tag does not wait for the animation to stop. If you use the [wa] tag, you can wait for the completion of all animations that are being performed.
You can set the position of the animation using the values of -100 through 100. (From where it is currently, it can be moved to the left 100px)
If you set the opacity, you can also make something disappear.
:sample
[ptext layer=1 page=fore text="example text" size=30 x=0 y=0 color=red vertical=true]

[image layer=0 left=100 top=100  storage = yuko1.png page=fore visible=true name=yuko,chara ]
[image layer=1 left=300 top=100 storage = haruko1.png page=fore visible=true name=haruko ]

;set the name attribute animate
[anim name=haruko left="+=100" time=10000 effect=easeInCirc opacity=0  ]

;set the layer and animate
[anim layer=1 left="+=100" effect=easeInCirc opacity=0  ]

;pause all animations
[wa]

Animations over

:param
name=use this property to look up the button layer or picture to animate,
layer=if a name is set this will be ignored. Otherwise this to set the foreground layer,
left=animate it horizontally to the position you set,
top=animate it vertically to the position you set,
width=set the width,
height=set the height,
opacity=set the value from 0-255.  It will animate to the given opacity.,
color=set the color,
time=time taken by the animation. Default is 2000 milliseconds,
effect=define the effect of the animation. examples are defined as follows <br />

jswing
｜def
｜easeInQuad
｜easeOutQuad
｜easeInOutQuad
｜easeInCubic
｜easeOutCubic
｜easeInOutCubic
｜easeInQuart
｜easeOutQuart
｜easeInOutQuart
｜easeInQuint
｜easeOutQuint
｜easeInOutQuint
｜easeInSine
｜easeOutSine
｜easeInOutSine
｜easeInExpo
｜easeOutExpo
｜easeInOutExpo
｜easeInCirc
｜easeOutCirc
｜easeInOutCirc
｜easeInElastic
｜easeOutElastic
｜easeInOutElastic
｜easeInBack
｜easeOutBack
｜easeInOutBack
｜easeInBounce
｜easeOutBounce
｜easeInOutBounce

#[end]
*/


tyrano.plugin.kag.tag.anim ={
    
    pm:{
    
        name:"",
        layer:"",
        left:"",
        top:"",
        width:"",
        height:"",
        opacity:"",
        color:"",
        time:"2000",
        effect:""
    
    },
    
    start:function(pm){
        
        var that = this;
        
        var anim_style = {};
        
        
        if(pm.left !=""){
            anim_style.left=pm.left;
        }
        if(pm.top !=""){
            anim_style.top = pm.top;
        }
        if(pm.width !=""){
            anim_style.width = pm.width;
        }
        if(pm.height !=""){
            anim_style.height=pm.height;
        }
        
        if(pm.opacity !=""){
            anim_style.opacity=$.convertOpacity(pm.opacity);
        }
        
        if(pm.color !=""){
            anim_style.color = $.convertColor(pm.color);
        }
        
        
        
        var target ="";
        
        if(pm.name !=""){ 
            
            //アニメーションスタックの積み上げ
            that.kag.pushAnimStack();
            
            $("."+pm.name).animate(
                anim_style,
                parseInt(pm.time), 
                pm.effect,
                function(){
                    
                    that.kag.popAnimStack();
            
                }
            );
        
        }else if(pm.layer !=""){
            
            var layer_name = pm.layer+"_fore";
            
            //フリーレイヤに対して実施
            if(pm.layer =="free"){
                layer_name = "layer_free";
            }
            
            //レイヤ指定の場合、その配下にある要素全てに対して、実施
            var target_array = $("."+layer_name).children();
            
            target_array.each(function(){
               
               that.kag.pushAnimStack();
            
               
               $(this).animate(
                    anim_style,
                    parseInt(pm.time), 
                    pm.effect,
                    function(){
                        that.kag.popAnimStack();
            
                    }
                );
               
            });
            
            
        }
        
        
        //次の命令へ　アニメーション終了街の場合は厳しい
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[wa]
:group
Animation
:title
Pause Animation
:exp
Pause the currently playing animation
:sample
:param
#[end]
*/

//トランジション完了を待つ
tyrano.plugin.kag.tag.wa={
    start:function(pm){
        this.kag.layer.hideEventLayer();
    }
};


//================キーフレームアニメーション系

/*
#[keyframe]
:group
Animation
:title
Set animation keyframe
:exp
Set animation keyframe.  The defined animation can be used by setting the [kanim] tag.
:sample
;----setting the keyframe
[keyframe name="fuwafuwa"]
[frame p=40%  x="100" ]
[frame p=100% y="-200" opacity=0 ]
[endkeyframe]
;-----run the defined animation
:param
name=Sets the names of the key frame. This will be the name to use if you use the kanim tag later.
#[end]
*/

tyrano.plugin.kag.tag.keyframe ={
    
    vital:["name"],
    
    pm:{
        name:""
    },
    
    start:function(pm){
        
        this.kag.stat.current_keyframe = pm.name;
        
        this.kag.ftag.nextOrder();
            
    }
};


/*
#[endkeyframe]
:group
Animation
:title
End Keyframe
:exp
Stop the definition of keyframe animations
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.endkeyframe ={
    
    
    pm:{
    },
    
    start:function(pm){
        
        this.kag.stat.current_keyframe = "";
        this.kag.ftag.nextOrder();
            
    }
};

/*
#[frame]
:group
Animation
:title
Keyframe Animation Settings
:exp
This defines the key frame animation. The defined animation can be used by setting the [kanim] tag.
:sample
:param
p=Set the percentage. For example, an animation that takes 5 seconds you will want to set each slide at 20% (?). Set it to 0-100%. If you omit putting it to 0% you can continue from the previous animation and start a new animation.,
x=Set the pixels the amount that the animation should move on the X axis.  Or if you start it with an asterisk (*) you can set it at an absolute position.  (For example) x="100" (it will move 100px forward) x="*100" it will move from the left of the screen to the 100px position.,
y=Set the pixels the amount that the animation should move on the Y axis.  Or if you start it with an asterisk (*), you can set it at an absolute position.  (For example) y="100" (it will move 100px forward) y="*100" it will move from the top of the screen to the 100px position.,
z=Set the pixels the amount that the animation should move on the Z axis.  Or if you start it with an asterisk (*) you can set it at an absolute position.  (For example) z="100" (it will move 100px forward) z="*100" using this tag is able to make the animation 3D but it currently only works on select browsers (Safari iPhone etc.),
rotate=You can rotate the target. As an example using notation like rotate="360deg" will turn the image 360 degrees.,
rotateX=You can rotate the target on the X axis.  As an example, using notation like rotate="360deg" will turn the image 360 degrees.,
rotateY=You can rotate the target on the Y axis.  As an example, using notation like rotate="360deg" will turn the image 360 degrees.,
rotateZ=You can rotate the target on the Z axis.  As an example, using notation like rotate="360deg" will turn the image 360 degrees.,
scale=You can enlarge or shrink the target. (Ex) scale="2" will double the size, scale-"0.5" will half the target.,
scaleX=Enlarge or shrink the target horizontally.,
scaleY=Enlarge or shrink the target vertically.,
scaleZ=Enlarge or shrink the target in the 3rd dimension.,
skew=skew,
skewX=Xskew,
skewY=Yskew,
perspective=You can change perspective.  Only select browsers.,
opacity=By setting this to 0-1, you can set the opacity of every element.  It is possible to make an element disappear this way.  At 0, it is completely transparent.,
Others=You can also use CSS to set other properties.
#[end]
*/

tyrano.plugin.kag.tag.frame ={
    
    vital:["p"],
    
    pm:{
        p:""
    },
    
    master_trans:{
        "x":"",
        "y":"",
        "z":"",
        "translate":"",
        "translate3d":"",
        "translateX":"",
        "translateY":"",
        "translateZ":"",
        "scale":"",
        "scale3d":"",
        "scaleX":"",
        "scaleY":"",
        "scaleZ":"",
        "rotate":"",
        "rotate3d":"",
        "rotateX":"",
        "rotateY":"",
        "rotateZ":"",
        "skew":"",
        "skewX":"",
        "skewY":"",
        "perspective":""
    },
    
    start:function(pm){
        
        var percentage = pm.p;
        
        delete pm.p ;
        
        //!!!!!!!!!transかstyleかをここで振り分ける必要がありますよ！
        
        //色々定義できる
        
        if(this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]){
            
        }else{
            
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]= {};
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"]= {};
            this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["styles"]= {};
            
        }
        
        
        var map_trans = {};
        var map_style = {};
        
        for(key in pm){
           
           if(this.master_trans[key] =="" ){
            map_trans[key] = pm[key];
           }else{
            map_style[key] = pm[key];
           }
        }
        
        
        this.kag.stat.map_keyframe[this.kag.stat.current_keyframe]["frames"][percentage] ={"trans":map_trans,"styles":map_style};
        
        this.kag.ftag.nextOrder();
            
    }
};



/*
#[kanim]
:group
Animation
:title
Execute Keyframe
:exp
This executes a keyframe animation. You can implement a complex animation by defining the name as well as the text and pictures you want to animate with the [keyframe] tag.
:sample
:param
name=sets the name of the text or image that will be animated,
layer=if you don't set the name and set the layer instead this will animate all elements in the layer,
keyframe=sets the name of the keyframe animation,
time=the time of the animation in milliseconds,
easing=set the pattern of change for the animation.
Some of the things you can set are:
ease(smoothly at the beginning and end)　
linear(plays at a set interval)
ease-in(plays back slowly at the beginning)
ease-out(plays back slowly at the end)
ease-in-out(plays back slowly at the beginning and end)
it's possible to set the easing your own way by using the cubic-bezier function,
count = set the number of times it plays. The default is one. If you set it to "infinite" the animation will play forever.,
delay = milliseconds before playback. default is 0,
direction = animations can alternate betwen their reverse and normal progression. default is "normal" and "alternate" sets the animation to alternate between normal and reverse,
mode = set the status before and after playback. Default is "forwards" and it maintains the same configuration after play. If set to "none" it will not maintain the same configuration.

#[end]
*/

tyrano.plugin.kag.tag.kanim ={
    
    vital:["keyframe"],
    
    pm:{
        "name":"",
        "layer":"",
        "keyframe":""
    },
    
    start:function(pm){
        
        var that = this;
        
        var anim = this.kag.stat.map_keyframe[pm.keyframe];
        
        var class_name = "."+pm.name;
        
        anim.config = pm;
        
        if(pm.time){
            pm.duration = parseInt(pm.time) +"ms";
        }
          
        //アニメーション完了したら、
        anim.complete = function(){
            
            that.kag.popAnimStack();
            
        }
        
        if(pm.name !=""){ 
            
            delete pm.name;
            delete pm.keyframe;
            
            that.kag.pushAnimStack();
            
            $(class_name).a3d(
                anim
            );
        
        }else if(pm.layer !=""){
            
            var layer_name = pm.layer+"_fore";
            
            //フリーレイヤに対して実施
            if(pm.layer =="free"){
                layer_name = "layer_free";
            }
            
            delete pm.name;
            delete pm.keyframe;
            delete pm.layer;
            
            
            //レイヤ指定の場合、その配下にある要素全てに対して、実施
            var target_array = $("."+layer_name).children();
            
            
            target_array.each(function(){
               
               that.kag.pushAnimStack();
               
               $(this).a3d(
                anim
                );
                
            });
            
            
        }
        
        
        this.kag.ftag.nextOrder();
            
    }
};



//=====================================


//**** キャラクター操作系


tyrano.plugin.kag.tag.chara_ptext ={
    
    
    pm:{
        
        name : ""
        
    },
    
    start:function(pm){
        
        if(pm.name==""){
            $("."+this.kag.stat.chara_ptext).html("");
        }else{
            
            var cpm =  this.kag.stat.charas[pm.name];
            
            if(cpm){
            //キャラクター名出力
                $("."+this.kag.stat.chara_ptext).html(cpm.jname);
            
            }else{
                //存在しない場合はそのまま表示できる
                 $("."+this.kag.stat.chara_ptext).html(pm.name);
            }
        }
        this.kag.ftag.nextOrder();
        
    }
};

/*
#[chara_config]
:group
Character
:title
Character Settings
:exp
Change Character Settings
:sample
:param
pos_mode=set as true or false. default is true. when true the [chara_show] tag (etc) will automatically place the character,
ptext=set the name text to show when the character is speaking. for example when defined like this [ptext name="name_space"] after that when a character is set as #yuko will show in the ptext area.,
effect=The way that a character moves in or out.
jswing
｜def
｜easeInQuad
｜easeOutQuad
｜easeInOutQuad
｜easeInCubic
｜easeOutCubic
｜easeInOutCubic
｜easeInQuart
｜easeOutQuart
｜easeInOutQuart
｜easeInQuint
｜easeOutQuint
｜easeInOutQuint
｜easeInSine
｜easeOutSine
｜easeInOutSine
｜easeInExpo
｜easeOutExpo
｜easeInOutExpo
｜easeInCirc
｜easeOutCirc
｜easeInOutCirc
｜easeInElastic
｜easeOutElastic
｜easeInOutElastic
｜easeInBack
｜easeOutBack
｜easeInOutBack
｜easeInBounce
｜easeOutBounce
｜easeInOutBounce
,
#[end]
*/

tyrano.plugin.kag.tag.chara_config ={
    
    
    pm:{
        
        pos_mode : "true",
        effect:"swing",
        ptext:""
        
    },
    
    start:function(pm){
        
        this.kag.stat.chara_pos_mode = pm.pos_mode;
        this.kag.stat.chara_effect = pm.effect;
        this.kag.stat.chara_ptext = pm.ptext;
        
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[chara_new]
:group
Character
:title
New character
:exp
Set the info for a new character. after that, it can be further manipulated with the [chara_show] tag and others.
Also you can set the name here which is referenced by the [anim] tag later.
In other words, after you add a character, you can freely animate it.
:sample
[chara_new name="yuko" storage="yuko.png"  jname="ゆうこ"]
:param
name=The name that this character will be referenced by (written in ascii characters). This name must be unique.,
storage=set the character picture. this should be in the project's fgimage directory,
width=Set the width of the picture,
height=Set the height of the picture,
jname=when this character's name is shown, this is the display version. For example when yuko is used "ゆうこ" can appear in the message area
#[end]
*/

tyrano.plugin.kag.tag.chara_new ={
    
    vital:["name","storage"],
    
    pm:{
        
        name:"",
        storage:"",
        width:"",
        height:"",
        jname:"",
        visible:"false" 
        
    },
    
    start:function(pm){
        
        //イメージの追加
        //前景レイヤ
        this.kag.stat.charas[pm.name] = pm;
        
        var storage_url = "./data/fgimage/"+pm.storage;
        
        //事前ローディング
        /*
        var strage_url = "./data/fgimage/"+pm.storage;
        var img_obj = $("<img />");
        img_obj.attr("src",strage_url);
        */
       
        this.kag.preload(storage_url);
        
        //即座に追加
        if(pm.visible == "true"){
            
        }
        
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[chara_show]
:group
Character
:title
Show Character
:exp
Show a previously defined character
:sample
[chara_show name="yuko" ]
:param
name=reference the character to show with the name previously defined by [chara_new],
time="Set the time it takes for the character to appear。The default is 1000 miliseconds,
layer="The layer to place the character in. The default is the foreground (layer=0)",
page="set fore or back. The default is fore.",
wait="if true is set the character's appearance will be delayed.  The default is true",
left="sets the horizonal position. If this is set automatic movement will not be affected",
top="sets the vertical position. If this is set automatic movement will not be affected",

#[end]
*/

tyrano.plugin.kag.tag.chara_show ={
    
    vital:["name"],
    
    pm:{
        
        name:"",
        page:"fore",
        layer:"0",//レイヤーデフォルトは０に追加
        wait:"true", //アニメーションの終了を待ちます
        left:"0",  //chara_config でauto になっている場合は、自動的に決まります。指定されている場合はこちらを優先します。
        top:"0",  
        time:1000
        
    },
    
    start:function(pm){
        
        var that = this;
        
        var cpm =  this.kag.stat.charas[pm.name];
        
        if(cpm == null){
            this.kag.error("指定されたキャラクター「"+pm.name+"」は定義されていません。[chara_new]で定義してください");
            return;
        }
        
        var strage_url = "./data/fgimage/"+cpm.storage;
        var img_obj = $("<img />");
        
        img_obj.attr("src",strage_url);
        
        img_obj.css("position","absolute");
        
        img_obj.css("display","none");
        //前景レイヤを表示状態にする
        
        var target_layer = this.kag.layer.getLayer(pm.layer,pm.page);
        target_layer.append(img_obj).show();
        
        
        var chara_num = 1;
        this.kag.layer.hideEventLayer();
            
        
        //立ち位置を自動的に設定する場合
        if(this.kag.stat.chara_pos_mode =="true" && pm.top=="0" && pm.left =="0"){
            
            //立ち位置自動調整
            img_obj.css("bottom","0px");
            
            //既存キャラの位置を調整する
            var chara_cnt = target_layer.find(".tyrano_chara").length;
            
            var sc_width = parseInt(this.kag.config.scWidth);
            var sc_height = parseInt(this.kag.config.scHeight);
            
            var center = Math.floor(parseInt(img_obj.css("width"))/2);
           
            //一つあたりの位置決定
            var base = Math.floor(sc_width/(chara_cnt+2));
            var tmp_base = base;
            var first_left = base - center;
                     
            img_obj.css("left",first_left+"px");
            
            //すべてのanimationが完了するまで、次へ進めないように指定
            
            target_layer.find(".tyrano_chara").each(function(){
                
                chara_num++;
                
                tmp_base +=base;
                
                var j_chara = $(this);
                //この分をプラスする感じですね
                center = Math.floor(parseInt(j_chara.css("width"))/2);
                //1つ目は主人公にゆずる
                var left = tmp_base - center;
                
                j_chara.animate(
                    {
                        left:left
                    }
                    ,
                    parseInt(pm.time), 
                    that.kag.stat.chara_effect,
                    function(){
                        chara_num--;
                        if(chara_num == 0){
                            that.kag.layer.showEventLayer();
                            that.kag.ftag.nextOrder();
                        }
                    }
                );
                
            });
            
            
        }else{
            
            
            img_obj.css("top",pm.top+"px");
            img_obj.css("left",pm.left+"px");
            
            //that.kag.ftag.nextOrder();
            
        }
        
        //オブジェクトにクラス名をセットします name属性は一意でなければなりません
        $.setName(img_obj,cpm.name);
        img_obj.addClass("tyrano_chara"); //キャラクター属性を付与。
        
        //新しいスタイルの定義
        
        if(cpm.width!=""){
            img_obj.css("width",cpm.width+"px");
        }
        
        if(cpm.height!=""){
            img_obj.css("height",cpm.height+"px");
        }
        
        if(pm.wait!="true"){
            this.kag.ftag.nextOrder();
        }
        
        //アニメーションでj表示させます
        img_obj.animate(
                {
                    opacity:"show"
                },
                {
                    duration: pm.time, 
                    easing:that.kag.stat.chara_effect,
                    complete: function(){
                        
                        chara_num--;
                        if(chara_num == 0){
                            that.kag.layer.showEventLayer();
                            
                            if(pm.wait=="true"){
                                that.kag.ftag.nextOrder();
                            }
                            
                        }
                        
                    }//end complerte
                }
       );
       
       
    }
};

/*
#[chara_hide]
:group
Character
:title
Hide Character
:exp
hide a character that has been displayed with [chara_show]
:sample
[chara_hide name="yuko" ]
:param
name=the name defined by [chara_new]'s name attribute, 
wait=if this is set to true the character will wait to disappear. Default is true,
time=set in miliseconds.  this is the length of time for a character to disappear. The default is 1000 miliseconds,
layer=remove the character from the layer set by [chara_show] if it is set. the default is 0,
overwrite=if set to true and the ptext of the name already exists on the screen, you can change just the text. the defualt is false

#[end]
*/

tyrano.plugin.kag.tag.chara_hide ={
    
    vital:["name"],
    
    pm:{
        page:"fore",
        layer:"0",//レイヤーデフォルトは０に追加
        name:"",
        wait:"true",
        time:1000
        
    },
    
    start:function(pm){
        
        var that = this;
        
        var target_layer = this.kag.layer.getLayer(pm.layer,pm.page);
        
        var img_obj = target_layer.find("."+pm.name);
        
        
        var chara_num = 0;
        that.kag.layer.hideEventLayer();
 
        //アニメーションでj表示させます
        img_obj.animate(
                {
                    opacity:"hide"
                },
                {
                    duration: pm.time, 
                    easing: "linear",
                    complete: function(){
                        
                            img_obj.remove();
                            
                            if(that.kag.stat.chara_pos_mode =="true"){
                                
                                //既存キャラの位置を調整する
                                var chara_cnt = target_layer.find(".tyrano_chara").length;
                                var sc_width = parseInt(that.kag.config.scWidth);
                                var sc_height = parseInt(that.kag.config.scHeight);
                                
                                //一つあたりの位置決定
                                var base = Math.floor(sc_width/(chara_cnt+1));
                                var tmp_base = 0;
                                
                                if(chara_cnt == 0){
                                    that.kag.layer.showEventLayer();
                                    that.kag.ftag.nextOrder();
                                    return;
                                }
                                
                                target_layer.find(".tyrano_chara").each(function(){
                                    
                                    chara_num++;
                                    
                                    tmp_base +=base;
                                    
                                    var j_chara = $(this);
                                    //この分をプラスする感じですね
                                    var  center = Math.floor(parseInt(j_chara.css("width"))/2);
                                    //1つ目は主人公にゆずる
                                    var left = tmp_base - center;
                                    
                                    j_chara.animate(
                                        {
                                            left:left
                                        }
                                        ,
                                        parseInt(pm.time), 
                                        that.kag.stat.chara_effect,
                                        function(){
                                            
                                            chara_num--;
                                            if(chara_num == 0){
                                                that.kag.layer.showEventLayer();
                                                
                                                that.kag.ftag.nextOrder();
                                            }
                                            
                                        }
                                    );
                                    
                                });
                                
                                
                                //that.kag.ftag.nextOrder();
                            
                        }else{
                            
                            that.kag.layer.showEventLayer();
                            //that.kag.ftag.nextOrder();
                            
                        }
                    }//end complerte
                }
       ); // end animate
       
        //すぐに次の命令を実行
        if(pm.wait!="true"){
            this.kag.ftag.nextOrder();
        }
       
       //this.kag.ftag.nextOrder();
        
    }
    
};

/*
#[chara_delete]
:group
Character
:title
Delete Character
:exp
Delete character and character info.  
If you want to just remove the character from the screen, use [chara_hide] instead.
:sample
[chara_delete name="yuko" ]
:param
name=the name set by [chara_new]
#[end]
*/

tyrano.plugin.kag.tag.chara_delete ={
    
    vital:["name"],
    
    pm:{
        
        name:""
        
    },
    
    start:function(pm){
        
       delete this.kag.stat.charas[pm.name];
       
       this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[chara_mod]
:group
Character
:title
Change character appearance
:exp
Change the sprite of a character on the screen. Likely useful for changing facial expressions.
:sample
[chara_mod name="yuko" storage="newface.png"]
:param
name=define name of [chara_new],
storage=new charater sprite file. should be in the fgimage folder of the project

#[end]
*/

tyrano.plugin.kag.tag.chara_mod ={
    
    vital:["name","storage"],
    
    pm:{
        
        name:"",
        storage:"" 
        
    },
    
    start:function(pm){
       
       $("."+pm.name).attr("src","./data/fgimage/"+pm.storage);
       
       this.kag.ftag.nextOrder();
        
    }
    
};

