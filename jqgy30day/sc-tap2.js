// 存储已显示的书签
let displayedBookmarks = new Set();

// 关键词跳转映射表 - 改为明文
const keywordRedirects = {
   /*  "临渠2015": "sc2015.html",
    "临渠2007": "sc2007.html",
    "临渠县金桂": "临渠县.html",
    "福叁咖啡": "fu3coffee.html",
    "奇闻异事馆": "qwysg.html",
    "音乐盒": "音乐盒.html", */
    "कालचक्रमण्डल": "mandala.html",
    /* "反舌鸟": "https://www.sohu.com/a/544430408_121124720",
    "杀死一只知更鸟": "https://baike.baidu.com/item/%E6%9D%80%E6%AD%BB%E4%B8%80%E5%8F%AA%E7%9F%A5%E6%9B%B4%E9%B8%9F/18840603",
    "伯劳鸟": "https://baike.baidu.com/item/%E4%BC%AF%E5%8A%B3/6568655",
    "秦砚秋博客": "qinyanqiu-blog.html", */
   /*  "博客网": "blog.html",
    "中心广场": "中心广场.html",
    "深南市桥安区": "qiaoanqu.html",
    "好邻居百货超市": "supermarket.html",
    "好邻居24h百货超市": "supermarket.html",
    "论坛": "forum.html",
    "乔静": "qiaojing.html",
    "月氏辅星": "星象.html",
    "顾青娥": "咕咕e录音.html",
    "林墨和Q": "乔林视频.html",
    "月洛残卷命数之蚀": "月洛残卷.html",
    "息脉定流符": "sc符.html",
    "提取码": "sc提取码.html",
    "彩色胶卷处理": "sc胶卷.html",
    "常青公园": "获得..1of8.html",
    "我的未来日记": "未来日记.html",
    "音视频转文字": "音视频转文字工具.html",
    "临渠县2007年": "sc2007.html", */
    "D门密码": "system-responseD.html",
    "d门密码": "system-responseD.html",
    "E门密码": "system-responseE.html",
    "e门密码": "system-responseE.html"
   /*  "你是谁": "system-responsewho.html",
    "周哲叙电脑": "system-responsezzx.html",
    "周哲叙的电脑": "system-responsezzx.html",
    "安全云盘": "云盘.html",
    "夜观六则": "夜观六则.html",
    "时光影像馆": "影像馆.html", */
    /* "红色电话亭": "电话亭.html", */
   /*  "2025月全食": "https://m.gmw.cn/2025-09/07/content_1304138493.htm",
    "2025血月": "https://m.gmw.cn/2025-09/07/content_1304138493.htm",
    "星象": "https://ts1.tc.mm.bing.net/th/id/R-C.5494b87682a29b76431b356b7115f5d4?rik=QrP%2bIHE8EQ5SAQ&riu=http%3a%2f%2fphotocdn.sohu.com%2f20150703%2fmp21181605_1435920467693_2.jpeg&ehk=d%2bBagKSXFHwxznUqgJF8LsjwOw0be9C0GW20Rr9MSiY%3d&risl=&pid=ImgRaw&r=0",
    "星辰守秘录": "守秘录.html", */
   /*  "临渠县2015年": "sc2015.html" */
    
};


