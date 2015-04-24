微信控件相关后台配置

1.解压，把root目录下的文件放到服务器的www根目录，并修改weixin/php/json_config.php
  改成公众号自己的

  $appID = "wxe6b8c34ca11806f5";
  $appSecret = "e2acb61a82ed3e86075c89273508f1d0";

2.在微信公众号的JSSDK安全域中加上服务器的域名
