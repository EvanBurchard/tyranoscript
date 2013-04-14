//tag総合管理　Game全体の進捗も管理する
tyrano.plugin.kag.ftag ={
    
    tyrano:null,
    kag:null,
    
    array_tag:[],//命令tagの配列
    master_tag:{}, //使用可能なtagの種類
    current_order_index:-1, //現在の命令実行インデックス
    
    init:function(){
        
        // tagの種類を確定させる
        for(var order_type in tyrano.plugin.kag.tag){
          
          this.master_tag[order_type] = object(tyrano.plugin.kag.tag[order_type]);
          this.master_tag[order_type].kag = this.kag;
          
        }
        
    },
    
    //命令を元に、命令配列を作り出します
    buildTag:function(array_tag,label_name){
        
        this.array_tag = array_tag;
        
        //Label名が指定されている場合は
        if(label_name){
            //そこへJump
            this.nextOrderWithLabel(label_name);
        }else{
            this.nextOrderWithLabel(""); //ここどうなんだろう
        }
        
    },
    
    buildTagIndex:function(array_tag,index,auto_next){
        
        this.array_tag = array_tag;
        
        this.nextOrderWithIndex(index,undefined,undefined,undefined,auto_next);
        
    },
    
    //transition完了 だけにとどまらず、再生を強制的に再開させる
    completeTrans:function(){
        //処理停止中なら
        
        if(this.kag.stat.is_stop == true){
            this.kag.layer.showEventLayer();
            this.nextOrder();
        }
    },
    
    //次へbuttonを隠します
    hideNextImg:function(){
        
        $(".img_next").remove();
        $("#glyph_image").hide();
    },
    
    //next commandを実行する //ロードした時の状態を再現するためには。。。layer以下をHTMLとして保存していいじゃん。。。もう。それを構築すればいいよ。で、
    nextOrder:function(){
            
            //基本非表示にする。
        	this.kag.layer.layer_event.hide();
            
            var that = this;
            
            //[s]tag。ストップするか否か
            if (this.kag.stat.is_strong_stop == true){
            
                return false;
                
            }
            
           try{
            
                this.current_order_index++;
                
                //Fileの終端に着ている場合は戻す
                if(this.array_tag.length <= this.current_order_index){
                    this.kag.endStorage();
                    return false;
                }
                
                var tag = $.cloneObject(this.array_tag[this.current_order_index]);
                
                this.kag.stat.current_line = tag.line;
                
                 
                this.kag.log("**:"+this.current_order_index + "　line:"+tag.line);
                this.kag.log(tag);
                
                
                
                //前に改ページ指定が入っている場合はtext部分をクリアする
                
                if(this.kag.stat.flag_ref_page == true){
                    
                    this.kag.stat.flag_ref_page = false;
                    //this.startTag("cm"); //画面クリア　かつ、　画面遷移なし
                    
                    this.kag.ftag.hideNextImg();
        
                    
                    this.kag.getMessageInnerLayer().html("");
            
                    
                }
                
                //tagを無視する
                if(this.checkCond(tag) != true){
                    this.nextOrder();
                    return;
                }
            
                
                //message非表示状態の場合は、表示して、text表示
                if(this.kag.stat.is_hide_message == true){
                
                    this.kag.layer.showMessageLayers();
                    this.kag.stat.is_hide_message = false;
                
                }
                
                
                if(this.master_tag[tag.name]){
                    
                    //この時点で、変数の中にエンティティがあれば、置き換える必要あり
                    tag.pm = this.convertEntity(tag.pm);
                    
                    //必須項目チェック
                    var err_str =this.checkVital(tag);
                    
                    //click待ち解除フラグがたってるなら
                    if(this.checkCw(tag)){
                    	this.kag.layer.layer_event.show();
                    }
                    
                    if(err_str!=""){
                        this.kag.error(err_str);
                    }else{
                        
                        this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm));
                    }
                    
                }else if(this.kag.stat.map_macro[tag.name]){
                    
                    tag.pm = this.convertEntity(tag.pm);
                    
                    //マクロの場合、その位置へJump
                    var pms = tag.pm;
                    var map_obj = this.kag.stat.map_macro[tag.name];
                    
                    //スタックに追加する
                    //呼び出し元の位置
                    
                    var back_pm = {};
                    back_pm.index   = this.kag.ftag.current_order_index;
                    back_pm.storage = this.kag.stat.current_scenario;
                    back_pm.pm      = pms;
                    
                    this.kag.stat.mp = pms; //参照用パラメータを設定
                    
                    this.kag.pushStack("macro",back_pm);
                    
                    this.kag.ftag.nextOrderWithIndex(map_obj.index,map_obj.storage);
                    
                }else{
                    //実装されていないtagの場合は、もう帰る
                    $.error_message("tag：["+tag.name+"]は存在しません");
                    
                    this.nextOrder();
                }
               
            
           }catch(e){
               console.log(e);
                that.kag.error("エラーが発生しました。スクリプトを確認して下さい");
           }
        
        //Labelといった、先行してオンメモリにしておく必要が有る命令に関しては、ここで精査しておく
        
    },
    
    checkCw:function(tag){
    	
    	var master_tag = this.master_tag[tag.name];
        
        if(master_tag.cw){
        	
        	
        	if(this.kag.stat.is_script != true && this.kag.stat.is_html != true && this.kag.stat.checking_macro !=true){
                return true;
                
            }else{
                return false;
            }
        	
        }else{
        	return false;
        }
         
    },
    
    //次のtagを実行。ただし、指定のtagの場合のみ
    nextOrderWithTag:function(target_tags){
        
         try{
             
            this.current_order_index++;
            var tag = this.array_tag[this.current_order_index];
            
            //tagを無視する else if などの時に、condを評価するとおかしなことになる。
            if(this.checkCond(tag) != true){
                //this.nextOrder();
                //return;
            }
            
            if(target_tags[tag.name]==""){
                
                if(this.master_tag[tag.name]){
                    //この時点で、変数の中にエンティティがあれば、置き換える必要あり
                    tag.pm = this.convertEntity(tag.pm);
                    this.master_tag[tag.name].start($.extend(true, $.cloneObject(this.master_tag[tag.name].pm), tag.pm));
                    return true;
                }else{
                    return false;
                }
                
            }else{
                return false;
            }
        
        }catch(e){
            console.log(this.array_tag);
            return false;
        }
        
        
        
    },
    
  
    //要素にエンティティが含まれている場合は評価値を代入する
    convertEntity:function(pm){
        
        var that = this;
        
        //もし、pmの中に、*が入ってたら、引き継いだ引数を全て、pmに統合させる。その上で実行
        
        
        if(pm["*"] ==""){
            //マクロ呼び出し元の変数から継承、引き継ぐ
            pm = $.extend(true, $.cloneObject(pm), this.kag.stat.mp);
            
        }
        
        //storage要素が存在する場合、拡張子がついていなかったら、指定した拡張子を負荷する
        //storage補完
        /*
        if(pm["storage"] && pm["storage"] != ""){
            pm["storage"] = $.setExt(pm["storage"],this.kag.config.defaultStorageExtension);
        }
        */
            
        for(key in pm){
            
            var val = pm[key];
            
            var c = "";
            
            if(val.length > 0){
                c = val.substr(0,1);
            }
            if(val.length > 0 && c ==="&"){
                
                pm[key] = this.kag.embScript(val.substr(1,val.length));
                
            }else if(val.length > 0 && c==="%"){
                
                var map_obj = this.kag.getStack("macro"); //最新のコールスタックを取得
                
                
                // | で分けられていた場合、その値を投入
                
                //もし、スタックが溜まっている状態なら、
                if(map_obj){
                    
                    pm[key] = map_obj.pm[val.substr(1,val.length)];
                    
                }
                
                
                //代替変数の代入処理
                var d = val.split("|");
                
                if(d.length == 2 ){
                    //%〇〇の値が渡ってきているか調査
                    if(map_obj.pm[$.trim(d[0]).substr(1,$.trim(d[0]).length)]){
                        pm[key] = map_obj.pm[$.trim(d[0]).substr(1,$.trim(d[0]).length)];
                    }else{
                        pm[key] = $.trim(d[1]);
                        
                    }
                
                }
            }
            
        }
        
        
        return pm;
        
    },
    
    //必須チェック
    checkVital:function(tag){
        
        
        var master_tag = this.master_tag[tag.name];
        
        var err_str ="";
        
        if(master_tag.vital){
            
        }else{
            return "";
        }
        
        var array_vital = master_tag.vital;
        
        for(var i=0;i<array_vital.length;i++){
            if(tag.pm[array_vital[i]]){
                
                //値が入っていなかった場合
                if(tag.pm[array_vital[i]] ==""){
                    err_str +="tag「"+ tag.name +"」にパラメーター「"+ array_vital[i] +"」は必須です　\n";
                }
                
            }else{
                err_str +="tag「"+ tag.name +"」にパラメーター「"+array_vital[i]+"」は必須です　\n";
            }
        }
        
        return err_str;
        
    },
    
    //cond条件のチェック
    //条件が真の時だけ実行する
    checkCond:function(tag){
        var pm = tag.pm;
        
        
        //cond属性が存在して、なおかつ、条件
        if(pm.cond){
            var cond = pm.cond;
            //式の評価
            return this.kag.embScript(cond);
        }else{
            return true;
        }
        
    },
    
    //tagを指定して直接実行
    startTag:function(name,pm){
        
        this.master_tag[name].start($.extend(true, $.cloneObject(this.master_tag[name].pm), pm));
                
    },
    
    //indexを指定して、その命令を実行
    //scenarioFileが異なる場合
    nextOrderWithLabel:function(label_name,scenario_file){
        
        this.kag.stat.is_strong_stop = false;
        
        //セーブスナップが指定された場合
        if(label_name =="*savesnap"){
            
            var tmpsnap = this.kag.menu.snap; 
            
            var co = tmpsnap.current_order_index; 
            var cs = tmpsnap.stat.current_scenario;
            
            this.nextOrderWithIndex(co,cs,undefined,undefined,"snap"); //snap は noかつ、スナップで上書きする
            
            return;
            
        }
        
        
        var that = this;
        
        var original_scenario = scenario_file;
        
        label_name    = label_name || "";
        scenario_file = scenario_file || this.kag.stat.current_scenario;
        
        label_name = label_name.replace("*","");
        
        //scenarioFileが変わる場合は、全く違う動きをする
        if(scenario_file != this.kag.stat.current_scenario && original_scenario !=null){
            
            this.kag.layer.hideEventLayer();
            
            this.kag.loadScenario(scenario_file,function(array_tag){
                
                that.kag.layer.showEventLayer();
                that.kag.ftag.buildTag(array_tag,label_name);
                
            });
            
            return ;
        }
        
        //Label名が指定されてない場合は最初から
        if(label_name ==""){
        
            this.current_order_index = -1;
            this.nextOrder();
       
            
        }else if(this.kag.stat.map_label[label_name]){
            
            var label_obj = this.kag.stat.map_label[label_name];
            this.current_order_index = label_obj.index;
            this.nextOrder();
       
        }else{
            
            
            $.error_message("Label名：「"+label_name+"」は存在しません");
            this.nextOrder();
       
            
        }
        
        
    },
    
      //next commandへ移動　index とstorage名を指定する
    nextOrderWithIndex:function(index,scenario_file,flag,insert,auto_next){
        
        this.kag.stat.is_strong_stop = false;
        this.kag.layer.showEventLayer();
                
        
        var that = this;
        
        flag = flag || false;
        auto_next = auto_next || "yes";
        
        
        scenario_file = scenario_file || this.kag.stat.current_scenario;
        
        //alert(scenario_file + ":" + this.kag.stat.current_scenario);
        
        //scenarioFileが変わる場合は、全く違う動きをする
        if(scenario_file != this.kag.stat.current_scenario || flag == true){
            
            this.kag.layer.hideEventLayer();
            
            this.kag.loadScenario(scenario_file,function(array_tag){
                
                if(typeof insert == "object"){
                    array_tag.splice(index+1,0,insert);
                }
                
                that.kag.layer.showEventLayer();
                that.kag.ftag.buildTagIndex(array_tag,index,auto_next);
                
                
            });
            
            return ;
        }
        
        //index更新
        this.current_order_index = index ;
        
        if(auto_next=="yes"){
            this.nextOrder();
        }else if(auto_next =="snap"){
            //ストロングの場合、すすめないように
            this.kag.stat.is_strong_stop = this.kag.menu.snap.stat.is_strong_stop;
            
            //Skipフラグが立っている場合は進めてくださいね。
            if(this.kag.stat.is_skip == true && this.kag.stat.is_strong_stop == false){
                this.kag.ftag.nextOrder();
            }
            
        }else if(auto_next =="stop"){
            
            //[s]tagで終わった人が登場してきた時
            this.kag.stat.is_strong_stop = true;
            
        }
        
    }
    
    
};

