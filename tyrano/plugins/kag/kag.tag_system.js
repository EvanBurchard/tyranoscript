
/*
#[eval]
:group
Macros, Variables, JavaScript Interface
:title
Evaluate Expression
:exp
exp allows evaluation of expressions。variables can be assigned to numbers, etc.
exp allows for arbitrary TJS(JS) so, any valid TJS(JS) can be evaluated.
:sample
[eval exp="f.test=500"]
;↑assign to game variable test to a number
[eval exp="f.test2='Example String'"]
;↑assign game variable test2 to Example String
[eval exp="sf.test=400"]
;↑assign system variable test to a number
[eval exp="f.test2=f.test*3"]
;↑assign game variable test2 to 3x game variable test 
:param
exp=TJS expression to be evaluated
#[end]
*/


//script evaluation
tyrano.plugin.kag.tag.eval={
    
    vital:["exp"],
    
    pm:{
        exp:""
    },
    
    start:function(pm){
        
        this.kag.evalScript(pm.exp);
        this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[clearvar]
:group
Macros, Variables, JavaScript Interface
:title
clear all game variables
:exp
clear all game variables
:sample
:param
#[end]
*/

//Reset all variables
tyrano.plugin.kag.tag.clearvar={
  
  //delete all variables
  pm:{
  },
  start:function(pm){
      this.kag.clearVariable();
      this.kag.ftag.nextOrder();
        
  }
};


/*
#[clearsysvar]
:group
Macros, Variables, JavaScript Interface
:title
clear all system variables
:exp
clear all system variables
:sample
:param
#[end]
*/

//reset system variables
tyrano.plugin.kag.tag.clearsysvar = {

    start:function(){
        this.kag.variable.sf ={}; //system variable
        this.kag.ftag.nextOrder();
    }

};


/*
#[close]
:group
System Settings
:title
Close Window
:exp
Close Window
:sample
:param
ask=if true is set a confirmation will be requested. If false is set no confirmation will occur. This attribute is set to true by default.
#[end]
*/


//Close window command
tyrano.plugin.kag.tag["close"] = {

    pm:{
        ask:"true"
    },

    start:function(pm){
        
        if(pm.ask=="true"){
            if(confirm("You are about to close the window.  Are you sure you want to do this?")){
                window.close();
            }
        }else{
            window.close();
        }
    }

};



/*
#[trace]
:group
Other
:title
console output
:exp
outputs values to the console
【In the case of KAG3 or 吉里吉里(kirikiri)】
in the console with Shift+F4 activate the display or in Config.tjs turn logMode on and it will record
【In the case of TyranoScript in a browser】
Check in the web inspector console of the browser
:sample
[trace exp="f.test"]
; ↑ game variable test's details are output to the console 
:param
exp=A TJS(JS) espression to be evaluated
#[end]
*/

//output a variable to console
tyrano.plugin.kag.tag["trace"] = {
     pm:{
        exp:""
    },
    start:function(pm){
        var val = this.kag.embScript(pm.exp);
        //evaluationされた値をsubstitute
        //this.kag.ftag.startTag("text",{"val":val});
        
        this.kag.log("trace出力："+val);
    }
};


/*
#[title]
:group
System Settings
:title
Set Title
:exp
Sets the title for the game
You can also change each chapter title for the player.
In kirikiri the application window title will change.
In TyranoScript the title attribute of the browser is changed.
:sample
[title name="Title after change"]
:param
name=The name you want for your title
#[end]
*/

tyrano.plugin.kag.tag["title"] = {

    vital:["name"],

    pm:{
        name:""
    },

    //Titleの設定
    start:function(pm){
        if(pm.name!=""){
            //Titleの設定
            this.kag.setTitle(pm.name);
            this.kag.ftag.nextOrder();
        }
    }

};


/*
#[iscript]
:group
Macros, Variables, JavaScript Interface
:title
Enter JavaScript
:exp
You can use JavaScript between [iscript] and [endscript].
TJS can also be used, but TyranoScript variables are unavailable.
:sample
[iscript]

var test = 22;
f.name = test;
alert("javascript functions are available");
//jquery commands and javascript methods can also be used.
$("body").html();

[endscript]
:param
#[end]
*/

//script開始
tyrano.plugin.kag.tag.iscript = {
    start:function(pm){
        
        this.kag.stat.is_script = true;
        this.kag.stat.buff_script = "";
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[endscript]
:group
Macros, Variables, JavaScript Interface
:title
end JavaScript
:exp
end JavaScript description
:sample
:param
#[end]
*/

//script end
tyrano.plugin.kag.tag.endscript = {
    start:function(pm){
        
        //scriptを実行する
        this.kag.evalScript(this.kag.stat.buff_script);
        
        this.kag.stat.is_script = false;
        this.kag.stat.buff_script = "";
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[html]
:group
Other
:title
add an HTML layer
:exp
In between [html] and [endhtml] HTML can be entered.
This feature is very powerful.  Of course JavaScript, Canvas, and next generation web expressions are supported.
For example a Youtube video player can be inserted and any number of public APIs can be accessed.
By using this tag, any HTML elements can be added.
If you use the [cm] tag and do not clear everything, even if you click the game cannot continue.
By all means use graphic buttons, etc. to ensue that you can jump to a game state where you can still continue.
Inside of this tag, variables of TyranoScript can be used.
[emb] tags inside of previously set HTML can be used.
:sample

;place the youtube player in a designated spot
;use the embed tag for youtube 
[html top=100 left=300]

<object width="200" height="113">
<param name="movie" value="http://www.youtube.com/v/60TMm2sQTBU?version=3&amp;hl=ja_JP&amp;rel=0">
</param>
<param name="allowFullScreen" value="true"></param>
<param name="allowscriptaccess" value="always"></param>
<embed src="http://www.youtube.com/v/60TMm2sQTBU?version=3&amp;hl=ja_JP&amp;rel=0" type="application/x-shockwave-flash" width="200" height="113" allowscriptaccess="always" allowfullscreen="true">
</embed></object>

[endhtml]
:param
left=sets the horizontal postion of the [HTML] tag in pixels,
top=sets the vertical postion of the [HTML] tag in pixels,
name=you can set the name of the HTML area. Using this name animations can be performed with the HTML.
#[end]
*/
//htmlのdisplay、そして、格納だわな。
tyrano.plugin.kag.tag.html = {
    
    pm:{
      layer:"",
      top:0,
      left:0  
    },
    
    start:function(pm){
        
        this.kag.stat.is_html = true;
        this.kag.stat.map_html={};
        this.kag.stat.map_html.buff_html = "";
        this.kag.stat.map_html.buff_pm = pm;
        
        this.kag.ftag.nextOrder();
        
    }
};



/*
#[endhtml]
:group
Other
:title
end HTML
:exp
end HTML input
:sample
:param
#[end]
*/
//html end
tyrano.plugin.kag.tag.endhtml = {
    
    start:function(pm){
        
        var that = this;
        
        var tpm = this.kag.stat.map_html.buff_pm;
        var html = this.kag.stat.map_html.buff_html;
        
        var html_obj = $("<div></div>");
        html_obj.css("position","absolute");
        html_obj.css("top",tpm.top+"px");
        html_obj.css("left",tpm.left+"px");
        
        $.setName(html_obj,tpm.name);
        
        html_obj.append($(html));
        
        var layer_free = this.kag.layer.getFreeLayer();
        
        /*
        layer_free.unbind("click");
        layer_free.bind("click",function(){
           
            that.kag.ftag.nextOrder();
            layer_free.unbind("click");
        
        });
        */
        
        layer_free.css("z-index",9999999);
        layer_free.append(html_obj);
        
        layer_free.show();
        
        this.kag.stat.is_html = false;
        this.kag.stat.map_html = {};
        this.kag.ftag.nextOrder();
        
        
    }
};


/*
#[emb]
:group
Macros, Variables, JavaScript Interface
:title
Embed expression
:exp
The the result of an evaluated expression can be embedded.
When you want to display a variable in a scenario use this.
:sample
[eval exp="f.value1='variable level'"]
The variable f.value1 is now stored.
[emb exp="f.value1"]
The variable is shown above here.
:param
exp=An TJS (JS) expression that can be displayed with the [emb] tag
#[end]
*/

tyrano.plugin.kag.tag.emb = {
    
    vital:["exp"],
    
    pm:{
        exp:""
    },
    
    start:function(pm){
        
        var val = ""+this.kag.embScript(pm.exp);
        //evaluationされた値を代入
        this.kag.ftag.startTag("text",{"val":val});
        
    }
    
};


/*
#[if]
:group
Macros, Variables, JavaScript Interface
:title
if
:exp
if the evaluation of the expression is true (or a non-zero number), the statements and tags up until elsif, else and endif tag are executed, otherwise those statements and tags are ignored and the statements and tags inside of elsif or else would be executed instead.
:sample
; example 1 [if exp="false"]
This will not be displayed
[else]
This will be displayed
[endif]

; example 2 [if exp="false"]
This will not be displayed
[elsif exp="false"]
This will not be displayed
[else]
This will be displayed
[endif]

; example 3 [if exp="false"]
This will not be displayed
[elsif exp="true"]
This will be displayed
[else]
This will not be displayed
[endif]

; example 4 [if exp="true"]
This will be displayed
[elsif exp="true"]
This will not be displayed
[else]
This will not be displayed
[endif]
:param
exp=a TJS expression to be evaluated. if the expression is false (or 0)- the statements and tags will be ignored until an elsif else  or endif tag.
#[end]
*/


//条件分岐
tyrano.plugin.kag.tag["if"] = {
    
    vital:["exp"],
    
    pm:{"exp":""},
    
    start:function(pm){
        //条件合格
        if(this.kag.embScript(pm.exp)){
            //実行済み、次にels elsif が出てきても、無視する
            this.kag.pushStack("if",true);
            //普通に次の処理を実行
            this.kag.ftag.nextOrder();
        //条件ミス
        }else{
            //まだ、if文をぬけられない
            this.kag.pushStack("if",false);
            for(var i=0;i<2000;i++){
                var r = this.kag.ftag.nextOrderWithTag({"else":"","elsif":"","endif":""});
                if(r == true){
                    //alert("処理が見つかった!")
                    break;
                    //指定の命令へ処理が写っていることでしょう
                }
            }
            if(i>1900){
                this.kag.error("If文に誤りがあります");
            }
        }
    }
};

/*
#[elsif]
:group
Macros, Variables, JavaScript Interface
:title
else if
:exp
between the [if] and [endif] tags, this can be used. If statements in a previous [if] or [elsif] tag have not been executed yet, the statemetns in this tag will be evaluated if the expression in the exp parameter evaluates to true until the point where an elsif, else, or endif  tag is reached.
For usage examples, see the entry for the [if] tag.
:sample
:param
exp=Sets the js expression to be evaluated.
#[end]
*/

tyrano.plugin.kag.tag["elsif"] = {
   
   vital:["exp"],
   
    pm:{"exp":""},
    
    start:function(pm){
        
        //条件合格
        if(this.kag.getStack("if") == false && this.kag.embScript(pm.exp)){
            
            this.kag.setStack("if",true);
            this.kag.ftag.nextOrder();
            
        //条件ミス
        }else{
            
            for(var i=0;i<2000;i++){
            
                var r = this.kag.ftag.nextOrderWithTag({"else":"","elsif":"","endif":""});
                
                if(r == true){
                    //alert("処理が見つかった!")
                    break;
                    
                }
                
            }
            
            if(i>1900){
                this.kag.error("If文に誤りがあります");
            }
            
        }
    }
    
};


/*
#[else]
:group
Macros, Variables, JavaScript Interface
:title
else
:exp
if an [if] tag or [elsif] tag have not been executed, statements between [else] and [endif] are executed.
For usage examples, see the entry for the [if] tag.
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag["else"] = {
    
    pm:{"exp":""},
    
    start:function(pm){
        
        //条件合格
        if(this.kag.getStack("if") == false){
            
            this.kag.setStack("if",true);
            this.kag.ftag.nextOrder();
            
        //条件ミス
        }else{
            
            for(var i=0;i<2000;i++){
            
                var r = this.kag.ftag.nextOrderWithTag({"endif":""});
                
                if(r == true){
                    //alert("処理が見つかった!")
                    break;
                    //指定の命令へ処理が写っていることでしょう
                }
                
            }
            
            if(i>1900){
                this.kag.error("If文に誤りがあります");
            }
            
        }
    }
    
};


/*
#[endif]
:group
Macros, Variables, JavaScript Interface
:title
end if
:exp
end an if statment. when you use an [if] tag, you must have an [endif]
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag["endif"] = {
    
    start:function(){
        
        //普通に次の処理を実行すればいいんじゃないか
        this.kag.popStack("if"); //スタック取り出し
        this.kag.ftag.nextOrder();
        
    }
    
};

/*
#[call]
:group
Macros, Variables, JavaScript Interface
:title
call a subroutine
:exp
call a subrouting by label and scenario file.
if a subroutine contains a [return] tag, execution will pick up after where the subroutine was called
:sample
:param
storage= set the scenario file containing the subroutine you wish to call. If param is missing the current scenario file is used.,
target=The label of the subroutine you wish to call. The first label found in the file is used.
#[end]
*/

tyrano.plugin.kag.tag["call"] = {
    
    pm:{
        storage:null,
        target:null,//ラベル名
        countpage:true
    },
    
    start:function(pm){
        
        var back_pm = {};
        back_pm.index = this.kag.ftag.current_order_index ;
        back_pm.storage = this.kag.stat.current_scenario ;
        
        //これは行き先を入れてもしょうがないよね。今の状態を
        this.kag.pushStack("call",back_pm);//スタックに配置する
        
        //コールはラベルに対して行われる
        
        if(pm.target == null && pm.storage!=null){
            this.kag.ftag.nextOrderWithIndex(-1,pm.storage)
        }else{
            this.kag.ftag.nextOrderWithLabel(pm.target,pm.storage);
        }
    }
    
};


/*
#[return]
:group
Macros, Variables, JavaScript Interface
:title
Return from subroutine
:exp
Return to where the subroutine was called from.
This is deprecated in KAG3.
(when you need this, use call instead)
:sample
:param
#[end]
*/

//呼び出し元に戻る
tyrano.plugin.kag.tag["return"] = {
    
    start:function(){
        
        var pm = this.kag.getStack("call"); //最新のコールスタックを取得
        //呼び出し元に戻る 
        
        this.kag.ftag.nextOrderWithIndex(pm.index,pm.storage);
        this.kag.popStack("call");//スタックを奪い取る
        
    
    }
    
};


/*
#[macro]
:group
Macros, Variables, JavaScript Interface
:title
Describe Macro
:exp
Start macro definition. 
The statements between this tag and the [endmacro]tag will register a new tag named after the name attribute. Then you can use this new tag.
When an inner tag's attribute value is prefixed with the % symbol, that parameter is passed through when defined by the macro.  If a | is used in conjuntion with the %, a default parameter can be defined.
Also, all parameters are passed through when the "*" is used.
:sample
[macro name="newtag"][font color=0xff0000]new tag[resetfont][endmacro]
[newtag]
[macro name="colortag"][font color=%iro]color tag[resetfont][endmacro]
[colortag iro=0x332211]
; ↑ iro is passed through colortag to the [font] tag within the macro by using a "%"
[macro name="transwait"][trans *][wt][endmacro]
; ↑ transwait all of the properties passed to the [transwait] tag are passed to the [trans] tag with a "*"
[macro name="colortag"][font color=%iro|0xff0000]the iro property is supplied if not set[resetfont][endmacro]
; ↑ in conjunction with the "%" syntax the "|" is used to supply default parameters
:param
name=The name of the new tag to register as a macro. Afterwards this name can be used as a normal tag.
#[end]
*/


//マクロの定義
tyrano.plugin.kag.tag.macro = {
    
    vital:["name"],
    
    pm:{
        name:""
    },
    
    start:function(pm){
        
        var index = this.kag.ftag.current_order_index;
        var storage = this.kag.stat.current_scenario;
        this.kag.stat.map_macro[pm.name] = {"storage":storage,"index":index};
        
        this.kag.tmp.checking_macro = true;
        
        //endmacroが出るまで、無視される
        for(var i=0;i<2000;i++){
            
                var r = this.kag.ftag.nextOrderWithTag({"endmacro":""});
                
                if(r == true){
                    //alert("endacroが見つかった");
                    break;
                    //指定の命令へ処理が写っていることでしょう
                    
                    
                }
                
            }
            
        if(i>1900){
            this.kag.error("マクロが閉じていません");
        }
            
        
        
        //this.kag.ftag.nextOrder();
                
                
    }
    
};


/*
#[endmacro]
:group
Macros, Variables, JavaScript Interface
:title
End Macro
:exp
This ends the macro
:sample
:param
#[end]
*/

//end macro
tyrano.plugin.kag.tag.endmacro = {
    
    start:function(pm){
        
        //解析チェック中にここに来た場合は、なにもしない
        if(this.kag.tmp.checking_macro == true){
            this.kag.tmp.checking_macro = false;
            this.kag.ftag.nextOrder();
            return ;
        }
        
        var map_obj = this.kag.getStack("macro"); //最新のコールスタックを取得
        
        //もし、スタックが溜まっている状態なら、
        if(map_obj){
           
            //呼び出し元に戻る
            this.kag.ftag.nextOrderWithIndex(map_obj.index,map_obj.storage);
            this.kag.popStack("macro");//スタックを奪い取る
            
            this.kag.stat.mp = this.kag.getStack("macro"); //参照用パラメータを設定
                
            
        }else{
            
            //呼び出し元がない場合、普通に次の処理を行えば良い
            //endmacroの場合はだめじゃないでしょうか。。。
            //this.kag.ftag.nextOrder();
            
        }
        
                
    }
};


/*
#[erasemacro]
:group
Macros, Variables, JavaScript Interface
:title
Erase Macro
:exp
Deletes registered macro
:sample
:param
name=The name of the macro to be deleted
#[end]
*/

//Erase macro
tyrano.plugin.kag.tag.erasemacro = {
    
    vital:["name"],
    
    pm:{
        name:""
    },
    
    start:function(pm){
        delete this.kag.stat.map_macro[pm.name];
    }
    
    
}

/*
#[savesnap]
:group
System Settings
:title
Create a save snapshot
:exp
Save the current game conditions. After that, tyrano.ks's expansion [setsave] is peformed. This records the save data.
:sample
:param
title=Sets the title of the save data
#[end]
*/

//セーブスナップの保存
tyrano.plugin.kag.tag.savesnap = {
    
    vital:["title"],
    
    pm:{
        title:""
    },
    
    start:function(pm){
          this.kag.menu.snapSave(pm.title);
    }
    
    
}



/*
#[ignore]
:group
Macros, Variables, JavaScript Interface
:title
start ignore
:exp
when the expression evaluates to true (or is a non-zero number) do not execute any tags or statements until after the [endignore] tag
:sample
:param
exp=this is the expression (in TJS) that is evaluated.
#[end]
*/

tyrano.plugin.kag.tag.ignore = {
    vital:["exp"],
    pm:{
        exp:""
    },
    start:function(pm){
        if(this.kag.embScript(pm.exp)){
            for(var i=0;i<2000;i++){
                var r = this.kag.ftag.nextOrderWithTag({"endignore":""});
                if(r == true){
                        break;
                }
            }
            if(i>1900){
                this.kag.error("ignoreが閉じていません");
            }
        }else{
            this.kag.ftag.nextOrder();
        }
    }    
};

/*
#[endignore]
:group
Macros, Variables, JavaScript Interface
:title
end ignore
:exp
end ignore
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.endignore ={
    
    start:function(){
        this.kag.ftag.nextOrder();
    }
    
};

/*
#[edit]
:group
Forms
:title
Text Box
:exp
Show a text box.
The value entered via the commit tag is stored as a variable that was set by this tag's name attribute.
Inside of form display the scenario is paused. (even if you click the story cannot continue)
So when you display a graphical button, you must provide a target label to jump to.
To make a small change to the display, you can edit tyrano.css.
:sample
[edit name="f.test"]
[locate x=200 y=300 ]
[button graphic="start.png" target=*commit]
[s]

*commit
[commit]
[cm]
;show the contents of entered Text
Value is set as[l]
「[emb exp=f.test]」This is what you entered.[l]

:param
name=the name of the variable to store on commit,
length=width,
color=The color of the text.  The default is black,
left=The horizontal position of the text box,
top=The vertical position of the text box,
size=sets the text size. The default is 20 pixels,
width=The width of the text box,
height=The height of the text box,
maxchars=The maximum number of characters that can be entered.
#[end]
*/

//Text Box、TyranoScript
tyrano.plugin.kag.tag.edit = {
    
    vital:["name"],
    
    
    pm:{
        name:"",
        length:"",//pixels　width
        color:"black",
        left:"0",
        top:"0",
        size:"20px",
        width:"200",
        height:"40",
        maxchars:"1000"
    },
    
    start:function(pm){
       
       var j_text = $("<input class='text_box form' name='"+pm.name+"' type='text' value='' />");
       
       pm = $.minifyObject(pm);
       
       
       var new_style = {
           color:$.convertColor(pm.color),
           left:parseInt(pm.left),
           top:parseInt(pm.top),
           width:pm.width,
           height:pm.height,
           "font-size":pm.size
       }
       
       j_text.css(new_style);
       j_text.css("position","absolute");
       
       j_text.attr("maxlength",pm.maxchars);
       
       this.kag.layer.getFreeLayer().append(j_text);
       this.kag.layer.getFreeLayer().show();
       
       this.kag.ftag.nextOrder();
       
    }
    
};


/*
#[preload]
:group
System Settings
:title
Preloads Image Files 
:exp
Using the preload tag, you can load files (images or music) before they are needed
The presentation will be smooth when they are needed.
:sample
;Use the full path below the project directory
[preload storage="data/fgimage/girl.jpg"]
;You can also specify an array
[iscript]
f.preload_images = ["data/fgimage/girl.jpg","data/fgimage/haruko.png","data/fgimage/miku1.png","data/fgimage/miku2.png"];
[endscript]

[preload storage=&f.preload_images]

:param
storage=enter the full path for previously entered images. They are set in the order that they are passed in.,
wait=this can be set to true or false. The default is false. When this is set to true all the game is paused until the images are loaded. You will need a loading screen.
#[end]
*/

//画像Fileの事前読み込み
tyrano.plugin.kag.tag.preload = {
    
    vital:["storage"],
    
    pm:{
        storage:"",
        wait:"false"
    },
    
    start:function(pm){
        
        var that = this;
        
        if(pm.wait == "true"){
            this.kag.layer.hideEventLayer();
        }
       
        var storage = pm.storage;
        
        //配列で指定された場合
        if(typeof storage == "object" && storage.length > 0){
            
            var sum = 0;
            
            for (var i=0;i<storage.length;i++){
                
                that.kag.preload(storage[i],function(){
                    sum++;
                    if(storage.length == sum){
                        //すべてのプリロードが完了
                        if(pm.wait == "true"){
                            that.kag.layer.showEventLayer();
                        }
                        
                        that.kag.ftag.nextOrder();
                        
                    }
                });
            }
            
            
        }else{
            this.kag.preload(pm.storage,function(){
                
                if(pm.wait == "true"){
                    that.kag.layer.showEventLayer();
                }
                that.kag.ftag.nextOrder();
            });
        }
    }
};

/*
#[clearfix]
:group
Layer
:title
Clears the Fix Layer
:exp
by setting the name property, only the corresponding element can be deleted
:sample

;add a fix Layer
[ptext name="sample" layer=fix page=fore text="TextText" size=30 x=200 y=100 color=red ]

;clear fix Layer
[fixclear name="sample"]

:param
name=the name used when the fix layer was declared
#[end]
*/


tyrano.plugin.kag.tag.clearfix ={
    
    pm:{
        name:""
    },
    
    start:function(pm){
       
       if(pm.name !=""){
           $(".fixlayer."+pm.name).remove();
       }else{
           $(".fixlayer").remove();
       }
       
       this.kag.ftag.nextOrder();
        
    }
    
};



/*
#[commit]
:group
Forms
:title
Submit Form
:exp
The value of the text box is saved as a variable from the [edit] tag's name property.
Keep in mind that while [commit] is executed, the text Box of the form are displayed.
:sample
:param
#[end]
*/


tyrano.plugin.kag.tag.commit ={
    
    start:function(){
        
        var that = this;
        
        this.kag.layer.getFreeLayer().find(".form").each(function(){
           
           var name = $(this).attr("name");
           var val = $(this).val();
           
           var str  = name + " = '" + val +"'";
           
           that.kag.evalScript(str);
           
           that.kag.ftag.nextOrder();
           
           //console.log($(this));
            
        });
        
    }
    
};






