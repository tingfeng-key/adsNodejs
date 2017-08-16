/**
 * Created by tingfeng on 2017/6/2.
 */
'use strict';
let options,
    request = require('request');
let mysql = require('mysql');
let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database:'ads',
    port: 3306
});
conn.connect();
function showMiniTime()
{
    var now=new Date();
    var year=now.getYear();
    var month=now.getMonth();
    var day=now.getDate();
    var hours=now.getHours();
    var minutes=now.getMinutes();
    var seconds=now.getSeconds();
    // 时间
    return ""+year+"-"+month+"-"+day+"";
}
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
                    var reg = /('|")(http:\/\/|https:\/\/)(.*)('|");/gi;
                    var urls = data.match(reg);
                    for(var i = 0; i < urls.length; i++){
                        option.url = urls[i].replace("';", '').replace("'", '');
                        console.log(option.url);
                        curlMap.requests(option, function (e, r, d) {
                            if (!e && r.statusCode == 200) {
                                console.log("完成");
                            }else{
                                console.log(e);
                            }
                        });
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
        let sql1 = 'SELECT agent FROM user_agents ORDER BY rand() LIMIT 1';
        conn.query(sql1, function(er, res) {
            if (er){
                throw er;
            }
            let userAgent = JSON.parse(JSON.stringify(res[0]));
            send(ips.ip_start, userAgent.agent);
        });
    });
}
function send(ip, userAgent) {
    let curl = curlMap;
    curl.requestUrl = 'http://f.workbizs.com/g.jsp?uid=17220';
    curl.requestIp = ip;
    curl.referer = 'http://mv.22st.top';
    curl.userAgent = userAgent;
    curl.init();
}


for(let i = 0; i < 1000; i++)
{
    getIp();
}
getIp();