const searchResultsData = [
    /* {
        title: "临渠县2015新闻搜索结果",
        description: "临渠县2015年新闻最新最全搜索结果",
        url: "sc2015.html",
        keywords: ["临渠县2015", "临渠2015", "临渠2015新闻", "临渠新闻2015", "2015临渠县新闻", "2015临渠新闻"]
    },
    {
        title: "临渠县2007新闻搜索结果",
        description: "临渠县2007年新闻最新最全搜索结果",
        url: "sc2007.html",
        keywords: ["临渠2007", "临渠县2007年", "临渠县2007", "临渠2007", "2007临渠", "临渠2007新闻", "临渠新闻2007", "2007临渠县新闻", "2007临渠新闻", "临渠2007盂兰盆节", "临渠2007火灾", "临渠盂兰盆节火灾", "临渠县2007火灾", "临渠火灾2007", "2007临渠县盂兰盆节火灾", "2007年盂兰盆节火灾", "2007年月全食"]
    },
    {
        title: "临渠县金桂搜索结果",
        description: "关于临渠县金桂的相关信息搜索结果",
        url: "临渠县.html",
        keywords: ["临渠县金桂", "金桂临渠县", "临渠县信息", "金桂信息", "临渠金桂", "临渠县金桂盛放"]
    },
    {
        title: "福叁咖啡搜索结果",
        description: "福叁咖啡提供优质的咖啡和舒适的环境。",
        url: "fu3coffee.html",
        keywords: ["福叁咖啡", "咖啡福叁", "福叁", "福叁咖啡店"]
    },
    {
        title: "奇闻异事馆搜索结果",
        description: "奇闻异事馆记录各地的奇闻异事和未解之谜。",
        url: "qwysg.html",
        keywords: ["奇闻异事馆", "异事馆奇闻", "qwysg", "奇闻异事", "奇闻异事馆论坛"]
    },
    {
        title: "音乐盒搜索结果",
        description: "音乐盒相关信息搜索结果",
        url: "音乐盒.html",
        keywords: ["音乐盒", "音乐播放器", "在线音乐"]
    }, */
    {
        title: "कालचक्रमण्डल搜索结果",
        description: "कालचक्रमण्डल相关信息搜索结果",
        url: "mandala.html",
        keywords: ["कालचक्रमण्डल", "mandala", "曼陀罗", "时间之轮"]
    },
    {
        title: "反舌鸟搜索结果",
        description: "反舌鸟相关信息搜索结果",
        description: "请通过其他搜索引擎进行检索",
        keywords: ["反舌鸟", "鸟类反舌", "知更鸟相关"]
    },
    {
        title: "杀死一只知更鸟搜索结果",
        description: "杀死一只知更鸟相关信息搜索结果",
        description: "请通过其他搜索引擎进行检索",
        keywords: ["杀死一只知更鸟", "知更鸟小说", "哈珀·李"]
    },
    {
        title: "伯劳鸟搜索结果",
        description: "伯劳鸟相关信息搜索结果",
        description: "请通过其他搜索引擎进行检索",
        keywords: ["伯劳鸟", "鸟类伯劳", "猛禽鸟类"]
    },
    /* {
        title: "秦砚秋博客搜索结果",
        description: "秦砚秋个人博客 - 第一次走进静乔公寓时，我没看懂那杯草药茶",
        url: "qinyanqiu-blog.html",
        keywords: ["秦砚秋博客", "秦砚秋", "博客秦砚秋", "秦个人博客", "秦砚秋记者"]
    }, */
    /* {
        title: "博客网搜索结果",
        description: "博客网发现生活美好，记录每一个值得珍藏的瞬间......",
        url: "blog.html",
        keywords: ["博客网", "博客平台", "个人博客网站"]
    },
    {
        title: "中心广场搜索结果",
        description: "中心广场相关信息搜索结果",
        url: "中心广场.html",
        keywords: ["中心广场", "广场中心", "城市广场"]
    }, */
    /* {
        title: "深南市桥安区搜索结果",
        description: "深南市桥安区相关信息搜索结果",
        url: "qiaoanqu.html",
        keywords: ["深南市桥安区", "深南桥安区", "深南市桥安", "行政区划"]
    },
    {
        title: "好邻居百货超市搜索结果",
        description: "好邻居百货超市提供各类生活用品和食品。",
        url: "supermarket.html",
        keywords: ["好邻居百货超市", "好邻居24h百货超市", "好邻居超市", "好邻居24小时超市", "好邻居百货"]
    },
    {
        title: "公寓论坛搜索结果",
        description: "社区论坛是用户交流和分享的平台。",
        url: "forum.html",
        keywords: ["论坛", "社区论坛", "交流平台", "静乔公寓论坛", "静乔公寓"]
    },
    {
        title: "乔静搜索结果",
        description: "乔静相关信息搜索结果",
        url: "qiaojing.html",
        keywords: ["乔静", "人物乔静", "个人资料"]
    },
    {
        title: "月氏辅星搜索结果",
        description: "月氏辅星相关信息搜索结果",
        url: "星象.html",
        keywords: ["月氏辅星","月氏辅星家族", "星象月氏", "天文星象"]
    },
    {
        title: "顾青娥搜索结果",
        description: "顾青娥相关信息搜索结果",
        url: "咕咕e录音.html",
        keywords: ["顾青娥", "咕咕e录音", "录音顾青娥"]
    },
    {
        title: "林墨和Q搜索结果",
        description: "林墨和Q相关信息搜索结果",
        url: "乔林视频.html",
        keywords: ["林墨和Q", "乔林视频", "Q和林墨", "Q人物"]
    },
    {
        title: "月洛残卷命数之蚀搜索结果",
        description: "暂无搜索结果......",
        url: "月洛残卷.html",
        keywords: ["月洛残卷命数之蚀", "月洛残卷命术之蚀", "命数之蚀月洛残卷", "月洛残卷", "命数之蚀"]
    },
    {
        title: "息脉定流符搜索结果",
        description: "息脉定流符相关信息搜索结果",
        url: "sc符.html",
        keywords: ["息脉定流符", "定流符息脉", "符咒息脉"]
    },
    {
        title: "提取码搜索结果",
        description: "提取码相关信息搜索结果",
        url: "sc提取码.html",
        keywords: ["提取码", "密码提取", "代码提取"]
    }, */
   /*  {
        title: "彩色胶卷处理搜索结果",
        description: "彩色胶卷处理相关信息搜索结果",
        url: "sc胶卷.html",
        keywords: ["彩色胶卷处理", "胶卷处理彩色", "胶卷冲印"]
    },
    {
        title: "常青公园搜索结果",
        description: "常青公园相关信息搜索结果",
        url: "获得..1of8.html",
        keywords: ["常青公园", "公园常青", "城市公园"]
    }, */
    /* {
        title: "我的未来日记搜索结果",
        description: "我的未来日记相关信息搜索结果",
        url: "未来日记.html",
        keywords: ["我的未来日记", "未来日记", "日记未来"]
    }, */
    /* {
        title: "音视频转文字工具搜索结果",
        description: "这是一个超强的音视频转文字工具~",
        url: "音视频转文字工具.html",
        keywords: ["音视频转文字工具", "音视频转文字", "转文字工具", "语音转文字", "视频转文字", "视频"]
    }, */
    {
        title: "D门密码搜索结果",
        description: "D门密码相关信息搜索结果",
        url: "system-responseD.html",
        keywords: ["D门密码", "d门密码", "密码D门", "系统响应D"]
    },
    {
        title: "E门密码搜索结果",
        description: "E门密码相关信息搜索结果",
        url: "system-responseE.html",
        keywords: ["E门密码", "e门密码", "密码E门", "系统响应E"]
    },
   /*  {
        title: "系统响应：你是谁搜索结果",
        description: "关于系统身份查询的响应结果",
        url: "system-responsewho.html",
        keywords: ["你是谁", "系统身份", "身份查询"]
    },
    {
        title: "周哲叙电脑搜索结果",
        description: "周哲叙电脑相关信息搜索结果",
        url: "system-responsezzx.html",
        keywords: ["周哲叙电脑", "周哲叙的电脑", "阿哲的电脑", "zzx电脑", "系统响应zzx"]
    },
    {
        title: "安全云盘搜索结果",
        description: "安全云盘相关信息搜索结果",
        url: "云盘.html",
        keywords: ["安全云盘", "云盘安全", "在线存储", "文件存储"]
    },
    {
        title: "夜观六则搜索结果",
        description: "夜观六则相关信息搜索结果",
        url: "夜观六则.html",
        keywords: ["夜观六则", "六则夜观", "夜间观察"]
    },
    {
        title: "时光影像馆搜索结果",
        description: "时光影像馆相关信息搜索结果",
        url: "影像馆.html",
        keywords: ["时光影像馆", "影像馆时光", "摄影影像馆"]
    }, */
    /* {
        title: "红色电话亭搜索结果",
        description: "红色电话亭相关信息搜索结果",
        url: "电话亭.html",
        keywords: ["红色电话亭", "电话亭红色", "公共电话亭"]
    }, */
    /* {
        title: "2025年月全食搜索结果",
        description: "2025年月全食相关信息搜索结果",
        url: "https://m.gmw.cn/2025-09/07/content_1304138493.htm",
        keywords: ["2025月全食", "2025血月", "月全食2025", "血月2025", "天文现象2025"]
    },
    {
        title: "星象搜索结果",
        description: "星象相关信息搜索结果",
        url: "https://ts1.tc.mm.bing.net/th/id/R-C.5494b87682a29b76431b356b7115f5d4?rik=QrP%2bIHE8EQ5SAQ&riu=http%3a%2f%2fphotocdn.sohu.com%2f20150703%2fmp21181605_1435920467693_2.jpeg&ehk=d%2bBagKSXFHwxznUqgJF8LsjwOw0be9C0GW20Rr9MSiY%3d&risl=&pid=ImgRaw&r=0",
        keywords: ["星象", "天文星象", "星辰星座", "星空图像"]
    },
    {
        title: "星辰守秘录搜索结果",
        description: "星辰守秘录相关信息搜索结果",
        url: "守秘录.html",
        keywords: ["星辰守秘录", "守秘录星辰", "秘密记录"]
    },
    {
        title: "临渠晚报搜索结果",
        description: "紧急寻人：12岁女孩昨日傍晚在临渠县城走失...",
        url: "xunpeople.html",
        keywords: ["临渠晚报", "临渠县2015年紧急寻人新闻"]
    }, */
    /* {
        title: "寻人启事搜索结果",
        description: "寻找失踪女儿赵晓棠......",
        url: "寻人启事.html",
        keywords: ["寻人启事", "赵晓棠"]
    },
    {
        title: "在线远程操控（林墨）搜索结果",
        description: "这是一个在线网页，可远程操作服务器~",
        url: "computer-lin.html",
        keywords: ["林墨的电脑", "林墨电脑操控"]
    }, */
    /* {
        title: "陈浩个人博客搜索结果",
        description: "窗台上的玉兰花瓣：等待'花期'的温柔盼头",
        url: "ch-blog.html",
        keywords: ["浩子博客", "陈浩博客"]
    }, */
    /* {
        title: "人才招聘网搜索结果",
        description: "搜索理想人才",
        url: "招聘网.html",
        keywords: ["招聘网", "兼职", "人才网"]
    },
    {
        title: "英仙座流星雨搜索结果",
        description: "英仙座流星雨是年度中最受欢迎的流星雨，出现于每年的7月17日至8月24日之间，在8月12日或13日流星数量会达到极大期。",
        url: "http://interesting-sky.china-vo.org/2025sky-aug/#2025-8-13-%E8%8B%B1%E4%BB%99%E5%BA%A7%E6%B5%81%E6%98%9F%E9%9B%A8%E6%9E%81%E5%A4%A7%E6%9C%9F%EF%BC%88ZHR%EF%BD%9E100%EF%BC%89",
        keywords: ["英仙座流星雨", "英仙流星雨", "22年8月英仙座流星雨"]
    },
    {
        title: "2015年新闻搜索结果",
        description: "本世紀最短的月全食2015年4月4日...",
        url: "https://www.cas.cn/cm/201504/t20150407_4332500.shtml",
        keywords: ["2015年新闻", "2015年", "2015"]
    },
    {
        title: "陈浩咖啡店后台密码提示搜索结果",
        description: "暂无搜索结果...",
        url: "sc密码提示.html",
        keywords: ["陈浩密码提示", "咖啡后台密码提示", "咖啡店密码提示", "密码提示", "电脑密码解密", "阿哲电脑密码解密", "林电脑密码解密"]
    }, */
    /* {
        title: "解密提示搜索结果",
        description: "暂无搜索结果...",
        url: "sc密码提示.html",
        keywords: [ "解密提示","解谜提示", "电脑密码解密", "林电脑密码解密"]
    }, */
    /* {
        title: "超市密码提示搜索结果",
        description: "暂无搜索结果...",
        url: "sc密码提示 - supermarket.html",
        keywords: ["超市密码提示","琴姐密码提示", "超市后台密码提示", "超市密码"]
    }, */
    {
        title: "实验室密码提示搜索结果",
        description: "暂无搜索结果...",
        url: "sc密码提示 - 实验室.html",
        keywords: ["实验室密码提示", "QA实验室密码提示", "QA实验室密码", "实验室密码"]
    }
    /* {
        title: "山村老尸搜索结果",
        description: "一部恐怖电影，于1999年11月4日上映。影片讲述拥有阴阳眼的小明遭遇的一系列灵异事件...",
        url: "https://baike.baidu.com/item/%E5%B1%B1%E6%9D%91%E8%80%81%E5%B0%B8/10152770",
        keywords: ["山村老尸", "山村老尸电影", "山村老尸恐怖电影"]
    },
    {
        title: "守护神咒搜索结果",
        description: "守护神咒（Expecto Patronum）是J.K.罗琳所著《哈利·波特》系列中的防御咒语，别称'呼神护卫'，源于拉丁语'我期待守护者'之意...",
        url: "https://baike.baidu.com/item/%E5%AE%88%E6%8A%A4%E7%A5%9E%E5%92%92/7555670",
        keywords: ["Expecto Patronum", "expecto patronum", "ExpectoPatronum"]
    },
    {
        title: "哭泣的天使搜索结果",
        description: "一款由CIA Embedded Devices Branch(嵌入式设备组)和英国MI5共同开发的针对智能电视的窃听软件...",
        url: "https://www.leiphone.com/category/gbsecurity/CZLq8saMaHDvQe69.html",
        keywords: ["Weeping Angel(哭泣的天使)", "哭泣天使", "weepingangel", "智能家电", "智能家居"]
    }, */
    /* {
        title: "宇宙魔方--河图与洛书搜索结果",
        description: "被誉为'宇宙魔方'的河图洛书是中国古代流传下来的两幅神秘图像...",
        url: "#",
        keywords: ["宇宙魔方", "洛书", "河图", "河图洛书"]
    } */
];

