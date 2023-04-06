//Dijkstra单源最短路径
var PathToEnd = new Array(13);

function dijkstra(path,index){
    var m = path && path.length;
    var n = m && path[0].length;
    if(m && n && m===n && index < n){
        //初始化distance
        var dis = [];
        var visited = [];//用于标识index号至其他顶点的距离是否确定
        for(var i = 0; i < n; ++i){
            dis.push(path[index][i]);
            visited.push(false)
            PathToEnd[i] = -1;
        }
        visited[index] = true;


        for(i = 0;i < n;i++){
            var minIndex, min = Infinity;
            //找出剩余的不确定的点到index最短的距离对应的索引
            for(var j = 0; j < n; ++j){
                if(!visited[j] && dis[j] < min){
                    minIndex = j;
                    min = dis[j];
                }
            }
            visited[minIndex] = true;//标识index到此顶点的距离已经确认
            for(var k = 0; k < n; ++k){
                //判断minIndex到k之间有无道路
                if(!visited[k] && path[minIndex][k] < Infinity){
                    //更新distance
                    if(dis[k] > dis[minIndex] + path[minIndex][k]){
                        dis[k] = dis[minIndex] + path[minIndex][k];
                        PathToEnd[k] = minIndex;
                    }
                }
            }
        }
        return dis;
    }
}

//结点信息
var pointName = [
    "行政楼",
    "食堂",
    "明德楼",
    "求是楼",
    "博学楼",
    "工程实习中心",
    "致远楼",
    "体育馆",
    "雨母教学楼",
    "二号教学楼"
];
//结点经纬度
var pointCord = [
    [112.52525,26.887483],
    [112.525727,26.887487],
    [112.52525,26.886923],
    [112.521927,26.883895],
    [112.524909,26.886154],
    [112.524226,26.887346],
    [112.525255,26.885904],
    [112.527043,26.888696],
    [112.523876,26.884567],
    [112.522057,26.884499],
]
//邻接矩阵
var INF = 99999;
var path = [
    [0  ,50,80,INF,INF,50,INF,110,INF,INF],
    [50,0  ,100,INF,INF,INF,INF,100,INF,INF],
    [80,100,0  ,INF,200,INF,INF,INF,INF,INF],
    [INF,INF,INF,0  ,INF,INF,INF,INF,200,100],
    [INF,INF,200,INF,0  ,INF,100,INF,INF,INF],
    [50,INF,INF,INF,INF,0  ,345,INF,INF,INF],
    [INF,INF,INF,INF,100,345,0  ,INF,1000,INF],
    [110,100,INF,INF,INF,INF,INF,0  ,INF,INF],
    [INF,INF,INF,200,INF,INF,1000,INF,0  ,200],
    [INF,INF,INF,100,INF,INF,INF,INF,200,0  ],

];

//给select添加选项text
function addSelect(id, text) {
    var select_node = document.getElementById(id);
    var option = document.createElement("option");
    option.text= text;
    try{
        // 对于更早的版本IE8
        select_node.add(option,select_node.options[null]);
    }catch (e){
        select_node.add(option,null);
    }
}

for(var i = 0; i < pointName.length; ++i) {
    addSelect("startnode", pointName[i]);
    addSelect("endnode", pointName[i]);
}

//百度地图-MapV-API
var map = new BMap.Map("container",{
    enableMapClick: false
});
var point = new BMap.Point(112.523876,26.884567);
map.centerAndZoom(point, 18);
map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放

//Marker标记
var marker = new Array();
for(var i = 0; i < pointName.length; ++i) {
    var point = new BMap.Point(pointCord[i][0],pointCord[i][1]);//默认  可以通过Icon类来指定自定义图标
    marker[i] = new BMap.Marker(point);
    var label = new BMap.Label(pointName[i],{offset:new BMap.Size(20,-10)});//标注标签
    marker[i].setLabel(label)//设置标注说明
    map.addOverlay(marker[i]);
}
var mapvLayer;
function DisplayPath(StartIndex,EndIndex) {
    var data = [];
    var StartPoint = pointCord[StartIndex];
    var EndPoint = pointCord[EndIndex];
    console.log("StartPoint: " + StartPoint);
    console.log("EndPoint: " + EndPoint);

    //获取最短路径
    var p = EndIndex;
    console.log(p);
    while(PathToEnd[p] != -1){
        StartPoint = pointCord[PathToEnd[p]];
        EndPoint = pointCord[p];
        data.push({
            geometry: {
                type: 'LineString',
                coordinates: [
                    StartPoint,
                    EndPoint
                ],
            },
            count: 30
        });
        console.log(PathToEnd[p]);
        p = PathToEnd[p];
    }
    console.log(StartIndex);
    StartPoint = pointCord[StartIndex];
    EndPoint = pointCord[p];
    data.push({
        geometry: {
            type: 'LineString',
            coordinates: [
                StartPoint,
                EndPoint
            ],
        },
        count: 30
    });

    var dataSet = new mapv.DataSet(data);
    var options = {
        strokeStyle: 'rgba(53,57,255,0.5)',
        globalCompositeOperation: 'lighter',
        shadowColor: 'rgba(53,57,255,0.2)',
        shadowBlur: 3,
        lineWidth: 3.0,
        draw: 'simple',
        fillStyle: 'rgba(255, 50, 50, 0.6)'
    }
    if(mapvLayer == null){
        mapvLayer = new mapv.baiduMapLayer(map, dataSet, options);
    } else {
        //先清除上一个图层
        mapvLayer.hide();
        mapvLayer = new mapv.baiduMapLayer(map, dataSet, options);
    }

}

var button = document.getElementById("button");
button.addEventListener("click", function () {
    if (button.click == false) {
        return;
    }

    var StartIndex = startnode.selectedIndex; //起点的索引值
    var StartValue = startnode.options[StartIndex].value; //起点的信息
    var EndIndex = endnode.selectedIndex; //终点的索引值
    var EndValue = endnode.options[EndIndex].value; //终点的信息
    console.log("起点：" + StartIndex + "  " + StartValue);
    console.log("终点：" + EndIndex + "  " + EndValue);

    if(StartIndex == EndIndex) {
        alert("起点和终点不能为同一点！");
        return;
    }

    PathArray = dijkstra(path,StartIndex);
    console.log(PathArray);
    //alert("该点到其余各点的最短距离为：" + PathArray);
    //将最短路径在地图上展示出来
    DisplayPath(StartIndex,EndIndex);
    console.log(PathToEnd);
    //将最短路径的距离在页面上展示出来
    document.getElementById("showdis").style.bottom="37%";
    document.getElementById("showdis").innerHTML = "当前路径的距离为："+PathArray[EndIndex].toString()+"米";
});

var button2 = document.getElementById("warninginfo");
button2.addEventListener("click", function () {
    if (button2.click == false) {
        return;
    }
    document.getElementById("showdis").style.bottom="45%";
    document.getElementById("showdis").innerHTML = "如不能正常使用：<br/>🕸检查网络<br/>💻更换浏览器";
});
