;
(function ($) {

    var Carousel = function (poster) {
        var self = this;
        // 保存单个旋转木马对象
        this.poster = poster;  // 首先绑定到对象上面作为一个属性,方便下面使用
        this.posterItemMain = poster.find("ul.poster-list");  // 找到ul
        this.nextBtn = poster.find("div.poster-next-btn");  // 切换按钮
        this.prevBtn = poster.find("div.poster-prev-btn");
        this.posterItems = poster.find("li.poster-item"); // 幻灯片的集合
        if (this.posterItems.size() % 2 == 0) {
            this.posterItemMain.append(this.posterItems.eq(0).clone());
            this.posterItems = this.posterItemMain.children();
        }

        this.posterFirstItem = this.posterItems.first();  // 第一帧图片
        this.posterLastItem = this.posterItems.last();
        this.rotateFlag = true;
        // 默认配置参数
        this.setting = {
            "width": 1000,			// 幻灯片的宽度
            "height": 270,		   // 幻灯片的高度,传高度的原因是要先初始化位置,不用等图片加载完在获取高度
            "posterWidth": 640,	  // 幻灯片第一帧的宽度 方便求其他图片的排列位置 (图片的真实宽度)
            "posterHeight": 270, // 幻灯片第一帧的高度
            "scale": 0.9,		// 记录显示比例关系 (其他图片根据前一张图片的宽高的90%显示)
            "speed": 500,      // 切换速度 (500毫秒)
            "autoPlay": false,
            "delay": 5000,
            "verticalAlign": "middle" // top bottom 对齐方式
        };

        // 如果已经配置了自定义的参数就使用自定义的,没有的话就使用默认配置参数
        $.extend(this.setting, this.getSetting());

        // 设置配置参数值
        this.setSettingValue();

        // 设置剩余的帧的位置关系
        this.setPosterPos();

        //左旋转按钮
        this.nextBtn.click(function () {
            if (self.rotateFlag) {
                self.rotateFlag = false;
                self.carouseRotate("left");
            }

        });
        //右旋转按钮
        this.prevBtn.click(function () {
            if (self.rotateFlag) {
                self.rotateFlag = false;
                self.carouseRotate("right");
            }

        });
        //是否开启自动播放
        if (this.setting.autoPlay) {
            this.autoPlay();
            this.poster.hover(function () {
                window.clearInterval(self.timer);
            }, function () {
                self.autoPlay();
            });

        }

    };

    Carousel.prototype = {
        autoPlay: function () {
            var self = this;
            this.timer = window.setInterval(function () {
                self.nextBtn.click();
            }, this.setting.delay);

        },

        // 旋转
        carouseRotate: function (dir) {
            var _this_ = this;
            var zIndexArr = [];
            // 左旋转
            if (dir === "left") {
                this.posterItems.each(function () {
                    var self = $(this),
                        prev = self.prev().get(0) ? self.prev() : _this_.posterLastItem,
                        width = prev.width(),
                        height = prev.height(),
                        zIndex = prev.css("zIndex"),
                        opacity = prev.css("opacity"),
                        left = prev.css("left"),
                        top = prev.css("top");
                    zIndexArr.push(zIndex);
                    self.animate({
                        width: width,
                        height: height,
                        //zIndex:zIndex,
                        opacity: opacity,
                        left: left,
                        top: top
                    }, _this_.setting.speed, function () {
                        _this_.rotateFlag = true;
                    });
                });
                //zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
                this.posterItems.each(function (i) {
                    $(this).css("zIndex", zIndexArr[i]);
                });
            } else if (dir === "right") {//右旋转
                this.posterItems.each(function () {
                    var self = $(this),
                        next = self.next().get(0) ? self.next() : _this_.posterFirstItem,
                        width = next.width(),
                        height = next.height(),
                        zIndex = next.css("zIndex"),
                        opacity = next.css("opacity"),
                        left = next.css("left"),
                        top = next.css("top");
                    zIndexArr.push(zIndex);
                    self.animate({
                        width: width,
                        height: height,
                        //zIndex:zIndex,
                        opacity: opacity,
                        left: left,
                        top: top
                    }, _this_.setting.speed, function () {
                        _this_.rotateFlag = true;
                    });

                });
                //zIndex需要单独保存再设置，防止循环时候设置再取的时候值永远是最后一个的zindex
                this.posterItems.each(function (i) {
                    $(this).css("zIndex", zIndexArr[i]);
                });
            }

        },

        // 设置剩余的帧的位置关系
        setPosterPos: function () {
            var self = this;
            var sliceItems = this.posterItems.slice(1),  // 获取剩余的li(帧)  从第一帧开始剩余的截取出来
                sliceSize = sliceItems.length / 2, // 原来个数的一半
                rightSlice = sliceItems.slice(0, sliceSize), // 右边剩余的个数  从0开始截取原来个数的一半
                level = Math.floor(this.posterItems.size() / 2),
                leftSlice = sliceItems.slice(sliceSize);

            // 设置右边帧的位置关系和宽度高度top
            var rw = this.setting.posterWidth,
                rh = this.setting.posterHeight,
                gap = ((this.setting.width - this.setting.posterWidth) / 2) / level;

            var firstLeft = (this.setting.width - this.setting.posterWidth) / 2;
            var fixOffsetLeft = firstLeft + rw;
            // 设置右边位置关系
            rightSlice.each(function (i) {
                level--;
                rw = rw * self.setting.scale;
                rh = rh * self.setting.scale;
                var j = i;
                $(this).css({
                    zIndex: level,
                    width: rw,
                    height: rh,
                    opacity: 1 / (++j),
                    left: fixOffsetLeft + (++i) * gap - rw,
                    top: self.setVerticalAlign(rh)
                });
            });
            //设置左边的位置关系
            var lw = rightSlice.last().width(),
                lh = rightSlice.last().height(),
                oloop = Math.floor(this.posterItems.size() / 2);
            leftSlice.each(function (i) {
                $(this).css({
                    zIndex: i,
                    width: lw,
                    height: lh,
                    opacity: 1 / oloop,
                    left: i * gap,
                    top: self.setVerticalAlign(lh)
                });
                lw = lw / self.setting.scale;
                lh = lh / self.setting.scale;
                oloop--;
            });
        },
        //设置垂直排列对齐
        setVerticalAlign: function (height) {
            var verticalType = this.setting.verticalAlign,
                top = 0;
            if (verticalType === "middle") {
                top = (this.setting.height - height) / 2;
            } else if (verticalType === "top") {
                top = 0;
            } else if (verticalType === "bottom") {
                top = this.setting.height - height;
            } else {
                top = (this.setting.height - height) / 2;
            }

            return top;
        },

        // 设置配置参数值去控制基本的宽度高度
        setSettingValue: function () {
            // 设置整个幻灯片区域的宽度高度
            this.poster.css({
                width: this.setting.width,
                height: this.setting.height
            });

            // 设置ul的宽度高度与幻灯片一样
            this.posterItemMain.css({
                width: this.setting.width,
                height: this.setting.height
            });

            // 计算上下切换按钮的宽度 (整个幻灯片的宽度-第一帧的宽度) / 2
            var w = (this.setting.width - this.setting.posterWidth) / 2;

            // 设置切换按钮的宽高，层级关系
            this.nextBtn.css({
                width: w,
                height: this.setting.height,  // 高度就等于幻灯片区域的高度
                zIndex: Math.ceil(this.posterItems.size() / 2)  // 幻灯片的总数 / 2 然后向上取整 zIndex为最高层级
            });
            this.prevBtn.css({
                width: w,
                height: this.setting.height,
                zIndex: Math.ceil(this.posterItems.size() / 2)
            });

            // 设置幻灯片第一帧的位置
            this.posterFirstItem.css({
                width: this.setting.posterWidth,
                height: this.setting.posterHeight,
                left: w,  /* left值就是切换按钮的宽度 */
                top: 0,
                zIndex: Math.floor(this.posterItems.size() / 2) // 幻灯片的总数 / 2 然后向下取整,因为zIndex是从0开始的
            });
        },

        // 获取人工配置参数
        getSetting: function () {
            var setting = this.poster.attr("data-setting"); // 获取自定义节点属性
            if (setting && setting != "") {
                return $.parseJSON(setting);
            }
            return {};
        }

    };

    // 初始化页面中的集合
    Carousel.init = function (posters) {
        var _this = this;
        posters.each(function () {
            new _this($(this));
        });
    };

    // 由于自身是个闭包,在外部无法访问到,所以挂在到window对象上
    window["Carousel"] = Carousel;

})(jQuery);