// Page switching logic
function showPage(id) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const page = document.getElementById(id);
    if (page) {
        page.classList.add('active');
    }
}

// Modal control
const modal = document.getElementById("modal");
const titleEl = document.getElementById("modal-title");
const contentEl = document.getElementById("modal-content");
const metaEl = document.getElementById("modal-meta");

function showModal(post) {
    titleEl.textContent = post.title || "无标题";
    contentEl.textContent = post.content || "无内容";
    metaEl.textContent = `状态：${post.status || '未知'} • 日期：${post.date || '未知'}`;
    modal.style.display = "block";
}
function closeModal() {
    modal.style.display = "none";
}
window.onclick = function (e) {
    if (e.target === modal) {
        closeModal();
    }
}

// System Notification Modal
const systemModal = document.getElementById("system-modal");

function showSystemModal() {
    systemModal.style.display = "block";

    // Auto close after 2 seconds
    setTimeout(function () {
        systemModal.style.display = "none";
    }, 300);
}

// Modified: Always show the system notification on page load (not just first visit)
function checkFirstVisit() {
    // Show the system notification on every visit
    setTimeout(() => {
        showSystemModal();
    }, 500); // Slight delay to ensure page is loaded
}

// Dummy data for search — can be extended
const sections = [
    /* 搜索页直接弹窗 */
    /* {
       title: "首页",
       posts: [
         {
           title: "欢迎来到模拟搜索引擎",
           content: "这是首页的示例内容。",
           status: "发布",
           date: "2025-10-15"
         }
       ]
     },
     {
       title: "临渠县",
       posts: [
         {
           title: "临渠县介绍",
           content: "临渠县是一个风景优美的地方，有着丰富的历史文化。",
           status: "发布",
           date: "2025-10-16"
         }
       ]
     } */
];