//tagを記述していく
tyrano.plugin.kag.tag.text={
    
    //vital:["val"], //必須のtag
    
    cw:true,
    
    //初期値
    pm:{
        
        "val":""
        
    },
    
    //実行
    start:function(pm){
        
        //スクリプト解析状態の場合は、その扱いをする
        if(this.kag.stat.is_script == true) {
            
            this.kag.stat.buff_script += pm.val +"\n";
            this.kag.ftag.nextOrder();
            return;
            
        }
        
        //HTML解析状態の場合
        if(this.kag.stat.is_html == true) {
            
            this.kag.stat.map_html.buff_html += pm.val;
            this.kag.ftag.nextOrder();
            return;
            
        }
        
        var j_inner_message = this.kag.getMessageInnerLayer(); 
        
        //文字ステータスの設定
        j_inner_message
        .css("letter-spacing",this.kag.config.defaultPitch+"px")
        .css("line-height",parseInt(this.kag.config.defaultFontSize)+parseInt(this.kag.config.defaultLineSpacing)+"px")
        .css("font-family",this.kag.config.userFace);
        
        
        //現在表示中のtextを格納
        this.kag.stat.current_message_str = pm.val;
        
        //縦書き指定の場合
        if(this.kag.stat.vertical == "true"){
            
            //自動改ページ無効の場合
            if(this.kag.config.defaultAutoReturn != "false"){
            
                //textエリアの横幅が、一定以上いっていたばあい、textをクリアします
                var j_outer_message = this.kag.getMessageOuterLayer();
                
                var limit_width = parseInt(j_outer_message.css("width"))*0.8;
                var current_width = parseInt(j_inner_message.find("p").css("width"));
                
                if(current_width > limit_width){
                    this.kag.getMessageInnerLayer().html("");
                }
                
            }
            
            this.showMessageVertical(pm.val);
            
            
            
        }else{
        
        
            if(this.kag.config.defaultAutoReturn != "false"){
                
                //textエリアの高さが、一定以上いっていたばあい、textをクリアします
                var j_outer_message = this.kag.getMessageOuterLayer();
                
                var limit_height = parseInt(j_outer_message.css("height"))*0.8;
                var current_height = parseInt(j_inner_message.find("p").css("height"));
                
                if(current_height > limit_height){
                    
                    //画面クリア
                    this.kag.getMessageInnerLayer().html("");
                    
                }
            
            }
            
            
            
            this.showMessage(pm.val);
            
            
        }
        
        //this.kag.ftag.nextOrder();
        
    },
    
    showMessage:function(message_str){
        var that = this;
        
        //text表示時に、まず、画面上の次へbuttonアイコンを抹消
       that.kag.ftag.hideNextImg();
        
        
        (function(jtext){
            
            
            if(jtext.html() ==""){
                
                //tag作成 
                jtext.append("<p class=''></p>")
            
            }
            
            var _message_str = message_str;
            
            var current_str ="";
            
            if(jtext.find("p").find(".current_span").length != 0){
            
                current_str = jtext.find("p").find(".current_span").html();
            
            }
            
            var index = 0;
            //jtext.html("");
            
            that.kag.checkMessage(jtext);
            
            //message領域を取得
            var j_span = that.kag.getMessageCurrentSpan();
            
            j_span
            .css("color",that.kag.stat.font.color)
            .css("font-weight",that.kag.stat.font.bold)
            .css("font-size",that.kag.stat.font.size+"px")
            .css("font-family",that.kag.stat.font.face);
            
            var pchar = function(pchar){
                
                
                var c = _message_str.substring(index, ++index);
                
                //ルビ指定がされている場合
                if(that.kag.stat.ruby_str !=""){
                    c = "<ruby><rb>"+c+"</rb><rt>"+that.kag.stat.ruby_str+"</rt></ruby>";
                    that.kag.stat.ruby_str = "";
                    
                }
                
                current_str += c;
                
                that.kag.appendMessage(jtext,current_str);
                
                if (index <= _message_str.length){
                    
                    that.kag.stat.is_adding_text = true;
                    
                    //再生途中にclickされて、残りを一瞬で表示する
                    if(that.kag.stat.is_click_text == true || that.kag.stat.is_skip == true || that.kag.stat.is_nowait == true){
                        setTimeout(function(){pchar(pchar)},0);
                    }else{
                        setTimeout(function(){pchar(pchar)},that.kag.stat.ch_speed);
                    }
                    
                }else{
                    
                    that.kag.stat.is_adding_text = false;
                    that.kag.stat.is_click_text = false;
                    
                    //すべて表示完了 ここまではイベント残ってたな
                    
                    if(that.kag.stat.is_stop!="true"){
                        
                        that.kag.ftag.nextOrder();
                        
                    }else{
                        
                    }
                    
                    //message用
                    
                    //グリフが指定されている場合はこちらを適用 
                   if(that.kag.stat.flag_glyph == "false"){
                       $(".img_next").remove();
                        jtext.find("p").append("<img class='img_next' src='./tyrano/images/kag/nextpage.gif' />");
                    
                    }else{
                       $("#glyph_image").show();
                        
                    }
                    
                    //that.kag.appendMessage(jtext,current_str+"<img class='img_next' src='./tyrano/images/kag/nextpage.gif' />");
                    
                }
        
            };
            
            pchar(pchar);
            
        })(this.kag.getMessageInnerLayer());
        
            
    },
    
    //縦書き出力
    showMessageVertical:function(message_str){
        var that = this;
        
        //text表示時に、まず、画面上の次へbuttonアイコンを抹消
         that.kag.ftag.hideNextImg();
                       
        (function(jtext){
            
            if(jtext.html() ==""){
                //tag作成 
                jtext.append("<p class='vertical_text'></p>");
            
            }
            
            var _message_str = message_str;
            
            var current_str = "";
            
            if(jtext.find("p").find(".current_span").length != 0){
                current_str = jtext.find("p").find(".current_span").html();
            }
            
            var index = 0;
            //jtext.html("");
            
            that.kag.checkMessage(jtext);
            
            
            //message領域を取得
            var j_span = that.kag.getMessageCurrentSpan();
            
            j_span
            .css("color",that.kag.stat.font.color)
            .css("font-weight",that.kag.stat.font.bold)
            .css("font-size",that.kag.stat.font.size+"px")
            .css("font-family",that.kag.stat.font.face);
            
            
            var pchar = function(pchar){
                
                var c = _message_str.substring(index, ++index);
                
                //ルビ指定がされている場合
                if(that.kag.stat.ruby_str !=""){
                    c = "<ruby><rb>"+c+"</rb><rt>"+that.kag.stat.ruby_str+"</rt></ruby>";
                    that.kag.stat.ruby_str = "";
                    
                }
                
                current_str += c;
                
                that.kag.appendMessage(jtext,current_str);
                
                if (index <= _message_str.length){
                    
                    that.kag.stat.is_adding_text = true;
                    
                    //再生途中にclickされて、残りを一瞬で表示する
                    if(that.kag.stat.is_click_text == true || that.kag.stat.is_skip == true){
                        setTimeout(function(){pchar(pchar)},0);
                    }else{
                        setTimeout(function(){pchar(pchar)},that.kag.stat.ch_speed);
                    }
                    
                }else{
                    
                    that.kag.stat.is_adding_text = false;
                    that.kag.stat.is_click_text = false;
                    
                    //すべて表示完了
                    that.kag.ftag.nextOrder();
                    
                    //text表示時に、まず、画面上の次へbuttonアイコンを抹消
                    //グリフが指定されている場合はこちらを適用 
                    if(that.kag.stat.flag_glyph =="false"){
                    　$(".img_next").remove();
                        jtext.find("p").append("<img class='img_next' src='./tyrano/images/kag/nextpage.gif' />");
                    
                    }else{
                        
                        $("#glyph_image").show();
                        
                    }
                    //that.kag.appendMessage(jtext,current_str+"<img class='img_next' src='./tyrano/images/kag/nextpage.gif' />");
                    
                }
        
            };
            
            pchar(pchar);
            
        })(this.kag.getMessageInnerLayer());
        
            
    },
    
    nextOrder:function(){
        
    },
    
    test:function(){
        
    }
    
};

