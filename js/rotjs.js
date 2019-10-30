
	(function ($) {
        /**
         * @param {Object} options
         * @param {Array}  options.list  存储奖品的的列表，example [{1:{name:'谢谢参与',image:'1.jpg'}}]
         * @param {Object} options.outerCircle {color:'#df1e15'} 外圈颜色，默认红色
         * @param {Object} options.innerCircle {color:'#f4ad26'} 里圈颜色，默认黄色
         * @param {Array}  options.dots ['#fbf0a9', '#fbb936'] 装饰点颜色 ，默认深黄浅黄交替
         * @param {Array}  options.disk ['#ffb933', '#ffe8b5', '#ffb933', '#ffd57c', '#ffb933', '#ffe8b5', '#ffd57c'] 中心奖盘的颜色，默认7彩
         * @param {Object} options.title {color:'#5c1e08',font:'19px Arial'} 奖品标题颜色
         */
        $.fn.WheelSurf = function (options) {
            var _default = {
                outerCircle: {
                    color: '#df1e15'
                },
                innerCircle: {
                    color: '#f4ad26'
                },
                dots: ['#fbf0a9', '#fbb936'],
                disk: ['#ffb933', '#ffe8b5', '#ffb933', '#ffd57c', '#ffb933', '#ffe8b5', '#ffd57c'],
                title: {
                    color: '#5c1e08',
                    font: '19px Arial'
                }
            }
            $.extend(_default, options)
            // 画布中心移动到canvas中心
            var _this = this[0],
                width = _this.width,
                height = _this.width,
                ctx = _this.getContext("2d"),
                imgs = [],
                awardTitle = [],
                awardPic = [];
            for (var item in _default.list) {
                awardTitle.push(_default.list[item].name)
                imgs.push(_default.list[item].image)
            }
            var num = imgs.length
            // 圆心
            var x = width / 2
            var y = height / 2
            ctx.translate(x, y)
    
            return {
                init: function (angelTo) {
                    angelTo = angelTo || 0;
    
                    ctx.clearRect(-this.width, -this.height, this.width, this.height);
    
                    // 平分角度
                    var angel = (2 * Math.PI / 360) * (360 / num);
                    var startAngel = 2 * Math.PI / 360 * (-90)
                    var endAngel = 2 * Math.PI / 360 * (-90) + angel
    
                    // 旋转画布
                    ctx.save()
                    ctx.rotate(angelTo * Math.PI / 180);
                    // 画外圆
                    ctx.beginPath();
                    ctx.lineWidth = 25;
                    ctx.strokeStyle = _default.outerCircle.color;
                    ctx.arc(0, 0, 243, 0, 2 * Math.PI)
                    ctx.stroke();
                    // 画里圆
                    ctx.beginPath();
                    ctx.lineWidth = 23;
                    ctx.strokeStyle = _default.innerCircle.color;
                    ctx.arc(0, 0, 218, 0, 2 * Math.PI)
                    ctx.stroke();
    
                    // 装饰点
                    var dotColor = _default.dots
                    for (var i = 0; i < 12; i++) {
                        // 装饰点 圆心 坐标计算
                        ctx.beginPath();
                        var radius = 230;
                        var xr = radius * Math.cos(startAngel)
                        var yr = radius * Math.sin(startAngel)
    
                        ctx.fillStyle = dotColor[i % dotColor.length]
                        ctx.arc(xr, yr, 11, 0, 2 * Math.PI)
                        ctx.fill()
    
                        startAngel += (2 * Math.PI / 360) * (360 / 12);
    
                    }
                    // 画里转盘                
                    var colors = _default.disk
                    for (var i = 0; i < num; i++) {
                        ctx.beginPath();
                        ctx.lineWidth = 208;
                        ctx.strokeStyle = colors[i % colors.length]
                        ctx.arc(0, 0, 104, startAngel, endAngel)
                        ctx.stroke();
                        startAngel = endAngel
                        endAngel += angel
                    }
                    // 添加奖品
                    function loadImg() {
    
                        var dtd = $.Deferred()
                        var countImg = 0
                        if (awardPic.length) {
                            return dtd.resolve(awardPic);
                        }
                        for (var i = 0; i < num; i++) {
                            var img = new Image()
                            awardPic.push(img)
    
                            img.src = imgs[i]
                            img.onload = function () {
                                countImg++
                                if (countImg == num) {
                                    dtd.resolve(awardPic);
                                }
                            }
                        }
                        return dtd.promise()
                    }
    
                    $.when(loadImg()).done(function (awardPic) {
    
                        startAngel = angel / 2
                        for (var i = 0; i < num; i++) {
                            ctx.save();
                            ctx.rotate(startAngel)
                            ctx.drawImage(awardPic[i], -48, -48 - 130);
                            ctx.font = _default.title.font;
                            ctx.fillStyle = _default.title.color
                            ctx.textAlign = "center";
                            ctx.fillText(awardTitle[i], 0, -170);
                            startAngel += angel
                            ctx.restore();
                        }
                    })
                    ctx.restore();
                },
                /**
                 * @param angel 旋转角度
                 * @param callback 转完后的回调函数
                 */
                lottery: function (angel, callback) {
                    angel = angel || 0
                    angel = 360 - angel
                    angel += 720
                    // 基值（减速）
                    var baseStep = 30
                    // 起始滚动速度
                    var baseSpeed = 0.5
                    // 步长
                    var count = 100;
                    var _this = this
                    var timer = setInterval(function () {
    
                        _this.init(count)
                        if (count == angel) {
                            clearInterval(timer)
                            if (typeof callback == "function") {
                                callback()
                            }
                        }
                        count = count + baseStep * (((angel - count) / angel) > baseSpeed ? baseSpeed : ((angel - count) / angel))
                        if (angel - count < 0.5) {
                            count = angel
                        }
    
                    }, 25)
                }
            }
    
        }
    }(jQuery))
    
    //创建dom
    $(function () {
        if ($('#rotlay').length > 0) {
            $('#rotlay').append('<canvas id="rotcan" width="' + $('#rotlay').width() + '" height="' + $('#rotlay').width() + '" class="rotcanvas" style="border:1px solid #d3d3d3;">当前浏览器版本过低，请使用其他浏览器尝试</canvas><img src="images/start.png" id="start" class="btn" style="width:'+($('#rotlay').width()/4)+'px;top:'+(($('#rotlay').width()-$('#rotlay').width()/4)/2)+'px;left:'+(($('#rotlay').width()-$('#rotlay').width()/4)/2)+'px"><div id="message"></div>');
        }
        var wheelSurf;
        // 初始化装盘数据 正常情况下应该由后台返回
        var initData = {
            "success": true,
            "list": [{
                "id": 100,
                "name": "5000元京东卡",
                "image": "images/1.png",
                "rank": 1,
                "percent": 3
            },
            {
                "id": 101,
                "name": "1000元京东卡",
                "image": "images/2.png",
                "rank": 2,
                "percent": 5
            },
            {
                "id": 102,
                "name": "100个比特币",
                "image": "images/3.png",
                "rank": 3,
                "percent": 2
            },
            {
                "id": 103,
                "name": "50元话费",
                "image": "images/4.png",
                "rank": 4,
                "percent": 49
            },
            {
                "id": 104,
                "name": "100元话费",
                "image": "images/5.png",
                "rank": 5,
                "percent": 30
            },
            {
                "id": 105,
                "name": "500个比特币",
                "image": "images/6.png",
                "rank": 6,
                "percent": 1
            },
            {
                "id": 106,
                "name": "500元京东卡",
                "image": "images/7.png",
                "rank": 7,
                "percent": 10
            }
            ]
        }
    
        // 计算分配获奖概率(前提所有奖品概率相加100%)
        function getGift() {
            var percent = Math.random() * 100
            var totalPercent = 0
            for (var i = 0, l = initData.list.length; i < l; i++) {
                totalPercent += initData.list[i].percent
                if (percent <= totalPercent) {
                    return initData.list[i]
                }
            }
        }
    
        var list = {}
    
        var angel = 360 / initData.list.length
        // 格式化成插件需要的奖品列表格式
        for (var i = 0, l = initData.list.length; i < l; i++) {
            list[initData.list[i].rank] = {
                id: initData.list[i].id,
                name: initData.list[i].name,
                image: initData.list[i].image
            }
        }
        // 查看奖品列表格式
    
        // 定义转盘奖品
        wheelSurf = $('#rotcan').WheelSurf({
            list: list, // 奖品 列表，(必填)
            outerCircle: {
                color: '#df1e15' // 外圈颜色(可选)
            },
            innerCircle: {
                color: '#f4ad26' // 里圈颜色(可选)
            },
            dots: ['#fbf0a9', '#fbb936'], // 装饰点颜色(可选)
            disk: ['#ffb933', '#ffe8b5', '#ffb933', '#ffd57c', '#ffb933', '#ffe8b5', '#ffd57c'], //中心奖盘的颜色，默认7彩(可选)
            title: {
                color: '#5c1e08',
                font: '19px Arial'
            } // 奖品标题样式(可选)
        })
    
        // 初始化转盘
        wheelSurf.init()
        // 抽奖
        var throttle = true;
        $("#start").on('click', function () {
    
            var winData = getGift() // 正常情况下获奖信息应该由后台返回
    
            $("#message").html('')
            if (!throttle) {
                return false;
            }
            throttle = false;
            var count = 0
            // 计算奖品角度
    
            for (const key in list) {
                if (list.hasOwnProperty(key)) {
                    if (winData.id == list[key].id) {
                        break;
                    }
                    count++
                }
            }
    
            // 转盘抽奖，
            wheelSurf.lottery((count * angel + angel / 2), function () {
                $("#message").html(winData.name)
                throttle = true;
            })
        })
    
    });