/* // 清除所有书签
function clearAllBookmarks() {
  document.querySelectorAll('.bookmark').forEach(bookmark => {
    if (bookmark.id !== 'forum-bookmark') {
      bookmark.classList.add('hidden');
    }
  });
  displayedBookmarks.clear();
} */

// 显示搜索结果
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.onclick = function () {
            // 直接跳转到对应的URL - 修改为内部跳转
            if (result.url.startsWith('http')) {
                window.location.href = result.url; // 改为内部跳转
            } else {
                // 对于本地文件，使用内部跳转
                window.location.href = result.url;
            }
        };

        resultItem.innerHTML = `
            <div class="search-result-title">${result.title}</div>
            <div>${result.description}</div>
            <div class="search-result-url">${result.url}</div>
          `;

        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = 'block';
}

// 显示短信风格的弹窗
function showSmsModal(title, message, url) {
    document.getElementById("sms-title").textContent = title;
    document.getElementById("sms-message").textContent = message;
    document.getElementById("sms-action-btn").onclick = function () {
        window.location.href = url; // 改为内部跳转
        document.getElementById("sms-modal").style.display = "none";
    };
    document.getElementById("sms-modal").style.display = "flex"; // 使用 flex 居中
}

// 搜索逻辑 - 修正版本：移除加密相关函数调用
function performSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input");
    const query = (searchInput.value || '').trim();

    if (!query) {
        alert("请输入搜索关键词");
        return;
    }

    // === 特殊关键词拦截：kms赵晓棠 ===
    if (query.toLowerCase() === "kms捕捉赵晓棠".toLowerCase()) {
        showSmsModal(
            "来自手机短信通知：",
            "你有新的快递 请尽快来取",
            "#"
        );
        return; // 阻止后续搜索逻辑执行
    }

    if (query.toLowerCase() === "超市后巷".toLowerCase()) {
    showSmsModal(
        "来自手机短信通知：",
        "你有新的快递 请尽快来取", 
        "#"
    );
    return; // 阻止后续搜索逻辑执行
}
    // ===================================

    // 检查是否有直接跳转的关键词（现在使用明文关键词）
    let redirectFound = false;
    for (const keyword in keywordRedirects) {
        if (query.toLowerCase().includes(keyword.toLowerCase())) {
            const redirectUrl = keywordRedirects[keyword];
            /* if (confirm(`找到关键词 "${keyword}"，是否跳转到对应页面？`)) {
                window.location.href = redirectUrl; // 改为内部跳转
                redirectFound = true;
                break;
            } */
        }
    }
    
    if (redirectFound) {
        return;
    }

    // 根据搜索关键词显示相关书签（新增而不是覆盖）
    let foundResults = false;

    // 检查并显示相关书签
    const bookmarks = [
        { id: "coffee-bookmark", keywords: ["福叁咖啡"], displayText: "福叁咖啡" },
        { id: "wonder-bookmark", keywords: ["奇闻异事馆"], displayText: "奇闻异事馆" },
        { id: "blog-bookmark", keywords: ["博客网", "秦砚秋"], displayText: "博客网" },
        { id: "neighbor-bookmark", keywords: ["好邻居24h百货超市", "好邻居百货超市"], displayText: "好邻居百货超市" }
    ];

    bookmarks.forEach(bookmark => {
        if (bookmark.keywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()))) {
            const bookmarkEl = document.getElementById(bookmark.id);
            if (bookmarkEl) {
                bookmarkEl.classList.remove("hidden");
                displayedBookmarks.add(bookmark.id);
                foundResults = true;
            }
        }
    });

    // 确保论坛书签始终显示
    const forumBookmark = document.getElementById("forum-bookmark");
    if (forumBookmark) {
        forumBookmark.classList.remove("hidden");
    }

    // 搜索匹配的结果（使用明文关键词进行匹配）
    const matchedResults = searchResultsData.filter(result => {
        return result.keywords.some(keyword => {
            return query.toLowerCase().includes(keyword.toLowerCase());
        }) || query.toLowerCase().includes(result.title.toLowerCase());
    });

    // 显示搜索结果
    displaySearchResults(matchedResults);

    // ================ 新增：如果搜索到内容，显示发现页面的提示 ================
