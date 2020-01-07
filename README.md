# IScroll-pro

> `iscroll-pro` 是基于 `iscroll-probe.js` 封装的包含 `下拉刷新` 和 `上拉加载更多` 功能的插件

>更多配置，请参考 `IScroll 5` 相关中文文档：http://caibaojian.com/iscroll-5/

- ### Usage

>html
```html
<head>
    <!-- ... -->

    <!-- 引入对应 css，本地dev 或 build 时会自动将 less 目录下的 less文件 转译为 css文件并移动到css生成目录，故直接以 css/目录下 引用即可 -->
    <link rel="stylesheet" href="css/iscroll-pro.css">
</head>
<body>

    <!-- ... -->

    <!-- 最基本的使用结构，且 wrapper 的唯一子元素 ul（可以不为 ul>li 的结构，但只能有一个子元素） 为滚动内容 -->
    <div id="wrapper">
        <ul id="scroller">
            <li>Pretty row 1</li>
            <li>Pretty row 2</li>
            <li>Pretty row 3</li>
            <li>Pretty row 4</li>
            <li>Pretty row 5</li>
            <li>Pretty row 6</li>
            <li>Pretty row 7</li>
            <li>Pretty row 8</li>
            <li>Pretty row 9</li>
            <li>Pretty row 10</li>
        </ul>
    </div>

    
</body>
```

>css
```css

html, body {
    -ms-touch-action: none;
    height: 100%;
    /* this is important to prevent the whole page to bounce */
    overflow: hidden;
}

#wrapper {
    /* 纵向滚动容器需要高度 */
    height: calc(100% - 136px); 
    overflow: hidden;
    position: relative;
}

#scroller {
    /* position: absolute; */
    /* z-index: 1; */
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    /* width: 100%; */
    -webkit-transform: translateZ(0);
    -moz-transform: translateZ(0);
    -ms-transform: translateZ(0);
    -o-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-text-size-adjust: none;
    -moz-text-size-adjust: none;
    -ms-text-size-adjust: none;
    -o-text-size-adjust: none;
    text-size-adjust: none;
}

```

>js
```js

// 引入 iscroll.pro.js 
<script type="text/javascript" src="lib/iscroll-pro.js"></script>
<script type="text/javascript">

    var myScroll;

    // 滑动事件
    function _onScroll() {
        // console.log("%c scrolling：", "color:green", "当前滑动位置：", this.y);
    }
    // 滚动结束事件
    function _onScrollEnd() {
        // console.log("%c 滑动结束 已滑动距离距离：", "color:red", this.y, "最大滑动距离：", this.maxScrollY);
    }

    document.body.onload = function () {
        myScroll = new IScroll('#wrapper', {
            probeType: 3,
            mouseWheel: true,

            // 如下选项若不填，皆为默认值
            showRefreshStatus: true, // 是否显示开启下拉刷新
            // 使用 iscroll.pro.less 文件中 loader-0* 的类即可修改 loading 动画效果。动画类型效果请参考 https://wow.techbrood.com/fiddle/29490
            refreshAniClass: "loader-01", // 刷新 loading 时的动画类名
            showLoadMoreStatus: true, // 是否开启上拉加载更多
            loadMoreAniClass: "loader-02", // 加载更多 loading 时的动画类名
            
            // loading 时，type：1下拉刷新、2上拉加载更多
            loadingFn: function (bounce, type) {

                // 模拟异步数据加载...
                setTimeout(function () {

                    // ...request


                    // ！！！务必在数据加载处理完成后手动调用回滚！！！
                    bounce();
                }, 3000);
            }
        });
        myScroll.on('scroll', _onScroll);
        myScroll.on('scrollEnd', _onScrollEnd);
    }
</script>

```

***

- ### Build

```bat

$ yarn dev     本地开发环境启动   

$ yarn build   打包，生成的 dist 目录即为完整文件，可直接部署

```

说明：
>当前目录下都为源码，build 之后 `iscroll-pro.js` 和 `iscroll-pro.css` 会变成压缩文件，可用于线上环境