tyrano.plugin.kag.tag.label = {
  
  pm:{},
  
  start:function(pm){
    //Label通過したよ。
    
    //Label記録
    if(this.kag.config.autoRecordPageShowing == "true"){
    
        var sf_str = "sf.trail_"+this.kag.stat.current_scenario.replace(".ks","").replace("/","")+"_"+pm.label_name +"";
        
        var scr_str = ""
        
        + sf_str +" = "+sf_str+"  || 0;"
        + sf_str +"++;";
        
        this.kag.evalScript(scr_str);
        
    }
    
    this.kag.ftag.nextOrder();
    
  }
    
};




/*
#[l]

:group
Message
:title
Wait for Click

:exp
This tag allows waiting for a click.

:sample
show some text...[l]
show some more text...[l][r]
:param
#[end]

*/


//[l] click待ち
tyrano.plugin.kag.tag.l ={
    
    cw:true,
    
    start:function(){
        //clickするまで、次へすすまないようにする
        if(this.kag.stat.is_skip == true){
            //Skip中の場合は、nextorder
            this.kag.ftag.nextOrder();
        }
        
    }
};

/*
#[p]

:group
Message
:title
clear text after click

:exp
This tag waits for a click (like [l]), but clears the text afterwards.

:sample
Show text[p]
Show text[p][r]
:param
#[end]

*/


//[p] 改ページclick待ち
tyrano.plugin.kag.tag.p ={
    
    cw:true,
    
    start:function(){
        //改ページ
        this.kag.stat.flag_ref_page = true;
        
        if(this.kag.stat.is_skip == true){
            //Skip中の場合は、nextorder
            this.kag.ftag.nextOrder();
        }
    }
    
};



/*
#[graph]
:group
Message
:title
Show pictures inline
:exp
Show arbitrary images inside of a message.
You can use pictographs or special characters, etc. 
Put images you want to show in the image folder.

Also, for frequently used symbols, it's easy to set up a macro.

:sample
; put a heart picture in
[macro name="heart"][graph storage="heart.png"][endmacro]

; below, with the [heart] tag, a heart symbol can be used
I love you![heart]
:param
storage=The filename where the picture is stored
#[end]

*/



tyrano.plugin.kag.tag.graph = {
  
  vital:["storage"],
  
  pm:{
      storage:null
  },
  
  //開始
  start:function(pm){
      
      var jtext = this.kag.getMessageInnerLayer();
      
      var current_str ="";
      
      if(jtext.find("p").find(".current_span").length != 0){
        current_str = jtext.find("p").find(".current_span").html();
      }
      
      //textエリアに画像を追加して、次のmessageへ晋
      this.kag.appendMessage(jtext, current_str + "<img src='./data/image/"+pm.storage+"' >")
      
      this.kag.ftag.nextOrder();
      
  }
  
    
};



/*

#[jump]
:group
Links
:title
Jump to scenario
:exp
Goes to the specified label in the specified file.
It is a mistake to use call if there is no jump on the call stack.
In other words, it can only be used one way. Setting a label is required.
:sample

; Go to the scenario file second.ks in the place with the label: *start
[jump storage=second.ks target=*start]

:param
storage=scenario file to move to. If this is left out the current scenario file will be used,
target=label name to jump to. If this is left out it will go to the beginning.
#[end]

*/



//Jump Command
tyrano.plugin.kag.tag.jump ={
  
    
    pm:{
        storage:null,
        target:null,//Label名
        countpage:true
    },
    
    start:function(pm){
        
        //コールでいいじゃん。。
        this.kag.ftag.nextOrderWithLabel(pm.target,pm.storage);
        
    }
    
};


/*
#[r]
:group
Message
:title
New Line
:exp
Puts a new line
:sample
Show text[l]
Put text on a new line[l][r]
Put text on a new line[l][r]
:param
#[end]
*/

//改行を挿入
tyrano.plugin.kag.tag.r ={
    
    start:function(){
        //clickするまで、次へすすまないようにする
        var j_inner_message = this.kag.getMessageInnerLayer();
        
        var txt = j_inner_message.find("p").find(".current_span").html() +"<br />";
        j_inner_message.find("p").find(".current_span").html(txt);
        
        this.kag.ftag.nextOrder();
    }
};

/*
#[er]
:group
Message
:title
Erase
:exp
Erase the characters of the current layer
:sample
Show some text[l]
Clear the message[l][er]
Put a new line[l][r]
:param
#[end]
*/

tyrano.plugin.kag.tag.er ={
    
    start:function(){
        
        this.kag.ftag.hideNextImg();
        //フォントのリセット
        //カレントlayerのみ削除
        this.kag.getMessageInnerLayer().html("");
        
        this.kag.ftag.startTag("resetfont");
        
        //this.kag.ftag.nextOrder();
        
    }

};

/*
#[cm]
:group
Message
:title
Clear All Messages
:exp
Clear all messages.
Also, font styles will return to defaults.
Position and/or layopt settings will take effect.
Similar to the [ct] tag, nothing is set in the target message layer. 
Even after executing this tag, the included target layer is the same.

:sample
Show some text[l]
Clear screen[l][cm]
Clear screen again[l][cm]
:param
#[end]
*/


//画面クリア
tyrano.plugin.kag.tag.cm ={
    
    start:function(){
        
        this.kag.ftag.hideNextImg();
        //フォントのリセット
        //カレントlayerだけじゃなくて、全てもmessage layerを消去する必要がある
        this.kag.layer.clearMessageInnerLayerAll();
       //フリーlayer消去 
       this.kag.layer.getFreeLayer().html("").hide();
        
        this.kag.ftag.startTag("resetfont");
        
        
    }
};


/*
#[ct]
:group
Message
:title
Reset the message layers
:exp

Resets the message layers
Clears all of the characters from the message layers. Current message layer is set to message0.
Also, font styles will return to defaults.
Position and/or layopt settings will take effect.

:sample
Show text[l]
Clear screen[l][ct]
Clear screen again[l][ct]
:param
#[end]
*/