if (matchedResults.length > 0) {
    // 延迟一点显示提示，让搜索结果先显示
    setTimeout(() => {
        showDiscoveryNotification(matchedResults.length, query);
    }, 300);
    
    // 如果有多个结果，可以添加一些视觉反馈
    if (matchedResults.length >= 3) {
        highlightMultipleResults(matchedResults.length);
    }
}
// =========================================================================

    // Flatten all posts
    let pool = [];
    sections.forEach(s => {
        pool = pool.concat(s.posts.map(p => ({ ...p, _section: s.title })));
    });

   /*  const results = pool.filter(p =>
        (p.title + ' ' + p.content).toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0 && !foundResults && matchedResults.length === 0) {
        
        alert("未找到匹配的内容。请尝试其他关键词。");
    } else if (results.length > 0) {
        // Show first result in modal for demo purposes
        showModal(results[0]);
    } */
   const results = pool.filter(p =>
    (p.title + ' ' + p.content).toLowerCase().includes(query.toLowerCase())
);

if (results.length === 0 && !foundResults && matchedResults.length === 0) {
    // 使用内置弹窗而不是alert
    if (window.SearchNotification && typeof window.SearchNotification.show === 'function') {
        window.SearchNotification.show('未找到匹配的内容。请尝试其他关键词。', '搜索提示');
    } else {
        // 备用方案：保持原有的alert
        alert("未找到匹配的内容。请尝试其他关键词。");
    }
} else if (results.length > 0) {
    // Show first result in modal for demo purposes
    showModal(results[0]);
}
}

