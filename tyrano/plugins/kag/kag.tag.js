
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
storage=scenario file to move to. If this is left out, the current scenario file will be used,
target=label name to jump to. If this is left out, it will go to the beginning.

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
Set the current message layer. After setting this, sentences, setting attributes via font tags, using the l tag for click events, etc. will take place in this layer.
As for message0 as defaultで可視の状態で すが、message1 は layopt tag 等で visible=true としないと表示されないので注意してください。
:sample
[current layer="message0"]
Show message0 layer[l]
[current layer="message1"]
Show message1 layer[l]
:param
layer=操作対象のmessage layerをset。指定がない場合、現在のmessage layerとみなされます,
page=表画面を対象とするか、裏画面を対象とするかをset。省略すると表ページとみなされます
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
frame=set image for the message layer's frame image. <br>use this to customize the message area.<br />adjust image size is according to the width and height attributes. <br />さらに、margin属性で実際にmessageが表示される箇所の調整も行いましょう<br />また、"none"と指定することで標準枠に戻すこともできます。違う枠画像をしていすると切り替えることもできます,
color=message layerの表示色を 0xRRGGBB 形式で指定 します。 ,
opacity=message layerの不透明度を 0 ～ 255 の数値で指定しま す(文字の不透明度や、layer自体の不透明度ではありません)。0 で完全 に透明です。,
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
layerに画像を表示します。キャラクター表示や背景切り替えなどに使用できます。前景layerは初期状態では非表示なのでvisible=trueとすることで表示されます
:sample
;背景変更をtransitionで実施
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
@layopt layer=message0 visible=true
:param
storage=画像File名をset。Fileは背景layerならプロジェクトFolderのbgimage、背景layerならfgimageに入れてください,
layer=対象とするメlayerをset。<br/>"base"を指定すると背景layer。0以上の整数を指定すると対応する前景layerに画像を表示します,
page=対象とするページをset。"fore"か"back"を指定して下さい。<br>この属性を省略すると"fore"であるとみなされます,
left=画像の左端位置をset。（pixels）,
top=画像の上端位置をset。（pixels）,
x=画像の左端位置をset。leftと同様。こちらが優先度高（pixels）,
y=画像の上端位置をset。topと同様。こちらが優先度高（pixels）,
width=画像の横幅をset。（pixels）,
height=画像の高さ位置をset。（pixels）,
folder=好きな画像Folderから、画像を選択できます。通常前景layerはfgimage　背景layerはbgimageと決まっていますが、ここで記述したFolder以下の画像Fileを使用することができるようになります。,
name=TyranoScriptのみ。animtagなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
pos=layer位置を自動的に決定します。前景layerに対して使います。横方向の位置は、この属性で指定した left ( 左端 ) 、left_center ( 左より )、center ( 中央 )、 right_center ( 右より )、right ( 右端 ) の位置に表示されます。各横方向の座標の中心 位置は Config.tjs で指定することができます。
　<br>left 、left_center、 center、 right_center、 right の代わりに、それぞれ l、 lc、 c、 rc、 r を 指定することもできます ( 動作は同じです )。
　<br>この属性を指定した場合は left 属性や top 属性は無視されます。
　<br>layerをbase と指定した場合にはこの属性は指定しないでください。各々の表示位置はConfit.tjsで事前に設定しておきましょう
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
imagetagでlayerに追加した画像を解放（非表示）にします。layer指定は必須です。
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
page=set page. If it is not set the surface page is used,
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
layerにtextを表示します。前景layerに対してのみ実行します<br />
前景layerの属性を全て継承します。文字を消す時はfreeimagetagをlayerに対して適応します
また、前景layerはdefault非表示なので、transitionで表示しない場合はlayerを可視状態にしてから、追加します。
[layopt layer=0 visible=true]が必要
:sample
[backlay]
[ptext page=back text="texttext" size=30 x=200 y=300 color=red vertical=true]
[trans time=2000]
[wt]
[l]
Clear the displayed text
[freeimage layer = 0]
:param
layer=対象とするメlayerをset。以上の整数を指定すると対応する前景layerに画像を表示します,
page=対象とするページをset。"fore"か"back"を指定して下さい。<br>この属性を省略すると"fore"であるとみなされます,
text=表示するtextの内容,
x=textの左端位置をset。（pixels）,
y=textの上端位置をset。（pixels）,
vertical=true 、false のいずれかを指定してください。trueで縦書き表示されます。defaultは横書き,
size=フォントサイズをpixelsで指定してください,
face=フォントの種類を指定してください。非KAG互換ですが、ウェブフォントも使用できます,
color=フォントの色をset,
name=ティラノスクリプトのみ。animtagなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
bold=太字指定 boldと指定してください　HTML５互換ならfont-style指定に変換できます 


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
指定したlayer、あるいはすべてのlayerの情報を、表ページから裏ページに コピーします。
利用方法としてはtrans tagで表ページのlayerの画像を裏ページの layerの画像に置き換えます。
そのため、transition前にこの backlay タ グで画像を裏ページに転送し、裏ページでlayerを操作してから、transitionを 行うという方法に用います。
:sample
;背景変更をtransitionで実施
@layopt layer=message0 visible=false
[backlay]
[image layer=base page=back storage=rouka.jpg]
[trans time=2000]
[wt]
:param
layer=対象となるlayerをset。<br>
　base を指定すると 背景layer になります。<br>
　0 以上の整数を指定すると前景layerになります。<br>
　message0 または message1 を指定するとmessage layerにな ります。<br>
単に message とのみ指定した場合は、 current tagで指定した現在の操作対象のmessage layerが 対象になります ( 裏ページのmessage layerが操作対象であっても そのmessage layerの表ページ→裏ページへのコピーが行われます )。<br>
省略すると、すべてのlayerの情報が裏ページにコピーされます。<br>
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
Begin Waiting. time属性で指定した時間、操作できなくなります。
:sample
;2000miliseconds（２秒）処理を停止します
[wait time=2000]
:param
time=ウェイトをmilisecondsでset。
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
message layerを一時的に隠します。メニューから「messageを消す」を選んだのと 同じ動作を行います。
click待ちを行った後、message layerは表示され、 実行は継続します。
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
For a set number of miliseconds、the screen will shake.（KAGの文字数指定は未対応）
vmax 属性を 0 に設定すると横揺れになります。hmax 属性を 0 に設定すると縦揺れになります。
:sample
[quake count=5 time=300 hmax=20]
:param
count=Set the number of times to shake the screen,
wait  = Set as true or false. trueの場合は揺れが完了するまで、Gameを停止します。true is the default, 
time=１回揺れるのにかかる時間をmilisecondsでset。defaultは300,
hmax=揺れの横方向への最大振幅をset。省略すると 10(px) が指定されたと見なされます。,
vmax=揺れの縦方向への最大振幅をset。省略すると 10(px) が指定されたと見なされます。
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
これらの属性は、message layerごとに個別に設定できます。
いずれの属性も、省略すると前の状態を引き継ぎます。また、default を指定すると Config.tjs 内で指定したdefaultの値に戻ります。
resetfont や　ct cm er tagが実行されると、、Config.tjs 内や deffont tagで指定し たdefaultの値に戻ります。
:sample
[font size=40 bold=true]
この文字は大きく、そして太字で表示されます。
[resetfont]
もとの大きさに戻りました。
:param
size=文字サイズをset,
color=文字色を文字色を 0xRRGGBB 形式でset。（吉里吉里対応）　HTML5に限るならその他指定でも大丈夫です,
bold=太字指定。true 又は　false で指定,
face=フォントの種類を指定。非KAG互換でウェブフォントも利用可能。プロジェクトFolderのothersFolderに配置してください。そして、tyrano.cssの@font-faceを指定することで利用できます。
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
現在操作対象のmessage layerに対する、defaultの文字属性をset。
ここで指定した属性は、resetfont tagで実際に反映されます。
つまり、このtagを実行しただけではすぐにはフォントの属性は反映されません。resetfont tag を実行する必要があります。
:sample
:param
size=文字サイズをset,
color=文字色を文字色を 0xRRGGBB 形式でset。（吉里吉里対応）　HTML5に限るならその他指定でも大丈夫です
bold=太字指定。true 又は　false で指定,
face=フォントの種類を指定。非KAG互換でウェブフォントも利用可能。プロジェクトFolderのothersFolderに配置してください。そして、tyrano.cssの@font-faceを指定することで利用できます。

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
文字表示をノーウェイトにするには nowait tagをつかう こともできます。
:sample
:param
speed=文字の表示速度をset
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
font tagで指定した文字の属性をdefaultに戻します。
文字属性は、message layerごとに個別に設定できます
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
;message layerを消去
@layopt layer=message0 visible=false
[backlay]
[image layer=0 page=back visible=true top=100 left=50  storage = miku1.png]
[trans time=2000]
@wt
;そしてlayer表示
@layopt layer=message0 visible=true
:param
layer=対象となる前景layerまたはmessage layerをset。 　message とのみ指定した場合は、current tagで指定した、現在の操作対象のmessage layerが対象となります。,
page=表(fore)画面のlayerを対象とするか、裏(back)画面のlayerを対象と するかをset。省略すると表ページであると見なされます。ただし、layer=message とのみ指定した場合でこの属性を省略した場合は 現在操作対象のページのmessage layerが選択されます。,
visible=ayer 属性で指定したlayerを表示するか、しないかを指定 します。visible=true と 指定すれば、layerは表示状態になります。visible=false と指定すれば、 非表示状態になります。省略すると表示状態は変わりませ ん。,
left=layer 属性で指定したlayerの左端位置をset。 省略すると位置は変更しません。　layer 属性に message0 や message1 を指定した場合は、position tagで位置等を指定してください。,
top=　layer 属性で指定したlayerの上端位置をset。 省略すると位置は変更しません。　layer 属性に message0 や message1 を指定した場合は、むしろ position tagで位置等を指定してください。,
opacity=layerの不透明度をset。０～２５５の範囲で指定してください（２５５で全くの不透明）
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
x=Set vertical position
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
linktagの画像版となります。
ただし、Graphical button表示中は強制的にscenario進行が停止しますので、必ずJump先を指定して下さい
また、Graphical buttonの表示位置は直前のlocatetagによる指定位置を参照します。
ただし、x、y が指定されている場合は、そちらが優先されます。
ここから、移動した場合はコールスタックに残りません。つまり、リターンできないのでご注意ください
Jump後に必ず[cm]tagでbuttonを非表示にする必要があります。
:sample
[locate x=20 y=100]
[button graphic="oda.png" target=*oda]