tyrano.plugin.kag.tag.ct ={
    
    start:function(){
        
        this.kag.ftag.hideNextImg();
        
        //フォントのリセット
        //カレントlayerだけじゃなくて、全てもmessage layerを消去する必要がある
        this.kag.layer.clearMessageInnerLayerAll();
        
        //フリーlayer消去
        this.kag.layer.getFreeLayer().html("").hide();
        
        
        this.kag.stat.current_layer = "message0";
        this.kag.stat.current_page = "fore";
        
        this.kag.ftag.startTag("resetfont");
        
    }
};



/*
#[current]
:group
Message
:title
set current message layer
:exp
Set the current message layer. After setting this, statements, setting attributes via font tags, using the l tag for click events, etc. will take place in this layer.
For message0 the default is visible, but for message1, if you don't set the [layopt] tag's visible attribute to true it will not be shown.
:sample
[current layer="message0"]
Show message0 layer[l]
[current layer="message1"]
Show message1 layer[l]
:param
layer=sets the message layer to be affected. It will affect the current message layer.,
page=it will be set to the foreground or background.  If omitted it will set to the foreground.
#[end]
*/


//message layerの指定
tyrano.plugin.kag.tag.current = {
    
    pm:{
        layer:"",
        page:"fore"
    },
    
    start:function(pm){
        
        //layer指定がない場合は、現在のlayerを採用
        if(pm.layer ==""){
            pm.layer = this.kag.stat.current_layer;
        }
        
        this.kag.stat.current_layer = pm.layer;
        this.kag.stat.current_page  = pm.page;
        
        this.kag.ftag.nextOrder();
        
    }
    
};


//message layerの属性を変更します

/*
#[position]
:group
Layer
:title
set placement of message layer
:exp
set various options for the message layer.<br />
Any params that are omitted will not change their attributes.
:sample
;message layer position and size
[layopt width=400 height=300 top=100 left=20]
;message layer color and opacity
[layopt color=blue opacity=100]
:param
layer=set target message layer.<br/> If this is omitted the current layer will be used.,
page=set target page. set"fore" or "back". <br>If this is omitted the current page will be used,
left=message layer's position from the left in pixels,
top=message layer's position from the top in pixels,
width=message layer's width in pixels,
height=message layer's height in pixels,
frame=set image for the message layer's frame image. <br>use this to customize the message area.<br />adjust image size is according to the width and height attributes. <br />futhermore you should use this to regulate the places where the message will be displayed by margin attributes.  if you set this to "none" it will return to the standard margin. You can also change it to designate a different frame image.,
color=sets the color of the message layer with a 0xRRGGBB format,
opacity=this sets the opacity for the message layer. This does not affect the opacity of the text itself or the layer.0 is completely transparent.,
marginl=message layer's left margin,
margint=message layer's top margin,
marginr=message layer's left margin,
marginb=message layer's bottom margin,
vertical=set message layer's vertical mode with "true". Use "false" for horizontal mode.,
visible=if set to "true" message layer is visible<br >"false" hides the message layer.
#[end]
*/
tyrano.plugin.kag.tag.position = {
    
    pm:{
        
        layer:"message0",
        page:"fore",
        left:"",
        top:"",
        width:"",
        height:"",
        color:"",
        opacity:"",
        vertical:"",
        frame:"",
        marginl:"0", //左余白
        margint:"0", //上余白
        marginr:"0", //右余白
        marginb:"0" //下余白
        
        
    },
    
    start:function(pm){
    
        
        //指定のlayerを取得
        var target_layer = this.kag.layer.getLayer(pm.layer,pm.page).find(".message_outer");
        
        var new_style = {
            left:pm.left+"px",
            top:pm.top+"px",
            width:pm.width+"px",
            height:pm.height+"px",
            "background-color":$.convertColor(pm.color)
            
        };
        
        //縦書き指定
        if(pm.vertical =="true"){
            this.kag.stat.vertical = "true";
        }else{
            this.kag.stat.vertical = "false";
        }
        
        //背景フレーム画像の設定 透明度も自分で設定する
        
        if(pm.frame=="none"){
            
            target_layer.css("opacity",$.convertOpacity(this.kag.config.frameOpacity));
            target_layer.css("background-image","");
            target_layer.css("background-color",$.convertColor(this.kag.config.frameColor));
            
        }else if(pm.frame !=""){
            
            target_layer.css("background-image","url(./data/image/"+pm.frame+")");
            target_layer.css("background-repeat","no-repeat");
            target_layer.css("opacity",1);
            target_layer.css("background-color","");
            
        }
        
        if(pm.opacity !=""){
            target_layer.css("opacity",$.convertOpacity(pm.opacity));
        }
        
        //outer のlayerを変更
        this.kag.setStyles(target_layer,new_style);
        
        this.kag.layer.refMessageLayer();
        
        
        //message_inner のスタイルを変更する必要もある
        
        var layer_inner = this.kag.layer.getLayer(pm.layer,pm.page).find(".message_inner");
       
       var new_style_inner ={}; 
        
        /*
        var new_style_inner = {
            
            "padding-left":parseInt(pm.marginl)+"px", //左余白
            "padding-top":parseInt(pm.margint)+"px", //上余白
            "width":parseInt(layer_inner.css("width")) - parseInt(pm.marginr)+"px", //右余白
            "height":parseInt(layer_inner.css("height")) - parseInt(pm.marginb)+"px" //下余白
            
        };
        */
       
        if(pm.marginl !="0") new_style_inner["padding-left"] = parseInt(pm.marginl)+"px";
        if(pm.margint !="0") new_style_inner["padding-top"] = parseInt(pm.margint)+"px";
        if(pm.marginr !="0") new_style_inner["width"] = (parseInt(layer_inner.css("width")) - parseInt(pm.marginr))+"px";
        if(pm.marginb !="0") new_style_inner["height"] = (parseInt(layer_inner.css("height")) - parseInt(pm.marginb))+"px";
        
        this.kag.setStyles(layer_inner,new_style_inner);
        
        //this.kag.layer.updateLayer(pm.layer,pm.page,this.kag.layer.getLayer(pm.layer,pm.page));
        
        //layerーをリフレッシュする
        
        this.kag.ftag.nextOrder();
    
    }
    
};


/*
#[image]
:group
Layer
:title
show image
:exp
show an image for the layer. you can use this to change the image of the background or character. visible must be set to true in order to show the foreground layer
:sample
;change the scene via a transition
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
@layopt layer=message0 visible=true
:param
storage=sets the image file name. If it is a background image it should be in the bgimage folder.  Foreground images should be in the fgimage folder,
layer=sets the target layer. if you set it as "base" it will be the background layer. if you set it as an integer above zero it will put that layer in front of lower numbers,
page=sets the target page. Set as "fore" or "back". <br> if omitted "fore" will be set,
left=sets pixels from the left,
top=sets pixels from the top,
x=sets pixels from the left. the same as left but overrides it,
y=sets pixels from the top. the same as top but overrides it,
width=sets the width of the picture in pixels,
height=sets the height of the picture in pixels,
folder=you can chose an image from this folder. By default fgimage is set for the foreground image and bgimage is set for the background image. Any image under the folder name that you write here will be available for use,
name=TyranoScript only (not KAG3). This name is used later to reference this image by tags like [anim] tag. Basically by setting this name you can set this as a JS class. If you divide them with commas you can designate multiple names.,
pos=set the layer position automatically. This is used for the foreground layer. This attribute can be set as left left_center center right_center right. You can change how far it is from the center in the Config.tjs file. You can also abbreviations l lc c rc and r.
　<br>Setting these will override the top and left attributes.
　<br>Don't set this attribute for the layer that you intend to use as base. Set these positions beforehand in Config.tjs
#[end]
*/

