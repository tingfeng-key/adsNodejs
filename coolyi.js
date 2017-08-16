/**
 * Created by tingfeng on 2017/5/13.
 */
'use strict';
let options,
    request = require('request');
let mysql = require('mysql');
let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database:'laravel',
    port: 3306
});
conn.connect();
var curlMap = {
    requestUrl: '',//请求地址
    requestMethod: 'get',//请求方式
    requestIp: '',
    referer: '',
    userAgent: '',
    options: {},
    ininOption: function () {
        this.options = {
            headers: {
                'X-FORWARDED-FOR': this.requestIp,
                'CLIENT-IP': this.requestIp,
                'Referer': this.referer,
                'User-Agent': this.userAgent
            },
            url: this.requestUrl,
            method: this.requestMethod
        }
    },
    init: function()
    {
        this.ininOption();
        let option = this.options;
        (function(){
            curlMap.requests(option, function(error, res, data){
                if (!error && res.statusCode == 200) {
                    var reg = /('|")(http:\/\/|https:\/\/)(.*?)('|")/gi;
                    var urls = data.match(reg);
                    if(urls != null)
                    {
                        option.url = urls[0].replace(/"|'/gi, '');
                        curlMap.requests(option, function(er,re,da){
                            if (!er && re.statusCode == 200) {
                                console.log('yes');
                            }else{
                                //console.log(option.url,da);
                            }
                        })
                    }

                }else{
                    console.log("错误", error);
                }
            });
        })(option);
    },
    requests: function (o, c) {
        request(o, c);
    }
}

function getIp()
{
    let sql = 'SELECT ip_start FROM ips ORDER BY rand() LIMIT 1';
    conn.query(sql, function(err, result) {
        if (err){
            console.log(err);
            throw err;
        }
        let ips = JSON.parse(JSON.stringify(result[0]))
        let sql1 = 'SELECT agent FROM user_agents WHERE `is_mobile`=1 ORDER BY rand() LIMIT 1';
        conn.query(sql1, function(er, res) {
            if (er){
                throw er;
            }
            let userAgent = JSON.parse(JSON.stringify(res[0]));
            //console.log(userAgent);
            send(ips.ip_start, userAgent.agent);
        });
    });
}
function send(ip, userAgent) {
    let curl = curlMap;
    curl.requestUrl = 'http://m.lflili.com/1491';
    curl.requestIp = ip;
    curl.referer = 'http://mv.22st.top';
    curl.userAgent = userAgent;
    curl.init();
}

var date = new Date(),
    h = date.getHours(),
    loopNum = 0, rand = 0;
if(h == 23 ){
    loopNum = 12;
    rand = 0.6;
}else if(h >= 0 && h <= 6)
{
    loopNum = 5;
    rand = 0.8;
}else {
    loopNum = 50;
    rand = 0.3;
}
for(let i = 0; i < loopNum; i++)
{
    if(Math.random() >= rand)
    {
        getIp();
    }
}

//getIp();
