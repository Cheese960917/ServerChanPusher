# ServerChanPusher
 Server Chan Pusher

> 感谢 [Server酱](http://sc.ftqq.com/3.version)
> 系统要求: `Java 8`, `ElasticSearch 7.*`, `Nodejs 12.*`
> 整个项目基于Nodejs和es，哪个平台都一样

## 介绍
这是一个做着玩的项目，主要是给我自己用的，权当练手

原本打算用Spring来写后端，不过考虑到项目体量压根没那么大，本着偷懒的原则，拿Nodejs写了

这是一个学了Nodejs不超过一周的人的产物，所以别对质量抱什么期待~

数据库也本着省事的原则，用ES

（其实ES不要也行，就是得把相关代码都删了，我写的时候没搞成那种可以直接拆掉这个模块的结构，所以要删可能得删好几处）
**写这个项目的原因：**
前几天买了个云服务器，因为穷所以只有2G内存……

然后最近我又发现我老忙得忘事情，就打算搞个给我的微信推消息的程序，

为此我相中了 [Server酱](http://sc.ftqq.com/3.version)

但单用Server酱功能不多，于是我自己整成了一个服务端的项目，整理请求再转发给Server酱，来实现自己的需求

换成Spring + Mysql我实在不确定那个服务器能不能坚持住，事实证明nodejs + es跑起来内存占了94%……也许我可以改下es的内存配置，不过这是我自己的事情了

顺便，很抱歉npm的包好像顺手上传上来了……可能会增加一些下载压力，下次提交时再去掉吧

## 使用方式
安装nodejs
运行es（这里没有！）
双击cd.bat
```
cnpm install
start.bat
```

## 接口
1. `/user/login` 
登录，post，body举例： 
``` json
"user_name":"aabb", "user_pw":"wdnmd"
```
返回时会有一个token，添加任务要用到。

2. `/user/register/check`
查看是否注册过，需要 `user_name`

3. `/user/register`
注册，需要用户名密码，同登录

4. `/user/checkin` 
检查是否在线，需要 `user_name` 和 `user_uid` 自己用可以无视

5. `/job/add` 
添加任务，json的key如下：

`user_name` 必须

`user_uid` 必须，token

`user_key` 必须，这个key是server酱提供的

`job_text` 必须，消息标题

`job_desp` 不是必须，消息内容

`job_schedule` 不是必须，消息发送周期

`job_cron` 不是必须，消息发送cron语句，具体google

`job_delay` 不是必须，消息延时

`job_pubdate` 不是必须，如果前端没给后端会自己加一个，日期

`job_pubtime` 不是必须，理论上是时间戳

`job_timeout` 如果有定时任务，这个就是必须的，最好不要添加不会取消永远在运行的任务，因为服务端不负责持久化，所以没有接口用来关闭这些任务

6. `/job/history`
查看历史记录，需要和checkin一样的信息