// 显示发现页面的庆祝提示
function showDiscoveryNotification(resultCount, query) {
    // 创建提示消息
    let title, message;
    
    if (resultCount === 1) {
        title = "找到1个页面";
        message = `你找到了关于"${query}"的页面！`;
    } else {
        title = `找到${resultCount}个页面`;
        message = `你找到了${resultCount}个关于"${query}"的页面！`;
    }
    
    // 如果有SearchNotification组件，使用它
    if (window.SearchNotification && typeof window.SearchNotification.show === 'function') {
        window.SearchNotification.show(message, title);
    } else {
        // 备用方案：显示简单的弹窗
        showSimpleDiscoveryAlert(title, message, resultCount);
    }
    
    // 添加轻微的视觉反馈
    addDiscoveryEffects(resultCount);
}

// 简单的发现提示（备用方案）
/* function showSimpleDiscoveryAlert(title, message, count) {
    // 创建临时弹窗
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    alertDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
            <span>${title}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${count}个结果
            </span>
        </div>
        <div style="font-size: 14px;">${message}</div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 3秒后自动消失
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 300);
    }, 3000);
} */
// 简单的发现提示（备用方案）
function showSimpleDiscoveryAlert(title, message, count) {
    // 创建临时弹窗
    const alertDiv = document.createElement('div');
    alertDiv.className = 'discovery-notification'; // 添加类名
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    alertDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">
            <span>${title}</span>
            <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; font-size: 12px;">
                ${count}个结果
            </span>
        </div>
        <div style="font-size: 14px;">${message}</div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 3秒后自动消失
    setTimeout(() => {
        alertDiv.classList.add('fade-out'); // 使用CSS类动画
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 300);
    }, 3000);
}