[locate x=300 y=100]
[button graphic="toyo.png" target=*toyo]

:param
graphic=buttonにする画像をset。FileはプロジェクトFolderのimageFolderに入れて下さい,
storage=Jump先のscenarioFileをset。省略すると、現在 のscenarioFile内であると見なされます。,
target=Jump先のLabelをset。省略すると、Fileの先頭から実行されます。,
name=TyranoScriptのみ。animtagなどからこの名前でアニメーションさせることができます。でまた名前を指定しておくとクラス属性としてJSから操作できます。カンマで区切ることで複数指定することもできます,
x=buttonの横位置をset,
y=buttonの縦位置をset。
width=buttonの横幅をpixelsで指定できます,
width=buttonの高さをpixelsで指定できます,
fix=true falseでset。defaultはfalse 。trueを指定すると、Fixlayerーにbuttonが配置されます。この場合、buttonを表示してもscenarioを進める事ができます。例えば、セーブbuttonといった常に表示したいbuttonを配置する時に活用できます。また、fixlayerーに追加した要素を消す場合はfixcleartag を使います,
savesnap=true or false でset。defaultはfalse このbuttonが押された時点でのセーブスナップを確保します。セーブ画面へ移動する場合はここをtrueにして、保存してからセーブを実行します,
folder=好きな画像Folderから、画像を選択できます。通常前景layerはfgimage　背景layerはbgimageと決まっていますが、ここで記述したFolder以下の画像Fileを使用することができるようになります。,
exp=buttonがclickされた時に実行されるJSを指定できます。,
preexp="tagが評価された時点で変数 preexpに値を格納します。つまり、buttonがclickされた時に、expでpreexpという変数が利用できます。"

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
透明なclick可能領域を設定することができます。
クリッカブルエリアの表示中は強制的にscenario進行が停止しますので、必ずJump先を指定して下さい
また、Graphical buttonの表示位置は直前のlocatetagによる指定位置を参照します
ここから、移動した場合はコールスタックに残りません。つまり、リターンできないのでご注意ください
☆重要：[s]tagに到達していない間は、クリッカブルは有効になりません。かならず、[s]tagでGameを停止してください。
:sample
[locate x=20 y=100]
[clickable width=200 height=300 target=*oda]

