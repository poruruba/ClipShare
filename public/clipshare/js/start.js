'use strict';

//const vConsole = new VConsole();
//window.datgui = new dat.GUI();

var vue_options = {
    el: "#top",
    mixins: [mixins_bootstrap],
    data: {
        dialog_input: {},
        base_url: "",
        apikey: "",
        payload: "",
        message: "",
    },
    computed: {
    },
    methods: {
        clipshare_get: async function(){
            try{
                this.message = "";
                var json = await do_post_with_apikey(this.base_url + "/clipshare-get", {}, this.apikey);
                if( json.clip ){
                    this.payload = json.clip.text;
                    await this.clip_copy(this.payload);
                    this.message = "DOWNLOAD created_at " + new Date(json.clip.created_at).toLocaleString( 'ja-JP', {} );
                }else{
                    this.message = "NO Clip Data";
                }
            }catch(error){
                alert(error);
            }
        },
        clipshare_set: async function(){
            try{
                this.message = "";
                var params = {
                    text: this.payload
                };
                await do_post_with_apikey(this.base_url + "/clipshare-set", params, this.apikey);
                this.message = "UPLOAD at " + new Date().toLocaleString( 'ja-JP', {} );
            }catch(error){
                alert(error);
            }
        },
        clipshare_paste: async function(){
            this.payload = await this.clip_paste();
            this.message = "clipboard PASTE";
        },
        clipshare_copy: async function(){
            await this.clip_copy(this.payload);
            this.message = "clipboard COPY";
        },
        clipshare_clear: function(){
            this.message = "";
            this.payload = "";
        },
        set_apikey: function(){
            this.dialog_input = {
                base_url: this.base_url || "",
                apikey: this.apikey || ""
            };
            this.dialog_open('#apikey_dialog');
        },
        apkey_update: function(){
            localStorage.setItem("base_url", this.dialog_input.base_url);
            localStorage.setItem("apikey", this.dialog_input.apikey);
            this.dialog_close('#apikey_dialog');
            alert('設定しました。リロードしてください。');
        }
    },
    created: function(){
    },
    mounted: async function(){
        proc_load();
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(async (registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch((err) => {
                console.log('ServiceWorker registration failed: ', err);
            });
        }

        this.base_url = localStorage.getItem('base_url');
        this.apikey = localStorage.getItem('apikey');
        if( this.apikey ){
            switch(searchs.cmd){
                case 'clip2upload':{
                    this.payload = await this.clip_paste();
                    await this.clipshare_set();
                    alert('クリップボードをアップロードしました。');
                    window.close();
                    break;
                }
                case 'download2clip':{
                    await this.clipshare_get()
                    alert('ダウンロードしてクリップボードにコピーしました。');
                    window.close();
                    break;
                }
                default:{
                    this.clipshare_get();
                    break;
                }
            }
        }else{
           setTimeout( () =>{
                alert('API Keyを指定してください。');
            }, 0);
        }
    }
};
vue_add_data(vue_options, { progress_title: '' }); // for progress-dialog
vue_add_global_components(components_bootstrap);
vue_add_global_components(components_utils);

/* add additional components */
  
window.vue = new Vue( vue_options );

function do_post_with_apikey(url, body, apikey) {
    const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "X-API-KEY": apikey });
  
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers
    })
    .then((response) => {
      if (!response.ok)
        throw 'status is not 200';
      return response.json();
  //    return response.text();
  //    return response.blob();
  //    return response.arrayBuffer();
    });
  }