// 添加发现效果的视觉反馈
function addDiscoveryEffects(resultCount) {
    // 轻微的背景闪烁
    document.body.style.transition = 'background-color 0.5s';
    
    // 根据结果数量决定颜色强度
    let colorIntensity = Math.min(0.1 + (resultCount * 0.03), 0.3);
    document.body.style.backgroundColor = `rgba(102, 126, 234, ${colorIntensity})`;
    
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 800);
    
    // 搜索结果项的动画
    setTimeout(() => {
        const results = document.querySelectorAll('.search-result-item');
        results.forEach((result, index) => {
            result.style.transition = 'transform 0.3s, box-shadow 0.3s';
            setTimeout(() => {
                result.style.transform = 'translateY(-5px)';
                result.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                
                setTimeout(() => {
                    result.style.transform = '';
                    result.style.boxShadow = '';
                }, 300);
            }, index * 100); // 交错动画
        });
    }, 500);
}

// 高亮多个结果
function highlightMultipleResults(count) {
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
        resultsContainer.style.transition = 'border 0.5s';
        resultsContainer.style.borderLeft = `4px solid #${count >= 5 ? '4CAF50' : 'FF9800'}`;
        
        setTimeout(() => {
            resultsContainer.style.borderLeft = '';
        }, 2000);
    }
}

