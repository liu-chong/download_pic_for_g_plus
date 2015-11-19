// DownloadSupport for Google+
/*
DOM sample

1 post DOM : 
<div id="update-z12jwxupjtetfldul23punh5bv3xiniay04" tabindex="0" aria-live="polite" class="ze sj tl picasa_link_checked"></div>

1 img_panel DOM :
<div class="H-y-qa H-y-pe-ea c-m-l H-y" data-content-url="https://plus.google.com/photos/110133832564364235950/albums/5642050894302711521/5642050896281094578" data-content-type="image/jpeg" style="" aria-expanded="false"><img src="//lh4.googleusercontent.com/-fIz0IMoM0VY/TkyXZbWCSbI/AAAAAAAAP7s/IcZA3rpMmnc/h301/%25E6%259C%25AA%25E5%2591%25BD%25E5%2590%258D.jpg" style="display:block;"></div>

*/

var selecter = {
  post_panel : 'div[data-iid]',
  plus_one_button : '[id^="po-"]'
};

var PicasaEarth = function(){
  var that = this;

  var lang = $('html').attr('lang');
  var is_ja = lang === 'ja';

  var ele_body = $('body');
  var ele_contentPane = $('#contentPane');

  
  var imgURL = chrome.extension.getURL("icon_splite.png");
  var srcURL = chrome.extension.getURL("0.png");

  var ele_icon_org = $('<span>')
    //.attr('src', srcURL)
    .addClass('dsg-icon')
    .css({
      width: 18,
      height: 18,
      backgroundImage : 'url('+imgURL+')'
    })

  var ele_btn_org = $('<a>')
    .addClass('dsg-button')
    .attr('href', '#')
    .attr('target', 'dsg-dl-window0')
    .append(ele_icon_org);

/*
  that.changeState = function(){
    if(event){
      var target = event.target;
      var id = target.id;
      var ele = $(target);
      console.log(ele);
      if(ele.children('[pgpid]').size()){
        ele.children('[pgpid]').each(function(){
          $(this).('img');
        });
      }
    }
  }
*/
  // DOM監視
/*
  document.addEventListener(
    'DOMNodeInserted',
     that.changeState,
     false);
*/

  // 汎用ボタン追加
  that.addButton = function(data){
    data = data || {
      class : 'dsg-debug',
      text : 'debug',
      clickEvent : function(that, ele_content){
        that.downloadVideo(ele_content);
      }
    };
    data.href = '#' || data.href;

    var text = data.text_en;
    if(is_ja){
      text = data.text_ja;
    }

    var ele_button = ele_btn_org.clone();
    var ele_text = $('<span>')
      .addClass('dsg-button-text')
      .text('□');
    ele_button
      .addClass(data.class)
      .attr('href', data.href)
      .attr('title', text)
      .click(function(){
        $(this).addClass('dsg-button-checked');
        if(typeof data.clickEvent == 'function'){
          data.clickEvent(that);
          return false;
        }
      })
      .append(ele_text);

    if(localStorage.getItem(data.storage_key) == 'true'){
      //ele_contentPane.attr('data-' * data.storage_key , 'true');
      
    } else {
      ele_button.hide();
      //ele_contentPane.attr('data-' * data.storage_key , 'false');
    }

    that.ele_buttons.append(ele_button);
  }


  // 各機能ボタンを追加する (ひたすらDOM操作)
  // マウスオーバーで起動し、記事内容にある画像・動画の有無・種類を確認する
  that.addButtons = function(ele_post_panels){
    ele_post_panels = ele_post_panels || ele_contentPane
      .find(selecter.post_panel)
      .not('.dsg-post-checked');

    if(!ele_post_panels.length || ele_post_panels.hasClass('dsg-post-checked')){
      return false;
    }

    ele_post_panels.each(function(){
      var th = $(this);
      var post_id = th.attr('id');
      th.addClass('dsg-post-checked');

      var imgs_wrap = null; // img on event
      [ ".bldpQb", "a.Ks", "div.Oaa", "div.mU",
          "div.Yj.Fg.FB" ].map(function(n) {
        if (imgs_wrap != null) return ;
        var doc = th.find(n);
        if (doc.length) imgs_wrap = doc;
      });

      console.log(imgs_wrap);

      if (imgs_wrap == null) return ;
      var ele_content = imgs_wrap.find("img");
      var content_url = imgs_wrap.attr('href') || ele_content.attr("src");
      if (!/\/photos\/\d+\/albums\//.test(content_url))
        content_url = ele_content.attr("src");
      // console.log(ele_content); console.log(content_url);

      // 最初のコンテンツだけ確認して、必要なボタンの種類を分類する
      var ele_content_panel_parent = ele_content.parent().parent();
      that.ele_buttons = $('<span>')
        .addClass('dsg-buttons')
//        .addClass('dsg-buttons-side');

      var btns_row = ele_post_panels.find('div.b0H8Oc');
      var previous_btn = null; do {
        previous_btn = btns_row.children(".YxJESd");
        if (previous_btn.length) break;
        previous_btn = btns_row.children("div.Dg.eaGJ0e");
        if (previous_btn.length) break;
        previous_btn = btns_row.children("div.Dg.Ut");
        if (previous_btn.length) break;
        previous_btn = btns_row.children("div.qk.Gc");
        if (previous_btn.length) break;
        previous_btn = btns_row.children("div.R7Leqb");
        if (previous_btn.length) break;
        previous_btn = btns_row.children("div.esw.Hf.Od"); } while (false);

      console.log(previous_btn);

      var ele_option = $(".R7Leqb").addClass('dsg-option');
/*
     var ele_option = ele_content_panel_parent
      .parent()
      .next()
      .addClass('dsg-option');
*/

     ele_content_panel_parent
        .addClass('dsg-content-parent');

      if (!content_url){
        return true;

      } else if (content_url.match(/\/\/[0-9a-z]*\.youtube\.com\/watch/)){
        that.addButton({
          class : 'youtube_dl_link',
          storage_key : 'dsg-show-dl-youtube',
          text_ja : 'Youtube動画をダウンロードする',
          text_en : 'Download Youtube Video',
          clickEvent : function(){
            that.downloadVideo(ele_content)
          }
        });
        console.log('youtube flag');
/*
        var video_a = ele_btn_org.clone()
          .addClass('video_dl_link')
          .text(' Download ').click(function(){
            that.downloadVideo(ele_content);
          });
        that.ele_buttons.append(video_a);
*/
        //return true;

      } else if(content_url.match(/\/\/(plus\.google\.com\/photos|picasaweb\.google\.com)\/|lh\d\.googleusercontent\.com\//) ||
          content_url.match(/\/photos\/\d+\/albums\//)){

        if(content_url.match(/\/\/plus\.google\.com\/photos\//) ||
            content_url.match(/\/photos\/\d+\/albums\//)){
          that.addButton({
            class : 'picasa_dl_link',
            storage_key : 'dsg-show-dl-picasa',
            text_ja : 'Picasaアルバムをダウンロードする',
            text_en : 'Download picasa album',
            clickEvent : function(){
              that.downloadPicasaAlbum(imgs_wrap)
            }
          });
          console.log("!!! picasa_dl_link!");

        } else {
          that.addButton({
            class : 'picasa_page_link',
            storage_key : 'dsg-show-link-picasa',
            text_ja : 'Picasaアルバムのページへ',
            text_en : 'Link picasa album page',
            href : content_url
          });

        }

          that.addButton({
            class : 'raw_image_download',
            storage_key : 'dsg-show-dl-images',
            text_ja : '元サイズの画像をダウンロードする',
            text_en : 'Download raw images',
            clickEvent : function(){
              that.downloadImages(ele_content);
            }
          });

        if(ele_content.length>6){
           that.addButton({
             class : 'raw_image_download_all',
             storage_key : 'dsg-show-dl-images-all',
             text_ja : '元サイズの画像を全てダウンロードする',
             text_en : 'Download all raw images',
             clickEvent : function(){
               that.downloadPicasaRSSImages(imgs_wrap);
             }
           });
        }

        that.addButton({
          class : 'raw_image_link',
            storage_key : 'dsg-show-open-images',
          text_ja : '元サイズの画像を開く',
          text_en : 'Open raw images',
          clickEvent : function(){
            that.openRawImage(ele_content);
          }
        });
      }

      // alert("!!!"); console.log(that.ele_buttons);
      ele_option.append(that.ele_buttons);
    });
    return false;
  }





  // Youtube動画ダウンロード用のURLを取得する 
/*
※AJAXを使うため、他ブラウザへの移植には注意
・AJAX(クロスドメイン)
・スクレイピング
・URLデコード
*/
/*
http://o-o.preferred.sonet-hnd1.v1.lscache3.c.youtube.com/generate_204?sparams=id,expire,ip,ipbits,itag,source,ratebypass,cp&fexp=907508,902314&itag=45&ip=115.0.0.0&signature=8238E6CA13A80DAD8DF1FFC32216A06749C6BE4F.68E165EF4A9AA4DAB1069D7216E0406AC437EE63&sver=3&ratebypass=yes&source=youtube&expire=1327456003&key=yt1&ipbits=8&cp=U0hRTFRQVF9FTUNOMV9MSlhBOi1BeEw4QTJ1V3Zy&id=bdf5f132fe1a7c1f&title=test
*/
  that.downloadVideo = function(ele_content){
    
    ele_content.each(function(){
      var url = $(this).attr('data-content-url');
      $.get(url, function(data){
        //console.log(data);
        var re_title = new RegExp('<meta name="title" content="([^"]*)">', 'i')
        var re_uri = new RegExp('img.src = "([^"]*)";', 'i');
        data.match(re_title);
        var title = RegExp.$1;
        data.match(re_uri);
        var uri = RegExp.$1;
        //console.log(title);
        //console.log(uri);
        uri = uri.replace(/\/[a-zA-Z0-9_]*\?/g, '/videoplayback?');
        uri = uri.replace(/%2C/g, ',');
        uri = uri.replace(/\\u0026/g, '&');
        uri = uri.replace(/\\/g, '');
        uri += '&title=' + title;
        console.log('youtube:' + uri);
        window.open(uri, 'dsg-dl-window0');
        return uri;
      });
    });
  }

  // URLをPicasaアルバムのURLに変換
  that.getPicasaAlbumData = function(url){
    var album_uri_dirs = url.split('/');

    var album_id_index = album_uri_dirs.length-2;
    var user_id_index  = album_id_index-2;

    var album_id = album_uri_dirs[album_id_index];
    var user_id  = album_uri_dirs[user_id_index];

    var data = {
      album_id : album_id,
      user_id : user_id
    };
    //console.dir(data);
    return data;
  }

  // Picasaアルバムダウンロード用のURLを取得する
  that.getPicasaAlbumDownloadURLs = function(ele_content){
    var urls = [];

    ele_content.each(function(){
      var url = ele_content.attr('href');
      var data = that.getPicasaAlbumData(url);

      var picasa_dl_url = 'picasa://downloadfeed/'
         + '?url=https://picasaweb.google.com/data/feed/back_compat'
         + '/user/' + data.user_id + '/albumid/' + data.album_id
         + '?kind=photo&alt=rss&imgdl=1';

      urls.push(picasa_dl_url);
    });
    urls = that.getUniqueArray(urls);
    return urls;
  }


  // PicasaRSSから通常ダウンロード用のURLを取得する
  that.getPicasaRSSURL = function(ele_content){
    var url = ele_content.attr('href');
    var data = that.getPicasaAlbumData(url);

    var picasa_rss_url = 'https://picasaweb.google.com/data/feed/base'
       + '/user/' + data.user_id + '/albumid/' + data.album_id;
    //console.dir('download...' + picasa_rss_url);
    return picasa_rss_url;
  }

  // PicasaRSSから画像をダウンロードする
  that.downloadPicasaRSSImages = function(ele_content){
    var url = that.getPicasaRSSURL(ele_content);

    var ele_picasa = $('<div>').text('picasa RSS DOM');
    $.ajax({
      type: 'GET', url: url, dataType: 'xml',
      success : function(xml){
        var ele_img_urls = $(xml).find('entry');
        var urls = [];
        ele_img_urls.each(function(i){
          var url = $("img", $(this).children("summary").text()).attr("src");
          urls.push(that.getRawImageDownloadURL(url));
        });
        that.download_all_use_link(urls);
      }
    });
  }

  that.download_all_use_link = function(urls, count) {
    count = count ? count : 1;
    var max_t = count == 1 ? 27 : 1;
    var speed = count == 1 ? 1000 : 5000;
    for (var i = 0; i < max_t; i++) {
      var url = urls.pop();
      if (!url) return ;
      that.download_use_link(url);
    }
    window.setTimeout(function() {
        that.download_all_use_link(urls, count++) }, max_t * speed);
  };

  that.download_use_link = function(url) {
    var mouse_m_evt = new MouseEvent("click", { ctrlKey: true });
    var id = "dsg-download_link_" + new Date().getTime();
    var download_link = $("<a id='" + id + "'>").attr("href", url);
    $("body").append(download_link);
    window.setTimeout(function() {
        document.getElementById(id).dispatchEvent(mouse_m_evt); }, 200);
  };

  that.getRawImageDownloadURL = function(url) {
    url = url.replace(/\/[swh][0-9]+\//i, '/d/');
    url = url.replace(/\/[swh][0-9]+-[op]\//i, '/d/');
    url = url.replace(/\/[swh][0-9]+-[swh][0-9]+\//i, '/d/');
    url = url.replace(/\/w[0-9]+-h[0-9]+-p\//, '/d/');
    url = url.replace(/\/w[0-9]+-h[0-9]+-o\//, '/d/');
    url = url.replace(/\/w[0-9]+-h[0-9]+-p-o\//, '/d/');
    url = url.replace(/=w\d+-h\d+/, '=d');
    return url;
  }

  // 元サイズ画像のURLを取得する (複数)
  that.getRawImageLinkURLs = function(ele_content){
    var urls = [];
    ele_content.each(function(){
      var ele_img = $(this);
      var img_url = "https:" + ele_img.attr('src');
      if(!img_url){
        return false;
      }
      
      var raw_img_url = img_url;
      raw_img_url = raw_img_url.replace(/\/[swh][0-9]+\//i, '/s0/');
      raw_img_url = raw_img_url.replace(/\/[swh][0-9]+-[swh][0-9]+\//i, '/s0/');
      raw_img_url = raw_img_url.replace(/\/[swh][0-9]+-[op]\//i, '/s0/');
      raw_img_url = raw_img_url.replace(/\/w[0-9]+-h[0-9]+-p\//, '/s0/');
      raw_img_url = raw_img_url.replace(/\/w[0-9]+-h[0-9]+-o\//, '/s0/');
      raw_img_url = raw_img_url.replace(/\/w[0-9]+-h[0-9]+-p-o\//, '/s0/');
      raw_img_url = raw_img_url.replace(/=w\d+-h\d+/, '=s0');
      urls.push(raw_img_url);
    });
    urls = that.getUniqueArray(urls);
    return urls;
  }

  // 元サイズ画像ダウンロード用のURLを取得する (複数)
  that.getRawImageDownloadURLs = function(ele_content){
    var urls = [];
    ele_content.each(function(){
      var ele_img = $(this);
      var img_url = "http:" + ele_img.attr('src');
      var raw_download_url = img_url;
      if(!img_url){
        return true;
      }
      raw_download_url = that.getRawImageDownloadURL(img_url);
/*
        // 正規表現を使わないパターン
        var uri_dirs = url.split('/');
        var file_name = uri_dirs.pop();
        uri_dirs.pop();
        var raw_download_url = uri_dirs.join('/') + '/d/' + file_name;
*/
      urls.push(raw_download_url);
    });

    urls = that.getUniqueArray(urls);
    return urls;
  }


  // Picasaアルバムをダウンロードする
  that.downloadPicasaAlbum = function(ele_content){
    var picasa_dl_urls = that.getPicasaAlbumDownloadURLs(ele_content);
    that.openWindowsHidden(picasa_dl_urls);
  }

  // 元サイズ画像を開く
  that.openRawImage = function(ele_content){
    var raw_img_urls = that.getRawImageLinkURLs(ele_content);
    that.openWindows(raw_img_urls);
  }

  // 元サイズ画像をダウンロードする
  that.downloadImages = function(ele_content){
    var raw_download_urls = that.getRawImageDownloadURLs(ele_content);
    that.openWindowsHidden(raw_download_urls);
  }


  // 画像を一括でダウンロードする
  // 負荷が高いため、確認ウィンドウを通してから起動
  that.downloadLumpImages = function(ele_content){
    var ele_content = ele_contentPane.find('div[data-content-url]');
    var raw_download_urls = that.getRawImageDownloadURLs(ele_content);
    that.openWindowsHidden(raw_download_urls);
  }



  // 画像一覧を表示する
  // 負荷が高いため、確認ウィンドウを通してから起動
  that.showImageList = function(){
    var ele_content = ele_contentPane.find('div[data-content-url]');
    var raw_download_urls = that.getRawImageDownloadURLs(ele_content);
    var ele_dl_list_panel = $('.dsg-dl-list-panel');
    if(ele_dl_list_panel.length){
      ele_dl_list_panel.remove();
    }

    var dialog_list_panel = $('<div>')
      .addClass('dsg-dl-list-panel');
    var dialog_list_btn_close = $('<div>')
      .addClass('dsg-close-button')
      .click(function(){
        dialog_list_panel.remove();
        return false;
      });
    var dialog_list = $('<ul>').addClass('dsg-dl-list');
  　for (var i=0; i<raw_download_urls.length; i++) {
      var thumb_img_url = raw_download_urls[i].replace(/\/d\//, '/w402/');

      var line = $('<li>');
      var a = $('<a>')
        .attr('href', raw_download_urls[i])
        .attr('target', 'dsg-dl-window0');
      var img_thumb = $('<img>')
        .attr('src', thumb_img_url);
      var img_big = img_thumb.clone();
      img_thumb
        .addClass('thumb');
      img_big
        .addClass('big');
      a
        .append(img_thumb)
        .append(img_big)
      line.append(a);
      dialog_list.append(line);
    }
    dialog_list_panel
      .prepend(dialog_list)
      .prepend(dialog_list_btn_close);
    ele_contentPane.prepend(dialog_list_panel);
  }


  // 確認ダイアログを表示する
  that.readyDialog = function(){
    var dialog_frame = $('<div>')
      .css({
        display: 'none'
      })
      .addClass('dsg-dl-dialog-frame');
    var dialog_mask = $('<div>')
      .addClass('dsg-dl-dialog-mask')
      .click(function(){
        that.hideDialog();
      });
    var dialog = $('<div>')
      .addClass('dsg-dl-dialog');

    var text;

    text = 'ストリーム上のすべての画像をダウンロードしますか？';
    if(!is_ja){
      text = 'Do you want to download all images on the stream?';
    }

    var dialog_dl_text = $('<div>')
      .addClass('dsg-dl-text')
      .html('<p>' + text +'</p>');
    var dialog_dl_btns = $('<ul>')

      .addClass('dsg-dl-buttons');
    var dialog_dl_ok = $('<li>')
      .addClass('dsg-dl-button')
      .addClass('dsg-dl-ok')
      .text('OK')
      .click(function(){
        that.hideDialog();
        that.downloadLumpImages();
      });
    var dialog_dl_cancel = $('<li>')
      .addClass('dsg-dl-button')
      .text('Cancel')
      .click(function(){
        that.hideDialog();
      });



    text = '画像一覧を表示しますか？';
    if(!is_ja){
      text = 'Do you want the image list?';
    }

    var dialog_list_text = $('<div>')
      .addClass('dsg-dl-text')
      .html('<p>' + text + '</p>');
    var dialog_list_btns = $('<ul>')
      .addClass('dsg-dl-buttons');
    var dialog_list_ok = $('<li>')
      .addClass('dsg-dl-button')
      .addClass('dsg-dl-ok')
      .text('OK')
      .click(function(){
        that.hideDialog();
        that.showImageList();
      });
    var dialog_list_cancel = $('<li>')
      .addClass('dsg-dl-button')
      .text('Cancel')
      .click(function(){
        that.hideDialog();
      });

    that.dialog_dsg_form = $('<form>')
      .addClass('dsg-form')
      .hide();
    
    that.dsg_menu_title = $('<div>')
      .addClass('dsg-menu-title')
      .text('DownloadSupport Setting')
      .click(function(){
        that.dialog_dsg_form.toggle();
      });
    // 各設定項目を順に追加
/*
    that.addCheckboxLabel({
      text_en : 'Show text on button.',
      text_ja : 'ボタン横のテキストを表示にする',
      storage_key : 'dsg-show-button-text',
      default_check : false,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });
*/

    that.addCheckboxLabel({
      text_en : 'Show fix right bottom switch.',
      text_ja : '右下固定の「DownloadSupport」スイッチを表示する',
      storage_key : 'dsg-show-dl-switch',
      default_check : true,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });

    that.addCheckboxLabel({
      text_en : 'Show button (Download Youtube video).',
      text_ja : '「Youtube動画をダウンロードする」を表示する',
      storage_key : 'dsg-show-dl-youtube',
      default_check : true,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });
    that.addCheckboxLabel({
      text_en : 'Show button (Download Picasa album).',
      text_ja : '「Picasaアルバムをダウンロードする」を表示する',
      storage_key : 'dsg-show-dl-picasa',
      default_check : true,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });
    that.addCheckboxLabel({
      text_en : 'Show button (Download raw images).',
      text_ja : '「元サイズの画像をダウンロードする」を表示する',
      storage_key : 'dsg-show-dl-images',
      default_check : true,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });
    that.addCheckboxLabel({
      text_en : 'Show button (Download all raw images).',
      text_ja : '「元サイズの画像を全てダウンロードする」を表示する',
      storage_key : 'dsg-show-dl-images-all',
      default_check : true,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });
    that.addCheckboxLabel({
      text_en : 'Show button (Open raw images).',
      text_ja : '「元サイズの画像を開く」を表示する',
      storage_key : 'dsg-show-open-images',
      default_check : true,
      changeEvent : function(that){
        that.checkHideButtonText();
      }
    });

    var attention_text = '(Effective from the next)';
    if(is_ja){
      attention_text = '(次回取得時から有効)';
    }
    that.dialog_dsg_form
      .append('<div>' + attention_text + '</div>');




    dialog_dl_btns
      .append(dialog_dl_ok)
      .append(dialog_dl_cancel);
    dialog_list_btns
      .append(dialog_list_ok)
      .append(dialog_list_cancel);
    dialog
      .append(dialog_dl_text)
      .append(dialog_dl_btns)
      .append(dialog_list_text)
      .append(dialog_list_btns)
      .append(that.dsg_menu_title)
      .append(that.dialog_dsg_form);
    dialog_frame
      .append(dialog)
      .append(dialog_mask);
    ele_body
      .append(dialog_frame);


  }

  that.showDialog = function(){
    $('div.dsg-dl-dialog-frame').show();
  }
  that.hideDialog = function(){
    $('div.dsg-dl-dialog-frame').hide();
  }

  // ユーザー設定でテキスト表示・非表示を変更
  that.checkHideButtonText = function(){
    if(localStorage.getItem('dsg-hide-text') == 'true'){
      ele_body
        .addClass('dsg-hide-text');
    } else {
      that.ele_buttons
      ele_body
        .removeClass('dsg-hide-text');
    }
    //console.log(localStorage.getItem('dsg-hide-text'));
  }

  // 汎用チェックボックス項目を追加する
  that.addCheckboxLabel = function(data){
    data = data || {
      text_en : 'Checkbox for debug.',
      text_ja : 'デバッグ用',
      storage_key : 'dsg-outside-close',
      default_check : true
    };

    //console.dir(data);
    var is_check = localStorage.getItem(data.storage_key);
    if(!is_check){
      localStorage.setItem(data.storage_key, data.default_check);
    }

    var text = data.text_en;
    if(is_ja){
      text = data.text_ja;
    }

    var ele_label = $('<label>')
      .text(text);
    var ele_checkbox = $('<input>')
      .attr('type', 'checkbox')
      .attr('data-dsg-storage-key', data.storage_key)
      .change(function(){
        that.ToggleStorage(data.storage_key);
        if(typeof data.changeEvent == 'function'){
          data.changeEvent(that);
        }
      });
    that.setCheckStorage(ele_checkbox, data.storage_key);
    ele_label
      .prepend(ele_checkbox);
    that.dialog_dsg_form
      .append(ele_label);
  }
  // 汎チェックボタンとStorage関連の共通機能
  that.setCheckStorage  = function(ele, storage_key){
    var val = localStorage.getItem(storage_key);
    if(val == 'true'){
      ele.attr('checked', 'checked');
    } else {
      ele.removeAttr('checked');
    }
    //console.log('set:' + storage_key +':'+ val);
  }

  // 汎チェックボタンとStorage関連の共通機能
  that.ToggleStorage  = function(storage_key){
    //var storage_key = ele.attr('data-dsg-fixed_scroll');
    var val = localStorage.getItem(storage_key);
    if(val == 'true'){
      val = false;
    } else {
      val = true;
    }
    localStorage.setItem(storage_key, val);
    console.log('change:' + storage_key +':'+ val);
  }


  // ダウンロード用窓を用意 (新規窓を開かせない)
  that.readyWindowHidden = function(){
    var dl_windows = $('<div>')
      .attr('id', 'dsg-dl-windows')
      .css({
        'display': 'none'
      });

    var dl_window_org = $('<iframe>')
      .addClass('dsg-dl-window');
    var dl_window;
    for(var i=0;i<20;i++){
      dl_window = dl_window_org.clone().attr('name', 'dsg-dl-window' + i);
      dl_windows.append(dl_window);
    }
    ele_body.append(dl_windows);
  }





// ここから汎用機能

  // 新規窓を開く
  that.openWindows = function(urls){
    for(var i=0;i<urls.length;i++){
      window.open(urls[i], '_blank');
    }
  }

  // 新規窓を開かずにダウンロード用URLへアクセスする
  that.openWindowsHidden = function(urls){
    for(var i=0;i<urls.length;i++){
      that.download_use_link(urls[i]);
    }
  }

　// クエリ文字列をハッシュに変換する
  that.convertQueryToHash = function(string){
    var values = [];
    var hash = {};
    var querys = string.split('&');
    for (var i = 0; i < querys.length; i ++) {
      values = querys[i].split('=');
      hash[values[0]] = values[1];
    }
    return hash;
  }

  // CSV文字列を配列に変換する
  that.convertCSVToArray = function(string){
    var values = [];
    var array = [];
    var querys = string.split(',');
    for (var i = 0; i < querys.length; i ++) {
      values = querys[i].split('=');
      array[i] = values[1];
    }
    return array;
  }

  // 配列から重複要素を除く
  that.getUniqueArray = function(array){
    var storage = {};
    var uniqueArray = [];
    var i,value;
    for ( i=0; i<array.length; i++){
      value = array[i];
        if (!(value in storage)) {
          storage[value] = true;
          uniqueArray.push(value);
       }
    }
    return uniqueArray;
  }

  // 最初の1回だけ準備
  that.readyDialog();
  that.readyWindowHidden();
  that.checkHideButtonText();
  return this;
}


$(function(){
  var picasa_earth = new PicasaEarth();
  console.log("!!! PicasaEarth")

  $('.kqngbc').on('mouseover', selecter.post_panel, function() {
    picasa_earth.addButtons($(this));
  }).on('click', selecter.post_panel, function() {
    picasa_earth.addButtons($(this));
  });
});