[locate x=300 y=100]
[clickable width=100 height=100 border="solid:1px:gray" target=*oda]

:param
width=領域の横幅をset,
height=領域に高さをset,
borderstyle=領域に線を表示することができます。「線の太さ:線の種類（CSS準拠）:線の色」のFormatで記述して下さい。線の種類はsolid double groove dashed dotted などが指定できます,　
color=表示色を 0xRRGGBB 形式で指定 します。 ,
opacity=領域の不透明度を 0 ～ 255 の数値でset0で完全 に透明です。,
mouseopacity=領域にマウスが乗った時透明度を変更することができます。領域の不透明度を 0 ～ 255 の数値でset0で完全 に透明です,
storage=clickされた際のJump先のscenarioFileをset。省略すると、現在 のscenarioFile内であると見なされます。,
target=clickされた際のJump先のLabelをset。省略すると、Fileの先頭から実行されます。
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
left=if the fix property is true, set the left margin to this number,
left=if the fix property is true, set the top margin to this number

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
transitionは、常に裏ページの対象のlayerが、表ページの対象のlayerに 入れ替わる方向で行われます。
transition後は、表ページの対象のlayerの画像、位置、サイズ、可視・不可視 の状態は裏ページの対象のlayerと同じになります。
また、transition中はlayerの属性変更などは行わないで下さい
:sample
[backlay]
[image storage=fg0 layer=0 page=back]
[trans time=1500 ]
[wt]
:param
layer=対象となるlayerをset。<br>
base を指定すると 背景layer になります。<br>
　0 以上の整数を指定すると前景layerになります。<br>
　message0 または message1 を指定するとmessage layerにな ります。<br>
単に message とのみ指定した場合は、 current tagで指定した現在の操作対象のmessage layerが 対象になります <br>
<br>
通常は背景の変更などに使用されます。,
method=transitionのタイプをset。defaultは"crossfade"です。指定できる効果は「crossfade」「explode」「slide」「blind」「bounce」「clip」「drop」「fold」「puff」「scale」「shake」「size」,
time=transitionを行っている時間をmilisecondsでset。
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


 