// 添加CSS动画
/* const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* 搜索结果项的悬停效果增强 *
    .search-result-item {
        transition: all 0.2s ease !important;
    }
    
    .search-result-item:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }
;
document.head.appendChild(style); */
// 添加CSS动画 - 修改变量名避免冲突
if (!document.getElementById('discovery-animation-styles')) {
    const discoveryStyle = document.createElement('style');
    discoveryStyle.id = 'discovery-animation-styles';
    discoveryStyle.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        /* 搜索结果项的悬停效果增强 */
        .search-result-item {
            transition: all 0.2s ease !important;
        }
        
        .search-result-item:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }
        
        /* 发现提示动画 */
        .discovery-notification {
            animation: slideInRight 0.3s ease-out;
        }
        
        .discovery-notification.fade-out {
            animation: slideOutRight 0.3s ease-out forwards;
        }
    `;
    document.head.appendChild(discoveryStyle);
}

// 添加可移动圆形返回按钮的函数
function addMovableBackButton() {
    // 检查是否已经在搜索页
    if (window.location.pathname.includes('search.html') || 
        window.location.pathname.includes('/search/') ||
        document.getElementById('search-input')) {
        return; // 如果是搜索页，不添加返回按钮
    }
    
    // 创建返回按钮
    const backButton = document.createElement('div');
    backButton.id = 'movable-back-button';
    backButton.innerHTML = '🔙';
    backButton.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 50px;
        height: 50px;
        background-color: #4a86e8;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        user-select: none;
        touch-action: none;
    `;
    
    // 添加拖拽功能
    let isDragging = false;
    let offsetX, offsetY;
    
    backButton.addEventListener('mousedown', startDrag);
    backButton.addEventListener('touchstart', startDragTouch);
    
    function startDrag(e) {
        isDragging = true;
        offsetX = e.clientX - backButton.getBoundingClientRect().left;
        offsetY = e.clientY - backButton.getBoundingClientRect().top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
    }
    
    function startDragTouch(e) {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - backButton.getBoundingClientRect().left;
        offsetY = touch.clientY - backButton.getBoundingClientRect().top;
        document.addEventListener('touchmove', onDragTouch);
        document.addEventListener('touchend', stopDrag);
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        backButton.style.left = (e.clientX - offsetX) + 'px';
        backButton.style.top = (e.clientY - offsetY) + 'px';
        backButton.style.right = 'auto';
        backButton.style.bottom = 'auto';
    }
    
    function onDragTouch(e) {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        backButton.style.left = (touch.clientX - offsetX) + 'px';
        backButton.style.top = (touch.clientY - offsetY) + 'px';
        backButton.style.right = 'auto';
        backButton.style.bottom = 'auto';
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', onDragTouch);
        document.removeEventListener('touchend', stopDrag);
    }
    
    // 点击返回搜索页
    backButton.addEventListener('click', function() {
        window.location.href = 'search.html';
    });
    
    document.body.appendChild(backButton);
}

// 初始化页面
window.onload = function () {
    checkFirstVisit();
    
    // 添加可移动返回按钮（如果不是搜索页）
    setTimeout(() => {
        addMovableBackButton();
    }, 1000);

    // 确保论坛书签初始可见
    const forumBookmark = document.getElementById("forum-bookmark");
    if (forumBookmark) {
        forumBookmark.classList.remove("hidden");
    }
};