//tagを記述していく
//[image layer=base page=fore storage=haikei.jpg visible=true]
tyrano.plugin.kag.tag.image={
    
    pm:{
        
        "layer":"base",
        "page":"fore",
        "visible":"",
        "top":0,
        "left":0,
        "x":0,
        "y":0,
        "width":"",
        "height":"",
        "pos":"",
        "name":"",
        "folder":"" //画像Folderを明示できる
        //"visible":"true"
        
    },
    
    start:function(pm){
    	
    	var strage_url ="";
    	
    	var folder ="";
    	
    	if(pm.layer !="base"){
    	    
    	    //visible true が指定されている場合は表示状態に持っていけ
            //これはlayerのスタイル
            var layer_new_style = {};
            
    	    //default非表示 バックの場合も非表示ですよ。
    	    if(pm.visible == "true" && pm.page =="fore"){
    	        layer_new_style.display ="block";
    	    }
    	    
    	    this.kag.setStyles(this.kag.layer.getLayer(pm.layer,pm.page),layer_new_style);
    	    
    	    //ポジションの指定
    	    if(pm.pos!=""){
    	        
               switch(pm.pos){
               
                case "left":
                case "l":
                    pm.left = this.kag.config["scPositionX.left"];
                break;
                
                case "left_center":
                case "lc":
                    pm.left = this.kag.config["scPositionX.left_center"];
                break;
                
                case "center":
                case "c":
                    pm.left = this.kag.config["scPositionX.center"];
                break;
                
                case "right_center":
                case "rc":
                    pm.left = this.kag.config["scPositionX.right_center"];
                break;
                
                case "right":
                case "r":
                    pm.left = this.kag.config["scPositionX.right"];
                break;
               
               }
               
               
            }
            
            
            if(pm.folder !=""){
                folder = pm.folder;
            }else{
                folder = "fgimage";
            }
            
    	    //前景layer
    		strage_url = "./data/"+folder+"/"+pm.storage;
    	    
    	    var img_obj = $("<img />");
    	    img_obj.attr("src",strage_url);
    	    
    	    img_obj.css("position","absolute");
    	    img_obj.css("top",pm.top+"px");
    	    img_obj.css("left",pm.left+"px");
            
            if(pm.width !=""){
                img_obj.css("width",pm.width+"px");
            }
            
            if(pm.height !=""){
                img_obj.css("height",pm.height+"px");
            }
            
            if(pm.x !=""){
                img_obj.css("left",pm.x+"px");
            }
            
            if(pm.y !=""){
               img_obj.css("top",pm.y+"px");
            }
            
            
            
            //オブジェクトにクラス名をセットします
            $.setName(img_obj,pm.name);
            
    	    this.kag.layer.getLayer(pm.layer,pm.page).append(img_obj);
    	    this.kag.ftag.nextOrder();
            
            
    	}else{
    	    
    	    if(pm.folder !=""){
                folder = pm.folder;
            }else{
                folder = "bgimage";
            }
    	    
    	    //背景layer
    	    strage_url = "./data/"+folder+"/"+pm.storage;
    	    
    	    //backの場合はスタイルなしですよ
    	    
    	    var new_style ={
    	        "background-image":"url("+strage_url+")",
    	        "display":"none"
    	    };
    	    
    	    if(pm.page ==="fore"){
    	        new_style.display="block"
    	    }
    	    
    	    
    	    this.kag.setStyles(this.kag.layer.getLayer(pm.layer, pm.page), new_style);
            this.kag.ftag.nextOrder();
        
    	}
    	
    }
    
};


/*
#[freeimage]
:group
Layer
:title
Free image
:exp
Frees the images of a particular layer that were added with [image] tag. The layer attribute is required.
:sample
[backlay]
;Show character
[image layer=0 page=back visible=true top=100 left=300  storage = chara.png]
[trans time=2000]
@wt

@backlay
;Hide character
[freeimage layer=0 page=back]
@trans time=2000
[wt]
:param
layer=set message layer. If it is not set the current message layer is used,
page=set page. If it is not set the surface page is used
#[end]
*/

//イメージ情報消去背景とか
tyrano.plugin.kag.tag.freeimage = {
    
    vital:["layer"],
    
    pm:{
        layer:"",
        page:"fore"
    },
    
    start:function(pm){
        
        if(pm.layer !="base"){
            
            //前景layerの場合、全部削除だよ
            this.kag.layer.getLayer(pm.layer,pm.page).empty();
            
            
        }else{
            
            this.kag.layer.getLayer(pm.layer,pm.page).css("background-image","");
            
        }
        
        //次へ移動ですがな
        this.kag.ftag.nextOrder();
        
    }
    
};





/*
#[ptext]
:group
Layer
:title
add text to the layer
:exp
This displays text in the layer. Only performed in the foreground layer.<br />
This will inherit all of the attributes of the foreground layer. when text is deleted, it applies to the [freeimage] tag in the layer.
Keep in mind that if the foreground layer is not set to visible=true this text will also not display.
[layopt layer=0 visible=true] is required
:sample
[backlay]
[ptext page=back text="texttext" size=30 x=200 y=300 color=red vertical=true]
[trans time=2000]
[wt]
[l]
Clear the displayed text
[freeimage layer = 0]
:param
layer=this sets the target layer. you can reference it by number.,
page=sets the target page. can be set as set as "fore" or "back". <br>defaults to "fore",
text=text contents to show,
x=horizonal position from left border in pixels,
y=vertical position from top border in pixels,
vertical=set to true or false (this is the default). If set to true the text reads vertically.  If false the text is horizontal.,
size=set the font size in pixels,
face=set the font type. This is not KAG compatibe but you can use web fonts,
color=set the font color,
name=TyranoScript only (not KAG3).  This name is used later to reference this by tags like [anim] tag. Basically by setting this name you can set this as a JS class. If you divide them with commas you can designate multiple names.,
bold=this sets the text as bold. You can use font-style for the HTML5 compatible method.
#[end]
*/

//tagを記述していく
tyrano.plugin.kag.tag.ptext={
    
    vital:["layer","x","y"],
    
    pm:{
        
        "layer":"0",
        "page":"fore",
        "x":0,
        "y":0,
        "vertical":"false",
        "text":"　　　　　　　　　　　　　　", //text領域のdefault値を指定するためですが、、、
        "size":"",
        "face":"",
        "color":"",
        "italic":"",
        "bold":"",
        "name":"",
        "zindex":"9999",
        "overwrite":"false" //要素を上書きするかどうか
        
        //"visible":"true"
          
    },
    
    start:function(pm){
         
         var that = this;
         
            //visible true が指定されている場合は表示状態に持っていけ
            //これはlayerのスタイル
            var font_new_style = {
            
                "color":pm.color,
                "font-weight":pm.bold,
                "font-style":pm.fontstyle,
                "font-size":pm.size+"px",
                "font-family":that.kag.stat.font.face,
                "z-index":"999",
                "text":""
                
            };
            
            var target_layer = this.kag.layer.getLayer(pm.layer,pm.page);
            
            //上書き指定
            if(pm.overwrite == "true" && pm.name !=""){
                if($("."+pm.name).size() > 0){
                    $("."+pm.name).html(pm.text);
                    this.kag.ftag.nextOrder();
                    return false;
                }
            }
            
            var tobj = $("<p></p>");
            
            tobj.css("position","absolute");
            tobj.css("top",pm.y+"px");
            tobj.css("left",pm.x+"px");
            tobj.css("width","100%");
            
            if(pm.vertical=="true"){
                tobj.addClass("vertical_text");
            }
            
            //オブジェクトにクラス名をセットします
            $.setName(tobj,pm.name);
            
            
            tobj.html(pm.text);
            
            this.kag.setStyles(tobj,font_new_style);
            
            //前景layer
            target_layer.append(tobj);
            
            this.kag.ftag.nextOrder();
         
    }
    
};



/*
#[backlay]
:group
Layer
:title
copy information from the surface page
:exp
The layer that you designate or all of the layer information is copied from the front page to the back page.
The image of the front page layer marked with the [trans] tag moves to the back page's image layer.
In order to do that, before the transition, the image is moved to the back with the [backlay] tag.  On the back page, after the layer is manipulated, the transition is performed.
:sample
;The background change is executed via a transition
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
:param
layer=set the layer target<br>
　if set as "base" then it becomes the background layer<br>
　if set as an integer above zero then it becomes the foreground<br>
　if you set as message0 or message1 then it will become that message layer.<br>
if you set is as message it will become the message layer of whatever the [current] tag is set to
Even if the message layer is the back page it will copy that message layer from the front to the back.<br>
if this is omitted the information of every layer is copied to the back page<br>
#[end]
*/

//前景layerを背景layerにコピー
tyrano.plugin.kag.tag.backlay={
    
    pm:{
        layer:""
    },
    
	start:function(pm){
	    this.kag.layer.backlay(pm.layer);
		this.kag.ftag.nextOrder();
	}
};


/*
#[wt]
:group
Layer
:title
wait on transition
:exp
wait until transition is finished
:sample
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
;don't advance until transition is finished
[wt]
:param
#[end]
*/

//wait on transition
tyrano.plugin.kag.tag.wt={
    start:function(pm){
        this.kag.layer.hideEventLayer();
    }
};


//音楽のフェードインを待つ
tyrano.plugin.kag.tag.wb={
    start:function(pm){
        this.kag.layer.hideEventLayer();
    }
};


//フェードインを待つ


//画面揺らし待ち
/*
tyrano.plugin.kag.tag.wq = {
    start:function(pm){
        //画面揺らしが終わらないと、次に進まないよね。
    }
};
*/



/*
#[link]
:group
Links
:title
hyperlink (choices)
:exp
the text inside the [link] and [endlink] tags can be selected with the mouse or keyboard. on a click or key event a jump event can be fired.
This tag cannot be used to visit a different page.
:sample
pick what you like[l][r][r]
[link target=*select1] 1- first choice[endlink][r]
[link target=*select2] 2- second choice[endlink][r]
[s]
*select1 
[cm]
you clicked the first choice
@jump target=*common
*select2 
[cm]
you clicked the second choice
@jump target=*common
*common 
[cm] 
Common Route
:param
storage=set the scenario file to jump to. if omitted the current scenario file,
target=set the label to jump to. If omitted the script will be executed from the beginning of the file
#[end]
*/

//リンクターゲット
tyrano.plugin.kag.tag.link={
    
    pm:{
        target:null,
        storage:null
    },
    
    start:function(pm){
        
        var that = this;
        
        //this.kag.stat.set_text_span = true;
        
        //即時にスパンを設定しないとダメねw
        var j_span = this.kag.setMessageCurrentSpan();
        
        j_span.css("cursor","pointer");
        
        (function(){
         
            var _target = pm.target;
            var _storage = pm.storage;
         
            j_span.bind('click',function(e){
                
                //ここから書き始める。イベントがあった場合の処理ですね　Jumpで飛び出す
                that.kag.ftag.nextOrderWithLabel(_target,_storage);
                that.kag.layer.showEventLayer();
                
            });
            
            j_span.css("cursor","pointer");
            
        
        })();
        
        
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[endlink]
:group
Links
:title
hyperlink（choices）ending
:exp
closing tag for hyperlinks (choices)
:sample
[link target=*select1]1- first choice[endlink][r]
[link target=*select2]2- second choice[endlink][r]
:param
#[end]
*/


tyrano.plugin.kag.tag.endlink={
    
    start:function(pm){
        
        
        var j_span = this.kag.setMessageCurrentSpan();
        
        
        //新しいspanをつくるの
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[s]
:group
System Settings
:title
End Game
:exp
stop executing the script in the scenario file
choices shown in [link] tags etc. will have no way to execute them.
:sample
[link target=*select1] This won't work after the [s] tag executes [endlink][r]
[link target=*select2] This won't work after the [s] tag executes [endlink][r]
[s]
:param
#[end]
*/


//処理停止
tyrano.plugin.kag.tag.s ={
    
    start:function(){
        
        this.kag.stat.is_strong_stop = true;
        this.kag.layer.hideEventLayer();
        
    }
    
};


/*
#[wait]
:group
System Settings
:title
Begin Wait
:exp
For the time specified by the time attribute, the script will not execute.
:sample
;pause execution for 2000 miliseconds (２seconds) 
[wait time=2000]
:param
time=set the time to wait in miliseconds
#[end]
*/

//Wait
tyrano.plugin.kag.tag.wait = {
	
	vital:["time"],
	
	pm:{
		
		time:0
		
	},
	
	start:function(pm){
		
		var that = this;
		
		//click無効
		this.kag.layer.hideEventLayer();
        
        setTimeout(function(){
            that.kag.layer.showEventLayer();
        	that.kag.ftag.nextOrder();
        },pm.time);
		
	}
	
};


/*
#[hidemessage]
:group
Layer
:title
Hide message
:exp
temporarily hides the message layer. This will peform the same action as if you were to chose clear message from the menu. 
after waiting for a click, the message layer is shown, and the script execution continues.
:sample
:param
#[end]
*/


tyrano.plugin.kag.tag.hidemessage = {
  
  start:function(){
      
      this.kag.stat.is_hide_message = true;
      //message layerを全て削除する //text表示時に復活
      this.kag.layer.hideMessageLayers();
      
      //clickは復活させる
      this.kag.layer.layer_event.show();
            
      //this.kag.ftag.nextOrder();
      
  }
    
};

/*
#[quake]
:group
System Settings
:title
Shake the screen
:exp
For a set number of miliseconds、the screen will shake. (KAG3 does not support setting the number of characters)
if you set the vmax attribute to 0 it will only shake horizontally.  if you set the hmax attribute to 0 it will only shake vertically.
:sample
[quake count=5 time=300 hmax=20]
:param
count=Set the number of times to shake the screen,
wait= Set as true or false. if set to true the game will pause during the shaking. true is the default, 
time=Set the number of miliseconds to shake the screen per count. default is 300ms,
hmax=The maximum number of pixels to shake the screen horizontally. The default is 10(px).,
vmax=The maximum number of pixels to shake the screen vertically. The default is 10(px).
#[end]
*/

//画面を揺らします
tyrano.plugin.kag.tag.quake = {
    
    vital:["time"],
    
    pm:{
        count:5,
        time:300,
        timemode:"",
        hmax:null,
        vmax:10,
        wait:"true"
    },
    
    start:function(pm){
         
         var that = this;
         
         if(pm.hmax !=null ){
        
            $("."+this.kag.define.BASE_DIV_NAME).effect('shake',{times:parseInt(pm.count),distance:parseInt(pm.hmax),direction:"left"},parseInt(pm.time),
                function(){
                    
                    if(pm.wait == "true"){
                        that.kag.ftag.nextOrder();
                    }
                }
            );
        
         }else if(pm.vmax > 0){
        
            $("."+this.kag.define.BASE_DIV_NAME).effect('shake',{times:parseInt(pm.count),distance:parseInt(pm.vmax),direction:"up"},parseInt(pm.time),function(){
                   
                   if(pm.wait == "true"){
                        that.kag.ftag.nextOrder();
                    }
           });
         
         }
         
         if(pm.wait == "false"){
            that.kag.ftag.nextOrder();
         }
         
         
    }
    
};


/*
#[font]
:group
System Settings
:title
font attributes
:exp
Set various attributes of text.
These attributes are set for each message layer.
If any of the attributes are omitted, the default set in Config.tjs is used.
When these tags are used: [resetfont] [ct] [cm] [er]、the defaults set in Config.tjs or in the [deffont] are used.
:sample
[font size=40 bold=true]
This message is big and bold.
[resetfont]
This message goes back to normal.
:param
size=set the character size,
color=set a color with the 0xRRGGBB form with 吉里吉里. If you're using HTML5 you should be able to set this in other ways,
bold=sets characters to be bold. can be true or false,
face=set the font type. This is not compatible with KAG. Put them in the project's "other" folder. Then designate this with tyrano.css's @font-face
#[end]
*/

tyrano.plugin.kag.tag.font = {
  
  pm:{
      
  },
  
  start:function(pm){
      
      this.kag.setMessageCurrentSpan();
      
      var new_font = {};
      
      if(pm.size){
          this.kag.stat.font.size = pm.size;
      }
      
      if(pm.color){
          this.kag.stat.font.color = $.convertColor(pm.color);
      }
      
      if(pm.bold){
          this.kag.stat.font.bold = $.convertBold(pm.bold);
      }
      
      if(pm.face){
          this.kag.stat.font.face = pm.face;
      }
      
      this.kag.ftag.nextOrder();
      ///////////////////
      
      
  }
    
};


/*
#[deffont]
:group
System Settings
:title
default font attributes
:exp
Sets the default font attributes for the current message layer.
If the [resetfont] tag is used, these attributes will take effect.
In other words, by only using this tag, the font attribute will not be reflected.
:sample
:param
size=set the character size,
color=set a color with the 0xRRGGBB form with 吉里吉里. If you're using HTML5 you should be able to set this in other ways,
bold=sets characters to be bold. can be true or false,
face=set the font type. This is not compatible with KAG. Put them in the project's "other" folder. Then designate this with tyrano.css's @font-face
#[end]
*/


//defaultフォント設定
tyrano.plugin.kag.tag.deffont = {
    
    pm:{
      
  },
  
  start:function(pm){
      
      var new_font = {};
      
      if(pm.size){
          this.kag.stat.default_font.size = pm.size;
      }
      
      if(pm.color){
          this.kag.stat.default_font.color = $.convertColor(pm.color);
      }
      
      if(pm.bold){
          this.kag.stat.default_font.bold = $.convertBold(pm.bold);
      }
      
      if(pm.face){
          this.kag.stat.default_font.face = pm.face;
      }
      
      this.kag.ftag.nextOrder();
      ///////////////////
      
      
  }
};


/*
#[delay]
:group
System Settings
:title
message speed
:exp
Set the message speed for text
If you want the characters to appear instantly, you can use the [nowait] tag.
:sample
:param
speed=how fast the characters appear
#[end]
*/


//文字の表示速度変更
tyrano.plugin.kag.tag.delay = {
    
    pm:{speed:""},
    
    start:function(pm){
        if(pm.speed !=""){
            this.kag.stat.ch_speed = parseInt(pm.speed);
        }
        
        this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[nowait]
:group
System Settings
:title
instant text
:exp
Without waiting, text will appear on the screen.  (contrast with [delay])
:sample
:param
#[end]
*/


tyrano.plugin.kag.tag.nowait = {
    
    pm:{},
    
    start:function(pm){
        
        this.kag.stat.is_nowait = true;
        
        this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[endnowait]
:group
System Settings
:title
end instant text
:exp
Text between this and the [nowait] tag will appear instantly.
:sample
:param
#[end]
*/


tyrano.plugin.kag.tag.endnowait = {
    
    pm:{},
    
    start:function(pm){
        
        this.kag.stat.is_nowait = false;
        
        this.kag.ftag.nextOrder();
        
    }
    
};




/*
#[resetfont]
:group
System Settings
:title
Reset font
:exp
Return to the default font attributes set by the [font] tag
Each message layer can have different font settings.
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.resetfont = {
    
    start:function(){
        
        var j_span = this.kag.setMessageCurrentSpan();
        
        this.kag.stat.font = $.extend(true, {}, this.kag.stat.default_font);
        this.kag.ftag.nextOrder();
    
    }
    
   
    
};


/*
#[layopt]
:group
Layer
:title
layer options
:exp
set layer options.
:sample
;delete message layer
@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=50  storage = miku1.png]
[trans time=2000]
@wt
;then show the layer
@layopt layer=message0 visible=true
:param
layer=This sets the target layer or message layer. if you only set the message it will be set with the [current] tag and the current layer that you're working with will become the message layer,
page=sets as "fore" (default) or "back". But if layer=message and this attribute is omitted the message layer will become the current layer,
visible=sets whether or not the layer is visible. The visibility will not change if this attribute is omitted,
left=sets the layer position from the left. If this omitted there is no position change. If you want to change the position of message0 or message1 use the [position] tag instead,
top=sets the layer position from the top. If this omitted there is no position change. If you want to change the position of message0 or message1 use the [position] tag instead,
opacity=sets the opacity of the layer from 0-255. 255 is totally transparent.
#[end]
*/

//layerーオプション変更
tyrano.plugin.kag.tag.layopt = {
    
    vital:["layer"],
    
    pm:{
        layer:"",
        page:"fore",
        visible:"",
        left:"",
        top:"",
        opacity:"",
        autohide:false,
        index:10
    },
    
    start:function(pm){
        
        var that = this;
        
        if(pm.layer=="message"){
            
            pm.layer = this.kag.stat.current_layer;
            pm.page  = this.kag.stat.current_page;
            
        }
        
        var j_layer = this.kag.layer.getLayer(pm.layer,pm.page);
        
        
        //表示部分の変更
        if(pm.visible !=""){
            
            if(pm.visible == "true"){
                
                //バックの場合は、その場では表示してはダメ
                if(pm.page=="fore"){
                    j_layer.css("display","");
                }
                
                j_layer.attr("l_visible","true");
                
            }else{
                
                j_layer.css("display","none");
                j_layer.attr("l_visible","false");
                
            }
            
        }
        
        //layerのポジション指定
        
        if(pm.left !=""){
            j_layer.css("left",parseInt(pm.left));
        }
        
        if(pm.top !=""){
            j_layer.css("top",parseInt(pm.top));
        }
        
        if(pm.opacity !=""){
            j_layer.css("opacity",$.convertOpacity(pm.opacity))
        }
        
        this.kag.ftag.nextOrder();
        
    }
    
    
};

/*
#[ruby]
:group
Message
:title
add helper text (furigana)
:exp
Set the helper characters of the following characters.
Set them anytime you want to show ruby characters (furigana).
When you want to apply ruby characters to a multicharacter string, you need to set ruby characters for every character in the string.
:sample
[ruby text="かん"]漢[ruby text="じ"]字
:param
text=sets ruby characters to show for kanji ("漢" gets "かん" and "字" gets "じ").
#[end]
*/

//ルビ指定
tyrano.plugin.kag.tag["ruby"] ={
    
    vital:["text"],
    
    pm:{
        text:""
    },
    
    start:function(pm){
        
        var str = pm.text;
        
        //ここに文字が入っている場合、ルビを設定してから、text表示する
        this.kag.stat.ruby_str = str;
        
        this.kag.ftag.nextOrder();
        
    }
    
    
};

/*
#[cancelskip]
:group
System Settings
:title
cancel skip
:exp
Cancel skipping through dialog.
Able to override player initiated skips.
:sample
:param
#[end]
*/

tyrano.plugin.kag.tag.cancelskip ={
    start:function(pm){
        
        this.kag.stat.is_skip = false;
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[locate]
:group
System Settings
:title
display location settings
:exp
Set placement of graphical buttons.
There is no support for writing text.
:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
x=Set horizontal position,
y=Set vertical position
#[end]
*/

//Graphical button表示位置調整、textはできない
tyrano.plugin.kag.tag.locate ={
    
    pm:{
        x:null,
        y:null
    },
    
    start:function(pm){
        
        if(pm.x !=null){
            this.kag.stat.locate.x = pm.x;
        }
        
        if(pm.y != null){
            this.kag.stat.locate.y = pm.y;
        }
        
        this.kag.ftag.nextOrder();
        
    }
};


/*
#[button]
:group
Links
:title
Show a graphical button.
:exp
Show a graphical button.
This is the image version of a [link] tag.
By implementing this button, it forces the scenario to stop, so you need to include a jump target. 
The location of the graphical button is determined by most recent [locate] tag.
However, if x and y are set, it will use those attributes to determine the location.
If it is moved from here, it will not remain on the call stack.  In other words, you cannot return to here.
After the jump you have to use the [cm] tag to stop displaying the button.
:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
graphic=sets the image for the button. Put this file in the image folder,
storage=set the scenario file to jump to. If this is omitted the current scenario file is used.,
target=sets the label to jump to. If this is omitted the beginning of the file is used,
name=TyranoScript only (not KAG3).  This name is used later to reference this by tags like [anim] tag. Basically by setting this name you can set this as a JS class. If you divide them with commas you can designate multiple names.,
x=sets the button's horizontal position,
y=sets the button's vertical position,
width=sets the button's horizontal position,
width=sets the button's width,
height=sets the button's height,
fix=set to true or false. The default is false. If set to true it moves the button to a fixed layer and this scenario file can be continued even though the button is being shown. For example if you always wanted to show a save button you would use this. And if you wanted to remove a component from a fixed layer you would user the [fixclear] tag,
savesnap=set as true or false. default is false. When the button is pressed a save state (savesnap) is created., 
folder=set the folder. The foreground image defaults to fgimage and the background image defaults to bgimage but folder can be set and used. ,
exp=Set JavaScript to be performed when you set this button,
preexp=this can put the value of something into memory. When the button is clicked any variables can declared in this can be used.
#[end]
*/


//指定した位置にGraphical buttonを配置する
tyrano.plugin.kag.tag.button = {
    
    pm:{
        graphic:"",
        storage:null,
        target:null,
        ext:"",
        name:"",
        x:"",
        y:"",
        width:"",
        height:"",
        fix:"false", /*ここがtrueの場合、システムbuttonになりますね*/
        savesnap:"false",
        folder:"image",
        exp:"",
        prevar:""
    },
    
    //イメージ表示layer。message layerのように扱われますね。。
    //cmで抹消しよう
    start:function(pm){
        
        var that = this;
        
        var target_layer = null;
        
        if(pm.fix =="false"){
            target_layer = this.kag.layer.getFreeLayer();
            target_layer.css("z-index",999999);
        }else{
            target_layer = this.kag.layer.getLayer("fix");
        }
        
        
        var j_button = $("<img />");
        j_button.attr("src","./data/"+pm.folder+"/"+pm.graphic);
        j_button.css("position","absolute");
        j_button.css("cursor","pointer");
        j_button.css("z-index",99999999);
       
       
       if(pm.x==""){
            j_button.css("left",this.kag.stat.locate.x+"px");
       }else{
            j_button.css("left",pm.x+"px");
       }
       
       
       if(pm.y==""){
            j_button.css("top",this.kag.stat.locate.y+"px");
       }else{
            j_button.css("top",pm.y+"px");
       }
        
         if(pm.fix !="false"){
            j_button.addClass("fixlayer");
         }
         
         if(pm.width !=""){
            j_button.css("width",pm.width+"px");
         }
         
         if(pm.height !=""){
            j_button.css("height",pm.height+"px");
         }
        
        //オブジェクトにクラス名をセットします
        $.setName(j_button,pm.name);
        
        
        (function(){
                
            var _target = pm.target ;
            var _storage = pm.storage;
            var _pm = pm;
            var preexp =  that.kag.embScript(pm.preexp);
            var button_clicked = false;
            
            j_button.click(function(){
                    
                  //fix指定のbuttonは、繰り返し実行できるようにする
                  if(button_clicked == true　&& _pm.fix =="false"){
                    
                    return false;
                    
                  }  
                  //Stagに到達していないとクリッカブルが有効にならない fixの時は実行される必要がある
                    if(that.kag.stat.is_strong_stop !=true && _pm.fix =="false"){
                        return false;
                    }
                    
                    button_clicked = true;
                    
                    if(_pm.exp !=""){
                        //スクリプト実行
                        that.kag.embScript(_pm.exp,preexp);
                    }
                    
                    //fixの場合は、アニメーション中は
                    
                    if(_pm.savesnap == "true"){
                          
                          //セーブスナップを取る場合、アニメーション中やtransitionはNG
                          if(that.kag.stat.is_stop == true){
                              return false;
                          }
                          
                          that.kag.menu.snapSave(that.kag.stat.current_message_str);
                    }
                    
                    
                    that.kag.layer.showEventLayer();
                    
                    //コールを実行する
                    that.kag.ftag.startTag("jump",_pm);
                    
            });
            
        })();
            
        
        target_layer.append(j_button);
        
        if(pm.fix == "false"){
            target_layer.show();
        }
        
        
        this.kag.ftag.nextOrder();
        
    }
    
};


/*
#[clickable]
:group
Links
:title
Define clickable area
:exp
Defines a clickable area.
Because showing clickable areas pause the execution of the scenario script, a jump target must be set. Also as with graphical button's [locate] tag must be set for reference.
Keep in mind that this movement does not exist on the call stack so a return is not possible.
Important：if an [s]tag is reached, the clickable area will not be valid. Only use the [s] tag to stop the game.
:sample
[locate x=20 y=100]
[clickable width=200 height=300 target=*oda]
[locate x=300 y=100]
[clickable width=100 height=100 border="solid:1px:gray" target=*oda]
:param
width=set width of area,
height=set height of area,
borderstyle=You can show a border of the area with a line. The style of the line looks like this: "thickness:style:color". Possible line types are solid double groove dashed dotted etc,
color=specify the box like this: 0xRRGGBB,
opacity=this sets the opacity from 0-255. 0 is completely transparent.,
mouseopacity=when the mouse is over the clickable area you can change the transparency. Values can range from 0-255. 0 is completely transparent,
storage=set the scenario file to jump to. If this is omitted the current file will be used.,
target=when the clickable area is clicked jump to that location. If omitted it will jump to the top.
#[end]
*/


//指定した位置にGraphical buttonを配置する
tyrano.plugin.kag.tag.clickable = {
    
    vital:["width","height"],
    
    pm:{
        width:"0",
        height:"0",
        border:"none",
        color:"",
        mouseopacity:"",
        opacity:"140",
        storage:null,
        target:null,
        name:""
    },
    
    //イメージ表示layer。message layerのように扱われますね。。
    //cmで抹消しよう
    start:function(pm){
        
        var that = this;
        
        //this.kag.stat.locate.x
        var layer_free = this.kag.layer.getFreeLayer();
        
        layer_free.css("z-index",9999999);
        
        var j_button = $("<div />");
        j_button.css("position","absolute");
        j_button.css("cursor","pointer");
        j_button.css("top",this.kag.stat.locate.y+"px");
        j_button.css("left",this.kag.stat.locate.x+"px");
        j_button.css("width",pm.width+"px");
        j_button.css("height",pm.height+"px");
        j_button.css("opacity",$.convertOpacity(pm.opacity));
        j_button.css("background-color",$.convertColor(pm.color));
        j_button.css("border",$.replaceAll(pm.border,":"," "));
        
        //alert($.replaceAll(pm.border,":"," "));
        
        (function(){
                
            var _target = pm.target ;
            var _storage = pm.storage;
            var _pm = pm;
            
            if(_pm.mouseopacity!=""){
                
                j_button.bind("mouseover",function(){
                   j_button.css("opacity",$.convertOpacity(_pm.mouseopacity));
                    
                });
                
                j_button.bind("mouseout",function(){
                   j_button.css("opacity",$.convertOpacity(_pm.opacity));
                });
                
                
            }
            
            j_button.click(function(){
                    
                    //Stagに到達していないとクリッカブルが有効にならない
                    if(that.kag.stat.is_strong_stop !=true){
                        return false;
                    }
                    
                    //that.kag.ftag.startTag("cm",{});
                    
                    //コールを実行する
                    that.kag.ftag.startTag("jump",_pm);
                    
                    that.kag.layer.showEventLayer();
                    
                    /*
                    if(pm.target == null && pm.storage!=null){
                        that.kag.ftag.nextOrderWithIndex(0,_storage);
                    }else{
                        that.kag.ftag.nextOrderWithLabel(_target,_storage);
                    
                    }
                    
                    that.kag.layer.showEventLayer();
                    */
            });
            
        })();
            
        
        layer_free.append(j_button);
        
        layer_free.show();
        
        this.kag.ftag.nextOrder();
        
    }
    
};



/*
#[glyph]
:group
System Settings
:title
image when waiting for click
:exp
The image that is used when waiting for a click.
This goes in same directory as tyrano/images/kag/nextpage.gif
:sample
[glyph  fix=true left=200 top=100 ]

:param
line=specify the image to use. It goes somewhere in the same directory as tyrano/kag/nextpage.gif.,
fix=if set to true you can place this with the top and left params,
left=if the fix property is true set the left margin to this number,
top=if the fix property is true set the top margin to this number
#[end]
*/


//指定した位置にGraphical buttonを配置する
tyrano.plugin.kag.tag.glyph = {
    
    pm:{
        line:"nextpage.gif",
        layer:"message0",
        fix:"false",
        left:0,
        top:0
    },
    
    //イメージ表示layer。message layerのように扱われますね。。
    //cmで抹消しよう
    start:function(pm){
        
        var that = this;
        
        $("#glyph_image").remove();
        
        if(pm.fix == "true"){
            
            var j_layer = this.kag.layer.getLayer(pm.layer);
        
            var j_next = $("<img id='glyph_image' />");
            j_next.attr("src","./tyrano/images/kag/"+pm.line);
            j_next.css("position","absolute");
            j_next.css("z-index",99999);
            j_next.css("top",pm.top+"px");
            j_next.css("left",pm.left+"px");
            j_next.css("display","none");
            
            j_layer.append(j_next);
            
            this.kag.stat.flag_glyph = "true";
            
            
        }else{
            
            this.kag.stat.flag_glyph = "false";
            
        }
        
        this.kag.ftag.nextOrder();
        
    }
    
};

//スタイル変更は未サポート
/*
tyrano.plugin.kag.tag["style"] = {
    
    pm:{
        
    },
    
    start:function(pm){
        
    }
};
*/


/*
#[trans]
:group
Layer
:title
transition layer
:exp
transition to the set layer.
transition is a way to move the back layer to the front.
after transition, the surface page's status of the target layer image's placement, size, visibility, invisibility are made to be the same as the back page. 
Also, during a transition do not change the properties of the layers
:sample
[backlay]
[image storage=fg0 layer=0 page=back]
[trans time=1500 ]
[wt]
:param
layer=set the target layer<br>
if "base" is set it will become the scene layer<br>
if a number greater than 0 is used it will become a foreground layer<br>
if you set as message0 or message1 then it will become that message layer.<br>
if you set is as message it will become the message layer of whatever the [current] tag is set to
Even if the message layer is the back page it will copy that message layer from the front to the back.<br>
if this is omitted the information of every layer is copied to the back page<br>
<br>
Normally the background changes are used.,
method=set the transition type. The default is "crossfade".  Other possibilities are「crossfade」「explode」「slide」「blind」「bounce」「clip」「drop」「fold」「puff」「scale」「shake」「size」,
time=the time for the transition is set in milliseconds
#[end]
*/

//transition
tyrano.plugin.kag.tag.trans={
	
	vital:["time"],
	
	pm:{
	    layer:"base",
		method : "crossfade",
		children:true,
		time:1500
	},
	
	start:function(pm){
		
		this.kag.ftag.hideNextImg();
        
		var that = this;
		
		//backを徐々に表示して、foreを隠していく。
		//アニメーションが終わったら、back要素を全面に配置して完了
		
		//指定したlayerーのみ、フェードする
		
		var comp_num = 0;
		var layer_num = $.countObj(this.kag.layer.map_layer_fore);
		
		//ここがチルドレンの場合、必ず即layer実行ね
		if(pm.children == "false"){
		  layer_num = 0;
		}
		
		for( key in this.kag.layer.map_layer_fore ){
			
			//指定条件のlayerのみ実施
			if(pm.children == true || key === pm.layer){
			     
    			(function(){
    			
    			    var _key = key;
    			    
        			var layer_fore = that.kag.layer.map_layer_fore[_key];
        			var layer_back = that.kag.layer.map_layer_back[_key];
                    
                    
        			//message layerの場合、カレント以外はトランスしない。むしろ非表示
        			//if((_key.indexOf("message")!=-1 && _key !== that.kag.stat.current_layer) || (_key.indexOf("message")!=-1 && layer_back.attr("l_visible") == "false") ){
        			if( (_key.indexOf("message")!=-1 && layer_back.attr("l_visible") == "false") ){
                           
        			    comp_num++;
        			    that.kag.layer.forelay(_key);
                              
        			}else{
        			
                		$.trans(pm.method, layer_fore ,parseInt(pm.time),"hide",function(){});
                		layer_back.css("display","none");
                		
                		$.trans(pm.method, layer_back ,parseInt(pm.time),"show",
                		  function(){
                		      comp_num++;
                		      that.kag.layer.forelay(_key);
                		      
                		      //すべてのtransition完了
                		      if(layer_num <= comp_num){
                		          
                		          that.kag.ftag.completeTrans();
                		          
                		      }
                		      
                             that.kag.ftag.hideNextImg();
        
            
                		      
                		  });
            		  
                    }
            		
        		})();
            }
    	}
    	
    	this.kag.ftag.nextOrder();
		
	}
};


 
